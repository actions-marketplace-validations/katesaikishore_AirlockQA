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

  it('continues requests outside the configured target hosts', async () => {
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
      fulfill: async () => continued.push('fulfilled'),
    });

    expect(continued).toEqual(['continued']);
  });
});
