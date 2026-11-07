import { describe, it, expect } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ShadowRecorder } from '../src/shadow/shadow-recorder.js';
import { ShadowSynthesizer } from '../src/shadow/shadow-synthesizer.js';

describe('Browser-context fixture replay prototype', () => {
  const testCatalogPath = './.airlock/test-shadow/catalog.json';

  it('records outbound wire interactions and caches them', () => {
    const recorder = new ShadowRecorder(testCatalogPath);

    const interaction = recorder.record(
      'POST',
      'https://api.stripe.com/v1/charges',
      { 'content-type': 'application/x-www-form-urlencoded' },
      'amount=5000&currency=usd',
      200,
      { 'content-type': 'application/json' },
      JSON.stringify({ id: 'ch_test_123', status: 'succeeded', amount: 5000 }),
      25
    );

    expect(interaction.id).toBeDefined();
    expect(interaction.host).toBe('api.stripe.com');
    expect(recorder.size()).toBeGreaterThanOrEqual(1);

    // Verify retrieval
    const retrieved = recorder.find('POST', 'https://api.stripe.com/v1/charges', 'amount=5000&currency=usd');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.responseStatus).toBe(200);
    expect(JSON.parse(retrieved!.responseBody).id).toBe('ch_test_123');

    // Clean up test catalog file if created
    if (fs.existsSync(testCatalogPath)) {
      fs.unlinkSync(testCatalogPath);
    }
  });

  it('initializes ShadowSynthesizer without claiming hermetic network coverage', () => {
    const recorder = new ShadowRecorder(testCatalogPath);
    const synthesizer = new ShadowSynthesizer(recorder);

    expect(synthesizer.isActive()).toBe(false);
    expect(synthesizer.getServedCount()).toBe(0);
  });

  it('falls back to the next handler for requests outside the configured target hosts', async () => {
    const recorder = new ShadowRecorder(testCatalogPath);
    const synthesizer = new ShadowSynthesizer(recorder);
    let routeHandler: ((route: any) => Promise<void>) | undefined;
    const context = {
      route: async (_pattern: string, handler: (route: any) => Promise<void>) => {
        routeHandler = handler;
      },
    };
    const continued: string[] = [];

    await synthesizer.activate(context as any, ['api.example.com']);
    await routeHandler?.({
      request: () => ({
        url: () => 'https://outside.example.net/ping',
        method: () => 'GET',
        postData: () => null,
      }),
      continue: async () => continued.push('continued'),
      fallback: async () => continued.push('fallback'),
      fulfill: async () => continued.push('fulfilled'),
    });

    expect(continued).toEqual(['fallback']);
  });

  it('never fabricates a Stripe response for an unmatched request; it falls back and reports the miss', async () => {
    const recorder = new ShadowRecorder(testCatalogPath);
    const synthesizer = new ShadowSynthesizer(recorder);
    let routeHandler: ((route: any) => Promise<void>) | undefined;
    const context = {
      route: async (_pattern: string, handler: (route: any) => Promise<void>) => {
        routeHandler = handler;
      },
    };
    const calls: string[] = [];

    await synthesizer.activate(context as any, ['*']);
    await routeHandler?.({
      request: () => ({
        url: () => 'https://api.stripe.com/v1/charges/unrecorded',
        method: () => 'POST',
        postData: () => 'amount=1',
      }),
      continue: async () => calls.push('continue'),
      fallback: async () => calls.push('fallback'),
      fulfill: async () => calls.push('fulfill'),
    });

    expect(calls).toEqual(['fallback']);
    expect(synthesizer.getServedCount()).toBe(0);
    expect(synthesizer.getMissedRequests()).toEqual(['POST https://api.stripe.com/v1/charges/unrecorded']);
  });

  it('reports missed requests without query strings and keeps the list bounded', async () => {
    const recorder = new ShadowRecorder(testCatalogPath);
    const synthesizer = new ShadowSynthesizer(recorder);
    let routeHandler: ((route: any) => Promise<void>) | undefined;
    const context = {
      route: async (_pattern: string, handler: (route: any) => Promise<void>) => {
        routeHandler = handler;
      },
    };
    await synthesizer.activate(context as any, ['*']);
    const send = (url: string) =>
      routeHandler?.({
        request: () => ({ url: () => url, method: () => 'GET', postData: () => null }),
        continue: async () => {},
        fallback: async () => {},
        fulfill: async () => {},
      });

    await send('https://api.example.com/v1/items?api_key=sk_live_SECRET&token=abc#frag');
    const first = synthesizer.getMissedRequests();
    expect(first).toEqual(['GET https://api.example.com/v1/items']);
    expect(first.join(' ')).not.toContain('sk_live_SECRET');

    for (let i = 0; i < 700; i++) await send(`https://api.example.com/v1/items/${i}`);
    expect(synthesizer.getMissedRequests().length).toBeLessThanOrEqual(500);
  });
});
