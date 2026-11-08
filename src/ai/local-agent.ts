import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

/**
 * Use a coding agent that is already installed and signed in on this machine (Claude Code, Antigravity, Codex,
 * Gemini CLI) as the model behind Airlock's AI features, so no API key is needed. Each agent runs headless, in a fresh
 * empty folder, in its read-only or plan mode: it answers the prompt and cannot edit files or run commands.
 */
export type AgentId = 'claude' | 'agy' | 'codex' | 'gemini';
export const AGENT_IDS: readonly AgentId[] = ['claude', 'agy', 'codex', 'gemini'];
export const AGENT_LABELS: Record<AgentId, string> = {
  claude: 'Claude Code',
  agy: 'Antigravity',
  codex: 'Codex',
  gemini: 'Gemini CLI',
};

/** Longest prompt sent to an agent; longer input is cut with a marker so the agent knows it is partial. */
export const MAX_PROMPT_CHARS = 100_000;
const DEFAULT_TIMEOUT_MS = 180_000;
const MAX_OUTPUT_BYTES = 4 * 1024 * 1024;

export interface AgentInvocation {
  command: string;
  args: string[];
  /** Text written to the agent's stdin (the prompt), or null when the prompt is an argument. */
  stdin: string | null;
}

export interface AgentAnswer {
  agent: AgentId;
  text: string;
  ms: number;
}

/** A failure the caller can act on: 'missing' (not installed), 'auth' (signed out or not set up), or 'failed'. */
export class LocalAgentError extends Error {
  constructor(
    readonly agent: AgentId,
    readonly kind: 'missing' | 'auth' | 'failed' | 'timeout',
    message: string,
  ) {
    super(`${AGENT_LABELS[agent]}: ${message}`);
    this.name = 'LocalAgentError';
  }
}

/** Where to look for each agent's executable besides PATH (Antigravity installs its CLI under ~/.gemini/bin). */
export function candidatePaths(agent: AgentId, home = os.homedir()): string[] {
  const names: Record<AgentId, string[]> = { claude: ['claude'], agy: ['agy'], codex: ['codex'], gemini: ['gemini'] };
  const extra: Record<AgentId, string[]> = {
    claude: [path.join(home, '.claude', 'local', 'claude')],
    agy: [path.join(home, '.gemini', 'bin', 'agy')],
    codex: [],
    gemini: [],
  };
  const dirs = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  return [...dirs.flatMap((d) => names[agent].map((n) => path.join(d, n))), ...extra[agent]];
}

/** The agent's executable, or null when it is not installed. */
export function findAgent(agent: AgentId, exists: (p: string) => boolean = isExecutable): string | null {
  return candidatePaths(agent).find(exists) ?? null;
}

function isExecutable(p: string): boolean {
  try {
    fs.accessSync(p, fs.constants.X_OK);
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * Sent before every prompt. The agents run read-only, so a tool call (reading files, running a command) is denied and
 * some agents then return no text at all; telling them up front gets an answer.
 */
export const NO_TOOLS_PREAMBLE =
  'Answer directly from the text in this message. Do not run commands, read or write files, or browse; you have no ' +
  'access to the project. Reply with plain text only.\n\n';

/** Add the no-tools preamble and cut the prompt to MAX_PROMPT_CHARS, saying so in the text. */
export function clampPrompt(prompt: string): string {
  const body = prompt.length <= MAX_PROMPT_CHARS ? prompt : prompt.slice(0, MAX_PROMPT_CHARS) + '\n\n[input truncated by Airlock]';
  return NO_TOOLS_PREAMBLE + body;
}

/** The headless, read-only command line for one agent. `lastMessageFile` is only used by Codex. */
export function buildInvocation(agent: AgentId, command: string, prompt: string, opts: { model?: string; lastMessageFile?: string } = {}): AgentInvocation {
  const text = clampPrompt(prompt);
  const model = opts.model ? ['--model', opts.model] : [];
  switch (agent) {
    case 'claude':
      return { command, args: ['-p', '--output-format', 'json', '--permission-mode', 'plan', ...model], stdin: text };
    case 'agy':
      return { command, args: ['-p', text, '--output-format', 'json', '--mode', 'plan', '--sandbox', ...model], stdin: null };
    case 'codex':
      return {
        command,
        args: ['exec', '--sandbox', 'read-only', '--skip-git-repo-check', '--ephemeral', '--output-last-message', opts.lastMessageFile ?? 'last-message.txt', ...model, '-'],
        stdin: text,
      };
    case 'gemini':
      return { command, args: ['-o', 'json', '--approval-mode', 'default', ...model], stdin: text };
  }
}

const AUTH_HINT = /authenticat|oauth|token has expired|not logged in|log ?in|sign ?in|set an auth method|api key|unauthori[sz]ed|\b401\b|not supported when using/i;

/** Pull the answer text out of an agent's output, or throw a LocalAgentError that says what went wrong. */
export function parseAnswer(agent: AgentId, stdout: string, stderr: string, exitCode: number | null, lastMessage?: string): string {
  const fail = (message: string): never => {
    const m = message.replace(/\s+/g, ' ').trim().slice(0, 300) || `exited with code ${exitCode}`;
    throw new LocalAgentError(agent, AUTH_HINT.test(m) ? 'auth' : 'failed', m);
  };
  if (agent === 'codex') {
    const text = (lastMessage ?? '').trim();
    if (exitCode === 0 && text) return text;
    const err = stderr.split('\n').filter((l) => /error/i.test(l)).pop() ?? stderr;
    const inner = err.match(/"message":"([^"]+)"/);
    return fail(inner ? inner[1] : err);
  }
  // The JSON result is on stdout; some agents print their JSON error on stderr instead.
  const tryJson = (text: string): Record<string, unknown> | null => {
    for (const candidate of [text, text.trim().split('\n').filter(Boolean).pop() ?? '', text.slice(text.indexOf('{'))]) {
      try {
        const v = JSON.parse(candidate) as unknown;
        if (v && typeof v === 'object') return v as Record<string, unknown>;
      } catch { /* next */ }
    }
    return null;
  };
  const json = tryJson(stdout) ?? tryJson(stderr);
  if (!json) return fail(stderr || stdout);
  const nonEmpty = (text: string): string => {
    if (text.trim()) return text.trim();
    const denied = Array.isArray(json.denied_actions) || Array.isArray(json.permission_denials)
      ? ((json.denied_actions ?? json.permission_denials) as Array<{ display_name?: string; tool_name?: string }>)
          .map((d) => d.display_name ?? d.tool_name).filter(Boolean)
      : [];
    return fail(denied.length
      ? `no answer: it tried to use ${denied.join(', ')}, which read-only mode denies`
      : 'no answer (empty reply)');
  };
  if (agent === 'claude') {
    if (json.is_error === true || typeof json.result !== 'string') return fail(String(json.result ?? json.terminal_reason ?? stderr));
    return nonEmpty(json.result);
  }
  if (agent === 'agy') {
    if (json.status !== 'SUCCESS' || typeof json.response !== 'string') return fail(String((json.error as { message?: string })?.message ?? json.status ?? stderr));
    return nonEmpty(json.response);
  }
  // gemini
  const error = json.error as { message?: string } | undefined;
  if (error || typeof json.response !== 'string') return fail(String(error?.message ?? stderr));
  return nonEmpty(json.response);
}

/**
 * Environment for the child: the user's own, minus variables a parent agent session sets (CLAUDECODE, CLAUDE_CODE_*),
 * which would make a nested `claude` think it is part of that session.
 */
export function childEnv(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const out: NodeJS.ProcessEnv = {};
  for (const [k, v] of Object.entries(env)) {
    if (k === 'CLAUDECODE' || k.startsWith('CLAUDE_CODE_') || k === 'CLAUDE_AGENT_SDK_VERSION') continue;
    out[k] = v;
  }
  return out;
}

export interface AskOptions {
  agent?: AgentId | 'auto';
  model?: string;
  timeoutMs?: number;
  /** Test hook: replaces process spawning. */
  run?: (inv: AgentInvocation, cwd: string, timeoutMs: number) => Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean }>;
  /** Test hook: replaces the installed-agent lookup. */
  find?: (agent: AgentId) => string | null;
}

/** Ask one agent. Runs it in a new empty temporary folder that is removed afterwards. */
export async function askAgent(agent: AgentId, prompt: string, opts: AskOptions = {}): Promise<AgentAnswer> {
  const command = (opts.find ?? findAgent)(agent);
  if (!command) throw new LocalAgentError(agent, 'missing', 'not installed (not on PATH)');
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'airlock-agent-'));
  const lastMessageFile = path.join(cwd, 'last-message.txt');
  const started = Date.now();
  try {
    const inv = buildInvocation(agent, command, prompt, { model: opts.model, lastMessageFile });
    const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const res = await (opts.run ?? spawnAgent)(inv, cwd, timeoutMs);
    if (res.timedOut) throw new LocalAgentError(agent, 'timeout', `no answer within ${Math.round(timeoutMs / 1000)} s`);
    let last: string | undefined;
    try { last = fs.readFileSync(lastMessageFile, 'utf8'); } catch { last = undefined; }
    return { agent, text: parseAnswer(agent, res.stdout, res.stderr, res.exitCode, last), ms: Date.now() - started };
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
}

/**
 * Ask the chosen agent, or with 'auto' (the default) the first installed one that answers: an agent that is missing,
 * signed out or misconfigured is skipped and the next is tried. Throws an AggregateError listing every attempt.
 */
export async function ask(prompt: string, opts: AskOptions = {}): Promise<AgentAnswer> {
  const choice = opts.agent ?? preferredAgent();
  const order: AgentId[] = choice === 'auto' ? [...AGENT_IDS] : [choice];
  const errors: LocalAgentError[] = [];
  for (const agent of order) {
    try {
      return await askAgent(agent, prompt, opts);
    } catch (e) {
      if (!(e instanceof LocalAgentError)) throw e;
      errors.push(e);
    }
  }
  throw new AggregateError(errors, `No local agent answered:\n${errors.map((e) => `  - ${e.message}`).join('\n')}`);
}

/** AIRLOCK_AGENT=claude|agy|codex|gemini|auto picks the agent; anything else means auto. */
export function preferredAgent(env: NodeJS.ProcessEnv = process.env): AgentId | 'auto' {
  const v = (env.AIRLOCK_AGENT || '').trim().toLowerCase();
  return (AGENT_IDS as readonly string[]).includes(v) ? (v as AgentId) : 'auto';
}

function spawnAgent(inv: AgentInvocation, cwd: string, timeoutMs: number) {
  return new Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean }>((resolve) => {
    const child = spawn(inv.command, inv.args, { cwd, env: childEnv(), stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const cap = (s: string, chunk: Buffer) => (s.length < MAX_OUTPUT_BYTES ? s + chunk.toString('utf8') : s);
    child.stdout.on('data', (c: Buffer) => { stdout = cap(stdout, c); });
    child.stderr.on('data', (c: Buffer) => { stderr = cap(stderr, c); });
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); setTimeout(() => child.kill('SIGKILL'), 3_000).unref(); }, timeoutMs);
    child.on('error', (e) => { clearTimeout(timer); resolve({ stdout, stderr: stderr + String(e.message), exitCode: null, timedOut }); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ stdout, stderr, exitCode: code, timedOut }); });
    child.stdin.on('error', () => { /* agent closed stdin early; its output says why */ });
    child.stdin.end(inv.stdin ?? '');
  });
}

export interface AgentStatus {
  agent: AgentId;
  label: string;
  path: string | null;
  /** Set when probed: 'ready', or why the agent cannot answer. */
  state?: 'ready' | 'missing' | 'auth' | 'failed' | 'timeout';
  detail?: string;
  ms?: number;
}

/** Which agents are installed; with probe, also whether each one answers a one-word prompt. */
export async function doctor(opts: { probe?: boolean } & AskOptions = {}): Promise<AgentStatus[]> {
  const out: AgentStatus[] = [];
  for (const agent of AGENT_IDS) {
    const p = (opts.find ?? findAgent)(agent);
    const status: AgentStatus = { agent, label: AGENT_LABELS[agent], path: p };
    if (!p) status.state = 'missing';
    else if (opts.probe) {
      try {
        const a = await askAgent(agent, 'Reply with exactly the word: pong', { ...opts, timeoutMs: opts.timeoutMs ?? 120_000 });
        status.state = /pong/i.test(a.text) ? 'ready' : 'failed';
        status.detail = status.state === 'ready' ? undefined : `unexpected answer: ${a.text.slice(0, 80)}`;
        status.ms = a.ms;
      } catch (e) {
        const err = e as LocalAgentError;
        status.state = err.kind ?? 'failed';
        status.detail = err.message.replace(`${AGENT_LABELS[agent]}: `, '');
      }
    }
    out.push(status);
  }
  return out;
}
