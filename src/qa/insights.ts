/** Requirement tags come from the user's own test titles. Their coverage is therefore self-reported, not verified. */
export const REQ_TAG_RE = /@req:([A-Za-z][A-Za-z0-9-]{0,39})\b/g;

export function parseRequirementTags(title: string): string[] {
  const out: string[] = [];
  for (const m of title.matchAll(REQ_TAG_RE)) out.push(m[1]);
  return out;
}

export interface TaggedTest {
  title: string;
  status: string;
}

export function requirementMatrix(input: { requirements?: string[]; tests: TaggedTest[] }): {
  source: 'sandbox_self_reported';
  covered: string[];
  uncovered: string[];
  failing: string[];
  note?: string;
} {
  const byReq = new Map<string, string[]>();
  for (const t of input.tests) {
    for (const r of parseRequirementTags(t.title)) byReq.set(r, [...(byReq.get(r) ?? []), t.status]);
  }
  const covered = [...byReq.keys()].sort();
  const failing = covered.filter((r) => (byReq.get(r) ?? []).some((s) => s === 'FAIL'));
  if (!input.requirements) {
    return { source: 'sandbox_self_reported', covered, uncovered: [], failing, note: 'no requirements list configured: only tagged coverage is shown' };
  }
  const uncovered = input.requirements.filter((r) => !byReq.has(r)).sort();
  return { source: 'sandbox_self_reported', covered: covered.filter((r) => input.requirements!.includes(r)), uncovered, failing };
}

/** Compare a run with an accepted baseline (test title -> status). Removed tests are listed, never hidden. */
export function regressionDelta(baseline: Record<string, string>, current: Record<string, string>): {
  newFailures: string[];
  fixed: string[];
  newFlaky: string[];
  added: string[];
  removed: string[];
} {
  const names = new Set([...Object.keys(baseline), ...Object.keys(current)]);
  const d = { newFailures: [] as string[], fixed: [] as string[], newFlaky: [] as string[], added: [] as string[], removed: [] as string[] };
  for (const n of [...names].sort()) {
    const before = baseline[n];
    const now = current[n];
    if (before === undefined) d.added.push(n);
    else if (now === undefined) d.removed.push(n);
    else {
      if (before !== 'FAIL' && now === 'FAIL') d.newFailures.push(n);
      if (before === 'FAIL' && now === 'PASS') d.fixed.push(n);
      if (before !== 'FLAKY' && now === 'FLAKY') d.newFlaky.push(n);
    }
  }
  return d;
}

export interface StoredRun {
  sha: string;
  suites: Array<{ suite: string; status: string }>;
  findings: Array<{ fingerprint: string; firstSeenSha: string }>;
}

/** Analytics over stored runs in the order given (oldest first). Every rate carries its counts. */
export function runAnalytics(runs: StoredRun[]) {
  const results = runs.flatMap((r) => r.suites);
  const total = results.length;
  const failed = results.filter((s) => s.status === 'FAIL').length;
  const flaky = results.filter((s) => s.status === 'FLAKY').length;
  const perSuite = new Map<string, number>();
  for (const s of results) if (s.status === 'FAIL') perSuite.set(s.suite, (perSuite.get(s.suite) ?? 0) + 1);
  const hotspots = [...perSuite.entries()]
    .map(([suite, failures]) => ({ suite, failures }))
    .sort((a, b) => b.failures - a.failures || a.suite.localeCompare(b.suite));

  const shas = runs.map((r) => r.sha);
  const seen = new Map<string, { fingerprint: string; firstSeenSha: string; lastSeenIndex: number }>();
  runs.forEach((r, i) => {
    for (const f of r.findings) {
      const prev = seen.get(f.fingerprint);
      seen.set(f.fingerprint, { fingerprint: f.fingerprint, firstSeenSha: prev?.firstSeenSha ?? f.firstSeenSha, lastSeenIndex: i });
    }
  });
  const findings = [...seen.values()].map((f) => ({
    fingerprint: f.fingerprint,
    firstSeenSha: f.firstSeenSha,
    buildsOpen: shas.indexOf(f.firstSeenSha) >= 0 ? f.lastSeenIndex - shas.indexOf(f.firstSeenSha) + 1 : 0,
  }));

  return {
    runs: runs.length,
    suiteResults: total,
    failRate: { failed, total },
    flakeRate: { flaky, total },
    hotspots,
    findings,
  };
}
