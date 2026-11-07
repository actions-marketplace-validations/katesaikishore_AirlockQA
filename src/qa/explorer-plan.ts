/**
 * The exploration planner: decides which controls the crawler may act on, and in what order. It drives nothing itself;
 * the browser driver (agent-browser) carries out the plan. Everything here is deterministic for a given seed, so a
 * finding can be replayed by replaying its seed.
 */
export interface UiElement {
  ref: string;
  role: string;
  name: string;
  /** The element's test id, if the app sets one. Checked against the denylist too. */
  testId?: string;
  /** For form fields: the HTML input type (email, number, text, ...). */
  inputType?: string;
}

export interface PlannedAction {
  ref: string;
  kind: 'click' | 'fill';
  value?: string;
}

export interface ExplorationPlan {
  seed: number;
  actions: PlannedAction[];
  skipped: Array<{ ref: string; reason: string }>;
}

/** Words that name controls with side effects. A match means the control is never acted on, unless explicitly allowed. */
export const DEFAULT_DENY: RegExp[] = [
  /\bdelete\b/i,
  /\bremove\b/i,
  /\bwipe\b/i,
  /\bdeactivate\b/i,
  /\bcancel\b/i,
  /\bpay\b/i,
  /\bpurchase\b/i,
  /\bbuy\b/i,
  /\bcheckout\b/i,
  /\bplace order\b/i,
  /\bsubmit order\b/i,
  /\bsend\b/i,
  /\bpublish\b/i,
  /\btransfer\b/i,
  /\brefund\b/i,
];

const FILL_VALUES: Record<string, string> = {
  email: 'qa.user@example.test',
  number: '3',
  tel: '+15555550100',
  url: 'https://example.test/',
  date: '2026-01-15',
};
const DEFAULT_FILL = 'QA sample text';

/**
 * Value typed into password fields of the app under test. Derived from the plan seed, so a plan stays reproducible
 * and no fixed password-like literal sits in the source. It is never a real credential.
 */
function passwordFillFor(seed: number): string {
  return `qa-fill-${(seed >>> 0).toString(36)}-Aa1`;
}

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0x100000000;
  };
}

export function planExploration(
  elements: UiElement[],
  opts: { seed: number; maxActions: number; allow?: string[]; deny?: RegExp[] }
): ExplorationPlan {
  const deny = opts.deny ?? DEFAULT_DENY;
  const allow = new Set((opts.allow ?? []).map((x) => x.toLowerCase()));
  const skipped: Array<{ ref: string; reason: string }> = [];
  const candidates: UiElement[] = [];
  for (const e of elements) {
    const label = `${e.name} ${e.testId ?? ''}`.trim();
    if (!allow.has(e.name.toLowerCase()) && deny.some((re) => re.test(label))) {
      skipped.push({ ref: e.ref, reason: 'denylist: destructive or side-effecting control' });
      continue;
    }
    candidates.push(e);
  }
  // Deterministic shuffle: the same seed always gives the same order.
  const r = rng(opts.seed);
  const order = [...candidates];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const actions: PlannedAction[] = order.slice(0, Math.max(0, opts.maxActions)).map((e) => {
    if (e.role === 'textbox' || e.inputType !== undefined) {
      const value = e.inputType === 'password' ? passwordFillFor(opts.seed) : (FILL_VALUES[e.inputType ?? ''] ?? DEFAULT_FILL);
      return { ref: e.ref, kind: 'fill', value };
    }
    return { ref: e.ref, kind: 'click' };
  });
  for (const e of order.slice(opts.maxActions > 0 ? opts.maxActions : 0)) {
    skipped.push({ ref: e.ref, reason: 'over the action budget' });
  }
  return { seed: opts.seed, actions, skipped };
}
