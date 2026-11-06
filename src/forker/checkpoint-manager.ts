import * as path from 'node:path';
import type { BrowserContext, Page } from 'playwright-core';
import type { CheckpointSnapshot, StorageStateSnapshot } from '../types/index.js';
import { ensureDir, readJsonFile, writeJsonFile } from '../utils/files.js';
import { deterministicId, sha256 } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export class CheckpointManager {
  private checkpointsDir: string;
  private memoryCache: Map<string, CheckpointSnapshot> = new Map();

  constructor(checkpointsDir = './.airlock/checkpoints') {
    this.checkpointsDir = checkpointsDir;
    ensureDir(checkpointsDir);
  }

  /**
   * Capture a full point-in-time state snapshot (Storage, SessionStorage, URL, DOM hash)
   */
  async capture(
    page: Page,
    context: BrowserContext,
    name: string,
    stepIndex = 0,
    metadata?: Record<string, unknown>
  ): Promise<CheckpointSnapshot> {
    const startTime = Date.now();

    // 1. Storage state (cookies + localStorage)
    const storageState = (await context.storageState()) as StorageStateSnapshot;

    // 2. SessionStorage
    let sessionStorageData: Record<string, string> = {};
    try {
      sessionStorageData = await page.evaluate(() => {
        const data: Record<string, string> = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            data[key] = sessionStorage.getItem(key) || '';
          }
        }
        return data;
      });
    } catch {
      // Ignore if page is navigating
    }

    // 3. Current URL, DOM content & DOM hash
    const currentUrl = page.url();
    let domHash = '';
    let htmlContent: string | undefined;
    try {
      htmlContent = await page.content();
      domHash = sha256(htmlContent);
    } catch {
      domHash = sha256(currentUrl);
    }

    const snapshot: CheckpointSnapshot = {
      id: deterministicId('cp', `${name}_${Date.now()}`),
      name,
      stepIndex,
      timestamp: new Date().toISOString(),
      url: currentUrl,
      htmlContent,
      storageState,
      sessionStorage: sessionStorageData,
      domHash,
      metadata,
    };

    // Cache in memory and persist to disk
    this.memoryCache.set(name, snapshot);
    const filePath = path.join(this.checkpointsDir, `${name}.json`);
    writeJsonFile(filePath, snapshot);

    const elapsed = Date.now() - startTime;
    logger.moat(3, 'State Checkpoint Captured', `Captured warm state '${name}' in ${elapsed}ms (${snapshot.storageState.cookies.length} cookies, ${storageState.origins.length} storage origins)`);

    return snapshot;
  }

  /**
   * Retrieve checkpoint from memory cache or disk
   */
  getCheckpoint(name: string): CheckpointSnapshot | null {
    if (this.memoryCache.has(name)) {
      return this.memoryCache.get(name)!;
    }
    const filePath = path.join(this.checkpointsDir, `${name}.json`);
    try {
      const snapshot = readJsonFile<CheckpointSnapshot>(filePath);
      this.memoryCache.set(name, snapshot);
      return snapshot;
    } catch {
      return null;
    }
  }

  /**
   * Restore browser storage and URL/content into the supplied context and page.
   */
  async restore(context: BrowserContext, page: Page, name: string): Promise<boolean> {
    const snapshot = this.getCheckpoint(name);
    if (!snapshot) {
      logger.error(`Checkpoint '${name}' not found`);
      return false;
    }

    const startTime = Date.now();

    // 1. Restore cookies
    if (snapshot.storageState.cookies && snapshot.storageState.cookies.length > 0) {
      await context.addCookies(snapshot.storageState.cookies);
    }

    // 2. Navigate to checkpoint URL or restore HTML
    if (snapshot.url && snapshot.url !== 'about:blank') {
      await page.goto(snapshot.url, { waitUntil: 'domcontentloaded' });
    } else if (snapshot.htmlContent) {
      await page.setContent(snapshot.htmlContent);
    }

    // 3. Restore LocalStorage & SessionStorage
    await page.evaluate(
      ({ storageOrigins, sessionStorageData }) => {
        // Restore localStorage
        for (const origin of storageOrigins) {
          if (origin.origin === window.location.origin) {
            for (const item of origin.localStorage) {
              localStorage.setItem(item.name, item.value);
            }
          }
        }
        // Restore sessionStorage
        for (const [k, v] of Object.entries(sessionStorageData)) {
          sessionStorage.setItem(k, v);
        }
      },
      {
        storageOrigins: snapshot.storageState.origins || [],
        sessionStorageData: snapshot.sessionStorage || {},
      }
    );

    const elapsed = Date.now() - startTime;
    logger.info(`Restored browser checkpoint '${name}' to ${snapshot.url} in ${elapsed}ms`);
    return true;
  }
}
