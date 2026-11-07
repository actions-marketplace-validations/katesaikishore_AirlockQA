import { CreateQaRunBodySchema, QA_SCRIPT_NAME_RE, QA_SUITES, type CreateQaRunBody } from '../../cloud/shared/contract.js';

export class QaPreflightError extends Error {}

const SHA40 = /^[0-9a-f]{40}$/;

/** Turn a git remote into a public https GitHub URL, or refuse. Only github.com, only owner/repo. */
export function parsePublicGithubRemote(remote: string): string {
  let owner: string | undefined;
  let repo: string | undefined;
  const ssh = /^git@github\.com:([^/\s]+)\/([^/\s]+?)(\.git)?$/.exec(remote);
  if (ssh) {
    owner = ssh[1];
    repo = ssh[2];
  } else {
    let u: URL;
    try {
      u = new URL(remote);
    } catch {
      throw new QaPreflightError(`remote is not a URL: ${remote}`);
    }
    if (u.protocol !== 'https:' || u.hostname !== 'github.com') {
      throw new QaPreflightError('QA runs need a public https://github.com/<owner>/<repo> remote');
    }
    if (u.username || u.password) throw new QaPreflightError('remote must not contain credentials');
    const parts = u.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/');
    if (parts.length !== 2) throw new QaPreflightError('remote must be exactly owner/repo');
    [owner, repo] = parts;
  }
  if (!owner || !repo || owner.includes('..') || repo.includes('..') || owner === '.' || repo === '.') {
    throw new QaPreflightError('remote must be exactly owner/repo');
  }
  return `https://github.com/${owner}/${repo}`;
}

export interface BuildQaRunInput {
  remoteUrl: string;
  sha: string;
  branch?: string;
  config: { qa?: { scripts?: Record<string, string>; port?: number; healthPath?: string } };
  suites: string[];
  /** Asks GitHub whether this exact commit exists on the remote (the commits API, not ls-remote). */
  isPushed: (sha: string, repo: string) => Promise<boolean>;
  dirty?: boolean;
  gate?: 'strict' | 'default';
}

export interface PreparedQaRun {
  body: CreateQaRunBody;
  warnings: string[];
}

/** Validate everything locally, check that the commit is pushed, then return the request body. Nothing is submitted here. */
export async function buildQaRunRequest(input: BuildQaRunInput): Promise<PreparedQaRun> {
  const repo = parsePublicGithubRemote(input.remoteUrl);
  if (!SHA40.test(input.sha)) throw new QaPreflightError('the commit must be a full 40-character SHA');

  const scripts = input.config.qa?.scripts ?? {};
  for (const [key, name] of Object.entries(scripts)) {
    if (!QA_SCRIPT_NAME_RE.test(name)) {
      throw new QaPreflightError(`script "${key}" must be an npm script name (letters, digits, : _ -), not a shell command`);
    }
  }
  for (const s of input.suites) {
    if (!(QA_SUITES as readonly string[]).includes(s)) throw new QaPreflightError(`unknown suite "${s}"`);
  }

  if (!(await input.isPushed(input.sha, repo))) {
    throw new QaPreflightError(`commit ${input.sha.slice(0, 7)} is not pushed to ${repo}; push it, then run again`);
  }

  const warnings: string[] = [];
  if (input.dirty) warnings.push('working tree has uncommitted changes; the run tests the pushed commit only');

  const parsed = CreateQaRunBodySchema.safeParse({
    repo,
    sha: input.sha,
    branch: input.branch,
    scripts,
    port: input.config.qa?.port,
    healthPath: input.config.qa?.healthPath,
    suites: input.suites,
    gate: input.gate ?? 'default',
  });
  if (!parsed.success) {
    throw new QaPreflightError(parsed.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; '));
  }
  return { body: parsed.data, warnings };
}
