import type { LedgerBlock } from '../types/index.js';
import { canonicalJson, sha256 } from '../utils/crypto.js';
import { MerkleTree } from './merkle-tree.js';
import { logger } from '../utils/logger.js';

export class AirlockLedger {
  private blocks: LedgerBlock[] = [];
  static readonly GENESIS_PREVIOUS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
  private genesisHash = AirlockLedger.GENESIS_PREVIOUS_HASH;

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

  /**
   * Hash every field of a block (except blockHash) using canonical JSON, so nested
   * payload fields at any depth are covered.
   */
  static computeBlockHash(block: Omit<LedgerBlock, 'blockHash'>): string {
    return sha256(
      canonicalJson({
        v: 2,
        index: block.index,
        timestamp: block.timestamp,
        type: block.type,
        payload: block.payload,
        previousHash: block.previousHash,
      })
    );
  }

  private computeBlockHash(block: Omit<LedgerBlock, 'blockHash'>): string {
    return AirlockLedger.computeBlockHash(block);
  }

  append(type: LedgerBlock['type'], payload: Record<string, unknown>): LedgerBlock {
    const prevBlock = this.blocks[this.blocks.length - 1];
    const index = this.blocks.length;
    const timestamp = new Date().toISOString();
    // Detach from the caller's object and normalise to plain JSON (e.g. NaN -> null),
    // so the stored payload is exactly what gets hashed and exported.
    payload = JSON.parse(JSON.stringify(payload ?? {}));

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
    return AirlockLedger.verifyBlocks(this.blocks);
  }

  /**
   * Verify a hash chain from a list of blocks (e.g. blocks embedded in an evidence bundle).
   */
  static verifyBlocks(blocks: LedgerBlock[]): { valid: boolean; tamperedIndex?: number; reason?: string } {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return { valid: false, reason: 'Ledger has no blocks' };
    }
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      if (block.index !== i) {
        return { valid: false, tamperedIndex: i, reason: `Block at position ${i} has index ${block.index}` };
      }

      // 1. Verify previous hash pointer
      if (i === 0) {
        if (block.previousHash !== AirlockLedger.GENESIS_PREVIOUS_HASH) {
          return { valid: false, tamperedIndex: 0, reason: 'Genesis previousHash is corrupted' };
        }
      } else {
        const expectedPrevHash = blocks[i - 1].blockHash;
        if (block.previousHash !== expectedPrevHash) {
          return {
            valid: false,
            tamperedIndex: i,
            reason: `Broken chain pointer at block ${i}: expected previousHash ${expectedPrevHash}, found ${block.previousHash}`,
          };
        }
      }

      // 2. Verify block hash calculation
      let computedHash: string;
      try {
        computedHash = AirlockLedger.computeBlockHash(block);
      } catch (err) {
        return { valid: false, tamperedIndex: i, reason: `Block ${i} cannot be hashed: ${(err as Error).message}` };
      }
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
