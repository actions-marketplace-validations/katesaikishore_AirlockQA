import { describe, it, expect } from 'bun:test';
import { ChaosHunter } from '../src/chaos/chaos-hunter.js';

describe('Deterministic Chaos & Race-Condition Hunter', () => {
  it('detects double-spend race condition when mutation lacks Idempotency-Key', async () => {
    const hunter = new ChaosHunter();

    // Mock page with minimal interface for testing
    const mockPage: any = {
      url: () => 'http://localhost:3000/checkout',
      on: (_event: string, _fn: any) => {},
      off: (_event: string, _fn: any) => {},
    };

    const report = await hunter.auditMutation(
      mockPage,
      async () => {},
      { endpointPattern: 'checkout', simulatedBackendIdempotent: false }
    );

    expect(report.status).toBe('VULNERABILITY_FOUND');
    expect(report.doubleSpendDetected).toBe(true);
    expect(report.idempotencyEnforced).toBe(false);
    expect(report.clones.length).toBe(4);

    const clone2 = report.clones.find((c) => c.cloneId === 'clone_2_rapid_duplicate');
    expect(clone2?.status).toBe('VULNERABILITY_DETECTED');
    expect(clone2?.vulnerability).toContain('Double-Charge Race Condition');
  });

  it('passes audit when endpoint enforces idempotency protection', async () => {
    const hunter = new ChaosHunter();

    const mockPage: any = {
      url: () => 'http://localhost:3000/api/v1/charge',
      on: (_event: string, _fn: any) => {},
      off: (_event: string, _fn: any) => {},
    };

    const report = await hunter.auditMutation(
      mockPage,
      async () => {},
      { endpointPattern: 'charge', simulatedBackendIdempotent: true }
    );

    expect(report.status).toBe('PASSED');
    expect(report.doubleSpendDetected).toBe(false);
    expect(report.idempotencyEnforced).toBe(true);

    const clone2 = report.clones.find((c) => c.cloneId === 'clone_2_rapid_duplicate');
    expect(clone2?.status).toBe('PASSED');
  });

  it('renders clean terminal audit report table', async () => {
    const hunter = new ChaosHunter();
    const mockPage: any = {
      url: () => 'http://localhost:3000/api/transfer',
      on: () => {},
      off: () => {},
    };

    const report = await hunter.auditMutation(mockPage, async () => {}, { simulatedBackendIdempotent: true });
    const formatted = ChaosHunter.formatReport(report);

    expect(formatted).toContain('AIRLOCK DETERMINISTIC CHAOS & RACE-CONDITION AUDIT REPORT');
    expect(formatted).toContain('Target Endpoint:');
    expect(formatted).toContain('Clone 1: Normal Execution (Baseline)');
  });
});
