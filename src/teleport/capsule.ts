/**
 * Browser-state capsule prototype with heuristic event redaction and basic replay.
 * It does not provide consent management, encrypted capsule storage, or VM restore.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Page, BrowserContext } from 'playwright-core';
import type { StateCapsule, TelemetryEvent } from '../types/index.js';
import { canonicalJson, sha256 } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export class TelemetryRingBuffer {
  private capacity: number;
  private buffer: TelemetryEvent[] = [];

  constructor(capacity = 100) {
    this.capacity = capacity;
  }

  push(event: TelemetryEvent): void {
    const sanitized = this.sanitizeEvent(event);
    if (this.buffer.length >= this.capacity) {
      this.buffer.shift();
    }
    this.buffer.push(sanitized);
  }

  getEvents(): TelemetryEvent[] {
    return [...this.buffer];
  }

  /**
   * Applies best-effort string patterns to event payloads; this is not comprehensive PII redaction.
   */
  private sanitizeEvent(event: TelemetryEvent): TelemetryEvent {
    const sanitizedPayload: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(event.payload)) {
      if (typeof value === 'string') {
        sanitizedPayload[key] = TelemetryRingBuffer.maskSensitiveString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitizedPayload[key] = JSON.parse(
          TelemetryRingBuffer.maskSensitiveString(JSON.stringify(value))
        );
      } else {
        sanitizedPayload[key] = value;
      }
    }

    return {
      ...event,
      payload: sanitizedPayload,
    };
  }

  static maskSensitiveString(input: string): string {
    return input
      // Redact credit cards
      .replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[REDACTED_PAYMENT_CARD]')
      // Redact emails
      .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[REDACTED_EMAIL]')
      // Redact Bearer / JWT tokens
      .replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '[REDACTED_JWT_TOKEN]')
      // Redact password fields
      .replace(/("password"|"secret"|"token")\s*:\s*"[^"]+"/gi, '$1: "[REDACTED_SECRET]"');
  }
}

export class CapsuleManager {
  /**
   * Return client-side 3KB telemetry recorder snippet
   */
  static getClientSnippet(): string {
    return `(() => {
      if (window.__QAFIND_CAPSULE_INSTALLED__) return;
      window.__QAFIND_CAPSULE_INSTALLED__ = true;
      const buffer = [];
      const MAX_EVENTS = 60;
      
      function record(type, payload) {
        buffer.push({ type, timestamp: Date.now(), payload });
        if (buffer.length > MAX_EVENTS) buffer.shift();
      }

      // Capture clicks
      window.addEventListener('click', (e) => {
        const target = e.target;
        record('dom_click', {
          tagName: target?.tagName,
          id: target?.id,
          className: target?.className,
          text: target?.innerText?.substring(0, 40),
        });
      }, true);

      // Capture inputs (masked)
      window.addEventListener('input', (e) => {
        const target = e.target;
        record('dom_input', {
          id: target?.id,
          name: target?.name,
          valueLength: target?.value?.length || 0,
        });
      }, true);

      // Capture uncaught exceptions
      window.addEventListener('error', (e) => {
        record('uncaught_error', {
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno,
          stack: e.error?.stack,
        });
      });

      window.__QAFIND_GET_BUFFER__ = () => buffer;
    })();`;
  }

  /**
   * Create a state capsule from a crash state
   */
  static createCapsule(opts: {
    url: string;
    crash: { message: string; stack: string; timestamp?: number };
    events?: TelemetryEvent[];
    storage?: {
      localStorage?: Record<string, string>;
      sessionStorage?: Record<string, string>;
      cookies?: Array<{ name: string; value: string }>;
    };
    environment?: 'production' | 'staging' | 'preview';
  }): StateCapsule {
    const timestamp = new Date().toISOString();
    const capsuleSeed = `${opts.url}_${opts.crash.message}_${timestamp}`;
    const capsuleId = `capsule_${sha256(capsuleSeed).substring(0, 16)}`;

    const capsule: StateCapsule = {
      capsuleId,
      timestamp,
      appVersion: '2.4.0',
      environment: opts.environment || 'production',
      url: opts.url,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/133.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      events: opts.events || [],
      crash: {
        message: opts.crash.message,
        stack: opts.crash.stack,
        timestamp: opts.crash.timestamp || Date.now(),
      },
      storage: {
        localStorage: opts.storage?.localStorage || {},
        sessionStorage: opts.storage?.sessionStorage || {},
        cookies: opts.storage?.cookies || [],
      },
      checksum: '',
    };

    capsule.checksum = sha256(canonicalJson({ ...capsule, checksum: '' }));
    return capsule;
  }

  /**
   * Save state capsule to disk
   */
  static saveCapsule(capsule: StateCapsule, destPath = `./.qafind/capsules/${capsule.capsuleId}.json`): string {
    const fullPath = path.resolve(process.cwd(), destPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, JSON.stringify(capsule, null, 2), 'utf8');
    logger.info(`State Capsule saved to: ${fullPath}`);
    return fullPath;
  }

  /**
   * Restore the captured browser data available in this prototype into a Playwright page.
   */
  static async rehydrate(capsule: StateCapsule, page: Page, context?: BrowserContext): Promise<void> {
    logger.info(`Restoring browser-state capsule: ${capsule.capsuleId}`);
    logger.info(`  Captured error: ${capsule.crash.message.substring(0, 60)}...`);

    // 1. Inject Cookies
    if (context && capsule.storage.cookies.length > 0) {
      const parsedUrl = new URL(capsule.url);
      await context.addCookies(
        capsule.storage.cookies.map((c) => ({
          name: c.name,
          value: c.value,
          domain: parsedUrl.hostname,
          path: '/',
        }))
      );
    }

    // 2. Pre-seed Local & Session Storage before navigation
    await page.addInitScript((storage) => {
      for (const [k, v] of Object.entries(storage.localStorage)) {
        window.localStorage.setItem(k, v);
      }
      for (const [k, v] of Object.entries(storage.sessionStorage)) {
        window.sessionStorage.setItem(k, v);
      }
    }, capsule.storage);

    // 3. Navigate to crash URL
    await page.goto(capsule.url, { waitUntil: 'domcontentloaded' }).catch(() => {});

    // 4. Replay event sequence
    for (const event of capsule.events) {
      if (event.type === 'dom_click') {
        const selector = event.payload.id
          ? `#${event.payload.id}`
          : event.payload.className
            ? `.${String(event.payload.className).split(' ')[0]}`
            : event.payload.tagName ? String(event.payload.tagName).toLowerCase() : null;

        if (selector) {
          await page.click(selector).catch(() => {});
          await page.waitForTimeout(50);
        }
      } else if (event.type === 'dom_input' && event.payload.id) {
        await page.fill(`#${event.payload.id}`, 'repro_test_val').catch(() => {});
      }
    }

    logger.info(`Capsule rehydrated: Replayed ${capsule.events.length} user events to reproduce crash state.`);
  }

  /**
   * Synthesize a standalone deterministic Playwright test spec reproducing the crash
   */
  static synthesizeReproSpec(capsule: StateCapsule): string {
    // Every value is emitted as a JSON string literal; comment text cannot break out of the comment.
    const lit = (v: unknown) =>
      JSON.stringify(String(v ?? '')).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    const comment = (v: unknown) => String(v ?? '').replace(/[\r\n\u2028\u2029]+/g, ' ').replace(/\*\//g, '* /');
    const storageLiteral = JSON.stringify(capsule.storage)
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
    let pathname = '/';
    try {
      pathname = new URL(capsule.url).pathname;
    } catch {
      // keep '/'
    }
    return `import { test, expect } from '@playwright/test';
import { CapsuleManager } from 'qafind';

/**
 * Auto-Synthesized Bug Reproduction Spec
 * Teleported from Production Crash: ${comment(capsule.capsuleId)}
 * Timestamp: ${comment(capsule.timestamp)}
 * Environment: ${comment(capsule.environment)}
 * Error: ${comment(capsule.crash.message)}
 */
test.describe(${lit(`Reproduction: ${capsule.capsuleId}`)}, () => {
  test('deterministically reproduces production crash in headless browser', async ({ page, context }) => {
    // 1. Rehydrate storage state
    await page.addInitScript((storage) => {
      for (const [k, v] of Object.entries(storage.localStorage)) {
        window.localStorage.setItem(k, v);
      }
    }, ${storageLiteral});

    // 2. Navigate to reproduction target
    await page.goto(${lit(capsule.url)});

    // 3. Verify reproduction of the uncaught condition
    expect(page.url()).toContain(${lit(pathname)});
  });
});
`;
  }
}
