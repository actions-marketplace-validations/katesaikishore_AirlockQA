import type {
  EgressPolicyConfig,
  EgressRule,
  HttpMethod,
  InterceptedRequest,
  PhantomSecretConfig,
} from '../types/index.js';
import { defaultPortForUrl, matchHost } from './host-match.js';

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
   * Match host against a pattern ("*", "api.x.com", "*.x.com", optionally with ":port").
   * The request's port is stripped before hostname comparison for every pattern type;
   * "host:port" patterns additionally require the port to match.
   */
  private matchHost(host: string, pattern: string, defaultPort?: number): boolean {
    return matchHost(host, pattern, defaultPort);
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
      /** Actual body size in bytes; preferred over the length of `body` when given. */
      bodyBytes?: number;
      url: string;
    },
    attachedSecretConfigs: PhantomSecretConfig[] = []
  ): Promise<PolicyVerdict> {
    const { host, path, method, body } = req;
    const defaultPort = defaultPortForUrl(req.url);

    // 1. Check blocked egress hosts explicitly
    for (const blockedHost of this.config.blockedEgressHosts) {
      if (this.matchHost(host, blockedHost, defaultPort)) {
        return {
          allowed: false,
          verdict: 'BLOCKED',
          reason: `Host '${host}' is in the blocked egress hosts blacklist`,
        };
      }
    }

    // 2. Secret-level deterministic constraints
    for (const secretConfig of attachedSecretConfigs) {
      // A phantom token may only travel to the hosts its secret allows. An empty
      // allowedHosts list permits no host. Without this check the token would be
      // forwarded unswapped to any host the general policy allows.
      const allowedHosts = secretConfig.allowedHosts || [];
      if (!allowedHosts.some((p) => this.matchHost(host, p, defaultPort))) {
        return {
          allowed: false,
          verdict: 'BLOCKED',
          reason:
            allowedHosts.length === 0
              ? `Request carries a phantom token whose secret has an empty allowedHosts list; host '${host}' is not permitted`
              : `Request carries a phantom token that is not permitted for host '${host}' (secret allowedHosts: ${allowedHosts.join(', ')})`,
        };
      }

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
      if (!this.matchHost(host, rule.hostPattern, defaultPort)) {
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
      const payloadBytes = req.bodyBytes ?? (body ? Buffer.byteLength(body, 'utf8') : 0);
      if (rule.maxPayloadBytes && payloadBytes > rule.maxPayloadBytes) {
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
      this.matchHost(host, pattern, defaultPort)
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
