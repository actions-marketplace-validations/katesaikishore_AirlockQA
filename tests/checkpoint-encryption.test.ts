import { describe, expect, it } from 'bun:test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { CheckpointManager, decryptCheckpoint, encryptCheckpoint } from '../src/forker/checkpoint-manager.js';
import type { CheckpointSnapshot } from '../src/types/index.js';

const snapshot: CheckpointSnapshot = {
  id: 'cp_test',
  name: 'logged-in',
  stepIndex: 3,
  timestamp: new Date(0).toISOString(),
  url: 'http://localhost:3900/cart',
  htmlContent: '<html><body>secret-page-content</body></html>',
  storageState: {
    cookies: [{ name: 'session', value: 'cookie-secret-value', domain: 'localhost', path: '/' }],
    origins: [{ origin: 'http://localhost:3900', localStorage: [{ name: 'token', value: 'ls-secret' }] }],
  },
  sessionStorage: { cart: '3' },
  domHash: 'abc',
};

function tempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-cp-'));
}

describe('checkpoint encryption at rest', () => {
  it('round-trips through encrypt/decrypt and rejects the wrong key', () => {
    const envelope = encryptCheckpoint(snapshot, 'correct horse');
    expect(envelope.algorithm).toBe('aes-256-gcm');
    expect(JSON.stringify(envelope)).not.toContain('cookie-secret-value');
    expect(decryptCheckpoint(envelope, 'correct horse')).toEqual(snapshot);
    expect(() => decryptCheckpoint(envelope, 'wrong key')).toThrow();
  });

  it('detects tampering via the GCM auth tag', () => {
    const envelope = encryptCheckpoint(snapshot, 'k');
    const bytes = Buffer.from(envelope.ciphertext, 'base64');
    bytes[0] ^= 0xff;
    expect(() => decryptCheckpoint({ ...envelope, ciphertext: bytes.toString('base64') }, 'k')).toThrow();
  });

  it('writes encrypted files with mode 0600 and reads them back with a fresh manager', () => {
    const dir = tempDir();
    const writer = new CheckpointManager(dir, { encryptionKey: 'test-key' });
    const file = writer.save(snapshot);
    const onDisk = fs.readFileSync(file, 'utf8');
    expect(onDisk).not.toContain('cookie-secret-value');
    expect(onDisk).not.toContain('secret-page-content');
    if (process.platform !== 'win32') {
      expect(fs.statSync(file).mode & 0o777).toBe(0o600);
    }

    expect(new CheckpointManager(dir, { encryptionKey: 'test-key' }).getCheckpoint('logged-in')).toEqual(snapshot);
    expect(new CheckpointManager(dir, { encryptionKey: null }).getCheckpoint('logged-in')).toBeNull();
  });

  it('still writes plaintext (0600) when no key is configured', () => {
    const dir = tempDir();
    const manager = new CheckpointManager(dir, { encryptionKey: null });
    expect(manager.encrypted).toBe(false);
    const file = manager.save(snapshot);
    expect(JSON.parse(fs.readFileSync(file, 'utf8'))).toEqual(snapshot);
    if (process.platform !== 'win32') {
      expect(fs.statSync(file).mode & 0o777).toBe(0o600);
    }
  });
});

describe('checkpoint restore', () => {
  it('restores localStorage for every saved origin, not just the current page', async () => {
    const { chromium } = await import('playwright-core');
    const macChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      || (fs.existsSync(macChromePath) ? macChromePath : undefined);
    const browser = await chromium.launch({ executablePath, headless: true });
    try {
      const dir = tempDir();
      const manager = new CheckpointManager(dir, { encryptionKey: 'k' });
      manager.save({
        ...snapshot,
        name: 'multi-origin',
        url: 'http://app.airlock.test/',
        storageState: {
          cookies: [],
          origins: [
            { origin: 'http://app.airlock.test', localStorage: [{ name: 'a', value: 'app' }] },
            { origin: 'http://auth.airlock.test', localStorage: [{ name: 'b', value: 'auth' }] },
          ],
        },
        sessionStorage: {},
      });

      const context = await browser.newContext();
      await context.route('**/*', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><p>ok</p>' }));
      const page = await context.newPage();
      expect(await new CheckpointManager(dir, { encryptionKey: 'k' }).restore(context, page, 'multi-origin')).toBe(true);

      expect(await page.evaluate(() => localStorage.getItem('a'))).toBe('app');
      const state = await context.storageState();
      const auth = state.origins.find((o) => o.origin === 'http://auth.airlock.test');
      expect(auth?.localStorage).toEqual([{ name: 'b', value: 'auth' }]);
    } finally {
      await browser.close();
    }
  }, 30000);
});
