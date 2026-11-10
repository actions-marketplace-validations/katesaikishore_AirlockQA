import { describe, expect, it } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { stringSimilarity, levenshteinDistance, tokenOverlap } from '../src/healer/dom-diff.js';
import { DatasetCollector } from '../src/healer/dataset-collector.js';

describe('Self-Healing: DOM Similarity & Mutation Dataset', () => {
  it('calculates string similarity accurately', () => {
    expect(stringSimilarity('Complete Checkout', 'Complete Checkout')).toBe(1.0);
    expect(stringSimilarity('Complete Checkout', 'Proceed to Checkout')).toBeGreaterThan(0.5);
    expect(stringSimilarity('Checkout', 'Login')).toBeLessThan(0.3);
  });

  it('calculates token overlap accurately', () => {
    const tokensA = ['btn', 'btn-primary', 'w-full', 'rounded-md'];
    const tokensB = ['btn', 'btn-primary', 'shadow-lg'];
    const overlap = tokenOverlap(tokensA, tokensB);
    expect(overlap).toBeGreaterThan(0.3);
  });

  it('records mutations and computes compounding dataset statistics', () => {
    const testDatasetDir = './.qafind/test-dataset';
    const collector = new DatasetCollector(testDatasetDir);

    collector.recordMutation({
      testFile: 'checkout.spec.ts',
      stepIndex: 3,
      action: 'click',
      brokenSelector: 'button.checkout-btn',
      healedSelector: 'button[data-testid="proceed-payment"]',
      confidence: 0.92,
      resolutionMethod: 'aria_fuzzy',
      beforeDomSnippet: '<button class="checkout-btn">Checkout</button>',
      afterDomSnippet: '<button data-testid="proceed-payment">Proceed</button>',
      frameworkDetected: 'Tailwind / Shadcn',
    });

    const stats = collector.getStats();
    expect(stats.totalMutations).toBeGreaterThan(0);
    expect(stats.avgConfidence).toBeGreaterThanOrEqual(0.9);
    expect(stats.frameworksBreakdown['Tailwind / Shadcn']).toBe(1);

    // Clean up
    fs.rmSync(testDatasetDir, { recursive: true, force: true });
  });
});

