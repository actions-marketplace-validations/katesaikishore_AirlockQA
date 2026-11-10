import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import { loadConfig } from '../config/loader.js';
import { logger } from '../utils/logger.js';
import { runPlaywrightSpecs } from './local-test-runner.js';

export interface RouteRunOptions {
  local?: boolean;
  cloud?: boolean;
  specPath?: string;
  /** Cloud suite name. Defaults to the spec file name, then `projectName` from the config. */
  suiteName?: string;
  targetUrl?: string;
  cloudApiUrl?: string;
  apiKey?: string;
  /** Workflow JSON file for hosted runs (defaults to the config's `workflow`). */
  workflowFile?: string;
  /** Hosted runs: wait for the result (default true). */
  wait?: boolean;
  /** Hosted runs: how long to wait, in seconds. */
  timeoutSeconds?: number;
}

export class ExecutionTargetRouter {
  /**
   * Route execution to the local Playwright runner or the configured cloud API.
   */
  static async routeAndExecute(options: RouteRunOptions = {}): Promise<{
    target: 'LOCAL' | 'CLOUD_API';
    result: unknown;
  }> {
    const apiKey = options.apiKey || process.env.QAFIND_API_KEY;
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
        'Running spec files with the QAFind gateway attached through the qafindTest fixture.'
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
      logger.moat(
        2,
        'Execution Target: QAFind Cloud',
        'Submitting a hosted run. Workflows run in an isolated browser; real credentials are never sent.'
      );
      const { runHostedTest } = await import('./cloud-commands.js');
      const result = await runHostedTest({
        specPath: options.specPath,
        suiteName: options.suiteName,
        targetUrl: options.targetUrl,
        workflowFile: options.workflowFile,
        wait: options.wait,
        timeoutSeconds: options.timeoutSeconds,
        apiKey: options.apiKey,
        apiUrl: options.cloudApiUrl,
      });
      return { target: 'CLOUD_API', result };
    }
  }

  /**
   * Parse qafind.yaml or qafind.config.json configuration file
   */
  static loadYamlPolicy(filePath?: string): Record<string, unknown> | null {
    const candidates = filePath ? [filePath] : ['qafind.yaml', 'qafind.yml', 'qafind.config.json'];
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
