import pc from 'picocolors';
import { AGENT_IDS, AGENT_LABELS, ask, doctor, preferredAgent, type AgentId } from './local-agent.js';
import { buildExplainPrompt, type ExplainableRun } from './explain.js';
import { cloudRequest } from '../router/cloud-api.js';
import { resolveCloudAuth } from '../router/cloud-credentials.js';

export function parseAgentOption(value: string | undefined): AgentId | 'auto' {
  if (!value) return preferredAgent();
  const v = value.trim().toLowerCase();
  if (v === 'auto') return 'auto';
  if ((AGENT_IDS as readonly string[]).includes(v)) return v as AgentId;
  if (v === 'antigravity') return 'agy';
  if (v === 'claude-code') return 'claude';
  throw new Error(`Unknown agent "${value}". Use one of: auto, ${AGENT_IDS.join(', ')} (antigravity = agy).`);
}

const FIX_HINT: Record<AgentId, string> = {
  claude: 'run "claude" once and sign in (/login)',
  agy: 'open Antigravity and sign in, or run "agy" once',
  codex: 'run "codex login", and pick a model your account allows (codex -m <model>)',
  gemini: 'run "gemini" once and choose "Login with Google"',
};

export async function aiDoctorCommand(opts: { probe?: boolean; json?: boolean }): Promise<void> {
  const rows = await doctor({ probe: opts.probe });
  if (opts.json) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  console.log(pc.bold('Local agents Airlock can use instead of an API key:'));
  for (const r of rows) {
    const state = r.state === 'ready' ? pc.green('ready') : r.state === 'missing' ? pc.dim('not installed') : r.state ? pc.yellow(r.state) : pc.cyan('installed');
    console.log(`  ${r.label.padEnd(12)} ${state}${r.path ? pc.dim(`  ${r.path}`) : ''}${r.ms ? pc.dim(`  ${(r.ms / 1000).toFixed(1)} s`) : ''}`);
    if (r.detail) console.log(pc.dim(`               ${r.detail}`));
    if (r.state === 'auth') console.log(pc.dim(`               fix: ${FIX_HINT[r.agent]}`));
  }
  if (!opts.probe) console.log(pc.dim('\nRun "airlock ai doctor --probe" to check that each one answers (sends a one-word prompt).'));
  const pick = preferredAgent();
  console.log(pc.dim(`Agent used: ${pick === 'auto' ? 'auto (first that answers: ' + AGENT_IDS.map((a) => AGENT_LABELS[a]).join(', ') + ')' : AGENT_LABELS[pick]}. Set AIRLOCK_AGENT or pass --agent to choose.`));
}

export async function aiAskCommand(question: string, opts: { agent?: string; model?: string }): Promise<void> {
  const answer = await ask(question, { agent: parseAgentOption(opts.agent), model: opts.model });
  console.log(answer.text);
  console.error(pc.dim(`\n(${AGENT_LABELS[answer.agent]}, ${(answer.ms / 1000).toFixed(1)} s)`));
}

export async function aiExplainCommand(runId: string, opts: { agent?: string; model?: string; apiUrl?: string; showPrompt?: boolean }): Promise<void> {
  const auth = resolveCloudAuth({ apiUrl: opts.apiUrl });
  if (!auth) throw new Error('Not signed in. Run "airlock login" (or set AIRLOCK_API_KEY) to read QA runs.');
  const target = { apiUrl: auth.apiUrl, apiKey: auth.apiKey };
  let id = runId;
  if (runId === 'latest' || runId === 'last') {
    const list = await cloudRequest<{ runs: Array<{ id: string; status: string }> }>(target, 'GET', '/v1/qa-runs?limit=20');
    const failed = list.runs.find((r) => r.status === 'FAILED') ?? list.runs[0];
    if (!failed) throw new Error('No QA runs yet.');
    id = failed.id;
  }
  const run = await cloudRequest<ExplainableRun>(target, 'GET', `/v1/qa-runs/${encodeURIComponent(id)}`);
  const prompt = buildExplainPrompt(run);
  if (opts.showPrompt) {
    console.log(prompt);
    return;
  }
  console.error(pc.dim(`QA run ${run.id}: ${run.status}${run.phase ? ` (${run.phase})` : ''}. Asking a local agent...`));
  const answer = await ask(prompt, { agent: parseAgentOption(opts.agent), model: opts.model });
  console.log(answer.text);
  console.error(pc.dim(`\nAI suggestion from ${AGENT_LABELS[answer.agent]} (${(answer.ms / 1000).toFixed(1)} s), not verified by Airlock.`));
}
