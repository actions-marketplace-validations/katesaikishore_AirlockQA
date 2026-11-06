// Example spec for `airlock test --local examples/demo-store/specs/cart.spec.ts`.
// Start the demo store first: bun run demo:server
import { test, expect } from '../../../src/testing/airlock-test.js';

test('adds the Pro plan to the cart', async ({ page, airlock }) => {
  await page.goto('/');
  airlock.step('CLICK', '[data-testid="login-btn"]');
  await page.getByTestId('login-btn').click();
  airlock.step('CLICK', '[data-testid="add-pro-plan"]');
  await page.getByTestId('add-pro-plan').click();
  await expect(page.getByTestId('cart-total')).toHaveText('$50.00');
});

test('blocks the refund endpoint through the Airlock gateway', async ({ page }) => {
  await page.goto('/');
  const status = await page.evaluate(async () => {
    const res = await fetch('/api/admin/refund', { method: 'POST', body: '{}' });
    return res.status;
  });
  expect(status).toBe(403);
});
