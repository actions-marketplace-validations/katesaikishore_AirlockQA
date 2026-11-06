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

  it('replaces exact configured secret strings in matching response headers and body', () => {
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

  describe('host matching', () => {
    const basePolicy = (patch: Partial<EgressPolicyConfig>): EgressPolicyConfig => ({
      defaultAction: 'BLOCK',
      allowedEgressHosts: [],
      blockedEgressHosts: [],
      rules: [],
      ...patch,
    });
    const req = (host: string, url = `http://${host}/x`) => ({
      host,
      path: '/x',
      method: 'GET' as const,
      headers: {},
      url,
    });

    it('matches wildcard patterns when the host carries a port', async () => {
      const engine = new PolicyEngine(basePolicy({ allowedEgressHosts: ['*.example.com'] }));
      expect((await engine.evaluate(req('api.example.com:8443'))).allowed).toBe(true);
      expect((await engine.evaluate(req('example.com:80'))).allowed).toBe(true);
      expect((await engine.evaluate(req('evilexample.com:80'))).allowed).toBe(false);
    });

    it('blocks a blacklisted host even when a port is present', async () => {
      const engine = new PolicyEngine(
        basePolicy({ defaultAction: 'ALLOW', blockedEgressHosts: ['*.pastebin.com', 'webhook.site'] })
      );
      expect((await engine.evaluate(req('x.pastebin.com:8080'))).allowed).toBe(false);
      expect((await engine.evaluate(req('webhook.site:443'))).allowed).toBe(false);
    });

    it('supports explicit host:port patterns', async () => {
      const engine = new PolicyEngine(basePolicy({ allowedEgressHosts: ['localhost:3000', '*.corp.test:443'] }));
      expect((await engine.evaluate(req('localhost:3000'))).allowed).toBe(true);
      expect((await engine.evaluate(req('localhost:4000'))).allowed).toBe(false);
      expect((await engine.evaluate(req('localhost'))).allowed).toBe(false);
      // Default port comes from the URL scheme when the host has none
      expect((await engine.evaluate(req('api.corp.test', 'https://api.corp.test/x'))).allowed).toBe(true);
      expect((await engine.evaluate(req('api.corp.test', 'http://api.corp.test/x'))).allowed).toBe(false);
    });

    it('applies rule hostPattern with ports stripped consistently', async () => {
      const engine = new PolicyEngine(
        basePolicy({
          rules: [{ id: 'allow-api', hostPattern: '*.example.com', action: 'ALLOW' }],
        })
      );
      const verdict = await engine.evaluate(req('api.example.com:3000'));
      expect(verdict.allowed).toBe(true);
      expect(verdict.matchedRule?.id).toBe('allow-api');
    });
  });

  describe('secret allowedHosts enforcement', () => {
    it('blocks a request carrying a phantom token to a host outside allowedHosts', async () => {
      const engine = new PolicyEngine({
        defaultAction: 'ALLOW',
        allowedEgressHosts: ['*'],
        blockedEgressHosts: [],
        rules: [],
      });
      const verdict = await engine.evaluate(
        {
          host: 'attacker.example:8080',
          path: '/collect',
          method: 'GET',
          headers: { authorization: 'Bearer ph_sec_stripe_test_8f2a' },
          url: 'http://attacker.example:8080/collect',
        },
        [secretConfig]
      );
      expect(verdict.allowed).toBe(false);
      expect(verdict.verdict).toBe('BLOCKED');
      expect(verdict.reason).toContain('allowedHosts');
      expect(verdict.reason).toContain('attacker.example');
    });

    it('allows the phantom token on an allowed host with a port', async () => {
      const engine = new PolicyEngine({
        defaultAction: 'ALLOW',
        allowedEgressHosts: [],
        blockedEgressHosts: [],
        rules: [],
      });
      const verdict = await engine.evaluate(
        { host: 'localhost:3999', path: '/api', method: 'GET', headers: {}, url: 'http://localhost:3999/api' },
        [secretConfig]
      );
      expect(verdict.allowed).toBe(true);
    });

    it('blocks a phantom token whose secret has an empty allowedHosts list', async () => {
      const engine = new PolicyEngine({
        defaultAction: 'ALLOW',
        allowedEgressHosts: [],
        blockedEgressHosts: [],
        rules: [],
      });
      const verdict = await engine.evaluate(
        { host: 'api.stripe.com', path: '/', method: 'GET', headers: {}, url: 'https://api.stripe.com/' },
        [{ ...secretConfig, allowedHosts: [] }]
      );
      expect(verdict.allowed).toBe(false);
    });
  });

  describe('phantom engine validation', () => {
    const make = (real: string, phantom: string) => () =>
      new PhantomEngine({ KEY: { real, phantom, allowedHosts: ['api.stripe.com'] } });

    it('rejects real or phantom values shorter than 8 characters', () => {
      expect(make('short', 'ph_long_enough_token')).toThrow(/at least 8/);
      expect(make('sk_live_long_enough', 'ph_1')).toThrow(/at least 8/);
    });

    it('rejects values where one contains the other', () => {
      expect(make('sk_live_abcdefgh_ph_token_1234', 'ph_token_1234')).toThrow(/contain/);
      expect(make('sk_live_1234', 'wrapped_sk_live_1234_x')).toThrow(/contain/);
    });

    it('rejects values that overlap with another secret', () => {
      expect(
        () =>
          new PhantomEngine({
            A: { real: 'sk_live_aaaaaaaa', phantom: 'ph_token_aaaaaaaa', allowedHosts: ['*'] },
            B: { real: 'sk_live_aaaaaaaa_more', phantom: 'ph_token_bbbbbbbb', allowedHosts: ['*'] },
          })
      ).toThrow(/contain/);
    });

    it('uses the shared host matcher for swap host restrictions', () => {
      const engine = new PhantomEngine({
        KEY: { ...secretConfig, allowedHosts: ['*.stripe.com', 'localhost:3999'] },
      });
      const headers = { authorization: 'Bearer ph_sec_stripe_test_8f2a' };
      expect(engine.swapPhantomToReal(headers, undefined, 'api.stripe.com:443').swappedTokens).toHaveLength(1);
      expect(engine.swapPhantomToReal(headers, undefined, 'localhost:3999').swappedTokens).toHaveLength(1);
      expect(engine.swapPhantomToReal(headers, undefined, 'localhost:4000').swappedTokens).toHaveLength(0);
      // A plain hostname pattern no longer admits arbitrary subdomains
      const exact = new PhantomEngine({ KEY: secretConfig });
      expect(exact.swapPhantomToReal(headers, undefined, 'evil.api.stripe.com').swappedTokens).toHaveLength(0);
    });
  });
});
