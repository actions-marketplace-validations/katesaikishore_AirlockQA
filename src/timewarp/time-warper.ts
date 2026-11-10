/**
 * QAFind browser-page Date offset prototype.
 * It does not change browser timers, the operating-system clock, or service clocks.
 */

import type { Page, BrowserContext } from 'playwright-core';
import { logger } from '../utils/logger.js';

export interface TimeWarpResult {
  previousTimeIso: string;
  targetTimeIso: string;
  deltaMs: number;
  durationString: string;
  scope: 'internal' | 'browser-page';
  affectedPageAPIs: string[];
  /** @deprecated No system clock layers are synchronized; this is always empty. */
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

  /** Apply an offset to the internal clock and, when supplied, the page's Date APIs. */
  async warp(duration: string, page?: Page, context?: BrowserContext): Promise<TimeWarpResult> {
    const deltaMs = TimeWarper.parseDuration(duration);
    const previousTime = new Date(this.baseTimestamp + this.offsetMs);
    this.offsetMs += deltaMs;
    const targetTime = new Date(this.baseTimestamp + this.offsetMs);

    const affectedPageAPIs: string[] = [];

    if (page) {
      const applyDateOffset = (offsetMs: number) => {
        const currentDate = window.Date as DateConstructor & { __QAFIND_REAL_DATE__?: DateConstructor };
        const RealDate = currentDate.__QAFIND_REAL_DATE__ || currentDate;
        const VirtualDate = function (this: unknown, ...args: unknown[]) {
          if (!new.target) return new RealDate(RealDate.now() + offsetMs).toString();
          const constructorArgs = args.length === 0 ? [RealDate.now() + offsetMs] : args;
          return Reflect.construct(RealDate, constructorArgs, new.target);
        } as unknown as DateConstructor & { __QAFIND_REAL_DATE__?: DateConstructor };

        (VirtualDate as any).prototype = RealDate.prototype;
        Object.setPrototypeOf(VirtualDate, RealDate);
        Object.defineProperty(VirtualDate, '__QAFIND_REAL_DATE__', { value: RealDate });
        Object.defineProperty(VirtualDate, 'now', { value: () => RealDate.now() + offsetMs });
        window.Date = VirtualDate;
        (window as any).__QAFIND_VIRTUAL_CLOCK_OFFSET__ = offsetMs;
        window.dispatchEvent(new CustomEvent('qafind:timewarp', { detail: { offsetMs } }));
      };

      await page.addInitScript(applyDateOffset, this.offsetMs);
      await page.evaluate(applyDateOffset, this.offsetMs);
      affectedPageAPIs.push('new Date() without arguments', 'Date.now()');
    }

    if (context && !page) {
      logger.warn('A BrowserContext alone is not clock-controlled; pass a Page to apply the browser Date offset.');
    }

    logger.info(`Browser Date offset: ${duration} (${deltaMs > 0 ? '+' : ''}${(deltaMs / 1000 / 3600 / 24).toFixed(1)} days)`);
    logger.info(`  └─ Internal target: ${previousTime.toISOString()} -> ${targetTime.toISOString()}`);

    return {
      previousTimeIso: previousTime.toISOString(),
      targetTimeIso: targetTime.toISOString(),
      deltaMs,
      durationString: duration,
      scope: page ? 'browser-page' : 'internal',
      affectedPageAPIs,
      clockLayersSynchronized: [],
    };
  }

  getCurrentTime(): Date {
    return new Date(this.baseTimestamp + this.offsetMs);
  }

  getOffsetMs(): number {
    return this.offsetMs;
  }
}
