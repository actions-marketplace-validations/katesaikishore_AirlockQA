import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../app-context';
import { usePolling } from '../hooks';
import { formatDateTime, isActive } from '../lib';
import { Card, Loading, PageHeader, RetryBlock, StatusPill } from '../ui';
import { suiteStatusLabel, verifyQaSeal, type QaRunDetail, type SealCheck } from '../qa';

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
        <dl className="lv-meta">
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

function RunBody({ run }: { run: QaRunDetail }) {
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
        <dl className="lv-meta" id="qa-run-meta">
          <div><dt>Phase</dt><dd className="lv-mono">{run.phase || 'not reported'}</dd></div>
          <div><dt>Repository</dt><dd className="lv-wrap">{run.repo || 'not reported'}</dd></div>
          <div><dt>Commit</dt><dd className="lv-mono lv-wrap">{run.sha || 'not reported'}</dd></div>
          <div><dt>Branch</dt><dd className="lv-mono">{run.branch || 'not reported'}</dd></div>
          <div><dt>Started</dt><dd>{formatDateTime(run.createdAt)}</dd></div>
        </dl>
        {run.error ? <p className="lv-alert lv-alert-error" role="alert">{run.error}</p> : null}
      </Card>
      <Card title="Suites">
        {run.suites && run.suites.length ? (
          <div className="lv-table-wrap">
            <table className="lv-table" id="qa-suite-table">
              <caption className="sr-only">Suite results</caption>
              <thead><tr><th scope="col">Suite</th><th scope="col">Status</th><th scope="col">Reasons</th></tr></thead>
              <tbody>
                {run.suites.map((entry) => (
                  <tr key={entry.suite}>
                    <td className="lv-mono">{entry.suite}</td>
                    <td className="lv-mono">{suiteStatusLabel(entry.status)}</td>
                    <td>
                      {entry.reasons && entry.reasons.length ? (
                        <ul className="qa-reasons">{entry.reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul>
                      ) : <span className="lv-muted">None reported</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="lv-muted">No suite results yet.</p>}
      </Card>
      <Card title="Gate">
        <dl className="lv-meta">
          <div><dt>Mode</dt><dd className="lv-mono">{run.gateMode || 'not reported'}</dd></div>
          <div><dt>Verdict</dt><dd>{run.gate ? (run.gate.exitCode === 0 ? 'Passed' : 'Failed (exit ' + run.gate.exitCode + ')') : 'Not decided yet'}</dd></div>
        </dl>
        {run.gate && run.gate.reasons.length ? (
          <ul className="qa-reasons">{run.gate.reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul>
        ) : null}
      </Card>
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

  if (!loaded && !run) return <Loading text="Loading QA run" />;
  if (error && !run) return <RetryBlock error={error} retry={() => { void load(); }} />;
  if (!run) return <Loading text="Loading QA run" />;
  return <div id="qa-run-detail"><RunBody run={run} /></div>;
}
