import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useApp } from '../app-context';
import { usePolling } from '../hooks';
import { formatRelative, isActive } from '../lib';
import { navigate } from '../router';
import { CodeBlock, Card, Loading, PageHeader, RetryBlock, StatusPill } from '../ui';
import { shortRepo, type QaRunSummary } from '../qa';
import { QaAnalyticsPanel } from './QaAnalytics';
import { QaForm } from './QaForm';
import { QaRunDetailScreen } from './QaRunDetail';
import './qa.css';

export function suiteSummary(run: QaRunSummary): string {
  if (!run.suites || run.suites.length === 0) return 'No suites';
  return run.suites.map((entry) => entry.suite).join(', ');
}

function QaRunList({ openForm }: { openForm: boolean }) {
  const { api, call } = useApp();
  const [runs, setRuns] = useState<QaRunSummary[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [formOpen, setFormOpen] = useState(openForm);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await call(() => api.qaRuns(50));
      setRuns(Array.isArray(data.runs) ? data.runs : []);
      setError(null);
    } catch (failure) {
      setError(failure);
    }
  }, [api, call]);

  useEffect(() => { void load(); }, [load]);
  usePolling(load, Boolean(runs && runs.some((run) => isActive(run.status))));

  const closeForm = () => {
    flushSync(() => setFormOpen(false));
    toggleRef.current?.focus();
  };

  let table;
  if (error && !runs) {
    table = <RetryBlock error={error} retry={() => { void load(); }} />;
  } else if (!runs) {
    table = <Loading text="Loading QA runs" />;
  } else if (runs.length === 0) {
    table = (
      <div className="lv-empty" id="qa-empty-state">
        <p className="lv-muted">No QA runs yet. Start one with the button above, or from your terminal:</p>
        <CodeBlock text="airlock qa --dry-run" label="Copy" />
      </div>
    );
  } else {
    table = (
      <div className="lv-table-wrap">
        <table className="lv-table lv-table-stack" id="qa-run-table">
          <caption className="sr-only">QA runs</caption>
          <thead>
            <tr>
              <th scope="col">Run</th>
              <th scope="col">Status</th>
              <th scope="col">Phase</th>
              <th scope="col">Suites</th>
              <th scope="col">Started</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td data-label="Run">
                  <a className="lv-link lv-mono" href={'#qa/' + encodeURIComponent(run.id)}>{run.id}</a>
                  {run.repo ? (
                    <div className="lv-muted lv-small qa-repo" title={run.repo}>
                      {shortRepo(run.repo)}{run.sha ? <span className="lv-mono"> @ {run.sha.slice(0, 7)}</span> : null}
                    </div>
                  ) : null}
                </td>
                <td data-label="Status"><StatusPill status={run.status} /></td>
                <td data-label="Phase" className="lv-mono">{run.phase || '—'}</td>
                <td data-label="Suites">{suiteSummary(run)}</td>
                <td data-label="Started" className="qa-nowrap">{formatRelative(run.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <main className="lv-main" id="live-qa">
      <PageHeader
        title="QA"
        subtitle="Cloud QA runs: a public repository at a commit, built and tested on Airlock Cloud. The list refreshes while a run is queued or running."
        actions={
          <button type="button" className="lv-btn lv-btn-primary" id="qa-run-toggle" ref={toggleRef} aria-expanded={formOpen} aria-controls="qa-form-panel" onClick={() => setFormOpen(!formOpen)}>
            Start QA run
          </button>
        }
      />
      <section className="lv-card" id="qa-form-panel" hidden={!formOpen} aria-labelledby="qa-form-title">
        <h2 id="qa-form-title" className="lv-card-title">Start QA run</h2>
        <QaForm
          onClose={closeForm}
          onCreated={(id) => { setFormOpen(false); navigate('qa/' + encodeURIComponent(id)); }}
        />
      </section>
      <Card title="Runs" id="qa-runs">
        {table}
      </Card>
      <QaAnalyticsPanel />
    </main>
  );
}

export default function Qa({ param }: { param: string }) {
  if (param && param !== 'new') return <QaRunDetailScreen id={param} />;
  return <QaRunList openForm={param === 'new'} />;
}
