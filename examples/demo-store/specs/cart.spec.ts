// Example spec for `qafind test --local examples/demo-store/specs/cart.spec.ts`.
// Start the demo store first: bun run demo:server
import { test, expect } from '../../../src/testing/qafind-test.js';

test('adds the Pro plan to the cart', async ({ page, qafind }) => {
  await page.goto('/');
  qafind.step('CLICK', '[data-testid="login-btn"]');
  await page.getByTestId('login-btn').click();
  qafind.step('CLICK', '[data-testid="add-pro-plan"]');
  await page.getByTestId('add-pro-plan').click();
  await expect(page.getByTestId('cart-total')).toHaveText('$50.00');
});

test('blocks the refund endpoint through the QAFind gateway', async ({ page }) => {
  await page.goto('/');
  const status = await page.evaluate(async () => {
    const res = await fetch('/api/admin/refund', { method: 'POST', body: '{}' });
    return res.status;
  });
  expect(status).toBe(403);
});
