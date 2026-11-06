import { describe, expect, it } from 'bun:test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { buildForkPlan } from '../src/forker/fork-plan.js';
import { suiteNameFromSpec } from '../src/router/local-test-runner.js';
import { createCloudRunPayload } from '../src/router/cloud-run-client.js';
import { loadConfig } from '../src/config/loader.js';
import { runCli } from './cli-helpers.js';

describe('CLI option parsing', () => {
  it('derives the cloud suite name from the spec or the project name', () => {
    expect(suiteNameFromSpec('tests/checkout.spec.ts', 'Project')).toBe('checkout');
    expect(suiteNameFromSpec('e2e/login.test.js', 'Project')).toBe('login');
    expect(suiteNameFromSpec(undefined, 'Project')).toBe('Project');

    const config = loadConfig(undefined, os.tmpdir());
    expect(createCloudRunPayload(config, 'https://shop.example.test').suiteName).toBe(config.projectName);
    expect(createCloudRunPayload(config, 'https://shop.example.test', 'checkout').suiteName).toBe('checkout');
  });

  it('builds fork variations from flags', () => {
    const plan = buildForkPlan({ values: 'VIP50,,BAD', input: '#coupon', action: '#apply', expectText: 'applied' });
    expect(plan.inputSelector).toBe('#coupon');
    expect(plan.actionSelector).toBe('#apply');
    expect(plan.variations.map((v) => v.value)).toEqual(['VIP50', '', 'BAD']);
    expect(plan.variations.every((v) => v.expect?.text === 'applied')).toBe(true);
    expect(new Set(plan.variations.map((v) => v.id)).size).toBe(3);
  });

  it('builds fork variations from a JSON file, with per-variation expectations', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-fork-')), 'variations.json');
    fs.writeFileSync(file, JSON.stringify({
      inputSelector: '[name=coupon]',
      actionSelector: 'button.apply',
      expect: { selector: '#status' },
      variations: [
        { id: 'valid', value: 'VIP50', expect: { selector: '#status', text: 'applied' } },
        { value: 'EXPIRED' },
      ],
    }));
    const plan = buildForkPlan({ variationsFile: file, workers: 1 });
    expect(plan.variations).toHaveLength(1);
    expect(plan.variations[0].id).toBe('valid');
    expect(plan.variations[0].expect).toEqual({ selector: '#status', text: 'applied' });

    const all = buildForkPlan({ variationsFile: file });
    expect(all.variations[1].expect).toEqual({ selector: '#status' });
  });

  it('rejects fork plans without an input selector or values', () => {
    expect(() => buildForkPlan({ values: 'a' })).toThrow('No input selector');
    expect(() => buildForkPlan({ input: '#x' })).toThrow('No variations');
  });

  it('compile and teleport exit non-zero for missing files', async () => {
    const compile = await runCli(['compile', 'does-not-exist.json']);
    expect(compile.output).toContain('Trace file not found');
    expect(compile.code).toBe(1);

    const teleport = await runCli(['teleport', 'does-not-exist.json']);
    expect(teleport.output).toContain('Capsule file not found');
    expect(teleport.code).toBe(1);
  });

  it('compile accepts --output as an alias for --out', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-compile-'));
    const tracePath = path.join(dir, 'trace.json');
    fs.writeFileSync(tracePath, JSON.stringify({
      id: 'trace_1', suiteName: 'alias-check', targetUrl: 'http://127.0.0.1:3900', startTime: new Date().toISOString(),
      steps: [{ index: 1, type: 'goto', url: 'http://127.0.0.1:3900', timestamp: new Date().toISOString() }],
      networkEvents: [], metadata: {},
    }));
    const outPath = path.join(dir, 'out', 'alias.spec.ts');
    const result = await runCli(['compile', tracePath, '--output', outPath]);
    expect(result.code).toBe(0);
    expect(fs.existsSync(outPath)).toBe(true);
    expect(result.output).not.toContain('Token Cost');
  });
});
