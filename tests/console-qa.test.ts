// Pure helpers behind the console's QA screens (console/src/qa.ts). No DOM, no React: bun test runs them directly.
import { describe, expect, test } from 'bun:test';
import { generateKeyPairSync, sign } from 'node:crypto';
import {
  QA_GATES,
  QA_SCRIPT_NAME_RE,
  QA_SUITES,
  canonicalJson,
  describeQaError,
  formatRatio,
  suiteStatusLabel,
  validateQaForm,
  verifyQaSeal,
  type QaFormInput,
} from '../console/src/qa';
import { canonicalJson as serverCanonicalJson } from '../src/utils/crypto';
import { CreateQaRunBodySchema, QA_GATES as SERVER_GATES, QA_SCRIPT_NAME_RE as SERVER_SCRIPT_RE, QA_SUITES as SERVER_SUITES } from '../cloud/shared/contract';

const SHA = 'a'.repeat(39) + '1';

function form(overrides: Partial<QaFormInput> = {}): QaFormInput {
  return {
    repo: 'https://github.com/acme/widgets',
    sha: SHA,
    branch: '',
    suites: ['unit'],
    gate: 'default',
    scripts: { install: '', build: '', start: '', test: '', 'test:integration': '', 'test:e2e': '' },
    ...overrides,
  };
}

describe('validateQaForm', () => {
  test('a valid form becomes a request body the server contract accepts', () => {
    const result = validateQaForm(form({ suites: ['unit', 'e2e'], scripts: { ...form().scripts, test: 'test:unit' } }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.body).toEqual({
      repo: 'https://github.com/acme/widgets',
      sha: SHA,
      suites: ['unit', 'e2e'],
      gate: 'default',
      scripts: { test: 'test:unit' },
    });
    expect(CreateQaRunBodySchema.safeParse(result.body).success).toBe(true);
  });

  test('empty optional fields are left out of the body', () => {
    const result = validateQaForm(form());
    expect(result.ok && result.body).toEqual({ repo: 'https://github.com/acme/widgets', sha: SHA, suites: ['unit'], gate: 'default', scripts: {} });
  });

  test('rejects a repo that is not a public https GitHub URL', () => {
    for (const repo of ['http://github.com/acme/widgets', 'https://gitlab.com/acme/widgets', 'https://github.com/acme/widgets/tree/main', 'https://github.com/acme/..x', '']) {
      const result = validateQaForm(form({ repo }));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.repo).toBeTruthy();
    }
  });

  test('rejects a SHA that is not 40 lowercase hex characters', () => {
    for (const sha of ['abc123', SHA.toUpperCase(), 'g'.repeat(40), SHA + '0', '']) {
      const result = validateQaForm(form({ sha }));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.sha).toBeTruthy();
    }
  });

  test('requires at least one suite, and accepts all eight the server offers', () => {
    const none = validateQaForm(form({ suites: [] }));
    expect(none.ok).toBe(false);
    if (!none.ok) expect(none.errors.suites).toBeTruthy();
    const all = validateQaForm(form({ suites: [...QA_SUITES] }));
    expect(all.ok).toBe(true);
    expect(QA_SUITES.length).toBe(8);
  });

  test('gate must be strict or default', () => {
    const result = validateQaForm(form({ gate: 'lenient' as never }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.gate).toBeTruthy();
  });

  test('script names must match the server pattern', () => {
    for (const name of ['Test', 'test unit', 'test;rm', '-test', 'x'.repeat(41)]) {
      const result = validateQaForm(form({ scripts: { ...form().scripts, test: name } }));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors['scripts.test']).toBeTruthy();
    }
  });

  test('branch, when given, uses the server character set', () => {
    expect(validateQaForm(form({ branch: 'feature/qa-1' })).ok).toBe(true);
    const bad = validateQaForm(form({ branch: 'has space' }));
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors.branch).toBeTruthy();
  });
});

describe('mirror of the server contract', () => {
  test('constants match cloud/shared/contract.ts', () => {
    expect([...QA_SUITES]).toEqual([...SERVER_SUITES]);
    expect([...QA_GATES]).toEqual([...SERVER_GATES]);
    expect(QA_SCRIPT_NAME_RE.source).toBe(SERVER_SCRIPT_RE.source);
  });
});

describe('describeQaError', () => {
  test('shows the server message for quota (402) and concurrency (429) refusals', () => {
    expect(describeQaError({ status: 402, code: 'QUOTA_EXCEEDED', message: 'Monthly QA quota used up.' })).toBe('Monthly QA quota used up.');
    const busy = describeQaError({ status: 429, code: 'RATE_LIMITED', message: 'Too many QA runs in progress.', retryAfter: 30 });
    expect(busy).toContain('Too many QA runs in progress.');
    expect(busy).toContain('30');
  });

  test('falls back to a generic message for unknown errors', () => {
    expect(describeQaError(new Error(''))).toBe('Something went wrong. Try again.');
    expect(describeQaError(null)).toBe('Something went wrong. Try again.');
  });
});

describe('canonicalJson (browser copy)', () => {
  test('matches the server canonicalJson byte for byte', () => {
    const value = { b: [3, { z: null, a: 'x' }], a: true, c: { y: 1.5, x: 'é' }, d: undefined };
    expect(canonicalJson(value)).toBe(serverCanonicalJson(value));
  });
});

describe('verifyQaSeal', () => {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  const seal = { runId: 'qa_1', status: 'SUCCESS', suites: [{ suite: 'unit', status: 'PASS' }], merkleRoot: 'ab' };
  const signature = sign(null, Buffer.from(serverCanonicalJson(seal), 'utf8'), privateKey).toString('base64');
  const evidence = { algorithm: 'Ed25519', seal, signature, publicKeyPem, keyId: 'kid_1' };

  test('a genuine seal verifies in the browser', async () => {
    expect(await verifyQaSeal(evidence)).toEqual({ state: 'verified', keyId: 'kid_1' });
  });

  test('an altered seal is reported as invalid', async () => {
    const tampered = { ...evidence, seal: { ...seal, status: 'FAILED' } };
    expect((await verifyQaSeal(tampered)).state).toBe('invalid');
  });

  test('missing or non-Ed25519 evidence is reported as missing or unsupported, never as verified', async () => {
    expect((await verifyQaSeal(null)).state).toBe('missing');
    expect((await verifyQaSeal({ ...evidence, signature: undefined })).state).toBe('missing');
    expect((await verifyQaSeal({ ...evidence, algorithm: 'HMAC-SHA256' })).state).toBe('unsupported');
  });

  test('without Web Crypto Ed25519 support the result says it is not verified in the browser', async () => {
    const noSubtle = await verifyQaSeal(evidence, null);
    expect(noSubtle.state).toBe('unavailable');
    const rejecting = { importKey: async () => { throw new DOMException('no ed25519', 'NotSupportedError'); } } as unknown as SubtleCrypto;
    const refused = await verifyQaSeal(evidence, rejecting);
    expect(refused.state).toBe('unavailable');
    expect(refused.keyId).toBe('kid_1');
  });
});

describe('analytics formatting', () => {
  test('formatRatio shows the count, the total and a percentage', () => {
    expect(formatRatio({ failed: 2, total: 10 }, 'failed')).toBe('2 of 10 runs (20%)');
  });

  test('formatRatio says so when nothing has finished', () => {
    expect(formatRatio({ failed: 0, total: 0 }, 'failed')).toBe('No finished runs yet');
  });
});

describe('suiteStatusLabel', () => {
  test('maps the four displayed statuses and never turns an unknown one into a pass', () => {
    expect(suiteStatusLabel('PASS')).toBe('PASS');
    expect(suiteStatusLabel('FAIL')).toBe('FAIL');
    expect(suiteStatusLabel('FLAKY')).toBe('FLAKY');
    expect(suiteStatusLabel('NOT_RUN')).toBe('NOT RUN');
    expect(suiteStatusLabel('SOMETHING_NEW')).toBe('UNKNOWN');
    expect(suiteStatusLabel(undefined)).toBe('UNKNOWN');
  });
});
