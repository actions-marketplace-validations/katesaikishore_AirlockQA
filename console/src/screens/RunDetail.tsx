import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useApp } from '../app-context';
import { ApiError } from '../api';
import { usePolling } from '../hooks';
import { describeError, failureLabel, formatDateTime, formatDuration, isActive } from '../lib';
import type { RunDetail as RunDetailData } from '../types';
import { Card, Loading, RetryBlock, StatusPill, useConfirm } from '../ui';
import { MetaItem, RequestTable, StepList } from './RunSteps';

const STATUS_WORDS: Record<string, string> = {
  SUCCESS: 'passed', FAILED: 'failed', POLICY_VIOLATION: 'policy blocked', CANCELLED: 'cancelled', RUNNING: 'running', QUEUED: 'queued',
};

function EvidenceCard({ run }: { run: RunDetailData }) {
  const evidence = run.evidence;
  return (
    <Card title="Evidence">
      {evidence ? (
        <div>
          <dl className="lv-meta">
            <MetaItem label="Merkle root"><span className="lv-mono lv-wrap">{evidence.merkleRoot}</span></MetaItem>
            <MetaItem label="Signature"><span className="lv-mono lv-wrap">{evidence.signature}</span></MetaItem>
            <MetaItem label="Algorithm">{evidence.signingAlgorithm}</MetaItem>
            <MetaItem label="Key id"><span className="lv-mono lv-wrap">{evidence.keyId}</span></MetaItem>
            <MetaItem label="Ledger blocks">{String(evidence.blocksCount)}</MetaItem>
          </dl>
          <p className="lv-muted lv-small">Check it on the <a href="#evidence">Evidence page</a> or with <code>qafind audit &lt;bundle.json&gt;</code>.</p>
        </div>
      ) : (
        <p className="lv-muted">{isActive(run.status) ? 'Evidence is signed when the run finishes.' : 'This run has no evidence bundle.'}</p>
      )}
    </Card>
  );
}

interface RunBodyProps {
  run: RunDetailData;
  cancelPending: boolean;
  downloading: boolean;
  onCancel: () => void;
  onDownload: () => void;
  titleRef: RefObject<HTMLHeadingElement | null>;
}

function RunBody({ run, cancelPending, downloading, onCancel, onDownload, titleRef }: RunBodyProps) {
  const showDownload = Boolean(run.hasEvidence || run.evidence);
  const active = isActive(run.status);
  const by = run.createdBy;
  return (
    <>
      <div className="lv-head">
        <div className="lv-head-text">
          <h1 className="lv-title" id="run-detail-title" tabIndex={-1} ref={titleRef}>{run.suiteName}</h1>
          <p className="lv-sub">
            <span id="run-detail-status"><StatusPill status={run.status} /></span>{' '}
            <span className="lv-mono lv-wrap" id="run-detail-id">{run.id}</span>
            {run.status === 'QUEUED' && run.queuePosition ? <span className="lv-muted">{' · Position ' + run.queuePosition + ' in the queue'}</span> : null}
          </p>
        </div>
        {showDownload || active ? (
          <div className="lv-actions">
            {showDownload ? <button type="button" className="lv-btn" id="download-evidence" disabled={downloading} onClick={onDownload}>Download evidence</button> : null}
            {active ? (
              <button type="button" className="lv-btn lv-btn-danger" id="cancel-run" disabled={cancelPending} onClick={onCancel}>
                {cancelPending ? 'Cancelling...' : 'Cancel run'}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {run.status === 'CANCELLED' ? (
        <div className="lv-alert lv-alert-info" id="run-cancelled"><strong>This run was cancelled.</strong></div>
      ) : run.failureReason || run.error ? (
        <div className="lv-alert lv-alert-error" id="run-failure">
          <strong>{failureLabel(run.failureReason) || 'The run did not complete'}</strong>
          {run.error ? <p className="lv-wrap">{run.error}</p> : null}
        </div>
      ) : null}

      <Card title="Summary">
        <dl className="lv-meta">
          <MetaItem label="Target">{run.targetUrl}</MetaItem>
          <MetaItem label="Workflow">{run.workflowName || '—'}</MetaItem>
          <MetaItem label="Queued">{formatDateTime(run.createdAt)}</MetaItem>
          <MetaItem label="Started">{formatDateTime(run.startedAt)}</MetaItem>
          <MetaItem label="Finished">{formatDateTime(run.finishedAt)}</MetaItem>
          <MetaItem label="Duration">{formatDuration(run.executionTimeMs)}</MetaItem>
          <MetaItem label="Steps">{run.totalSteps ? `${run.passedSteps} passed, ${run.failedSteps} failed of ${run.totalSteps}` : '—'}</MetaItem>
          <MetaItem label="Requests">{`${run.requestsAllowed} allowed, ${run.requestsBlocked} blocked`}</MetaItem>
          <MetaItem label="Started by">{by ? `${by.label} (${by.type === 'key' ? 'API key' : 'console session'})` : '—'}</MetaItem>
        </dl>
      </Card>
      <Card title="Steps"><StepList steps={run.steps} /></Card>
      <Card title="Request log"><RequestTable requests={run.requests} /></Card>
      <EvidenceCard run={run} />
    </>
  );
}

/** Keyed by run id: every run starts with fresh state, so nothing (errors, pending downloads, focus moves) leaks between runs. */
export default function RunDetail({ param }: { param: string }) {
  return <RunDetailScreen key={param} param={param} />;
}

function RunDetailScreen({ param }: { param: string }) {
  const { api, call, toast, announce, refreshUsage, reportRuns } = useApp();
  const [confirm, dialog] = useConfirm();
  const [run, setRun] = useState<RunDetailData | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [cancelRequested, setCancelRequested] = useState<ReadonlySet<string>>(new Set());
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const currentId = useRef(param);
  const previous = useRef<RunDetailData | null>(null);
  currentId.current = param;

  /** Shows `next` unless it is for another run; announces a status change and refreshes usage when a run finishes. */
  const apply = useCallback((id: string, next: RunDetailData) => {
    if (currentId.current !== id) return;
    const before = previous.current && previous.current.id === id ? previous.current : null;
    previous.current = next;
    setRun(next);
    setError(null);
    if (before && before.status !== next.status) {
      announce('Run ' + next.suiteName + ' is now ' + (STATUS_WORDS[next.status] || next.status));
      if (isActive(before.status) && !isActive(next.status)) void refreshUsage();
    }
  }, [announce, refreshUsage]);

  useEffect(() => {
    if (!param) { window.location.hash = 'runs'; return undefined; }
    let stale = false;
    previous.current = null;
    setRun(null);
    setError(null);
    setCancelling(false);
    call(() => api.runs.get(param)).then(
      (loaded) => { if (!stale) apply(param, loaded); },
      (failure: unknown) => { if (!stale) setError(failure); },
    );
    return () => { stale = true; };
  }, [param, attempt, api, call, apply]);

  useEffect(() => {
    if (run) reportRuns('detail', [run]);
  }, [run, reportRuns]);
  useEffect(() => () => reportRuns('detail', []), [reportRuns]);
  // Arriving on a run moves focus to its title once the run has loaded (the heading does not exist before that).
  const loadedId = run ? run.id : null;
  useEffect(() => { if (loadedId) titleRef.current?.focus({ preventScroll: true }); }, [loadedId]);

  usePolling(async () => {
    const id = currentId.current;
    apply(id, await call(() => api.runs.get(id)));
  }, Boolean(run && run.id === param && isActive(run.status)));

  const download = async () => {
    if (!run) return;
    setDownloading(true);
    try {
      const bundle = await call(() => api.runs.evidence(run.id));
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'qafind-evidence-' + run.id + '.json';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast('Evidence downloaded');
    } catch (failure) {
      toast(describeError(failure).message);
    } finally {
      setDownloading(false);
    }
  };

  const cancel = async () => {
    if (!run) return;
    const target = run;
    const confirmed = await confirm({
      title: 'Cancel this run?',
      message: target.status === 'QUEUED'
        ? 'The run is still queued. A cancelled queued run is usually refunded to your daily quota, but refunds have a daily limit.'
        : 'The run is stopped at its next heartbeat. It still counts toward your daily quota.',
      confirmLabel: 'Cancel run',
      cancelLabel: 'Keep running',
      danger: true,
    });
    if (!confirmed) return;
    setCancelling(true);
    try {
      const updated = await call(() => api.runs.cancel(target.id));
      apply(target.id, { ...target, ...updated });
      if (updated && updated.status === 'CANCELLED') {
        setCancelRequested((current) => { const next = new Set(current); next.delete(target.id); return next; });
        announce('Run cancelled');
      } else {
        setCancelRequested((current) => new Set(current).add(target.id));
        announce('Cancellation requested. The run will stop shortly.');
        toast('Cancellation requested. The run will stop shortly.');
      }
      void refreshUsage();
      // The cancel button may now be disabled or gone: keep keyboard focus on the page.
      titleRef.current?.focus({ preventScroll: true });
    } catch (failure) {
      toast(describeError(failure).message);
    } finally {
      setCancelling(false);
    }
  };

  let content;
  if (error && !run) {
    content = error instanceof ApiError && error.status === 404 ? (
      <div className="lv-empty">
        <h2 className="lv-card-title">Run not found</h2>
        <p className="lv-muted">It may belong to another workspace or no longer exist.</p>
        <a className="lv-btn" href="#runs">Back to runs</a>
      </div>
    ) : <RetryBlock error={error} retry={() => setAttempt((value) => value + 1)} />;
  } else if (!run || run.id !== param) {
    content = <Loading text="Loading run" />;
  } else {
    content = (
      <RunBody
        run={run}
        cancelPending={cancelling || cancelRequested.has(run.id)}
        downloading={downloading}
        onCancel={() => { void cancel(); }}
        onDownload={() => { void download(); }}
        titleRef={titleRef}
      />
    );
  }

  return (
    <main className="lv-main" id="live-run-detail">
      <a className="lv-back" href="#runs">Back to runs</a>
      <div id="run-detail-body" aria-live="off">{content}</div>
      {dialog}
    </main>
  );
}
