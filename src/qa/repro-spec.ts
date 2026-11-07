/** Teleport-lite: a Playwright repro spec built from a failed run's own steps. Every value is a JSON string literal. */
export type ReproStep =
  | { action: 'goto'; url: string }
  | { action: 'click'; css: string }
  | { action: 'fill'; css: string; value: string };

export interface ReproInput {
  title: string;
  steps: ReproStep[];
  expectation: string;
}


const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);
const BS = String.fromCharCode(92);
const lit = (v: string): string => JSON.stringify(v).split(LS).join(BS + 'u2028').split(PS).join(BS + 'u2029');
const comment = (v: string): string => v.replace(/[\r\n]+/g, ' ').split(LS).join(' ').split(PS).join(' ').split('*' + '/').join('*' + ' /');

/** Same denylist idea as the explorer: a repro never clicks a destructive control. */
const DESTRUCTIVE = /(delete|remove|wipe|deactivate|cancel|pay|purchase|checkout|place-?order|transfer|refund)/i;

export function reproSpecFromSteps(input: ReproInput): string {
  if (input.steps.length === 0) throw new Error('no steps to reproduce');
  const lines: string[] = [];
  for (const [i, step] of input.steps.entries()) {
    const n = i + 1;
    switch (step.action) {
      case 'goto':
        lines.push(`  // step ${n}: goto`, `  await page.goto(${lit(step.url)});`);
        break;
      case 'click':
        if (DESTRUCTIVE.test(step.css)) {
          lines.push(`  // step ${n}: skipped a destructive step; a repro never activates it`);
        } else {
          lines.push(`  // step ${n}: click`, `  await page.locator(${lit(step.css)}).click();`);
        }
        break;
      case 'fill':
        lines.push(`  // step ${n}: fill`, `  await page.locator(${lit(step.css)}).fill(${lit(step.value)});`);
        break;
      default:
        throw new Error(`unknown action in a repro step`);
    }
  }
  return `import { test, expect } from '@playwright/test';

// Repro generated from a failed QA run. Expected: ${comment(input.expectation)}
test(${lit(input.title)}, async ({ page }) => {
${lines.join('\n')}
  // expectation: ${comment(input.expectation)}
});
`;
}
