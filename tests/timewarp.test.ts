import { describe, it, expect } from 'bun:test';
import { TimeWarper } from '../src/timewarp/time-warper.js';

describe('Virtual Time-Warp: Kernel & V8 Synchronized Clock', () => {
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
    expect(result.clockLayersSynchronized).toContain('Airlock Host Time Proxy');
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
});
