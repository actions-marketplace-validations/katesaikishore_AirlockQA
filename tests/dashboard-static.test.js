import { describe, expect, it } from 'bun:test';
import { once } from 'node:events';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { startDashboardServer } from '../src/dashboard/server.js';

async function withDashboard(complianceDir, check, artifactDirectory) {
  const server = startDashboardServer({ compliance: { outputDir: complianceDir } }, 0, artifactDirectory);
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Dashboard did not bind to a TCP port');

  try {
    await check('http://127.0.0.1:' + address.port);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

describe('Dashboard static server', () => {
  it('serves the dashboard and public assets with their content types', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-dashboard-'));
    try {
      await withDashboard(path.join(tempRoot, 'compliance'), async (origin) => {
        const page = await fetch(origin + '/');
        expect(page.status).toBe(200);
        expect(page.headers.get('content-type')).toContain('text/html');
        expect(await page.text()).toContain('Turn browser explorations');

        const login = await fetch(origin + '/login');
        expect(login.status).toBe(200);
        expect(await login.text()).toContain('Sign in to Airlock Cloud');

        const consolePage = await fetch(origin + '/console');
        expect(consolePage.status).toBe(200);
        expect(await consolePage.text()).toContain('Good morning, Maya');

        const assets = [
          ['/styles.css', 'text/css'],
          ['/marketing.css', 'text/css'],
          ['/dashboard.js', 'javascript'],
          ['/dashboard-data.js', 'javascript'],
          ['/login.js', 'javascript'],
          ['/console-auth.js', 'javascript'],
          ['/console.html', 'text/html'],
          ['/login.html', 'text/html'],
          ['/explorer.html', 'text/html'],
        ];
        for (const [assetPath, expectedType] of assets) {
          const response = await fetch(origin + assetPath);
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain(expectedType);
          expect((await response.text()).length).toBeGreaterThan(0);
        }

        const head = await fetch(origin + '/styles.css', { method: 'HEAD' });
        expect(head.status).toBe(200);
        expect(await head.text()).toBe('');

        expect((await fetch(origin + '/not-a-public-file')).status).toBe(404);
        expect((await fetch(origin + '/%2e%2e%2fpackage.json')).status).toBe(403);
        expect((await fetch(origin + '/api/checkpoints')).status).toBe(200);
      });
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it('keeps the marketing page at the root and serves an existing compliance report separately', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-dashboard-report-'));
    const complianceDir = path.join(tempRoot, 'compliance');
    fs.mkdirSync(complianceDir);
    fs.writeFileSync(path.join(complianceDir, 'compliance-report.html'), '<!doctype html><title>Compliance report</title>');
    try {
      await withDashboard(complianceDir, async (origin) => {
        const home = await fetch(origin + '/');
        expect(home.status).toBe(200);
        expect(await home.text()).toContain('Turn browser explorations');

        const response = await fetch(origin + '/compliance-report');
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/html');
        expect(await response.text()).toContain('Compliance report');
      });
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it('loads the pinned Three.js module without a blocked inline import map', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-dashboard-three-'));
    try {
      await withDashboard(path.join(tempRoot, 'compliance'), async (origin) => {
        const consolePage = await fetch(origin + '/console');
        const consoleHtml = await consolePage.text();
        expect(consoleHtml).not.toContain('type="importmap"');

        const dashboard = await fetch(origin + '/dashboard.js');
        const dashboardJs = await dashboard.text();
        expect(dashboardJs).toContain('https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js');
      });
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it('accepts same-origin WebM recordings and saves only to the configured fixed path', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-dashboard-recording-'));
    const complianceDir = path.join(tempRoot, 'compliance');
    const artifactDir = path.join(tempRoot, 'artifacts');
    const recordingPath = path.join(artifactDir, 'airlockqa-motion-preview.webm');
    const webm = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x00, 0x01, 0x02]);
    try {
      await withDashboard(complianceDir, async (origin) => {
        const wrongType = await fetch(origin + '/api/preview-recording', {
          method: 'POST',
          headers: { Origin: origin, 'Content-Type': 'application/octet-stream' },
          body: webm,
        });
        expect(wrongType.status).toBe(415);

        const crossOrigin = await fetch(origin + '/api/preview-recording', {
          method: 'POST',
          headers: { Origin: 'http://attacker.example', 'Content-Type': 'video/webm' },
          body: webm,
        });
        expect(crossOrigin.status).toBe(403);
        expect(fs.existsSync(recordingPath)).toBe(false);

        const accepted = await fetch(origin + '/api/preview-recording', {
          method: 'POST',
          headers: { Origin: origin, 'Content-Type': 'video/webm' },
          body: webm,
        });
        expect(accepted.status).toBe(201);
        const result = await accepted.json();
        expect(result.path).toBe(path.relative(process.cwd(), recordingPath).split(path.sep).join('/'));
        expect(result.bytes).toBe(webm.length);
        expect(fs.readFileSync(recordingPath)).toEqual(webm);
      }, artifactDir);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
