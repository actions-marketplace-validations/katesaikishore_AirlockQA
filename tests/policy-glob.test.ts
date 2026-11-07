import { describe, expect, it } from 'bun:test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { PolicyEngine, globMatch } from '../src/proxy/policy-engine.js';
import { CheckpointManager } from '../src/forker/checkpoint-manager.js';

describe('globMatch', () => {
  const cases: Array<[string, string, boolean]> = [
    ['*/refund*', '/api/admin/refund', true],
    ['*/refund*', '/api/refunds/1', true],
    ['*/refund*', '/api/charge', false],
    ['/v1/charges', '/v1/charges', true],
    ['/v1/charges', '/v1/charges/1', false],
    ['/V1/Charges*', '/v1/charges/9', true],
    ['*', '/anything', true],
    ['/a/*/c', '/a/b/c', true],
    ['/a/*/c', '/a/b/d', false],
    ['/a.b', '/aXb', false],
    ['/a+b(c)', '/a+b(c)', true],
    ['', '', true],
    ['*x', 'abc', false],
  ];
  for (const [pattern, text, expected] of cases) {
    it(`${JSON.stringify(pattern)} vs ${JSON.stringify(text)} is ${expected}`, () => expect(globMatch(pattern, text)).toBe(expected));
  }

  it('does not blow up on a pattern that is catastrophic as a regular expression', () => {
    const hostile = '*a*a*a*a*a*a*a*a*a*a*a*a*b';
    const text = '/' + 'a'.repeat(5000);
    const started = performance.now();
    expect(globMatch(hostile, text)).toBe(false);
    expect(performance.now() - started).toBeLessThan(500);
  });

  it('keeps the policy engine responsive with a hostile blockedPaths entry', async () => {
    const engine = new PolicyEngine({
      defaultAction: 'ALLOW',
      allowedEgressHosts: [],
      blockedEgressHosts: [],
      rules: [{ id: 'r', hostPattern: '*', blockedPaths: ['*a*a*a*a*a*a*a*a*a*a*b'], action: 'ALLOW' }],
      logPayloads: false,
    } as never);
    const started = performance.now();
    const verdict = await engine.evaluate({ host: 'example.com', path: '/' + 'a'.repeat(4000), method: 'GET', headers: {}, url: 'https://example.com/' });
    expect(verdict.allowed).toBe(true);
    expect(performance.now() - started).toBeLessThan(500);
  });
});

describe('CheckpointManager names', () => {
  const dir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-cp-'));

  it('accepts ordinary names', () => {
    const root = dir();
    const manager = new CheckpointManager(path.join(root, 'checkpoints'));
    expect(() => (manager as unknown as { filePathFor(n: string): string }).filePathFor('post_auth-1.v2')).not.toThrow();
  });

  const bad = ['../escape', '..', '.hidden', 'a/b', 'a\\b', '/etc/passwd', '', 'x'.repeat(65), 'a..b', 'name\u0000', 'with space'];
  for (const name of bad) {
    it(`rejects ${JSON.stringify(name.slice(0, 20))}`, () => {
      const root = dir();
      const manager = new CheckpointManager(path.join(root, 'checkpoints'));
      expect(() => (manager as unknown as { filePathFor(n: string): string }).filePathFor(name)).toThrow(/Invalid checkpoint name|escapes/);
    });
  }
});
