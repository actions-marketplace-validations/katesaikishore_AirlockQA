/**
 * Playwright Test fixture that attaches the QAFind gateway and runner to every test.
 *
 * Usage in a spec:
 *   import { test, expect } from 'qafind/dist/src/testing/qafind-test.js';
 *   test('checkout', async ({ page, qafind }) => { ... });
 *
 * The fixture is automatic: the gateway is attached to the test's browser context even when
 * the test body does not reference `qafind`. When the test finishes, the runner signs a
 * run-evidence bundle and attaches it to the Playwright test result as `qafind-evidence`.
 *
 * This module requires `@playwright/test`, which is a peer dependency of qafind.
 */
import { test as base, expect } from '@playwright/test';
import type { BrowserContext, Page } from 'playwright-core';
import { QAFindRunner } from '../runner/qafind-runner.js';

export interface QAFindFixtures {
  qafind: QAFindRunner;
}

export const qafindTest = base.extend<QAFindFixtures>({
  qafind: [
    async ({ context, page }, use, testInfo) => {
      const runner = new QAFindRunner();
      // @playwright/test and playwright-core share the same runtime classes.
      await runner.initialize(context as unknown as BrowserContext, page as unknown as Page);
      await use(runner);
      const bundle = await runner.finalize();
      await testInfo.attach('qafind-evidence', {
        body: JSON.stringify(bundle, null, 2),
        contentType: 'application/json',
      });
    },
    { auto: true },
  ],
});

export const test = qafindTest;
export { expect };
