/** How many times a failing test is re-run after its first failure (plan-v2 D4). */
export const RERUN_DEFAULT = 3;

export type AttemptStatus = 'PASS' | 'FAIL' | 'FLAKY';
export interface Classification {
  status: AttemptStatus;
  /** deterministic: failed every attempt. intermittent: mixed results. passed: passed first time. */
  kind: 'passed' | 'deterministic' | 'intermittent';
  attempts: number;
  attemptResults: boolean[];
}

/**
 * Classify a test from its attempts (true = passed). Nothing is hidden: a test that passed only on a re-run is FLAKY,
 * never PASS. A test that never passed is FAIL. Every attempt is kept so the evidence can show the sequence.
 */
export function classifyAttempts(attemptResults: boolean[]): Classification {
  if (attemptResults.length === 0) throw new Error('classifyAttempts needs at least one attempt');
  const attempts = attemptResults.length;
  if (attemptResults[0] === true) {
    return attemptResults.every(Boolean)
      ? { status: 'PASS', kind: 'passed', attempts, attemptResults: [...attemptResults] }
      : { status: 'FLAKY', kind: 'intermittent', attempts, attemptResults: [...attemptResults] };
  }
  if (attemptResults.some(Boolean)) {
    return { status: 'FLAKY', kind: 'intermittent', attempts, attemptResults: [...attemptResults] };
  }
  return { status: 'FAIL', kind: 'deterministic', attempts, attemptResults: [...attemptResults] };
}
