import { describe, expect, it } from 'bun:test';
import * as fs from 'node:fs';
import { chromium } from 'playwright-core';
import { CheckpointManager } from '../src/forker/checkpoint-manager.js';
import { StateForker } from '../src/forker/state-forker.js';
import type { ForkVariation } from '../src/types/index.js';

describe('State Forker: Point-in-Time State Checkpointing', () => {
  const testCheckpointsDir = './.airlock/test-checkpoints';
  const macChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const chromePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (fs.existsSync(macChromePath) ? macChromePath : undefined);

  it('captures and retrieves point-in-time state checkpoint', async () => {
    const manager = new CheckpointManager(testCheckpointsDir);
    let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
    try {
      browser = await chromium.launch({
        executablePath: chromePath,
        headless: true,
      });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Set sample cookie and navigate to blank
      await context.addCookies([
        { name: 'airlock_auth', value: 'token_123', domain: 'localhost', path: '/' },
      ]);
      await page.setContent('<html><body><h1>Warm State Ready</h1></body></html>');

      const snapshot = await manager.capture(page, context, 'test_warm_state', 5);

      expect(snapshot.name).toBe('test_warm_state');
      expect(snapshot.stepIndex).toBe(5);
      expect(snapshot.storageState.cookies.some((c) => c.name === 'airlock_auth')).toBe(true);

      const retrieved = manager.getCheckpoint('test_warm_state');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(snapshot.id);
    } finally {
      await browser?.close();
      fs.rmSync(testCheckpointsDir, { recursive: true, force: true });
    }
  }, 30_000);

  it('restores browser checkpoint state into parallel contexts without re-running setup steps', async () => {
    const manager = new CheckpointManager(testCheckpointsDir);
    const forker = new StateForker(manager);
    let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
    try {
      browser = await chromium.launch({
        executablePath: chromePath,
        headless: true,
      });
      const context = await browser.newContext();
      const page = await context.newPage();

      await context.addCookies([
        { name: 'session_id', value: 'sess_abc999', domain: 'localhost', path: '/' },
      ]);
      await page.setContent('<html><body><div id="cart">Cart Total: $100</div></body></html>');

      await manager.capture(page, context, 'cart_snapshot');
      await context.close();

      const variations: ForkVariation[] = [
        { id: 'coupon_vip', description: 'VIP', inputOverrides: { code: 'VIP' }, expectedOutcome: 'pass' },
        { id: 'coupon_student', description: 'Student', inputOverrides: { code: 'STUDENT' }, expectedOutcome: 'pass' },
        { id: 'coupon_blackfriday', description: 'BF', inputOverrides: { code: 'BF' }, expectedOutcome: 'pass' },
      ];

      const results = await forker.forkParallel(browser, 'cart_snapshot', variations, async ({ page }) => {
        // Warm state is already restored!
        const content = await page.textContent('body');
        expect(content).toContain('Cart Total: $100');

        return {
          success: true,
          assertionsPassed: 1,
          assertionsTotal: 1,
        };
      });

      expect(results.length).toBe(3);
      for (const res of results) {
        expect(res.success).toBe(true);
        expect(res.durationMs).toBeLessThan(5000); // Allow cold browser startup while bounding each fork.
      }
    } finally {
      await browser?.close();
      fs.rmSync(testCheckpointsDir, { recursive: true, force: true });
    }
  }, 30_000);
});
