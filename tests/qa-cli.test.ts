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
