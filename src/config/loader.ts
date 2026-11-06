import * as fs from 'node:fs';
import * as path from 'node:path';
import { AirlockConfigSchema } from './schema.js';
import type { AirlockConfig, PhantomSecretConfig } from '../types/index.js';
import { logger } from '../utils/logger.js';

/** Raised when a config file exists but cannot be parsed or validated. */
export class ConfigError extends Error {
  constructor(message: string, readonly configPath?: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export interface LoadConfigOptions {
  /** Environment to read `realFromEnv` secrets and AIRLOCK_CHROME_PATH from. Defaults to process.env. */
  env?: NodeJS.ProcessEnv;
}

export function loadConfig(
  configPath?: string,
  cwd: string = process.cwd(),
  options: LoadConfigOptions = {},
): AirlockConfig {
  const env = options.env ?? process.env;
  const candidatePaths = configPath
    ? [path.resolve(cwd, configPath)]
    : [
        path.resolve(cwd, 'airlock.config.json'),
        path.resolve(cwd, '.airlock/config.json'),
        path.resolve(cwd, 'airlock.json'),
      ];

  if (configPath && !fs.existsSync(candidatePaths[0])) {
    throw new ConfigError(`Config file not found: ${candidatePaths[0]}`, candidatePaths[0]);
  }

  let rawConfig: unknown = {};
  let sourcePath: string | undefined;

  for (const p of candidatePaths) {
    if (!fs.existsSync(p)) continue;
    sourcePath = p;
    let fileContent: string;
    try {
      fileContent = fs.readFileSync(p, 'utf8');
    } catch (err) {
      throw new ConfigError(`Could not read config file ${p}: ${(err as Error).message}`, p);
    }
    try {
      rawConfig = JSON.parse(fileContent);
    } catch (err) {
      throw new ConfigError(`Invalid JSON in config file ${p}: ${(err as Error).message}`, p);
    }
    break;
  }

  const result = AirlockConfigSchema.safeParse(rawConfig);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.length ? issue.path.join('.') : '(root)'}: ${issue.message}`)
      .join('\n');
    const where = sourcePath ? `config file ${sourcePath}` : 'default config';
    throw new ConfigError(`Invalid ${where}:\n${issues}`, sourcePath);
  }
  const parsed = result.data;

  // Resolve secrets: an environment variable named by `realFromEnv` wins over a literal `real`.
  const secrets: Record<string, PhantomSecretConfig> = {};
  for (const [name, secret] of Object.entries(parsed.secrets)) {
    let real = secret.real;
    if (secret.realFromEnv) {
      const fromEnv = env[secret.realFromEnv];
      if (fromEnv) {
        real = fromEnv;
      } else if (real !== undefined) {
        logger.warn(`Secret '${name}': environment variable ${secret.realFromEnv} is not set; using the literal "real" value from the config.`);
      } else {
        throw new ConfigError(
          `Secret '${name}' reads its value from environment variable ${secret.realFromEnv}, which is not set${sourcePath ? ` (config file ${sourcePath})` : ''}`,
          sourcePath,
        );
      }
    }
    secrets[name] = { ...secret, real: real as string };
  }

  // Browser executable: explicit config wins, then AIRLOCK_CHROME_PATH. No platform-specific guessing.
  const browser = { ...parsed.browser };
  if (!browser.executablePath && env.AIRLOCK_CHROME_PATH) {
    browser.executablePath = env.AIRLOCK_CHROME_PATH;
  }

  return { ...parsed, browser, secrets } as AirlockConfig;
}
