import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import { loadConfig } from '../config/loader.js';
import { logger } from '../utils/logger.js';
import { createCloudRunPayload, submitCloudRun } from './cloud-run-client.js';
import { runPlaywrightSpecs, suiteNameFromSpec } from './local-test-runner.js';

export interface RouteRunOptions {
  local?: boolean;
  cloud?: boolean;
  specPath?: string;
  /** Cloud suite name. Defaults to the spec file name, then `projectName` from the config. */
  suiteName?: string;
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
        'Execution Target: Local Playwright Test',
        'Running spec files with the Airlock gateway attached through the airlockTest fixture.'
      );

      const config = loadConfig();
      const result = await runPlaywrightSpecs({
        specPath: options.specPath,
        targetUrl: options.targetUrl,
        config,
      });

      const summary = `${result.passed} passed, ${result.failed} failed, ${result.flaky} flaky, ${result.skipped} skipped`;
      if (result.exitCode === 0) {
        logger.success(`Local test run passed (${summary})`);
      } else {
        logger.error(`Local test run failed with exit code ${result.exitCode} (${summary})`);
      }
      return { target: 'LOCAL', result };
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
      const suiteName = options.suiteName || suiteNameFromSpec(options.specPath, config.projectName);
      const payload = createCloudRunPayload(config, options.targetUrl || config.baseUrl, suiteName);

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
