import * as http from 'node:http';
import * as url from 'node:url';
import type { BrowserContext, Request as PlaywrightRequest, Route } from 'playwright-core';
import type { AirlockConfig, HttpMethod, InterceptedRequest, InterceptedResponse } from '../types/index.js';
import { PhantomEngine } from './phantom-engine.js';
import { PolicyEngine } from './policy-engine.js';
import { deterministicId, sha256 } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export type RequestInterceptorCallback = (req: InterceptedRequest) => void;
export type ResponseInterceptorCallback = (resp: InterceptedResponse) => void;

export class AirlockGateway {
  private phantomEngine: PhantomEngine;
  private policyEngine: PolicyEngine;
  private config: AirlockConfig;
  private httpServer: http.Server | null = null;
  private activePort = 0;
  private onRequestCallbacks: RequestInterceptorCallback[] = [];
  private onResponseCallbacks: ResponseInterceptorCallback[] = [];
  private requestCounter = 0;

  constructor(config: AirlockConfig) {
    this.config = config;
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

  /**
   * Attach the deterministic interception gateway directly into a Playwright BrowserContext.
   * This provides full protocol interception without needing any OS-level root proxy certificates.
   */
  async attachToBrowserContext(context: BrowserContext): Promise<void> {
    await context.route('**/*', async (route: Route, request: PlaywrightRequest) => {
      const parsedUrl = new URL(request.url());
      const host = parsedUrl.host;
      const path = parsedUrl.pathname + parsedUrl.search;
      const method = request.method().toUpperCase() as HttpMethod;
      const headers = request.headers();
      const postData = request.postData() || undefined;

      const reqId = deterministicId('req', ++this.requestCounter);

      // 1. Inspect for phantom tokens
      const { phantomTokens, configs } = this.phantomEngine.inspectRequest(headers, postData);

      // 2. Check for real secret leakage attempts
      const leakedPhantoms = this.phantomEngine.detectRealSecretExposure(headers, postData);
      if (leakedPhantoms.length > 0) {
        logger.securityViolation('Sandboxed environment attempted to leak real secrets directly!', {
          url: request.url(),
          host,
        });
        await route.abort('blockedbyclient');
        return;
      }

      // 3. Evaluate deterministic egress policy
      const verdict = await this.policyEngine.evaluate(
        { host, path, method, headers, body: postData, url: request.url() },
        configs
      );

      const interceptedReq: InterceptedRequest = {
        id: reqId,
        timestamp: new Date().toISOString(),
        url: request.url(),
        method,
        headers: { ...headers },
        body: postData,
        host,
        path,
        phantomTokensDetected: phantomTokens,
        realTokensSwapped: [],
        policyVerdict: verdict.verdict,
        policyReason: verdict.reason,
      };

      if (!verdict.allowed) {
        logger.securityViolation(verdict.reason || 'Blocked by Airlock Egress Firewall', {
          url: request.url(),
          method,
          host,
        });

        this.onRequestCallbacks.forEach((cb) => cb(interceptedReq));

        // Return a mock 403 response directly to sandbox
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'AIRLOCK_EGRESS_FIREWALL_BLOCKED',
            message: verdict.reason,
            url: request.url(),
            method,
            airlockReqId: reqId,
          }),
        });
        return;
      }

      // 4. Policy ALLOWED: In-flight swap of phantom tokens to real secrets
      const swapResult = this.phantomEngine.swapPhantomToReal(headers, postData, host);
      interceptedReq.realTokensSwapped = swapResult.swappedTokens;

      this.onRequestCallbacks.forEach((cb) => cb(interceptedReq));

      // 5. Forward request with real credentials to upstream
      try {
        const response = await context.request.fetch(request, {
          headers: swapResult.modifiedHeaders,
          data: swapResult.modifiedBody,
        });

        const respHeaders = response.headers();
        const respBody = await response.text();

        // 6. Sanitize upstream response before it touches the sandbox
        const sanitized = this.phantomEngine.sanitizeResponse(respHeaders, respBody);

        const interceptedResp: InterceptedResponse = {
          id: deterministicId('resp', reqId),
          requestId: reqId,
          status: response.status(),
          headers: sanitized.headers,
          body: sanitized.body,
          timestamp: new Date().toISOString(),
          secretsSanitizedCount: sanitized.sanitizedCount,
        };

        this.onResponseCallbacks.forEach((cb) => cb(interceptedResp));

        await route.fulfill({
          response,
          headers: sanitized.headers,
          body: sanitized.body,
        });
      } catch (err: any) {
        // Fallback to continue if fetch fails or handle network error
        try {
          await route.continue({
            headers: swapResult.modifiedHeaders,
            postData: swapResult.modifiedBody,
          });
        } catch {
          // Route may already have been handled
        }
      }
    });
  }

  /**
   * Start standalone HTTP forward proxy for MicroVMs, containers, or curl
   */
  async startHttpProxy(port = this.config.proxy?.port || 8899): Promise<number> {
    if (this.httpServer) return this.activePort;

    return new Promise((resolve, reject) => {
      this.httpServer = http.createServer(async (clientReq, clientRes) => {
        const reqUrl = clientReq.url || '';
        const parsed = url.parse(reqUrl);
        const host = clientReq.headers.host || parsed.host || '127.0.0.1';
        const method = (clientReq.method?.toUpperCase() || 'GET') as HttpMethod;
        const path = parsed.path || '/';

        let bodyBuffer = Buffer.alloc(0);
        clientReq.on('data', (chunk) => {
          bodyBuffer = Buffer.concat([bodyBuffer, chunk]);
        });

        clientReq.on('end', async () => {
          const bodyStr = bodyBuffer.toString('utf8');
          const headers = clientReq.headers as Record<string, string>;
          const reqId = deterministicId('req', ++this.requestCounter);

          const { phantomTokens, configs } = this.phantomEngine.inspectRequest(headers, bodyStr);
          const verdict = await this.policyEngine.evaluate(
            { host, path, method, headers, body: bodyStr, url: reqUrl },
            configs
          );

          const interceptedReq: InterceptedRequest = {
            id: reqId,
            timestamp: new Date().toISOString(),
            url: reqUrl,
            method,
            headers: { ...headers },
            body: bodyStr,
            host,
            path,
            phantomTokensDetected: phantomTokens,
            realTokensSwapped: [],
            policyVerdict: verdict.verdict,
            policyReason: verdict.reason,
          };

          if (!verdict.allowed) {
            this.onRequestCallbacks.forEach((cb) => cb(interceptedReq));
            clientRes.writeHead(403, { 'Content-Type': 'application/json' });
            clientRes.end(
              JSON.stringify({
                error: 'AIRLOCK_EGRESS_FIREWALL_BLOCKED',
                reason: verdict.reason,
              })
            );
            return;
          }

          // Swap tokens
          const swap = this.phantomEngine.swapPhantomToReal(headers, bodyStr, host);
          interceptedReq.realTokensSwapped = swap.swappedTokens;
          this.onRequestCallbacks.forEach((cb) => cb(interceptedReq));

          // Forward to destination
          const [hostname, targetPortStr] = host.split(':');
          const targetPort = targetPortStr ? parseInt(targetPortStr, 10) : 80;

          const upstreamReq = http.request(
            {
              hostname,
              port: targetPort,
              path,
              method,
              headers: swap.modifiedHeaders,
            },
            (upstreamRes) => {
              let respBodyBuffer = Buffer.alloc(0);
              upstreamRes.on('data', (c) => {
                respBodyBuffer = Buffer.concat([respBodyBuffer, c]);
              });

              upstreamRes.on('end', () => {
                const respHeaders = upstreamRes.headers as Record<string, string>;
                const sanitized = this.phantomEngine.sanitizeResponse(
                  respHeaders,
                  respBodyBuffer.toString('utf8')
                );

                this.onResponseCallbacks.forEach((cb) =>
                  cb({
                    id: deterministicId('resp', reqId),
                    requestId: reqId,
                    status: upstreamRes.statusCode || 200,
                    headers: sanitized.headers,
                    body: sanitized.body,
                    timestamp: new Date().toISOString(),
                    secretsSanitizedCount: sanitized.sanitizedCount,
                  })
                );

                clientRes.writeHead(upstreamRes.statusCode || 200, sanitized.headers);
                clientRes.end(sanitized.body);
              });
            }
          );

          upstreamReq.on('error', (err) => {
            clientRes.writeHead(502, { 'Content-Type': 'application/json' });
            clientRes.end(JSON.stringify({ error: 'UPSTREAM_GATEWAY_ERROR', message: err.message }));
          });

          if (swap.modifiedBody) {
            upstreamReq.write(swap.modifiedBody);
          }
          upstreamReq.end();
        });
      });

      this.httpServer.listen(port, () => {
        const address = this.httpServer!.address();
        this.activePort = typeof address === 'object' && address ? address.port : port;
        logger.info(`Airlock Deterministic Egress Gateway listening on 127.0.0.1:${this.activePort}`);
        resolve(this.activePort);
      });

      this.httpServer.on('error', (err) => reject(err));
    });
  }

  async stop(): Promise<void> {
    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer!.close(() => resolve());
      });
      this.httpServer = null;
    }
  }
}

