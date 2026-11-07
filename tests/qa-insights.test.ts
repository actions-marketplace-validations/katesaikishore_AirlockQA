import { describe, expect, it } from 'bun:test';
import { parseRequirementTags, requirementMatrix, regressionDelta, runAnalytics } from '../src/qa/insights.js';

describe('requirement tags (self-reported: they come from the user\'s own test titles)', () => {
  it('reads @req:ID tags from test titles', () => {
    expect(parseRequirementTags('checkout creates one order @req:CHK-1 @req:CHK-2')).toEqual(['CHK-1', 'CHK-2']);
    expect(parseRequirementTags('no tags here')).toEqual([]);
  });

  it('a test title with a malformed tag is ignored, not guessed', () => {
    expect(parseRequirementTags('x @req:1start @req:')).toEqual([]);
  });

  it('the matrix lists covered, uncovered and failing requirements, and labels the source', () => {
    const m = requirementMatrix({
      requirements: ['CHK-1', 'CHK-2', 'LOGIN-1'],
      tests: [
        { title: 'order @req:CHK-1', status: 'PASS' },
        { title: 'order twice @req:CHK-2', status: 'FAIL' },
      ],
    });
    expect(m.covered).toEqual(['CHK-1', 'CHK-2']);
    expect(m.uncovered).toEqual(['LOGIN-1']);
    expect(m.failing).toEqual(['CHK-2']);
    expect(m.source).toBe('sandbox_self_reported');
  });

  it('without a requirements list, only tagged coverage is reported and it says so', () => {
    const m = requirementMatrix({ requirements: undefined, tests: [{ title: 'a @req:X', status: 'PASS' }] });
    expect(m.uncovered).toEqual([]);
    expect(m.note).toMatch(/no requirements list/);
  });
});

describe('regression delta against an accepted baseline', () => {
  it('lists new failures, fixed tests, and new flakes', () => {
    const d = regressionDelta(
      { 'login works': 'PASS', 'checkout': 'FAIL', 'search': 'PASS' },
      { 'login works': 'FAIL', 'checkout': 'PASS', 'search': 'FLAKY', 'profile': 'PASS' }
    );
    expect(d.newFailures).toEqual(['login works']);
    expect(d.fixed).toEqual(['checkout']);
    expect(d.newFlaky).toEqual(['search']);
    expect(d.added).toEqual(['profile']);
  });

  it('an unchanged run has zero regressions', () => {
    const same = { a: 'PASS', b: 'FAIL' };
    const d = regressionDelta(same, { ...same });
    expect(d.newFailures).toEqual([]);
    expect(d.newFlaky).toEqual([]);
  });

  it('a test that disappeared is reported, not hidden', () => {
    expect(regressionDelta({ a: 'PASS' }, {}).removed).toEqual(['a']);
  });
});

describe('run analytics (computed from stored runs; flake and failure rates are shown with their counts)', () => {
  const runs = [
    { sha: 'a'.repeat(40), suites: [{ suite: 'unit', status: 'PASS' }, { suite: 'e2e', status: 'FAIL' }], findings: [{ fingerprint: 'f1', firstSeenSha: 'a'.repeat(40) }] },
    { sha: 'b'.repeat(40), suites: [{ suite: 'unit', status: 'FLAKY' }, { suite: 'e2e', status: 'FAIL' }], findings: [{ fingerprint: 'f1', firstSeenSha: 'a'.repeat(40) }] },
    { sha: 'c'.repeat(40), suites: [{ suite: 'unit', status: 'PASS' }, { suite: 'e2e', status: 'PASS' }], findings: [] },
  ];

  it('reports pass, fail and flake rates with the counts behind them', () => {
    const a = runAnalytics(runs);
    expect(a.runs).toBe(3);
    expect(a.suiteResults).toBe(6);
    expect(a.flakeRate).toEqual({ flaky: 1, total: 6 });
    expect(a.failRate).toEqual({ failed: 2, total: 6 });
  });

  it('shows per-suite hotspots, the most failing suite first', () => {
    const a = runAnalytics(runs);
    expect(a.hotspots[0]).toMatchObject({ suite: 'e2e', failures: 2 });
  });

  it('tracks each finding from the build it was first seen on (fault aging, in builds)', () => {
    const a = runAnalytics(runs);
    expect(a.findings).toEqual([{ fingerprint: 'f1', firstSeenSha: 'a'.repeat(40), buildsOpen: 2 }]);
  });

  it('an empty history gives empty numbers, not a NaN', () => {
    const a = runAnalytics([]);
    expect(a.failRate).toEqual({ failed: 0, total: 0 });
    expect(a.hotspots).toEqual([]);
  });
});
