import type { Page } from 'playwright-core';
import type { ElementFingerprint, ExecutionTrace, TraceActionType, TraceStep } from '../types/index.js';
import { deterministicId, sha256 } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export class TraceRecorder {
  private trace: ExecutionTrace;
  private stepCounter = 0;

  constructor(suiteName: string, targetUrl: string) {
    this.trace = {
      id: deterministicId('trace', `${suiteName}_${Date.now()}`),
      suiteName,
      targetUrl,
      startTime: new Date().toISOString(),
      steps: [],
      networkEvents: [],
      metadata: {},
    };
  }

  getTrace(): ExecutionTrace {
    return {
      ...this.trace,
      endTime: new Date().toISOString(),
      totalDurationMs: this.trace.steps.reduce((acc, s) => acc + (s.durationMs || 0), 0),
    };
  }

  /**
   * Extract high-fidelity element fingerprint from a Playwright locator or DOM selector
   */
  async extractFingerprint(page: Page, selector: string): Promise<ElementFingerprint> {
    try {
      const fingerprint = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) {
          return null;
        }

        const tag = el.tagName.toLowerCase();
        const role = el.getAttribute('role') || (tag === 'button' ? 'button' : tag === 'a' ? 'link' : undefined);
        const ariaName = el.getAttribute('aria-label') || el.getAttribute('name') || el.textContent?.trim().substring(0, 50);
        const testId = el.getAttribute('data-testid') || el.getAttribute('data-test') || el.getAttribute('data-cy');
        
        // Compute resilient CSS selector
        let resilientCss = '';
        if (testId) {
          resilientCss = `[data-testid="${testId}"]`;
        } else if (el.id && !/\d{4,}/.test(el.id)) {
          // Avoid dynamic randomized generated IDs
          resilientCss = `#${el.id}`;
        } else if (el.getAttribute('name')) {
          resilientCss = `${tag}[name="${el.getAttribute('name')}"]`;
        } else {
          resilientCss = sel;
        }

        const rect = el.getBoundingClientRect();
        const attrs: Record<string, string> = {};
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          attrs[attr.name] = attr.value;
        }

        return {
          css: resilientCss,
          tagName: tag,
          ariaRole: role,
          ariaName: ariaName || undefined,
          dataTestId: testId || undefined,
          textContent: el.textContent?.trim() || undefined,
          attributes: attrs,
          domContextSnippet: el.outerHTML.substring(0, 300),
          boundingClientRect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        };
      }, selector);

      if (fingerprint) {
        return fingerprint;
      }
    } catch {
      // Fallback if evaluate fails
    }

    return {
      css: selector,
      tagName: 'unknown',
      attributes: {},
    };
  }

  /**
   * Record a trace action step
   */
  async recordStep(
    page: Page,
    action: TraceActionType,
    params: {
      selector?: string;
      value?: string;
      url?: string;
      expected?: string;
      checkpointName?: string;
      durationMs?: number;
    }
  ): Promise<TraceStep> {
    const stepIndex = ++this.stepCounter;
    let targetFingerprint: ElementFingerprint | undefined;

    if (params.selector) {
      targetFingerprint = await this.extractFingerprint(page, params.selector);
    }

    let screenshotHash: string | undefined;
    let domSnapshot: string | undefined;

    try {
      domSnapshot = await page.evaluate(() => document.body.innerHTML.substring(0, 5000));
      screenshotHash = sha256(domSnapshot);
    } catch {
      // Ignore evaluation error if page closed
    }

    const step: TraceStep = {
      index: stepIndex,
      type: action,
      target: targetFingerprint,
      value: params.value,
      url: params.url,
      expected: params.expected,
      checkpointName: params.checkpointName,
      timestamp: new Date().toISOString(),
      durationMs: params.durationMs,
      screenshotHash,
      domSnapshotAfter: domSnapshot,
    };

    this.trace.steps.push(step);
    logger.step(stepIndex, action.toUpperCase(), params.selector || params.url || params.checkpointName);
    return step;
  }
}

