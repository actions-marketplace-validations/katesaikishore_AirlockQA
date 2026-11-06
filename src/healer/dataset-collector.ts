import * as path from 'node:path';
import type { MutationDatasetEntry } from '../types/index.js';
import { appendJsonlFile, ensureDir, readJsonlFile } from '../utils/files.js';
import { deterministicId } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export class DatasetCollector {
  private datasetFilePath: string;

  constructor(datasetDir = './.airlock/dataset') {
    ensureDir(datasetDir);
    this.datasetFilePath = path.join(datasetDir, 'mutations.jsonl');
  }

  recordMutation(entry: Omit<MutationDatasetEntry, 'id' | 'timestamp'>): MutationDatasetEntry {
    const fullEntry: MutationDatasetEntry = {
      id: deterministicId('mut', Date.now()),
      timestamp: new Date().toISOString(),
      ...entry,
    };

    appendJsonlFile(this.datasetFilePath, fullEntry);
    logger.info(`Compounding Dataset: Logged UI mutation patch ${fullEntry.id} (${(fullEntry.confidence * 100).toFixed(1)}% confidence)`);
    return fullEntry;
  }

  getAllEntries(): MutationDatasetEntry[] {
    return readJsonlFile<MutationDatasetEntry>(this.datasetFilePath);
  }

  getStats(): {
    totalMutations: number;
    avgConfidence: number;
    methodsBreakdown: Record<string, number>;
    frameworksBreakdown: Record<string, number>;
  } {
    const entries = this.getAllEntries();
    if (entries.length === 0) {
      return {
        totalMutations: 0,
        avgConfidence: 0,
        methodsBreakdown: {},
        frameworksBreakdown: {},
      };
    }

    const methodsBreakdown: Record<string, number> = {};
    const frameworksBreakdown: Record<string, number> = {};
    let totalConf = 0;

    for (const e of entries) {
      totalConf += e.confidence;
      methodsBreakdown[e.resolutionMethod] = (methodsBreakdown[e.resolutionMethod] || 0) + 1;
      const fw = e.frameworkDetected || 'generic';
      frameworksBreakdown[fw] = (frameworksBreakdown[fw] || 0) + 1;
    }

    return {
      totalMutations: entries.length,
      avgConfidence: Number((totalConf / entries.length).toFixed(3)),
      methodsBreakdown,
      frameworksBreakdown,
    };
  }
}

