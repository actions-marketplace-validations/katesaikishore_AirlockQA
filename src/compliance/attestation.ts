import * as path from 'node:path';
import type { AirlockLedger } from './ledger.js';
import type { ComplianceProofBundle } from '../types/index.js';
import { signHmac, verifyHmac, deterministicId } from '../utils/crypto.js';
import { ensureDir, writeJsonFile, readJsonFile } from '../utils/files.js';
import { logger } from '../utils/logger.js';

export interface AttestationOptions {
  runId?: string;
  signingKey: string;
  outputDir?: string;
  totalSteps: number;
  durationMs: number;
  phantomTokensConfigured: number;
  egressBlockedCount: number;
  egressAllowedCount: number;
  unauthorizedMutationsPrevented: number;
}

export class AttestationEngine {
  /**
   * Create and sign an execution-evidence bundle. This is not a compliance assessment.
   */
  static generateBundle(
    ledger: AirlockLedger,
    options: AttestationOptions
  ): ComplianceProofBundle {
    const chainVerification = ledger.verifyChain();
    if (!chainVerification.valid) {
      throw new Error(`Cannot generate attestation: Ledger chain integrity check failed: ${chainVerification.reason}`);
    }

    const merkleRoot = ledger.getMerkleRoot();
    const signature = signHmac(merkleRoot, options.signingKey);
    const runId = options.runId || deterministicId('run', Date.now());

    const bundle: ComplianceProofBundle = {
      specVersion: '1.0.0',
      runId,
      merkleRoot,
      signature,
      signingAlgorithm: 'HMAC-SHA256',
      publicKeyOrKeyId: 'airlock-signer-key-id-01',
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
      blocksCount: ledger.getBlocks().length,
      ledgerVerificationStatus: 'VALID_CHAIN',
    };

    if (options.outputDir) {
      ensureDir(options.outputDir);
      const outPath = path.join(options.outputDir, `attestation-${runId}.json`);
      writeJsonFile(outPath, bundle);
      const latestPath = path.join(options.outputDir, 'latest-attestation.json');
      writeJsonFile(latestPath, bundle);
      logger.moat(4, 'Cryptographic Attestation Bundle Generated', `Signed Merkle Root: ${merkleRoot.substring(0, 16)}... | Saved to ${outPath}`);
    }

    return bundle;
  }

  /**
   * Cryptographically verify an attestation proof bundle
   */
  static verifyBundle(bundle: ComplianceProofBundle, signingKey: string): {
    valid: boolean;
    reason?: string;
  } {
    const signatureValid = verifyHmac(bundle.merkleRoot, bundle.signature, signingKey);
    if (!signatureValid) {
      return {
        valid: false,
        reason: 'Cryptographic signature mismatch: bundle has been modified or signed with a different key',
      };
    }

    return { valid: true };
  }
}

