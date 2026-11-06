import type { ElementFingerprint, ExecutionTrace, TraceStep } from '../types/index.js';

export interface CompilationOptions {
  includeAriaFallbacks?: boolean;
  defaultTimeoutMs?: number;
  suiteTitle?: string;
  generateSelfHealingHooks?: boolean;
}

export class AstGenerator {
  /**
   * Generates a resilient locator code string based on element fingerprint
   */
  private generateResilientLocator(fp?: ElementFingerprint): string {
    if (!fp) return `page.locator('body')`;

    // Strategy 1: Data Test ID (highest stability)
    if (fp.dataTestId) {
      return `airlockLocator(page, { testId: '${fp.dataTestId}', css: '${fp.css}', text: '${fp.textContent || ''}' })`;
    }

    // Strategy 2: ARIA Role + Name (accessible & semantically stable)
    if (fp.ariaRole && fp.ariaName) {
      const sanitizedName = fp.ariaName.replace(/'/g, "\\'");
      return `airlockLocator(page, { role: '${fp.ariaRole}', name: '${sanitizedName}', css: '${fp.css}' })`;
    }

    // Strategy 3: Text match for buttons and links
    if ((fp.tagName === 'button' || fp.tagName === 'a') && fp.textContent) {
      const cleanText = fp.textContent.replace(/'/g, "\\'").substring(0, 40);
      return `airlockLocator(page, { text: '${cleanText}', tag: '${fp.tagName}', css: '${fp.css}' })`;
    }

    // Strategy 4: Fallback to CSS
    const cleanCss = fp.css.replace(/'/g, "\\'");
    return `airlockLocator(page, { css: '${cleanCss}' })`;
  }

  /**
   * Compile a single trace step into deterministic TypeScript Playwright statements
   */
  private compileStep(step: TraceStep): string[] {
    const lines: string[] = [];
    lines.push(`  // Step ${step.index}: ${step.type.toUpperCase()}`);

    switch (step.type) {
      case 'goto': {
        const url = step.url || step.value || '/';
        lines.push(`  await page.goto('${url}', { waitUntil: 'domcontentloaded' });`);
        break;
      }
      case 'click': {
        const loc = this.generateResilientLocator(step.target);
        lines.push(`  const el_${step.index} = await ${loc};`);
        lines.push(`  await el_${step.index}.click();`);
        break;
      }
      case 'fill': {
        const loc = this.generateResilientLocator(step.target);
        const val = (step.value || '').replace(/'/g, "\\'");
        lines.push(`  const el_${step.index} = await ${loc};`);
        lines.push(`  await el_${step.index}.fill('${val}');`);
        break;
      }
      case 'press': {
        const key = step.value || 'Enter';
        lines.push(`  await page.keyboard.press('${key}');`);
        break;
      }
      case 'select': {
        const loc = this.generateResilientLocator(step.target);
        const val = (step.value || '').replace(/'/g, "\\'");
        lines.push(`  const el_${step.index} = await ${loc};`);
        lines.push(`  await el_${step.index}.selectOption('${val}');`);
        break;
      }
      case 'hover': {
        const loc = this.generateResilientLocator(step.target);
        lines.push(`  const el_${step.index} = await ${loc};`);
        lines.push(`  await el_${step.index}.hover();`);
        break;
      }
      case 'assert_visible': {
        const loc = this.generateResilientLocator(step.target);
        lines.push(`  const el_${step.index} = await ${loc};`);
        lines.push(`  await expect(el_${step.index}).toBeVisible({ timeout: 4000 });`);
        break;
      }
      case 'assert_text': {
        const loc = this.generateResilientLocator(step.target);
        const expected = (step.expected || step.value || '').replace(/'/g, "\\'");
        lines.push(`  const el_${step.index} = await ${loc};`);
        lines.push(`  await expect(el_${step.index}).toContainText('${expected}', { timeout: 4000 });`);
        break;
      }
      case 'assert_url': {
        const expected = (step.expected || step.value || '').replace(/'/g, "\\'");
        lines.push(`  expect(page.url()).toContain('${expected}');`);
        break;
      }
      case 'checkpoint': {
        const name = step.checkpointName || `checkpoint_step_${step.index}`;
        lines.push(`  await airlock.checkpoint('${name}', page);`);
        break;
      }
      default:
        lines.push(`  // Unknown action: ${step.type}`);
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
 * Trace ID: ${trace.id}
 * Generated: ${new Date().toISOString()}
 */

import { test, expect } from '@playwright/test';
import { AirlockRunner, airlockLocator } from 'airlockqa';

test.describe('${title}', () => {
  let airlock: AirlockRunner;

  test.beforeEach(async ({ page, context }) => {
    airlock = new AirlockRunner();
    await airlock.initialize(context, page);
  });

  test.afterEach(async () => {
    const proof = await airlock.finalize();
    console.log('Airlock Merkle Root:', proof.merkleRoot);
  });

  test('deterministic run for ${title}', async ({ page }) => {
    test.setTimeout(${timeout});

${stepLines.join('\n')}
  });
});
`;
  }
}

