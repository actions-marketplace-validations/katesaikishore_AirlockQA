import { useRef, useState, type FormEvent, type RefObject } from 'react';
import { useApp } from '../app-context';
import { describeError } from '../lib';
import { ErrorBox } from '../ui';
import type { RunSummary } from '../types';

const EXAMPLE_WORKFLOW = {
  name: 'checkout',
  steps: [
    { action: 'goto', url: '/' },
    { action: 'expectVisible', selector: '#cart' },
  ],
};
const EXAMPLE = JSON.stringify(EXAMPLE_WORKFLOW, null, 2);

type Result = { kind: 'error'; error: unknown } | { kind: 'ok'; created: RunSummary } | null;

interface Props {
  suiteRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  /** Called after the run was created; resolves when the list is refreshed. */
  onCreated: () => Promise<void>;
}

export function StartRunForm({ suiteRef, onClose, onCreated }: Props) {
  const { api, call, announce, refreshUsage } = useApp();
  const [suite, setSuite] = useState('');
  const [target, setTarget] = useState('');
  const [workflow, setWorkflow] = useState('');
  const [workflowError, setWorkflowError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const targetRef = useRef<HTMLInputElement>(null);
  const workflowRef = useRef<HTMLTextAreaElement>(null);

  const fail = (message: string, field: HTMLElement | null) => {
    setResult({ kind: 'error', error: new Error(message) });
    field?.focus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);
    const suiteName = suite.trim();
    const targetUrl = target.trim();
    if (!suiteName) { fail('Enter a suite name.', suiteRef.current); return; }
    if (!/^https?:\/\//i.test(targetUrl)) { fail('Enter a target URL that starts with http:// or https://.', targetRef.current); return; }
    let parsed: unknown;
    const text = workflow.trim();
    if (text) {
      try {
        parsed = JSON.parse(text);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('The workflow must be a JSON object with a steps array.');
      } catch (error) {
        setWorkflowError('Workflow is not valid JSON: ' + (error instanceof Error ? error.message : String(error)));
        workflowRef.current?.focus();
        return;
      }
    }
    const body: { suiteName: string; targetUrl: string; workflow?: unknown } = { suiteName, targetUrl };
    if (parsed !== undefined) body.workflow = parsed;

    setBusy(true);
    try {
      const created = await call(() => api.runs.create(body));
      setResult({ kind: 'ok', created });
      announce('Run queued');
      await onCreated();
    } catch (error) {
      setResult({ kind: 'error', error });
      if (describeError(error).code === 'DAILY_QUOTA_EXCEEDED') void refreshUsage();
    } finally {
      setBusy(false);
    }
  };

  const created = result?.kind === 'ok' ? result.created : null;
  const runId = created ? (created.runId || created.id) : '';

  return (
    <form className="lv-form" id="start-run-form" noValidate onSubmit={onSubmit}>
      <div className="lv-form-row">
        <div className="lv-field">
          <label htmlFor="start-suite">Suite name</label>
          <input id="start-suite" className="lv-input" name="suiteName" type="text" maxLength={80} required autoComplete="off" placeholder="checkout"
            ref={suiteRef} value={suite} onChange={(event) => setSuite(event.target.value)} />
        </div>
        <div className="lv-field">
          <label htmlFor="start-target">Target URL</label>
          <input id="start-target" className="lv-input" name="targetUrl" type="url" required autoComplete="off" placeholder="https://staging.example.com"
            aria-describedby="start-target-hint" ref={targetRef} value={target} onChange={(event) => setTarget(event.target.value)} />
          <p id="start-target-hint" className="lv-hint">A public http(s) address. Private and loopback addresses are refused.</p>
        </div>
      </div>
      <div className="lv-field">
        <label htmlFor="start-workflow">Workflow JSON (optional)</label>
        <textarea id="start-workflow" className="lv-input lv-textarea" name="workflow" rows={7} spellCheck={false}
          aria-describedby="start-workflow-hint start-workflow-error" aria-invalid={workflowError ? true : undefined}
          placeholder="Leave empty to run a smoke test: open the URL and expect the page to render."
          ref={workflowRef} value={workflow}
          onChange={(event) => { setWorkflow(event.target.value); setWorkflowError(''); }} />
        <p id="start-workflow-hint" className="lv-hint">Declarative steps only. Do not put real secrets or {'${env:NAME}'} references in it: hosted runs never see your environment.</p>
        <p id="start-workflow-error" className="lv-field-error" role="alert" hidden={!workflowError}>{workflowError}</p>
        <details className="lv-details">
          <summary>Show an example workflow</summary>
          <pre className="lv-code"><code>{EXAMPLE}</code></pre>
          <button type="button" className="lv-btn lv-btn-small" onClick={() => { setWorkflow(EXAMPLE); setWorkflowError(''); }}>Use this example</button>
        </details>
      </div>
      <div id="start-result" aria-live="polite">
        {result?.kind === 'error' ? <ErrorBox error={result.error} /> : null}
        {created ? (
          <div className="lv-alert lv-alert-ok" role="status">
            <strong>Run queued.</strong>{' '}
            {created.queuePosition ? `Position ${created.queuePosition} in the queue. ` : ''}
            <a className="lv-link" href={'#run-detail/' + encodeURIComponent(runId)}>Open run</a>
          </div>
        ) : null}
      </div>
      <div className="lv-actions">
        <button type="submit" className="lv-btn lv-btn-primary" disabled={busy} aria-busy={busy ? true : undefined}>Start cloud run</button>
        <button type="button" className="lv-btn" onClick={onClose}>Close</button>
      </div>
    </form>
  );
}
