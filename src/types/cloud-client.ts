import type { ComplianceProofBundle, HttpMethod } from './index.js';

export interface CoWSnapshot {
  id: string;
  vmId: string;
  stepIndex: number;
  name: string;
  timestamp: string;
  memoryCoWSizeBytes: number;
  cloneLatencyMs: number;
  inspectSessionToken: string;
  inspectUrl: string;
  metadata?: Record<string, unknown>;
}

export interface TapInspectionEvent {
  id: string;
  timestamp: string;
  tapDevice: string;
  sourceGuestIp: string;
  destinationHost: string;
  method: HttpMethod;
  path: string;
  guestPhantomToken?: string;
  vaultSecretInjected?: boolean;
  verdict: 'ALLOWED' | 'DROPPED_POLICY_VIOLATION';
  reason?: string;
}

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
  options?: {
    workersCount?: number;
  };
}

export interface CloudRunResponse {
  runId: string;
  tenantId?: string;
  status: 'ACCEPTED' | 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'POLICY_VIOLATION';
  executionTimeMs?: number;
  microVmBootMs?: number;
  totalSteps?: number;
  passedSteps?: number;
  snapshots?: CoWSnapshot[];
  tapInspections?: TapInspectionEvent[];
  attestation?: ComplianceProofBundle;
  liveInspectUrl?: string;
  githubPRComment?: string;
}
