#!/usr/bin/env bun
/**
 * GUI smoke suite, driven with Playwright (playwright-core) and axe-core. Replaces the agent-browser script, so it needs
 * nothing beyond the repository's own dependencies and a Chromium (`npx playwright install chromium`).
 *
 * Three journeys:
 *   1. site      the public site, sign-in disclosure and the preview console. By default this is the site in public/,
 *                served by the local dashboard (the code in this checkout); BASE_URL tests a deployment instead.
 *   2. capture   the local dashboard saves a five-second canvas recording as WebM
 *   3. demo      the local demo store's login, coupon and checkout forms
 *
 *   bun scripts/gui-smoke.ts                                   all three, fully local (what CI runs)
 *   BASE_URL=https://staging.qbrin.cloud bun scripts/gui-smoke.ts   journey 1 against a deployment
 *   GUI_SMOKE_ONLY=site,demo bun scripts/gui-smoke.ts          a subset
 *
 * Every page gets an axe audit; any violation fails the run. Screenshots, the evidence export, the recording and a
 * Markdown summary are written to OUT_DIR (default artifacts/gui-qa/pr).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';

const ROOT = path.resolve(import.meta.dir, '..');
process.chdir(ROOT);
// Set in main(): BASE_URL when given, otherwise the local dashboard's origin.
let BASE_URL = (process.env.BASE_URL || '').replace(/\/$/, '');
const OUT_DIR = process.env.OUT_DIR || 'artifacts/gui-qa/pr';
const ONLY = new Set((process.env.GUI_SMOKE_ONLY || 'site,capture,demo').split(',').map((s) => s.trim()).filter(Boolean));
const SUMMARY = path.join(OUT_DIR, 'gui-smoke-summary.md');
const AXE_SOURCE = fs.readFileSync(path.join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8');
const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

let passCount = 0;
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(SUMMARY, `# GUI smoke results\n\n- Site: ${BASE_URL || 'local dashboard (public/)'}\n- Captured: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC\n- Driver: Playwright ${requirePlaywrightVersion()}\n\n`);

function requirePlaywrightVersion(): string {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/playwright-core/package.json'), 'utf8')).version;
  } catch {
    return 'unknown';
  }
}

class SmokeFailure extends Error {}

function pass(label: string): void {
  passCount++;
  console.log(`PASS ${label}`);
  fs.appendFileSync(SUMMARY, `- PASS: ${label}\n`);
}

function fail(label: string): never {
  fs.appendFileSync(SUMMARY, `- FAIL: ${label}\n`);
  throw new SmokeFailure(label);
}

async function expectText(page: Page, selector: string, expected: string): Promise<void> {
  const loc = page.locator(selector).first();
  try {
    await loc.waitFor({ state: 'attached', timeout: 10_000 });
    await page.waitForFunction(
      ([sel, want]) => (document.querySelector(sel as string)?.textContent ?? '').includes(want as string),
      [selector, expected],
      { timeout: 10_000 },
    );
  } catch {
    const actual = (await loc.textContent().catch(() => null)) ?? '(missing)';
    fail(`${selector} did not contain "${expected}" (got "${actual.replace(/\s+/g, ' ').trim().slice(0, 160)}")`);
  }
}

async function expectExactText(page: Page, selector: string, expected: string, why: string): Promise<void> {
  const actual = ((await page.locator(selector).first().textContent().catch(() => null)) ?? '').trim();
  if (actual !== expected) fail(`${why} ("${actual}" instead of "${expected}")`);
}

async function expectPath(page: Page, base: string, pathPrefix: string): Promise<void> {
  try {
    await page.waitForURL((u) => u.toString().startsWith(base + pathPrefix), { timeout: 10_000 });
  } catch {
    fail(`expected ${base}${pathPrefix}, got ${page.url()}`);
  }
}

async function expectVisible(page: Page, selector: string): Promise<void> {
  try {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout: 10_000 });
  } catch {
    fail(`expected ${selector} to be visible`);
  }
}

async function evalTrue(page: Page, expression: string, why: string): Promise<void> {
  const ok = await page.evaluate(expression).catch(() => false);
  if (ok !== true) fail(why);
}

/** Pages whose axe audit found violations; the run fails at the end if any, after every page has been audited. */
const auditFailures: string[] = [];

/** Run axe on the current page. Violations are recorded and printed; the suite fails once all pages are done. */
async function audit(page: Page, label: string): Promise<void> {
  await page.evaluate(AXE_SOURCE);
  const result = (await page.evaluate(`axe.run(document, { resultTypes: ['violations'] })`)) as {
    violations: Array<{ id: string; impact: string; help: string; nodes: unknown[] }>;
    incomplete: unknown[];
  };
  if (result.violations.length) {
    for (const v of result.violations) {
      const where = (v.nodes as Array<{ target: string[] }>).slice(0, 3).map((n) => n.target.join(' ')).join(', ');
      console.error(`AXE ${label}: ${v.id} (${v.impact}): ${v.help} [${v.nodes.length} node(s): ${where}]`);
      fs.appendFileSync(SUMMARY, `- AXE FAIL: ${label}: ${v.id} (${v.impact}) at ${where}\n`);
    }
    auditFailures.push(`${label} (${result.violations.map((v) => v.id).join(', ')})`);
    return;
  }
  fs.appendFileSync(SUMMARY, `- AXE: ${label}: 0 violations (${result.incomplete.length} rule groups need manual review).\n`);
  pass(`axe accessibility audit: ${label}`);
}

async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: path.join(OUT_DIR, name) });
}

async function launch(): Promise<Browser> {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined;
  try {
    return await chromium.launch({ executablePath, headless: true });
  } catch (e) {
    if (!executablePath && fs.existsSync(MAC_CHROME)) return chromium.launch({ executablePath: MAC_CHROME, headless: true });
    throw e;
  }
}

/**
 * Audited journeys run with prefers-reduced-motion, so axe sees the settled page rather than a frame of a fade-in
 * (a half-faded label fails color contrast). It also checks that the site honours reduced motion.
 */
async function newPage(browser: Browser, opts: { acceptDownloads?: boolean; motion?: boolean } = {}): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: opts.acceptDownloads ?? false,
    reducedMotion: opts.motion ? 'no-preference' : 'reduce',
  });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  return { context, page };
}

// ---------------------------------------------------------------------------------------------------------------
// 1. Site: public site, sign-in disclosure, preview console
// ---------------------------------------------------------------------------------------------------------------
async function siteJourney(browser: Browser): Promise<void> {
  const { context, page } = await newPage(browser, { acceptDownloads: true });
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  try {
    // Home page
    await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
    await expectText(page, 'h1', 'Browser tests');
    await shot(page, 'marketing.png');
    await audit(page, 'marketing');
    await page.mouse.move(700, 320, { steps: 24 });
    await page.mouse.wheel(0, 560);
    await page.waitForTimeout(250);
    await shot(page, 'marketing-scroll.png');
    await page.mouse.wheel(0, -560);
    await page.locator('a[href="/login"]').first().click();
    await expectPath(page, BASE_URL, '/login');
    pass('home page renders and its Sign in link opens the sign-in page');

    // Sign-in page: a real form, plus the sample workspace link
    await expectVisible(page, 'input[type="email"]');
    await expectVisible(page, 'input[type="password"]');
    await expectVisible(page, '#demo-login');
    await shot(page, 'login.png');
    await audit(page, 'login');
    pass('sign-in form and sample workspace link are shown');

    // A same-origin allowlist must reject an off-site destination after sign-in.
    await page.goto(`${BASE_URL}/login?next=https%3A%2F%2Fevil.example`, { waitUntil: 'load' });
    await page.locator('#demo-login').click();
    await expectPath(page, BASE_URL, '/console');
    pass('sign-in redirect stays on the same origin');

    const unique = await consoleSections(page, pageErrors, 'console');

    // Run search reaches the runs view
    await page.locator('#open-run-search').click();
    await expectPath(page, BASE_URL, '/console#runs');
    pass('run search opens the runs view');

    // The evidence export is sample data and says so
    const exportButton = page.locator('#export-sample-evidence');
    if (await exportButton.count()) {
      await page.locator('#open-audit').click().catch(() => {});
      await page.waitForTimeout(300);
      if (await exportButton.isVisible()) {
        const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()]);
        const evidencePath = path.join(OUT_DIR, 'sample-evidence.json');
        await download.saveAs(evidencePath);
        const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
        if (evidence.previewData !== true) fail('sample evidence export is not labelled as preview data');
        pass('sample evidence export is labelled as preview data');
      }
    }

    await consoleAtPhoneWidth(page, unique, 'console');

    // Sign out
    await page.setViewportSize({ width: 1440, height: 900 });
    const signout = page.locator('[data-demo-signout]');
    if (await signout.count()) {
      await page.evaluate(() => (document.querySelector('[data-demo-signout]') as HTMLElement | null)?.click());
      await expectPath(page, BASE_URL, '/login');
      pass('signing out returns to the sign-in page');
    }
  } finally {
    await context.close();
  }
}

type NavItem = { nav: string; label: string };

/**
 * Every console section, found from the navigation itself so new sections are covered without editing this file:
 * a heading, some content, no page errors, a screenshot and an axe audit each.
 */
async function consoleSections(page: Page, pageErrors: string[], tag: string): Promise<NavItem[]> {
  await page.locator('#console-nav [data-nav]').first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => fail(`${tag}: no console navigation`));
  const navItems = await page.$$eval('#console-nav [data-nav]', (els) =>
    els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => ({ nav: e.getAttribute('data-nav') || '', label: (e.textContent || '').replace(/\s*\d+$/, '').replace(/\s+/g, ' ').trim() })));
  const unique = [...new Map(navItems.filter((n) => n.nav).map((n) => [n.nav, n])).values()];
  if (unique.length < 5) fail(`${tag}: navigation lists only ${unique.length} sections`);
  for (const item of unique) {
    const before = pageErrors.length;
    await page.locator(`#console-nav [data-nav="${item.nav}"]`).first().click();
    await page.waitForTimeout(500);
    const heading = ((await page.locator('#page-heading').first().textContent().catch(() => '')) ?? '').trim();
    if (!heading) fail(`${tag} section "${item.label}" shows no heading`);
    const visible = await page.evaluate(() => {
      const main = document.querySelector('main') ?? document.body;
      return (main as HTMLElement).innerText.trim().length;
    });
    if (visible < 40) fail(`${tag} section "${item.label}" rendered almost nothing`);
    if (pageErrors.length > before) fail(`${tag} section "${item.label}" threw: ${pageErrors.slice(before).join(' | ').slice(0, 200)}`);
    await shot(page, `${tag}-${item.nav}.png`);
    await audit(page, `${tag} ${item.label}`);
  }
  pass(`${tag}: all ${unique.length} sections open with a heading, content and no page errors`);
  return unique;
}

/** No sideways scrolling at phone width in any section. */
async function consoleAtPhoneWidth(page: Page, sections: NavItem[], tag: string): Promise<void> {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const item of sections) {
    await page.evaluate((nav) => (document.querySelector(`#console-nav [data-nav="${nav}"]`) as HTMLElement | null)?.click(), item.nav);
    await page.waitForTimeout(250);
    await evalTrue(page, 'document.documentElement.scrollWidth <= window.innerWidth', `${tag} section "${item.label}" scrolls sideways at 390px`);
  }
  await shot(page, `${tag}-mobile.png`);
  await audit(page, `${tag} mobile`);
  pass(`${tag}: no sideways scrolling at 390px in all ${sections.length} sections`);
  await page.setViewportSize({ width: 1440, height: 900 });
}

// ---------------------------------------------------------------------------------------------------------------
// 1b. The React console (console/src, built to public/app). Production serves it at /console; the local dashboard
//     serves it at /app/. It is opened in sample mode, as "Explore the demo" does.
// ---------------------------------------------------------------------------------------------------------------
async function appConsoleJourney(browser: Browser, consoleUrl: string): Promise<void> {
  const { context, page } = await newPage(browser);
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load' });
    await page.evaluate(() => window.sessionStorage.setItem('airlock-demo-session', 'preview'));
    await page.goto(consoleUrl, { waitUntil: 'load' });
    const sections = await consoleSections(page, pageErrors, 'app');
    await consoleAtPhoneWidth(page, sections, 'app');
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 2. Local dashboard saves the canvas clip as WebM
// ---------------------------------------------------------------------------------------------------------------
async function captureJourney(browser: Browser): Promise<void> {
  const { startDashboardServer } = await import('../src/dashboard/server.ts');
  const server = startDashboardServer({ compliance: { outputDir: './.airlock/compliance' } } as never, 0, OUT_DIR);
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const { context, page } = await newPage(browser, { motion: true });
  try {
    await page.goto(`${origin}/login?next=%2Fconsole`, { waitUntil: 'load' });
    await page.locator('#demo-login').click();
    await page.waitForTimeout(350);
    await page.locator('#console-nav [data-nav="integrations"]').first().click();
    await page.waitForTimeout(1100);
    await page.locator('#record-motion').scrollIntoViewIfNeeded();
    await page.locator('#record-motion').click();
    await page.waitForTimeout(6800);
    const status = (await page.locator('#motion-status').textContent()) ?? '';
    const expected = `Video saved: ${path.join(OUT_DIR, 'airlockqa-motion-preview.webm')}`;
    if (!status.includes(expected)) fail(`local dashboard did not save the canvas clip: ${status.trim()}`);
    const data = fs.readFileSync(path.join(OUT_DIR, 'airlockqa-motion-preview.webm'));
    if (data.subarray(0, 4).toString('hex') !== '1a45dfa3') fail('recording is not a WebM file');
    if (data.length <= 4096) fail('recording is empty or too small');
    pass('local dashboard saved a valid five-second Three.js WebM preview');
  } finally {
    await context.close();
    server.closeAllConnections?.();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 3. Local demo store: login, coupon and checkout forms
// ---------------------------------------------------------------------------------------------------------------
async function demoJourney(browser: Browser): Promise<void> {
  const { startDemoServer } = await import('../examples/demo-store/server.ts');
  const port = Number(process.env.DEMO_PORT || 3999);
  const probe = await fetch(`http://127.0.0.1:${port}/`).then(() => true, () => false);
  if (probe) fail(`local demo port ${port} is already in use`);
  const server = await startDemoServer(port);
  const origin = `http://127.0.0.1:${port}`;
  const { context, page } = await newPage(browser);
  try {
    await page.goto(`${origin}/`, { waitUntil: 'load' });
    const shopHidden = () => page.evaluate(`getComputedStyle(document.querySelector("#shop-section")).display === "none"`);
    if ((await shopHidden()) !== true) fail('local demo did not begin signed out');
    await shot(page, 'demo-login-form.png');
    await audit(page, 'demo-login');
    await page.locator('input[name="email"]').fill('not-an-email');
    await page.locator('input[name="password"]').fill('demo-only-password');
    await page.locator('#login-btn').click();
    await evalTrue(page, `document.querySelector("input[name=email]").validity.valid === false`, 'browser accepted an invalid email address');
    if ((await shopHidden()) !== true) fail('invalid login form opened the shop');
    pass('browser blocks malformed email before the login form submits');
    await page.locator('input[name="email"]').fill('qa-user@example.test');
    await page.locator('input[name="password"]').fill('demo-only-password');
    await page.locator('#login-btn').click();
    await expectText(page, '#auth-status', 'Logged in as admin@acme.com');
    if ((await shopHidden()) !== false) fail('valid login did not open the shop');
    await page.locator('#add-btn').click();
    await expectText(page, '#cart-count', '1');
    await page.locator('[data-testid="coupon-input"]').fill('EXPIRED');
    await page.locator('[data-testid="apply-coupon-btn"]').click();
    await expectText(page, '#coupon-status', 'Invalid or expired coupon code');
    await expectText(page, '#cart-total', '$50.00');
    await page.locator('[data-testid="coupon-input"]').fill('AIRLOCK20');
    await page.locator('[data-testid="apply-coupon-btn"]').click();
    await expectText(page, '#coupon-status', '20% discount applied');
    await expectText(page, '#cart-total', '$40.00');
    await shot(page, 'demo-checkout-form.png');
    await page.locator('#checkout-btn').click();
    await expectText(page, '#checkout-status', 'UNAUTHORIZED_PHANTOM_TOKEN_RECEIVED');
    await shot(page, 'demo-checkout-blocked.png');
    await audit(page, 'demo-checkout');
    pass('demo login, invalid and valid coupons, total calculation, and raw-phantom rejection');
  } finally {
    await context.close();
    const s = server as unknown as { close?: (cb?: () => void) => void; stop?: () => void };
    if (typeof s?.stop === 'function') s.stop();
    else if (typeof s?.close === 'function') await new Promise<void>((resolve) => s.close!(() => resolve()));
  }
}

async function main(): Promise<number> {
  const browser = await launch();
  let local: import('node:http').Server | undefined;
  try {
    if (ONLY.has('site')) {
      if (!BASE_URL) {
        const { startDashboardServer } = await import('../src/dashboard/server.ts');
        local = startDashboardServer({ compliance: { outputDir: './.airlock/compliance' } } as never, 0, OUT_DIR);
        await once(local, 'listening');
        BASE_URL = `http://127.0.0.1:${(local.address() as AddressInfo).port}`;
      }
      console.log(`site: ${BASE_URL}`);
      await siteJourney(browser);
      // Locally /console is the static preview console and the React console is at /app/; a deployment serves the
      // React console at /console, which siteJourney has just covered.
      if (local) {
        if (fs.existsSync(path.join(ROOT, 'public/app/index.html'))) await appConsoleJourney(browser, `${BASE_URL}/app/`);
        else fail('public/app is not built: run "bun run build" first (the React console is part of this suite)');
      }
    }
    if (ONLY.has('capture')) await captureJourney(browser);
    if (ONLY.has('demo')) await demoJourney(browser);
    if (auditFailures.length) fail(`accessibility violations on ${auditFailures.length} page(s): ${auditFailures.join('; ')}`);
  } catch (e) {
    const message = e instanceof SmokeFailure ? e.message : `unexpected error: ${(e as Error).message?.split('\n')[0]}`;
    if (!(e instanceof SmokeFailure)) fs.appendFileSync(SUMMARY, `- FAIL: ${message}\n`);
    console.error(`FAIL ${message}`);
    fs.appendFileSync(SUMMARY, `\n- Result: FAIL after ${passCount} checks\n`);
    return 1;
  } finally {
    await browser.close();
    if (local) {
      local.closeAllConnections?.();
      await new Promise<void>((resolve) => local!.close(() => resolve()));
    }
  }
  console.log(`\nCompleted ${passCount} GUI checks. Screenshots and recordings: ${OUT_DIR}`);
  fs.appendFileSync(SUMMARY, `\n- Result: PASS (${passCount} checks)\n`);
  return 0;
}

process.exit(await main());
