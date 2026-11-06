/**
 * Browser-context fixture prototype. It serves matching saved responses and
 * allows unmatched requests through except for the Stripe-shaped fallback.
 */

import type { BrowserContext, Route } from 'playwright-core';
import { ShadowRecorder, type WireInteraction } from './shadow-recorder.js';
import { logger } from '../utils/logger.js';

export class ShadowSynthesizer {
  private recorder: ShadowRecorder;
  private active = false;
  private servedCount = 0;

  constructor(recorder?: ShadowRecorder) {
    this.recorder = recorder || new ShadowRecorder();
  }

  /**
   * Add browser-context routes that serve matching fixtures.
   * Unmatched requests may continue to the network, so this is not hermetic by default.
   */
  async activate(context: BrowserContext, targetHosts: string[] = ['*']): Promise<void> {
    this.active = true;
    this.servedCount = 0;

    await context.route('**/*', async (route: Route) => {
      const request = route.request();
      const url = request.url();
      const hostname = new URL(url).hostname;
      const hostIsTargeted = targetHosts.some((target) => {
        if (target === '*') return true;
        if (target.startsWith('*.')) return hostname.endsWith(target.slice(1));
        return hostname === target;
      });
      if (!hostIsTargeted) {
        await route.continue();
        return;
      }

      const method = request.method();
      const postData = request.postData() || undefined;

      // Check if we have a recorded shadow response
      const matched = this.recorder.find(method, url, postData);

      if (matched) {
        this.servedCount++;
        // Serve a saved response through the browser route.
        await route.fulfill({
          status: matched.responseStatus,
          headers: matched.responseHeaders,
          body: matched.responseBody,
        });
      } else {
        // Provide the demo Stripe-shaped response only for a targeted host.
        if (url.includes('api.stripe.com')) {
          this.servedCount++;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'ch_shadow_' + Math.random().toString(36).substring(2, 9),
              object: 'charge',
              amount: 2000,
              currency: 'usd',
              status: 'succeeded',
              paid: true,
              shadow_mock: true,
            }),
          });
        } else {
          // Allow local requests to pass through
          await route.continue();
        }
      }
    });

    logger.info(`Browser fixture routes active: ${this.recorder.size()} saved interactions available`);
  }

  getServedCount(): number {
    return this.servedCount;
  }

  isActive(): boolean {
    return this.active;
  }
}
