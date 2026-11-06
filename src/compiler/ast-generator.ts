import type { ElementFingerprint, ExecutionTrace, TraceStep } from '../types/index.js';

export interface CompilationOptions {
  includeAriaFallbacks?: boolean;
  defaultTimeoutMs?: number;
  suiteTitle?: string;
  generateSelfHealingHooks?: boolean;
}

/**
 * Emit a value as a JavaScript string literal. JSON.stringify escapes quotes,
 * backslashes and control characters; U+2028/U+2029 are escaped as well.
 */
export function lit(value: unknown): string {
  return JSON.stringify(String(value ?? '')).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** Make a value safe inside a // or /* *\/ comment: single line, cannot close the comment. */
export function comment(value: unknown): string {
  return String(value ?? '').replace(/[\r\n\u2028\u2029]+/g, ' ').replace(/\*\//g, '* /');
}

export class AstGenerator {
  /**
   * Generates a resilient locator code string based on element fingerprint.
   * Every value is emitted as a JSON string literal so it cannot break out of the code.
   */
  private generateResilientLocator(fp?: ElementFingerprint): string {
    if (!fp) return `page.locator('body')`;

    // Strategy 1: Data Test ID (highest stability)
    if (fp.dataTestId) {
      return `airlockLocator(page, { testId: ${lit(fp.dataTestId)}, css: ${lit(fp.css)}, text: ${lit(fp.textContent || '')} })`;
    }

    // Strategy 2: ARIA Role + Name (accessible & semantically stable)
    if (fp.ariaRole && fp.ariaName) {
      return `airlockLocator(page, { role: ${lit(fp.ariaRole)}, name: ${lit(fp.ariaName)}, css: ${lit(fp.css)} })`;
    }

    // Strategy 3: Text match for buttons and links
    if ((fp.tagName === 'button' || fp.tagName === 'a') && fp.textContent) {
      return `airlockLocator(page, { text: ${lit(fp.textContent.substring(0, 40))}, tag: ${lit(fp.tagName)}, css: ${lit(fp.css)} })`;
    }

    // Strategy 4: Fallback to CSS
    return `airlockLocator(page, { css: ${lit(fp.css)} })`;
  }

  /**
   * Compile a single trace step into deterministic TypeScript Playwright statements
   */
  private compileStep(step: TraceStep): string[] {
    const lines: string[] = [];
    const idx = Number.isInteger(step.index) && step.index >= 0 ? step.index : 0;
    const el = `el_${idx}`;
    lines.push(`  // Step ${idx}: ${comment(String(step.type).toUpperCase())}`);

    switch (step.type) {
      case 'goto': {
        const url = step.url || step.value || '/';
        lines.push(`  await page.goto(${lit(url)}, { waitUntil: 'domcontentloaded' });`);
        break;
      }
      case 'click': {
        lines.push(`  const ${el} = await ${this.generateResilientLocator(step.target)};`);
        lines.push(`  await ${el}.click();`);
        break;
      }
      case 'fill': {
        lines.push(`  const ${el} = await ${this.generateResilientLocator(step.target)};`);
        lines.push(`  await ${el}.fill(${lit(step.value || '')});`);
        break;
      }
      case 'press': {
        lines.push(`  await page.keyboard.press(${lit(step.value || 'Enter')});`);
        break;
      }
      case 'select': {
        lines.push(`  const ${el} = await ${this.generateResilientLocator(step.target)};`);
        lines.push(`  await ${el}.selectOption(${lit(step.value || '')});`);
        break;
      }
      case 'hover': {
        lines.push(`  const ${el} = await ${this.generateResilientLocator(step.target)};`);
        lines.push(`  await ${el}.hover();`);
        break;
      }
      case 'assert_visible': {
        lines.push(`  const ${el} = await ${this.generateResilientLocator(step.target)};`);
        lines.push(`  await expect(${el}).toBeVisible({ timeout: 4000 });`);
        break;
      }
      case 'assert_text': {
        lines.push(`  const ${el} = await ${this.generateResilientLocator(step.target)};`);
        lines.push(`  await expect(${el}).toContainText(${lit(step.expected || step.value || '')}, { timeout: 4000 });`);
        break;
      }
      case 'assert_url': {
        lines.push(`  expect(page.url()).toContain(${lit(step.expected || step.value || '')});`);
        break;
      }
      case 'checkpoint': {
        const name = step.checkpointName || `checkpoint_step_${idx}`;
        lines.push(`  await airlock.checkpoint(${lit(name)}, page);`);
        break;
      }
      default:
        lines.push(`  // Unknown action: ${comment(String(step.type))}`);
    }

    lines.push('');
    return lines;
  }

  /**
   * Compile full trace into complete Playwright spec file
   */
  compileToSpec(trace: ExecutionTrace, options: CompilationOptions = {}): string {
    const title = options.suiteTitle || trace.suiteName || 'Airlock Test';
    const timeout = options.defaultTimeoutMs || 10000;

    const stepLines: string[] = [];
    for (const step of trace.steps) {
      stepLines.push(...this.compileStep(step));
    }

    return `/**
 * Generated Playwright output compiled from an exploration trace.
 * Runtime depends on the target environment and test behavior.
 * Trace ID: ${comment(trace.id)}
 * Generated: ${new Date().toISOString()}
 */

import { test, expect } from '@playwright/test';
import { AirlockRunner, airlockLocator } from 'airlockqa';

test.describe(${lit(title)}, () => {
  let airlock: AirlockRunner;

  test.beforeEach(async ({ page, context }) => {
    airlock = new AirlockRunner();
    await airlock.initialize(context, page);
  });

  test.afterEach(async () => {
    const proof = await airlock.finalize();
    console.log('Airlock Merkle Root:', proof.merkleRoot);
  });

  test(${lit(`deterministic run for ${title}`)}, async ({ page }) => {
    test.setTimeout(${Number.isFinite(Number(timeout)) ? Number(timeout) : 10000});

${stepLines.join('\n')}
  });
});
`;
  }
}

