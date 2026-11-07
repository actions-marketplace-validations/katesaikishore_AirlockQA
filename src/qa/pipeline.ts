import { evaluateGate, type GateMode, type SuiteOutcome } from './gate.js';

export type PhaseName = 'lease' | 'build' | 'unit' | 'start' | 'smoke' | 'e2e' | 'release';

export interface PipelineBackends {
  lease: () => Promise<void>;
  build: () => Promise<void>;
  unit: () => Promise<void>;
  start: () => Promise<void>;
  smoke: () => Promise<void>;
  e2e: () => Promise<void>;
  release: () => Promise<void>;
}



export type RunPhase =
  | 'DONE'
  | 'SLOT_UNAVAILABLE'
  | 'BUILD_FAILED'
  | 'DEPLOY_UNHEALTHY'
  | 'CANCELLED'
  | 'TESTS_FAILED';

export interface PipelineInput {
  suites: string[];
  gate: GateMode;
  backends: PipelineBackends;
  signal?: AbortSignal;
}

export interface PipelineResult {
  phase: RunPhase;
  suites: SuiteOutcome[];
  exitCode: 0 | 1;
  reasons: string[];
  releaseError?: string;
}

/**
 * The QA run as a state machine. Order: LEASE, BUILD, UNIT, START, SMOKE, E2E, RELEASE. A failure stops the phases
 * after it; the phases that did not run are reported as NOT_RUN (never green). RELEASE always runs once a lease was
 * taken, including after failures and cancellation. Backends are injected, so the same logic drives the real worker
 * and the tests.
 */
export async function runQaPipeline(input: PipelineInput): Promise<PipelineResult> {
  const { backends, signal } = input;
  const wantsE2e = input.suites.includes('e2e');
  const wantsUnit = input.suites.includes('unit');
  const outcomes = new Map<string, SuiteOutcome['status']>();
  let leased = false;
  let releaseError: string | undefined;
  let phase: RunPhase = 'DONE';

  const cancelled = () => signal?.aborted === true;
  const attempt = async (fn: () => Promise<void>): Promise<boolean> => {
    if (cancelled()) return false;
    try {
      await fn();
      return true;
    } catch {
      return false;
    }
  };

  // Phases. Each early exit sets the phase; nothing returns from here, so release below always runs once leased.
  try {
    try {
      await backends.lease();
      leased = true;
    } catch {
      phase = 'SLOT_UNAVAILABLE';
    }

    if (phase === 'DONE' && cancelled()) phase = 'CANCELLED';

    if (phase === 'DONE') {
      if (!(await attempt(backends.build))) {
        phase = cancelled() ? 'CANCELLED' : 'BUILD_FAILED';
      } else {
        outcomes.set('build', 'PASS');
      }
    }

    if (phase === 'DONE' && wantsUnit) {
      const ok = await attempt(backends.unit);
      outcomes.set('unit', ok ? 'PASS' : 'FAIL');
      if (!ok) phase = cancelled() ? 'CANCELLED' : 'TESTS_FAILED';
    }

    if (phase === 'DONE' || phase === 'TESTS_FAILED') {
      if (cancelled()) {
        phase = 'CANCELLED';
      } else if (!(await attempt(backends.start)) || !(await attempt(backends.smoke))) {
        phase = cancelled() ? 'CANCELLED' : 'DEPLOY_UNHEALTHY';
      } else {
        outcomes.set('smoke', 'PASS');
        if (wantsE2e) {
          // e2e runs only on a green unit suite (plan-v2 B2). A unit failure stops it, and it is listed as NOT_RUN.
          const unitGreen = !wantsUnit || outcomes.get('unit') === 'PASS';
          if (unitGreen && phase === 'DONE') {
            const ok = await attempt(backends.e2e);
            outcomes.set('e2e', ok ? 'PASS' : 'FAIL');
            if (!ok) phase = cancelled() ? 'CANCELLED' : 'TESTS_FAILED';
          } else {
            outcomes.set('e2e', 'NOT_RUN');
          }
        }
      }
    }
  } finally {
    // RELEASE: runs whenever a lease was taken, including after failures and cancellation.
    if (leased) {
      try {
        await backends.release();
      } catch (err) {
        releaseError = (err as Error).message;
      }
    }
  }

  // Anything the run did not reach is NOT_RUN, never green. Every suite the caller asked for is listed.
  const suites: SuiteOutcome[] = input.suites.map((s) => ({ suite: s, status: outcomes.get(s) ?? 'NOT_RUN' }));
  const verdict = evaluateGate(input.gate, suites, []);
  const blockingPhase = ['BUILD_FAILED', 'DEPLOY_UNHEALTHY', 'SLOT_UNAVAILABLE', 'CANCELLED'].includes(phase);
  const exitCode: 0 | 1 = releaseError || blockingPhase || verdict.exitCode === 1 ? 1 : 0;
  const reasons = [...verdict.reasons];
  if (releaseError) reasons.push(`release failed: ${releaseError}`);
  return { phase, suites, exitCode, reasons, ...(releaseError ? { releaseError } : {}) };
}
