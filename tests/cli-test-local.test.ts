import { describe, expect, it, beforeAll, afterAll, setDefaultTimeout } from 'bun:test';
import type * as http from 'node:http';
import { startDemoServer } from '../examples/demo-store/server.js';
import { hasPlaywrightTest, runCli } from './cli-helpers.js';

setDefaultTimeout(120_000);

// `airlock test --local` runs specs with @playwright/test, a peer dependency of airlockqa.
const canRun = hasPlaywrightTest();
if (!canRun) console.warn('Skipping `airlock test --local` tests: @playwright/test is not installed.');

describe.skipIf(!canRun)('airlock test --local', () => {
  const PORT = 3921;
  const url = `http://127.0.0.1:${PORT}`;
  let server: http.Server;

  beforeAll(async () => {
    server = await startDemoServer(PORT);
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('runs a passing spec through Playwright Test and exits 0', async () => {
    const result = await runCli(['test', '--local', 'examples/demo-store/specs/cart.spec.ts', '--url', url]);
    expect(result.output).toContain('2 passed');
    expect(result.output).toContain('Local test run passed (2 passed, 0 failed');
    // The gateway is attached by the airlockTest fixture: the refund request is blocked.
    expect(result.output).toContain("blocked path '/api/admin/refund'");
    expect(result.code).toBe(0);
  });

  it('exits non-zero when a spec fails', async () => {
    const result = await runCli(['test', '--local', 'examples/demo-store/failing-specs', '--url', url]);
    expect(result.output).toContain('1 failed');
    expect(result.output).toContain('Local test run failed');
    expect(result.code).not.toBe(0);
  });

  it('exits non-zero when the spec path does not exist', async () => {
    const result = await runCli(['test', '--local', 'examples/demo-store/specs/missing.spec.ts', '--url', url]);
    expect(result.output).toContain('Spec path not found');
    expect(result.code).toBe(1);
  });
});
