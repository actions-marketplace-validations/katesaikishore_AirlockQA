/**
 * AirlockQA Core Types
 * Type contracts for browser testing, request policy, checkpoints, and evidence prototypes.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// ==========================================
// 1: PHANTOM CREDENTIALS & POLICY TYPES
// ==========================================

export interface PhantomSecretConfig {
  /** Configured secret used by the trusted proxy for an allowed substitution. */
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
// 3: BROWSER CHECKPOINTS AND PARALLEL CONTEXTS
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
    | 'TIMEWARP_ADVANCED'
    | 'SHADOW_MODE_ACTIVE'
    | 'CHAOS_AUDIT_COMPLETE'
    | 'CAPSULE_REHYDRATED'
    | 'EXEC_COMPLETE';
  payload: Record<string, unknown>;
  previousHash: string;
  blockHash: string;
}

/**
 * Signed run-evidence bundle (spec v2).
 *
 * `signature` covers the canonical JSON of every other field in the bundle
 * (including the embedded ledger blocks). v1 bundles, which signed only the
 * Merkle root, are rejected by the verifier.
 */
export interface ComplianceProofBundle {
  specVersion: '2.0.0';
  runId: string;
  merkleRoot: string;
  signature: string;
  signingAlgorithm: 'HMAC-SHA256' | 'Ed25519';
  /** HMAC: `hmac:<fingerprint>` or `INSECURE-DEV-KEY`; Ed25519: `ed25519:<fingerprint>`. */
  publicKeyOrKeyId: string;
  /** SPKI PEM public key, present for Ed25519 bundles. */
  publicKey?: string;
  /** True when the bundle was signed with the built-in development key. Such evidence proves nothing. */
  insecureDevKey: boolean;
  timestamp: string;
  summary: {
    totalSteps: number;
    /** Pass/fail cannot be inferred from ACTION_DISPATCH events alone. */
    passedSteps: null;
    failedSteps: null;
    durationMs: number;
    aiTokenCostUsd: null;
  };
  policyAudit: {
    phantomTokensConfigured: number;
    /** Secret exposure is not comprehensively measured by the current runner. */
    realSecretsExposedToSandbox: null;
    egressBlockedCount: number;
    egressAllowedCount: number;
    unauthorizedMutationsPrevented: number;
  };
  soc2Mapping: {
    cc6_1_logicalAccess: 'NOT_ASSESSED';
    cc6_6_boundaryProtection: 'NOT_ASSESSED';
    cc7_1_changeVerification: 'NOT_ASSESSED';
    cc8_1_nonRepudiation: 'NOT_ASSESSED';
  };
  blocksCount: number;
  ledgerVerificationStatus: 'VALID_CHAIN' | 'TAMPERED';
  /** Full ledger, so verifiers can recompute the hash chain and Merkle root. */
  ledgerBlocks: LedgerBlock[];
}

// ==========================================
// 5: TIME-WARP & SHADOW PRODUCTION TYPES
// ==========================================

export interface TimeWarpResult {
  previousTimeIso: string;
  targetTimeIso: string;
  deltaMs: number;
  durationString: string;
  scope: 'internal' | 'browser-page';
  affectedPageAPIs: string[];
  /** @deprecated No system clock layers are synchronized; this is always empty. */
  clockLayersSynchronized: string[];
}

export interface WireInteraction {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  host: string;
  path: string;
  requestHeaders: Record<string, string>;
  requestBodyHash?: string;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
  /** Optional caller-supplied observation; null when no measurement is provided. */
  latencyMs: number | null;
}

// ==========================================
// 6: MUTATION OBSERVATION PROTOTYPE TYPES
// ==========================================

export interface CloneAuditResult {
  /** @deprecated This entry describes an observation/scenario, not a VM clone. */
  cloneId: string;
  scenarioId: string;
  name: string;
  description: string;
  status: 'OBSERVED' | 'SIMULATED' | 'RISK_INDICATED';
  durationMs: number | null;
  httpStatus: number | null;
  vulnerability: string | null;
  recommendation: string | null;
}

export interface ChaosAuditReport {
  id: string;
  timestamp: string;
  targetEndpoint: string;
  status: 'OBSERVED' | 'SIMULATED' | 'RISK_INDICATED';
  executionMode: 'OBSERVATION_ONLY';
  scenarios: CloneAuditResult[];
  /** @deprecated Use scenarios; no VM clones are created by this prototype. */
  clones: CloneAuditResult[];
  idempotencyKeyObserved: boolean;
  idempotencyAssumed: boolean;
  /** @deprecated This observation-only prototype cannot verify backend enforcement. */
  idempotencyEnforced: boolean;
  /** @deprecated This observation-only prototype never executes a duplicate request. */
  doubleSpendDetected: boolean;
  doubleSpendRiskIndicated: boolean;
  summary: string;
}

// ==========================================
// 7: FULL-STACK CAUSAL X-RAY TYPES
// ==========================================

export interface XRayBackendDiagnostic {
  errorClass?: string;
  errorMessage?: string;
  culpritFile?: string;
  culpritLine?: number;
  culpritFunction?: string;
  codeSnippet?: string;
  databaseQuery?: string;
  databaseLockState?: string;
}

export interface XRayTrace {
  traceId: string;
  spanId: string;
  timestamp: string;
  stepName: string;
  domAction?: {
    action: string;
    selector?: string;
    value?: string;
  };
  network?: {
    method: string;
    url: string;
    status: number;
    latencyMs: number | null;
    requestHeaders: Record<string, string>;
    responseHeaders: Record<string, string>;
    responseBodySnippet?: string;
  };
  backendDiagnostics?: XRayBackendDiagnostic;
  kernelSyscalls?: Array<{
    syscall: string;
    count: number;
    latencyUs: number;
  }>;
}

export interface XRayDiagnosticBundle {
  traceId: string;
  failureReason: string;
  step: string;
  formattedTerminalBox: string;
  traces: XRayTrace[];
}

// ==========================================
// 8: BROWSER-STATE CAPSULE PROTOTYPE TYPES
// ==========================================

export interface TelemetryEvent {
  type: 'console' | 'dom_click' | 'dom_input' | 'navigation' | 'network_req' | 'uncaught_error';
  timestamp: number;
  payload: Record<string, unknown>;
}

export interface StateCapsule {
  capsuleId: string;
  timestamp: string;
  appVersion: string;
  environment: 'production' | 'staging' | 'preview';
  url: string;
  userAgent: string;
  viewport: { width: number; height: number };
  events: TelemetryEvent[];
  crash: {
    message: string;
    stack: string;
    timestamp: number;
  };
  storage: {
    localStorage: Record<string, string>;
    sessionStorage: Record<string, string>;
    cookies: Array<{ name: string; value: string; domain?: string; path?: string }>;
  };
  checksum: string;
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
