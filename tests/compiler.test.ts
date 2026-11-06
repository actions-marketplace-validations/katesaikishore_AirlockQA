import { describe, expect, it } from 'bun:test';
import { AstGenerator } from '../src/compiler/ast-generator.js';
import type { ExecutionTrace } from '../src/types/index.js';

describe('Compiler: trace-to-Playwright spec generator', () => {
  const sampleTrace: ExecutionTrace = {
    id: 'trace_test_001',
    suiteName: 'checkout-flow',
    targetUrl: 'http://localhost:3900',
    startTime: new Date().toISOString(),
    steps: [
      {
        index: 1,
        type: 'goto',
        url: 'http://localhost:3900',
        timestamp: new Date().toISOString(),
      },
      {
        index: 2,
        type: 'click',
        target: {
          css: 'button#login-btn',
          tagName: 'button',
          ariaRole: 'button',
          ariaName: 'Log In to Sandbox',
          dataTestId: 'login-btn',
          attributes: { id: 'login-btn', type: 'submit' },
        },
        timestamp: new Date().toISOString(),
      },
      {
        index: 3,
        type: 'fill',
        target: {
          css: 'input[name="coupon"]',
          tagName: 'input',
          dataTestId: 'coupon-input',
          attributes: { name: 'coupon' },
        },
        value: 'AIRLOCK20',
        timestamp: new Date().toISOString(),
      },
      {
        index: 4,
        type: 'checkpoint',
        checkpointName: 'post_auth_and_coupon',
        timestamp: new Date().toISOString(),
      },
      {
        index: 5,
        type: 'assert_visible',
        target: {
          css: '#cart-total',
          tagName: 'b',
          dataTestId: 'cart-total',
          attributes: { id: 'cart-total' },
        },
        timestamp: new Date().toISOString(),
      },
    ],
    networkEvents: [],
    metadata: {},
  };

  it('generates Playwright TypeScript code from an execution trace', () => {
    const generator = new AstGenerator();
    const code = generator.compileToSpec(sampleTrace, {
      suiteTitle: 'Checkout Flow',
      defaultTimeoutMs: 5000,
    });

    // Verify key elements in emitted code
    expect(code).toContain('test.describe("Checkout Flow"');
    expect(code).toContain('page.goto("http://localhost:3900"');
    expect(code).toContain('airlockLocator(page, { testId: "login-btn"');
    expect(code).toContain("await el_2.click()");
    expect(code).toContain('airlockLocator(page, { testId: "coupon-input"');
    expect(code).toContain('await el_3.fill("AIRLOCK20")');
    expect(code).toContain('await airlock.checkpoint("post_auth_and_coupon", page)');
    expect(code).toContain("await expect(el_5).toBeVisible({ timeout: 4000 })");
    expect(code).toContain('Generated Playwright output compiled from an exploration trace.');
  });
});

