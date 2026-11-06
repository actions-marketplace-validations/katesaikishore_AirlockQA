import * as fs from 'node:fs';
import * as path from 'node:path';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import type { BrowserContext, Page } from 'playwright-core';
import type { CheckpointSnapshot, StorageStateSnapshot } from '../types/index.js';
import { ensureDir } from '../utils/files.js';
import { deterministicId, sha256 } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

/** On-disk envelope for a checkpoint encrypted with AES-256-GCM. */
export interface EncryptedCheckpointFile {
  airlockEncryptedCheckpoint: 1;
  algorithm: 'aes-256-gcm';
  kdf: 'scrypt';
  salt: string;
  iv: string;
  authTag: string;
  ciphertext: string;
}

export interface CheckpointManagerOptions {
  /**
   * Passphrase for encrypting checkpoints at rest. Defaults to AIRLOCK_CHECKPOINT_KEY.
   * Pass null to disable encryption explicitly.
   */
  encryptionKey?: string | null;
}

export function isEncryptedCheckpointFile(value: unknown): value is EncryptedCheckpointFile {
  return typeof value === 'object' && value !== null
    && (value as EncryptedCheckpointFile).airlockEncryptedCheckpoint === 1;
}

function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return scryptSync(passphrase, salt, 32);
}

export function encryptCheckpoint(snapshot: CheckpointSnapshot, passphrase: string): EncryptedCheckpointFile {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deriveKey(passphrase, salt), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(snapshot), 'utf8'), cipher.final()]);
  return {
    airlockEncryptedCheckpoint: 1,
    algorithm: 'aes-256-gcm',
    kdf: 'scrypt',
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

export function decryptCheckpoint(file: EncryptedCheckpointFile, passphrase: string): CheckpointSnapshot {
  const decipher = createDecipheriv(
    'aes-256-gcm',
    deriveKey(passphrase, Buffer.from(file.salt, 'base64')),
    Buffer.from(file.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(file.authTag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(file.ciphertext, 'base64')),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString('utf8')) as CheckpointSnapshot;
}

export class CheckpointManager {
  private checkpointsDir: string;
  private memoryCache: Map<string, CheckpointSnapshot> = new Map();
  private encryptionKey: string | null;
  private warnedPlaintext = false;

  constructor(checkpointsDir = './.airlock/checkpoints', options: CheckpointManagerOptions = {}) {
    this.checkpointsDir = checkpointsDir;
    this.encryptionKey = options.encryptionKey === undefined
      ? process.env.AIRLOCK_CHECKPOINT_KEY || null
      : options.encryptionKey || null;
    ensureDir(checkpointsDir);
    try {
      fs.chmodSync(checkpointsDir, 0o700);
    } catch {
      // Best effort: the directory may be shared or on a filesystem without POSIX modes.
    }
  }

  get encrypted(): boolean {
    return this.encryptionKey !== null;
  }

  private filePathFor(name: string): string {
    return path.join(this.checkpointsDir, `${name}.json`);
  }

  /** Persist a snapshot (encrypted when a key is configured) with owner-only file permissions. */
  save(snapshot: CheckpointSnapshot): string {
    const filePath = this.filePathFor(snapshot.name);
    let payload: unknown = snapshot;
    if (this.encryptionKey) {
      payload = encryptCheckpoint(snapshot, this.encryptionKey);
    } else if (!this.warnedPlaintext) {
      this.warnedPlaintext = true;
      logger.warn('Saving checkpoints unencrypted (they contain cookies, storage and page HTML). Set AIRLOCK_CHECKPOINT_KEY to encrypt them at rest.');
    }
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
    // writeFileSync only applies mode on creation; tighten existing files too.
    fs.chmodSync(filePath, 0o600);
    this.memoryCache.set(snapshot.name, snapshot);
    return filePath;
  }

  /** Read a snapshot from disk, decrypting it if needed. Throws on a missing key or tampered file. */
  load(name: string): CheckpointSnapshot {
    const raw = JSON.parse(fs.readFileSync(this.filePathFor(name), 'utf8')) as unknown;
    if (isEncryptedCheckpointFile(raw)) {
      if (!this.encryptionKey) {
        throw new Error(`Checkpoint '${name}' is encrypted; set AIRLOCK_CHECKPOINT_KEY to read it`);
      }
      return decryptCheckpoint(raw, this.encryptionKey);
    }
    return raw as CheckpointSnapshot;
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
    this.save(snapshot);

    const elapsed = Date.now() - startTime;
    logger.stage('Checkpoint saved', `'${name}' in ${elapsed}ms (${snapshot.storageState.cookies.length} cookies, ${storageState.origins.length} storage origins${this.encrypted ? ', encrypted' : ''})`);

    return snapshot;
  }

  /**
   * Retrieve checkpoint from memory cache or disk
   */
  getCheckpoint(name: string): CheckpointSnapshot | null {
    if (this.memoryCache.has(name)) {
      return this.memoryCache.get(name)!;
    }
    if (!fs.existsSync(this.filePathFor(name))) return null;
    try {
      const snapshot = this.load(name);
      this.memoryCache.set(name, snapshot);
      return snapshot;
    } catch (err) {
      logger.error(`Could not read checkpoint '${name}': ${(err as Error).message}`);
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

    // 2. Restore localStorage for every saved origin. Origins other than the
    // checkpoint page's are seeded through a throwaway page whose requests are
    // answered locally, so no traffic reaches those sites.
    const storageOrigins = snapshot.storageState.origins || [];
    const targetOrigin = safeOrigin(snapshot.url);
    for (const origin of storageOrigins) {
      if (!origin.localStorage?.length || origin.origin === targetOrigin) continue;
      const seedPage = await context.newPage();
      try {
        await seedPage.route('**/*', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>airlock</title>' }));
        await seedPage.goto(origin.origin, { waitUntil: 'domcontentloaded' });
        await seedPage.evaluate((items) => {
          for (const item of items) localStorage.setItem(item.name, item.value);
        }, origin.localStorage);
      } catch (err) {
        logger.warn(`Could not restore localStorage for ${origin.origin}: ${(err as Error).message}`);
      } finally {
        await seedPage.close().catch(() => undefined);
      }
    }

    // 3. Navigate to checkpoint URL or restore HTML
    if (snapshot.url && snapshot.url !== 'about:blank') {
      await page.goto(snapshot.url, { waitUntil: 'domcontentloaded' });
    } else if (snapshot.htmlContent) {
      await page.setContent(snapshot.htmlContent);
    }

    // 4. Restore the current origin's localStorage and the page's sessionStorage
    await page.evaluate(
      ({ storageOrigins, sessionStorageData }) => {
        for (const origin of storageOrigins) {
          if (origin.origin === window.location.origin) {
            for (const item of origin.localStorage) {
              localStorage.setItem(item.name, item.value);
            }
          }
        }
        for (const [k, v] of Object.entries(sessionStorageData)) {
          sessionStorage.setItem(k, v);
        }
      },
      {
        storageOrigins,
        sessionStorageData: snapshot.sessionStorage || {},
      }
    );

    const elapsed = Date.now() - startTime;
    logger.info(`Restored browser checkpoint '${name}' to ${snapshot.url} in ${elapsed}ms`);
    return true;
  }
}

function safeOrigin(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const origin = new URL(url).origin;
    return origin === 'null' ? undefined : origin;
  } catch {
    return undefined;
  }
}
