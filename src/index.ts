// Export Core Types
export * from './types/index.js';

// 1: Phantom Credentials & Egress Policy Proxy
export { PhantomEngine, type TokenSwapResult } from './proxy/phantom-engine.js';
export { PolicyEngine, type PolicyVerdict } from './proxy/policy-engine.js';
export { AirlockGateway } from './proxy/gateway.js';

// 2: Compiler, Locators, Self-Healing & Compounding Dataset
export { TraceRecorder } from './compiler/trace-recorder.js';
export { AstGenerator, type CompilationOptions } from './compiler/ast-generator.js';
export { SelfHealer, type SelfHealOptions } from './healer/self-healer.js';
export { DatasetCollector } from './healer/dataset-collector.js';
export { stringSimilarity, levenshteinDistance, tokenOverlap } from './healer/dom-diff.js';

// 3: Sub-Second Time-Travel State Forking
export { CheckpointManager } from './forker/checkpoint-manager.js';
export { StateForker, type ForkWorkerContext, type ForkWorkerFunction } from './forker/state-forker.js';

// 4: Cryptographic Ledger & Compliance Bundles
export { MerkleTree, type MerkleProofStep } from './compliance/merkle-tree.js';
export { AirlockLedger } from './compliance/ledger.js';
export { AttestationEngine, type AttestationOptions } from './compliance/attestation.js';
export { Soc2Reporter } from './compliance/soc2-reporter.js';
export { HtmlReporter, type HtmlReportData } from './compliance/html-reporter.js';

// Runner & Resilient Locators
export { AirlockRunner } from './runner/airlock-runner.js';
export { airlockLocator, type ResilientLocatorConfig } from './runner/locator.js';
export { ExecutionTargetRouter, type RouteRunOptions } from './router/execution-router.js';

// Config & Utilities
export { loadConfig } from './config/loader.js';
export { AirlockConfigSchema } from './config/schema.js';
export { sha256, generatePhantomToken, signHmac, verifyHmac, redactSecrets } from './utils/crypto.js';
export { logger } from './utils/logger.js';

