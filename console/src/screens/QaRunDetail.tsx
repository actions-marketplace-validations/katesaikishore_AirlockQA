import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../app-context';
import { usePolling } from '../hooks';
import { formatDateTime, isActive } from '../lib';
import { Card, Loading, PageHeader, RetryBlock, StatusPill } from '../ui';
import { cleanReason, findingSource, gateVerdict, reasonsForSuite, suiteStatusLabel, verifyQaSeal, type QaFinding, type QaRunDetail, type SealCheck } from '../qa';

const SEAL_COPY: Record<SealCheck['state'], { title: string; body: string; tone: string }> = {
  verified: {
    title: 'Signature verified in this browser',
    body: 'The sealed result matches the signature under the key the service published with it.',
    tone: 'qa-seal-verified',
  },
  invalid: {
    title: 'Signature does not match the sealed result',
    body: 'The sealed result was changed after it was signed, or the signature is wrong. Do not rely on this run.',
    tone: 'qa-seal-bad',
  },
  unavailable: {
    title: 'Not verified in this browser',
    body: 'This browser cannot check Ed25519 signatures. The algorithm, signature and key id are shown for a manual check. Verify the seal with the airlock CLI.',
    tone: 'qa-seal-unverified',
  },
  unsupported: {
    title: 'Not verified: not an Ed25519 seal',
    body: 'The sealed result uses a signing algorithm this page does not check.',
    tone: 'qa-seal-unverified',
  },
  missing: {
    title: 'No sealed result',
    body: 'There is no signed result for this run yet.',
    tone: 'qa-seal-unverified',
  },
};

const CHECKING_COPY = { title: 'Checking the seal', body: 'Verifying the signature in this browser.', tone: 'qa-seal-unverified' };

interface EvidenceShape {
  algorithm?: unknown;
  seal?: unknown;
  signature?: unknown;
  publicKeyPem?: unknown;
  keyId?: unknown;
}

function SealCard({ evidence }: { evidence: unknown | null }) {
  const [check, setCheck] = useState<SealCheck | null>(null);
  useEffect(() => {
    let stale = false;
    setCheck(null);
    void verifyQaSeal(evidence).then((result) => { if (!stale) setCheck(result); });
    return () => { stale = true; };
  }, [evidence]);

  const copy = check ? SEAL_COPY[check.state] : evidence ? CHECKING_COPY : SEAL_COPY.missing;
  const shape = (evidence && typeof evidence === 'object' ? evidence : null) as EvidenceShape | null;
  return (
    <Card title="Sealed result">
      <p className={'qa-seal-state ' + copy.tone} id="qa-seal-state" role="status">{copy.title}</p>
      <p className="lv-muted lv-small">{copy.body}</p>
      {shape ? (
        <dl className="lv-meta qa-meta">
          <div><dt>Algorithm</dt><dd className="lv-mono">{typeof shape.algorithm === 'string' ? shape.algorithm : 'not reported'}</dd></div>
          <div><dt>Key id</dt><dd className="lv-mono lv-wrap">{typeof shape.keyId === 'string' ? shape.keyId : 'not reported'}</dd></div>
          <div><dt>Signature</dt><dd className="lv-mono lv-wrap">{typeof shape.signature === 'string' ? shape.signature : 'not reported'}</dd></div>
        </dl>
      ) : null}
      {shape && shape.seal !== undefined ? (
        <details className="lv-details">
          <summary>Show the sealed fields</summary>
          <pre className="lv-code"><code>{JSON.stringify(shape.seal, null, 2)}</code></pre>
        </details>
      ) : null}
    </Card>
  );
}

const SEVERITY_ORDER: Record<string, number> = { S1: 1, S2: 2, S3: 3, S4: 4 };

function FindingsCard({ findings }: { findings: QaFinding[] | undefined }) {
  const list = [...(findings ?? [])].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9) ||
      (a.origin === b.origin ? 0 : a.origin === 'first_party_observed' ? -1 : 1) ||
      a.klass.localeCompare(b.klass),
  );
  const firstParty = list.filter((f) => f.origin === 'first_party_observed').length;
  return (
    <Card title="Findings">
      {list.length ? (
        <>
          <div className="lv-table-wrap">
            <table className="lv-table lv-table-stack" id="qa-findings-table">
              <caption className="sr-only">Findings from this run</caption>
              <thead><tr><th scope="col">Severity</th><th scope="col">Finding</th><th scope="col">Route</th><th scope="col">Seen by</th></tr></thead>
              <tbody>
                {list.map((f) => (
                  <tr key={f.fingerprint}>
                    <td data-label="Severity" className="lv-mono">{f.severity}</td>
                    <td data-label="Finding">{f.assertion} <span className="lv-muted lv-mono">({f.klass})</span></td>
                    <td data-label="Route" className="lv-mono">{f.route}</td>
                    <td data-label="Seen by">
                      <span className={'qa-source ' + (f.origin === 'first_party_observed' ? 'qa-source-first' : 'qa-source-self')}>{findingSource(f.origin)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="lv-muted lv-small">
            {firstParty} seen by Airlock&rsquo;s checker, which visited and clicked through the running app from its own
            container; {list.length - firstParty} from your app&rsquo;s own test output (self-reported). A failing test that no
            rule names is listed as failing_test.
          </p>
        </>
      ) : <p className="lv-muted">No findings for this run.</p>}
    </Card>
  );
}

function RunBody({ run }: { run: QaRunDetail }) {
  const gateReasons = run.gate?.reasons ?? [];
  return (
    <>
      <PageHeader
        title="QA run"
        subtitle={
          <span>
            <span id="qa-run-status"><StatusPill status={run.status} /></span>{' '}
            <span className="lv-mono lv-wrap" id="qa-run-id">{run.id}</span>
          </span>
        }
      />
      <Card title="Run">
        <dl className="lv-meta qa-meta" id="qa-run-meta">
          <div><dt>Phase</dt><dd className="lv-mono">{run.phase || 'not reported'}</dd></div>
          <div><dt>Repository</dt><dd className="lv-wrap">{run.repo || 'not reported'}</dd></div>
          <div><dt>Commit</dt><dd className="lv-mono lv-wrap">{run.sha || 'not reported'}</dd></div>
          <div><dt>Branch</dt><dd className="lv-mono">{run.branch || 'not reported'}</dd></div>
          <div><dt>Started</dt><dd>{formatDateTime(run.createdAt)}</dd></div>
        </dl>
        {run.error && gateReasons.length === 0 ? <p className="lv-alert lv-alert-error" role="alert">{run.error}</p> : null}
      </Card>
      <Card title="Suites">
        {run.suites && run.suites.length ? (
          <div className="lv-table-wrap">
            <table className="lv-table lv-table-stack" id="qa-suite-table">
              <caption className="sr-only">Suite results</caption>
              <thead><tr><th scope="col">Suite</th><th scope="col">Status</th><th scope="col">Reasons</th></tr></thead>
              <tbody>
                {run.suites.map((entry) => {
                  const reasons = entry.reasons && entry.reasons.length ? entry.reasons : reasonsForSuite(gateReasons, entry.suite);
                  return (
                  <tr key={entry.suite}>
                    <td data-label="Suite" className="lv-mono">{entry.suite}</td>
                    <td data-label="Status" className="lv-mono">{suiteStatusLabel(entry.status)}</td>
                    <td data-label="Reasons">
                      {reasons.length ? (
                        <ul className="qa-reasons">{reasons.map((reason, index) => <li key={index}>{cleanReason(reason)}</li>)}</ul>
                      ) : <span className="lv-muted">None reported</span>}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <p className="lv-muted">No suite results yet.</p>}
      </Card>
      <Card title="Gate">
        <dl className="lv-meta qa-meta">
          <div><dt>Mode</dt><dd className="lv-mono">{run.gateMode || 'not reported'}</dd></div>
          {run.gate && typeof run.gate.continueOnFailure === 'boolean' ? (
            <div><dt>Continue on failure</dt><dd>{run.gate.continueOnFailure ? 'Yes' : 'No'}</dd></div>
          ) : null}
          <div><dt>Verdict</dt><dd id="qa-gate-verdict">{gateVerdict(run.gate, run.gateMode)}</dd></div>
        </dl>
        {gateReasons.filter((r) => r.startsWith('warning: ') || !/^[a-z0-9]+: /.test(r)).length ? (
          <ul className="qa-reasons">
            {gateReasons.filter((r) => r.startsWith('warning: ') || !/^[a-z0-9]+: /.test(r)).map((reason, index) => <li key={index}>{reason}</li>)}
          </ul>
        ) : null}
      </Card>
      <FindingsCard findings={run.findings} />
      <SealCard evidence={run.evidence} />
    </>
  );
}

export function QaRunDetailScreen({ id }: { id: string }) {
  const { api, call } = useApp();
  const [run, setRun] = useState<QaRunDetail | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await call(() => api.qaRun(id));
      setRun(data);
      setError(null);
    } catch (failure) {
      setError(failure);
    } finally {
      setLoaded(true);
    }
  }, [api, call, id]);

  useEffect(() => { setRun(null); setLoaded(false); void load(); }, [load]);
  usePolling(load, Boolean(run && isActive(run.status)));

  let body;
  if (!loaded && !run) body = <Loading text="Loading QA run" />;
  else if (error && !run) body = <RetryBlock error={error} retry={() => { void load(); }} />;
  else if (!run) body = <Loading text="Loading QA run" />;
  else body = <div id="qa-run-detail"><RunBody run={run} /></div>;
  return <main className="lv-main" id="live-qa-run">{body}</main>;
}
