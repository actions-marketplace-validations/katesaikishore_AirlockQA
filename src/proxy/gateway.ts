import * as http from 'node:http';
import * as https from 'node:https';
import * as net from 'node:net';
import * as zlib from 'node:zlib';
import type { BrowserContext, Request as PlaywrightRequest, Route } from 'playwright-core';
import type { QAFindConfig, HttpMethod, InterceptedRequest, InterceptedResponse } from '../types/index.js';
import { PhantomEngine } from './phantom-engine.js';
import { PolicyEngine } from './policy-engine.js';
import { defaultPortForUrl, matchAnyHost, splitHostPort } from './host-match.js';
import { deterministicId } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export type RequestInterceptorCallback = (req: InterceptedRequest) => void;
export type ResponseInterceptorCallback = (resp: InterceptedResponse) => void;

export interface GatewayOptions {
  /**
   * Hosts ("host:port" or host patterns, same syntax as policy host patterns) that the
   * standalone proxy may open CONNECT tunnels to. Tunnelled traffic is end-to-end TLS:
   * it is NOT inspected, phantom tokens are NOT swapped and responses are NOT sanitized.
   * Empty (the default) denies every CONNECT with 403.
   */
  connectAllowHosts?: string[];
  /** Maximum request body, and maximum inspected text response body, in bytes (default 10 MiB). */
  maxBodyBytes?: number;
}

export const DEFAULT_MAX_BODY_BYTES = 10 * 1024 * 1024;

export const CONNECT_DENIED_REASON =
  'HTTPS tunnelling cannot be inspected: the QAFind proxy cannot swap phantom tokens, detect real ' +
  'secrets or sanitize responses inside a CONNECT/TLS tunnel, so CONNECT is denied by default.';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

/**
 * Content types whose bodies are treated as text: phantom/real substitution happens only
 * for these. Everything else is forwarded byte-for-byte.
 */
export function isTextContentType(contentType: string | undefined): boolean {
  if (!contentType) return false;
  const ct = contentType.split(';')[0].trim().toLowerCase();
  if (ct.startsWith('text/')) return true;
  if (ct.endsWith('+json') || ct.endsWith('+xml')) return true;
  return [
    'application/json',
    'application/x-www-form-urlencoded',
    'application/xml',
    'application/javascript',
    'application/x-javascript',
    'application/ecmascript',
    'application/graphql',
    'application/x-ndjson',
  ].includes(ct);
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value.join(', ') : value;
}

/** Flatten Node incoming headers into a lowercase string record (multi-values joined). */
function flattenHeaders(headers: http.IncomingHttpHeaders): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const v = headerValue(value);
    if (v !== undefined) out[key.toLowerCase()] = v;
  }
  return out;
}

function stripHopByHop(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  const connectionTokens = (headers['connection'] || '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  for (const [k, v] of Object.entries(headers)) {
    const key = k.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(key) || connectionTokens.includes(key)) continue;
    out[key] = v;
  }
  return out;
}

function withoutHeaders(headers: Record<string, string>, names: string[]): Record<string, string> {
  const drop = new Set(names);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (!drop.has(k.toLowerCase())) out[k] = v;
  }
  return out;
}

function decodeContent(body: Buffer, encoding: string | undefined): Buffer {
  const enc = (encoding || '').trim().toLowerCase();
  if (!enc || enc === 'identity') return body;
  if (enc === 'gzip' || enc === 'x-gzip') return zlib.gunzipSync(body);
  if (enc === 'deflate') return zlib.inflateSync(body);
  if (enc === 'br') return zlib.brotliDecompressSync(body);
  throw new Error(`Unsupported content-encoding '${encoding}'`);
}

/** Text used for token/leak scanning: UTF-8 for text bodies, latin1 (byte-preserving) otherwise. */
function scanText(body: Buffer | undefined, isText: boolean): string | undefined {
  if (!body || body.length === 0) return undefined;
  return body.toString(isText ? 'utf8' : 'latin1');
}

function describeBinary(body: Buffer | undefined): string | undefined {
  if (!body || body.length === 0) return undefined;
  return `[binary body: ${body.length} bytes, not inspected for substitution]`;
}

export class QAFindGateway {
  private phantomEngine: PhantomEngine;
  private policyEngine: PolicyEngine;
  private config: QAFindConfig;
  private options: Required<GatewayOptions>;
  private httpServer: http.Server | null = null;
  private openSockets = new Set<net.Socket>();
  private activePort = 0;
  private onRequestCallbacks: RequestInterceptorCallback[] = [];
  private onResponseCallbacks: ResponseInterceptorCallback[] = [];
  private requestCounter = 0;

  constructor(config: QAFindConfig, options: GatewayOptions = {}) {
    this.config = config;
    this.options = {
      connectAllowHosts: options.connectAllowHosts ?? [],
      maxBodyBytes: options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES,
    };
    this.phantomEngine = new PhantomEngine(config.secrets);
    this.policyEngine = new PolicyEngine(config.policy);
  }

  getPhantomEngine(): PhantomEngine {
    return this.phantomEngine;
  }

  getPolicyEngine(): PolicyEngine {
    return this.policyEngine;
  }

  onRequest(cb: RequestInterceptorCallback): void {
    this.onRequestCallbacks.push(cb);
  }

  onResponse(cb: ResponseInterceptorCallback): void {
    this.onResponseCallbacks.push(cb);
  }

  private emitRequest(req: InterceptedRequest): void {
    this.onRequestCallbacks.forEach((cb) => cb(req));
  }

  private emitResponse(resp: InterceptedResponse): void {
    this.onResponseCallbacks.forEach((cb) => cb(resp));
  }

  /**
   * Sanitize a response body: substitute only for text content, and only rewrite the bytes
   * when a configured secret was actually found (so non-UTF-8 text is not re-encoded).
   */
  private sanitizeBody(
    body: Buffer,
    contentType: string | undefined,
    context: Record<string, unknown>
  ): { body: Buffer; loggedBody?: string; sanitizedCount: number } {
    if (isTextContentType(contentType)) {
      const text = body.toString('utf8');
      const result = this.phantomEngine.sanitizeResponse({}, text);
      if (result.sanitizedCount > 0) {
        const rewritten = result.body ?? '';
        return { body: Buffer.from(rewritten, 'utf8'), loggedBody: rewritten, sanitizedCount: result.sanitizedCount };
      }
      return { body, loggedBody: text, sanitizedCount: 0 };
    }
    // Binary bodies are never rewritten. Flag exact secret bytes so the limitation is visible.
    if (this.phantomEngine.detectRealSecretExposure({}, body.toString('latin1')).length > 0) {
      logger.warn('Binary upstream response contains a configured secret value; binary bodies are not rewritten', context);
    }
    return { body, loggedBody: describeBinary(body), sanitizedCount: 0 };
  }

  /**
   * Attach the request gateway to a Playwright BrowserContext.
   *
   * Requests are inspected, checked against policy and, when allowed, forwarded by the
   * trusted Node process (`context.request.fetch`) with phantom tokens swapped for real
   * values. The browser's own network stack never receives real secrets: if trusted
   * forwarding fails, the request is aborted rather than continued.
   */
  async attachToBrowserContext(context: BrowserContext): Promise<void> {
    await context.route('**/*', async (route: Route, request: PlaywrightRequest) => {
      const reqUrl = request.url();
      const parsedUrl = new URL(reqUrl);
      const host = parsedUrl.host;
      const defaultPort = defaultPortForUrl(reqUrl);
      const path = parsedUrl.pathname + parsedUrl.search;
      const method = request.method().toUpperCase() as HttpMethod;
      const headers = request.headers();
      const bodyBuffer = request.postDataBuffer() ?? undefined;
      const isTextBody = isTextContentType(headers['content-type']);
      const scanBody = scanText(bodyBuffer, isTextBody);

      const reqId = deterministicId('req', ++this.requestCounter);

      // 1. Inspect for phantom tokens
      const { phantomTokens, configs } = this.phantomEngine.inspectRequest(headers, scanBody);

      const interceptedReq: InterceptedRequest = {
        id: reqId,
        timestamp: new Date().toISOString(),
        url: reqUrl,
        method,
        headers: { ...headers },
        body: isTextBody ? scanBody : describeBinary(bodyBuffer),
        host,
        path,
        phantomTokensDetected: phantomTokens,
        realTokensSwapped: [],
        policyVerdict: 'BLOCKED',
      };

      // 2. Check for real secret leakage attempts
      const leakedPhantoms = this.phantomEngine.detectRealSecretExposure(headers, scanBody);
      if (leakedPhantoms.length > 0) {
        logger.securityViolation('Browser request contained a configured real secret value', { url: reqUrl, host });
        interceptedReq.policyReason = 'Request contained a configured real secret value';
        this.emitRequest(interceptedReq);
        await route.abort('blockedbyclient');
        return;
      }

      // 3. Evaluate request policy
      const verdict = await this.policyEngine.evaluate(
        { host, path, method, headers, body: scanBody, bodyBytes: bodyBuffer?.length ?? 0, url: reqUrl },
        configs
      );
      interceptedReq.policyVerdict = verdict.verdict;
      interceptedReq.policyReason = verdict.reason;

      if (!verdict.allowed) {
        logger.securityViolation(verdict.reason || 'Blocked by QAFind request policy', {
          url: reqUrl,
          method,
          host,
        });

        this.emitRequest(interceptedReq);

        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'QAFIND_EGRESS_FIREWALL_BLOCKED',
            message: verdict.reason,
            url: reqUrl,
            method,
            qafindReqId: reqId,
          }),
        });
        return;
      }

      // 4. Policy allowed: swap phantom tokens (headers always, body only when it is text)
      const swap = this.phantomEngine.swapPhantomToReal(
        headers,
        isTextBody ? scanBody : undefined,
        host,
        defaultPort
      );
      interceptedReq.realTokensSwapped = swap.swappedTokens;
      const outBody =
        isTextBody && swap.modifiedBody !== undefined ? Buffer.from(swap.modifiedBody, 'utf8') : bodyBuffer;

      // 5. Forward from the trusted process. maxRedirects: 0 hands redirects back to the
      //    browser so the next hop goes through policy again instead of carrying real
      //    credentials to a redirect target.
      let response;
      try {
        response = await context.request.fetch(request, {
          headers: withoutHeaders(swap.modifiedHeaders, ['content-length']),
          data: outBody,
          maxRedirects: 0,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.securityViolation(
          'Trusted forwarding failed; request aborted (real secrets are never sent through the browser network stack)',
          { url: reqUrl, method, host, error: message }
        );
        interceptedReq.policyVerdict = 'BLOCKED';
        interceptedReq.policyReason = `Upstream forwarding failed; request aborted: ${message}`;
        interceptedReq.forwardError = message;
        this.emitRequest(interceptedReq);
        await route.abort('failed').catch(() => undefined);
        return;
      }

      this.emitRequest(interceptedReq);

      try {
        const respHeaders = response.headers();
        // APIResponse.body() is already decompressed, so content-encoding and
        // content-length from upstream no longer describe the bytes we send back.
        const rawBody = await response.body();
        const headerResult = this.phantomEngine.sanitizeResponse(
          withoutHeaders(respHeaders, ['content-length', 'content-encoding', 'transfer-encoding'])
        );
        const bodyResult = this.sanitizeBody(rawBody, respHeaders['content-type'], { url: reqUrl });

        this.emitResponse({
          id: deterministicId('resp', reqId),
          requestId: reqId,
          status: response.status(),
          headers: headerResult.headers,
          body: bodyResult.loggedBody,
          timestamp: new Date().toISOString(),
          secretsSanitizedCount: headerResult.sanitizedCount + bodyResult.sanitizedCount,
        });

        await route.fulfill({
          status: response.status(),
          headers: headerResult.headers,
          body: bodyResult.body,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error(`QAFind gateway failed to deliver response for ${reqUrl}: ${message}`);
        await route.abort('failed').catch(() => undefined);
      } finally {
        await response.dispose().catch(() => undefined);
      }
    });
  }

  /**
   * Start the standalone HTTP forward proxy (for containers, curl, or a browser launched
   * with HTTP_PROXY). It accepts absolute-form `http://` request URIs, applies the same
   * leak detection, policy and substitution as the browser path, and denies CONNECT
   * unless the target is in `connectAllowHosts`.
   */
  async startHttpProxy(
    port = this.config.proxy?.port ?? 8899,
    listenHost = this.config.proxy?.host ?? '127.0.0.1'
  ): Promise<number> {
    if (this.httpServer) return this.activePort;

    return new Promise((resolve, reject) => {
      const server = http.createServer((clientReq, clientRes) => {
        this.handleProxyRequest(clientReq, clientRes).catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          logger.error(`QAFind proxy error: ${message}`);
          if (!clientRes.headersSent) {
            this.sendJson(clientRes, 502, { error: 'QAFIND_PROXY_ERROR', message });
          } else {
            clientRes.destroy();
          }
        });
      });
      server.on('connect', (req: http.IncomingMessage, socket: net.Socket, head: Buffer) =>
        this.handleConnect(req, socket, head)
      );
      server.on('connection', (socket: net.Socket) => {
        this.openSockets.add(socket);
        socket.on('close', () => this.openSockets.delete(socket));
      });
      this.httpServer = server;

      server.once('error', (err) => {
        this.httpServer = null;
        reject(err);
      });
      server.listen(port, listenHost, () => {
        const address = server.address();
        this.activePort = typeof address === 'object' && address ? address.port : port;
        logger.info(`QAFind request gateway proxy listening on ${listenHost}:${this.activePort}`);
        resolve(this.activePort);
      });
    });
  }

  private sendJson(res: http.ServerResponse, status: number, payload: unknown, extra: Record<string, string> = {}) {
    const body = JSON.stringify(payload);
    res.writeHead(status, {
      'content-type': 'application/json',
      'content-length': String(Buffer.byteLength(body)),
      ...extra,
    });
    res.end(body);
  }

  private async handleProxyRequest(clientReq: http.IncomingMessage, clientRes: http.ServerResponse): Promise<void> {
    const reqUrl = clientReq.url || '';
    const method = (clientReq.method?.toUpperCase() || 'GET') as HttpMethod;

    // The target always comes from the absolute request URI, never from the Host header.
    let target: URL;
    try {
      if (!/^https?:\/\//i.test(reqUrl)) throw new Error('not absolute-form');
      target = new URL(reqUrl);
    } catch {
      clientReq.resume();
      this.sendJson(clientRes, 400, {
        error: 'QAFIND_PROXY_BAD_REQUEST',
        message:
          'The QAFind proxy only accepts absolute-form http:// or https:// request URIs. Configure it as HTTP_PROXY.',
      });
      return;
    }

    const host = target.host;
    const defaultPort = defaultPortForUrl(target.href);
    const path = target.pathname + target.search;

    const hostHeader = headerValue(clientReq.headers.host);
    if (hostHeader) {
      const a = splitHostPort(hostHeader);
      const b = splitHostPort(host);
      if (a.hostname !== b.hostname || (a.port ?? defaultPort) !== (b.port ?? defaultPort)) {
        clientReq.resume();
        this.sendJson(clientRes, 400, {
          error: 'QAFIND_PROXY_HOST_MISMATCH',
          message: `Host header '${hostHeader}' does not match the request URI authority '${host}'`,
        });
        return;
      }
    }

    // Read the body with a hard cap.
    const max = this.options.maxBodyBytes;
    const declared = Number(headerValue(clientReq.headers['content-length']) || 0);
    if (declared > max) {
      clientReq.resume();
      this.sendJson(
        clientRes,
        413,
        { error: 'QAFIND_PAYLOAD_TOO_LARGE', message: `Request body exceeds ${max} bytes` },
        { connection: 'close' }
      );
      return;
    }
    const bodyBuffer = await new Promise<Buffer | null>((resolve, reject) => {
      const chunks: Buffer[] = [];
      let total = 0;
      let overflow = false;
      clientReq.on('data', (chunk: Buffer) => {
        if (overflow) return;
        total += chunk.length;
        if (total > max) {
          overflow = true;
          chunks.length = 0;
          resolve(null);
          return;
        }
        chunks.push(chunk);
      });
      clientReq.on('end', () => {
        if (!overflow) resolve(Buffer.concat(chunks));
      });
      clientReq.on('error', reject);
    });
    if (bodyBuffer === null) {
      this.sendJson(
        clientRes,
        413,
        { error: 'QAFIND_PAYLOAD_TOO_LARGE', message: `Request body exceeds ${max} bytes` },
        { connection: 'close' }
      );
      return;
    }

    const headers = stripHopByHop(flattenHeaders(clientReq.headers));
    const isTextBody = isTextContentType(headers['content-type']);
    const scanBody = scanText(bodyBuffer, isTextBody);
    const reqId = deterministicId('req', ++this.requestCounter);
    const { phantomTokens, configs } = this.phantomEngine.inspectRequest(headers, scanBody);

    const interceptedReq: InterceptedRequest = {
      id: reqId,
      timestamp: new Date().toISOString(),
      url: target.href,
      method,
      headers: { ...headers },
      body: isTextBody ? scanBody : describeBinary(bodyBuffer),
      host,
      path,
      phantomTokensDetected: phantomTokens,
      realTokensSwapped: [],
      policyVerdict: 'BLOCKED',
    };

    if (this.phantomEngine.detectRealSecretExposure(headers, scanBody).length > 0) {
      logger.securityViolation('Proxied request contained a configured real secret value', { url: target.href, host });
      interceptedReq.policyReason = 'Request contained a configured real secret value';
      this.emitRequest(interceptedReq);
      this.sendJson(clientRes, 403, { error: 'QAFIND_EGRESS_FIREWALL_BLOCKED', reason: interceptedReq.policyReason });
      return;
    }

    const verdict = await this.policyEngine.evaluate(
      { host, path, method, headers, body: scanBody, bodyBytes: bodyBuffer.length, url: target.href },
      configs
    );
    interceptedReq.policyVerdict = verdict.verdict;
    interceptedReq.policyReason = verdict.reason;

    if (!verdict.allowed) {
      logger.securityViolation(verdict.reason || 'Blocked by QAFind request policy', { url: target.href, method, host });
      this.emitRequest(interceptedReq);
      this.sendJson(clientRes, 403, { error: 'QAFIND_EGRESS_FIREWALL_BLOCKED', reason: verdict.reason });
      return;
    }

    const swap = this.phantomEngine.swapPhantomToReal(headers, isTextBody ? scanBody : undefined, host, defaultPort);
    interceptedReq.realTokensSwapped = swap.swappedTokens;
    this.emitRequest(interceptedReq);

    const outBody =
      isTextBody && swap.modifiedBody !== undefined ? Buffer.from(swap.modifiedBody, 'utf8') : bodyBuffer;
    const upstreamHeaders: Record<string, string> = withoutHeaders(swap.modifiedHeaders, ['content-length', 'host']);
    upstreamHeaders['host'] = host;
    if (outBody.length > 0 || !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      upstreamHeaders['content-length'] = String(outBody.length);
    }

    const transport = target.protocol === 'https:' ? https : http;
    const upstreamReq = transport.request(
      {
        hostname: target.hostname.replace(/^\[|\]$/g, ''),
        port: target.port ? Number(target.port) : defaultPort,
        path,
        method,
        headers: upstreamHeaders,
      },
      (upstreamRes) => this.relayUpstreamResponse(reqId, target.href, upstreamRes, clientRes)
    );

    upstreamReq.on('error', (err) => {
      logger.warn(`QAFind proxy upstream error for ${target.href}: ${err.message}`);
      if (!clientRes.headersSent) {
        this.sendJson(clientRes, 502, { error: 'UPSTREAM_GATEWAY_ERROR', message: err.message });
      } else {
        clientRes.destroy(err);
      }
    });

    upstreamReq.end(outBody.length > 0 ? outBody : undefined);
  }

  private relayUpstreamResponse(
    reqId: string,
    url: string,
    upstreamRes: http.IncomingMessage,
    clientRes: http.ServerResponse
  ): void {
    const status = upstreamRes.statusCode || 502;
    const rawHeaders = upstreamRes.headers;
    const contentType = headerValue(rawHeaders['content-type']);

    // Sanitize header values (keeping multi-value headers such as set-cookie as arrays).
    let headerSanitized = 0;
    const outHeaders: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(rawHeaders)) {
      if (value === undefined || HOP_BY_HOP_HEADERS.has(key.toLowerCase())) continue;
      const values = Array.isArray(value) ? value : [value];
      const cleaned = values.map((v) => {
        const r = this.phantomEngine.sanitizeResponse({ v });
        headerSanitized += r.sanitizedCount;
        return r.headers.v;
      });
      outHeaders[key] = Array.isArray(value) ? cleaned : cleaned[0];
    }

    const record = (body: string | undefined, sanitizedCount: number) =>
      this.emitResponse({
        id: deterministicId('resp', reqId),
        requestId: reqId,
        status,
        headers: Object.fromEntries(Object.entries(outHeaders).map(([k, v]) => [k, headerValue(v) || ''])),
        body,
        timestamp: new Date().toISOString(),
        secretsSanitizedCount: sanitizedCount,
      });

    if (!isTextContentType(contentType)) {
      // Binary or unknown content: stream through untouched (no buffering, no rewriting).
      record(undefined, headerSanitized);
      clientRes.writeHead(status, outHeaders);
      upstreamRes.pipe(clientRes);
      return;
    }

    // Text content: buffer (with a cap) so secrets can be sanitized.
    const max = this.options.maxBodyBytes;
    const chunks: Buffer[] = [];
    let total = 0;
    let aborted = false;
    upstreamRes.on('data', (chunk: Buffer) => {
      if (aborted) return;
      total += chunk.length;
      if (total > max) {
        aborted = true;
        upstreamRes.destroy();
        logger.warn(`QAFind proxy refused to relay ${url}: text response exceeds ${max} bytes and cannot be inspected`);
        this.sendJson(clientRes, 502, {
          error: 'QAFIND_RESPONSE_TOO_LARGE',
          message: `Upstream text response exceeds ${max} bytes and cannot be inspected`,
        });
        return;
      }
      chunks.push(chunk);
    });
    upstreamRes.on('end', () => {
      if (aborted) return;
      let decoded: Buffer;
      try {
        decoded = decodeContent(Buffer.concat(chunks), headerValue(rawHeaders['content-encoding']));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.sendJson(clientRes, 502, { error: 'QAFIND_RESPONSE_UNREADABLE', message });
        return;
      }
      const result = this.sanitizeBody(decoded, contentType, { url });
      delete outHeaders['content-encoding'];
      delete outHeaders['content-length'];
      outHeaders['content-length'] = String(result.body.length);
      record(result.loggedBody, headerSanitized + result.sanitizedCount);
      clientRes.writeHead(status, outHeaders);
      clientRes.end(result.body);
    });
    upstreamRes.on('error', (err) => clientRes.destroy(err));
  }

  /**
   * CONNECT carries opaque TLS, so nothing inside it can be inspected or substituted.
   * Denied by default; tunnels only to hosts explicitly listed in connectAllowHosts
   * (and not in blockedEgressHosts).
   */
  private handleConnect(req: http.IncomingMessage, clientSocket: net.Socket, head: Buffer): void {
    const target = req.url || '';
    const { hostname, port } = splitHostPort(target);
    const reqId = deterministicId('req', ++this.requestCounter);

    const allowListed =
      port !== undefined &&
      this.options.connectAllowHosts.length > 0 &&
      matchAnyHost(target, this.options.connectAllowHosts, port);
    const blocked = matchAnyHost(target, this.config.policy.blockedEgressHosts || [], port);
    const allowed = allowListed && !blocked;

    const reason = allowed
      ? `CONNECT tunnel to '${target}' allowed by connectAllowHosts (not inspected; no substitution)`
      : blocked
        ? `CONNECT to '${target}' denied: host is in blockedEgressHosts`
        : `${CONNECT_DENIED_REASON} CONNECT to '${target}' was denied. To tunnel without inspection, add the host to connectAllowHosts.`;

    this.emitRequest({
      id: reqId,
      timestamp: new Date().toISOString(),
      url: target,
      method: 'CONNECT',
      headers: flattenHeaders(req.headers),
      host: target,
      path: '',
      phantomTokensDetected: [],
      realTokensSwapped: [],
      policyVerdict: allowed ? 'ALLOWED' : 'BLOCKED',
      policyReason: reason,
    });

    if (!allowed) {
      logger.securityViolation(reason, { target });
      const body = JSON.stringify({ error: 'QAFIND_CONNECT_DENIED', reason });
      clientSocket.end(
        'HTTP/1.1 403 Forbidden\r\n' +
          'Content-Type: application/json\r\n' +
          `Content-Length: ${Buffer.byteLength(body)}\r\n` +
          'Connection: close\r\n\r\n' +
          body
      );
      return;
    }

    const upstream = net.connect(port!, hostname, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head && head.length > 0) upstream.write(head);
      upstream.pipe(clientSocket);
      clientSocket.pipe(upstream);
    });
    upstream.on('error', (err) => {
      logger.warn(`QAFind CONNECT tunnel to ${target} failed: ${err.message}`);
      if (clientSocket.writable) {
        clientSocket.end('HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
      }
    });
    clientSocket.on('error', () => upstream.destroy());
    clientSocket.on('close', () => upstream.destroy());
  }

  async stop(): Promise<void> {
    if (this.httpServer) {
      const server = this.httpServer;
      this.httpServer = null;
      for (const socket of this.openSockets) socket.destroy();
      this.openSockets.clear();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }
}
