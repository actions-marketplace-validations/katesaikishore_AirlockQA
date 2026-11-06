import type { PhantomSecretConfig } from '../types/index.js';
import { redactSecrets } from '../utils/crypto.js';

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
    for (const [key, config] of Object.entries(secretsConfig)) {
      this.secrets.set(key, config);
      this.phantomToConfig.set(config.phantom, config);
      this.realToConfig.set(config.real, config);
    }
  }

  /**
   * Returns a map of environment variables safe to inject into the sandbox.
   * NEVER contains real secrets - ONLY phantom tokens!
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
    targetHost?: string
  ): TokenSwapResult {
    const modifiedHeaders = { ...headers };
    let modifiedBody = body;
    const swappedTokens: string[] = [];
    const detectedPhantomTokens: string[] = [];

    for (const [phantom, config] of this.phantomToConfig.entries()) {
      let swappedForThis = false;

      // Verify host restriction if configured
      if (targetHost && config.allowedHosts && config.allowedHosts.length > 0) {
        const hostWithoutPort = targetHost.split(':')[0];
        const isAllowed = config.allowedHosts.some(
          (h) =>
            targetHost === h ||
            hostWithoutPort === h ||
            targetHost.endsWith(`.${h}`) ||
            hostWithoutPort.endsWith(`.${h}`) ||
            h === '*'
        );
        if (!isAllowed) {
          // Cannot swap to real for disallowed host
          continue;
        }
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
   * Sanitize upstream responses so real secrets are never returned into the sandbox.
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
