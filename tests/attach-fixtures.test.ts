import { describe, expect, it } from 'bun:test';
import { DEFAULT_ATTACH_TIME, readDeterminismSettings } from '../src/testing/attach-fixtures.js';

describe('attach determinism settings', () => {
  it('defaults to clock fixed, network off and the documented epoch', () => {
    const settings = readDeterminismSettings({});
    expect(settings.clock).toBe('fixed');
    expect(settings.network).toBe('off');
    expect(settings.time).toBe(DEFAULT_ATTACH_TIME);
    expect(settings.dir).toBe('.qafind');
  });

  it('reads record/replay, clock opt-out, a custom instant and directory', () => {
    const settings = readDeterminismSettings({
      QAFIND_ATTACH_NETWORK: 'replay',
      QAFIND_ATTACH_CLOCK: 'off',
      QAFIND_ATTACH_TIME: '2025-06-01T12:00:00.000Z',
      QAFIND_ATTACH_DIR: 'tmp/qafind',
    });
    expect(settings).toEqual({
      network: 'replay',
      clock: 'off',
      time: '2025-06-01T12:00:00.000Z',
      dir: 'tmp/qafind',
    });
  });

  it('ignores invalid modes and instants instead of guessing', () => {
    const settings = readDeterminismSettings({ QAFIND_ATTACH_NETWORK: 'sometimes', QAFIND_ATTACH_TIME: 'not-a-date' });
    expect(settings.network).toBe('off');
    expect(settings.time).toBe(DEFAULT_ATTACH_TIME);
  });
});
