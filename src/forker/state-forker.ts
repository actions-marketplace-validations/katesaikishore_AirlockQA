import type { Browser, BrowserContext, Page } from 'playwright-core';
import type { ForkExecutionResult, ForkVariation } from '../types/index.js';
import { CheckpointManager } from './checkpoint-manager.js';
import { logger } from '../utils/logger.js';

export interface ForkWorkerContext {
  variation: ForkVariation;
  context: BrowserContext;
  page: Page;
}

export type ForkWorkerFunction = (ctx: ForkWorkerContext) => Promise<{
  success: boolean;
  assertionsPassed: number;
  assertionsTotal: number;
  error?: string;
}>;

export class StateForker {
  private checkpointManager: CheckpointManager;

  constructor(checkpointManager?: CheckpointManager) {
    this.checkpointManager = checkpointManager || new CheckpointManager();
  }

  getCheckpointManager(): CheckpointManager {
    return this.checkpointManager;
  }

  /**
   * Clone warm state into N isolated parallel workers in sub-second time (<150ms spin-up)
   */
  async forkParallel(
    browser: Browser,
    checkpointName: string,
    variations: ForkVariation[],
    workerFn: ForkWorkerFunction
  ): Promise<ForkExecutionResult[]> {
    const snapshot = this.checkpointManager.getCheckpoint(checkpointName);
    if (!snapshot) {
      throw new Error(`Cannot fork: Checkpoint '${checkpointName}' does not exist`);
    }

    const forkStartTime = Date.now();
    logger.moat(
      3,
      `Sub-Second State Forking: Spawning ${variations.length} Parallel Clones`,
      `Branching warm RAM state '${checkpointName}' without repeating setup steps`
    );

    // Launch contexts in parallel
    const workerPromises = variations.map(async (variation, i) => {
      const workerStart = Date.now();

      // Create new isolated context with storage state
      const context = await browser.newContext({
        storageState: snapshot.storageState as any,
        viewport: { width: 1280, height: 800 },
      });

      const page = await context.newPage();

      // Navigate to warm snapshot URL or restore content
      if (snapshot.url && snapshot.url !== 'about:blank') {
        await page.goto(snapshot.url, { waitUntil: 'domcontentloaded' });
      } else if (snapshot.htmlContent) {
        await page.setContent(snapshot.htmlContent);
      }

      // Restore sessionStorage
      if (Object.keys(snapshot.sessionStorage).length > 0) {
        await page.evaluate((data) => {
          for (const [k, v] of Object.entries(data)) {
            sessionStorage.setItem(k, v);
          }
        }, snapshot.sessionStorage);
      }

      let outcome: { success: boolean; assertionsPassed: number; assertionsTotal: number; error?: string };

      try {
        outcome = await workerFn({ variation, context, page });
      } catch (err: any) {
        outcome = {
          success: false,
          assertionsPassed: 0,
          assertionsTotal: 1,
          error: err.message,
        };
      } finally {
        await context.close().catch(() => {});
      }

      const durationMs = Date.now() - workerStart;
      const result: ForkExecutionResult = {
        checkpointId: snapshot.id,
        variationId: variation.id,
        durationMs,
        success: outcome.success,
        error: outcome.error,
        finalUrl: snapshot.url,
        assertionsPassed: outcome.assertionsPassed,
        assertionsTotal: outcome.assertionsTotal,
        ledgerMerkleRoot: snapshot.domHash,
      };

      const statusIcon = result.success ? '✔' : '✖';
      logger.info(`  ├─ Clone #${i + 1} [${variation.id}]: ${statusIcon} completed in ${durationMs}ms`);

      return result;
    });

    const results = await Promise.all(workerPromises);
    const totalElapsed = Date.now() - forkStartTime;
    logger.success(`All ${variations.length} time-travel forks completed in ${totalElapsed}ms total`);

    return results;
  }
}
