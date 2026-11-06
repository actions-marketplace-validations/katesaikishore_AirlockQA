import { describe, expect, it } from 'bun:test';
import { MerkleTree } from '../src/compliance/merkle-tree.js';
import { AirlockLedger } from '../src/compliance/ledger.js';
import { AttestationEngine } from '../src/compliance/attestation.js';
import { sha256 } from '../src/utils/crypto.js';

describe('Compliance: Cryptographic Ledger & Audit Bundles', () => {
  it('constructs Merkle tree and verifies inclusion proofs', () => {
    const leaves = [sha256('event_1'), sha256('event_2'), sha256('event_3'), sha256('event_4')];
    const tree = new MerkleTree(leaves);
    const root = tree.getRoot();

    expect(root).toBeDefined();
    expect(root.length).toBe(64); // SHA-256 hex string

    // Verify inclusion proof for leaf 2
    const proof = tree.getProof(2);
    const isLeafValid = MerkleTree.verifyProof(leaves[2], proof, root);
    expect(isLeafValid).toBe(true);

    // Verify tampered leaf fails
    const tamperedLeaf = sha256('tampered_event_2');
    const isTamperedValid = MerkleTree.verifyProof(tamperedLeaf, proof, root);
    expect(isTamperedValid).toBe(false);
  });

  it('maintains tamper-evident hash chain in AirlockLedger', () => {
    const ledger = new AirlockLedger();

    ledger.append('ACTION_DISPATCH', { action: 'click', selector: '#checkout' });
    ledger.append('SECRET_SWAP', { phantom: 'ph_sec_1', host: 'api.stripe.com' });
    ledger.append('CHECKPOINT_SAVED', { name: 'post_auth' });

    const verification = ledger.verifyChain();
    expect(verification.valid).toBe(true);

    const blocks = ledger.getBlocks();
    expect(blocks.length).toBe(4); // Genesis + 3 appended blocks
  });

  it('detects tampering immediately if an audit block is modified', () => {
    const ledger = new AirlockLedger();

    ledger.append('ACTION_DISPATCH', { action: 'click', selector: '#checkout' });
    ledger.append('EGRESS_BLOCKED', { url: 'https://webhook.site/leak' });

    // Simulate attacker modifying ledger history
    const blocks = ledger.getBlocks();
    (blocks[1].payload as any).action = 'tampered_action';

    const verification = ledger.verifyChain();
    expect(verification.valid).toBe(false);
    expect(verification.reason).toContain('tampered with');
  });

  it('generates and cryptographically verifies attestation bundles', () => {
    const ledger = new AirlockLedger();
    ledger.append('ACTION_DISPATCH', { action: 'checkout' });

    const signingKey = 'enterprise-audit-secret-key-32-chars!';

    const bundle = AttestationEngine.generateBundle(ledger, {
      signingKey,
      totalSteps: 1,
      passedSteps: 1,
      durationMs: 450,
      phantomTokensConfigured: 1,
      egressBlockedCount: 1,
      egressAllowedCount: 2,
      unauthorizedMutationsPrevented: 1,
    });

    expect(bundle.merkleRoot).toBeDefined();
    expect(bundle.signature).toBeDefined();
    expect(bundle.policyAudit.realSecretsExposedToSandbox).toBe(0);

    // Verify bundle
    const verifyResult = AttestationEngine.verifyBundle(bundle, signingKey);
    expect(verifyResult.valid).toBe(true);

    // Verify with invalid key fails
    const invalidVerifyResult = AttestationEngine.verifyBundle(bundle, 'wrong-key');
    expect(invalidVerifyResult.valid).toBe(false);
  });
});

