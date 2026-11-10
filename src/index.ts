// Export Core Types
export * from './types/index.js';

// 1: Phantom Credentials & Egress Policy Proxy
export { PhantomEngine, type TokenSwapResult } from './proxy/phantom-engine.js';
export { PolicyEngine, type PolicyVerdict } from './proxy/policy-engine.js';
export { QAFindGateway } from './proxy/gateway.js';

// 2: Compiler, Locators, Self-Healing & Compounding Dataset
export { TraceRecorder } from './compiler/trace-recorder.js';
export { AstGenerator, type CompilationOptions } from './compiler/ast-generator.js';
export { SelfHealer, type SelfHealOptions } from './healer/self-healer.js';
export { DatasetCollector } from './healer/dataset-collector.js';
export { stringSimilarity, levenshteinDistance, tokenOverlap } from './healer/dom-diff.js';

// 3: Browser Checkpoints and Parallel Contexts
export { CheckpointManager, encryptCheckpoint, decryptCheckpoint } from './forker/checkpoint-manager.js';
export { StateForker, type ForkWorkerContext, type ForkWorkerFunction } from './forker/state-forker.js';

// 4: Cryptographic Ledger & Compliance Bundles
export { MerkleTree, type MerkleProofStep } from './compliance/merkle-tree.js';
export { QAFindLedger } from './compliance/ledger.js';
export { AttestationEngine, type AttestationOptions } from './compliance/attestation.js';
export { Soc2Reporter } from './compliance/soc2-reporter.js';
export { HtmlReporter, type HtmlReportData } from './compliance/html-reporter.js';

// 5: Virtual Time-Warp & Shadow Production
export { TimeWarper } from './timewarp/time-warper.js';
export { ShadowRecorder } from './shadow/shadow-recorder.js';
export { ShadowSynthesizer } from './shadow/shadow-synthesizer.js';

// 6: Mutation Observation Prototype
export { ChaosHunter, type ChaosAuditOptions } from './chaos/chaos-hunter.js';

// 7: Browser Trace Diagnostics
export { CausalXRay } from './telemetry/causal-xray.js';

// 8: Browser-State Capsule Prototype
export { TelemetryRingBuffer, CapsuleManager } from './teleport/capsule.js';

// Runner & Resilient Locators
export { QAFindRunner } from './runner/qafind-runner.js';
export { qafindLocator, type ResilientLocatorConfig } from './runner/locator.js';
export { ExecutionTargetRouter, type RouteRunOptions } from './router/execution-router.js';

// Config & Utilities
export { loadConfig, ConfigError } from './config/loader.js';
export { QAFindConfigSchema } from './config/schema.js';
export { sha256, generatePhantomToken, signHmac, verifyHmac, redactSecrets } from './utils/crypto.js';
export { logger } from './utils/logger.js';

