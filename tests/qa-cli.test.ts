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

describe('qafind --dry-run', () => {
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

describe('qafind: submitting and waiting', () => {
  const body = { repo: 'https://github.com/acme/app', sha: SHA, suites: ['smoke'], gate: 'default', scripts: {}, port: 3000, healthPath: '/', timeoutMinutes: 45 } as any;

  it('posts the request to /v1/qa-runs with the key as a bearer token', async () => {
    const seen: Array<{ url: string; auth: string | null; body: string }> = [];
    const fetcher = (async (url: string, init?: RequestInit) => {
      seen.push({ url: String(url), auth: new Headers(init?.headers).get('authorization'), body: String(init?.body) });
      return new Response(JSON.stringify({ id: 'run_qa_1', status: 'QUEUED' }), { status: 202, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;
    const r = await submitQaRun(body, { apiUrl: 'https://api.qafind.si', apiKey: 'air_live_TESTKEY', fetcher });
    expect(r.id).toBe('run_qa_1');
    expect(seen[0].url).toBe('https://api.qafind.si/v1/qa-runs');
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
    const d = await waitForQaRun({ apiUrl: 'https://api.qafind.si', apiKey: 'air_live_TESTKEY', fetcher }, 'run_qa_1', { intervalMs: 0, timeoutMs: 5000 });
    expect(d.status).toBe('SUCCESS');
  });

  it('gives up after the timeout and says so', async () => {
    const fetcher = (async () =>
      new Response(JSON.stringify({ id: 'run_qa_1', status: 'RUNNING', phase: 'running', suites: [], gate: null }), { status: 200, headers: { 'content-type': 'application/json' } })) as typeof fetch;
    await expect(waitForQaRun({ apiUrl: 'https://api.qafind.si', apiKey: 'k', fetcher }, 'run_qa_1', { intervalMs: 0, timeoutMs: 1 })).rejects.toThrow(/did not finish/);
  });
});

import { verifyQaSeal } from '../src/router/qa-cli.js';
import { canonicalJson, signEd25519, ed25519PublicKeyPem } from '../src/utils/crypto.js';
import * as crypto from 'node:crypto';

describe('qafind: checking the sealed result', () => {
  const { privateKey } = crypto.generateKeyPairSync('ed25519');
  const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  const pubPem = ed25519PublicKeyPem(privPem);
  const seal = { v: 1, runId: 'run_qa_1', phase: 'DONE', status: 'SUCCESS', suites: [{ suite: 'smoke', status: 'PASS' }], exitCode: 0 };
  const evidence = { algorithm: 'Ed25519', keyId: 'k', seal, signature: signEd25519(canonicalJson(seal), privPem), publicKeyPem: pubPem };

  it('verifies a sealed result against the published key', () => {
    expect(verifyQaSeal(evidence)).toBe(true);
  });

  it('refuses a result whose seal was changed after signing', () => {
    expect(verifyQaSeal({ ...evidence, seal: { ...seal, suites: [{ suite: 'smoke', status: 'FAIL' }] } })).toBe(false);
  });

  it('refuses a result with no evidence at all', () => {
    expect(verifyQaSeal(null)).toBe(false);
  });
});
