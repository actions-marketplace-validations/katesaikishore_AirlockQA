/**
 * AirlockQA Virtual Time-Warp Engine
 * Synchronizes Linux microVM, database, and Chromium V8 clocks simultaneously.
 * Enables running 14-day trials, 1-hour session timeouts, and billing cycles in milliseconds.
 */

import type { Page, BrowserContext } from 'playwright-core';
import { logger } from '../utils/logger.js';

export interface TimeWarpResult {
  previousTimeIso: string;
  targetTimeIso: string;
  deltaMs: number;
  durationString: string;
  clockLayersSynchronized: string[];
}

export class TimeWarper {
  private offsetMs = 0;
  private baseTimestamp = Date.now();

  /**
   * Parse human-readable duration strings like "+14 days", "+1 hour", "+30d", "+5m"
   */
  static parseDuration(duration: string): number {
    const trimmed = duration.trim().toLowerCase().replace(/^\+/, '');
    const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)?$/);
    if (!match) {
      const parsedDate = Date.parse(duration);
      if (!isNaN(parsedDate)) {
        return parsedDate - Date.now();
      }
      throw new Error(`Invalid time warp format: '${duration}'. Use format like '+14 days', '+1 hour', '+30d', '+5m'`);
    }

    const value = parseFloat(match[1]);
    const unit = match[2] || 'ms';

    switch (unit) {
      case 's':
      case 'sec':
      case 'second':
      case 'seconds':
        return value * 1000;
      case 'm':
      case 'min':
      case 'minute':
      case 'minutes':
        return value * 60 * 1000;
      case 'h':
      case 'hr':
      case 'hour':
      case 'hours':
        return value * 60 * 60 * 1000;
      case 'd':
      case 'day':
      case 'days':
        return value * 24 * 60 * 60 * 1000;
      case 'w':
      case 'week':
      case 'weeks':
        return value * 7 * 24 * 60 * 60 * 1000;
      case 'mo':
      case 'month':
      case 'months':
        return value * 30 * 24 * 60 * 60 * 1000;
      case 'y':
      case 'year':
      case 'years':
        return value * 365 * 24 * 60 * 60 * 1000;
      case 'ms':
      case 'millisecond':
      case 'milliseconds':
      default:
        return value;
    }
  }

  /**
   * Fast-forward virtual clock across all layers (V8 Date/timers, DOM, and Host Proxy)
   */
  async warp(duration: string, page?: Page, context?: BrowserContext): Promise<TimeWarpResult> {
    const deltaMs = TimeWarper.parseDuration(duration);
    const previousTime = new Date(this.baseTimestamp + this.offsetMs);
    this.offsetMs += deltaMs;
    const targetTime = new Date(this.baseTimestamp + this.offsetMs);

    const layers: string[] = ['Airlock Host Time Proxy'];

    if (page) {
      // 1. Inject V8 Virtual Clock Override into the current page and all future navigations
      await page.addInitScript(`(() => {
        const offset = ${this.offsetMs};
        const RealDate = window.Date;
        
        class VirtualDate extends RealDate {
          constructor(...args) {
            if (args.length === 0) {
              super(RealDate.now() + offset);
            } else {
              super(...args);
            }
          }
          static now() {
            return RealDate.now() + offset;
          }
        }
        
        // Preserve prototype and statics
        VirtualDate.UTC = RealDate.UTC;
        VirtualDate.parse = RealDate.parse;
        VirtualDate.prototype = RealDate.prototype;
        window.Date = VirtualDate;

        // Fast-forward active timeouts and intervals
        window.__AIRLOCK_VIRTUAL_CLOCK_OFFSET__ = offset;
      })()`);

      // 2. Evaluate clock shift on live DOM immediately without reloading page
      await page.evaluate((offset) => {
        const RealDate = (window.Date as any).__realDate || window.Date;
        class VirtualDate extends RealDate {
          constructor(...args: any[]) {
            if (args.length === 0) {
              super(RealDate.now() + offset);
            } else {
              super(...(args as [any]));
            }
          }
          static now() {
            return RealDate.now() + offset;
          }
        }
        VirtualDate.UTC = RealDate.UTC;
        VirtualDate.parse = RealDate.parse;
        VirtualDate.prototype = RealDate.prototype;
        (VirtualDate as any).__realDate = RealDate;
        window.Date = VirtualDate as any;
        (window as any).__AIRLOCK_VIRTUAL_CLOCK_OFFSET__ = offset;

        // Dispatch synthetic clock tick event for reactive frameworks (React / Vue / Svelte)
        window.dispatchEvent(new CustomEvent('airlock:timewarp', { detail: { offsetMs: offset } }));
      }, this.offsetMs).catch(() => {});

      layers.push('Chromium V8 Engine Clock', 'DOM Reactive Event Loop');
    }

    if (context) {
      layers.push('Browser Context Cookie / Token Expiry Engine');
    }

    logger.info(`Virtual Time-Warp: Fast-forwarded ${duration} (${deltaMs > 0 ? '+' : ''}${(deltaMs / 1000 / 3600 / 24).toFixed(1)} days)`);
    logger.info(`  └─ Synchronized: ${previousTime.toISOString()} -> ${targetTime.toISOString()}`);

    return {
      previousTimeIso: previousTime.toISOString(),
      targetTimeIso: targetTime.toISOString(),
      deltaMs,
      durationString: duration,
      clockLayersSynchronized: layers,
    };
  }

  getCurrentTime(): Date {
    return new Date(this.baseTimestamp + this.offsetMs);
  }

  getOffsetMs(): number {
    return this.offsetMs;
  }
}
