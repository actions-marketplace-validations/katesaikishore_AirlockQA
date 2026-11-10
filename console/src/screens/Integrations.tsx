import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useApp, useSessionState } from '../app-context';
import { formatDateTime } from '../lib';
import { Card, CodeBlock, CopyButton, ErrorBox, Loading, PageHeader, RetryBlock, useConfirm } from '../ui';
import type { ApiKeyInfo } from '../types';
import { UsageCard } from './UsageCard';

const API_BASE = 'https://api.qafind.si';

const GITHUB_ACTIONS = [
  'name: QAFind browser tests',
  'on: [push, pull_request]',
  'jobs:',
  '  qafind:',
  '    runs-on: ubuntu-latest',
  '    steps:',
  '      - uses: actions/checkout@v4',
  '      - uses: actions/setup-node@v4',
  '        with:',
  '          node-version: 20',
  '      - run: npx qafind test --cloud',
  '        env:',
  '          QAFIND_API_KEY: ${{ secrets.QAFIND_API_KEY }}',
].join('\n');

const CURL_EXAMPLE = [
  'curl -X POST ' + API_BASE + '/v1/runs \\',
  '  -H "Authorization: Bearer $QAFIND_API_KEY" \\',
  '  -H "Content-Type: application/json" \\',
  '  -d \'{"suiteName":"checkout","targetUrl":"https://staging.example.com"}\'',
].join('\n');

const CURL_STATUS = 'curl -H "Authorization: Bearer $QAFIND_API_KEY" ' + API_BASE + '/v1/runs/<runId>';

const CLI_COMMANDS: Array<[string, string]> = [
  ['qafind login', 'Save an API key on this machine'],
  ['qafind whoami', 'Show which key and plan this machine uses'],
  ['qafind usage', "Show today's run usage and limits"],
  ['qafind test --cloud [spec] [--workflow file]', 'Start a hosted run'],
  ['qafind runs [runId]', 'List recent runs, or show one run with its steps'],
  ['qafind audit <bundle>', 'Verify a signed evidence bundle'],
  ['qafind logout', 'Remove the saved key from this machine'],
];

interface CreatedKey { key: ApiKeyInfo; token: string }

function Limits({ keyCount }: { keyCount: number | null }) {
  const { usage } = useApp();
  if (!usage) return null;
  return (
    <dl className="lv-meta">
      <div className="lv-meta-item"><dt>Plan</dt><dd>Free</dd></div>
      <div className="lv-meta-item"><dt>Concurrent runs</dt><dd>{usage.concurrent.running + ' running of ' + usage.concurrent.limit + ', ' + usage.concurrent.queued + ' queued'}</dd></div>
      <div className="lv-meta-item"><dt>Steps per run</dt><dd>{'Up to ' + usage.limits.maxSteps}</dd></div>
      <div className="lv-meta-item"><dt>Run time limit</dt><dd>{usage.limits.runTimeoutSec + ' seconds'}</dd></div>
      <div className="lv-meta-item"><dt>Active API keys</dt><dd>{(keyCount !== null ? keyCount + ' of ' : 'Up to ') + usage.limits.maxActiveKeys}</dd></div>
    </dl>
  );
}

function TokenPanel({ created, onDismiss }: { created: CreatedKey; onDismiss: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <section className="lv-alert lv-alert-warn lv-token" id="new-key-panel" tabIndex={-1} role="region" aria-label="New API key" ref={ref}>
      <strong>Copy this key now. You will not see it again.</strong>
      <p className="lv-small">{'Key "' + created.key.name + '" was created. Store it as QAFIND_API_KEY in your CI secrets, or paste it into qafind login.'}</p>
      <div className="lv-token-row">
        <code className="lv-token-value" id="new-key-token">{created.token}</code>
        <CopyButton label="Copy key" getText={() => created.token} />
      </div>
      <div className="lv-actions">
        <button type="button" className="lv-btn lv-btn-small" id="dismiss-token" onClick={onDismiss}>I have saved it, dismiss</button>
      </div>
    </section>
  );
}

export default function Integrations(_props: { param: string }) {
  const { api, call, announce, toast, refreshUsage } = useApp();
  const [confirm, dialog] = useConfirm();
  const [keys, setKeys] = useState<ApiKeyInfo[] | null>(null);
  const [keysError, setKeysError] = useState<unknown>(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<unknown>(null);
  const [created, setCreated] = useSessionState<CreatedKey | null>('new-key', null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const loadKeys = useCallback(async () => {
    try {
      const result = await call(() => api.keys.list());
      setKeys((result.keys || []).filter((key) => !key.revokedAt));
      setKeysError(null);
    } catch (error) {
      setKeysError(error);
    }
  }, [api, call]);

  useEffect(() => {
    void loadKeys();
    void refreshUsage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError({ message: 'Give the key a name.' });
      nameRef.current?.focus();
      return;
    }
    setCreating(true);
    try {
      const result = await call(() => api.keys.create(trimmed));
      setName('');
      setCreated(result);
      announce('API key created. Copy it now: it is shown once.');
      await loadKeys();
    } catch (error) {
      setFormError(error);
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (key: ApiKeyInfo) => {
    const confirmed = await confirm({
      title: 'Revoke "' + key.name + '"?',
      message: 'Anything using this key stops working immediately. This cannot be undone.',
      confirmLabel: 'Revoke key',
      danger: true,
    });
    if (!confirmed) return;
    setRevoking(key.id);
    try {
      await call(() => api.keys.revoke(key.id));
      setKeys((current) => (current || []).filter((other) => other.id !== key.id));
      announce('Key ' + key.name + ' revoked');
      toast('Key revoked');
      nameRef.current?.focus();
    } catch (error) {
      setFormError(error);
    } finally {
      setRevoking(null);
    }
  };

  const dismissToken = () => {
    setCreated(null);
    nameRef.current?.focus();
  };

  return (
    <main className="lv-main" id="live-integrations">
      <PageHeader title="CI/CD & API" subtitle={'Create an API key, then run hosted tests from your terminal or CI. The API lives at ' + API_BASE + '.'} />
      <Card title="Usage and limits">
        <div>
          <div data-usage-card=""><UsageCard /></div>
          <div id="usage-limits"><Limits keyCount={keys ? keys.length : null} /></div>
        </div>
      </Card>
      <Card title="API keys">
        <div>
          <form className="lv-form lv-form-inline" id="create-key-form" noValidate onSubmit={onSubmit}>
            <div className="lv-field">
              <label htmlFor="key-name">Key name</label>
              <input
                id="key-name" ref={nameRef} className="lv-input" type="text" maxLength={60} autoComplete="off" placeholder="ci-main" required
                aria-describedby="key-name-hint" value={name} onChange={(event) => setName(event.target.value)}
              />
              <p id="key-name-hint" className="lv-hint">A label so you can tell keys apart, for example the CI job that uses it.</p>
            </div>
            <button type="submit" className="lv-btn lv-btn-primary" disabled={creating} aria-busy={creating ? 'true' : undefined}>Create key</button>
          </form>
          <div id="create-key-result">{formError ? <ErrorBox error={formError} /> : null}</div>
          <div id="new-key-host">{created ? <TokenPanel created={created} onDismiss={dismissToken} /> : null}</div>
          <div id="keys-list">
            {keysError ? <RetryBlock error={keysError} retry={() => { setKeysError(null); void loadKeys(); }} />
              : !keys ? <Loading text="Loading keys" />
              : keys.length === 0 ? <p className="lv-muted" id="keys-empty">No active API keys. Create one above to use the CLI or CI.</p>
              : (
                <div className="lv-table-wrap">
                  <table className="lv-table" id="keys-table">
                    <caption className="sr-only">Active API keys</caption>
                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Key</th>
                        <th scope="col">Created</th>
                        <th scope="col">Last used</th>
                        <th scope="col"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {keys.map((key) => (
                        <tr key={key.id} data-key-id={key.id}>
                          <td className="lv-wrap">{key.name}</td>
                          <td className="lv-mono">{key.prefix + '…'}</td>
                          <td>{formatDateTime(key.createdAt)}</td>
                          <td>{key.lastUsedAt ? formatDateTime(key.lastUsedAt) : 'Never'}</td>
                          <td>
                            <button
                              type="button" className="lv-btn lv-btn-small lv-btn-danger-quiet" aria-label={'Revoke key ' + key.name}
                              data-revoke={key.id} disabled={revoking === key.id} onClick={() => { void revoke(key); }}
                            >Revoke</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </div>
      </Card>
      <Card title="GitHub Actions">
        <div>
          <p className="lv-muted">Store a key as a repository secret named QAFIND_API_KEY (Settings, Secrets and variables, Actions), then add this workflow.</p>
          <CodeBlock text={GITHUB_ACTIONS} label="Copy workflow" />
        </div>
      </Card>
      <Card title="curl">
        <div>
          <p className="lv-muted">Submit a run and read its result with any HTTP client.</p>
          <CodeBlock text={CURL_EXAMPLE} />
          <CodeBlock text={CURL_STATUS} />
        </div>
      </Card>
      <Card title="CLI">
        <ul className="lv-cli-list">
          {CLI_COMMANDS.map(([command, description]) => (
            <li key={command}><code>{command}</code><span className="lv-muted">{' ' + description}</span></li>
          ))}
        </ul>
      </Card>
      {dialog}
    </main>
  );
}
