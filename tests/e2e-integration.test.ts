import { describe, expect, it, beforeAll, afterAll, setDefaultTimeout } from 'bun:test';
import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { chromium, type Browser } from 'playwright-core';
import { startDemoServer } from '../examples/demo-store/server.js';
import { AirlockRunner } from '../src/runner/airlock-runner.js';
import { AttestationEngine } from '../src/compliance/attestation.js';
import { airlockLocator } from '../src/runner/locator.js';
import type { ForkVariation } from '../src/types/index.js';

setDefaultTimeout(60_000);

describe('End-to-End AirlockQA Integration Test', () => {
  let demoServer: http.Server;
  let browser: Browser;
  const macChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const chromePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (fs.existsSync(macChromePath) ? macChromePath : undefined);
  const DEMO_PORT = 3999;
  const baseUrl = `http://127.0.0.1:${DEMO_PORT}`;

  beforeAll(async () => {
    // The demo store accepts whatever real key the runner substitutes; match this test's config.
    process.env.STRIPE_SECRET_KEY = 'sk_test_live_sample_51M001AcmeProductionSecretKey9900';
    demoServer = await startDemoServer(DEMO_PORT);
    browser = await chromium.launch({
      executablePath: chromePath,
      headless: true,
    });
  });

  afterAll(async () => {
    if (browser) await browser.close();
    if (demoServer) {
      await new Promise<void>((resolve) => demoServer.close(() => resolve()));
    }
  });

  it('executes full end-to-end security and testing workflow on live application', async () => {
    const runner = new AirlockRunner({
      baseUrl,
      secrets: {
        STRIPE_SECRET_KEY: {
          real: 'sk_test_live_sample_51M001AcmeProductionSecretKey9900',
          phantom: 'ph_sec_stripe_test_8f2a1c',
          allowedHosts: ['localhost', '127.0.0.1'],
          allowedMethods: ['GET', 'POST'],
          blockedPaths: ['*/refund*', '*/wipe*'],
        },
      },
      policy: {
        defaultAction: 'BLOCK',
        allowedEgressHosts: ['localhost', '127.0.0.1'],
        blockedEgressHosts: ['pastebin.com', 'webhook.site'],
        rules: [
          {
            id: 'block-destructive-refunds',
            hostPattern: '*',
            blockedPaths: ['*/refund*', '*/wipe*'],
            action: 'BLOCK',
          },
        ],
      },
      compliance: {
        signingKey: 'e2e-test-hmac-master-key-32-chars!',
        outputDir: './.airlock/e2e-compliance',
        generateHtmlReport: true,
      },
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await runner.initialize(context, page);

    // ------------------------------------------------------------------------
    // STEP: BROWSER ACTION EXECUTION
    // ------------------------------------------------------------------------
    runner.step('GOTO', baseUrl);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Step 1: Login
    runner.step('FILL', 'input[name="email"]');
    const emailInput = await airlockLocator(page, { css: 'input[name="email"]' });
    await emailInput.fill('admin@acme.com');

    runner.step('FILL', 'input[name="password"]');
    const pwdInput = await airlockLocator(page, { css: 'input[name="password"]' });
    await pwdInput.fill('password123');

    runner.step('CLICK', 'button#login-btn');
    const loginBtn = await airlockLocator(page, { testId: 'login-btn', role: 'button', name: 'Log In to Sandbox' });
    await loginBtn.click();
    await page.waitForTimeout(200);

    // ------------------------------------------------------------------------
    // STEP: RESTORE BROWSER CHECKPOINT INTO ISOLATED CONTEXTS
    // ------------------------------------------------------------------------
    await runner.checkpoint('e2e_post_auth', page, context);

    // Step 2: Add Pro plan
    runner.step('CLICK', '[data-testid="add-pro-plan"]');
    const addBtn = await airlockLocator(page, { testId: 'add-pro-plan' });
    await addBtn.click();
    await page.waitForTimeout(100);

    // Checkpoint 2: Cart Ready
    await runner.checkpoint('e2e_cart_ready', page, context);

    // Step 3: Apply Coupon
    runner.step('FILL', '[data-testid="coupon-input"]');
    const couponInput = await airlockLocator(page, { testId: 'coupon-input' });
    await couponInput.fill('AIRLOCK20');

    runner.step('CLICK', '[data-testid="apply-coupon-btn"]');
    const applyBtn = await airlockLocator(page, { testId: 'apply-coupon-btn' });
    await applyBtn.click();
    await page.waitForTimeout(200);

    // Assert discount was applied in DOM
    const totalElem = await airlockLocator(page, { testId: 'cart-total' });
    const totalText = await totalElem.textContent();
    expect(totalText).toBe('$40.00');

    // ------------------------------------------------------------------------
    // STEP: PHANTOM CREDENTIAL IN-FLIGHT SWAP & MUTATION BLOCKING
    // ------------------------------------------------------------------------
    // Checkout button sends phantom token 'ph_sec_stripe_test_8f2a1c'.
    // The Gateway intercepts it, swaps it to real 'sk_test_live_sample...', and succeeds!
    runner.step('CLICK', '[data-testid="checkout-btn"]');
    const checkoutBtn = await airlockLocator(page, { testId: 'checkout-btn' });
    await checkoutBtn.click();
    await page.waitForTimeout(400);

    const checkoutStatus = await page.textContent('#checkout-status');
    expect(checkoutStatus).toContain('Stripe charge created successfully via Real In-Flight Credentials');

    // Now attempt unauthorized destructive mutation (POST /api/admin/refund)
    // The policy engine MUST block this with 403 Forbidden!
    const blockedResult = await page.evaluate(async (phantomToken) => {
      const res = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${phantomToken}`,
        },
        body: JSON.stringify({ chargeId: 'ch_test', amount: 4000 }),
      });
      return { status: res.status, ok: res.ok };
    }, 'ph_sec_stripe_test_8f2a1c');

    expect(blockedResult.status).toBe(403);
    expect(blockedResult.ok).toBe(false);

    // ------------------------------------------------------------------------
    // STEP: RESTORE A BROWSER CHECKPOINT IN PARALLEL CONTEXTS
    // ------------------------------------------------------------------------
    const variations: ForkVariation[] = [
      { id: 'var_vip50', description: '50% VIP', inputOverrides: { coupon: 'VIP50' }, expectedOutcome: 'pass' },
      { id: 'var_invalid', description: 'Invalid Coupon', inputOverrides: { coupon: 'EXPIRED' }, expectedOutcome: 'pass' },
    ];

    const forkResults = await runner.fork(browser, 'e2e_cart_ready', variations, async ({ page, variation }) => {
      const input = await page.$('[data-testid="coupon-input"]');
      if (input) {
        await input.fill(variation.inputOverrides.coupon);
        const btn = await page.$('[data-testid="apply-coupon-btn"]');
        if (btn) await btn.click();
        await page.waitForTimeout(100);
      }
      return { success: true, assertionsPassed: 1, assertionsTotal: 1 };
    });

    expect(forkResults.length).toBe(2);
    expect(forkResults[0].success).toBe(true);

    // ------------------------------------------------------------------------
    // STEP: CRYPTOGRAPHIC ATTESTATION & COMPLIANCE BUNDLE
    // ------------------------------------------------------------------------
    const bundle = await runner.finalize();

    expect(bundle.merkleRoot).toBeDefined();
    expect(bundle.policyAudit.realSecretsExposedToSandbox).toBeNull();
    expect(bundle.policyAudit.egressBlockedCount).toBeGreaterThanOrEqual(1); // Blocked refund!
    expect(bundle.soc2Mapping.cc6_1_logicalAccess).toBe('NOT_ASSESSED');
    expect(bundle.soc2Mapping.cc6_6_boundaryProtection).toBe('NOT_ASSESSED');

    // Verify attestation bundle cryptographically
    const verification = AttestationEngine.verifyBundle(bundle, 'e2e-test-hmac-master-key-32-chars!');
    expect(verification.valid).toBe(true);

    // Verify HTML compliance report generated
    const htmlReportPath = path.join('./.airlock/e2e-compliance', 'compliance-report.html');
    expect(fs.existsSync(htmlReportPath)).toBe(true);
    const htmlContent = fs.readFileSync(htmlReportPath, 'utf8');
    expect(htmlContent).toContain(bundle.merkleRoot);
    expect(htmlContent).toContain('not a compliance assessment');

    await context.close();
    fs.rmSync('./.airlock/e2e-compliance', { recursive: true, force: true });
  }, 60000);

  it('verifies surgical locator self-healing on refactored UI', async () => {
    // Navigate with ?breaking=true where the button was refactored from #checkout-btn to .btn-refactored-v2
    const runner = new AirlockRunner({
      baseUrl,
      secrets: {
        STRIPE_SECRET_KEY: {
          real: 'sk_test_live_sample_51M001AcmeProductionSecretKey9900',
          phantom: 'ph_sec_stripe_test_8f2a1c',
          allowedHosts: ['localhost', '127.0.0.1'],
          allowedMethods: ['GET', 'POST'],
        },
      },
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await runner.initialize(context, page);

    await page.goto(`${baseUrl}/?breaking=true`, { waitUntil: 'domcontentloaded' });

    // Login
    await page.fill('input[name="email"]', 'admin@acme.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button#login-btn');
    await page.waitForTimeout(200);

    // Add item
    await page.click('[data-testid="add-pro-plan"]');
    await page.waitForTimeout(200);

    // The old selector was '#checkout-btn'. But the new UI has '<button class="btn-refactored-v2" aria-label="Complete Checkout">Proceed to Payment</button>'
    // airlockLocator with selfHealer should heal this selector using semantic and accessible name similarity!
    const healedLocator = await airlockLocator(
      page,
      {
        css: '#checkout-btn',
        tag: 'button',
        role: 'button',
        name: 'Complete Checkout',
        text: 'Proceed to Payment',
      },
      runner.getHealer()
    );

    expect(healedLocator).toBeDefined();
    await healedLocator.click();
    await page.waitForTimeout(300);

    const checkoutStatus = await page.textContent('#checkout-status');
    expect(checkoutStatus).toContain('Stripe charge created successfully');

    await context.close();
  }, 60000);
});
