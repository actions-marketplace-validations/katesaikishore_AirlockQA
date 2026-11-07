import type { ComplianceProofBundle, HttpMethod } from './index.js';

export interface CloudRunRequest {
  suiteName: string;
  compiledSpecContent?: string;
  targetUrl: string;
  /** Phantom placeholders and policy only. Real credentials must never be sent by the CLI. */
  phantomConfig: Record<string, {
    phantom: string;
    allowedHosts: string[];
    allowedMethods?: HttpMethod[];
    blockedPaths?: string[];
  }>;
  egressPolicyYaml?: string;
  /** Declarative workflow executed by hosted runs (same shape as the `workflow` config section). */
  workflow?: { name?: string; startUrl?: string; steps: unknown[] };
  options?: {
    workersCount?: number;
  };
}

export interface CloudRunResponse {
  runId: string;
  tenantId?: string;
  status: 'ACCEPTED' | 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'POLICY_VIOLATION';
  executionTimeMs?: number;
  totalSteps?: number;
  passedSteps?: number;
  attestation?: ComplianceProofBundle;
  githubPRComment?: string;
}
