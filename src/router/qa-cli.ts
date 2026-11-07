import { buildQaRunRequest, QaPreflightError, type BuildQaRunInput } from './qa-preflight.js';

export interface QaCliDeps {
  readRemote: () => Promise<string>;
  readHead: () => Promise<string>;
  readBranch: () => Promise<string>;
  isDirty: () => Promise<boolean>;
  isPushed: BuildQaRunInput['isPushed'];
  readConfig: () => Promise<{ qa?: { scripts?: Record<string, string>; port?: number; healthPath?: string } }>;
}

export interface QaCliOptions {
  suites: string[];
  gate: 'strict' | 'default';
}

export type DryRunResult =
  | { ok: true; body: unknown; warnings: string[] }
  | { ok: false; message: string };

/** `airlock qa --dry-run`: prepare and check the request, print it, submit nothing. */
export async function prepareQaDryRun(opts: QaCliOptions, deps: QaCliDeps): Promise<DryRunResult> {
  try {
    const [remoteUrl, sha, branch, dirty, config] = await Promise.all([
      deps.readRemote(),
      deps.readHead(),
      deps.readBranch(),
      deps.isDirty(),
      deps.readConfig(),
    ]);
    const { body, warnings } = await buildQaRunRequest({
      remoteUrl,
      sha,
      branch,
      config,
      suites: opts.suites,
      gate: opts.gate,
      dirty,
      isPushed: deps.isPushed,
    });
    return { ok: true, body, warnings };
  } catch (err) {
    if (err instanceof QaPreflightError) return { ok: false, message: err.message };
    throw err;
  }
}

/** Real dependencies: git and the GitHub CLI, each run with argument arrays (no shell). */
export function realQaDeps(cwd: string = process.cwd()): QaCliDeps {
  const { execFile } = require('node:child_process') as typeof import('node:child_process');
  const { readFile } = require('node:fs/promises') as typeof import('node:fs/promises');
  const run = (cmd: string, args: string[]) =>
    new Promise<string>((resolve, reject) =>
      execFile(cmd, args, { cwd, timeout: 20_000, maxBuffer: 1 << 20 }, (err, stdout) =>
        err ? reject(new QaPreflightError(`${cmd} ${args[0] ?? ''} failed: ${err.message.split('\n')[0]}`)) : resolve(stdout.trim())
      )
    );
  return {
    readRemote: () => run('git', ['remote', 'get-url', 'origin']),
    readHead: () => run('git', ['rev-parse', 'HEAD']),
    readBranch: () => run('git', ['rev-parse', '--abbrev-ref', 'HEAD']),
    isDirty: async () => (await run('git', ['status', '--porcelain'])).length > 0,
    isPushed: async (sha, repo) => {
      const slug = repo.replace('https://github.com/', '');
      try {
        await run('gh', ['api', `repos/${slug}/commits/${sha}`, '--silent']);
        return true;
      } catch {
        return false;
      }
    },
    readConfig: async () => {
      try {
        return JSON.parse(await readFile(`${cwd}/airlock.config.json`, 'utf8'));
      } catch {
        return {};
      }
    },
  };
}
