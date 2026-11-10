import { describe, expect, it, afterEach } from 'bun:test';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { QAFindLedger } from '../src/compliance/ledger.js';
import { MerkleTree } from '../src/compliance/merkle-tree.js';
import { AttestationEngine, resolveSigningKey, DEV_SIGNING_KEY } from '../src/compliance/attestation.js';
import { HtmlReporter } from '../src/compliance/html-reporter.js';
import { canonicalJson, sha256 } from '../src/utils/crypto.js';
import type { ComplianceProofBundle, InterceptedRequest } from '../src/types/index.js';

const KEY = 'unit-test-hmac-key-0123456789abcdef';

function baseOptions(signingKey = KEY) {
  return {
    signingKey,
    totalSteps: 2,
    durationMs: 100,
    phantomTokensConfigured: 1,
    egressBlockedCount: 1,
    egressAllowedCount: 3,
    unauthorizedMutationsPrevented: 1,
  };
}

function sampleLedger(): QAFindLedger {
  const ledger = new QAFindLedger();
  ledger.append('ACTION_DISPATCH', { action: 'goto', meta: { url: 'https://a.test/x', tags: ['a', { k: 1 }] } });
  ledger.append('EGRESS_BLOCKED', { request: { host: 'evil.test', headers: { auth: 'ph_1' } } });
  return ledger;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

describe('canonicalJson', () => {
  it('sorts keys at every depth and keeps nested values', () => {
    const a = canonicalJson({ b: 1, a: { d: [1, { z: 1, y: 2 }], c: 'x' } });
    const b = canonicalJson({ a: { c: 'x', d: [1, { y: 2, z: 1 }] }, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":{"c":"x","d":[1,{"y":2,"z":1}]},"b":1}');
  });

  it('distinguishes nested values', () => {
    expect(canonicalJson({ m: { url: 'a' } })).not.toBe(canonicalJson({ m: { url: 'b' } }));
  });

  it('drops undefined object members like JSON and rejects non-finite numbers', () => {
    expect(canonicalJson({ a: undefined, b: null })).toBe('{"b":null}');
    expect(() => canonicalJson({ n: NaN })).toThrow();
  });
});

describe('Ledger: nested payload fields are hashed', () => {
  it('detects tampering of a nested payload field', () => {
    const ledger = sampleLedger();
    const rootBefore = ledger.getMerkleRoot();
    const blocks = ledger.getBlocks();
    (blocks[1].payload as any).meta.url = 'https://attacker.test/';
    expect(ledger.verifyChain().valid).toBe(false);
    expect(ledger.verifyChain().tamperedIndex).toBe(1);
    // Root over block hashes is unchanged only because block hashes are stored; recomputation must flag it.
    expect(QAFindLedger.verifyBlocks(blocks).valid).toBe(false);
    expect(rootBefore).toHaveLength(64);
  });

  it('detects tampering inside nested arrays', () => {
    const ledger = sampleLedger();
    (ledger.getBlocks()[1].payload as any).meta.tags[1].k = 2;
    expect(ledger.verifyChain().valid).toBe(false);
  });
});

describe('MerkleTree: domain separation and odd leaves', () => {
  const leaves = ['l1', 'l2', 'l3', 'l4', 'l5'].map((l) => sha256(l));

  it('verifies inclusion proofs for every leaf of an odd-sized tree', () => {
    const tree = new MerkleTree(leaves);
    for (let i = 0; i < leaves.length; i++) {
      expect(MerkleTree.verifyProof(leaves[i], tree.getProof(i), tree.getRoot())).toBe(true);
    }
  });

  it('does not let a tree with a duplicated last leaf share a root', () => {
    const three = new MerkleTree(leaves.slice(0, 3));
    const fourDup = new MerkleTree([...leaves.slice(0, 3), leaves[2]]);
    expect(three.getRoot()).not.toBe(fourDup.getRoot());
  });

  it('separates leaf hashes from inner-node hashes', () => {
    const [a, b] = leaves;
    const two = new MerkleTree([a, b]);
    // An inner node presented as a leaf must not reproduce the root.
    expect(MerkleTree.hashLeaf(a)).not.toBe(a);
    expect(new MerkleTree([two.getRoot()]).getRoot()).not.toBe(two.getRoot());
    expect(MerkleTree.hashNode(MerkleTree.hashLeaf(a), MerkleTree.hashLeaf(b))).toBe(two.getRoot());
    expect(MerkleTree.verifyProof(two.getRoot(), [], two.getRoot())).toBe(false);
  });

  it('rejects a proof for a tampered leaf', () => {
    const tree = new MerkleTree(leaves);
    expect(MerkleTree.verifyProof(sha256('nope'), tree.getProof(4), tree.getRoot())).toBe(false);
  });
});

describe('Attestation v2: signature covers the whole bundle', () => {
  it('produces a v2 bundle with the ledger blocks inline', () => {
    const bundle = AttestationEngine.generateBundle(sampleLedger(), baseOptions());
    expect(bundle.specVersion).toBe('2.0.0');
    expect(bundle.ledgerBlocks.length).toBe(3);
    expect(bundle.blocksCount).toBe(3);
    expect(AttestationEngine.verifyBundle(bundle, KEY).valid).toBe(true);
  });

  const tamperCases: Array<[string, (b: any) => void]> = [
    ['summary.durationMs', (b) => { b.summary.durationMs = 1; }],
    ['policyAudit.egressBlockedCount', (b) => { b.policyAudit.egressBlockedCount = 99; }],
    ['runId', (b) => { b.runId = 'run_other'; }],
    ['timestamp', (b) => { b.timestamp = '2000-01-01T00:00:00.000Z'; }],
    ['soc2Mapping', (b) => { b.soc2Mapping.cc6_1_logicalAccess = 'COMPLIANT'; }],
    ['nested ledger payload', (b) => { b.ledgerBlocks[1].payload.meta.url = 'https://x.test'; }],
    ['added top-level field', (b) => { b.extra = 'injected'; }],
    ['dropped ledger block', (b) => { b.ledgerBlocks.pop(); }],
  ];

  for (const [name, mutate] of tamperCases) {
    it(`rejects a bundle whose ${name} was modified`, () => {
      const bundle = clone(AttestationEngine.generateBundle(sampleLedger(), baseOptions()));
      mutate(bundle);
      const result = AttestationEngine.verifyBundle(bundle, KEY);
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
    });
  }

  it('rejects a re-hashed ledger whose block hashes and merkle root were recomputed but not re-signed', () => {
    const bundle = clone(AttestationEngine.generateBundle(sampleLedger(), baseOptions()));
    bundle.ledgerBlocks[1].payload.meta.url = 'https://x.test';
    // attacker recomputes the chain and root
    for (let i = 0; i < bundle.ledgerBlocks.length; i++) {
      const blk = bundle.ledgerBlocks[i];
      if (i > 0) blk.previousHash = bundle.ledgerBlocks[i - 1].blockHash;
      blk.blockHash = QAFindLedger.computeBlockHash(blk);
    }
    bundle.merkleRoot = new MerkleTree(bundle.ledgerBlocks.map((b: any) => b.blockHash)).getRoot();
    const result = AttestationEngine.verifyBundle(bundle, KEY);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/signature/i);
  });

  it('rejects the wrong HMAC key', () => {
    const bundle = AttestationEngine.generateBundle(sampleLedger(), baseOptions());
    expect(AttestationEngine.verifyBundle(bundle, 'another-key-abcdefghijklmnop').valid).toBe(false);
  });

  it('clearly rejects v1 bundles', () => {
    const bundle = clone(AttestationEngine.generateBundle(sampleLedger(), baseOptions())) as any;
    bundle.specVersion = '1.0.0';
    const result = AttestationEngine.verifyBundle(bundle, KEY);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('1.0.0');
  });
});

describe('Attestation v2: Ed25519', () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  const pubPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();

  it('signs with Ed25519 and verifies against a pinned public key', () => {
    const bundle = AttestationEngine.generateBundle(sampleLedger(), {
      ...baseOptions(privPem),
      signingAlgorithm: 'Ed25519',
    });
    expect(bundle.signingAlgorithm).toBe('Ed25519');
    expect(bundle.publicKey).toContain('BEGIN PUBLIC KEY');
    expect(bundle.publicKeyOrKeyId).toMatch(/^ed25519:/);
    expect(AttestationEngine.verifyBundle(bundle, { trustedPublicKey: pubPem }).valid).toBe(true);
    // Verifying with the private key also pins the derived public key
    expect(AttestationEngine.verifyBundle(bundle, privPem).valid).toBe(true);
  });

  it('rejects an Ed25519 bundle re-signed with a different key when a public key is pinned', () => {
    const other = crypto.generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    const bundle = AttestationEngine.generateBundle(sampleLedger(), { ...baseOptions(other), signingAlgorithm: 'Ed25519' });
    const result = AttestationEngine.verifyBundle(bundle, { trustedPublicKey: pubPem });
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/public key/i);
  });

  it('rejects a tampered Ed25519 bundle', () => {
    const bundle = clone(AttestationEngine.generateBundle(sampleLedger(), { ...baseOptions(privPem), signingAlgorithm: 'Ed25519' }));
    bundle.summary.totalSteps = 42;
    expect(AttestationEngine.verifyBundle(bundle, { trustedPublicKey: pubPem }).valid).toBe(false);
  });

  it('derives an Ed25519 key from a plain secret', () => {
    const bundle = AttestationEngine.generateBundle(sampleLedger(), { ...baseOptions(KEY), signingAlgorithm: 'Ed25519' });
    expect(AttestationEngine.verifyBundle(bundle, KEY).valid).toBe(true);
    expect(AttestationEngine.verifyBundle(bundle, 'other-secret-xxxxxxxxxxxxxxxx').valid).toBe(false);
  });
});

describe('Signing key resolution', () => {
  it('uses a configured key', () => {
    const r = resolveSigningKey('my-real-key-123456789012345678', {});
    expect(r.key).toBe('my-real-key-123456789012345678');
    expect(r.isDevKey).toBe(false);
  });

  it('prefers QAFIND_SIGNING_KEY from the environment', () => {
    const r = resolveSigningKey('cfg-key-aaaaaaaaaaaaaaaaaaaaaa', { QAFIND_SIGNING_KEY: 'env-key-bbbbbbbbbbbbbbbbbbbbb' });
    expect(r.key).toBe('env-key-bbbbbbbbbbbbbbbbbbbbb');
  });

  it('fails in CI when no key is configured, including the schema placeholder', () => {
    expect(() => resolveSigningKey(undefined, { CI: 'true' })).toThrow(/signing key/i);
    expect(() => resolveSigningKey('qafind-dev-signing-key-32-chars-long!', { CI: '1' })).toThrow(/signing key/i);
  });

  it('falls back to a labelled dev key locally', () => {
    const r = resolveSigningKey(undefined, {});
    expect(r.isDevKey).toBe(true);
    expect(r.key).toBe(DEV_SIGNING_KEY);
    expect(DEV_SIGNING_KEY).toMatch(/INSECURE/);
  });

  it('marks bundles signed with the dev key', () => {
    const bundle = AttestationEngine.generateBundle(sampleLedger(), { ...baseOptions(DEV_SIGNING_KEY), insecureDevKey: true });
    expect(bundle.insecureDevKey).toBe(true);
    expect(bundle.publicKeyOrKeyId).toContain('INSECURE-DEV-KEY');
  });

  it('no hardcoded fallback signing strings remain in the runner or the audit command', () => {
    const root = path.resolve(import.meta.dir, '..');
    const runner = fs.readFileSync(path.join(root, 'src/runner/qafind-runner.ts'), 'utf8');
    const cli = fs.readFileSync(path.join(root, 'bin/qafind.ts'), 'utf8');
    const auditStart = cli.indexOf(".command('audit");
    const audit = cli.slice(auditStart, cli.indexOf('// COMMAND:', auditStart));
    expect(auditStart).toBeGreaterThan(0);
    for (const src of [runner, audit]) {
      expect(src).not.toContain('qafind-default-signing-key');
      expect(src).not.toContain('qafind-hmac-master-key-32-chars-long!');
      expect(src).not.toContain('COMPLIANT');
      expect(src).not.toContain('VERIFIED');
    }
  });

  it('treats the sample/schema placeholder keys as unset', () => {
    for (const placeholder of ['qafind-hmac-master-key-32-chars-long!', 'qafind-dev-signing-key-32-chars-long!']) {
      expect(resolveSigningKey(placeholder, {}).isDevKey).toBe(true);
    }
  });
});

describe('HtmlReporter escaping', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qafind-html-'));
  afterEach(() => {});

  it('escapes request paths, hosts, reasons, tokens and ledger payloads', () => {
    const ledger = new QAFindLedger();
    ledger.append('EGRESS_BLOCKED', { note: '<img src=x onerror=alert(1)>' });
    const bundle = AttestationEngine.generateBundle(ledger, { ...baseOptions(), runId: 'run_<b>x</b>' });
    const req: InterceptedRequest = {
      id: 'r1',
      timestamp: new Date().toISOString(),
      url: 'https://evil.test/<script>alert(1)</script>',
      method: 'GET',
      headers: {},
      host: 'evil.test"><svg onload=alert(1)>',
      path: '/<script>alert(1)</script>',
      phantomTokensDetected: ['<script>tok</script>'],
      realTokensSwapped: [],
      policyVerdict: 'BLOCKED',
      policyReason: '<script>reason</script>',
    };
    const out = path.join(dir, 'report.html');
    HtmlReporter.generateReport({ bundle, ledgerBlocks: ledger.getBlocks(), networkRequests: [req] }, out);
    const html = fs.readFileSync(out, 'utf8');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<svg onload');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<b>x</b>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&lt;script&gt;reason&lt;/script&gt;');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

export type { ComplianceProofBundle };

describe('QAFindLedger.fromBlocks', () => {
  it('rebuilds a ledger from valid blocks and keeps the Merkle root', () => {
    const original = new QAFindLedger();
    original.append('ACTION_DISPATCH', { action: 'goto', target: 'https://example.com' });
    original.append('PROXY_INTERCEPT', { url: 'https://example.com/', method: 'GET', verdict: 'ALLOWED' });
    const rebuilt = QAFindLedger.fromBlocks(original.getBlocks());
    expect(rebuilt.getMerkleRoot()).toBe(original.getMerkleRoot());
    expect(rebuilt.verifyChain().valid).toBe(true);
  });

  it('rejects blocks whose payload was changed', () => {
    const original = new QAFindLedger();
    original.append('ACTION_DISPATCH', { action: 'goto', target: 'https://example.com' });
    const blocks = JSON.parse(JSON.stringify(original.getBlocks()));
    blocks[1].payload.target = 'https://evil.example';
    expect(() => QAFindLedger.fromBlocks(blocks)).toThrow(/Cannot rebuild ledger/);
  });

  it('rejects an empty block list', () => {
    expect(() => QAFindLedger.fromBlocks([])).toThrow(/Cannot rebuild ledger/);
  });
});
