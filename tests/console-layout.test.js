import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, setDefaultTimeout } from 'bun:test';
import { once } from 'node:events';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { chromium } from 'playwright-core';
import { startDashboardServer } from '../src/dashboard/server.js';

setDefaultTimeout(60_000);

const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (fs.existsSync(macChrome) ? macChrome : undefined);

let browser;
let server;
let tempRoot;
let origin;

beforeAll(async () => {
  tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-console-layout-'));
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
});

// A fresh server per test, as in the other browser tests.
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

/** Opens the console in sample mode at a given window size. */
async function openConsole(width, height, hash = '#explorer') {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'UNAUTHENTICATED', message: 'Sign in first.' }) })
  );
  await page.addInitScript(() => window.sessionStorage.setItem('airlock-demo-session', 'preview'));
  await page.goto(origin + '/console' + hash);
  await page.waitForSelector('#sample-banner:not([hidden])');
  // Let the view's entrance animation finish so measurements are settled. Only that one: some pages have looping
  // status animations that never finish.
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .filter((a) => a.effect && a.effect.target && a.effect.target.classList && a.effect.target.classList.contains('view-panel'))
      .every((a) => a.playState === 'finished')
  );
  return { context, page };
}

const geometry = (page) =>
  page.evaluate(() => {
    const aside = document.querySelector('.cx > aside').getBoundingClientRect();
    const main = document.querySelector('.main-shell').getBoundingClientRect();
    return {
      asideLeft: aside.left,
      asideRight: aside.right,
      asideTop: aside.top,
      asideBottom: aside.bottom,
      mainLeft: main.left,
      mainRight: main.right,
      viewport: innerWidth,
      height: innerHeight,
      overflowX: document.documentElement.scrollWidth > innerWidth,
    };
  });

describe('console layout on wide screens', () => {
  for (const [width, height] of [[1800, 900], [1440, 900], [1000, 800]]) {
    it(`puts the content directly beside the sidebar at ${width}px, with no empty gutter`, async () => {
      const { context, page } = await openConsole(width, height);
      try {
        const g = await geometry(page);
        expect(g.mainLeft).toBe(g.asideRight);
        expect(g.mainRight).toBe(g.viewport);
        expect(g.overflowX).toBe(false);
        expect(g.asideRight).toBeLessThan(300);
      } finally {
        await context.close();
      }
    });
  }

  it('keeps the sidebar in view while a long page scrolls', async () => {
    const { context, page } = await openConsole(1440, 560);
    try {
      expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 200)).toBe(true);
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForFunction(() => scrollY > 100);
      const g = await geometry(page);
      expect(g.asideTop).toBe(0);
      expect(g.asideBottom).toBe(g.height);
    } finally {
      await context.close();
    }
  });
});

describe('console navigation state', () => {
  const cases = [
    ['#overview', 'overview', 'Overview'],
    ['#runs', 'runs', 'Runs'],
    ['#explorer', 'explorer', 'Tests'],
  ];
  for (const [hash, nav, crumb] of cases) {
    it(`marks exactly one item as the current page for ${hash}`, async () => {
      const { context, page } = await openConsole(1440, 900, hash);
      try {
        await page.waitForFunction(() =>
          [...document.querySelectorAll('.cx > aside nav a.cn-item')].filter((a) => getComputedStyle(a).backgroundColor === 'rgb(226, 242, 233)').length === 1
        );
        const state = await page.evaluate(() => {
          const links = [...document.querySelectorAll('.cx > aside nav a.cn-item')];
          return {
            current: links.filter((a) => a.getAttribute('aria-current') === 'page').map((a) => a.dataset.nav),
            highlighted: links.filter((a) => getComputedStyle(a).backgroundColor === 'rgb(226, 242, 233)').map((a) => a.dataset.nav),
            crumb: document.querySelector('nav[aria-label="Breadcrumb"] [aria-current="page"]')?.textContent.trim(),
          };
        });
        expect(state.current).toEqual([nav]);
        expect(state.highlighted).toEqual([nav]);
        expect(state.crumb).toBe(crumb);
      } finally {
        await context.close();
      }
    });
  }

  it('moves the highlight when the user navigates', async () => {
    const { context, page } = await openConsole(1440, 900, '#overview');
    try {
      await page.click('.cx > aside nav a[data-nav="runs"]');
      // The highlight fades over a fraction of a second, so wait for it to settle on the new page only.
      await page.waitForFunction(() => {
        const marked = [...document.querySelectorAll('.cx > aside nav a.cn-item')]
          .filter((a) => getComputedStyle(a).backgroundColor === 'rgb(226, 242, 233)')
          .map((a) => a.dataset.nav);
        return marked.length === 1 && marked[0] === 'runs';
      });
      expect(await page.evaluate(() => document.querySelector('.cx > aside nav a[data-nav="runs"]').getAttribute('aria-current'))).toBe('page');
      expect(await page.evaluate(() => document.querySelector('.cx > aside nav a[data-nav="overview"]').getAttribute('aria-current'))).not.toBe('page');
    } finally {
      await context.close();
    }
  });
});

describe('console on a phone', () => {
  const visibleNavLinks = (page) =>
    page.evaluate(() => [...document.querySelectorAll('.cx > aside nav a')].filter((a) => a.offsetParent !== null).length);

  it('shows the page first, behind a collapsed menu', async () => {
    const { context, page } = await openConsole(390, 800);
    try {
      const state = await page.evaluate(() => ({
        toggleShown: getComputedStyle(document.getElementById('nav-toggle')).display !== 'none',
        expanded: document.getElementById('nav-toggle').getAttribute('aria-expanded'),
        headingTop: document.querySelector('main h1, h1').getBoundingClientRect().top,
        asideHeight: document.querySelector('.cx > aside').getBoundingClientRect().height,
        overflowX: document.documentElement.scrollWidth > innerWidth,
      }));
      expect(state.toggleShown).toBe(true);
      expect(state.expanded).toBe('false');
      expect(await visibleNavLinks(page)).toBe(1); // only the brand link
      expect(state.asideHeight).toBeLessThan(120);
      expect(state.headingTop).toBeLessThan(500); // the content starts on the first screen
      expect(state.overflowX).toBe(false);
    } finally {
      await context.close();
    }
  });

  it('opens and closes the menu with the button, a link and Escape', async () => {
    const { context, page } = await openConsole(390, 800);
    try {
      await page.click('#nav-toggle');
      expect(await page.getAttribute('#nav-toggle', 'aria-expanded')).toBe('true');
      expect(await page.textContent('#nav-toggle')).toBe('Close');
      expect(await visibleNavLinks(page)).toBeGreaterThan(10);

      await page.click('.cx > aside nav a[data-nav="runs"]');
      await page.waitForFunction(() => document.getElementById('nav-toggle').getAttribute('aria-expanded') === 'false');
      expect(await visibleNavLinks(page)).toBe(1);

      await page.click('#nav-toggle');
      await page.keyboard.press('Escape');
      expect(await page.getAttribute('#nav-toggle', 'aria-expanded')).toBe('false');
      expect(await page.evaluate(() => document.activeElement.id)).toBe('nav-toggle');
    } finally {
      await context.close();
    }
  });

  it('restores the full sidebar when the window grows', async () => {
    const { context, page } = await openConsole(390, 800);
    try {
      await page.click('#nav-toggle');
      await page.setViewportSize({ width: 1300, height: 800 });
      await page.waitForFunction(() => getComputedStyle(document.getElementById('nav-toggle')).display === 'none');
      expect(await page.evaluate(() => document.querySelector('.cx > aside').hasAttribute('data-open'))).toBe(false);
      expect(await visibleNavLinks(page)).toBeGreaterThan(10);
    } finally {
      await context.close();
    }
  });
});
