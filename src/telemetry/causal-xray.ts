/**
 * Browser trace diagnostics prototype.
 * It records browser requests/responses and only reports service diagnostics
 * explicitly included in an upstream error response.
 */

import type { Page, Request, Response } from 'playwright-core';
import type { XRayDiagnosticBundle, XRayTrace, XRayBackendDiagnostic } from '../types/index.js';
import { sha256 } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export class CausalXRay {
  private currentTraceId: string;
  private traces: XRayTrace[] = [];
  private activeSpanId: string | null = null;
  private attachedPage: Page | null = null;

  constructor(traceId?: string) {
    this.currentTraceId = traceId || sha256(`xray_${Date.now()}_${Math.random()}`).substring(0, 32);
  }

  getTraceId(): string {
    return this.currentTraceId;
  }

  /**
   * Attach Causal X-Ray distributed traceparent headers to a browser page
   */
  async attachToPage(page: Page): Promise<void> {
    this.attachedPage = page;

    // 1. Inject W3C traceparent header on all outbound requests
    await page.route('**/*', async (route) => {
      const request = route.request();
      const spanId = sha256(`span_${Date.now()}_${Math.random()}`).substring(0, 16);
      const traceparent = `00-${this.currentTraceId}-${spanId}-01`;

      const headers = {
        ...request.headers(),
        'traceparent': traceparent,
        'x-airlock-trace-id': this.currentTraceId,
        'x-airlock-span-id': spanId,
      };

      try {
        // fallback (not continue) so the AirlockGateway context route still decides.
        await route.fallback({ headers });
      } catch {
        // Route already handled or closed
      }
    });

    // 2. Intercept responses to associate backend status and diagnostic headers
    page.on('response', async (response: Response) => {
      try {
        const req = response.request();
        const status = response.status();
        const url = req.url();
        const method = req.method();
        const spanId = (req.headers()['x-airlock-span-id'] as string) || sha256(url).substring(0, 16);

        let bodySnippet = '';
        let backendDiag: XRayBackendDiagnostic | undefined;

        if (status >= 400) {
          try {
            bodySnippet = await response.text();
            if (bodySnippet.length > 500) {
              bodySnippet = bodySnippet.substring(0, 500) + '...';
            }

            // Attempt to parse structured error or stack trace
            try {
              const parsed = JSON.parse(bodySnippet);
              backendDiag = {
                errorClass: typeof parsed.error === 'string' ? parsed.error : typeof parsed.name === 'string' ? parsed.name : undefined,
                errorMessage: typeof parsed.message === 'string'
                  ? parsed.message
                  : typeof parsed.error_description === 'string' ? parsed.error_description : `HTTP ${status}`,
                culpritFile: typeof parsed.file === 'string'
                  ? parsed.file
                  : typeof parsed.path === 'string' ? parsed.path : undefined,
                culpritLine: Number.isInteger(parsed.line) && parsed.line > 0 ? parsed.line : undefined,
                culpritFunction: typeof parsed.fn === 'string' ? parsed.fn : undefined,
                databaseQuery: typeof parsed.query === 'string' ? parsed.query : undefined,
              };
            } catch {
              backendDiag = {
                errorMessage: bodySnippet.substring(0, 100) || `HTTP ${status}`,
              };
            }
          } catch {
            // Response text not readable
          }
        }

        const traceEntry: XRayTrace = {
          traceId: this.currentTraceId,
          spanId,
          timestamp: new Date().toISOString(),
          stepName: this.activeSpanId ? `Step [${this.activeSpanId}]` : `Network [${method} ${url}]`,
          network: {
            method,
            url,
            status,
            latencyMs: null,
            requestHeaders: req.headers(),
            responseHeaders: response.headers(),
            responseBodySnippet: bodySnippet || undefined,
          },
          backendDiagnostics: backendDiag,
        };

        this.traces.push(traceEntry);
      } catch {
        // Page or response closed
      }
    });

    logger.info(`Causal X-Ray attached: W3C Traceparent Active (Trace ID: ${this.currentTraceId.substring(0, 12)}...)`);
  }

  /**
   * Start a named step span
   */
  startStep(stepName: string, domAction?: { action: string; selector?: string; value?: string }): string {
    const spanId = sha256(`${stepName}_${Date.now()}`).substring(0, 16);
    this.activeSpanId = stepName;

    this.traces.push({
      traceId: this.currentTraceId,
      spanId,
      timestamp: new Date().toISOString(),
      stepName,
      domAction,
    });

    return spanId;
  }

  /**
   * Wrap any test action or assertion in an X-Ray diagnostic boundary
   */
  async traceStep<T>(page: Page, stepName: string, fn: () => Promise<T>): Promise<T> {
    this.startStep(stepName);
    try {
      return await fn();
    } catch (err: any) {
      const bundle = this.generateFailureBundle(stepName, err);
      logger.error(`\n${bundle.formattedTerminalBox}\n`);
      const enrichedError = new Error(`${err.message}\n\n${bundle.formattedTerminalBox}`);
      (enrichedError as any).xrayBundle = bundle;
      throw enrichedError;
    }
  }

  /**
   * Generate a bundle from observed browser data without inventing service metadata.
   */
  generateFailureBundle(stepName: string, error: Error | string): XRayDiagnosticBundle {
    const errorMsg = typeof error === 'string' ? error : error.message;

    // Find the latest trace with an HTTP failure or failing DOM step
    const failingTrace = [...this.traces].reverse().find((t) => t.network && t.network.status >= 400) ||
      this.traces[this.traces.length - 1];

    const diag = failingTrace?.backendDiagnostics || {
      errorClass: 'AssertionFailure',
      errorMessage: errorMsg,
    };

    const terminalBox = CausalXRay.formatTerminalDiagnostic({
      traceId: this.currentTraceId,
      stepName,
      errorMsg,
      failingTrace,
      diag,
    });

    return {
      traceId: this.currentTraceId,
      failureReason: errorMsg,
      step: stepName,
      formattedTerminalBox: terminalBox,
      traces: this.traces,
    };
  }

  /**
   * Format the multi-line Causal X-Ray terminal box
   */
  static formatTerminalDiagnostic(opts: {
    traceId: string;
    stepName: string;
    errorMsg: string;
    failingTrace?: XRayTrace;
    diag: XRayBackendDiagnostic;
  }): string {
    const divider = '─'.repeat(74);
    const net = opts.failingTrace?.network;
    const netStatusStr = net ? `${net.method} ${net.url} -> ${net.status}` : 'No failing HTTP response observed';
    const location = opts.diag.culpritFile
      ? `${opts.diag.culpritFile}${opts.diag.culpritLine ? `:${opts.diag.culpritLine}` : ''}`
      : 'Unavailable (not supplied by the service)';

    const lines: string[] = [
      `┌${divider}┐`,
      `│ 🧬 AIRLOCK BROWSER TRACE DIAGNOSTICS                                    │`,
      `├${divider}┤`,
      `│ 💥 Failed Step:     ${opts.stepName.padEnd(52).substring(0, 52)} │`,
      `│ 🌐 Browser response:${netStatusStr.padEnd(52).substring(0, 52)} │`,
      `│ 🔑 Traceparent ID:  ${opts.traceId.padEnd(52).substring(0, 52)} │`,
      `├${divider}┤`,
      `│ 📍 Culprit File:    ${location.padEnd(52).substring(0, 52)} │`,
      `│ 🧩 Function / Class:${`${opts.diag.culpritFunction || 'Unavailable'}`.padEnd(52).substring(0, 52)} │`,
      `│ ⚠️ Observed error:  ${`${opts.diag.errorMessage || opts.errorMsg}`.padEnd(52).substring(0, 52)} │`,
    ];

    if (opts.diag.databaseQuery) {
      lines.push(`│ 🗄️ Database Query:  ${opts.diag.databaseQuery.padEnd(52).substring(0, 52)} │`);
    }

    if (opts.diag.codeSnippet) {
      lines.push(`│    > ${opts.diag.codeSnippet.padEnd(68).substring(0, 68)} │`);
    }

    lines.push(`└${divider}┘`);
    return lines.join('\n');
  }

  getTraces(): XRayTrace[] {
    return this.traces;
  }
}
