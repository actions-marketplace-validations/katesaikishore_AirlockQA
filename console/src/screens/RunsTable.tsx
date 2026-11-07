import { StatusPill } from '../ui';
import { formatDateTime, formatDuration, formatRelative, shortId, targetHost } from '../lib';
import type { RunSummary } from '../types';

export function RunsTable({ runs }: { runs: RunSummary[] }) {
  const head = ['Run', 'Status', 'Target', 'Steps', 'Duration', 'Requests', 'Started'];
  return (
    <div className="lv-table-wrap">
      <table className="lv-table">
        <caption className="sr-only">Cloud runs</caption>
        <thead><tr>{head.map((title) => <th key={title} scope="col">{title}</th>)}</tr></thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id} data-run-id={run.id} data-status={run.status}>
              <td>
                <a className="lv-link lv-run-link" href={'#run-detail/' + encodeURIComponent(run.id)}>{run.suiteName}</a>
                <div className="lv-mono lv-small lv-muted">{shortId(run.id)}</div>
              </td>
              <td>
                <StatusPill status={run.status} />
                {run.status === 'QUEUED' && run.queuePosition ? <div className="lv-small lv-muted">Position {run.queuePosition}</div> : null}
              </td>
              <td className="lv-wrap">{targetHost(run.targetUrl)}</td>
              <td className="lv-mono">{run.totalSteps ? `${run.passedSteps}/${run.totalSteps}` : '—'}</td>
              <td className="lv-mono">{formatDuration(run.executionTimeMs)}</td>
              <td className="lv-mono">{run.requestsAllowed} ok · {run.requestsBlocked} blocked</td>
              <td title={formatDateTime(run.createdAt)}>{formatRelative(run.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
