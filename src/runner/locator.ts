import type { Locator, Page } from 'playwright-core';
import type { ElementFingerprint } from '../types/index.js';
import { SelfHealer } from '../healer/self-healer.js';
import { logger } from '../utils/logger.js';

export interface ResilientLocatorConfig {
  testId?: string;
  role?: string;
  name?: string;
  text?: string;
  tag?: string;
  css?: string;
}

/**
 * Multi-tier resilient locator with auto-healing fallback
 */
export async function airlockLocator(
  page: Page,
  config: ResilientLocatorConfig,
  healer?: SelfHealer
): Promise<Locator> {
  const timeoutMs = 2500;

  // Tier 1: Data-TestID
  if (config.testId) {
    try {
      const loc = page.locator(`[data-testid="${config.testId}"]`);
      if (await loc.count().then((c) => c > 0)) {
        return loc.first();
      }
    } catch {}
  }

  // Tier 2: ARIA Role + Name
  if (config.role) {
    try {
      const loc = page.getByRole(config.role as any, { name: config.name });
      if (await loc.count().then((c) => c > 0)) {
        return loc.first();
      }
    } catch {}
  }

  // Tier 3: Text match for buttons / links / inputs
  if (config.text) {
    try {
      const loc = page.getByText(config.text, { exact: false });
      if (await loc.count().then((c) => c > 0)) {
        return loc.first();
      }
    } catch {}
  }

  // Tier 4: CSS
  if (config.css) {
    try {
      const loc = page.locator(config.css);
      if (await loc.count().then((c) => c > 0)) {
        return loc.first();
      }
    } catch {}
  }

  // Tier 5: Surgical Self-Healing Fallback
  if (healer) {
    const fingerprint: ElementFingerprint = {
      css: config.css || config.testId || config.name || 'unknown',
      tagName: config.tag || (config.role === 'button' ? 'button' : 'div'),
      ariaRole: config.role,
      ariaName: config.name,
      dataTestId: config.testId,
      textContent: config.text,
      attributes: {},
    };

    const healed = await healer.findHealedSelector(page, fingerprint);
    if (healed) {
      return page.locator(healed.selector).first();
    }
  }

  // Fallback to standard Playwright locator (will throw regular Playwright timeout if not found)
  return page.locator(config.css || config.testId || 'body').first();
}

