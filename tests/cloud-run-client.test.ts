import { describe, expect, it } from 'bun:test';
import type { QAFindConfig } from '../src/types/index.js';
import {
  CloudApiError,
  createCloudRunPayload,
  submitCloudRun,
} from '../src/router/cloud-run-client.js';

const cloudKey = 'air_live_test_key_do_not_log';

function fixtureConfig(): QAFindConfig {
  return {
    baseUrl: 'https://shop.example.test',
    secrets: {
      STRIPE_SECRET_KEY: {
        real: 'sk_test_super_secret_value',
        phantom: 'ph_stripe_placeholder',
        allowedHosts: ['api.stripe.com'],
        allowedMethods: ['POST'],
        blockedPaths: ['/v1/refunds'],
      },
    },
  } as QAFindConfig;
}

describe('QAFind Cloud run client', () => {
  it('requires an API key and never falls back to a demo credential', async () => {
    let requested = false;
    const fetcher = (async () => {
      requested = true;
      return new Response('{}');
    }) as typeof fetch;

    await expect(submitCloudRun({
      apiUrl: 'https://api.qafind.si',
      apiKey: ' ',
      payload: { suiteName: 'checkout', targetUrl: 'https://shop.example.test', phantomConfig: {} },
      fetcher,
    })).rejects.toThrow('Cloud runs require QAFIND_API_KEY');
    expect(requested).toBe(false);
  });

  it('sends the Cloud key only in the Bearer header and strips real app credentials', async () => {
    const payload = createCloudRunPayload(fixtureConfig(), 'https://shop.example.test');
    let capturedUrl = '';
    let capturedInit: RequestInit | undefined;
    const fetcher = (async (input, init) => {
      capturedUrl = String(input);
      capturedInit = init;
      return new Response(JSON.stringify({ run_id: 'run_123', status: 'queued' }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    const result = await submitCloudRun({
      apiUrl: 'https://api.qafind.si/',
      apiKey: cloudKey,
      payload,
      fetcher,
    });

    expect(capturedUrl).toBe('https://api.qafind.si/v1/runs');
    expect(new Headers(capturedInit?.headers).get('authorization')).toBe(`Bearer ${cloudKey}`);
    const requestBody = String(capturedInit?.body);
    expect(requestBody).not.toContain(cloudKey);
    expect(requestBody).not.toContain('sk_test_super_secret_value');
    expect(JSON.parse(requestBody).phantomConfig.STRIPE_SECRET_KEY).toEqual({
      phantom: 'ph_stripe_placeholder',
      allowedHosts: ['api.stripe.com'],
      allowedMethods: ['POST'],
      blockedPaths: ['/v1/refunds'],
    });
    expect(result).toMatchObject({ runId: 'run_123', status: 'QUEUED' });
  });

  it('rejects sending a Cloud key over non-local HTTP', async () => {
    let requested = false;
    const fetcher = (async () => {
      requested = true;
      return new Response('{}');
    }) as typeof fetch;

    await expect(submitCloudRun({
      apiUrl: 'http://qafind.si/api',
      apiKey: cloudKey,
      payload: { suiteName: 'checkout', targetUrl: 'https://shop.example.test', phantomConfig: {} },
      fetcher,
    })).rejects.toThrow('only be sent over HTTPS');
    expect(requested).toBe(false);
  });

  it('turns structured HTTP 429 responses into a readable quota message', async () => {
    const fetcher = (async () => new Response(JSON.stringify({
      code: 'DAILY_QUOTA_EXCEEDED',
      quota: { scope: 'workspace', used: 100, limit: 100, resetAt: '2026-11-07T00:00:00Z' },
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch;

    try {
      await submitCloudRun({
        apiUrl: 'https://api.qafind.si',
        apiKey: cloudKey,
        payload: { suiteName: 'checkout', targetUrl: 'https://shop.example.test', phantomConfig: {} },
        fetcher,
      });
      throw new Error('Expected 429 response to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(CloudApiError);
      expect((error as Error).message).toContain('100/100 runs used');
      expect((error as Error).message).toContain('workspace limit');
      expect((error as Error).message).toContain('2026-11-07T00:00:00 UTC');
    }
  });

  it('warns when a successful run leaves 20% or less of the quota', async () => {
    const warnings: string[] = [];
    const fetcher = (async () => new Response(JSON.stringify({ runId: 'run_124', status: 'QUEUED' }), {
      status: 202,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '20',
      },
    })) as typeof fetch;

    await submitCloudRun({
      apiUrl: 'https://api.qafind.si',
      apiKey: cloudKey,
      payload: { suiteName: 'checkout', targetUrl: 'https://shop.example.test', phantomConfig: {} },
      fetcher,
      warn: (message) => warnings.push(message),
    });

    expect(warnings).toEqual(['QAFind Cloud quota is nearly used: 20 of 100 runs remain today.']);
  });
});
