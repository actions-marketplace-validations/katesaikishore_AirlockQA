import { sha256Bytes } from '../utils/crypto.js';

export interface MerkleProofStep {
  position: 'left' | 'right';
  hash: string;
}

const LEAF_PREFIX = Buffer.from([0x00]);
const NODE_PREFIX = Buffer.from([0x01]);

/**
 * Binary Merkle tree with RFC 6962-style domain separation:
 *   leaf  = SHA-256(0x00 || utf8(leaf))
 *   inner = SHA-256(0x01 || left || right)
 * An unpaired node at the end of a level is promoted unchanged to the next level
 * (it is never hashed with itself), so [a, b, c] and [a, b, c, c] have different roots.
 * The root of an empty tree is SHA-256 of the empty string.
 */
export class MerkleTree {
  private leaves: string[];
  private layers: string[][];

  constructor(leaves: string[]) {
    this.leaves = [...leaves];
    this.layers = [this.leaves.map((l) => MerkleTree.hashLeaf(l))];
    this.buildTree();
  }

  static hashLeaf(leaf: string): string {
    return sha256Bytes(LEAF_PREFIX, Buffer.from(leaf, 'utf8')).toString('hex');
  }

  static hashNode(left: string, right: string): string {
    return sha256Bytes(NODE_PREFIX, Buffer.from(left, 'hex'), Buffer.from(right, 'hex')).toString('hex');
  }

  private buildTree(): void {
    let currentLayer = this.layers[0];

    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(MerkleTree.hashNode(currentLayer[i], currentLayer[i + 1]));
        } else {
          nextLayer.push(currentLayer[i]);
        }
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  getRoot(): string {
    if (this.leaves.length === 0) return sha256Bytes().toString('hex');
    return this.layers[this.layers.length - 1][0];
  }

  getProof(leafIndex: number): MerkleProofStep[] {
    if (!Number.isInteger(leafIndex) || leafIndex < 0 || leafIndex >= this.leaves.length) {
      throw new Error(`Leaf index ${leafIndex} out of bounds`);
    }

    const proof: MerkleProofStep[] = [];
    let currentIndex = leafIndex;

    for (let layerIdx = 0; layerIdx < this.layers.length - 1; layerIdx++) {
      const layer = this.layers[layerIdx];
      const isRightNode = currentIndex % 2 === 1;
      const pairIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      // An unpaired node is promoted without hashing, so it contributes no proof step.
      if (pairIndex < layer.length) {
        proof.push({
          position: isRightNode ? 'left' : 'right',
          hash: layer[pairIndex],
        });
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  /** Verify that `leaf` (the raw leaf value, not its hash) is included under `root`. */
  static verifyProof(leaf: string, proof: MerkleProofStep[], root: string): boolean {
    let currentHash = MerkleTree.hashLeaf(leaf);

    for (const step of proof) {
      if (!/^[0-9a-f]{64}$/.test(step.hash)) return false;
      currentHash = step.position === 'left'
        ? MerkleTree.hashNode(step.hash, currentHash)
        : MerkleTree.hashNode(currentHash, step.hash);
    }

    return currentHash === root;
  }
}
