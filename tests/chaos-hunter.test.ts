import { describe, it, expect } from 'bun:test';
import { ChaosHunter } from '../src/chaos/chaos-hunter.js';

describe('Mutation observation prototype', () => {
  it('indicates idempotency risk without claiming a double-spend was detected', async () => {
    const hunter = new ChaosHunter();

    // Mock page with minimal interface for testing
    let requestListener: ((request: any) => void) | undefined;
    const mockPage: any = {
      url: () => 'http://localhost:3000/checkout',
      on: (event: string, listener: (request: any) => void) => {
        if (event === 'request') requestListener = listener;
      },
      off: () => {},
    };

    const report = await hunter.auditMutation(
      mockPage,
      async () => {
        requestListener?.({
          url: () => 'http://localhost:3000/api/checkout',
          method: () => 'POST',
          headers: () => ({}),
          postData: () => '{}',
        });
      },
      { endpointPattern: 'checkout', simulatedBackendIdempotent: false }
    );

    expect(report.status).toBe('RISK_INDICATED');
    expect(report.executionMode).toBe('OBSERVATION_ONLY');
    expect(report.doubleSpendRiskIndicated).toBe(true);
    expect(report.doubleSpendDetected).toBe(false);
    expect(report.idempotencyEnforced).toBe(false);
    expect(report.idempotencyKeyObserved).toBe(false);
    expect(report.scenarios.length).toBe(4);

    const duplicateScenario = report.scenarios.find((c) => c.scenarioId === 'scenario_2_rapid_duplicate');
    expect(duplicateScenario?.status).toBe('RISK_INDICATED');
    expect(duplicateScenario?.durationMs).toBeNull();
    expect(duplicateScenario?.httpStatus).toBeNull();
    expect(duplicateScenario?.vulnerability?.toLowerCase()).toContain('no idempotency key');
    expect(report.summary).toContain('no duplicate was sent');
  });

  it('labels an assumed backend behavior as simulated rather than verified', async () => {
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

    expect(report.status).toBe('SIMULATED');
    expect(report.doubleSpendDetected).toBe(false);
    expect(report.doubleSpendRiskIndicated).toBe(false);
    expect(report.idempotencyAssumed).toBe(true);
    expect(report.idempotencyEnforced).toBe(false);

    const duplicateScenario = report.scenarios.find((c) => c.scenarioId === 'scenario_2_rapid_duplicate');
    expect(duplicateScenario?.status).toBe('SIMULATED');
    expect(duplicateScenario?.durationMs).toBeNull();
  });

  it('does not treat an observed key as proof of backend enforcement', async () => {
    const hunter = new ChaosHunter();
    let requestListener: ((request: any) => void) | undefined;
    const mockPage: any = {
      url: () => 'http://localhost:3000/api/charge',
      on: (event: string, listener: (request: any) => void) => {
        if (event === 'request') requestListener = listener;
      },
      off: () => {},
    };

    const report = await hunter.auditMutation(mockPage, async () => {
      requestListener?.({
        url: () => 'http://localhost:3000/api/charge',
        method: () => 'POST',
        headers: () => ({ 'idempotency-key': 'test-key' }),
        postData: () => '{}',
      });
    }, { endpointPattern: 'charge' });

    expect(report.status).toBe('OBSERVED');
    expect(report.idempotencyKeyObserved).toBe(true);
    expect(report.idempotencyEnforced).toBe(false);
    expect(report.doubleSpendDetected).toBe(false);
  });

  it('labels the terminal report as observation-only and scenarios as not run', async () => {
    const hunter = new ChaosHunter();
    const mockPage: any = {
      url: () => 'http://localhost:3000/api/transfer',
      on: () => {},
      off: () => {},
    };

    const report = await hunter.auditMutation(mockPage, async () => {}, { simulatedBackendIdempotent: true });
    const formatted = ChaosHunter.formatReport(report);

    expect(formatted).toContain('AIRLOCK MUTATION OBSERVATION REPORT');
    expect(formatted).toContain('OBSERVATION ONLY; scenarios not executed');
    expect(formatted).toContain('Target Endpoint:');
    expect(formatted).toContain('Scenario 1: Browser action observation');
    expect(formatted).toContain('Scenario 3: Connection interruption (not executed)');
  });
});
