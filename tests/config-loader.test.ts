import { describe, expect, it } from 'bun:test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { ConfigError, loadConfig } from '../src/config/loader.js';

function tempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'qafind-config-'));
}

describe('loadConfig', () => {
  it('throws a ConfigError naming the file when the JSON is invalid', () => {
    const dir = tempDir();
    const file = path.join(dir, 'qafind.config.json');
    fs.writeFileSync(file, '{ "projectName": "broken", ');
    expect(() => loadConfig(undefined, dir)).toThrow(ConfigError);
    expect(() => loadConfig(undefined, dir)).toThrow(file);
    expect(() => loadConfig(undefined, dir)).toThrow(/Invalid JSON/);
  });

  it('throws on schema errors instead of silently using defaults', () => {
    const dir = tempDir();
    const file = path.join(dir, 'qafind.config.json');
    fs.writeFileSync(file, JSON.stringify({ proxy: { port: 'not-a-number' } }));
    let error: unknown;
    try {
      loadConfig(undefined, dir);
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(ConfigError);
    expect((error as ConfigError).message).toContain(file);
    expect((error as ConfigError).message).toContain('proxy.port');
  });

  it('throws when an explicit config path does not exist', () => {
    const dir = tempDir();
    expect(() => loadConfig('missing.json', dir)).toThrow(/Config file not found/);
  });

  it('uses neutral defaults with no signing key when no file exists', () => {
    const config = loadConfig(undefined, tempDir(), { env: {} });
    expect(config.compliance?.signingKey).toBeUndefined();
    expect(config.policy.allowedEgressHosts).toEqual(['127.0.0.1', 'localhost', '::1']);
    expect(config.policy.rules).toEqual([]);
    expect(config.browser?.executablePath).toBeUndefined();
  });

  it('reads the browser path from QAFIND_CHROME_PATH only when not configured', () => {
    const dir = tempDir();
    expect(loadConfig(undefined, dir, { env: { QAFIND_CHROME_PATH: '/opt/chrome' } }).browser?.executablePath).toBe('/opt/chrome');
    fs.writeFileSync(path.join(dir, 'qafind.config.json'), JSON.stringify({ browser: { executablePath: '/usr/bin/chromium' } }));
    expect(loadConfig(undefined, dir, { env: { QAFIND_CHROME_PATH: '/opt/chrome' } }).browser?.executablePath).toBe('/usr/bin/chromium');
  });

  it('resolves realFromEnv secrets and rejects secrets with no value source', () => {
    const dir = tempDir();
    const file = path.join(dir, 'qafind.config.json');
    fs.writeFileSync(file, JSON.stringify({
      secrets: { API: { realFromEnv: 'API_SECRET', real: 'REPLACE_ME_REAL_SECRET', phantom: 'ph_api' } },
    }));
    expect(loadConfig(undefined, dir, { env: { API_SECRET: 'from-env' } }).secrets.API.real).toBe('from-env');
    expect(loadConfig(undefined, dir, { env: {} }).secrets.API.real).toBe('REPLACE_ME_REAL_SECRET');

    fs.writeFileSync(file, JSON.stringify({ secrets: { API: { realFromEnv: 'API_SECRET', phantom: 'ph_api' } } }));
    expect(() => loadConfig(undefined, dir, { env: {} })).toThrow(/API_SECRET/);

    fs.writeFileSync(file, JSON.stringify({ secrets: { API: { phantom: 'ph_api' } } }));
    expect(() => loadConfig(undefined, dir, { env: {} })).toThrow(ConfigError);
  });

  it('loads the committed sample config', () => {
    const config = loadConfig(undefined, path.resolve(import.meta.dir, '..'), { env: {} });
    expect(config.compliance?.signingKey).toBeUndefined();
    for (const [name, secret] of Object.entries(config.secrets)) {
      expect(secret.realFromEnv).toBeTruthy();
      // Each placeholder is unique: the phantom engine rejects real values that contain one another.
      expect(secret.real).toBe(`REPLACE_ME_${name}`);
    }
  });
});
