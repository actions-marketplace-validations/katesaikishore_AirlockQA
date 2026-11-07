import type { ReactNode } from 'react';
import { formatTime } from '../lib';
import type { RequestLogEntry, StepResult } from '../types';

export function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return <div className="lv-meta-item"><dt>{label}</dt><dd>{children}</dd></div>;
}

export function StepList({ steps }: { steps: StepResult[] | null | undefined }) {
  if (!steps || steps.length === 0) return <p className="lv-muted">No steps were recorded for this run.</p>;
  return (
    <ol className="lv-steps">
      {steps.map((step, index) => (
        <li key={index} className={'lv-step ' + (step.ok ? 'is-ok' : 'is-fail')}>
          <span className="lv-step-mark" aria-hidden="true">{step.ok ? '✓' : '✕'}</span>
          <div className="lv-step-body">
            <div className="lv-step-line">
              <strong className="lv-mono">{step.action}</strong>
              {step.target ? <span className="lv-wrap lv-muted">{step.target}</span> : null}
              <span className={'lv-pill ' + (step.ok ? 'lv-pill-success' : 'lv-pill-failed')}>{step.ok ? 'Passed' : 'Failed'}</span>
            </div>
            {step.detail ? <p className="lv-muted lv-small">{step.detail}</p> : null}
            {step.error ? <pre className="lv-step-error">{step.error}</pre> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

const REQUEST_HEAD = ['Time', 'Method', 'Host', 'Path', 'Verdict', 'Reason'];

export function RequestTable({ requests }: { requests: RequestLogEntry[] | null | undefined }) {
  if (!requests || requests.length === 0) return <p className="lv-muted">No requests were logged for this run.</p>;
  return (
    <div className="lv-table-wrap">
      <table className="lv-table lv-table-compact">
        <caption className="sr-only">Request log</caption>
        <thead><tr>{REQUEST_HEAD.map((title) => <th key={title} scope="col">{title}</th>)}</tr></thead>
        <tbody>
          {requests.map((entry, index) => {
            const verdict = String(entry.verdict || '');
            const pill = verdict === 'BLOCKED' ? 'lv-pill-failed' : verdict === 'SANITIZED' ? 'lv-pill-queued' : 'lv-pill-success';
            return (
              <tr key={index}>
                <td className="lv-mono">{formatTime(entry.timestamp) || entry.timestamp}</td>
                <td className="lv-mono">{entry.method}</td>
                <td className="lv-wrap">{entry.host}</td>
                <td className="lv-wrap lv-mono">{entry.path}</td>
                <td><span className={'lv-pill ' + pill}>{verdict}</span></td>
                <td className="lv-wrap">{entry.reason || ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
