/**
 * AUTO-COMPILED BY AIRLOCK DETERMINISTIC COMPILER
 * Deterministic Spec: Exploration Trace -> Playwright TypeScript Spec
 * Execution Target: <800ms | Token Cost: $0.00
 * Trace ID: trace_65fb1d165de5
 * Generated: 2026-11-05T22:11:11.240Z
 */

import { test, expect } from '@playwright/test';
import { AirlockRunner, airlockLocator } from 'airlockqa';

test.describe('checkout-flow', () => {
  let airlock: AirlockRunner;

  test.beforeEach(async ({ page, context }) => {
    airlock = new AirlockRunner();
    await airlock.initialize(context, page);
  });

  test.afterEach(async () => {
    const proof = await airlock.finalize();
    console.log('Airlock Merkle Root:', proof.merkleRoot);
  });

  test('deterministic run for checkout-flow', async ({ page }) => {
    test.setTimeout(10000);

  // Step 1: GOTO
  await page.goto('http://127.0.0.1:3900', { waitUntil: 'domcontentloaded' });

  // Step 2: CLICK
  const el_2 = await airlockLocator(page, { testId: 'login-btn', css: '[data-testid="login-btn"]', text: 'Log In to Sandbox' });
  await el_2.click();

  // Step 3: CHECKPOINT
  await airlock.checkpoint('post_auth', page);

  // Step 4: CLICK
  const el_4 = await airlockLocator(page, { css: '[data-testid="add-to-cart"]' });
  await el_4.click();

  // Step 5: CHECKPOINT
  await airlock.checkpoint('cart_filled', page);

  // Step 6: FILL
  const el_6 = await airlockLocator(page, { testId: 'coupon-input', css: '[data-testid="coupon-input"]', text: '' });
  await el_6.fill('SAVE20');

  // Step 7: CLICK
  const el_7 = await airlockLocator(page, { testId: 'apply-coupon-btn', css: '[data-testid="apply-coupon-btn"]', text: 'Apply Coupon' });
  await el_7.click();

  // Step 8: ASSERT_VISIBLE
  const el_8 = await airlockLocator(page, { testId: 'cart-total', css: '[data-testid="cart-total"]', text: '$50.00' });
  await expect(el_8).toBeVisible({ timeout: 4000 });

  });
});
