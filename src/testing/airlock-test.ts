/**
 * Playwright Test fixture that attaches the Airlock gateway and runner to every test.
 *
 * Usage in a spec:
 *   import { test, expect } from 'airlockqa/dist/src/testing/airlock-test.js';
 *   test('checkout', async ({ page, airlock }) => { ... });
 *
 * The fixture is automatic: the gateway is attached to the test's browser context even when
 * the test body does not reference `airlock`. When the test finishes, the runner signs a
 * run-evidence bundle and attaches it to the Playwright test result as `airlock-evidence`.
 *
 * This module requires `@playwright/test`, which is a peer dependency of airlockqa.
 */
import { test as base, expect } from '@playwright/test';
import type { BrowserContext, Page } from 'playwright-core';
import { AirlockRunner } from '../runner/airlock-runner.js';

export interface AirlockFixtures {
  airlock: AirlockRunner;
}

export const airlockTest = base.extend<AirlockFixtures>({
  airlock: [
    async ({ context, page }, use, testInfo) => {
      const runner = new AirlockRunner();
      // @playwright/test and playwright-core share the same runtime classes.
      await runner.initialize(context as unknown as BrowserContext, page as unknown as Page);
      await use(runner);
      const bundle = await runner.finalize();
      await testInfo.attach('airlock-evidence', {
        body: JSON.stringify(bundle, null, 2),
        contentType: 'application/json',
      });
    },
    { auto: true },
  ],
});

export const test = airlockTest;
export { expect };
