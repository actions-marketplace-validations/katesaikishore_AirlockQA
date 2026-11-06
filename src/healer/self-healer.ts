import * as fs from 'node:fs';
import type { Page } from 'playwright-core';
import type { ElementFingerprint, HealingCandidate } from '../types/index.js';
import { stringSimilarity, tokenOverlap } from './dom-diff.js';
import { DatasetCollector } from './dataset-collector.js';
import { logger } from '../utils/logger.js';

export interface SelfHealOptions {
  confidenceThreshold?: number;
  testFilePath?: string;
  stepIndex?: number;
  action?: 'click' | 'fill' | 'assert_visible' | 'assert_text';
}

export class SelfHealer {
  private datasetCollector: DatasetCollector;
  private confidenceThreshold: number;

  constructor(confidenceThreshold = 0.8, datasetDir = './.airlock/dataset') {
    this.confidenceThreshold = confidenceThreshold;
    this.datasetCollector = new DatasetCollector(datasetDir);
  }

  getDatasetCollector(): DatasetCollector {
    return this.datasetCollector;
  }

  /**
   * Find candidate elements on the live page and score them against the expected fingerprint
   */
  async findHealedSelector(
    page: Page,
    expected: ElementFingerprint,
    options: SelfHealOptions = {}
  ): Promise<HealingCandidate | null> {
    const threshold = options.confidenceThreshold ?? this.confidenceThreshold;

    // Scan DOM for elements with similar roles, tags, or text
    const candidates = await page.evaluate((exp) => {
      const results: Array<{
        tag: string;
        role?: string;
        ariaName?: string;
        testId?: string;
        text?: string;
        classes: string[];
        outerHtml: string;
        cssPath: string;
      }> = [];

      // Look across relevant interactive elements
      const elements = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role], [data-testid]'));

      for (const el of elements) {
        const tag = el.tagName.toLowerCase();
        const role = el.getAttribute('role') || (tag === 'button' ? 'button' : tag === 'a' ? 'link' : undefined);
        const ariaName = el.getAttribute('aria-label') || el.getAttribute('name') || el.textContent?.trim().substring(0, 50);
        const testId = el.getAttribute('data-testid') || el.getAttribute('data-cy');
        const text = el.textContent?.trim();
        const classes = Array.from(el.classList);

        // Simple unique path
        let path = tag;
        if (testId) {
          path = `[data-testid="${testId}"]`;
        } else if (el.id && !/\d{4,}/.test(el.id)) {
          path = `#${el.id}`;
        } else if (ariaName && role) {
          path = `${tag}[aria-label="${ariaName}"]`;
        } else if (classes.length > 0) {
          path = `${tag}.${classes.slice(0, 2).join('.')}`;
        }

        results.push({
          tag,
          role,
          ariaName,
          testId: testId || undefined,
          text,
          classes,
          outerHtml: el.outerHTML.substring(0, 300),
          cssPath: path,
        });
      }

      return results;
    }, expected);

    let bestCandidate: HealingCandidate | null = null;
    let highestScore = 0;

    for (const c of candidates) {
      let score = 0;

      // 1. Tag match (weight: 0.25)
      if (c.tag === expected.tagName) {
        score += 0.25;
      }

      // 2. ARIA role match (weight: 0.2)
      if (expected.ariaRole && c.role === expected.ariaRole) {
        score += 0.2;
      }

      // 3. Text or Accessible Name similarity (weight: 0.35)
      const expectedText = expected.ariaName || expected.textContent || '';
      const candidateText = c.ariaName || c.text || '';
      const textSim = stringSimilarity(expectedText, candidateText);
      score += textSim * 0.35;

      // 4. TestID similarity or presence (weight: 0.15)
      if (expected.dataTestId && c.testId) {
        const idSim = stringSimilarity(expected.dataTestId, c.testId);
        score += idSim * 0.15;
      } else if (c.testId) {
        score += 0.05;
      }

      // 5. Class overlap (weight: 0.05)
      const expectedClasses = Object.values(expected.attributes['class'] || '').flatMap((s) => s.split(' '));
      const classOverlap = tokenOverlap(expectedClasses, c.classes);
      score += classOverlap * 0.05;

      if (score > highestScore) {
        highestScore = score;
        let method: HealingCandidate['method'] = 'ml_heuristic';
        if (c.testId && expected.dataTestId) method = 'exact_testid';
        else if (textSim > 0.85) method = 'semantic_text';
        else if (c.role && expected.ariaRole) method = 'aria_fuzzy';

        bestCandidate = {
          selector: c.testId ? `[data-testid="${c.testId}"]` : c.cssPath,
          confidence: Number(score.toFixed(3)),
          method,
          elementSnippet: c.outerHtml,
        };
      }
    }

    if (bestCandidate && bestCandidate.confidence >= threshold) {
      logger.moat(2, 'Surgical Self-Healing Triggered', `Repaired broken selector '${expected.css}' -> '${bestCandidate.selector}' (${(bestCandidate.confidence * 100).toFixed(0)}% match)`);

      // Record mutation tuple to dataset
      this.datasetCollector.recordMutation({
        testFile: options.testFilePath || 'unknown_spec.ts',
        stepIndex: options.stepIndex || 0,
        action: options.action || 'click',
        brokenSelector: expected.css,
        healedSelector: bestCandidate.selector,
        confidence: bestCandidate.confidence,
        resolutionMethod: bestCandidate.method,
        beforeDomSnippet: expected.domContextSnippet || `<${expected.tagName}>${expected.textContent || ''}</${expected.tagName}>`,
        afterDomSnippet: bestCandidate.elementSnippet,
        frameworkDetected: this.detectFramework(expected, bestCandidate),
      });

      // Surgically patch file on disk if path provided
      if (options.testFilePath && fs.existsSync(options.testFilePath)) {
        this.patchTestFile(options.testFilePath, expected.css, bestCandidate.selector);
      }

      return bestCandidate;
    }

    return null;
  }

  private detectFramework(before: ElementFingerprint, candidate: HealingCandidate): string {
    const combined = (before.domContextSnippet || '') + candidate.elementSnippet;
    if (combined.includes('data-reactroot') || combined.includes('data-nextjs') || combined.includes('_next')) {
      return 'Next.js';
    }
    if (combined.includes('class="') && (combined.includes('flex') || combined.includes('bg-') || combined.includes('text-'))) {
      return 'Tailwind / Shadcn';
    }
    return 'Vanilla/Standard DOM';
  }

  /**
   * Surgically patch test code on disk
   */
  private patchTestFile(filePath: string, oldSelector: string, newSelector: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(oldSelector)) {
        const patched = content.split(oldSelector).join(newSelector);
        fs.writeFileSync(filePath, patched, 'utf8');
        logger.success(`Surgically patched test file: ${filePath}`);
      }
    } catch (err) {
      logger.warn(`Could not auto-patch file ${filePath}:`, err);
    }
  }
}
