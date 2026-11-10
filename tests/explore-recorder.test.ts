import { describe, expect, it, beforeAll, afterAll, setDefaultTimeout } from 'bun:test';
import type * as http from 'node:http';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';
import { startDemoServer } from '../examples/demo-store/server.js';
import { TraceRecorder } from '../src/compiler/trace-recorder.js';
import { InteractionRecorder, REDACTED_VALUE } from '../src/compiler/interaction-recorder.js';
import { chromePath } from './cli-helpers.js';

setDefaultTimeout(60_000);

describe('explore interaction recorder', () => {
  const PORT = 3922;
  const url = `http://127.0.0.1:${PORT}/`;
  let server: http.Server;
  let browser: Browser;

  beforeAll(async () => {
    server = await startDemoServer(PORT);
    browser = await chromium.launch({ executablePath: chromePath, headless: true });
  });

  afterAll(async () => {
    await browser?.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  async function startRecording(): Promise<{ context: BrowserContext; page: Page; trace: TraceRecorder; recorder: InteractionRecorder }> {
    const context = await browser.newContext();
    const trace = new TraceRecorder('recorder-test', url);
    const recorder = new InteractionRecorder(trace);
    await recorder.attach(context);
    const page = await context.newPage();
    return { context, page, trace, recorder };
  }

  it('captures real clicks, fills and key presses with selectors that match the elements used', async () => {
    const { context, page, trace, recorder } = await startRecording();
    await page.goto(url);
    await page.locator('input[name="email"]').fill('qa@example.com');
    await page.locator('input[name="password"]').fill('hunter2');
    await page.getByRole('button', { name: 'Log In to Sandbox' }).click();
    await page.getByText('Add to Cart').click();
    await page.getByPlaceholder('e.g. QAFIND20').fill('VIP50');
    await page.getByPlaceholder('e.g. QAFIND20').press('Enter');
    await recorder.flush(context);

    const steps = trace.getTrace().steps.map((s) => ({ type: s.type, css: s.target?.css, value: s.value, url: s.url }));
    expect(steps).toEqual([
      { type: 'goto', css: undefined, value: undefined, url },
      { type: 'fill', css: 'input[name="email"]', value: 'qa@example.com', url: undefined },
      { type: 'fill', css: 'input[name="password"]', value: REDACTED_VALUE, url: undefined },
      { type: 'click', css: '[data-testid="login-btn"]', value: undefined, url: undefined },
      { type: 'click', css: '[data-testid="add-pro-plan"]', value: undefined, url: undefined },
      { type: 'fill', css: '[data-testid="coupon-input"]', value: 'VIP50', url: undefined },
      { type: 'press', css: '[data-testid="coupon-input"]', value: 'Enter', url: undefined },
    ]);

    // Every recorded selector resolves to exactly one element on the page.
    for (const step of steps.filter((s) => s.css)) {
      expect(await page.locator(step.css!).count()).toBe(1);
    }
    await context.close();
  });

  it('builds a unique selector for elements without ids or test ids', async () => {
    const { context, page, trace, recorder } = await startRecording();
    await page.route('http://recorder.test/', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: `<html><body>
          <ul><li><button>Buy</button></li><li><button><span>Buy</span></button></li></ul>
          <form><input type="text"><input type="text"></form>
          <select><option value="a">A</option><option value="b">B</option></select>
        </body></html>`,
      })
    );
    await page.goto('http://recorder.test/');
    await page.locator('li:nth-child(2) span').click();
    await page.locator('input').nth(1).fill('second field');
    await page.locator('select').selectOption('b');
    await recorder.flush(context);

    const steps = trace.getTrace().steps.filter((s) => s.type !== 'goto');
    expect(steps.map((s) => s.type)).toEqual(['click', 'fill', 'select']);

    // The click on the <span> is recorded against its button, and the selector picks the second button.
    const clicked = await page.locator(steps[0].target!.css).evaluateAll((els) =>
      els.map((el) => ({ tag: el.tagName, index: Array.from(document.querySelectorAll('button')).indexOf(el as HTMLButtonElement) }))
    );
    expect(clicked).toEqual([{ tag: 'BUTTON', index: 1 }]);

    const filled = await page.locator(steps[1].target!.css).evaluateAll((els) =>
      els.map((el) => Array.from(document.querySelectorAll('input')).indexOf(el as HTMLInputElement))
    );
    expect(filled).toEqual([1]);
    expect(steps[1].value).toBe('second field');
    expect(steps[2].value).toBe('b');
    await context.close();
  });
});
