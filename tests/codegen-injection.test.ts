import { describe, expect, it } from 'bun:test';
import { AstGenerator } from '../src/compiler/ast-generator.js';
import { CapsuleManager } from '../src/teleport/capsule.js';
import type { ExecutionTrace, StateCapsule } from '../src/types/index.js';

const NASTY = `it's "quoted" \\ back\\slash\nnew line \u2028 ls */ \${x} \`tick\` '); process.exit(1); //`;

const transpiler = new Bun.Transpiler({ loader: 'ts' });

/** Parse the generated TypeScript; returns [] when it parses. */
function parseErrors(code: string): string[] {
  try {
    transpiler.transformSync(code);
    return [];
  } catch (err) {
    return [String((err as Error).message || err)];
  }
}

/**
 * Execute the generated spec against recording stubs (no real Playwright) and
 * return every string that reached a Playwright/Airlock call, plus whether any
 * code touched `process`.
 */
async function runGenerated(code: string): Promise<{ strings: string[]; touchedProcess: boolean }> {
  const js = transpiler
    .transformSync(code)
    .split('\n')
    .filter((line) => !/^import\s/.test(line))
    .join('\n');
  const strings: string[] = [];
  const collect = (v: unknown, depth = 0): void => {
    if (depth > 5) return;
    if (typeof v === 'string') strings.push(v);
    else if (Array.isArray(v)) v.forEach((x) => collect(x, depth + 1));
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        strings.push(k);
        collect(x, depth + 1);
      }
    }
  };
  const pending: Array<() => unknown> = [];
  // Only test-structure callbacks are run; browser-side callbacks (addInitScript) are not.
  const runCallbacksOf = new Set(['test', 'describe', 'beforeEach']);
  const recorder = (name = ''): any =>
    new Proxy(function () {}, {
      get: (_t, prop) => (prop === 'then' ? undefined : recorder(String(prop))),
      construct: () => recorder(),
      apply: (_t, _this, args) => {
        for (const a of args) {
          if (typeof a === 'function') {
            if (runCallbacksOf.has(name)) pending.push(() => a({ page: recorder(), context: recorder() }));
          } else collect(a);
        }
        return recorder();
      },
    });
  let touchedProcess = false;
  const fakeProcess = new Proxy({}, { get: () => { touchedProcess = true; return () => {}; } });
  const fn = new Function('test', 'expect', 'airlockLocator', 'AirlockRunner', 'CapsuleManager', 'process', 'page', js);
  fn(recorder('test'), recorder(), recorder(), recorder(), recorder(), fakeProcess, recorder());
  while (pending.length) await pending.shift()!();
  return { strings, touchedProcess };
}

describe('AstGenerator: string literal injection', () => {
  const trace: ExecutionTrace = {
    id: `trace_${NASTY}`,
    suiteName: NASTY,
    targetUrl: 'http://localhost',
    startTime: new Date().toISOString(),
    steps: [
      { index: 1, type: 'goto', url: `http://localhost/${NASTY}`, timestamp: '' },
      {
        index: 2,
        type: 'click',
        target: { css: `#a[data-x="${NASTY}"]`, tagName: 'button', dataTestId: NASTY, textContent: NASTY, attributes: {} },
        timestamp: '',
      },
      {
        index: 3,
        type: 'click',
        target: { css: NASTY, tagName: 'div', ariaRole: NASTY, ariaName: NASTY, attributes: {} },
        timestamp: '',
      },
      { index: 4, type: 'click', target: { css: NASTY, tagName: 'a', textContent: NASTY, attributes: {} }, timestamp: '' },
      { index: 5, type: 'fill', target: { css: NASTY, tagName: 'input', attributes: {} }, value: NASTY, timestamp: '' },
      { index: 6, type: 'press', value: NASTY, timestamp: '' },
      { index: 7, type: 'select', target: { css: 'select', tagName: 'select', attributes: {} }, value: NASTY, timestamp: '' },
      { index: 8, type: 'assert_text', target: { css: 'p', tagName: 'p', attributes: {} }, expected: NASTY, timestamp: '' },
      { index: 9, type: 'assert_url', expected: NASTY, timestamp: '' },
      { index: 10, type: 'checkpoint', checkpointName: NASTY, timestamp: '' },
    ],
  } as ExecutionTrace;

  it('generates code that parses and keeps every value intact', async () => {
    const code = new AstGenerator().compileToSpec(trace);
    expect(parseErrors(code)).toEqual([]);
    const { strings, touchedProcess } = await runGenerated(code);
    expect(touchedProcess).toBe(false);
    expect(strings).toContain(NASTY); // suite title, test id, aria, text, fill, press, select, assertions, checkpoint
    expect(strings.filter((v) => v === NASTY).length).toBeGreaterThanOrEqual(10);
    expect(strings).toContain(`http://localhost/${NASTY}`);
    expect(strings).toContain(`#a[data-x="${NASTY}"]`);
    expect(strings).toContain(`deterministic run for ${NASTY}`);
  });

  it('uses the suite title option safely', async () => {
    const code = new AstGenerator().compileToSpec(trace, { suiteTitle: NASTY });
    expect(parseErrors(code)).toEqual([]);
    const { strings, touchedProcess } = await runGenerated(code);
    expect(touchedProcess).toBe(false);
    expect(strings).toContain(NASTY);
  });
});

describe('CapsuleManager.synthesizeReproSpec: string literal injection', () => {
  const capsule: StateCapsule = {
    capsuleId: `capsule_${NASTY}`,
    timestamp: NASTY,
    appVersion: '1',
    environment: 'production',
    url: `https://app.test/p'ath/${encodeURIComponent('"x"')}?q=${NASTY}`,
    userAgent: 'ua',
    viewport: { width: 1, height: 1 },
    events: [],
    crash: { message: NASTY, stack: NASTY, timestamp: 0 },
    storage: {
      localStorage: { [NASTY]: NASTY, '</script>': '<!--' },
      sessionStorage: {},
      cookies: [],
    },
    checksum: 'x',
  };

  it('generates code that parses and keeps every value intact', async () => {
    const code = CapsuleManager.synthesizeReproSpec(capsule);
    expect(parseErrors(code)).toEqual([]);
    const { strings, touchedProcess } = await runGenerated(code);
    expect(touchedProcess).toBe(false);
    expect(strings).toContain(capsule.url);
    expect(strings).toContain(`Reproduction: ${capsule.capsuleId}`);
    expect(strings).toContain(new URL(capsule.url).pathname);
    expect(strings).toContain(NASTY); // localStorage key and value
    expect(strings).toContain('</script>');
  });
});
