import { describe, expect, it } from 'bun:test';
import { once } from 'node:events';
import * as http from 'node:http';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { isAllowedHost, startDashboardServer } from '../src/dashboard/server.js';
import type { AirlockConfig } from '../src/types/index.js';

function request(port: number, options: { host?: string; path?: string; method?: string; body?: Buffer | string; headers?: Record<string, string> }) {
  return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }>((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1',
      port,
      path: options.path ?? '/',
      method: options.method ?? 'GET',
      headers: { ...(options.host !== undefined ? { Host: options.host } : {}), ...options.headers },
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (options.body !== undefined) req.write(options.body);
    req.end();
  });
}

async function withServer(check: (port: number) => Promise<void>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-dash-host-'));
  const complianceDir = path.join(dir, 'compliance');
  fs.mkdirSync(complianceDir);
  fs.writeFileSync(path.join(complianceDir, 'compliance-report.html'), '<!doctype html><title>Report</title>');
  const config = { compliance: { outputDir: complianceDir }, forker: { checkpointsDir: path.join(dir, 'cp') } } as unknown as AirlockConfig;
  const server = startDashboardServer(config, 0, path.join(dir, 'artifacts'));
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('no port');
  try {
    await check(address.port);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

describe('dashboard Host allow-list', () => {
  it('accepts loopback hosts on the listening port only', () => {
    expect(isAllowedHost('localhost:4100', 4100)).toBe(true);
    expect(isAllowedHost('127.0.0.1:4100', 4100)).toBe(true);
    expect(isAllowedHost('[::1]:4100', 4100)).toBe(true);
    expect(isAllowedHost('LOCALHOST:4100', 4100)).toBe(true);
    expect(isAllowedHost('localhost:4101', 4100)).toBe(false);
    expect(isAllowedHost('localhost', 4100)).toBe(false);
    expect(isAllowedHost('localhost', 80)).toBe(true);
    expect(isAllowedHost('evil.example:4100', 4100)).toBe(false);
    expect(isAllowedHost('localhost.evil.example:4100', 4100)).toBe(false);
    expect(isAllowedHost('127.0.0.1.nip.io:4100', 4100)).toBe(false);
    expect(isAllowedHost(undefined, 4100)).toBe(false);
  });

  it('returns 403 for a rebinding Host header and serves loopback hosts', async () => {
    await withServer(async (port) => {
      const rejected = await request(port, { host: `attacker.example:${port}`, path: '/api/checkpoints' });
      expect(rejected.status).toBe(403);
      const wrongPort = await request(port, { host: 'localhost:1', path: '/api/checkpoints' });
      expect(wrongPort.status).toBe(403);
      const ok = await request(port, { host: `localhost:${port}`, path: '/api/checkpoints' });
      expect(ok.status).toBe(200);
    });
  });

  it('sends a CSP on HTML responses, including the compliance report', async () => {
    await withServer(async (port) => {
      const report = await request(port, { host: `127.0.0.1:${port}`, path: '/compliance-report' });
      expect(report.status).toBe(200);
      expect(report.headers['content-security-policy']).toContain("default-src 'none'");
      expect(report.headers['content-security-policy']).not.toContain('script-src');

      const home = await request(port, { host: `127.0.0.1:${port}`, path: '/' });
      expect(home.status).toBe(200);
      const csp = String(home.headers['content-security-policy']);
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      if (home.body.includes('type="importmap"')) expect(csp).toContain("'sha256-");
    });
  });

  it('rejects oversized /api/verify bodies', async () => {
    await withServer(async (port) => {
      const big = Buffer.alloc(5 * 1024 * 1024 + 1, 0x20);
      const res = await request(port, {
        host: `127.0.0.1:${port}`,
        path: '/api/verify',
        method: 'POST',
        body: big,
        headers: { 'Content-Type': 'application/json', 'Content-Length': String(big.length) },
      }).catch((err) => ({ status: 413, headers: {}, body: String(err) }));
      expect(res.status).toBe(413);
    });
  });
});
