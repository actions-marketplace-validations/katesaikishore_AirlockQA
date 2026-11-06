import * as fs from 'node:fs';
import * as path from 'node:path';
import { z } from 'zod';
import type { Page } from 'playwright-core';
import type { ForkVariation } from '../types/index.js';

/**
 * Input for `airlock fork`: which field to fill, what to click afterwards, the values to try and
 * what each variation must show to pass. Comes from CLI flags or a JSON file.
 */

const ExpectationSchema = z
  .object({
    /** Selector that must become visible after the action. With `text`, the element whose text is checked. */
    selector: z.string().min(1).optional(),
    /** Text that must appear (in `selector`, or anywhere in the page body when no selector is given). */
    text: z.string().optional(),
  })
  .refine((e) => e.selector !== undefined || e.text !== undefined, 'expect needs a selector or text');

const VariationInputSchema = z.object({
  id: z.string().min(1).optional(),
  description: z.string().optional(),
  value: z.string(),
  expect: ExpectationSchema.optional(),
});

export const ForkPlanFileSchema = z.union([
  z.array(VariationInputSchema).min(1),
  z.object({
    inputSelector: z.string().min(1).optional(),
    actionSelector: z.string().min(1).optional(),
    expect: ExpectationSchema.optional(),
    variations: z.array(VariationInputSchema).min(1),
  }),
]);

export type ForkExpectation = z.infer<typeof ExpectationSchema>;

export interface PlannedVariation extends ForkVariation {
  value: string;
  expect?: ForkExpectation;
}

export interface ForkPlan {
  inputSelector: string;
  actionSelector?: string;
  variations: PlannedVariation[];
}

export interface ForkPlanOptions {
  variationsFile?: string;
  values?: string;
  input?: string;
  action?: string;
  expectText?: string;
  expectSelector?: string;
  workers?: number;
  cwd?: string;
}

function slug(value: string, index: number): string {
  const s = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').substring(0, 24);
  return `var_${index + 1}${s ? `_${s}` : '_empty'}`;
}

/** Build a fork plan from CLI flags and/or a JSON file. Flags override values from the file. */
export function buildForkPlan(options: ForkPlanOptions): ForkPlan {
  let inputSelector = options.input;
  let actionSelector = options.action;
  let sharedExpect: ForkExpectation | undefined;
  let rawVariations: z.infer<typeof VariationInputSchema>[] = [];

  if (options.variationsFile) {
    const full = path.resolve(options.cwd || process.cwd(), options.variationsFile);
    if (!fs.existsSync(full)) throw new Error(`Variations file not found: ${full}`);
    const parsed = ForkPlanFileSchema.safeParse(JSON.parse(fs.readFileSync(full, 'utf8')));
    if (!parsed.success) {
      throw new Error(`Invalid variations file ${full}: ${parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')}`);
    }
    if (Array.isArray(parsed.data)) {
      rawVariations = parsed.data;
    } else {
      inputSelector = inputSelector || parsed.data.inputSelector;
      actionSelector = actionSelector || parsed.data.actionSelector;
      sharedExpect = parsed.data.expect;
      rawVariations = parsed.data.variations;
    }
  }

  if (options.values !== undefined) {
    rawVariations = options.values.split(',').map((value) => ({ value }));
  }

  const flagExpect: ForkExpectation | undefined =
    options.expectSelector || options.expectText !== undefined
      ? { selector: options.expectSelector, text: options.expectText }
      : undefined;

  if (!inputSelector) throw new Error('No input selector. Pass --input <selector> or set "inputSelector" in the variations file.');
  if (rawVariations.length === 0) throw new Error('No variations. Pass --values a,b,c or --variations <file.json>.');

  const limit = options.workers && options.workers > 0 ? options.workers : rawVariations.length;
  const variations = rawVariations.slice(0, limit).map((v, i): PlannedVariation => ({
    id: v.id || slug(v.value, i),
    description: v.description || `Fill ${inputSelector} with ${JSON.stringify(v.value.length > 40 ? `${v.value.substring(0, 40)}…` : v.value)}`,
    inputOverrides: { value: v.value },
    expectedOutcome: 'pass',
    value: v.value,
    expect: flagExpect || v.expect || sharedExpect,
  }));

  return { inputSelector, actionSelector, variations };
}

/** Fill, click and check one variation. Every action and expectation counts as an assertion. */
export async function runForkVariation(
  page: Page,
  plan: ForkPlan,
  variation: PlannedVariation,
  timeoutMs = 5000
): Promise<{ success: boolean; assertionsPassed: number; assertionsTotal: number; error?: string }> {
  const checks: Array<{ name: string; run: () => Promise<void> }> = [
    { name: `fill ${plan.inputSelector}`, run: () => page.locator(plan.inputSelector).fill(variation.value, { timeout: timeoutMs }) },
  ];
  if (plan.actionSelector) {
    const actionSelector = plan.actionSelector;
    checks.push({ name: `click ${actionSelector}`, run: () => page.locator(actionSelector).click({ timeout: timeoutMs }) });
  }
  const expectation = variation.expect;
  if (expectation?.selector && expectation.text === undefined) {
    const sel = expectation.selector;
    checks.push({ name: `${sel} visible`, run: () => page.locator(sel).first().waitFor({ state: 'visible', timeout: timeoutMs }) });
  } else if (expectation?.text !== undefined) {
    const sel = expectation.selector || 'body';
    const text = expectation.text;
    checks.push({
      name: `${sel} contains ${JSON.stringify(text)}`,
      run: async () => {
        const deadline = Date.now() + timeoutMs;
        let actual = '';
        while (true) {
          actual = (await page.locator(sel).first().innerText({ timeout: 1000 }).catch(() => '')).trim();
          if (actual.includes(text)) return;
          if (Date.now() >= deadline) throw new Error(`expected ${sel} to contain ${JSON.stringify(text)}, got ${JSON.stringify(actual.substring(0, 120))}`);
          await page.waitForTimeout(100);
        }
      },
    });
  }

  let passed = 0;
  for (const check of checks) {
    try {
      await check.run();
      passed++;
    } catch (err) {
      const message = err instanceof Error ? err.message.split('\n')[0] : String(err);
      return { success: false, assertionsPassed: passed, assertionsTotal: checks.length, error: `${check.name}: ${message}` };
    }
  }
  return { success: true, assertionsPassed: passed, assertionsTotal: checks.length };
}
