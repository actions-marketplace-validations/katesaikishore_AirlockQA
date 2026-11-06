import * as fs from 'node:fs';
import * as path from 'node:path';
import { AirlockConfigSchema } from './schema.js';
import type { AirlockConfig } from '../types/index.js';

export function loadConfig(configPath?: string, cwd: string = process.cwd()): AirlockConfig {
  const candidatePaths = configPath
    ? [path.resolve(cwd, configPath)]
    : [
        path.resolve(cwd, 'airlock.config.json'),
        path.resolve(cwd, '.airlock/config.json'),
        path.resolve(cwd, 'airlock.json'),
      ];

  let rawConfig: Record<string, unknown> = {};

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const fileContent = fs.readFileSync(p, 'utf8');
        rawConfig = JSON.parse(fileContent);
        break;
      } catch (err) {
        console.warn(`Failed to parse config file at ${p}:`, err);
      }
    }
  }

  // Parse and validate with defaults
  const parsed = AirlockConfigSchema.parse(rawConfig);

  // If Chrome is installed on Mac, auto-populate executablePath if not set
  if (!parsed.browser.executablePath) {
    const macChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(macChromePath)) {
      parsed.browser.executablePath = macChromePath;
    }
  }

  return parsed as AirlockConfig;
}

