import { describe, expect, it } from 'bun:test';
import {
  QA_SCRIPT_NAME_RE,
  QA_SUITES,
  QA_TEST_STATUSES,
  QA_FINDING_ORIGINS,
  QA_FINDING_SEVERITIES,
  CreateQaRunBodySchema,
} from '../cloud/shared/contract.js';

const SHA = 'a'.repeat(40);
const valid = () => ({
  repo: 'https://github.com/acme/app',
  sha: SHA,
  branch: 'main',
  scripts: { install: 'ci', build: 'build', start: 'start', test: 'test' },
  port: 3000,
  healthPath: '/',
  suites: ['unit', 'e2e'],
  gate: 'default',
});

describe('QA contract: request body', () => {
  it('accepts a well-formed request', () => {
    expect(CreateQaRunBodySchema.safeParse(valid()).success).toBe(true);
  });

  it('refuses shell strings in script names (npm script names only)', () => {
    for (const bad of ['test; rm -rf /', 'build && curl x', '$(id)', 'Test Suite', '', 'a'.repeat(41)]) {
      const r = CreateQaRunBodySchema.safeParse({ ...valid(), scripts: { test: bad } });
      expect(r.success).toBe(false);
    }
    expect(QA_SCRIPT_NAME_RE.test('test:integration')).toBe(true);
    expect(QA_SCRIPT_NAME_RE.test('test; id')).toBe(false);
  });

  it('refuses repositories that are not public https GitHub URLs', () => {
    for (const bad of ['http://github.com/a/b', 'https://evil.example/a/b', 'https://github.com/a/b/../c', 'git@github.com:a/b.git', 'https://github.com/a']) {
      expect(CreateQaRunBodySchema.safeParse({ ...valid(), repo: bad }).success).toBe(false);
    }
  });

  it('requires a full 40-hex commit SHA (no branch names, no short SHAs)', () => {
    for (const bad of ['main', 'abc1234', 'g'.repeat(40), 'A'.repeat(39)]) {
      expect(CreateQaRunBodySchema.safeParse({ ...valid(), sha: bad }).success).toBe(false);
    }
  });

  it('rejects unknown keys and unknown suites', () => {
    expect(CreateQaRunBodySchema.safeParse({ ...valid(), extra: 1 }).success).toBe(false);
    expect(CreateQaRunBodySchema.safeParse({ ...valid(), suites: ['unit', 'rm-everything'] }).success).toBe(false);
  });

  it('caps the port and the timeouts', () => {
    expect(CreateQaRunBodySchema.safeParse({ ...valid(), port: 22 }).success).toBe(false);
    expect(CreateQaRunBodySchema.safeParse({ ...valid(), port: 70000 }).success).toBe(false);
    expect(CreateQaRunBodySchema.safeParse({ ...valid(), timeoutMinutes: 61 }).success).toBe(false);
  });

  it('defaults the gate to "default" and the suites to unit only', () => {
    const minimal = { repo: valid().repo, sha: SHA };
    const r = CreateQaRunBodySchema.parse(minimal);
    expect(r.gate).toBe('default');
    expect(r.suites).toEqual(['unit']);
  });
});

describe('QA contract: vocabulary', () => {
  it('has the run-status model from the handbook and the functional manual', () => {
    expect([...QA_TEST_STATUSES]).toEqual(['PASS', 'FAIL', 'FLAKY', 'BLOCKED', 'NOT_RUN', 'INCOMPLETE']);
  });

  it('labels every finding with its origin, and never a bare "observed" that could be read as verified', () => {
    expect([...QA_FINDING_ORIGINS]).toEqual(['first_party_observed', 'sandbox_self_reported', 'heuristic_lead']);
  });

  it('uses S1 to S4 severities', () => {
    expect([...QA_FINDING_SEVERITIES]).toEqual(['S1', 'S2', 'S3', 'S4']);
  });

  it('lists the suites the pipeline knows about, and nothing else', () => {
    expect([...QA_SUITES]).toEqual(['unit', 'integration', 'e2e', 'smoke', 'explore', 'a11y', 'security', 'load']);
  });
});
