// Deliberately failing spec used by tests/cli-test-local.test.ts to check that
// `airlock test --local` exits non-zero when a test fails.
import { test, expect } from '../../../src/testing/airlock-test.js';

test('expects a cart total the store never shows', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('login-btn').click();
  await page.getByTestId('add-pro-plan').click();
  await expect(page.getByTestId('cart-total')).toHaveText('$999.00', { timeout: 1000 });
});
