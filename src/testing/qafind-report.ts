/**
 * Shared manifest written by the QAFind Playwright reporter and read by `qafind flake`.
 *
 * This is the attach path: an existing Playwright suite keeps its specs; the reporter records
 * each test's outcome, retries and error text into `.qafind/reports/<runId>.json`, and `flake`
 * aggregates many runs into a per-test verdict with an owner and a probable cause.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

export const QAFIND_REPORT_VERSION = 1 as const;

export type QAFindTestStatus = 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted';

export interface QAFindReportTest {
  /** Stable key within a run: `${project}::${file}::${titleChain}`. */
  id: string;
  title: string;
  /** Full title including parent describes, for display. */
  titlePath: string[];
  file: string;
  project: string;
  status: QAFindTestStatus;
  /** Retry attempts (0 = passed first time). */
  retries: number;
  durationMs: number;
  /** Error messages only; no bodies, headers or credentials. */
  errors: string[];
  /** Optional attachments named by the reporter (traces, screenshots), as paths. */
  attachments?: { name: string; path?: string; contentType?: string }[];
}

export interface QAFindRunReport {
  version: typeof QAFIND_REPORT_VERSION;
  tool: 'qafind-reporter';
  runId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  cwd?: string;
  /** Reporter config captured from the playwright config, for flake grouping. */
  projects?: string[];
  tests: QAFindReportTest[];
}

export function isQAFindRunReport(value: unknown): value is QAFindRunReport {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    record.version === QAFIND_REPORT_VERSION &&
    record.tool === 'qafind-reporter' &&
    typeof record.runId === 'string' &&
    Array.isArray(record.tests)
  );
}

export function writeRunReport(dir: string, report: QAFindRunReport): string {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${report.runId}.json`);
  fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n');
  return file;
}

/** Read every report file in a directory (newest first), skipping malformed files. */
export function readRunReports(dirOrFiles: string | string[]): QAFindRunReport[] {
  const files = Array.isArray(dirOrFiles)
    ? dirOrFiles
    : fs.existsSync(dirOrFiles) && fs.statSync(dirOrFiles).isDirectory()
      ? fs.readdirSync(dirOrFiles).filter((name) => name.endsWith('.json')).map((name) => path.join(dirOrFiles, name))
      : [dirOrFiles];
  const reports: QAFindRunReport[] = [];
  for (const file of files) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
      if (isQAFindRunReport(parsed)) reports.push(parsed);
    } catch {
      // A truncated report from a killed CI job is not evidence; skip it.
    }
  }
  return reports.sort((a, b) => (a.startedAt < b.startedAt ? 1 : a.startedAt > b.startedAt ? -1 : 0));
}
