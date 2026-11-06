import * as path from 'node:path';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import type {
  AirlockConfig,
  ComplianceProofBundle,
  ForkExecutionResult,
  ForkVariation,
  InterceptedRequest,
  TimeWarpResult,
  WireInteraction,
  ChaosAuditReport,
  XRayDiagnosticBundle,
  StateCapsule,
} from '../types/index.js';
import { loadConfig } from '../config/loader.js';
import { AirlockGateway } from '../proxy/gateway.js';
import { AirlockLedger } from '../compliance/ledger.js';
import { CheckpointManager } from '../forker/checkpoint-manager.js';
import { StateForker, type ForkWorkerFunction } from '../forker/state-forker.js';
import { SelfHealer } from '../healer/self-healer.js';
import { AttestationEngine } from '../compliance/attestation.js';
import { HtmlReporter } from '../compliance/html-reporter.js';
import { Soc2Reporter } from '../compliance/soc2-reporter.js';
import { TimeWarper } from '../timewarp/time-warper.js';
import { ShadowRecorder } from '../shadow/shadow-recorder.js';
import { ShadowSynthesizer } from '../shadow/shadow-synthesizer.js';
import { ChaosHunter, type ChaosAuditOptions } from '../chaos/chaos-hunter.js';
import { CausalXRay } from '../telemetry/causal-xray.js';
import { CapsuleManager } from '../teleport/capsule.js';
import { logger } from '../utils/logger.js';

export class AirlockRunner {
  private config: AirlockConfig;
  private gateway: AirlockGateway;
  private ledger: AirlockLedger;
  private checkpointManager: CheckpointManager;
  private stateForker: StateForker;
  private selfHealer: SelfHealer;
  private timeWarper: TimeWarper;
  private shadowRecorder: ShadowRecorder;
  private shadowSynthesizer: ShadowSynthesizer;
  private chaosHunter: ChaosHunter;
  private causalXRay: CausalXRay;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  private startTime = 0;
  private totalStepsCount = 0;
  private passedStepsCount = 0;
  private egressBlockedCount = 0;
  private egressAllowedCount = 0;
  private mutationsBlockedCount = 0;
  private recordedNetworkRequests: InterceptedRequest[] = [];

  constructor(customConfig?: Partial<AirlockConfig>) {
    const base = loadConfig();
    this.config = { ...base, ...customConfig };
    this.gateway = new AirlockGateway(this.config);
    this.ledger = new AirlockLedger();
    this.checkpointManager = new CheckpointManager(this.config.forker?.checkpointsDir);
    this.stateForker = new StateForker(this.checkpointManager);
    this.selfHealer = new SelfHealer(
      this.config.healer?.confidenceThreshold,
      this.config.healer?.datasetDir
    );
    this.timeWarper = new TimeWarper();
    this.shadowRecorder = new ShadowRecorder();
    this.shadowSynthesizer = new ShadowSynthesizer(this.shadowRecorder);
    this.chaosHunter = new ChaosHunter();
    this.causalXRay = new CausalXRay();

    // Subscribe to gateway events for ledger recording
    this.gateway.onRequest((req) => {
      this.recordedNetworkRequests.push(req);
      if (req.policyVerdict === 'BLOCKED') {
        this.egressBlockedCount++;
        if (req.method === 'POST' || req.method === 'DELETE' || req.method === 'PUT') {
          this.mutationsBlockedCount++;
        }
        this.ledger.append('EGRESS_BLOCKED', {
          url: req.url,
          host: req.host,
          method: req.method,
          reason: req.policyReason,
        });
      } else {
        this.egressAllowedCount++;
        if (req.realTokensSwapped.length > 0) {
          this.ledger.append('SECRET_SWAP', {
            host: req.host,
            path: req.path,
            swappedTokensCount: req.realTokensSwapped.length,
          });
        }
        this.ledger.append('PROXY_INTERCEPT', {
          url: req.url,
          method: req.method,
          verdict: req.policyVerdict,
        });
      }
    });
  }

  getConfig(): AirlockConfig {
    return this.config;
  }

  getGateway(): AirlockGateway {
    return this.gateway;
  }

  getLedger(): AirlockLedger {
    return this.ledger;
  }

  getHealer(): SelfHealer {
    return this.selfHealer;
  }

  getCheckpointManager(): CheckpointManager {
    return this.checkpointManager;
  }

  /**
   * Initialize runner with Playwright context and page
   */
  async initialize(context: BrowserContext, page: Page): Promise<void> {
    this.context = context;
    this.page = page;
    this.startTime = Date.now();

    // Attach zero-credential interception gateway to browser network routes
    if (this.config.proxy?.enabled) {
      await this.gateway.attachToBrowserContext(context);
    }

    this.ledger.append('EXEC_START', {
      timestamp: new Date().toISOString(),
      phantomSecretsCount: Object.keys(this.config.secrets).length,
    });
  }

  /**
   * Log action step in deterministic ledger
   */
  step(action: string, target?: string): void {
    this.totalStepsCount++;
    this.passedStepsCount++;
    this.ledger.append('ACTION_DISPATCH', { action, target });
    logger.step(this.totalStepsCount, action, target);
  }

  /**
   * Capture a warm point-in-time state checkpoint (<20ms)
   */
  async checkpoint(name: string, page = this.page, context = this.context): Promise<void> {
    if (!page || !context) throw new Error('Cannot checkpoint: runner not initialized with page/context');
    const snapshot = await this.checkpointManager.capture(page, context, name, this.totalStepsCount);
    this.ledger.append('CHECKPOINT_SAVED', { name, snapshotId: snapshot.id, domHash: snapshot.domHash });
  }

  /**
   * Restore warm checkpoint directly (<100ms)
   */
  async restoreCheckpoint(name: string, page = this.page, context = this.context): Promise<boolean> {
    if (!page || !context) throw new Error('Cannot restore: runner not initialized with page/context');
    const ok = await this.checkpointManager.restore(context, page, name);
    if (ok) {
      this.ledger.append('CHECKPOINT_RESTORED', { name });
    }
    return ok;
  }

  /**
   * Parallel time-travel state forking
   */
  async fork(
    browser: Browser,
    checkpointName: string,
    variations: ForkVariation[],
    workerFn: ForkWorkerFunction
  ): Promise<ForkExecutionResult[]> {
    return this.stateForker.forkParallel(browser, checkpointName, variations, workerFn);
  }

  /**
   * Finalize run: compute Merkle root, generate signed attestation bundle & HTML report
   */
  async finalize(): Promise<ComplianceProofBundle> {
    const durationMs = Date.now() - this.startTime;

    this.ledger.append('EXEC_COMPLETE', {
      durationMs,
      totalSteps: this.totalStepsCount,
      passedSteps: this.passedStepsCount,
    });

    const bundle = AttestationEngine.generateBundle(this.ledger, {
      signingKey: this.config.compliance?.signingKey || 'airlock-default-signing-key',
      outputDir: this.config.compliance?.outputDir,
      totalSteps: this.totalStepsCount,
      passedSteps: this.passedStepsCount,
      durationMs,
      phantomTokensConfigured: Object.keys(this.config.secrets).length,
      egressBlockedCount: this.egressBlockedCount,
      egressAllowedCount: this.egressAllowedCount,
      unauthorizedMutationsPrevented: this.mutationsBlockedCount,
    });

    if (this.config.compliance?.generateHtmlReport && this.config.compliance?.outputDir) {
      const htmlPath = path.join(this.config.compliance.outputDir, 'compliance-report.html');
      HtmlReporter.generateReport(
        {
          bundle,
          ledgerBlocks: this.ledger.getBlocks(),
          networkRequests: this.recordedNetworkRequests,
        },
        htmlPath
      );
      logger.info(`Generated HTML Compliance Audit Report at: ${htmlPath}`);
    }

    return bundle;
  }

  /**
   * Fast-forward virtual clock across all runtime layers (V8 Date/timers, DOM event loop, and Host Time Proxy)
   */
  async warpTime(duration: string, page = this.page, context = this.context): Promise<TimeWarpResult> {
    const result = await this.timeWarper.warp(duration, page || undefined, context || undefined);
    this.ledger.append('TIMEWARP_ADVANCED', {
      duration,
      deltaMs: result.deltaMs,
      targetTimeIso: result.targetTimeIso,
    } as any);
    return result;
  }

  /**
   * Activate Hermetic Shadow Production mode on the browser context.
   * Serves wire-level stateful responses in 0.2ms.
   */
  async enableShadowMocking(context = this.context, targetHosts: string[] = ['*']): Promise<void> {
    if (!context) throw new Error('Cannot enable shadow mocking: runner not initialized with context');
    await this.shadowSynthesizer.activate(context, targetHosts);
    this.ledger.append('SHADOW_MODE_ACTIVE', { targetHosts } as any);
  }

  /**
   * Record an outbound interaction into the Shadow Production wire catalog
   */
  recordShadow(
    method: string,
    url: string,
    reqHeaders: Record<string, string>,
    reqBody: string | undefined,
    resStatus: number,
    resHeaders: Record<string, string>,
    resBody: string,
    latencyMs = 1
  ): WireInteraction {
    return this.shadowRecorder.record(
      method,
      url,
      reqHeaders,
      reqBody,
      resStatus,
      resHeaders,
      resBody,
      latencyMs
    );
  }

  /**
   * Execute deterministic chaos audit against a critical mutation
   */
  async chaosAudit(
    action: () => Promise<void>,
    options: ChaosAuditOptions = {},
    page = this.page
  ): Promise<ChaosAuditReport> {
    if (!page) throw new Error('Cannot execute chaos audit: runner not initialized with page');
    const report = await this.chaosHunter.auditMutation(page, action, options);
    this.ledger.append('CHAOS_AUDIT_COMPLETE', {
      target: report.targetEndpoint,
      status: report.status,
      idempotencyEnforced: report.idempotencyEnforced,
    } as any);
    return report;
  }

  /**
   * Attach Causal X-Ray distributed tracing to the current page
   */
  async attachXRay(page = this.page): Promise<void> {
    if (!page) throw new Error('Cannot attach Causal X-Ray: runner not initialized with page');
    await this.causalXRay.attachToPage(page);
  }

  /**
   * Wrap an action or assertion with Causal X-Ray diagnostic boundaries
   */
  async xrayStep<T>(stepName: string, fn: () => Promise<T>, page = this.page): Promise<T> {
    if (!page) throw new Error('Cannot run X-Ray step: runner not initialized with page');
    return this.causalXRay.traceStep(page, stepName, fn);
  }

  /**
   * Rehydrate a production bug capsule and replay events
   */
  async teleportCrash(capsule: StateCapsule, page = this.page, context = this.context): Promise<void> {
    if (!page) throw new Error('Cannot teleport crash: runner not initialized with page');
    await CapsuleManager.rehydrate(capsule, page, context || undefined);
    this.ledger.append('CAPSULE_REHYDRATED', {
      capsuleId: capsule.capsuleId,
      error: capsule.crash.message,
    } as any);
  }

  getTimeWarper(): TimeWarper {
    return this.timeWarper;
  }

  getShadowRecorder(): ShadowRecorder {
    return this.shadowRecorder;
  }

  getShadowSynthesizer(): ShadowSynthesizer {
    return this.shadowSynthesizer;
  }

  getChaosHunter(): ChaosHunter {
    return this.chaosHunter;
  }

  getCausalXRay(): CausalXRay {
    return this.causalXRay;
  }

  /**
   * Generate GitHub PR Markdown summary
   */
  generatePRComment(bundle: ComplianceProofBundle): string {
    return Soc2Reporter.generateGitHubPRComment(bundle);
  }
}

