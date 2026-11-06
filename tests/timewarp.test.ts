import { describe, it, expect } from 'bun:test';
import { TimeWarper } from '../src/timewarp/time-warper.js';

describe('Browser Date Offset Prototype', () => {
  it('parses human-readable duration strings with high precision', () => {
    expect(TimeWarper.parseDuration('+14 days')).toBe(14 * 24 * 60 * 60 * 1000);
    expect(TimeWarper.parseDuration('14d')).toBe(14 * 24 * 60 * 60 * 1000);
    expect(TimeWarper.parseDuration('+1 hour')).toBe(60 * 60 * 1000);
    expect(TimeWarper.parseDuration('+30m')).toBe(30 * 60 * 1000);
    expect(TimeWarper.parseDuration('+500ms')).toBe(500);
    expect(TimeWarper.parseDuration('1w')).toBe(7 * 24 * 60 * 60 * 1000);
    expect(TimeWarper.parseDuration('+1 month')).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it('shifts virtual clock forward accurately', async () => {
    const warper = new TimeWarper();
    const initialTime = warper.getCurrentTime().getTime();

    const result = await warper.warp('+14 days');

    expect(result.deltaMs).toBe(14 * 24 * 60 * 60 * 1000);
    expect(result.scope).toBe('internal');
    expect(result.affectedPageAPIs).toEqual([]);
    expect(result.clockLayersSynchronized).toEqual([]);
    expect(warper.getOffsetMs()).toBe(14 * 24 * 60 * 60 * 1000);

    const advancedTime = warper.getCurrentTime().getTime();
    expect(advancedTime - initialTime).toBe(14 * 24 * 60 * 60 * 1000);
  });

  it('accumulates sequential time warps monotonically', async () => {
    const warper = new TimeWarper();

    await warper.warp('+1 hour');
    expect(warper.getOffsetMs()).toBe(3600000);

    await warper.warp('+30 minutes');
    expect(warper.getOffsetMs()).toBe(5400000);
  });

  it('applies cumulative Date offsets to a page without claiming other clocks changed', async () => {
    const warper = new TimeWarper();
    const events: unknown[] = [];
    const mockWindow = {
      Date,
      dispatchEvent: (event: unknown) => events.push(event),
    };
    const originalWindow = (globalThis as any).window;
    const originalCustomEvent = (globalThis as any).CustomEvent;
    (globalThis as any).window = mockWindow;
    (globalThis as any).CustomEvent = class CustomEvent {
      constructor(public type: string, public init: unknown) {}
    };

    try {
      const page = {
        addInitScript: async () => {},
        evaluate: async (install: (offset: number) => void, offset: number) => install(offset),
      };

      const first = await warper.warp('+1 hour', page as any);
      const firstOffset = (mockWindow.Date.now() - Date.now());
      const second = await warper.warp('+30 minutes', page as any);
      const secondOffset = (mockWindow.Date.now() - Date.now());

      expect(first.scope).toBe('browser-page');
      expect(first.affectedPageAPIs).toEqual(['new Date() without arguments', 'Date.now()']);
      expect(firstOffset).toBeGreaterThanOrEqual(3600000);
      expect(firstOffset).toBeLessThan(3610000);
      expect(secondOffset).toBeGreaterThanOrEqual(5400000);
      expect(secondOffset).toBeLessThan(5410000);
      expect(second.affectedPageAPIs).toEqual(first.affectedPageAPIs);
      expect(events).toHaveLength(2);
    } finally {
      if (originalWindow === undefined) delete (globalThis as any).window;
      else (globalThis as any).window = originalWindow;
      if (originalCustomEvent === undefined) delete (globalThis as any).CustomEvent;
      else (globalThis as any).CustomEvent = originalCustomEvent;
    }
  });
});
