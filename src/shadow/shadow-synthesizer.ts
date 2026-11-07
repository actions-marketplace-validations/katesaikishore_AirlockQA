/**
 * Browser-context fixture prototype. It serves matching saved responses and
 * passes unmatched requests to the next route handler (route.fallback), never
 * fabricating a response and never bypassing the AirlockGateway.
 */

import type { BrowserContext, Route } from 'playwright-core';
import { ShadowRecorder, type WireInteraction } from './shadow-recorder.js';
import { logger } from '../utils/logger.js';

export class ShadowSynthesizer {
  private recorder: ShadowRecorder;
  private active = false;
  private servedCount = 0;
  private missedUrls: string[] = [];
  private static readonly MAX_MISSED = 500;

  constructor(recorder?: ShadowRecorder) {
    this.recorder = recorder || new ShadowRecorder();
  }

  /**
   * Add browser-context routes that serve matching fixtures.
   * Unmatched requests fall back to the next handler (the gateway), so this is not hermetic by default.
   */
  async activate(context: BrowserContext, targetHosts: string[] = ['*']): Promise<void> {
    this.active = true;
    this.servedCount = 0;
    this.missedUrls = [];

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
        await route.fallback();
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
        // Never fabricate a response. Record the miss and let the next route handler
        // (the AirlockGateway) decide, so policy and phantom-token handling still apply.
        // Keep the report free of secrets (query strings and fragments are dropped) and bounded in size.
        if (this.missedUrls.length < ShadowSynthesizer.MAX_MISSED) {
          this.missedUrls.push(`${method} ${ShadowSynthesizer.redactUrl(url)}`);
        }
        await route.fallback();
      }
    });

    logger.info(`Browser fixture routes active: ${this.recorder.size()} saved interactions available`);
  }

  private static redactUrl(url: string): string {
    try {
      const u = new URL(url);
      return `${u.origin}${u.pathname}`;
    } catch {
      return url.split(/[?#]/)[0];
    }
  }

  /** Targeted requests that had no saved response and were passed on unchanged (query strings removed, capped at 500). */
  getMissedRequests(): string[] {
    return [...this.missedUrls];
  }

  getServedCount(): number {
    return this.servedCount;
  }

  isActive(): boolean {
    return this.active;
  }
}
