/**
 * Observation-only prototype for mutation requests.
 * It inspects one browser request and reports an idempotency-key risk indicator;
 * it does not replay requests or inject network faults.
 */

import type { Page } from 'playwright-core';
import type { ChaosAuditReport, CloneAuditResult } from '../types/index.js';
import { sha256 } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export interface ChaosAuditOptions {
  endpointPattern?: string | RegExp;
  duplicateDelayMs?: number;
  simulatedBackendIdempotent?: boolean;
}

export class ChaosHunter {
  /** Observe one mutation action and report scenarios that still need execution. */
  async auditMutation(
    page: Page,
    action: () => Promise<void>,
    options: ChaosAuditOptions = {}
  ): Promise<ChaosAuditReport> {
    const startTime = Date.now();
    const endpointPattern = options.endpointPattern || /\/(api\/.*(checkout|pay|transfer|subscribe|charge|order))/i;
    let interceptedMutationUrl = '';
    let interceptedMethod = 'POST';
    let interceptedHeaders: Record<string, string> = {};
    let observedHttpStatus: number | null = null;

    // Observe the matching browser request; no request will be replayed.
    const requestListener = (req: any) => {
      const url = req.url();
      const method = req.method();
      if ((typeof endpointPattern === 'string' ? url.includes(endpointPattern) : endpointPattern.test(url)) && method !== 'GET') {
        interceptedMutationUrl = url;
        interceptedMethod = method;
        interceptedHeaders = req.headers();
      }
    };
    const responseListener = (response: any) => {
      if (response.url() === interceptedMutationUrl) observedHttpStatus = response.status();
    };

    page.on('request', requestListener);
    page.on('response', responseListener);

    // Invoke the action once to observe its browser request.
    logger.info('Mutation observer: invoking the browser action once.');
    let actionCompleted = false;
    try {
      await action();
      actionCompleted = true;
    } catch {
      // Preserve any request captured before the browser action failed.
    } finally {
      page.off('request', requestListener);
      page.off('response', responseListener);
    }
    const observedDurationMs = Date.now() - startTime;

    if (interceptedMutationUrl) {
      logger.info(`Mutation observer: saw [${interceptedMethod}] ${interceptedMutationUrl}`);
    } else {
      logger.info('Mutation observer: no matching browser request was observed.');
    }

    const scenarios: CloneAuditResult[] = [];
    const idempotencyKeyObserved = Boolean(
      interceptedHeaders['idempotency-key'] ||
      interceptedHeaders['x-idempotency-key'] ||
      interceptedHeaders['idempotencykey']
    );
    const idempotencyAssumed = options.simulatedBackendIdempotent === true;
    const doubleSpendRiskIndicated = Boolean(interceptedMutationUrl) && !idempotencyKeyObserved && !idempotencyAssumed;

    // This is the only executed path; no clone or fault scenario is run.
    scenarios.push({
      cloneId: 'scenario_1_observation',
      scenarioId: 'scenario_1_observation',
      name: 'Scenario 1: Browser action observation',
      description: `Action callback ${actionCompleted ? 'completed' : 'failed'}; duration measures the callback, and status is from the observed response when available.`,
      status: 'OBSERVED',
      durationMs: observedDurationMs,
      httpStatus: observedHttpStatus,
      vulnerability: null,
      recommendation: null,
    });

    scenarios.push({
      cloneId: 'scenario_2_rapid_duplicate',
      scenarioId: 'scenario_2_rapid_duplicate',
      name: 'Scenario 2: Duplicate request (not executed)',
      description: 'The baseline request is inspected for an idempotency key; no duplicate is sent.',
      status: doubleSpendRiskIndicated ? 'RISK_INDICATED' : 'SIMULATED',
      durationMs: null,
      httpStatus: null,
      vulnerability: doubleSpendRiskIndicated
        ? 'No idempotency key was observed. Duplicate-request behavior and backend enforcement are unknown.'
        : null,
      recommendation: doubleSpendRiskIndicated
        ? 'Add an idempotency key and verify server-side deduplication with an executed duplicate-request test.'
        : 'Run an executed duplicate-request test to verify server-side deduplication.',
    });

    scenarios.push({
      cloneId: 'scenario_3_tcp_drop',
      scenarioId: 'scenario_3_tcp_drop',
      name: 'Scenario 3: Connection interruption (not executed)',
      description: 'A TCP interruption or packet drop was not injected.',
      status: 'SIMULATED',
      durationMs: null,
      httpStatus: null,
      vulnerability: null,
      recommendation: 'Run a controlled connection-interruption test and verify retry and form-state behavior.',
    });

    scenarios.push({
      cloneId: 'scenario_4_502_webhook_retry',
      scenarioId: 'scenario_4_502_webhook_retry',
      name: 'Scenario 4: 502 and delayed webhook (not executed)',
      description: 'No proxy error was injected and no webhook was delayed or replayed.',
      status: 'SIMULATED',
      durationMs: null,
      httpStatus: null,
      vulnerability: null,
      recommendation: 'Test the 502 and delayed-webhook path with a controlled server fixture.',
    });

    const reportId = `chaos_${sha256(interceptedMutationUrl + Date.now()).substring(0, 12)}`;

    const report: ChaosAuditReport = {
      id: reportId,
      timestamp: new Date().toISOString(),
      targetEndpoint: interceptedMutationUrl || 'Not observed',
      status: doubleSpendRiskIndicated ? 'RISK_INDICATED' : interceptedMutationUrl ? 'OBSERVED' : 'SIMULATED',
      executionMode: 'OBSERVATION_ONLY',
      scenarios,
      clones: scenarios,
      idempotencyKeyObserved,
      idempotencyAssumed,
      idempotencyEnforced: false,
      doubleSpendDetected: false,
      doubleSpendRiskIndicated,
      summary: doubleSpendRiskIndicated
        ? `RISK INDICATED: No idempotency key was observed on ${interceptedMutationUrl}; no duplicate was sent and backend enforcement is unknown.`
        : interceptedMutationUrl
          ? `OBSERVED: One browser action request was observed at ${interceptedMutationUrl}; duplicate and network-fault scenarios were not executed.`
          : 'SIMULATED: No matching mutation request was observed; no duplicate or network-fault scenario was executed.',
    };

    logger.info(`Mutation observation complete for ${interceptedMutationUrl} [${report.status}]; no chaos scenario was executed.`);
    return report;
  }

  /**
   * Format chaos audit report into clean terminal box
   */
  static formatReport(report: ChaosAuditReport): string {
    const divider = '─'.repeat(72);
    const lines: string[] = [
      `┌${divider}┐`,
      `│ QAFIND MUTATION OBSERVATION REPORT                                     │`,
      `├${divider}┤`,
      `│ Target Endpoint: ${(report.targetEndpoint || 'No matching request observed').padEnd(53).substring(0, 53)} │`,
      `│ Status:          ${(report.status === 'RISK_INDICATED' ? '⚠ RISK INDICATED (NOT REPLAYED)' : report.status === 'OBSERVED' ? 'ℹ OBSERVED (SCENARIOS NOT RUN)' : 'ℹ SIMULATED (NO FAULTS APPLIED)').padEnd(53)} │`,
      `│ Execution:       ${'OBSERVATION ONLY; scenarios not executed'.padEnd(53)} │`,
      `│ Idempotency:     ${(report.idempotencyKeyObserved ? 'Key observed; backend not verified' : report.idempotencyAssumed ? 'Backend idempotency assumed' : 'No key observed; backend unknown').padEnd(53)} │`,
      `├${divider}┤`,
    ];

    for (const c of report.scenarios) {
      const statusIcon = c.status === 'OBSERVED' ? 'ℹ [OBSERVED]' : c.status === 'RISK_INDICATED' ? '⚠ [RISK]' : '– [NOT RUN]';
      lines.push(`│ ${statusIcon} ${c.name.padEnd(63).substring(0, 63)} │`);
      if (c.vulnerability) {
        lines.push(`│   ⚠️  Vulnerability: ${c.vulnerability.padEnd(51).substring(0, 51)} │`);
      }
      if (c.recommendation) {
        lines.push(`│   💡 Fix: ${c.recommendation.padEnd(62).substring(0, 62)} │`);
      }
    }

    lines.push(`└${divider}┘`);
    return lines.join('\n');
  }
}
