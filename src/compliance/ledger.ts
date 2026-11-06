import type { LedgerBlock } from '../types/index.js';
import { sha256 } from '../utils/crypto.js';
import { MerkleTree } from './merkle-tree.js';
import { logger } from '../utils/logger.js';

export class AirlockLedger {
  private blocks: LedgerBlock[] = [];
  private genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor() {
    this.initGenesis();
  }

  private initGenesis(): void {
    const genesisBlock: LedgerBlock = {
      index: 0,
      timestamp: new Date().toISOString(),
      type: 'EXEC_START',
      payload: { system: 'AirlockQA Cryptographic Ledger Initialized' },
      previousHash: this.genesisHash,
      blockHash: '',
    };
    genesisBlock.blockHash = this.computeBlockHash(genesisBlock);
    this.blocks.push(genesisBlock);
  }

  private computeBlockHash(block: Omit<LedgerBlock, 'blockHash'>): string {
    const payloadStr = JSON.stringify(block.payload, Object.keys(block.payload).sort());
    return sha256(`${block.index}:${block.timestamp}:${block.type}:${payloadStr}:${block.previousHash}`);
  }

  append(type: LedgerBlock['type'], payload: Record<string, unknown>): LedgerBlock {
    const prevBlock = this.blocks[this.blocks.length - 1];
    const index = this.blocks.length;
    const timestamp = new Date().toISOString();

    const blockWithoutHash: Omit<LedgerBlock, 'blockHash'> = {
      index,
      timestamp,
      type,
      payload,
      previousHash: prevBlock.blockHash,
    };

    const blockHash = this.computeBlockHash(blockWithoutHash);
    const newBlock: LedgerBlock = {
      ...blockWithoutHash,
      blockHash,
    };

    this.blocks.push(newBlock);
    return newBlock;
  }

  getBlocks(): LedgerBlock[] {
    return [...this.blocks];
  }

  getBlockHashes(): string[] {
    return this.blocks.map((b) => b.blockHash);
  }

  getMerkleTree(): MerkleTree {
    return new MerkleTree(this.getBlockHashes());
  }

  getMerkleRoot(): string {
    return this.getMerkleTree().getRoot();
  }

  /**
   * Verify the integrity of the entire cryptographic hash chain
   */
  verifyChain(): { valid: boolean; tamperedIndex?: number; reason?: string } {
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];

      // 1. Verify previous hash pointer
      if (i === 0) {
        if (block.previousHash !== this.genesisHash) {
          return { valid: false, tamperedIndex: 0, reason: 'Genesis previousHash is corrupted' };
        }
      } else {
        const expectedPrevHash = this.blocks[i - 1].blockHash;
        if (block.previousHash !== expectedPrevHash) {
          return {
            valid: false,
            tamperedIndex: i,
            reason: `Broken chain pointer at block ${i}: expected previousHash ${expectedPrevHash}, found ${block.previousHash}`,
          };
        }
      }

      // 2. Verify block hash calculation
      const computedHash = this.computeBlockHash(block);
      if (computedHash !== block.blockHash) {
        return {
          valid: false,
          tamperedIndex: i,
          reason: `Block payload at index ${i} has been tampered with: expected hash ${computedHash}, found ${block.blockHash}`,
        };
      }
    }

    return { valid: true };
  }
}

