import { describe, expect, it } from 'bun:test';
import { classifyAttempts, RERUN_DEFAULT } from '../src/qa/rerun.js';
import { evaluateGate, type QaFinding, type SuiteOutcome } from '../src/qa/gate.js';

describe('rerun classification (sensitivity: fail every time, not sometimes)', () => {
  it('a test that passed first time is PASS, with no reruns needed', () => {
    expect(classifyAttempts([true])).toMatchObject({ status: 'PASS', attempts: 1 });
  });

  it('a test that failed every attempt is FAIL (deterministic)', () => {
    expect(classifyAttempts([false, false, false, false])).toMatchObject({ status: 'FAIL', kind: 'deterministic' });
  });

  it('a test that failed once and then passed is FLAKY (intermittent), never silently PASS', () => {
    const r = classifyAttempts([false, true, true, true]);
    expect(r.status).toBe('FLAKY');
    expect(r.kind).toBe('intermittent');
  });

  it('any mix of pass and fail is FLAKY, whatever the order', () => {
    expect(classifyAttempts([true, false]).status).toBe('FLAKY');
    expect(classifyAttempts([false, false, true, false]).status).toBe('FLAKY');
  });

  it('the default is 3 reruns after the first failure', () => {
    expect(RERUN_DEFAULT).toBe(3);
  });

  it('records every attempt, so the evidence can show the sequence', () => {
    expect(classifyAttempts([false, true]).attemptResults).toEqual([false, true]);
  });
});

const suite = (over: Partial<SuiteOutcome>): SuiteOutcome => ({ suite: 'unit', status: 'PASS', ...over });
const finding = (over: Partial<QaFinding>): QaFinding => ({
  id: 'f1',
  severity: 'S2',
  origin: 'first_party_observed',
  promoted: false,
  ...over,
});

describe('gate semantics', () => {
  it('a green run passes both gates with exit 0', () => {
    expect(evaluateGate('strict', [suite({})], []).exitCode).toBe(0);
    expect(evaluateGate('default', [suite({})], []).exitCode).toBe(0);
  });

  it('a failing suite fails strict; under default it warns and exits 0 (only build and smoke block default)', () => {
    expect(evaluateGate('strict', [suite({ status: 'FAIL' })], []).exitCode).toBe(1);
    const d = evaluateGate('default', [suite({ status: 'FAIL' })], []);
    expect(d.exitCode).toBe(0);
    expect(d.reasons.join(' ')).toMatch(/warning.*unit failed/);
  });

  it('strict fails on a first-party S1 or S2 finding; default only warns', () => {
    expect(evaluateGate('strict', [suite({})], [finding({ severity: 'S1' })]).exitCode).toBe(1);
    expect(evaluateGate('strict', [suite({})], [finding({ severity: 'S2' })]).exitCode).toBe(1);
    expect(evaluateGate('default', [suite({})], [finding({ severity: 'S1' })]).exitCode).toBe(0);
  });

  it('heuristic leads never fail a strict gate unless promoted', () => {
    expect(evaluateGate('strict', [suite({})], [finding({ origin: 'heuristic_lead', severity: 'S1' })]).exitCode).toBe(0);
    expect(evaluateGate('strict', [suite({})], [finding({ origin: 'heuristic_lead', severity: 'S1', promoted: true })]).exitCode).toBe(1);
  });

  it('sandbox self-reported findings do not fail the gate by themselves', () => {
    expect(evaluateGate('strict', [suite({})], [finding({ origin: 'sandbox_self_reported', severity: 'S1' })]).exitCode).toBe(0);
  });

  it('flaky is not a pass: a strict gate fails on FLAKY, the default warns', () => {
    expect(evaluateGate('strict', [suite({ status: 'FLAKY' })], []).exitCode).toBe(1);
    expect(evaluateGate('default', [suite({ status: 'FLAKY' })], []).exitCode).toBe(0);
  });

  it('a suite stopped by a failed gate is NOT_RUN and is listed, never green', () => {
    const r = evaluateGate('strict', [suite({ status: 'FAIL' }), suite({ suite: 'e2e', status: 'NOT_RUN' })], []);
    expect(r.exitCode).toBe(1);
    expect(r.reasons.join(' ')).toMatch(/e2e/);
    expect(r.reasons.join(' ')).toMatch(/not run/i);
  });

  it('a build or smoke failure fails even the default gate', () => {
    expect(evaluateGate('default', [suite({ suite: 'smoke', status: 'FAIL' })], []).exitCode).toBe(1);
  });

  it('the verdict lists its reasons so the exit is explainable', () => {
    const r = evaluateGate('strict', [suite({ status: 'FAIL' })], [finding({ severity: 'S1' })]);
    expect(r.reasons.length).toBeGreaterThanOrEqual(2);
  });
});
