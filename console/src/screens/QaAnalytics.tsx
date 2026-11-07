import { useEffect, useState } from 'react';
import { useApp } from '../app-context';
import { formatRatio, type QaAnalytics } from '../qa';
import { Card, Kpi, Loading, RetryBlock } from '../ui';

/** Fail and flake rates over suite results, suite hotspots, and the distinct findings stored for QA runs. */
export function QaAnalyticsPanel() {
  const { api, call } = useApp();
  const [data, setData] = useState<QaAnalytics | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let stale = false;
    setError(null);
    call(() => api.qaAnalytics()).then(
      (result) => { if (!stale) setData(result); },
      (failure: unknown) => { if (!stale) setError(failure); },
    );
    return () => { stale = true; };
  }, [api, call, attempt]);

  let content;
  if (error) {
    content = <RetryBlock error={error} retry={() => setAttempt((value) => value + 1)} />;
  } else if (!data) {
    content = <Loading text="Loading QA analytics" />;
  } else {
    const hotspots = [...(data.hotspots || [])].sort((a, b) => Number(b.failures) - Number(a.failures));
    const findings = [...(data.findings || [])].sort((a, b) => Number(b.buildsOpen) - Number(a.buildsOpen));
    content = (
      <>
        <section className="lv-grid lv-grid-kpi" aria-label="QA rates">
          <Kpi label="Fail rate" value={formatRatio(data.failRate || { failed: 0, total: 0 }, 'failed')} foot={`Suites that failed, across ${Number(data.runs) || 0} finished runs`} />
          <Kpi label="Flake rate" value={formatRatio(data.flakeRate || { flaky: 0, total: 0 }, 'flaky')} foot={`Suites that passed only on a rerun, across ${Number(data.runs) || 0} finished runs`} />
        </section>
        <Card title="Suite hotspots">
          {hotspots.length ? (
            <div className="lv-table-wrap">
              <table className="lv-table lv-table-compact" id="qa-hotspots">
                <caption className="sr-only">Suites by failures</caption>
                <thead><tr><th scope="col">Suite</th><th scope="col">Failures</th></tr></thead>
                <tbody>
                  {hotspots.map((spot) => (
                    <tr key={spot.suite}>
                      <td className="lv-mono">{spot.suite}</td>
                      <td className="lv-mono">{String(spot.failures)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="lv-muted">No suite failures recorded yet.</p>
          )}
        </Card>
        <Card title="Findings">
          {findings.length ? (
            <>
              <div className="lv-table-wrap">
                <table className="lv-table lv-table-compact" id="qa-findings-summary">
                  <caption className="sr-only">Distinct findings across QA runs</caption>
                  <thead><tr><th scope="col">Fingerprint</th><th scope="col">First seen at</th><th scope="col">Runs open</th></tr></thead>
                  <tbody>
                    {findings.map((f) => (
                      <tr key={f.fingerprint}>
                        <td className="lv-mono">{f.fingerprint}</td>
                        <td className="lv-mono">{(f.firstSeenSha || '').slice(0, 7) || 'unknown'}</td>
                        <td className="lv-mono">{String(f.buildsOpen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="lv-muted lv-small">
                {findings.length} distinct finding{findings.length === 1 ? '' : 's'}. Open a run to see what each one is.
              </p>
            </>
          ) : <p className="lv-muted">No findings stored yet.</p>}
        </Card>
      </>
    );
  }

  return (
    <section className="qa-analytics" id="qa-analytics" aria-labelledby="qa-analytics-title">
      <h2 id="qa-analytics-title" className="lv-card-title">Analytics</h2>
      <div id="qa-analytics-content">{content}</div>
    </section>
  );
}
