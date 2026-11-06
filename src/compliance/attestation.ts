import * as path from 'node:path';
import { AirlockLedger } from './ledger.js';
import { MerkleTree } from './merkle-tree.js';
import type { ComplianceProofBundle } from '../types/index.js';
import {
  canonicalJson,
  deterministicId,
  ed25519KeyId,
  ed25519PublicKeyPem,
  sha256,
  signEd25519,
  signHmac,
  verifyEd25519,
  verifyHmac,
} from '../utils/crypto.js';
import { ensureDir, writeJsonFile } from '../utils/files.js';
import { logger } from '../utils/logger.js';

export const BUNDLE_SPEC_VERSION = '2.0.0' as const;

/** Domain-separation prefix for the bytes that get signed. */
const SIGNING_CONTEXT = 'airlockqa-run-evidence-v2\n';

/**
 * Development-only signing key. Evidence signed with it proves nothing, because
 * the key is public. It is never used when `CI` is set.
 */
export const DEV_SIGNING_KEY = 'AIRLOCK-INSECURE-DEV-KEY-DO-NOT-USE-FOR-EVIDENCE';

/**
 * Placeholder values that have shipped as defaults. They are treated as
 * "no key configured".
 */
const PLACEHOLDER_KEYS = new Set([
  'airlock-dev-signing-key-32-chars-long!',
  'airlock-default-signing-key',
  'airlock-hmac-master-key-32-chars-long!',
  DEV_SIGNING_KEY,
]);

export type SigningAlgorithm = ComplianceProofBundle['signingAlgorithm'];

export interface ResolvedSigningKey {
  key: string;
  source: 'env' | 'config' | 'dev';
  isDevKey: boolean;
  algorithm: SigningAlgorithm;
}

/**
 * Resolve the signing key for evidence bundles.
 *
 * Order: `AIRLOCK_SIGNING_KEY` env var, then the configured key. Shipped
 * placeholder defaults count as unset. With no key: throws when `CI` is set,
 * otherwise returns the labelled {@link DEV_SIGNING_KEY}.
 *
 * Algorithm: `AIRLOCK_SIGNING_ALGORITHM` (`Ed25519` or `HMAC-SHA256`); a PEM
 * private key implies Ed25519; otherwise HMAC-SHA256.
 */
export function resolveSigningKey(
  configuredKey: string | undefined,
  env: Record<string, string | undefined> = process.env
): ResolvedSigningKey {
  const candidates: Array<[string | undefined, 'env' | 'config']> = [
    [env.AIRLOCK_SIGNING_KEY, 'env'],
    [configuredKey, 'config'],
  ];
  let key: string | undefined;
  let source: ResolvedSigningKey['source'] = 'dev';
  for (const [value, from] of candidates) {
    const trimmed = value?.trim();
    if (trimmed && !PLACEHOLDER_KEYS.has(trimmed)) {
      key = trimmed;
      source = from;
      break;
    }
  }

  if (!key) {
    if (env.CI && env.CI !== 'false' && env.CI !== '0') {
      throw new Error(
        'No evidence signing key configured. Set AIRLOCK_SIGNING_KEY (or compliance.signingKey) ' +
          'from your CI secrets. The built-in development key is refused when CI is set.'
      );
    }
    key = DEV_SIGNING_KEY;
  }

  const requested = env.AIRLOCK_SIGNING_ALGORITHM?.trim();
  let algorithm: SigningAlgorithm;
  if (requested) {
    if (/^ed25519$/i.test(requested)) algorithm = 'Ed25519';
    else if (/^hmac(-sha256)?$/i.test(requested)) algorithm = 'HMAC-SHA256';
    else throw new Error(`Unsupported AIRLOCK_SIGNING_ALGORITHM "${requested}" (use Ed25519 or HMAC-SHA256)`);
  } else {
    algorithm = key.includes('-----BEGIN') ? 'Ed25519' : 'HMAC-SHA256';
  }

  return { key, source, isDevKey: source === 'dev', algorithm };
}

/** Print a loud warning that evidence is being signed with the development key. */
export function warnDevSigningKey(): void {
  const bar = '!'.repeat(78);
  logger.warn(bar);
  logger.warn('INSECURE DEV SIGNING KEY IN USE: no AIRLOCK_SIGNING_KEY / compliance.signingKey is set.');
  logger.warn('Evidence bundles signed with this key are marked insecureDevKey=true and prove nothing.');
  logger.warn('Set AIRLOCK_SIGNING_KEY to a secret (HMAC) or an Ed25519 PEM private key.');
  logger.warn(bar);
}

export interface AttestationOptions {
  runId?: string;
  signingKey: string;
  /** Defaults to HMAC-SHA256, or Ed25519 when signingKey is a PEM private key. */
  signingAlgorithm?: SigningAlgorithm;
  /** Set when signingKey is the development key; recorded in the signed bundle. */
  insecureDevKey?: boolean;
  outputDir?: string;
  totalSteps: number;
  durationMs: number;
  phantomTokensConfigured: number;
  egressBlockedCount: number;
  egressAllowedCount: number;
  unauthorizedMutationsPrevented: number;
}

export interface VerifyOptions {
  /** HMAC secret, or for Ed25519 a private key / secret whose public key must match the bundle. */
  key?: string;
  /** Ed25519 SPKI PEM public key that the bundle must have been signed with. */
  trustedPublicKey?: string;
}

export interface VerifyResult {
  valid: boolean;
  reason?: string;
  /** Non-fatal caveats, e.g. an unpinned Ed25519 key or the dev key. */
  warnings: string[];
}

type UnsignedBundle = Omit<ComplianceProofBundle, 'signature'>;

function signingInput(bundle: UnsignedBundle): string {
  return SIGNING_CONTEXT + canonicalJson(bundle);
}

function stripSignature(bundle: ComplianceProofBundle): UnsignedBundle {
  const { signature: _sig, ...rest } = bundle;
  return rest;
}

export class AttestationEngine {
  /**
   * Create and sign an execution-evidence bundle. This is not a compliance assessment.
   */
  static generateBundle(ledger: AirlockLedger, options: AttestationOptions): ComplianceProofBundle {
    const chainVerification = ledger.verifyChain();
    if (!chainVerification.valid) {
      throw new Error(`Cannot generate attestation: Ledger chain integrity check failed: ${chainVerification.reason}`);
    }
    if (!options.signingKey) {
      throw new Error('Cannot generate attestation: no signing key provided');
    }

    const algorithm: SigningAlgorithm =
      options.signingAlgorithm ?? (options.signingKey.includes('-----BEGIN') ? 'Ed25519' : 'HMAC-SHA256');
    const insecureDevKey = options.insecureDevKey === true || options.signingKey === DEV_SIGNING_KEY;

    const blocks = JSON.parse(JSON.stringify(ledger.getBlocks()));
    const merkleRoot = ledger.getMerkleRoot();
    const runId = options.runId || deterministicId('run', `${Date.now()}_${merkleRoot}`);

    let publicKey: string | undefined;
    let keyId: string;
    if (algorithm === 'Ed25519') {
      publicKey = ed25519PublicKeyPem(options.signingKey);
      keyId = ed25519KeyId(publicKey);
    } else {
      keyId = `hmac:${sha256(`airlock-key-id:${options.signingKey}`).substring(0, 16)}`;
    }
    if (insecureDevKey) keyId = `INSECURE-DEV-KEY:${keyId}`;

    const unsigned: UnsignedBundle = {
      specVersion: BUNDLE_SPEC_VERSION,
      runId,
      merkleRoot,
      signingAlgorithm: algorithm,
      publicKeyOrKeyId: keyId,
      ...(publicKey ? { publicKey } : {}),
      insecureDevKey,
      timestamp: new Date().toISOString(),
      summary: {
        totalSteps: options.totalSteps,
        passedSteps: null,
        failedSteps: null,
        durationMs: options.durationMs,
        aiTokenCostUsd: null,
      },
      policyAudit: {
        phantomTokensConfigured: options.phantomTokensConfigured,
        realSecretsExposedToSandbox: null,
        egressBlockedCount: options.egressBlockedCount,
        egressAllowedCount: options.egressAllowedCount,
        unauthorizedMutationsPrevented: options.unauthorizedMutationsPrevented,
      },
      soc2Mapping: {
        cc6_1_logicalAccess: 'NOT_ASSESSED',
        cc6_6_boundaryProtection: 'NOT_ASSESSED',
        cc7_1_changeVerification: 'NOT_ASSESSED',
        cc8_1_nonRepudiation: 'NOT_ASSESSED',
      },
      blocksCount: blocks.length,
      ledgerVerificationStatus: 'VALID_CHAIN',
      ledgerBlocks: blocks,
    };

    const input = signingInput(unsigned);
    const signature = algorithm === 'Ed25519' ? signEd25519(input, options.signingKey) : signHmac(input, options.signingKey);
    const bundle: ComplianceProofBundle = { ...unsigned, signature };

    if (options.outputDir) {
      ensureDir(options.outputDir);
      const outPath = path.join(options.outputDir, `attestation-${runId}.json`);
      writeJsonFile(outPath, bundle);
      const latestPath = path.join(options.outputDir, 'latest-attestation.json');
      writeJsonFile(latestPath, bundle);
      logger.moat(4, 'Signed Run-Evidence Bundle Generated', `Merkle Root: ${merkleRoot.substring(0, 16)}... | Saved to ${outPath}`);
    }

    return bundle;
  }

  /**
   * Verify an evidence bundle: spec version, hash chain and Merkle root recomputed
   * from the embedded blocks, internal consistency, and a signature over every field.
   *
   * `keyOrOptions` may be a string (HMAC secret, or Ed25519 key material to pin) or {@link VerifyOptions}.
   */
  static verifyBundle(bundle: ComplianceProofBundle, keyOrOptions?: string | VerifyOptions): VerifyResult {
    const opts: VerifyOptions = typeof keyOrOptions === 'string' ? { key: keyOrOptions } : keyOrOptions ?? {};
    const warnings: string[] = [];
    const fail = (reason: string): VerifyResult => ({ valid: false, reason, warnings });

    if (!bundle || typeof bundle !== 'object') return fail('Bundle is not an object');

    const version = (bundle as { specVersion?: unknown }).specVersion;
    if (version !== BUNDLE_SPEC_VERSION) {
      if (version === '1.0.0') {
        return fail(
          'Unsupported bundle specVersion 1.0.0: v1 bundles signed only the Merkle root and did not include the ledger, ' +
            'so they cannot be verified. Re-run to produce a v2 bundle.'
        );
      }
      return fail(`Unsupported bundle specVersion ${JSON.stringify(version)} (expected ${BUNDLE_SPEC_VERSION})`);
    }

    if (typeof bundle.signature !== 'string' || bundle.signature.length === 0) return fail('Bundle has no signature');
    if (!Array.isArray(bundle.ledgerBlocks)) return fail('Bundle has no ledgerBlocks');

    // 1. Recompute the hash chain from the embedded blocks.
    const chain = AirlockLedger.verifyBlocks(bundle.ledgerBlocks);
    if (!chain.valid) return fail(`Ledger chain invalid: ${chain.reason}`);

    // 2. Recompute the Merkle root.
    const recomputedRoot = new MerkleTree(bundle.ledgerBlocks.map((b) => b.blockHash)).getRoot();
    if (recomputedRoot !== bundle.merkleRoot) {
      return fail(`Merkle root mismatch: bundle says ${bundle.merkleRoot}, ledger blocks give ${recomputedRoot}`);
    }

    // 3. Internal consistency.
    if (bundle.blocksCount !== bundle.ledgerBlocks.length) {
      return fail(`blocksCount ${bundle.blocksCount} does not match ${bundle.ledgerBlocks.length} embedded ledger blocks`);
    }
    if (bundle.ledgerVerificationStatus !== 'VALID_CHAIN') {
      return fail(`ledgerVerificationStatus is ${bundle.ledgerVerificationStatus}`);
    }

    // 4. Signature over every field except `signature`.
    let input: string;
    try {
      input = signingInput(stripSignature(bundle));
    } catch (err) {
      return fail(`Bundle cannot be canonicalised: ${(err as Error).message}`);
    }

    if (bundle.signingAlgorithm === 'HMAC-SHA256') {
      if (!opts.key) return fail('HMAC-SHA256 bundles need the signing key to verify');
      if (!verifyHmac(input, bundle.signature, opts.key)) {
        return fail('Signature mismatch: the bundle was modified or signed with a different key');
      }
    } else if (bundle.signingAlgorithm === 'Ed25519') {
      if (typeof bundle.publicKey !== 'string') return fail('Ed25519 bundle has no publicKey');
      let embeddedPem: string;
      try {
        embeddedPem = ed25519PublicKeyPem(bundle.publicKey);
      } catch {
        return fail('Ed25519 bundle publicKey is not a valid public key');
      }
      if (ed25519KeyId(embeddedPem) !== bundle.publicKeyOrKeyId.replace(/^INSECURE-DEV-KEY:/, '')) {
        return fail('publicKeyOrKeyId does not match the embedded public key');
      }

      let pinned: string | undefined;
      try {
        pinned = opts.trustedPublicKey
          ? ed25519PublicKeyPem(opts.trustedPublicKey)
          : opts.key
            ? ed25519PublicKeyPem(opts.key)
            : undefined;
      } catch {
        return fail('The trusted key supplied for Ed25519 verification is not a valid key');
      }
      if (pinned && pinned !== embeddedPem) {
        return fail('Ed25519 public key in the bundle does not match the trusted public key');
      }
      if (!pinned) {
        warnings.push('Ed25519 public key not pinned: signature checked against the key embedded in the bundle only');
      }
      if (!verifyEd25519(input, bundle.signature, embeddedPem)) {
        return fail('Signature mismatch: the bundle was modified after signing');
      }
    } else {
      return fail(`Unsupported signingAlgorithm ${JSON.stringify((bundle as { signingAlgorithm?: unknown }).signingAlgorithm)}`);
    }

    if (bundle.insecureDevKey) {
      warnings.push('Bundle was signed with the INSECURE development key; it proves nothing about the run');
    }

    return { valid: true, warnings };
  }
}
