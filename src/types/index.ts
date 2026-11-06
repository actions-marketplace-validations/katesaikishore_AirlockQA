/**
 * AirlockQA Core Types
 * 1. Phantom Credentials & Policy Proxy
 * 2. Deterministic Compiler & Self-Healing Engine
 * 3. Sub-Second Time-Travel State Forking
 * 4. Cryptographic Proof-of-Execution & Compliance Bundles
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// ==========================================
// 1: PHANTOM CREDENTIALS & POLICY TYPES
// ==========================================

export interface PhantomSecretConfig {
  /** The real sensitive secret value (kept strictly outside the sandbox) */
  real: string;
  /** The dummy phantom token injected into the sandbox */
  phantom: string;
  /** Permitted destination hosts for this secret */
  allowedHosts: string[];
  /** Permitted HTTP methods */
  allowedMethods?: HttpMethod[];
  /** Disallowed URL paths (e.g. mutations like refunds, transfers) */
  blockedPaths?: string[];
  /** Optional header name where token is injected (defaults to Authorization) */
  headerName?: string;
  /** Optional token prefix (e.g. 'Bearer ') */
  headerPrefix?: string;
}

export interface EgressRule {
  id: string;
  description?: string;
  hostPattern: string; // glob or regex e.g. "api.stripe.com" or "*.staging.acme.internal"
  methods?: HttpMethod[];
  allowedPaths?: string[];
  blockedPaths?: string[];
  action: 'ALLOW' | 'BLOCK' | 'REDACT' | 'ALERT';
  maxPayloadBytes?: number;
  customValidator?: (req: InterceptedRequest) => boolean | Promise<boolean>;
}

export interface EgressPolicyConfig {
  defaultAction: 'BLOCK' | 'ALLOW';
  allowedEgressHosts: string[];
  blockedEgressHosts: string[];
  rules: EgressRule[];
  logPayloads?: boolean;
}

export interface InterceptedRequest {
  id: string;
  timestamp: string;
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
  host: string;
  path: string;
  phantomTokensDetected: string[];
  realTokensSwapped: string[];
  policyVerdict: 'ALLOWED' | 'BLOCKED' | 'SANITIZED';
  policyReason?: string;
}

export interface InterceptedResponse {
  id: string;
  requestId: string;
  status: number;
  headers: Record<string, string>;
  body?: string;
  timestamp: string;
  secretsSanitizedCount: number;
}

// ==========================================
// 2: COMPILER, LOCATORS & SELF-HEALING
// ==========================================

export interface ElementFingerprint {
  css: string;
  xpath?: string;
  ariaRole?: string;
  ariaName?: string;
  dataTestId?: string;
  textContent?: string;
  tagName: string;
  attributes: Record<string, string>;
  domContextSnippet?: string;
  boundingClientRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type TraceActionType =
  | 'goto'
  | 'click'
  | 'fill'
  | 'press'
  | 'select'
  | 'hover'
  | 'scroll'
  | 'assert_visible'
  | 'assert_text'
  | 'assert_url'
  | 'assert_network'
  | 'checkpoint';

export interface TraceStep {
  index: number;
  type: TraceActionType;
  target?: ElementFingerprint;
  value?: string;
  url?: string;
  expected?: string;
  checkpointName?: string;
  timestamp: string;
  durationMs?: number;
  screenshotHash?: string;
  domSnapshotBefore?: string;
  domSnapshotAfter?: string;
}

export interface ExecutionTrace {
  id: string;
  suiteName: string;
  targetUrl: string;
  startTime: string;
  endTime?: string;
  totalDurationMs?: number;
  steps: TraceStep[];
  networkEvents: InterceptedRequest[];
  metadata: Record<string, unknown>;
}

export interface HealingCandidate {
  selector: string;
  confidence: number;
  method: 'exact_testid' | 'aria_fuzzy' | 'structural_xpath' | 'semantic_text' | 'ml_heuristic';
  elementSnippet: string;
}

export interface MutationDatasetEntry {
  id: string;
  timestamp: string;
  testFile: string;
  stepIndex: number;
  action: TraceActionType;
  brokenSelector: string;
  healedSelector: string;
  confidence: number;
  resolutionMethod: string;
  beforeDomSnippet: string;
  afterDomSnippet: string;
  frameworkDetected?: string;
}

// ==========================================
// 3: TIME-TRAVEL STATE FORKING
// ==========================================

export interface StorageStateSnapshot {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }>;
  origins: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
}

export interface CheckpointSnapshot {
  id: string;
  name: string;
  stepIndex: number;
  timestamp: string;
  url: string;
  htmlContent?: string;
  storageState: StorageStateSnapshot;
  sessionStorage: Record<string, string>;
  domHash: string;
  metadata?: Record<string, unknown>;
}

export interface ForkVariation {
  id: string;
  description: string;
  inputOverrides: Record<string, string>;
  expectedOutcome: 'pass' | 'fail' | 'edge_handled';
}

export interface ForkExecutionResult {
  checkpointId: string;
  variationId: string;
  durationMs: number;
  success: boolean;
  error?: string;
  finalUrl: string;
  assertionsPassed: number;
  assertionsTotal: number;
  ledgerMerkleRoot: string;
}

// ==========================================
// 4: CRYPTOGRAPHIC LEDGER & COMPLIANCE
// ==========================================

export interface LedgerBlock {
  index: number;
  timestamp: string;
  type:
    | 'EXEC_START'
    | 'ACTION_DISPATCH'
    | 'ACTION_COMPLETE'
    | 'ASSERTION_EVAL'
    | 'PROXY_INTERCEPT'
    | 'POLICY_VERIFY'
    | 'SECRET_SWAP'
    | 'EGRESS_BLOCKED'
    | 'CHECKPOINT_SAVED'
    | 'CHECKPOINT_RESTORED'
    | 'HEAL_APPLIED'
    | 'EXEC_COMPLETE';
  payload: Record<string, unknown>;
  previousHash: string;
  blockHash: string;
}

export interface ComplianceProofBundle {
  specVersion: '1.0.0';
  runId: string;
  merkleRoot: string;
  signature: string;
  signingAlgorithm: 'HMAC-SHA256' | 'Ed25519';
  publicKeyOrKeyId: string;
  timestamp: string;
  summary: {
    totalSteps: number;
    passedSteps: number;
    failedSteps: number;
    durationMs: number;
    zeroTokenCostDeterministic: boolean;
  };
  policyAudit: {
    phantomTokensConfigured: number;
    phantomTokensProtected: number;
    realSecretsExposedToSandbox: 0;
    egressBlockedCount: number;
    egressAllowedCount: number;
    unauthorizedMutationsPrevented: number;
  };
  soc2Mapping: {
    cc6_1_logicalAccess: 'COMPLIANT' | 'NON_COMPLIANT';
    cc6_6_boundaryProtection: 'COMPLIANT' | 'NON_COMPLIANT';
    cc7_1_changeVerification: 'COMPLIANT' | 'NON_COMPLIANT';
    cc8_1_nonRepudiation: 'COMPLIANT' | 'NON_COMPLIANT';
  };
  blocksCount: number;
  ledgerVerificationStatus: 'VALID_CHAIN' | 'TAMPERED';
}

// ==========================================
// TOP-LEVEL AIRLOCK CONFIGURATION
// ==========================================

export interface AirlockConfig {
  projectName: string;
  baseUrl: string;
  browser?: {
    headless?: boolean;
    executablePath?: string;
    slowMo?: number;
    viewport?: { width: number; height: number };
  };
  proxy?: {
    enabled: boolean;
    port?: number;
    host?: string;
  };
  secrets: Record<string, PhantomSecretConfig>;
  policy: EgressPolicyConfig;
  compiler?: {
    outputDir?: string;
    defaultTimeoutMs?: number;
    emitAriaFallbacks?: boolean;
  };
  healer?: {
    autoHeal: boolean;
    confidenceThreshold: number;
    datasetDir?: string;
    saveMutations?: boolean;
  };
  forker?: {
    checkpointsDir?: string;
    maxParallelForks?: number;
  };
  compliance?: {
    signingKey?: string;
    outputDir?: string;
    generateHtmlReport?: boolean;
  };
}
