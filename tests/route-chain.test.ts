import { afterAll, beforeAll, describe, expect, it, setDefaultTimeout } from 'bun:test';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as net from 'node:net';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';
import { QAFindGateway } from '../src/proxy/gateway.js';
import { ShadowRecorder } from '../src/shadow/shadow-recorder.js';
import { ShadowSynthesizer } from '../src/shadow/shadow-synthesizer.js';
import { CausalXRay } from '../src/telemetry/causal-xray.js';
import type { QAFindConfig } from '../src/types/index.js';

setDefaultTimeout(30_000);

const REAL = 'sk_live_routechain_real_secret_0001';
const PHANTOM = 'ph_routechain_phantom_0001';

const macChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chromePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  process.env.QAFIND_CHROME_PATH ||
  (fs.existsSync(macChromePath) ? macChromePath : undefined);

interface Received {
  url: string;
  headers: http.IncomingHttpHeaders;
  body: string;
}

function startUpstream(): Promise<{ server: http.Server; port: number; received: Received[] }> {
  const received: Received[] = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      received.push({ url: req.url || '', headers: req.headers, body: Buffer.concat(chunks).toString('utf8') });
      res.writeHead(200, { 'content-type': 'text/html', 'access-control-allow-origin': '*' });
      res.end('<html><body>ok</body></html>');
    });
  });
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: (server.address() as net.AddressInfo).port, received });
    })
  );
}

// Only 127.0.0.1 is allowed; `localhost` is a blocked host that reaches the same server.
const config: QAFindConfig = {
  projectName: 'route-chain-test',
  baseUrl: 'http://127.0.0.1',
  secrets: { KEY: { real: REAL, phantom: PHANTOM, allowedHosts: ['127.0.0.1'] } },
  policy: { defaultAction: 'BLOCK', allowedEgressHosts: ['127.0.0.1'], blockedEgressHosts: [], rules: [] },
};

type Layer = 'shadow-context' | 'xray-page';

describe('Route handlers never bypass the QAFindGateway', () => {
  let browser: Browser;
  let upstream: Awaited<ReturnType<typeof startUpstream>>;

  beforeAll(async () => {
    upstream = await startUpstream();
    browser = await chromium.launch({ executablePath: chromePath, headless: true });
  });
  afterAll(async () => {
    if (browser) await browser.close();
    if (upstream) await new Promise<void>((r) => upstream.server.close(() => r()));
  });

  // Same order as QAFindRunner: gateway on the context first, helpers registered afterwards.
  async function setup(layer: Layer): Promise<{ context: BrowserContext; page: Page }> {
    const gateway = new QAFindGateway(config);
    const context = await browser.newContext();
    await gateway.attachToBrowserContext(context);
    const page = await context.newPage();
    if (layer === 'shadow-context') {
      await new ShadowSynthesizer(new ShadowRecorder('./.qafind/test-route-chain/catalog.json')).activate(context);
    } else {
      await new CausalXRay().attachToPage(page);
    }
    await page.goto(`http://127.0.0.1:${upstream.port}/`);
    return { context, page };
  }

  const post = (page: Page, url: string, body: string) =>
    page.evaluate(
      async ({ u, b }) => {
        try {
          const r = await fetch(u, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: b });
          return { status: r.status, text: await r.text() };
        } catch (e) {
          return { status: 0, text: String(e) };
        }
      },
      { u: url, b: body }
    );

  for (const layer of ['shadow-context', 'xray-page'] as Layer[]) {
    describe(layer, () => {
      it('still enforces egress policy on a blocked host', async () => {
        const { context, page } = await setup(layer);
        const before = upstream.received.length;
        const res = await post(page, `http://localhost:${upstream.port}/blocked?${layer}`, 'hello');
        expect(res.status).toBe(403);
        expect(res.text).toContain('QAFIND_EGRESS_FIREWALL_BLOCKED');
        expect(upstream.received.slice(before).some((r) => r.url.includes('/blocked?' + layer))).toBe(false);
        await context.close();
      });

      it('still blocks a request carrying a real secret', async () => {
        const { context, page } = await setup(layer);
        const before = upstream.received.length;
        const res = await post(page, `http://127.0.0.1:${upstream.port}/leak?${layer}`, `key=${REAL}`);
        expect(res.status).not.toBe(200);
        expect(upstream.received.slice(before).some((r) => r.body.includes(REAL))).toBe(false);
        await context.close();
      });

      it('still swaps phantom tokens for the real value on allowed hosts', async () => {
        const { context, page } = await setup(layer);
        const before = upstream.received.length;
        const res = await post(page, `http://127.0.0.1:${upstream.port}/swap?${layer}`, `key=${PHANTOM}`);
        expect(res.status).toBe(200);
        const got = upstream.received.slice(before).find((r) => r.url === `/swap?${layer}`);
        expect(got?.body).toBe(`key=${REAL}`);
        if (layer === 'xray-page') expect(got?.headers['x-qafind-trace-id']).toBeDefined();
        await context.close();
      });
    });
  }
});
