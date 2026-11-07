import { createHash } from 'node:crypto';
import { QA_FINDING_ORIGINS, QA_FINDING_SEVERITIES } from '../../cloud/shared/contract.js';

/** Fixed rule table: each finding class has exactly one severity (plan-v2 change 12). Never free text. */
const RULES = {
  destructive_action_taken: 'S1', // a control the denylist forbids was activated
  data_mismatch: 'S1', // e.g. a total that disagrees with its line items
  duplicate_side_effect: 'S1', // e.g. a retried checkout creating a second order
  http_5xx: 'S2',
  uncaught_exception: 'S2',
  broken_flow: 'S2',
  console_error: 'S3',
  dead_link: 'S3',
  missing_security_header: 'S3',
  insecure_cookie: 'S3',
  layout_break: 'S3',
  missing_alt: 'S4',
  oversized_asset: 'S4',
  no_loading_state: 'S4',
} as const;

export const FINDING_CLASSES = Object.keys(RULES) as Array<keyof typeof RULES>;
export const FINDING_STATUSES = ['new', 'repeated', 'fixed-since-last'] as const;

export function severityFor(klass: string): string {
  if (!(klass in RULES)) throw new Error(`unknown finding class: ${klass}`);
  return RULES[klass as keyof typeof RULES];
}

/**
 * Stable identity of a bug across runs: class + assertion + route with query strings, fragments and numeric ids
 * removed (so /orders/1001 and /orders/2002 are the same bug). Does not depend on the run, the sha or the time.
 */
export function fingerprint(f: { klass: string; assertion: string; route: string }): string {
  const route = f.route.split(/[?#]/)[0].replace(/\/\d+(?=\/|$)/g, '/:id');
  return createHash('sha256').update(`${f.klass}\n${f.assertion}\n${route}`).digest('hex').slice(0, 16);
}

export interface FindingInput {
  id: string;
  klass: string;
  origin: string;
  route: string;
  assertion: string;
  buildSha: string;
  severity: string;
  firstSeenRun: string;
  status: string;
}

export function validateFinding(f: FindingInput): { ok: true } | { ok: false; reason: string } {
  if (!f.id) return { ok: false, reason: 'id is required' };
  if (!(f.klass in RULES)) return { ok: false, reason: `unknown class ${f.klass}` };
  if (!(QA_FINDING_ORIGINS as readonly string[]).includes(f.origin)) return { ok: false, reason: 'origin must be one of the closed list' };
  if (!(QA_FINDING_SEVERITIES as readonly string[]).includes(f.severity)) return { ok: false, reason: 'severity must be S1 to S4' };
  if (f.severity !== severityFor(f.klass)) return { ok: false, reason: `severity for ${f.klass} must be ${severityFor(f.klass)}` };
  if (!(FINDING_STATUSES as readonly string[]).includes(f.status)) return { ok: false, reason: 'unknown status' };
  if (!/^[0-9a-f]{40}$/.test(f.buildSha ?? '')) return { ok: false, reason: 'a finding must be tied to a full build sha' };
  if (!f.route || !f.assertion || !f.firstSeenRun) return { ok: false, reason: 'route, assertion and firstSeenRun are required' };
  return { ok: true };
}
