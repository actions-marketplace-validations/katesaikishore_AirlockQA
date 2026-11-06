import { describe, expect, it } from 'bun:test';
import { PhantomEngine } from '../src/proxy/phantom-engine.js';
import { PolicyEngine } from '../src/proxy/policy-engine.js';
import type { EgressPolicyConfig, PhantomSecretConfig } from '../src/types/index.js';

describe('Proxy Gateway: Phantom Credentials & Egress Policy', () => {
  const secretConfig: PhantomSecretConfig = {
    real: 'sk_live_supersecret_production_stripe_key_9999',
    phantom: 'ph_sec_stripe_test_8f2a',
    allowedHosts: ['api.stripe.com', 'localhost'],
    allowedMethods: ['GET', 'POST'],
    blockedPaths: ['*/refunds*', '*/wipe*'],
  };

  it('provides safe sandbox environment containing only phantom tokens', () => {
    const engine = new PhantomEngine({ STRIPE_KEY: secretConfig });
    const sandboxEnv = engine.getSandboxEnv();

    expect(sandboxEnv.STRIPE_KEY).toBe('ph_sec_stripe_test_8f2a');
    expect(Object.values(sandboxEnv)).not.toContain(secretConfig.real);
  });

  it('detects and swaps phantom tokens in headers to real secrets on approved hosts', () => {
    const engine = new PhantomEngine({ STRIPE_KEY: secretConfig });
    const originalHeaders = {
      Authorization: 'Bearer ph_sec_stripe_test_8f2a',
      'Content-Type': 'application/json',
    };

    const swapResult = engine.swapPhantomToReal(originalHeaders, undefined, 'api.stripe.com');

    expect(swapResult.swappedTokens).toContain('ph_sec_stripe_test_8f2a');
    expect(swapResult.modifiedHeaders.Authorization).toBe(
      'Bearer sk_live_supersecret_production_stripe_key_9999'
    );
  });

  it('refuses to swap phantom tokens to real secrets if destination host is not allowed', () => {
    const engine = new PhantomEngine({ STRIPE_KEY: secretConfig });
    const originalHeaders = {
      Authorization: 'Bearer ph_sec_stripe_test_8f2a',
    };

    const swapResult = engine.swapPhantomToReal(originalHeaders, undefined, 'malicious-attacker.com');

    expect(swapResult.swappedTokens.length).toBe(0);
    expect(swapResult.modifiedHeaders.Authorization).toBe('Bearer ph_sec_stripe_test_8f2a');
  });

  it('sanitizes responses to ensure real secrets never leak back into sandbox', () => {
    const engine = new PhantomEngine({ STRIPE_KEY: secretConfig });
    const rawResponse = {
      'set-cookie': 'session=sk_live_supersecret_production_stripe_key_9999',
    };
    const rawBody = '{"error": "Failed for key sk_live_supersecret_production_stripe_key_9999"}';

    const sanitized = engine.sanitizeResponse(rawResponse, rawBody);

    expect(sanitized.sanitizedCount).toBe(2);
    expect(sanitized.headers['set-cookie']).toBe('session=ph_sec_stripe_test_8f2a');
    expect(sanitized.body).toContain('ph_sec_stripe_test_8f2a');
    expect(sanitized.body).not.toContain(secretConfig.real);
  });

  it('blocks destructive mutation endpoints like refunds via deterministic policy', async () => {
    const policyConfig: EgressPolicyConfig = {
      defaultAction: 'BLOCK',
      allowedEgressHosts: ['api.stripe.com', 'localhost'],
      blockedEgressHosts: ['pastebin.com', 'webhook.site'],
      rules: [
        {
          id: 'block-destructive-refunds',
          hostPattern: '*',
          blockedPaths: ['*/refunds*'],
          action: 'BLOCK',
        },
      ],
    };

    const policyEngine = new PolicyEngine(policyConfig);

    // Test 1: Charge creation (allowed)
    const chargeVerdict = await policyEngine.evaluate(
      {
        host: 'api.stripe.com',
        path: '/v1/charges',
        method: 'POST',
        headers: {},
        url: 'https://api.stripe.com/v1/charges',
      },
      [secretConfig]
    );
    expect(chargeVerdict.allowed).toBe(true);

    // Test 2: Refund creation (strictly blocked)
    const refundVerdict = await policyEngine.evaluate(
      {
        host: 'api.stripe.com',
        path: '/v1/refunds',
        method: 'POST',
        headers: {},
        url: 'https://api.stripe.com/v1/refunds',
      },
      [secretConfig]
    );
    expect(refundVerdict.allowed).toBe(false);
    expect(refundVerdict.verdict).toBe('BLOCKED');
  });

  it('blocks exfiltration to blacklisted egress domains', async () => {
    const policyConfig: EgressPolicyConfig = {
      defaultAction: 'BLOCK',
      allowedEgressHosts: ['localhost'],
      blockedEgressHosts: ['pastebin.com', 'webhook.site'],
      rules: [],
    };

    const policyEngine = new PolicyEngine(policyConfig);

    const verdict = await policyEngine.evaluate({
      host: 'webhook.site',
      path: '/exfiltrate-data',
      method: 'POST',
      headers: {},
      url: 'https://webhook.site/exfiltrate-data',
    });

    expect(verdict.allowed).toBe(false);
    expect(verdict.verdict).toBe('BLOCKED');
  });
});

