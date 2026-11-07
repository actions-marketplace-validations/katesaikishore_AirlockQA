import { describe, expect, it } from 'bun:test';
import { prepareQaDryRun } from '../src/router/qa-cli.js';

const SHA = 'e'.repeat(40);
const deps = (over: Partial<Parameters<typeof prepareQaDryRun>[1]> = {}) => ({
  readRemote: async () => 'git@github.com:acme/app.git',
  readHead: async () => SHA,
  readBranch: async () => 'main',
  isDirty: async () => false,
  isPushed: async () => true,
  readConfig: async () => ({ qa: { scripts: { test: 'test:unit' } } }),
  ...over,
});

describe('airlock qa --dry-run', () => {
  it('prints the exact request it would submit, and submits nothing', async () => {
    let submitted = false;
    const r = await prepareQaDryRun({ suites: ['unit'], gate: 'default' }, deps());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.body).toMatchObject({ repo: 'https://github.com/acme/app', sha: SHA, branch: 'main' });
    expect(submitted).toBe(false);
  });

  it('refuses with a clear message when the commit is not pushed', async () => {
    const r = await prepareQaDryRun({ suites: ['unit'], gate: 'default' }, deps({ isPushed: async () => false }));
    expect(r).toMatchObject({ ok: false });
    if (!r.ok) expect(r.message).toMatch(/not pushed/);
  });

  it('refuses a non-GitHub remote', async () => {
    const r = await prepareQaDryRun({ suites: ['unit'], gate: 'default' }, deps({ readRemote: async () => 'https://gitlab.com/a/b' }));
    expect(r.ok).toBe(false);
  });

  it('shows the dirty-tree warning in the dry run', async () => {
    const r = await prepareQaDryRun({ suites: ['unit'], gate: 'default' }, deps({ isDirty: async () => true }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.warnings.join(' ')).toMatch(/uncommitted/);
  });

  it('rejects an unknown suite before any remote call', async () => {
    let called = false;
    const r = await prepareQaDryRun({ suites: ['destroy'], gate: 'default' }, deps({ isPushed: async () => { called = true; return true; } }));
    expect(r.ok).toBe(false);
    expect(called).toBe(false);
  });
});

import { submitQaRun, waitForQaRun } from '../src/router/qa-cli.js';

describe('airlock qa: submitting and waiting', () => {
  const body = { repo: 'https://github.com/acme/app', sha: SHA, suites: ['smoke'], gate: 'default', scripts: {}, port: 3000, healthPath: '/', timeoutMinutes: 45 } as any;

  it('posts the request to /v1/qa-runs with the key as a bearer token', async () => {
    const seen: Array<{ url: string; auth: string | null; body: string }> = [];
    const fetcher = (async (url: string, init?: RequestInit) => {
      seen.push({ url: String(url), auth: new Headers(init?.headers).get('authorization'), body: String(init?.body) });
      return new Response(JSON.stringify({ id: 'run_qa_1', status: 'QUEUED' }), { status: 202, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;
    const r = await submitQaRun(body, { apiUrl: 'https://api.qbrin.cloud', apiKey: 'air_live_TESTKEY', fetcher });
    expect(r.id).toBe('run_qa_1');
    expect(seen[0].url).toBe('https://api.qbrin.cloud/v1/qa-runs');
    expect(seen[0].auth).toBe('Bearer air_live_TESTKEY');
    expect(JSON.parse(seen[0].body).sha).toBe(SHA);
  });

  it('waits until the run is terminal and returns its detail', async () => {
    const statuses = ['QUEUED', 'RUNNING', 'SUCCESS'];
    const fetcher = (async () =>
      new Response(JSON.stringify({ id: 'run_qa_1', status: statuses.shift() ?? 'SUCCESS', phase: 'DONE', suites: [], gate: { exitCode: 0 } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })) as typeof fetch;
    const d = await waitForQaRun({ apiUrl: 'https://api.qbrin.cloud', apiKey: 'air_live_TESTKEY', fetcher }, 'run_qa_1', { intervalMs: 0, timeoutMs: 5000 });
    expect(d.status).toBe('SUCCESS');
  });

  it('gives up after the timeout and says so', async () => {
    const fetcher = (async () =>
      new Response(JSON.stringify({ id: 'run_qa_1', status: 'RUNNING', phase: 'running', suites: [], gate: null }), { status: 200, headers: { 'content-type': 'application/json' } })) as typeof fetch;
    await expect(waitForQaRun({ apiUrl: 'https://api.qbrin.cloud', apiKey: 'k', fetcher }, 'run_qa_1', { intervalMs: 0, timeoutMs: 1 })).rejects.toThrow(/did not finish/);
  });
});
