import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import type { AirlockConfig } from '../types/index.js';
import type { CloudRunResponse } from '../types/cloud-client.js';
import { loadConfig } from '../config/loader.js';
import { AirlockRunner } from '../runner/airlock-runner.js';
import { chromium } from 'playwright-core';
import { logger } from '../utils/logger.js';

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
    target: 'LOCAL_FREE' | 'CLOUD_ENTERPRISE';
    result: unknown;
  }> {
    const apiKey = options.apiKey || process.env.AIRLOCK_API_KEY || process.env.CAGERUN_API_KEY;
    const forceLocal = options.local || false;
    const forceCloud = options.cloud || false;

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
        return { target: 'LOCAL_FREE', result: bundle };
      } finally {
        await browser.close();
      }
    } else {
      const cloudApiUrl = options.cloudApiUrl || process.env.AIRLOCK_CLOUD_URL || 'https://qbrin.cloud/api';
      const effectiveKey = apiKey || 'demo_airlock_api_key';

      logger.moat(
        2,
        'Execution Target: Airlock Cloud Cluster',
        `Submitting a run to the configured cloud API (${cloudApiUrl})`
      );

      const config = loadConfig();
      const payload = {
        suiteName: 'checkout-flow',
        targetUrl: options.targetUrl || config.baseUrl,
        phantomConfig: config.secrets,
        apiKey: effectiveKey,
        options: {
          enableTimeTravelCoW: true,
          workersCount: 5,
        },
      };

      try {
        const response = await fetch(`${cloudApiUrl}/v1/runs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Cloud API error [${response.status}]: ${errText}`);
        }

        const cloudResult = (await response.json()) as CloudRunResponse;

        logger.success(`Cloud API reported run status ${cloudResult.status} (reported execution: ${cloudResult.executionTimeMs}ms, reported boot: ${cloudResult.microVmBootMs}ms)`);
        console.log('\n' + cloudResult.githubPRComment);

        return { target: 'CLOUD_ENTERPRISE', result: cloudResult };
      } catch (err: any) {
        logger.error(`Cloud execution failed: ${err.message}`);
        throw err;
      }
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
