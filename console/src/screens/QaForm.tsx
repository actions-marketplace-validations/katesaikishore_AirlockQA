import { useRef, useState, type FormEvent } from 'react';
import { useApp } from '../app-context';
import { ApiError } from '../api';
import {
  QA_GATES,
  QA_SCRIPT_NAMES,
  QA_SUITES,
  describeQaError,
  validateQaForm,
  type QaFormErrors,
  type QaScriptName,
} from '../qa';

const SCRIPT_LABELS: Record<QaScriptName, string> = {
  install: 'install',
  build: 'build',
  start: 'start',
  test: 'test',
  'test:integration': 'test:integration',
  'test:e2e': 'test:e2e',
};

const blankScripts = (): Record<QaScriptName, string> =>
  Object.fromEntries(QA_SCRIPT_NAMES.map((name) => [name, ''])) as Record<QaScriptName, string>;

interface Props {
  onClose: () => void;
  /** Called with the new run's id once the server has accepted it. */
  onCreated: (id: string) => void;
}

export function QaForm({ onClose, onCreated }: Props) {
  const { api, call, announce } = useApp();
  const [repo, setRepo] = useState('');
  const [sha, setSha] = useState('');
  const [branch, setBranch] = useState('');
  const [suites, setSuites] = useState<string[]>(['unit']);
  const [gate, setGate] = useState<string>('default');
  const [scripts, setScripts] = useState<Record<QaScriptName, string>>(blankScripts);
  const [errors, setErrors] = useState<QaFormErrors>({});
  const [serverError, setServerError] = useState<{ message: string; issues: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const repoRef = useRef<HTMLInputElement>(null);
  const shaRef = useRef<HTMLInputElement>(null);
  const suiteRefs = useRef<Array<HTMLInputElement | null>>([]);

  const toggleSuite = (suite: string) => {
    setSuites((current) => (current.includes(suite) ? current.filter((item) => item !== suite) : [...current, suite]));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    const result = validateQaForm({ repo, sha, branch, suites, gate, scripts });
    if (!result.ok) {
      setErrors(result.errors);
      const first = result.errors.repo ? repoRef.current : result.errors.sha ? shaRef.current : null;
      if (first) first.focus();
      else if (result.errors.suites) suiteRefs.current[0]?.focus();
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const created = await call(() => api.qaSubmit(result.body));
      announce('QA run queued');
      onCreated(created.id);
    } catch (error) {
      const issues = error instanceof ApiError && error.issues ? error.issues.map((issue) => (issue.path ? `${issue.path}: ` : '') + issue.message) : [];
      setServerError({ message: describeQaError(error), issues });
    } finally {
      setBusy(false);
    }
  };

  const errorId = (field: string) => `qa-${field}-error`;
  const fieldError = (field: keyof QaFormErrors) => (errors[field] ? (
    <p id={errorId(String(field))} className="lv-field-error" role="alert">{errors[field]}</p>
  ) : null);

  return (
    <form className="lv-form" id="qa-form" noValidate onSubmit={onSubmit}>
      <div className="lv-form-row">
        <div className="lv-field">
          <label htmlFor="qa-repo">Repository URL</label>
          <input id="qa-repo" className="lv-input" name="repo" type="url" autoComplete="off" placeholder="https://github.com/owner/repo"
            ref={repoRef} value={repo} aria-invalid={errors.repo ? true : undefined} aria-describedby={errors.repo ? errorId('repo') : 'qa-repo-hint'}
            onChange={(event) => setRepo(event.target.value)} />
          <p id="qa-repo-hint" className="lv-hint">A public GitHub repository. Private repositories are not supported.</p>
          {fieldError('repo')}
        </div>
        <div className="lv-field">
          <label htmlFor="qa-sha">Commit SHA</label>
          <input id="qa-sha" className="lv-input lv-mono" name="sha" type="text" autoComplete="off" spellCheck={false} placeholder="40 lowercase hex characters"
            ref={shaRef} value={sha} aria-invalid={errors.sha ? true : undefined} aria-describedby={errors.sha ? errorId('sha') : 'qa-sha-hint'}
            onChange={(event) => setSha(event.target.value)} />
          <p id="qa-sha-hint" className="lv-hint">The full commit. It must already be pushed to the repository.</p>
          {fieldError('sha')}
        </div>
      </div>
      <div className="lv-form-row">
        <div className="lv-field">
          <label htmlFor="qa-branch">Branch (optional)</label>
          <input id="qa-branch" className="lv-input" name="branch" type="text" autoComplete="off" placeholder="main"
            aria-invalid={errors.branch ? true : undefined} aria-describedby={errors.branch ? errorId('branch') : undefined}
            value={branch} onChange={(event) => setBranch(event.target.value)} />
          {fieldError('branch')}
        </div>
        <div className="lv-field">
          <label htmlFor="qa-gate">Gate</label>
          <select id="qa-gate" className="lv-input" name="gate" value={gate} aria-describedby="qa-gate-hint" onChange={(event) => setGate(event.target.value)}>
            {QA_GATES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <p id="qa-gate-hint" className="lv-hint">Default fails only when the build or the health check fails. Strict also fails on any suite that failed, did not run or was flaky.</p>
          {fieldError('gate')}
        </div>
      </div>
      <fieldset className="lv-field qa-fieldset" aria-describedby={errors.suites ? errorId('suites') : undefined}>
        <legend>Suites</legend>
        <div className="qa-checks">
          {QA_SUITES.map((suite, index) => (
            <label key={suite} className="qa-check">
              <input
                type="checkbox"
                name="suites"
                value={suite}
                checked={suites.includes(suite)}
                ref={(node) => { suiteRefs.current[index] = node; }}
                onChange={() => toggleSuite(suite)}
              />
              <span className="lv-mono">{suite}</span>
            </label>
          ))}
        </div>
        {fieldError('suites')}
      </fieldset>
      <details className="lv-details">
        <summary>Script names (optional)</summary>
        <p className="lv-hint">Names of npm scripts in the repository's package.json. Leave empty to use the defaults.</p>
        <div className="lv-form-row">
          {QA_SCRIPT_NAMES.map((name) => (
            <div key={name} className="lv-field">
              <label htmlFor={'qa-script-' + name}>{SCRIPT_LABELS[name]}</label>
              <input id={'qa-script-' + name} className="lv-input lv-mono" name={'script-' + name} type="text" autoComplete="off" spellCheck={false}
                aria-invalid={errors[`scripts.${name}`] ? true : undefined}
                aria-describedby={errors[`scripts.${name}`] ? errorId('script-' + name) : undefined}
                value={scripts[name]} onChange={(event) => setScripts((current) => ({ ...current, [name]: event.target.value }))} />
              {fieldError(`scripts.${name}`)}
            </div>
          ))}
        </div>
      </details>
      <div id="qa-result" aria-live="polite">
        {serverError ? (
          <div className="lv-alert lv-alert-error" role="alert">
            <strong>{serverError.message}</strong>
            {serverError.issues.length ? <ul>{serverError.issues.map((line, index) => <li key={index}>{line}</li>)}</ul> : null}
          </div>
        ) : null}
      </div>
      <div className="lv-actions">
        <button type="submit" className="lv-btn lv-btn-primary" disabled={busy} aria-busy={busy ? true : undefined}>Start QA run</button>
        <button type="button" className="lv-btn" onClick={onClose}>Close</button>
      </div>
    </form>
  );
}
