import { sha256 } from '../utils/crypto.js';

export interface MerkleProofStep {
  position: 'left' | 'right';
  hash: string;
}

export class MerkleTree {
  private leaves: string[];
  private layers: string[][];

  constructor(leaves: string[]) {
    // If empty leaves, provide a default root
    this.leaves = leaves.length > 0 ? [...leaves] : [sha256('empty_airlock_tree')];
    this.layers = [this.leaves];
    this.buildTree();
  }

  private buildTree(): void {
    let currentLayer = this.layers[0];

    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(sha256(currentLayer[i] + currentLayer[i + 1]));
        } else {
          // Odd leaf: hash with itself or duplicate
          nextLayer.push(sha256(currentLayer[i] + currentLayer[i]));
        }
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  getRoot(): string {
    return this.layers[this.layers.length - 1][0];
  }

  getProof(leafIndex: number): MerkleProofStep[] {
    if (leafIndex < 0 || leafIndex >= this.leaves.length) {
      throw new Error(`Leaf index ${leafIndex} out of bounds`);
    }

    const proof: MerkleProofStep[] = [];
    let currentIndex = leafIndex;

    for (let layerIdx = 0; layerIdx < this.layers.length - 1; layerIdx++) {
      const layer = this.layers[layerIdx];
      const isRightNode = currentIndex % 2 === 1;
      const pairIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      if (pairIndex < layer.length) {
        proof.push({
          position: isRightNode ? 'left' : 'right',
          hash: layer[pairIndex],
        });
      } else {
        proof.push({
          position: 'right',
          hash: layer[currentIndex],
        });
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  static verifyProof(leaf: string, proof: MerkleProofStep[], root: string): boolean {
    let currentHash = leaf;

    for (const step of proof) {
      if (step.position === 'left') {
        currentHash = sha256(step.hash + currentHash);
      } else {
        currentHash = sha256(currentHash + step.hash);
      }
    }

    return currentHash === root;
  }
}

