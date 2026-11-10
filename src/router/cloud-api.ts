import type { RunDetail, RunSummary, UsageInfo } from '../../cloud/shared/contract.js';
import type { ComplianceProofBundle } from '../types/index.js';
import { CloudApiError, normalizeApiUrl } from './cloud-run-client.js';

export interface ApiTarget {
  apiUrl: string;
  apiKey: string;
  /** Injected in tests. */
  fetcher?: typeof fetch;
}

const REQUEST_TIMEOUT_MS = 30_000;
export const TERMINAL_RUN_STATUSES = new Set(['SUCCESS', 'FAILED', 'POLICY_VIOLATION', 'CANCELLED']);

export interface EvidenceKeyInfo {
  algorithm: 'Ed25519';
  keyId: string;
  publicKeyPem: string;
}

/** One authenticated JSON request. Non-2xx responses throw CloudApiError with a readable message. */
export async function cloudRequest<T>(target: ApiTarget, method: string, path: string, body?: unknown): Promise<T> {
  const base = normalizeApiUrl(target.apiUrl);
  const fetcher = target.fetcher ?? fetch;
  let response: Response;
  try {
    response = await fetcher(`${base}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${target.apiKey}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    throw new Error(`Cannot reach QAFind Cloud at ${base}: ${cause}`);
  }

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    parsed = undefined;
  }
  if (!response.ok) throw new CloudApiError(response.status, parsed, response.headers);
  return parsed as T;
}

export const getUsage = (target: ApiTarget) => cloudRequest<UsageInfo>(target, 'GET', '/v1/usage');
export const getEvidenceKey = (target: ApiTarget) => cloudRequest<EvidenceKeyInfo>(target, 'GET', '/v1/evidence-key');
export const getRun = (target: ApiTarget, id: string) =>
  cloudRequest<RunDetail>(target, 'GET', `/v1/runs/${encodeURIComponent(id)}`);
export const getRunEvidence = (target: ApiTarget, id: string) =>
  cloudRequest<ComplianceProofBundle>(target, 'GET', `/v1/runs/${encodeURIComponent(id)}/evidence`);
export const cancelRun = (target: ApiTarget, id: string) =>
  cloudRequest<RunDetail>(target, 'POST', `/v1/runs/${encodeURIComponent(id)}/cancel`);

export function listRuns(target: ApiTarget, options: { limit?: number; status?: string } = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', String(options.limit));
  if (options.status) params.set('status', options.status);
  const query = params.toString();
  return cloudRequest<{ runs: RunSummary[]; nextCursor?: string | null }>(
    target,
    'GET',
    `/v1/runs${query ? `?${query}` : ''}`
  );
}

export interface WaitOptions {
  intervalMs?: number;
  timeoutMs?: number;
  onUpdate?: (run: RunDetail) => void;
  sleep?: (ms: number) => Promise<void>;
}

/** Poll a run until it reaches a terminal status. Throws when the deadline passes. */
export async function waitForRun(target: ApiTarget, runId: string, options: WaitOptions = {}): Promise<RunDetail> {
  const interval = options.intervalMs ?? 2000;
  const timeoutMs = options.timeoutMs ?? 10 * 60_000;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const deadline = Date.now() + timeoutMs;
  let lastStatus = '';
  let transientFailures = 0;
  while (true) {
    let run: RunDetail;
    try {
      run = await getRun(target, runId);
      transientFailures = 0;
    } catch (error) {
      // A dropped connection or a 5xx should not abandon a run that is still going in the cloud.
      const status = error instanceof CloudApiError ? error.status : 0;
      const transient = status === 0 || status >= 500;
      if (!transient || ++transientFailures > 3) throw error;
      await sleep(interval);
      continue;
    }
    if (typeof run.status !== 'string') throw new Error('QAFind Cloud returned a run without a status.');
    if (run.status !== lastStatus) {
      lastStatus = run.status;
      options.onUpdate?.(run);
    }
    if (TERMINAL_RUN_STATUSES.has(run.status)) return run;
    if (run.status !== 'QUEUED' && run.status !== 'RUNNING') {
      throw new Error(`QAFind Cloud reported an unknown run status (${run.status.slice(0, 40)}). Check it with "qafind runs ${runId}".`);
    }
    if (Date.now() >= deadline) {
      throw new Error(
        `Timed out waiting for run ${runId} (last status ${run.status}). It keeps running in the cloud; check it with "qafind runs ${runId}".`
      );
    }
    await sleep(interval);
  }
}
