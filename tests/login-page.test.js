import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, setDefaultTimeout } from 'bun:test';
import { once } from 'node:events';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { chromium } from 'playwright-core';
import { startDashboardServer } from '../src/dashboard/server.js';

setDefaultTimeout(60_000);

const macChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chromePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (fs.existsSync(macChromePath) ? macChromePath : undefined);

const SESSION = { user: { id: 'u1', email: 'maya@example.com', name: 'Maya' }, workspace: { id: 'w1', name: 'Maya workspace', plan: 'free' } };

describe('Login and create-account page', () => {
  let browser;
  let server;
  let origin;
  let tempRoot;

  beforeAll(async () => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-login-page-'));
    // Same flags as tests/console-live.test.js, which runs reliably on the Linux CI runner.
    browser = await chromium.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  });

  // A fresh dashboard server for every test, as tests/dashboard-static.test.js does: a single server shared by the
  // whole file stopped accepting connections partway through on Linux CI.
  beforeEach(async () => {
    server = startDashboardServer({ compliance: { outputDir: path.join(tempRoot, 'compliance') } }, 0, path.join(tempRoot, 'artifacts'));
    await once(server, 'listening');
    origin = 'http://127.0.0.1:' + server.address().port;
  });

  afterEach(async () => {
    if (server) {
      server.closeAllConnections?.();
      await new Promise((resolve) => server.close(() => resolve()));
      server = undefined;
    }
  });

  afterAll(async () => {
    if (browser) await browser.close();
    if (tempRoot) fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  /**
   * Opens a page whose /api/** calls are answered by `handlers`, a map of "METHOD /path" to
   * (request, state) => { status, body?, delayMs? }. /console is stubbed so redirects can be asserted.
   */
  async function openPage(search, handlers, state = { signedIn: false }) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const apiCalls = [];
    await page.route('**/api/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const key = request.method() + ' ' + url.pathname.replace(/^\/api/, '');
      const body = request.postData() ? JSON.parse(request.postData()) : undefined;
      apiCalls.push({ key, body, headers: request.headers() });
      let handler = handlers[key];
      if (!handler && key === 'GET /v1/auth/me') {
        handler = () => (state.signedIn ? { status: 200, body: SESSION } : { status: 401, body: { code: 'UNAUTHENTICATED', message: 'Sign in first.' } });
      }
      if (!handler) handler = () => ({ status: 404, body: { code: 'NOT_FOUND', message: 'No mock for ' + key } });
      const result = await handler(body, state);
      if (result.delayMs) await new Promise((resolve) => setTimeout(resolve, result.delayMs));
      await route.fulfill({
        status: result.status,
        contentType: 'application/json',
        body: result.body === undefined ? '' : JSON.stringify(result.body),
      });
    });
    await page.route((url) => url.pathname === '/console', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Console stub</title><h1>Console stub</h1>' })
    );
    await page.goto(origin + '/login' + search);
    return { context, page, apiCalls, state };
  }

  async function fillAndSubmit(page, { email, password, name }) {
    if (name !== undefined) await page.fill('#auth-name', name);
    await page.fill('#auth-email', email);
    await page.fill('#auth-password', password);
    await page.click('#auth-submit');
  }

  it('signs in, sends the CSRF header and goes to /console', async () => {
    const { context, page, apiCalls, state } = await openPage('', {
      'POST /v1/auth/login': (body, s) => {
        s.signedIn = true;
        return { status: 200, body: SESSION };
      },
    });
    try {
      expect(await page.textContent('#si-title')).toBe('Sign in to Airlock Cloud');
      expect(await page.isVisible('#auth-name')).toBe(false);
      await fillAndSubmit(page, { email: 'maya@example.com', password: 'a-long-enough-password' });
      await page.waitForURL(origin + '/console');
      const login = apiCalls.find((call) => call.key === 'POST /v1/auth/login');
      expect(login.body).toEqual({ email: 'maya@example.com', password: 'a-long-enough-password' });
      expect(login.headers['x-airlock-csrf']).toBe('1');
      expect(state.signedIn).toBe(true);
    } finally {
      await context.close();
    }
  });

  it('keeps the user on the page with an accessible error after a wrong password, and disables submit while pending', async () => {
    const { context, page } = await openPage('', {
      'POST /v1/auth/login': () => ({ status: 401, delayMs: 300, body: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } }),
    });
    try {
      await fillAndSubmit(page, { email: 'maya@example.com', password: 'wrong-password-1' });
      await page.waitForSelector('#auth-submit[disabled]');
      expect(await page.getAttribute('#auth-submit', 'aria-busy')).toBe('true');
      await page.waitForSelector('#auth-error:not([hidden])');
      expect(await page.getAttribute('#auth-error', 'role')).toBe('alert');
      expect(await page.textContent('#auth-error')).toContain('do not match');
      expect(await page.isDisabled('#auth-submit')).toBe(false);
      expect(await page.getAttribute('#auth-password', 'aria-invalid')).toBe('true');
      expect(await page.evaluate(() => document.activeElement && document.activeElement.id)).toBe('auth-password');
      expect(new URL(page.url()).pathname).toBe('/login');
    } finally {
      await context.close();
    }
  });

  it('opens the create-account form for ?mode=signup and states that email is not verified', async () => {
    const { context, page } = await openPage('?mode=signup', {});
    try {
      expect(await page.textContent('#si-title')).toBe('Create your free account');
      expect(await page.isVisible('#auth-name')).toBe(true);
      expect(await page.textContent('#password-rule')).toContain('10 characters');
      const note = await page.textContent('#signup-note');
      expect(note).toContain('not verified');
      expect(note).toContain('no emails');
      expect(await page.textContent('#auth-submit')).toBe('Create account');
      // Switching back and forth works and updates the URL.
      await page.click('#mode-signin');
      expect(await page.textContent('#si-title')).toBe('Sign in to Airlock Cloud');
      expect(await page.isVisible('#signup-note')).toBe(false);
      expect(new URL(page.url()).searchParams.get('mode')).toBeNull();
      await page.click('#switch-mode');
      expect(await page.textContent('#si-title')).toBe('Create your free account');
      expect(new URL(page.url()).searchParams.get('mode')).toBe('signup');
    } finally {
      await context.close();
    }
  });

  it('validates the create-account form before calling the API', async () => {
    const { context, page, apiCalls } = await openPage('?mode=signup', {});
    try {
      await fillAndSubmit(page, { email: 'new@example.com', password: 'short' });
      await page.waitForSelector('#auth-error:not([hidden])');
      expect(await page.textContent('#auth-error')).toContain('at least 10 characters');
      expect(await page.evaluate(() => document.activeElement && document.activeElement.id)).toBe('auth-password');
      await page.fill('#auth-email', 'not-an-email');
      await page.click('#auth-submit');
      expect(await page.textContent('#auth-error')).toContain('valid email');
      expect(apiCalls.some((call) => call.key === 'POST /v1/auth/signup')).toBe(false);
    } finally {
      await context.close();
    }
  });

  it('creates an account, sending the optional name, and goes to /console', async () => {
    const { context, page, apiCalls } = await openPage('?mode=signup', {
      'POST /v1/auth/signup': (body, s) => {
        s.signedIn = true;
        return { status: 201, body: SESSION };
      },
    });
    try {
      await fillAndSubmit(page, { name: 'Maya', email: 'maya@example.com', password: 'a-long-enough-password' });
      await page.waitForURL(origin + '/console');
      const signup = apiCalls.find((call) => call.key === 'POST /v1/auth/signup');
      expect(signup.body).toEqual({ email: 'maya@example.com', password: 'a-long-enough-password', name: 'Maya' });
    } finally {
      await context.close();
    }
  });

  it('shows EMAIL_TAKEN, WEAK_PASSWORD, RATE_LIMITED, SIGNUPS_PAUSED and network errors', async () => {
    const responses = [
      { status: 409, body: { code: 'EMAIL_TAKEN', message: 'taken' } },
      { status: 400, body: { code: 'WEAK_PASSWORD', message: 'That password is too common.' } },
      { status: 429, body: { code: 'RATE_LIMITED', message: 'slow down' } },
      { status: 503, body: { code: 'SIGNUPS_PAUSED', message: 'paused' } },
    ];
    let index = 0;
    const { context, page } = await openPage('?mode=signup', {});
    await page.unroute('**/api/**');
    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/api/v1/auth/me') {
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'UNAUTHENTICATED', message: 'x' }) });
      }
      const next = responses[index++];
      return route.fulfill({ status: next.status, contentType: 'application/json', body: JSON.stringify(next.body) });
    });
    try {
      await page.fill('#auth-email', 'maya@example.com');
      await page.fill('#auth-password', 'a-long-enough-password');
      const expectations = [
        ['already exists', 'auth-email'],
        ['too common', 'auth-password'],
        ['Too many attempts', null],
        ['paused', null],
        ['Cannot reach Airlock Cloud', null],
      ];
      for (const [text, focusId] of expectations) {
        // A network outage is simulated inside the page: asking Chromium to abort the request crashed the
        // browser under bun test on Linux CI, and the page's own handling of a rejected fetch is what matters.
        if (text === 'Cannot reach Airlock Cloud') {
          await page.evaluate(() => { window.fetch = () => Promise.reject(new TypeError('Failed to fetch')); });
        }
        await page.click('#auth-submit');
        await page.waitForFunction((expected) => {
          const box = document.getElementById('auth-error');
          return !box.hidden && box.textContent.includes(expected) && !document.getElementById('auth-submit').disabled;
        }, text);
        if (focusId) expect(await page.evaluate(() => document.activeElement.id)).toBe(focusId);
        expect(new URL(page.url()).pathname).toBe('/login');
      }
      expect(await page.textContent('#auth-error')).toContain('Check your connection');
    } finally {
      await context.close();
    }
  });

  it('treats an HTML 429 from the proxy as rate limiting, not a server fault', async () => {
    const { context, page } = await openPage('', {});
    await page.unroute('**/api/**');
    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/api/v1/auth/me') {
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'UNAUTHENTICATED', message: 'x' }) });
      }
      return route.fulfill({ status: 429, contentType: 'text/html', headers: { 'Retry-After': '120' }, body: '<html>429 Too Many Requests</html>' });
    });
    try {
      await page.fill('#auth-email', 'maya@example.com');
      await page.fill('#auth-password', 'a-long-enough-password');
      await page.click('#auth-submit');
      await page.waitForFunction(() => {
        const box = document.getElementById('auth-error');
        return !box.hidden && box.textContent.includes('Too many attempts') && box.textContent.includes('2 minutes');
      });
    } finally {
      await context.close();
    }
  });

  it('honours a same-origin /console next path after sign-in', async () => {
    const { context, page } = await openPage('?next=' + encodeURIComponent('/console?view=keys#top'), {
      'POST /v1/auth/login': (body, s) => {
        s.signedIn = true;
        return { status: 200, body: SESSION };
      },
    });
    try {
      await fillAndSubmit(page, { email: 'maya@example.com', password: 'a-long-enough-password' });
      await page.waitForURL(origin + '/console?view=keys#top');
    } finally {
      await context.close();
    }
  });

  it('ignores open-redirect attempts in ?next=', async () => {
    const attempts = [
      'https://evil.example/console',
      '//evil.example/console',
      'javascript:alert(1)',
      '/\\evil.example',
      '/login',
      '/console/../admin',
      'http://127.0.0.1.evil.example/console',
    ];
    for (const attempt of attempts) {
      const { context, page } = await openPage('?next=' + encodeURIComponent(attempt), {
        'POST /v1/auth/login': (body, s) => {
          s.signedIn = true;
          return { status: 200, body: SESSION };
        },
      });
      try {
        await fillAndSubmit(page, { email: 'maya@example.com', password: 'a-long-enough-password' });
        await page.waitForURL((url) => url.pathname === '/console' && url.origin === origin);
        expect(page.url()).toBe(origin + '/console');
      } finally {
        await context.close();
      }
    }
  });

  it('skips the form when a session already exists', async () => {
    const { context, page } = await openPage('', {}, { signedIn: true });
    try {
      await page.waitForURL(origin + '/console');
    } finally {
      await context.close();
    }
  });

  it('stays on the form when the service is unreachable', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.addInitScript(() => { window.fetch = () => Promise.reject(new TypeError('Failed to fetch')); });
    try {
      await page.goto(origin + '/login');
      await page.waitForSelector('#auth-form');
      await page.waitForTimeout(300);
      expect(new URL(page.url()).pathname).toBe('/login');
    } finally {
      await context.close();
    }
  });

  it('still opens the sample workspace in preview mode', async () => {
    const { context, page } = await openPage('', {});
    try {
      expect(await page.textContent('#demo-login')).toContain('Explore the sample workspace');
      await page.click('#demo-login');
      await page.waitForURL(origin + '/console');
      expect(await page.evaluate(() => window.sessionStorage.getItem('airlock-demo-session'))).toBe('preview');
    } finally {
      await context.close();
    }
  });

  it('does not imply GitHub, SSO or email-link sign-in', async () => {
    const { context, page } = await openPage('', {});
    try {
      const text = (await page.textContent('body')).toLowerCase();
      for (const word of ['github', 'sso', 'magic link', 'single sign-on', 'google']) {
        expect(text).not.toContain(word);
      }
    } finally {
      await context.close();
    }
  });
});
