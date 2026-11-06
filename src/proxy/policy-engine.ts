import type {
  EgressPolicyConfig,
  EgressRule,
  HttpMethod,
  InterceptedRequest,
  PhantomSecretConfig,
} from '../types/index.js';

export interface PolicyVerdict {
  allowed: boolean;
  verdict: 'ALLOWED' | 'BLOCKED' | 'SANITIZED';
  reason?: string;
  matchedRule?: EgressRule;
}

export class PolicyEngine {
  private config: EgressPolicyConfig;

  constructor(config: EgressPolicyConfig) {
    this.config = config;
  }

  updateConfig(config: EgressPolicyConfig): void {
    this.config = config;
  }

  /**
   * Helper to match host against glob pattern (e.g. "*.stripe.com" or "localhost")
   */
  private matchHost(host: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern === host) return true;
    if (pattern.startsWith('*.')) {
      const suffix = pattern.substring(2);
      return host === suffix || host.endsWith('.' + suffix);
    }
    // Remove port for comparison if needed
    const hostWithoutPort = host.split(':')[0];
    const patternWithoutPort = pattern.split(':')[0];
    return hostWithoutPort === patternWithoutPort;
  }

  /**
   * Helper to match URL path against glob patterns (e.g. "*refund*", "/v1/charges")
   */
  private matchPath(path: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern === path) return true;
    
    // Convert glob to regex
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // escape regex specials except *
      .replace(/\*/g, '.*');
    
    const re = new RegExp(`^${regexPattern}$`, 'i');
    return re.test(path);
  }

  /**
   * Evaluate outbound request against deterministic policy rules
   */
  async evaluate(
    req: {
      host: string;
      path: string;
      method: HttpMethod;
      headers: Record<string, string>;
      body?: string;
      url: string;
    },
    attachedSecretConfigs: PhantomSecretConfig[] = []
  ): Promise<PolicyVerdict> {
    const { host, path, method, body } = req;

    // 1. Check blocked egress hosts explicitly
    for (const blockedHost of this.config.blockedEgressHosts) {
      if (this.matchHost(host, blockedHost)) {
        return {
          allowed: false,
          verdict: 'BLOCKED',
          reason: `Host '${host}' is in the blocked egress hosts blacklist`,
        };
      }
    }

    // 2. Secret-level deterministic constraints
    for (const secretConfig of attachedSecretConfigs) {
      // Check allowed methods for this secret
      if (secretConfig.allowedMethods && secretConfig.allowedMethods.length > 0) {
        if (!secretConfig.allowedMethods.includes(method)) {
          return {
            allowed: false,
            verdict: 'BLOCKED',
            reason: `Secret policy disallows method '${method}' on target host '${host}'`,
          };
        }
      }

      // Check blocked paths for this secret
      if (secretConfig.blockedPaths && secretConfig.blockedPaths.length > 0) {
        for (const blockedPath of secretConfig.blockedPaths) {
          if (this.matchPath(path, blockedPath)) {
            return {
              allowed: false,
              verdict: 'BLOCKED',
              reason: `Secret policy strictly blocks mutations on path '${path}' (matches '${blockedPath}')`,
            };
          }
        }
      }
    }

    // 3. Evaluate specific configured EgressRules
    for (const rule of this.config.rules) {
      if (!this.matchHost(host, rule.hostPattern)) {
        continue;
      }

      // Check method match
      if (rule.methods && rule.methods.length > 0 && !rule.methods.includes(method)) {
        continue;
      }

      // Check blocked paths rule
      if (rule.blockedPaths && rule.blockedPaths.length > 0) {
        const isBlocked = rule.blockedPaths.some((p) => this.matchPath(path, p));
        if (isBlocked) {
          return {
            allowed: false,
            verdict: 'BLOCKED',
            reason: `Rule '${rule.id}' blocked path '${path}'`,
            matchedRule: rule,
          };
        } else if (rule.action === 'BLOCK' && (!rule.allowedPaths || rule.allowedPaths.length === 0)) {
          // Rule action is BLOCK, but path did not match blockedPaths - do not block other paths
          continue;
        }
      }

      // Check allowed paths rule
      if (rule.allowedPaths && rule.allowedPaths.length > 0) {
        const isAllowed = rule.allowedPaths.some((p) => this.matchPath(path, p));
        if (!isAllowed) {
          return {
            allowed: false,
            verdict: 'BLOCKED',
            reason: `Rule '${rule.id}' requires path to match allowed list; '${path}' did not match`,
            matchedRule: rule,
          };
        }
      }

      // Check max payload size
      if (rule.maxPayloadBytes && body && Buffer.byteLength(body, 'utf8') > rule.maxPayloadBytes) {
        return {
          allowed: false,
          verdict: 'BLOCKED',
          reason: `Payload size exceeded maximum allowed limit (${rule.maxPayloadBytes} bytes)`,
          matchedRule: rule,
        };
      }

      // If rule action is BLOCK
      if (rule.action === 'BLOCK') {
        return {
          allowed: false,
          verdict: 'BLOCKED',
          reason: `Rule '${rule.id}' action is BLOCK for '${host}'`,
          matchedRule: rule,
        };
      }

      // If rule action is ALLOW
      if (rule.action === 'ALLOW') {
        return {
          allowed: true,
          verdict: 'ALLOWED',
          reason: `Rule '${rule.id}' explicitly allowed request to '${host}'`,
          matchedRule: rule,
        };
      }
    }

    // 4. Fallback to host whitelist and default action
    const isWhitelisted = this.config.allowedEgressHosts.some((pattern) =>
      this.matchHost(host, pattern)
    );

    if (isWhitelisted) {
      return {
        allowed: true,
        verdict: 'ALLOWED',
        reason: `Host '${host}' is in the allowed egress hosts list`,
      };
    }

    if (this.config.defaultAction === 'ALLOW') {
      return {
        allowed: true,
        verdict: 'ALLOWED',
        reason: 'Default policy action is ALLOW',
      };
    }

    return {
      allowed: false,
      verdict: 'BLOCKED',
      reason: `Egress to '${host}' was blocked by default zero-trust policy`,
    };
  }
}
