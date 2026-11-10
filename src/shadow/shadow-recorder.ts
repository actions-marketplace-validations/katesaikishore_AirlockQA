/** Stores caller-supplied HTTP fixtures for replay in a Playwright BrowserContext. */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { sha256 } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export interface WireInteraction {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  host: string;
  path: string;
  requestHeaders: Record<string, string>;
  requestBodyHash?: string;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
  latencyMs: number | null;
}

export class ShadowRecorder {
  private catalog: Map<string, WireInteraction> = new Map();
  private catalogPath: string;

  constructor(catalogPath = './.qafind/shadow/wire-catalog.json') {
    this.catalogPath = path.resolve(process.cwd(), catalogPath);
    this.loadCatalog();
  }

  private loadCatalog(): void {
    if (fs.existsSync(this.catalogPath)) {
      try {
        const raw = fs.readFileSync(this.catalogPath, 'utf8');
        const list = JSON.parse(raw) as WireInteraction[];
        for (const item of list) {
          const key = this.generateKey(item.method, item.url, item.requestBodyHash);
          this.catalog.set(key, item);
        }
      } catch (e) {
        // Start fresh
      }
    }
  }

  generateKey(method: string, url: string, bodyHash?: string): string {
    const parsed = new URL(url);
    const normalizedUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    return `${method.toUpperCase()} ${normalizedUrl}${bodyHash ? `::${bodyHash}` : ''}`;
  }

  record(
    method: string,
    url: string,
    requestHeaders: Record<string, string>,
    requestBody: string | undefined,
    responseStatus: number,
    responseHeaders: Record<string, string>,
    responseBody: string,
    latencyMs?: number
  ): WireInteraction {
    const parsed = new URL(url);
    const bodyHash = requestBody && requestBody.length > 0 ? sha256(requestBody).substring(0, 16) : undefined;
    const key = this.generateKey(method, url, bodyHash);

    const interaction: WireInteraction = {
      id: `wire_${sha256(key + Date.now()).substring(0, 12)}`,
      timestamp: new Date().toISOString(),
      method: method.toUpperCase(),
      url,
      host: parsed.host,
      path: parsed.pathname + parsed.search,
      requestHeaders,
      requestBodyHash: bodyHash,
      responseStatus,
      responseHeaders,
      responseBody,
      latencyMs: latencyMs ?? null,
    };

    this.catalog.set(key, interaction);
    this.saveCatalog();
    return interaction;
  }

  saveCatalog(): void {
    const dir = path.dirname(this.catalogPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const list = Array.from(this.catalog.values());
    fs.writeFileSync(this.catalogPath, JSON.stringify(list, null, 2), 'utf8');
  }

  find(method: string, url: string, body?: string): WireInteraction | null {
    const bodyHash = body && body.length > 0 ? sha256(body).substring(0, 16) : undefined;
    const exactKey = this.generateKey(method, url, bodyHash);
    if (this.catalog.has(exactKey)) {
      return this.catalog.get(exactKey)!;
    }

    // Fallback: match without body hash
    const fallbackKey = this.generateKey(method, url);
    return this.catalog.get(fallbackKey) || null;
  }

  size(): number {
    return this.catalog.size;
  }
}
