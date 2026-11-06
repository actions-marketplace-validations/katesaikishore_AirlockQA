import type { PhantomSecretConfig } from '../types/index.js';
import { matchAnyHost } from './host-match.js';

/** Minimum length for both real and phantom values, so substring leak checks stay meaningful. */
export const MIN_SECRET_LENGTH = 8;

export interface TokenSwapResult {
  modifiedHeaders: Record<string, string>;
  modifiedBody?: string;
  swappedTokens: string[];
  detectedPhantomTokens: string[];
}

export class PhantomEngine {
  private secrets: Map<string, PhantomSecretConfig> = new Map();
  // Map phantom token string -> secret config
  private phantomToConfig: Map<string, PhantomSecretConfig> = new Map();
  // Map real secret string -> secret config
  private realToConfig: Map<string, PhantomSecretConfig> = new Map();

  constructor(secretsConfig: Record<string, PhantomSecretConfig> = {}) {
    this.registerSecrets(secretsConfig);
  }

  registerSecrets(secretsConfig: Record<string, PhantomSecretConfig>): void {
    PhantomEngine.validateSecrets({ ...Object.fromEntries(this.secrets), ...secretsConfig });
    for (const [key, config] of Object.entries(secretsConfig)) {
      this.secrets.set(key, config);
      this.phantomToConfig.set(config.phantom, config);
      this.realToConfig.set(config.real, config);
    }
  }

  /**
   * Reject configurations that would make substitution or leak detection unsafe:
   * values shorter than MIN_SECRET_LENGTH, and any configured value (real or phantom,
   * from any secret) that contains another one. Without this, a short value such as
   * "a" would match almost every request and response.
   */
  static validateSecrets(secretsConfig: Record<string, PhantomSecretConfig>): void {
    const values: Array<{ label: string; value: string }> = [];
    for (const [key, config] of Object.entries(secretsConfig)) {
      for (const kind of ['real', 'phantom'] as const) {
        const value = config[kind];
        if (typeof value !== 'string' || value.length < MIN_SECRET_LENGTH) {
          throw new Error(
            `Secret '${key}': ${kind} value must be at least ${MIN_SECRET_LENGTH} characters long`
          );
        }
        values.push({ label: `${key}.${kind}`, value });
      }
    }
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values.length; j++) {
        if (i === j) continue;
        const a = values[i];
        const b = values[j];
        if (a.value.includes(b.value) && !(a.value === b.value && i > j)) {
          throw new Error(
            `Secret values must not contain one another: '${a.label}' contains '${b.label}'`
          );
        }
      }
    }
  }

  /** True when the secret may be used against this host (shared matcher with the policy engine). */
  static isHostAllowed(config: PhantomSecretConfig, targetHost: string, defaultPort?: number): boolean {
    const allowed = config.allowedHosts || [];
    return allowed.length > 0 && matchAnyHost(targetHost, allowed, defaultPort);
  }

  /**
   * Returns configured phantom values for the browser/test environment.
   * Real values remain in this Node process for configured proxy substitutions.
   */
  getSandboxEnv(): Record<string, string> {
    const env: Record<string, string> = {};
    for (const [key, config] of this.secrets.entries()) {
      env[key] = config.phantom;
    }
    return env;
  }

  /**
   * Check if a request contains phantom tokens.
   */
  inspectRequest(headers: Record<string, string>, body?: string): {
    phantomTokens: string[];
    configs: PhantomSecretConfig[];
  } {
    const foundTokens = new Set<string>();
    const foundConfigs: PhantomSecretConfig[] = [];

    const headersStr = JSON.stringify(headers);
    const bodyStr = body || '';

    for (const [phantom, config] of this.phantomToConfig.entries()) {
      if (headersStr.includes(phantom) || bodyStr.includes(phantom)) {
        foundTokens.add(phantom);
        foundConfigs.push(config);
      }
    }

    return {
      phantomTokens: Array.from(foundTokens),
      configs: foundConfigs,
    };
  }

  /**
   * Check if any raw real secret is accidentally present in the outbound request.
   * If an agent somehow acquired or generated a real secret, this catches it!
   */
  detectRealSecretExposure(headers: Record<string, string>, body?: string): string[] {
    const leaked: string[] = [];
    const fullContent = JSON.stringify(headers) + (body || '');

    for (const [real, config] of this.realToConfig.entries()) {
      if (fullContent.includes(real)) {
        leaked.push(config.phantom);
      }
    }
    return leaked;
  }

  /**
   * Substitute phantom tokens with real credentials in-flight at the proxy edge.
   * This is only executed AFTER the policy engine has authorized the request.
   */
  swapPhantomToReal(
    headers: Record<string, string>,
    body?: string,
    targetHost?: string,
    defaultPort?: number
  ): TokenSwapResult {
    const modifiedHeaders = { ...headers };
    let modifiedBody = body;
    const swappedTokens: string[] = [];
    const detectedPhantomTokens: string[] = [];

    for (const [phantom, config] of this.phantomToConfig.entries()) {
      let swappedForThis = false;

      // Never substitute for a host outside the secret's allowedHosts. An empty
      // list permits no host. The policy engine blocks such requests before this point.
      if (targetHost !== undefined && !PhantomEngine.isHostAllowed(config, targetHost, defaultPort)) {
        continue;
      }

      // Check headers
      for (const [hKey, hVal] of Object.entries(modifiedHeaders)) {
        if (hVal.includes(phantom)) {
          detectedPhantomTokens.push(phantom);
          modifiedHeaders[hKey] = hVal.split(phantom).join(config.real);
          swappedForThis = true;
        }
      }

      // Check body
      if (modifiedBody && modifiedBody.includes(phantom)) {
        detectedPhantomTokens.push(phantom);
        modifiedBody = modifiedBody.split(phantom).join(config.real);
        swappedForThis = true;
      }

      if (swappedForThis) {
        swappedTokens.push(phantom);
      }
    }

    return {
      modifiedHeaders,
      modifiedBody,
      swappedTokens,
      detectedPhantomTokens: Array.from(new Set(detectedPhantomTokens)),
    };
  }

  /**
   * Replace exact configured secret strings in matching upstream headers and body text.
   * This does not detect transformed, encoded, binary, or otherwise unmatched values.
   */
  sanitizeResponse(
    headers: Record<string, string>,
    body?: string
  ): { headers: Record<string, string>; body?: string; sanitizedCount: number } {
    let sanitizedCount = 0;
    const sanitizedHeaders = { ...headers };
    let sanitizedBody = body;

    const realSecrets = Array.from(this.realToConfig.keys());

    // Sanitize headers
    for (const [hKey, hVal] of Object.entries(sanitizedHeaders)) {
      for (const real of realSecrets) {
        if (hVal.includes(real)) {
          const config = this.realToConfig.get(real)!;
          sanitizedHeaders[hKey] = hVal.split(real).join(config.phantom);
          sanitizedCount++;
        }
      }
    }

    // Sanitize body
    if (sanitizedBody) {
      for (const real of realSecrets) {
        if (sanitizedBody.includes(real)) {
          const config = this.realToConfig.get(real)!;
          sanitizedBody = sanitizedBody.split(real).join(config.phantom);
          sanitizedCount++;
        }
      }
    }

    return {
      headers: sanitizedHeaders,
      body: sanitizedBody,
      sanitizedCount,
    };
  }
}
