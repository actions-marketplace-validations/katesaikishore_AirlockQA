import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useApp } from '../app-context';
import { formatDateTime, formatNumber } from '../lib';
import { Card, ErrorBox, PageHeader } from '../ui';
import type { Me } from '../types';

type Workspace = Me['workspace'];
type Outcome = { kind: 'error'; error: unknown } | { kind: 'ok' } | { kind: 'empty' } | null;

export default function Settings(_props: { param: string }) {
  const { me, api, call, announce, signOut, usage, refreshUsage, setWorkspaceName } = useApp();
  const workspace = me?.workspace;
  const user = me?.user;
  const [details, setDetails] = useState<Workspace | undefined>(workspace);
  const [name, setName] = useState(workspace?.name || '');
  const [saving, setSaving] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const info = await call(() => api.workspace());
        if (!alive || !info) return;
        setDetails(info);
        if (document.activeElement !== inputRef.current) setName(info.name || '');
        if (info.name) setWorkspaceName(info.name);
      } catch {
        // The details already on screen come from api.me(); keep them.
      }
    })();
    void refreshUsage();
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setOutcome(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setOutcome({ kind: 'empty' });
      inputRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      const updated = await call(() => api.renameWorkspace(trimmed));
      const finalName = (updated && updated.name) || trimmed;
      setWorkspaceName(finalName);
      setDetails((current) => (current ? { ...current, name: finalName } : current));
      setName(finalName);
      setOutcome({ kind: 'ok' });
      announce('Workspace renamed');
    } catch (error) {
      setOutcome({ kind: 'error', error });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="lv-main" id="live-settings">
      <PageHeader title="Settings" subtitle="Your workspace and account." />
      <Card title="Workspace">
        <div>
          <form className="lv-form lv-form-inline" id="rename-form" noValidate onSubmit={onSubmit}>
            <div className="lv-field">
              <label htmlFor="workspace-name">Workspace name</label>
              <input
                id="workspace-name" ref={inputRef} className="lv-input" type="text" maxLength={80} required autoComplete="off"
                value={name} onChange={(event) => setName(event.target.value)}
              />
            </div>
            <button type="submit" className="lv-btn lv-btn-primary" disabled={saving} aria-busy={saving ? 'true' : undefined}>Save name</button>
          </form>
          <div id="rename-result" aria-live="polite">
            {outcome?.kind === 'error' ? <ErrorBox error={outcome.error} /> : null}
            {outcome?.kind === 'empty' ? <ErrorBox error={{ message: 'Enter a workspace name.' }} /> : null}
            {outcome?.kind === 'ok' ? <div className="lv-alert lv-alert-ok" role="status"><strong>Workspace renamed.</strong></div> : null}
          </div>
          <div id="settings-details">
            <dl className="lv-meta">
              {details?.createdAt ? <div className="lv-meta-item"><dt>Created</dt><dd>{formatDateTime(details.createdAt)}</dd></div> : null}
              <div className="lv-meta-item"><dt>Plan</dt><dd>Free</dd></div>
            </dl>
          </div>
        </div>
      </Card>
      <Card title="Account">
        <dl className="lv-meta">
          <div className="lv-meta-item"><dt>Email</dt><dd id="settings-email" className="lv-wrap">{user?.email || '—'}</dd></div>
          {user?.name ? <div className="lv-meta-item"><dt>Name</dt><dd className="lv-wrap">{user.name}</dd></div> : null}
        </dl>
      </Card>
      <Card title="Plan">
        <div>
          <p><strong>Free</strong></p>
          <div id="settings-limits">
            {usage ? (
              <dl className="lv-meta">
                <div className="lv-meta-item"><dt>Cloud runs per day</dt><dd>{formatNumber(usage.daily.limit)}</dd></div>
                <div className="lv-meta-item"><dt>Concurrent runs</dt><dd>{String(usage.concurrent.limit)}</dd></div>
                <div className="lv-meta-item"><dt>Steps per run</dt><dd>{String(usage.limits.maxSteps)}</dd></div>
                <div className="lv-meta-item"><dt>Run time limit</dt><dd>{usage.limits.runTimeoutSec + ' seconds'}</dd></div>
                <div className="lv-meta-item"><dt>Active API keys</dt><dd>{String(usage.limits.maxActiveKeys)}</dd></div>
              </dl>
            ) : <p className="lv-muted">Limits are unavailable right now.</p>}
          </div>
        </div>
      </Card>
      <div className="lv-actions">
        <button type="button" className="lv-btn" id="settings-signout" onClick={() => { void signOut(); }}>Sign out</button>
      </div>
    </main>
  );
}
