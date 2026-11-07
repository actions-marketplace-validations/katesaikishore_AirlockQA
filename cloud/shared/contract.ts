/**
 * Airlock Cloud API contract, shared by the API server, the run worker, the CLI and the tests.
 * Human-readable description: docs/cloud-api.md. If the two disagree, this file wins.
 */
import { z } from 'zod';
import { WorkflowSchema } from '../../src/config/workflow-schema.js';

export const API_VERSION = 'v1';
export const KEY_PREFIX = 'air_live_';
/** Header that cookie-authenticated, state-changing requests must send. */
export const CSRF_HEADER = 'x-airlock-csrf';
export const SESSION_COOKIE = 'airlock_session';

/** Default plan limits. The server may override them from environment variables. */
export const PLAN_LIMITS = {
  free: {
    /** Accepted runs per workspace per UTC day. Every accepted run counts, including retries. */
    dailyRuns: 100,
    concurrentRuns: 1,
    maxSteps: 50,
    runTimeoutSec: 90,
    maxActiveKeys: 10,
  },
} as const;

export const RUN_STATUSES = ['QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'POLICY_VIOLATION', 'CANCELLED'] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];
export const TERMINAL_STATUSES: readonly RunStatus[] = ['SUCCESS', 'FAILED', 'POLICY_VIOLATION', 'CANCELLED'];

export const FAILURE_REASONS = ['STEP_FAILED', 'TIMEOUT', 'TARGET_BLOCKED', 'BROWSER_ERROR', 'INTERNAL', 'CANCELLED'] as const;
export type FailureReason = (typeof FAILURE_REASONS)[number];

/** Stable machine-readable error codes. Error bodies are `{ code, message, ...extras }`. */
export const ERROR_CODES = [
  'INVALID_REQUEST',
  'UNSUPPORTED_FIELD',
  'REAL_SECRET_REJECTED',
  'ENV_REFERENCE_REJECTED',
  'UNAUTHENTICATED',
  'INVALID_CREDENTIALS',
  'FORBIDDEN',
  'NOT_FOUND',
  'EMAIL_TAKEN',
  'WEAK_PASSWORD',
  'KEY_LIMIT_REACHED',
  'DAILY_QUOTA_EXCEEDED',
  'RATE_LIMITED',
  'SIGNUPS_PAUSED',
  'CONFLICT',
  'PAYLOAD_TOO_LARGE',
  'INTERNAL',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

const HttpMethod = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']);

export const PhantomConfigSchema = z
  .record(
    z.string().min(1).max(64),
    z
      .object({
        phantom: z.string().min(8).max(256),
        allowedHosts: z.array(z.string().min(1).max(255)).max(50),
        allowedMethods: z.array(HttpMethod).max(10).optional(),
        blockedPaths: z.array(z.string().max(255)).max(50).optional(),
      })
      .strict()
  )
  .refine((v) => Object.keys(v).length <= 20, 'phantomConfig can hold at most 20 secrets');

/** POST /v1/runs body. Unknown keys are rejected (for example compiledSpecContent). */
export const CreateRunBodySchema = z
  .object({
    suiteName: z.string().trim().min(1).max(80),
    targetUrl: z.string().url().max(2048),
    phantomConfig: PhantomConfigSchema.default({}),
    /** Declarative steps. Omitted: the service runs a smoke workflow (open the URL, expect a visible body). */
    workflow: WorkflowSchema.optional(),
    options: z.object({ workersCount: z.literal(1).optional() }).strict().optional(),
  })
  .strict()
  .superRefine((body, ctx) => {
    // Hosted runs send requests from the service's own address, so a workflow must not be usable as a free
    // relay to arbitrary third-party hosts: absolute `goto` and `request` URLs must stay on the target's host
    // or on a host the caller listed in phantomConfig.allowedHosts. Relative URLs always resolve to the target.
    let target: URL;
    try {
      target = new URL(body.targetUrl);
    } catch {
      return;
    }
    const allowed = new Set<string>([target.hostname.toLowerCase()]);
    const suffixes: string[] = [];
    for (const secret of Object.values(body.phantomConfig ?? {})) {
      for (const host of secret.allowedHosts) {
        const h = host.trim().toLowerCase().replace(/:\d+$/, '');
        if (h.startsWith('*.') && h.length > 2) suffixes.push(h.slice(1));
        else if (h && h !== '*') allowed.add(h);
      }
    }
    const permitted = (hostname: string) => allowed.has(hostname) || suffixes.some((suffix) => hostname.endsWith(suffix));
    (body.workflow?.steps ?? []).forEach((step, index) => {
      if (step.action !== 'goto' && step.action !== 'request') return;
      let resolved: URL;
      try {
        resolved = new URL(step.url, body.targetUrl);
      } catch {
        ctx.addIssue({ code: 'custom', path: ['workflow', 'steps', index, 'url'], message: 'The URL is not valid' });
        return;
      }
      if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
        ctx.addIssue({ code: 'custom', path: ['workflow', 'steps', index, 'url'], message: 'Only http and https URLs are allowed' });
      } else if (!permitted(resolved.hostname.toLowerCase())) {
        ctx.addIssue({
          code: 'custom',
          path: ['workflow', 'steps', index, 'url'],
          message: `${resolved.hostname} is not the target host or one of the phantomConfig allowedHosts`,
        });
      }
    });
  });
export type CreateRunBody = z.infer<typeof CreateRunBodySchema>;

export const SignupBodySchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(10).max(200),
    name: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

export const LoginBodySchema = z
  .object({ email: z.string().trim().toLowerCase().email().max(254), password: z.string().min(1).max(200) })
  .strict();

export const CreateKeyBodySchema = z.object({ name: z.string().trim().min(1).max(60) }).strict();
export const RenameWorkspaceBodySchema = z.object({ name: z.string().trim().min(1).max(80) }).strict();

// ---------------------------------------------------------------------------
// Step and request results returned in a run's detail
// ---------------------------------------------------------------------------

export const StepResultSchema = z.object({
  index: z.number().int().min(0),
  action: z.string().max(40),
  target: z.string().max(500).optional(),
  ok: z.boolean(),
  detail: z.string().max(500).optional(),
  error: z.string().max(1000).optional(),
});
export type StepResult = z.infer<typeof StepResultSchema>;

/** One intercepted request. `path` is the pathname only: query strings are never stored. */
export const RequestLogEntrySchema = z.object({
  timestamp: z.string(),
  method: z.string().max(10),
  host: z.string().max(255),
  path: z.string().max(500),
  verdict: z.enum(['ALLOWED', 'BLOCKED', 'SANITIZED']),
  reason: z.string().max(300).optional(),
});
export type RequestLogEntry = z.infer<typeof RequestLogEntrySchema>;

// ---------------------------------------------------------------------------
// Shapes returned to API clients
// ---------------------------------------------------------------------------

export interface QuotaInfo {
  scope: 'workspace';
  used: number;
  limit: number;
  remaining: number;
  /** ISO timestamp of the next UTC midnight. */
  resetAt: string;
}

export interface RunSummary {
  /** `runId` and `id` are identical; `runId` is what the CLI client reads. */
  runId: string;
  id: string;
  status: RunStatus;
  suiteName: string;
  targetUrl: string;
  workflowName: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  executionTimeMs: number | null;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  requestsAllowed: number;
  requestsBlocked: number;
  failureReason: FailureReason | null;
  /** 1-based position while QUEUED, otherwise null. */
  queuePosition: number | null;
  hasEvidence: boolean;
}

export interface RunDetail extends RunSummary {
  steps: StepResult[];
  requests: RequestLogEntry[];
  error: string | null;
  evidence: {
    merkleRoot: string;
    signature: string;
    signingAlgorithm: 'Ed25519' | 'HMAC-SHA256';
    keyId: string;
    blocksCount: number;
  } | null;
  /** Who started the run: an API key (label = key name) or a signed-in session. */
  createdBy: { type: 'key' | 'session'; label: string };
}

export interface UsageInfo {
  plan: 'free';
  daily: QuotaInfo;
  concurrent: { limit: number; running: number; queued: number };
  limits: { maxSteps: number; runTimeoutSec: number; maxActiveKeys: number };
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  /** First characters of the token, for display. The full token is shown once at creation. */
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface ErrorBody {
  code: ErrorCode;
  message: string;
  quota?: QuotaInfo;
  /** Zod issues for INVALID_REQUEST. */
  issues?: Array<{ path: string; message: string }>;
}

/** The smoke workflow used when POST /v1/runs has no `workflow`. */
export function smokeWorkflow(targetUrl: string): z.infer<typeof WorkflowSchema> {
  return {
    name: 'smoke',
    startUrl: targetUrl,
    steps: [
      { action: 'goto', url: targetUrl },
      { action: 'expectVisible', selector: 'body' },
    ],
  };
}
