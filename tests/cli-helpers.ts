import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';

export const REPO_ROOT = path.resolve(import.meta.dir, '..');
export const CLI = path.join(REPO_ROOT, 'bin', 'qafind.ts');

const macChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const chromePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (fs.existsSync(macChromePath) ? macChromePath : undefined);

export function hasPlaywrightTest(): boolean {
  try {
    createRequire(path.join(REPO_ROOT, 'package.json')).resolve('@playwright/test/cli');
    return true;
  } catch {
    return false;
  }
}

export interface CliResult {
  code: number;
  output: string;
}

/** Run the QAFind CLI with Bun and capture its combined output. */
export function runCli(args: string[], options: { cwd?: string; env?: Record<string, string | undefined> } = {}): Promise<CliResult> {
  // A fixed test-only signing key, so CLI runs sign evidence even when CI=true refuses the dev key.
  const env: Record<string, string | undefined> = {
    ...process.env,
    NO_COLOR: '1',
    QAFIND_SIGNING_KEY: process.env.QAFIND_SIGNING_KEY || 'qafind-cli-tests-only-signing-key-0001',
    ...options.env,
  };
  for (const [key, value] of Object.entries(env)) if (value === undefined) delete env[key];
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CLI, ...args], {
      cwd: options.cwd || REPO_ROOT,
      env: env as NodeJS.ProcessEnv,
    });
    let output = '';
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('error', reject);
    child.on('exit', (code) => resolve({ code: code ?? 1, output }));
  });
}
