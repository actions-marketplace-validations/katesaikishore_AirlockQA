import { afterAll, beforeAll, describe, expect, it, setDefaultTimeout } from 'bun:test';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as net from 'node:net';
import * as zlib from 'node:zlib';
import { chromium, type Browser } from 'playwright-core';
import { QAFindGateway } from '../src/proxy/gateway.js';
import type { QAFindConfig, InterceptedRequest, InterceptedResponse } from '../src/types/index.js';

setDefaultTimeout(30_000);

const REAL = 'sk_live_gateway_test_real_secret_0001';
const PHANTOM = 'ph_gateway_test_phantom_0001';

// Minimal valid PNG (1x1) followed by bytes that are not valid UTF-8.
const PNG_BYTES = Buffer.concat([
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  ),
  Buffer.from([0xff, 0xfe, 0x80, 0x81, 0xc3, 0x28]),
]);

interface Received {
  method: string;
  url: string;
  headers: http.IncomingHttpHeaders;
  body: Buffer;
}

function startUpstream(): Promise<{ server: http.Server; port: number; received: Received[] }> {
  const received: Received[] = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      received.push({ method: req.method || '', url: req.url || '', headers: req.headers, body });
      const path = (req.url || '').split('?')[0];
      if (path === '/img.png') {
        res.writeHead(200, { 'content-type': 'image/png', 'content-length': PNG_BYTES.length });
        res.end(PNG_BYTES);
      } else if (path === '/data.json') {
        const json = Buffer.from(JSON.stringify({ token: REAL, note: 'héllo wörld' }), 'utf8');
        const gz = zlib.gzipSync(json);
        res.writeHead(200, {
          'content-type': 'application/json; charset=utf-8',
          'content-encoding': 'gzip',
          'content-length': gz.length,
          'access-control-allow-origin': '*',
        });
        res.end(gz);
      } else if (path === '/echo') {
        res.writeHead(200, { 'content-type': req.headers['content-type'] || 'application/octet-stream' });
        res.end(body);
      } else {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end('<html><body>ok</body></html>');
      }
    });
  });
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as net.AddressInfo;
      resolve({ server, port: addr.port, received });
    })
  );
}

function makeConfig(patch: Partial<QAFindConfig> = {}): QAFindConfig {
  return {
    projectName: 'gateway-test',
    baseUrl: 'http://127.0.0.1',
    secrets: {
      KEY: { real: REAL, phantom: PHANTOM, allowedHosts: ['127.0.0.1', 'localhost'] },
    },
    policy: {
      defaultAction: 'BLOCK',
      allowedEgressHosts: ['127.0.0.1', 'localhost'],
      blockedEgressHosts: [],
      rules: [],
    },
    ...patch,
  };
}

const closeServer = (s: http.Server | net.Server) => new Promise<void>((r) => s.close(() => r()));

// ---------------------------------------------------------------------------
// Browser-context gateway
// ---------------------------------------------------------------------------

const macChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chromePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (fs.existsSync(macChromePath) ? macChromePath : undefined);

describe('QAFindGateway browser context', () => {
  let browser: Browser;
  let upstream: Awaited<ReturnType<typeof startUpstream>>;

  beforeAll(async () => {
    upstream = await startUpstream();
    browser = await chromium.launch({ executablePath: chromePath, headless: true });
  });

  afterAll(async () => {
    if (browser) await browser.close();
    if (upstream) await closeServer(upstream.server);
  });

  async function newGatewayPage(config = makeConfig()) {
    const gateway = new QAFindGateway(config);
    const requests: InterceptedRequest[] = [];
    const responses: InterceptedResponse[] = [];
    gateway.onRequest((r) => requests.push(r));
    gateway.onResponse((r) => responses.push(r));
    const context = await browser.newContext();
    await gateway.attachToBrowserContext(context);
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${upstream.port}/`);
    return { gateway, context, page, requests, responses };
  }

  it('passes binary (PNG) responses through byte-for-byte', async () => {
    const { context, page } = await newGatewayPage();
    const bytes = await page.evaluate(async (u) => {
      const r = await fetch(u);
      return Array.from(new Uint8Array(await r.arrayBuffer()));
    }, `http://127.0.0.1:${upstream.port}/img.png`);
    expect(Buffer.from(bytes).equals(PNG_BYTES)).toBe(true);
    await context.close();
  });

  it('decodes gzip JSON, sanitizes secrets and drops stale encoding headers', async () => {
    const { context, page, responses } = await newGatewayPage();
    const result = await page.evaluate(async (u) => {
      const r = await fetch(u);
      return {
        text: await r.text(),
        encoding: r.headers.get('content-encoding'),
        length: r.headers.get('content-length'),
      };
    }, `http://127.0.0.1:${upstream.port}/data.json`);
    const parsed = JSON.parse(result.text);
    expect(parsed.token).toBe(PHANTOM);
    expect(parsed.note).toBe('héllo wörld');
    expect(result.encoding).toBeNull();
    if (result.length !== null) {
      expect(Number(result.length)).toBe(Buffer.byteLength(result.text, 'utf8'));
    }
    const resp = responses.find((r) => r.body?.includes(PHANTOM));
    expect(resp?.secretsSanitizedCount).toBe(1);
    await context.close();
  });

  it('forwards binary request bodies unchanged and swaps phantoms only in text bodies', async () => {
    const { context, page } = await newGatewayPage();
    const binary = [0xff, 0x00, 0xfe, 0x80, ...Buffer.from(PHANTOM, 'utf8')];
    await page.evaluate(
      async ({ u, data }) => {
        await fetch(u, {
          method: 'POST',
          headers: { 'content-type': 'application/octet-stream' },
          body: new Uint8Array(data),
        });
      },
      { u: `http://127.0.0.1:${upstream.port}/echo?binary`, data: binary }
    );
    await page.evaluate(
      async ({ u, token }) => {
        await fetch(u, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token, note: 'naïve' }),
        });
      },
      { u: `http://127.0.0.1:${upstream.port}/echo?text`, token: PHANTOM }
    );

    const bin = upstream.received.find((r) => r.url === '/echo?binary');
    expect(bin?.body.equals(Buffer.from(binary))).toBe(true);

    const text = upstream.received.find((r) => r.url === '/echo?text');
    expect(JSON.parse(text!.body.toString('utf8'))).toEqual({ token: REAL, note: 'naïve' });
    await context.close();
  });

  it('aborts and reports instead of continuing with real secrets when forwarding fails', async () => {
    const { context, page, requests } = await newGatewayPage();
    // Force the trusted forwarding path to fail.
    (context.request as any).fetch = async () => {
      throw new Error('simulated upstream failure');
    };
    const before = upstream.received.length;
    const outcome = await page.evaluate(
      async ({ u, token }) => {
        try {
          await fetch(u, { headers: { authorization: `Bearer ${token}` } });
          return 'resolved';
        } catch {
          return 'rejected';
        }
      },
      { u: `http://127.0.0.1:${upstream.port}/echo?fail`, token: PHANTOM }
    );
    expect(outcome).toBe('rejected');
    // The browser must not have sent the request itself (with or without real secrets).
    expect(upstream.received.length).toBe(before);
    const reported = requests.find((r) => r.url.endsWith('/echo?fail'));
    expect(reported).toBeDefined();
    expect(reported!.policyVerdict).toBe('BLOCKED');
    expect(reported!.forwardError).toContain('simulated upstream failure');
    await context.close();
  });
});

// ---------------------------------------------------------------------------
// Standalone HTTP forward proxy
// ---------------------------------------------------------------------------

interface ProxyResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: Buffer;
}

function proxyRequest(
  proxyPort: number,
  opts: { path: string; method?: string; headers?: Record<string, string>; body?: Buffer | string }
): Promise<ProxyResponse> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port: proxyPort, method: opts.method || 'GET', path: opts.path, headers: opts.headers },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, body: Buffer.concat(chunks) }));
      }
    );
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

// Raw socket CONNECT (Bun's http client does not issue CONNECT requests).
function connectRequest(proxyPort: number, target: string): Promise<{ status: number; body: string; socket: net.Socket }> {
  return new Promise((resolve, reject) => {
    const socket = net.connect(proxyPort, '127.0.0.1', () => {
      socket.write(`CONNECT ${target} HTTP/1.1\r\nHost: ${target}\r\n\r\n`);
    });
    let buf = Buffer.alloc(0);
    const onData = (chunk: Buffer) => {
      buf = Buffer.concat([buf, chunk]);
      const end = buf.indexOf('\r\n\r\n');
      if (end === -1) return;
      const head = buf.subarray(0, end).toString();
      const status = Number(head.split(' ')[1]);
      const lenMatch = /content-length:\s*(\d+)/i.exec(head);
      const bodyLen = lenMatch ? Number(lenMatch[1]) : 0;
      if (buf.length < end + 4 + bodyLen) return;
      socket.off('data', onData);
      resolve({ status, body: buf.subarray(end + 4, end + 4 + bodyLen).toString(), socket });
    };
    socket.on('data', onData);
    socket.on('error', reject);
  });
}

describe('QAFindGateway HTTP proxy', () => {
  let upstream: Awaited<ReturnType<typeof startUpstream>>;
  let echoServer: net.Server;
  let echoPort: number;
  let gateway: QAFindGateway;
  let proxyPort: number;
  const requests: InterceptedRequest[] = [];

  beforeAll(async () => {
    upstream = await startUpstream();
    echoServer = net.createServer((s) => s.pipe(s));
    await new Promise<void>((r) => echoServer.listen(0, '127.0.0.1', () => r()));
    echoPort = (echoServer.address() as net.AddressInfo).port;
    gateway = new QAFindGateway(makeConfig(), {
      connectAllowHosts: [`127.0.0.1:${echoPort}`],
      maxBodyBytes: 1024,
    });
    gateway.onRequest((r) => requests.push(r));
    proxyPort = await gateway.startHttpProxy(0);
  });

  afterAll(async () => {
    await gateway.stop();
    await closeServer(upstream.server);
    await closeServer(echoServer);
  });

  it('forwards absolute-form requests and swaps phantom tokens', async () => {
    const target = `127.0.0.1:${upstream.port}`;
    const res = await proxyRequest(proxyPort, {
      path: `http://${target}/echo?swap`,
      method: 'POST',
      headers: { host: target, authorization: `Bearer ${PHANTOM}`, 'content-type': 'text/plain' },
      body: `token=${PHANTOM}`,
    });
    expect(res.status).toBe(200);
    const got = upstream.received.find((r) => r.url === '/echo?swap');
    expect(got?.headers.authorization).toBe(`Bearer ${REAL}`);
    expect(got?.body.toString()).toBe(`token=${REAL}`);
    // Response body echoed the real value; it must be sanitized on the way back.
    expect(res.body.toString()).toBe(`token=${PHANTOM}`);
  });

  it('passes binary responses through unchanged', async () => {
    const target = `127.0.0.1:${upstream.port}`;
    const res = await proxyRequest(proxyPort, { path: `http://${target}/img.png`, headers: { host: target } });
    expect(res.status).toBe(200);
    expect(res.body.equals(PNG_BYTES)).toBe(true);
  });

  it('takes the target from the request URI and rejects a mismatched Host header', async () => {
    const before = upstream.received.length;
    const res = await proxyRequest(proxyPort, {
      path: `http://127.0.0.1:${upstream.port}/echo?mismatch`,
      headers: { host: 'api.stripe.com' },
    });
    expect(res.status).toBe(400);
    expect(res.body.toString()).toContain('Host');
    expect(upstream.received.length).toBe(before);
  });

  it('rejects origin-form request targets', async () => {
    const res = await proxyRequest(proxyPort, { path: '/echo', headers: { host: `127.0.0.1:${upstream.port}` } });
    expect(res.status).toBe(400);
  });

  it('blocks requests that contain a real secret', async () => {
    const target = `127.0.0.1:${upstream.port}`;
    const before = upstream.received.length;
    const res = await proxyRequest(proxyPort, {
      path: `http://${target}/echo?leak`,
      headers: { host: target, authorization: `Bearer ${REAL}` },
    });
    expect(res.status).toBe(403);
    expect(upstream.received.length).toBe(before);
    expect(requests.some((r) => r.url.endsWith('/echo?leak') && r.policyVerdict === 'BLOCKED')).toBe(true);
  });

  it('caps request bodies with 413', async () => {
    const target = `127.0.0.1:${upstream.port}`;
    const res = await proxyRequest(proxyPort, {
      path: `http://${target}/echo?big`,
      method: 'POST',
      headers: { host: target, 'content-type': 'text/plain' },
      body: Buffer.alloc(4096, 'a'),
    });
    expect(res.status).toBe(413);
  });

  it('denies CONNECT by default with a clear reason', async () => {
    const res = await connectRequest(proxyPort, 'api.stripe.com:443');
    expect(res.status).toBe(403);
    expect(res.body).toContain('HTTPS tunnelling cannot be inspected');
    res.socket.destroy();
  });

  it('tunnels CONNECT to allow-listed hosts without swapping', async () => {
    const res = await connectRequest(proxyPort, `127.0.0.1:${echoPort}`);
    expect(res.status).toBe(200);
    const echoed = await new Promise<string>((resolve) => {
      res.socket.once('data', (d) => resolve(d.toString()));
      res.socket.write(`hello ${PHANTOM}`);
    });
    expect(echoed).toBe(`hello ${PHANTOM}`);
    res.socket.destroy();
  });
});
