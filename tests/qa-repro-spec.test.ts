import { describe, expect, it } from 'bun:test';
import { reproSpecFromSteps } from '../src/qa/repro-spec.js';

const transpiler = new Bun.Transpiler({ loader: 'ts' });
const NASTY = `it's "quoted" \\ back\\slash\nnew line   */ \${x} \`tick\``;

function parses(code: string): boolean {
  try {
    transpiler.transformSync(code);
    return true;
  } catch {
    return false;
  }
}

describe('repro spec from a failed run\'s steps', () => {
  it('produces a spec that parses and reproduces each step in order', () => {
    const code = reproSpecFromSteps({
      title: 'checkout double submit',
      steps: [
        { action: 'goto', url: 'https://staging1.stg.qbrin.cloud/shop' },
        { action: 'fill', css: '#email', value: 'qa.user@example.test' },
        { action: 'click', css: 'button#confirm' },
        { action: 'click', css: 'button#confirm' },
      ],
      expectation: 'exactly one order exists',
    });
    expect(parses(code)).toBe(true);
    expect(code.indexOf("page.goto(")).toBeLessThan(code.indexOf(".click()"));
    expect(code).toContain('exactly one order exists');
  });

  it('escapes every value so quotes, backslashes, newlines and template syntax cannot break out', () => {
    const code = reproSpecFromSteps({
      title: NASTY,
      steps: [
        { action: 'fill', css: NASTY, value: NASTY },
        { action: 'click', css: NASTY },
      ],
      expectation: NASTY,
    });
    expect(parses(code)).toBe(true);
    const LS = String.fromCharCode(0x2028);
    const BS = String.fromCharCode(92);
    expect(code).toContain(JSON.stringify(NASTY).split(LS).join(BS + 'u2028'));
  });

  it('refuses an unknown action rather than writing it into the spec', () => {
    expect(() => reproSpecFromSteps({ title: 't', steps: [{ action: 'eval' as any, css: 'x' }], expectation: 'e' })).toThrow(/unknown action/);
  });

  it('refuses a spec with no steps', () => {
    expect(() => reproSpecFromSteps({ title: 't', steps: [], expectation: 'e' })).toThrow(/no steps/);
  });

  it('a destructive control in the steps is kept out of the repro and noted, not clicked', () => {
    const code = reproSpecFromSteps({
      title: 't',
      steps: [{ action: 'click', css: '#delete-account' }, { action: 'click', css: '#save' }],
      expectation: 'e',
    });
    expect(code).not.toContain('#delete-account');
    expect(code).toContain('#save');
    expect(code).toMatch(/skipped a destructive step/);
  });
});
