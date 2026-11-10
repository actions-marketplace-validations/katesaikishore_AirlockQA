import { describe, expect, it, setDefaultTimeout } from 'bun:test';
import { runCli } from './cli-helpers.js';

setDefaultTimeout(30_000);

describe('qafind warp is honest about what it does', () => {
  it('does not claim to change kernel, V8 or DOM clocks in --help', async () => {
    const res = await runCli(['warp', '--help']);
    expect(res.output).not.toMatch(/kernel/i);
    expect(res.output).not.toMatch(/V8/);
    expect(res.output).toMatch(/Date offset/i);
    expect(res.output).toMatch(/changes no clock/i);
  });

  it('reports the offset without claiming synchronized clock layers', async () => {
    const res = await runCli(['warp', '+1 hour']);
    expect(res.code).toBe(0);
    expect(res.output).toMatch(/Delta:/);
    expect(res.output).not.toMatch(/Synchronized:/);
    expect(res.output).not.toMatch(/Time-Warp Applied/);
    expect(res.output).toMatch(/nothing was changed/i);
  });
});
