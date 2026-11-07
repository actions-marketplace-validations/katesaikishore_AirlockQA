import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { AirlockLedger } from '../src/compliance/ledger.js';
import { AttestationEngine } from '../src/compliance/attestation.js';
import { runCli } from './cli-helpers.js';

const GOOD_KEY = 'air_live_' + 'A'.repeat(43);
const REVOKED_KEY = 'air_live_' + 'B'.repeat(43);

const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();

function signedBundle(runId: string): Record<string, unknown> {
  const ledger = new AirlockLedger();
  ledger.append('ACTION_DISPATCH', { action: 'goto', target: 'https://example.com' });
  ledger.append('PROXY_INTERCEPT', { url: 'https://example.com/', method: 'GET', verdict: 'ALLOWED' });
  return AttestationEngine.generateBundle(ledger, {
    runId,
    signingKey: privatePem,
    signingAlgorithm: 'Ed25519',
    totalSteps: 2,
    durationMs: 1500,
    phantomTokensConfigured: 0,
    egressBlockedCount: 0,
    egressAllowedCount: 1,
    unauthorizedMutationsPrevented: 0,
  }) as unknown as Record<string, unknown>;
}

interface StubState {
  posts: Array<Record<string, unknown>>;
  polls: Map<string, number>;
  tamper: boolean;
}

function startStub(state: StubState) {
  const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

  return Bun.serve({
    port: 0,
    hostname: '127.0.0.1',
    async fetch(request) {
      const url = new URL(request.url);
      const authorized = request.headers.get('authorization') === `Bearer ${GOOD_KEY}`;
      if (url.pathname === '/v1/evidence-key') {
        return json(200, { algorithm: 'Ed25519', keyId: 'ed25519:stubkey', publicKeyPem: publicPem });
      }
      if (!authorized) return json(401, { code: 'UNAUTHENTICATED', message: 'Invalid API key' });

      const quota = { scope: 'workspace', used: 12, limit: 100, remaining: 88, resetAt: '2026-11-08T00:00:00.000Z' };
      if (url.pathname === '/v1/usage') {
        return json(200, {
          plan: 'free',
          daily: quota,
          concurrent: { limit: 1, running: 0, queued: 0 },
          limits: { maxSteps: 50, runTimeoutSec: 90, maxActiveKeys: 10 },
        });
      }
      if (url.pathname === '/v1/runs' && request.method === 'POST') {
        const body = (await request.json()) as Record<string, unknown>;
        state.posts.push(body);
        if (body.suiteName === 'quota') {
          return json(429, { code: 'DAILY_QUOTA_EXCEEDED', message: 'Daily run limit reached', quota: { ...quota, used: 100, remaining: 0 } });
        }
        return json(202, { runId: `run_${body.suiteName}`, id: `run_${body.suiteName}`, status: 'QUEUED', queuePosition: 1, quota });
      }
      if (url.pathname === '/v1/runs' && request.method === 'GET') {
        return json(200, { runs: [runDetail('run_listed', 'SUCCESS', 'listed')], nextCursor: null });
      }
      const match = url.pathname.match(/^\/v1\/runs\/([^/]+)(\/evidence)?$/);
      if (match) {
        const id = decodeURIComponent(match[1]);
        const suite = id.replace(/^run_/, '');
        if (match[2]) {
          const bundle = signedBundle(id);
          if (state.tamper) (bundle.policyAudit as Record<string, unknown>).egressBlockedCount = 99;
          return json(200, bundle);
        }
        const polls = (state.polls.get(id) ?? 0) + 1;
        state.polls.set(id, polls);
        if (polls === 1) return json(200, runDetail(id, 'QUEUED', suite));
        if (polls === 2) return json(200, runDetail(id, 'RUNNING', suite));
        if (suite === 'flaky' && polls === 3) return new Response('upstream down', { status: 502 });
        const detail = runDetail(id, suite === 'fail' || suite === 'esc' ? 'FAILED' : 'SUCCESS', suite);
        if (suite === 'esc') detail.steps[1].error = 'boom \u001b[31mRED\u001b]0;pwned\u0007 end';
        return json(200, detail);
      }
      return json(404, { code: 'NOT_FOUND', message: 'Not found' });
    },
  });
}

function runDetail(id: string, status: string, suite: string) {
  const failed = status === 'FAILED';
  return {
    runId: id,
    id,
    status,
    suiteName: suite,
    targetUrl: 'https://example.com',
    workflowName: 'smoke',
    createdAt: '2026-11-07T10:00:00.000Z',
    startedAt: '2026-11-07T10:00:01.000Z',
    finishedAt: status === 'SUCCESS' || failed ? '2026-11-07T10:00:03.000Z' : null,
    executionTimeMs: 1500,
    totalSteps: 2,
    passedSteps: failed ? 1 : 2,
    failedSteps: failed ? 1 : 0,
    requestsAllowed: 3,
    requestsBlocked: 1,
    failureReason: failed ? 'STEP_FAILED' : null,
    queuePosition: null,
    hasEvidence: status === 'SUCCESS' || failed,
    steps: [
      { index: 0, action: 'goto', ok: true },
      { index: 1, action: 'expectText', target: '#total', ok: !failed, error: failed ? 'Expected #total to contain "$50"' : undefined },
    ],
    requests: [],
    error: null,
    evidence: null,
    createdBy: { type: 'key', label: 'ci' },
  };
}

describe('airlock cloud commands', () => {
  let server: ReturnType<typeof startStub>;
  const state: StubState = { posts: [], polls: new Map(), tamper: false };
  let configDir: string;
  let workDir: string;
  let apiUrl: string;

  const env = () => ({ AIRLOCK_CONFIG_DIR: configDir, AIRLOCK_CLOUD_URL: apiUrl, AIRLOCK_API_KEY: undefined, AIRLOCK_TRUSTED_PUBLIC_KEY: undefined, AIRLOCK_CLOUD_POLL_MS: '150' });
  const cli = (args: string[], extra: Record<string, string | undefined> = {}) =>
    runCli(args, { cwd: workDir, env: { ...env(), ...extra } });

  beforeAll(() => {
    server = startStub(state);
    apiUrl = `http://127.0.0.1:${server.port}`;
  });
  afterAll(() => server.stop(true));

  beforeEach(() => {
    state.posts = [];
    state.polls.clear();
    state.tamper = false;
    configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-cli-cloud-'));
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-cli-work-'));
  });

  async function login() {
    const result = await cli(['login', '--key', GOOD_KEY]);
    expect(result.code).toBe(0);
  }

  it('login verifies the key, pins the evidence key and stores credentials owner-only', async () => {
    const result = await cli(['login', '--key', GOOD_KEY]);
    expect(result.code).toBe(0);
    expect(result.output).toContain('Signed in');
    expect(result.output).toContain('12 of 100 runs used today');
    expect(result.output).not.toContain(GOOD_KEY);

    const file = path.join(configDir, 'credentials.json');
    const mode = fs.statSync(file).mode & 0o777;
    expect(mode).toBe(0o600);
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(saved.apiKey).toBe(GOOD_KEY);
    expect(saved.evidenceKeyId).toBe('ed25519:stubkey');
    expect(saved.evidencePublicKey).toContain('BEGIN PUBLIC KEY');
  });

  it('login rejects a malformed key and a key the service refuses, saving nothing', async () => {
    const malformed = await cli(['login', '--key', 'not-a-key']);
    expect(malformed.code).toBe(1);
    expect(malformed.output).toContain('does not look like an Airlock API key');

    const refused = await cli(['login', '--key', REVOKED_KEY]);
    expect(refused.code).toBe(1);
    expect(refused.output).toContain('rejected the API key');
    expect(fs.existsSync(path.join(configDir, 'credentials.json'))).toBe(false);
  });

  it('whoami and usage use the saved key', async () => {
    await login();
    const whoami = await cli(['whoami']);
    expect(whoami.code).toBe(0);
    expect(whoami.output).toContain('air_live_AAAA...');
    expect(whoami.output).not.toContain(GOOD_KEY);
    expect(whoami.output).toContain('12 of 100');

    const usage = await cli(['usage']);
    expect(usage.code).toBe(0);
    expect(usage.output).toContain('88 left');
    expect(usage.output).toContain('50 steps, 90 seconds');
  });

  it('commands without a key explain how to sign in', async () => {
    const result = await cli(['usage']);
    expect(result.code).toBe(1);
    expect(result.output).toContain('airlock login');
  });

  it('runs lists runs and shows one with its steps', async () => {
    await login();
    const list = await cli(['runs']);
    expect(list.code).toBe(0);
    expect(list.output).toContain('run_listed');

    const one = await cli(['runs', 'run_demo']);
    expect(one.code).toBe(0);
    expect(one.output).toContain('expectText');
  });

  it('test --cloud runs a hosted run, saves the evidence and verifies it against the pinned key', async () => {
    await login();
    const result = await cli(['test', '--cloud', '--url', 'https://example.com', '--suite', 'demo']);
    expect(result.output).toContain('Run run_demo accepted');
    expect(result.output).toContain('Hosted run passed');
    expect(result.output).toContain('Evidence verified');
    expect(result.output).toContain('key pinned by login');
    expect(result.code).toBe(0);
    expect(fs.existsSync(path.join(workDir, '.airlock', 'compliance', 'cloud-run_demo.json'))).toBe(true);
    expect(state.posts).toHaveLength(1);
    expect(state.posts[0].targetUrl).toBe('https://example.com');
    expect(JSON.stringify(state.posts[0])).not.toContain('"real"');
  });

  it('exits non-zero when the hosted run fails', async () => {
    await login();
    const result = await cli(['test', '--cloud', '--url', 'https://example.com', '--suite', 'fail']);
    expect(result.code).toBe(1);
    expect(result.output).toContain('FAILED');
    expect(result.output).toContain('Expected #total to contain');
  });

  it('reports a modified evidence bundle as not verified', async () => {
    await login();
    state.tamper = true;
    const result = await cli(['test', '--cloud', '--url', 'https://example.com', '--suite', 'tamper']);
    expect(result.output).toContain('Evidence did not verify');
    expect(result.code).toBe(1);
  });

  it('--no-wait submits and returns immediately', async () => {
    await login();
    const result = await cli(['test', '--cloud', '--no-wait', '--url', 'https://example.com', '--suite', 'later']);
    expect(result.code).toBe(0);
    expect(result.output).toContain('airlock runs run_later');
    expect(state.polls.size).toBe(0);
  });

  it('shows the daily quota message on HTTP 429', async () => {
    await login();
    const result = await cli(['test', '--cloud', '--url', 'https://example.com', '--suite', 'quota']);
    expect(result.code).toBe(1);
    expect(result.output).toContain('daily quota reached');
    expect(result.output).toContain('100/100 runs used');
  });

  it('refuses a local target before contacting the service', async () => {
    await login();
    const result = await cli(['test', '--cloud', '--url', 'http://localhost:3000']);
    expect(result.code).toBe(1);
    expect(result.output).toContain('Hosted runs can only reach public addresses');
    expect(state.posts).toHaveLength(0);
  });

  it('refuses a workflow that reads the environment', async () => {
    await login();
    const workflow = path.join(workDir, 'wf.json');
    fs.writeFileSync(workflow, JSON.stringify({ name: 'x', steps: [{ action: 'goto', url: '/' }, { action: 'fill', selector: '#p', value: '${env:SECRET_PW}' }] }));
    const result = await cli(['test', '--cloud', '--url', 'https://example.com', '--workflow', workflow]);
    expect(result.code).toBe(1);
    expect(result.output).toContain('never receive your environment');
    expect(state.posts).toHaveLength(0);
  });

  it('sends the workflow from --workflow in the request', async () => {
    await login();
    const workflow = path.join(workDir, 'wf.json');
    fs.writeFileSync(workflow, JSON.stringify({ name: 'checkout', steps: [{ action: 'goto', url: '/' }, { action: 'expectVisible', selector: '#cart' }] }));
    const result = await cli(['test', '--cloud', '--no-wait', '--url', 'https://example.com', '--workflow', workflow, '--suite', 'wf']);
    expect(result.code).toBe(0);
    const sent = state.posts[0].workflow as { name: string; steps: unknown[] };
    expect(sent.name).toBe('checkout');
    expect(sent.steps).toHaveLength(2);
  });

  it('uses AIRLOCK_API_KEY from the environment without a saved login', async () => {
    const result = await cli(['usage'], { AIRLOCK_API_KEY: GOOD_KEY });
    expect(result.code).toBe(0);
    expect(result.output).toContain('88 left');
    expect(fs.existsSync(path.join(configDir, 'credentials.json'))).toBe(false);
  });

  it('strips terminal escape sequences from server text', async () => {
    await login();
    const result = await cli(['test', '--cloud', '--url', 'https://example.com', '--suite', 'esc']);
    expect(result.output).toContain('boom ?[31mRED?]0;pwned? end');
    expect(result.output).not.toContain('\u001b');
    expect(result.code).toBe(1);
  });

  it('keeps waiting through a single failed poll', async () => {
    await login();
    const result = await cli(['test', '--cloud', '--url', 'https://example.com', '--suite', 'flaky']);
    expect(result.output).toContain('Hosted run passed');
    expect(result.code).toBe(0);
  });

  it('refuses to send a saved key to a different endpoint', async () => {
    await login();
    const result = await cli(['usage'], { AIRLOCK_CLOUD_URL: 'http://127.0.0.1:1' });
    expect(result.code).toBe(1);
    expect(result.output).toContain('will not be sent to');
  });

  it('refuses a symbolic-link credentials file', async () => {
    fs.mkdirSync(configDir, { recursive: true });
    const target = path.join(workDir, 'elsewhere.json');
    fs.writeFileSync(target, JSON.stringify({ apiUrl: apiUrl, apiKey: GOOD_KEY, savedAt: 'now' }));
    fs.symlinkSync(target, path.join(configDir, 'credentials.json'));
    const result = await cli(['usage']);
    expect(result.code).toBe(1);
    expect(result.output).toContain('symbolic link');
  });

  it('logout removes the saved key', async () => {
    await login();
    const result = await cli(['logout']);
    expect(result.code).toBe(0);
    expect(fs.existsSync(path.join(configDir, 'credentials.json'))).toBe(false);
  });
});
