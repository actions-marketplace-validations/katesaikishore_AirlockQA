/** Gate semantics (plan-v2 change 2). strict: blocking. default: warns, except build and smoke failures. */
export type GateMode = 'strict' | 'default';
export type SuiteStatus = 'PASS' | 'FAIL' | 'FLAKY' | 'BLOCKED' | 'NOT_RUN' | 'INCOMPLETE';

export interface SuiteOutcome {
  suite: string;
  status: SuiteStatus;
}
export interface QaFinding {
  id: string;
  severity: 'S1' | 'S2' | 'S3' | 'S4';
  origin: 'first_party_observed' | 'sandbox_self_reported' | 'heuristic_lead';
  /** A user (or a rule they accepted) moved a lead into the findings that count. */
  promoted: boolean;
}
export interface GateVerdict {
  exitCode: 0 | 1;
  reasons: string[];
}

/** Gating suites: a failure here fails every gate. */
const ALWAYS_BLOCKING = new Set(['build', 'smoke']);

export function evaluateGate(mode: GateMode, suites: SuiteOutcome[], findings: QaFinding[]): GateVerdict {
  const strict = mode === 'strict';
  const blocking: string[] = [];
  const warnings: string[] = [];
  const note = (blocks: boolean, msg: string) => (blocks ? blocking : warnings).push(msg);

  for (const s of suites) {
    if (s.status === 'NOT_RUN' || s.status === 'BLOCKED' || s.status === 'INCOMPLETE') {
      // Stopped suites are never green. They block under strict; under default they are listed as warnings.
      note(strict || ALWAYS_BLOCKING.has(s.suite), `suite ${s.suite} did not run (${s.status.toLowerCase()})`);
    } else if (s.status === 'FAIL') {
      note(strict || ALWAYS_BLOCKING.has(s.suite), `suite ${s.suite} failed`);
    } else if (s.status === 'FLAKY') {
      note(strict, `suite ${s.suite} is flaky (passed only after a rerun)`);
    }
  }

  for (const f of findings) {
    const counts = f.origin === 'first_party_observed' || f.promoted; // leads and unpromoted self-reports never count
    if (!counts) continue;
    if (f.severity === 'S1' || f.severity === 'S2') {
      note(strict, `finding ${f.id} is ${f.severity} (${f.origin}${f.promoted ? ', promoted' : ''})`);
    }
  }

  const reasons = [...blocking, ...warnings.map((w) => `warning: ${w}`)];
  return { exitCode: blocking.length > 0 ? 1 : 0, reasons };
}
