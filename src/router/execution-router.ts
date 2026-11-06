import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import type { AirlockConfig } from '../types/index.js';
import { loadConfig } from '../config/loader.js';
import { AirlockRunner } from '../runner/airlock-runner.js';
import { chromium } from 'playwright-core';
import { logger } from '../utils/logger.js';
import { createCloudRunPayload, submitCloudRun } from './cloud-run-client.js';

export interface RouteRunOptions {
  local?: boolean;
  cloud?: boolean;
  specPath?: string;
  targetUrl?: string;
  cloudApiUrl?: string;
  apiKey?: string;
}

export class ExecutionTargetRouter {
  /**
   * Route execution to the local Playwright runner or the configured cloud API.
   */
  static async routeAndExecute(options: RouteRunOptions = {}): Promise<{
    target: 'LOCAL' | 'CLOUD_API';
    result: unknown;
  }> {
    const apiKey = options.apiKey || process.env.AIRLOCK_API_KEY;
    const forceLocal = options.local || false;
    const forceCloud = options.cloud || false;

    if (forceLocal && forceCloud) {
      throw new Error('Choose either --local or --cloud; the options cannot be used together.');
    }

    // Check routing decision
    const shouldRunCloud = (forceCloud || (!forceLocal && Boolean(apiKey)));

    if (!shouldRunCloud) {
      logger.moat(
        1,
        'Execution Target: Local Test Runner',
        'Running local browser context with client-side credential proxy.'
      );

      const config = loadConfig();
      const runner = new AirlockRunner(config);
      const targetUrl = options.targetUrl || config.baseUrl;

      const browser = await chromium.launch({
        executablePath: config.browser?.executablePath,
        headless: config.browser?.headless ?? true,
      });

      const context = await browser.newContext({
        viewport: config.browser?.viewport,
      });

      const page = await context.newPage();

      try {
        await runner.initialize(context, page);
        runner.step('GOTO', targetUrl);
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(300);

        const bundle = await runner.finalize();
        logger.success(`Local test execution completed successfully in ${bundle.summary.durationMs}ms`);
        return { target: 'LOCAL', result: bundle };
      } finally {
        await browser.close();
      }
    } else {
      const cloudApiUrl = options.cloudApiUrl || process.env.AIRLOCK_CLOUD_URL || 'https://api.qbrin.cloud';
      if (!apiKey?.trim()) {
        throw new Error('Cloud runs require AIRLOCK_API_KEY. Create a key in your Airlock Cloud workspace and store it in your CI secrets.');
      }

      logger.moat(
        2,
        'Execution Target: Airlock Cloud API',
        `Submitting a run request to the configured API (${cloudApiUrl})`
      );

      const config = loadConfig();
      const payload = createCloudRunPayload(config, options.targetUrl || config.baseUrl);

      const cloudResult = await submitCloudRun({
        apiUrl: cloudApiUrl,
        apiKey,
        payload,
      });

      logger.success(`Cloud API accepted run ${cloudResult.runId} with status ${cloudResult.status}.`);
      if (cloudResult.githubPRComment) console.log('\n' + cloudResult.githubPRComment);

      return { target: 'CLOUD_API', result: cloudResult };
    }
  }

  /**
   * Parse airlock.yaml or airlock.config.json configuration file
   */
  static loadYamlPolicy(filePath?: string): Record<string, unknown> | null {
    const candidates = filePath ? [filePath] : ['airlock.yaml', 'airlock.yml', 'airlock.config.json'];
    for (const c of candidates) {
      const fullPath = path.resolve(process.cwd(), c);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          return yaml.load(content) as Record<string, unknown>;
        } catch (e) {
          logger.warn(`Failed to parse YAML file at ${fullPath}:`, e);
        }
      }
    }
    return null;
  }
}
