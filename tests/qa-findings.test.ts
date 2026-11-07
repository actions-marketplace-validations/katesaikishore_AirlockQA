import { describe, expect, it } from 'bun:test';
import { fingerprint, severityFor, validateFinding, FINDING_CLASSES } from '../src/qa/findings.js';

const base = {
  id: 'f_1',
  klass: 'http_5xx',
  origin: 'first_party_observed',
  route: '/api/stats',
  assertion: 'GET /api/stats returns < 500',
  buildSha: 'c'.repeat(40),
  severity: 'S2',
  firstSeenRun: 'run_1',
  status: 'new',
};

describe('severity is a rule, not free text', () => {
  it('maps each class to exactly one severity', () => {
    expect(severityFor('http_5xx')).toBe('S2');
    expect(severityFor('destructive_action_taken')).toBe('S1');
    expect(severityFor('missing_alt')).toBe('S4');
  });

  it('refuses an unknown class', () => {
    expect(() => severityFor('vibes')).toThrow();
  });

  it('every class has a severity and the list is closed', () => {
    for (const k of FINDING_CLASSES) expect(['S1', 'S2', 'S3', 'S4']).toContain(severityFor(k));
  });
});

describe('fingerprint: the same bug gets the same id across runs', () => {
  it('ignores query strings, fragments and numeric ids in the route', () => {
    const a = fingerprint({ ...base, route: '/orders/1001?session=abc#x' });
    const b = fingerprint({ ...base, route: '/orders/2002?session=zzz' });
    expect(a).toBe(b);
  });

  it('changes when the class or the assertion changes', () => {
    expect(fingerprint(base)).not.toBe(fingerprint({ ...base, klass: 'uncaught_exception' }));
    expect(fingerprint(base)).not.toBe(fingerprint({ ...base, assertion: 'other' }));
  });

  it('does not depend on the run, the sha or the time', () => {
    expect(fingerprint(base)).toBe(fingerprint({ ...base, firstSeenRun: 'run_9', buildSha: 'd'.repeat(40) }));
  });
});

describe('validateFinding', () => {
  it('accepts a complete first-party finding', () => {
    expect(validateFinding(base).ok).toBe(true);
  });

  it('requires an origin label from the closed list', () => {
    expect(validateFinding({ ...base, origin: 'observed' }).ok).toBe(false);
  });

  it('refuses a severity that disagrees with the rule for its class', () => {
    expect(validateFinding({ ...base, severity: 'S4' }).ok).toBe(false);
  });

  it('refuses an unknown status', () => {
    expect(validateFinding({ ...base, status: 'closed-forever' }).ok).toBe(false);
  });

  it('refuses a missing build sha (a finding must be tied to a commit)', () => {
    expect(validateFinding({ ...base, buildSha: undefined as any }).ok).toBe(false);
  });
});
