import { describe, expect, it, beforeAll, afterAll, setDefaultTimeout } from 'bun:test';
import type * as http from 'node:http';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { startDemoServer } from '../examples/demo-store/server.js';
import { chromePath, runCli } from './cli-helpers.js';

setDefaultTimeout(60_000);

describe('airlock run with a configured workflow', () => {
  const PORT = 3923;
  const baseUrl = `http://127.0.0.1:${PORT}`;
  let server: http.Server;
  let workDir: string;

  const steps = (refundStatus: number) => [
    { action: 'goto', url: '/' },
    { action: 'fill', selector: 'input[name="email"]', value: '${env:QA_LOGIN_EMAIL}' },
    { action: 'click', selector: '[data-testid="login-btn"]' },
    { action: 'checkpoint', name: 'post_auth' },
    { action: 'click', selector: '[data-testid="add-pro-plan"]' },
    { action: 'fill', selector: '[data-testid="coupon-input"]', value: 'VIP50' },
    { action: 'click', selector: '[data-testid="apply-coupon-btn"]' },
    { action: 'expectText', selector: '[data-testid="cart-total"]', text: '$25.00' },
    {
      action: 'request',
      method: 'POST',
      url: '/api/admin/refund',
      phantomSecret: 'STRIPE_SECRET_KEY',
      body: { chargeId: 'ch_1' },
      expectStatus: refundStatus,
    },
  ];

  function writeConfig(extra: Record<string, unknown>): void {
    fs.writeFileSync(
      path.join(workDir, 'airlock.config.json'),
      JSON.stringify({
        baseUrl,
        browser: { headless: true, ...(chromePath ? { executablePath: chromePath } : {}) },
        secrets: {
          STRIPE_SECRET_KEY: {
            real: 'sk_test_real_value_for_workflow_test',
            phantom: 'ph_sec_workflow_test',
            allowedHosts: ['127.0.0.1'],
            blockedPaths: ['*/refund*'],
          },
        },
        policy: { defaultAction: 'BLOCK', allowedEgressHosts: ['127.0.0.1'], rules: [] },
        compiler: { outputDir: './specs', defaultTimeoutMs: 3000 },
        forker: { checkpointsDir: './.airlock/checkpoints' },
        compliance: { outputDir: './.airlock/compliance', generateHtmlReport: false },
        ...extra,
      })
    );
  }

  beforeAll(async () => {
    server = await startDemoServer(PORT);
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-run-'));
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  it('runs every workflow step, checks the blocked refund is a 403 and exits 0', async () => {
    writeConfig({ workflow: { name: 'vip-checkout', steps: steps(403) } });
    const result = await runCli(['run'], { cwd: workDir, env: { QA_LOGIN_EMAIL: 'qa@example.com' } });
    expect(result.output).toContain('POST /api/admin/refund -> HTTP 403 (as expected)');
    expect(result.output).toContain("Workflow 'vip-checkout' passed: 9/9 steps");
    expect(result.output).not.toContain('qa@example.com');
    expect(result.code).toBe(0);
    expect(fs.existsSync(path.join(workDir, '.airlock/checkpoints/post_auth.json'))).toBe(true);
    expect(fs.existsSync(path.join(workDir, '.airlock/compliance/latest-attestation.json'))).toBe(true);
  });

  it('fails when the refund response is not the expected status', async () => {
    const workflowFile = path.join(workDir, 'expects-200.json');
    fs.writeFileSync(workflowFile, JSON.stringify({ workflow: { name: 'expects-200', steps: steps(200) } }));
    writeConfig({});
    const result = await runCli(['run', '--workflow', workflowFile], { cwd: workDir, env: { QA_LOGIN_EMAIL: 'qa@example.com' } });
    expect(result.output).toContain('Expected POST /api/admin/refund to return HTTP 200, got HTTP 403');
    expect(result.code).toBe(1);
  });

  it('fails on a missing selector or an unset environment variable', async () => {
    writeConfig({ workflow: { steps: [{ action: 'goto', url: '/' }, { action: 'click', selector: '#does-not-exist' }] } });
    const missing = await runCli(['run'], { cwd: workDir });
    expect(missing.output).toContain('Step 2 (click #does-not-exist) failed');
    expect(missing.code).toBe(1);

    writeConfig({ workflow: { steps: steps(403) } });
    const unset = await runCli(['run'], { cwd: workDir, env: { QA_LOGIN_EMAIL: undefined } });
    expect(unset.output).toContain('Workflow references environment variable QA_LOGIN_EMAIL, which is not set');
    expect(unset.code).toBe(1);
  });

  it('exits 1 when no workflow is defined', async () => {
    writeConfig({});
    const result = await runCli(['run'], { cwd: workDir });
    expect(result.output).toContain('No workflow to run');
    expect(result.code).toBe(1);
  });

  it('rejects an invalid workflow with the failing path', async () => {
    writeConfig({ workflow: { steps: [{ action: 'click' }] } });
    const result = await runCli(['run'], { cwd: workDir });
    expect(result.output).toContain('workflow.steps.0.selector');
    expect(result.code).toBe(1);
  });
});
