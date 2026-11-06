import { describe, it, expect } from 'bun:test';
import { TelemetryRingBuffer, CapsuleManager } from '../src/teleport/capsule.js';
import { sha256 } from '../src/utils/crypto.js';

describe('Browser-state capsule prototype', () => {
  it('maintains rolling ring buffer with automatic circular eviction', () => {
    const ring = new TelemetryRingBuffer(3);

    ring.push({ type: 'dom_click', timestamp: 1, payload: { id: 'btn_1' } });
    ring.push({ type: 'dom_click', timestamp: 2, payload: { id: 'btn_2' } });
    ring.push({ type: 'dom_click', timestamp: 3, payload: { id: 'btn_3' } });
    ring.push({ type: 'dom_click', timestamp: 4, payload: { id: 'btn_4' } });

    const events = ring.getEvents();
    expect(events.length).toBe(3);
    expect(events[0].payload.id).toBe('btn_2');
    expect(events[2].payload.id).toBe('btn_4');
  });

  it('masks selected email, card, and token patterns in strings', () => {
    const masked = TelemetryRingBuffer.maskSensitiveString(
      'User customer@acme.com paid with card 4111 2222 3333 4444 using token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozG4'
    );

    expect(masked).not.toContain('customer@acme.com');
    expect(masked).not.toContain('4111 2222 3333 4444');
    expect(masked).toContain('[REDACTED_EMAIL]');
    expect(masked).toContain('[REDACTED_PAYMENT_CARD]');
    expect(masked).toContain('[REDACTED_JWT_TOKEN]');
  });

  it('creates state capsule with valid cryptographic checksum', () => {
    const capsule = CapsuleManager.createCapsule({
      url: 'https://app.acme.com/checkout',
      crash: {
        message: 'Uncaught TypeError: Cannot read properties of undefined (reading total)',
        stack: 'TypeError: Cannot read properties of undefined\n at Checkout.render (Checkout.tsx:42:15)',
      },
      events: [
        { type: 'dom_click', timestamp: Date.now() - 500, payload: { id: 'apply-coupon' } },
        { type: 'dom_click', timestamp: Date.now() - 100, payload: { id: 'pay-button' } },
      ],
      storage: {
        localStorage: { 'cart_token': 'cart_123' },
      },
    });

    expect(capsule.capsuleId).toBeDefined();
    expect(capsule.capsuleId.startsWith('capsule_')).toBe(true);
    expect(capsule.checksum).toBeDefined();
    expect(capsule.checksum.length).toBe(64);
    expect(capsule.events.length).toBe(2);
  });

  it('synthesizes deterministic reproduction Playwright spec file', () => {
    const capsule = CapsuleManager.createCapsule({
      url: 'https://app.acme.com/billing',
      crash: {
        message: 'NetworkError: Request failed with status 500',
        stack: 'Error: Request failed\n at api.ts:12',
      },
      storage: {
        localStorage: { 'session_id': 'sess_abc999' },
      },
    });

    const spec = CapsuleManager.synthesizeReproSpec(capsule);

    expect(spec).toContain("import { test, expect } from '@playwright/test';");
    expect(spec).toContain(capsule.capsuleId);
    expect(spec).toContain('https://app.acme.com/billing');
    expect(spec).toContain('window.localStorage.setItem');
  });

  it('provides client-side 3KB telemetry injection snippet', () => {
    const snippet = CapsuleManager.getClientSnippet();

    expect(snippet).toContain('__AIRLOCK_CAPSULE_INSTALLED__');
    expect(snippet).toContain('dom_click');
    expect(snippet).toContain('uncaught_error');
  });
});
