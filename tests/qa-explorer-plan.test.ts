import { describe, expect, it } from 'bun:test';
import { planExploration, DEFAULT_DENY, type UiElement } from '../src/qa/explorer-plan.js';

const el = (over: Partial<UiElement>): UiElement => ({ ref: 'e1', role: 'button', name: 'Save', ...over });

describe('exploration planner: what the crawler may touch', () => {
  it('never plans an action on a destructive control, whatever it is called', () => {
    const plan = planExploration(
      [el({ ref: 'e1', name: 'Delete account' }), el({ ref: 'e2', name: 'Pay now' }), el({ ref: 'e3', name: 'Remove item' }), el({ ref: 'e4', name: 'Save' }), el({ ref: 'e5', name: 'Place order' })],
      { seed: 1, maxActions: 10 }
    );
    const refs = plan.actions.map((a) => a.ref);
    expect(refs).not.toContain('e1');
    expect(refs).not.toContain('e2');
    expect(refs).not.toContain('e3');
    expect(refs).not.toContain('e5');
    expect(plan.skipped.find((s) => s.ref === 'e1')?.reason).toMatch(/denylist/);
  });

  it('a control with a destructive test id is denied too (test ids cannot be overridden by a friendly name)', () => {
    const plan = planExploration([el({ ref: 'x', name: 'OK', testId: 'delete-account' })], { seed: 1, maxActions: 5 });
    expect(plan.actions).toEqual([]);
  });

  it('an allowlisted control is still never denied by a generic word', () => {
    const plan = planExploration([el({ ref: 'x', name: 'Remove filter' })], { seed: 1, maxActions: 5, allow: ['Remove filter'] });
    expect(plan.actions.map((a) => a.ref)).toEqual(['x']);
  });

  it('the same seed gives the same plan, so a finding can be replayed', () => {
    const elements = Array.from({ length: 8 }, (_, i) => el({ ref: `r${i}`, name: `Tab ${i}` }));
    expect(planExploration(elements, { seed: 42, maxActions: 5 })).toEqual(planExploration(elements, { seed: 42, maxActions: 5 }));
  });

  it('a different seed can give a different order (rotation across runs)', () => {
    const elements = Array.from({ length: 8 }, (_, i) => el({ ref: `r${i}`, name: `Tab ${i}` }));
    const a = planExploration(elements, { seed: 1, maxActions: 8 }).actions.map((x) => x.ref).join();
    const b = planExploration(elements, { seed: 2, maxActions: 8 }).actions.map((x) => x.ref).join();
    expect(a).not.toBe(b);
  });

  it('never exceeds the action budget', () => {
    const elements = Array.from({ length: 50 }, (_, i) => el({ ref: `r${i}`, name: `Tab ${i}` }));
    expect(planExploration(elements, { seed: 3, maxActions: 7 }).actions).toHaveLength(7);
  });

  it('form fields get a typed value from the catalog by their type, never a real secret', () => {
    const plan = planExploration([el({ ref: 'f1', role: 'textbox', name: 'Email', inputType: 'email' })], { seed: 1, maxActions: 5 });
    expect(plan.actions[0]).toMatchObject({ ref: 'f1', kind: 'fill' });
    expect(String(plan.actions[0].value)).toMatch(/@example\.test$/);
  });

  it('the default denylist covers the common destructive words', () => {
    for (const w of ['delete', 'remove', 'pay', 'purchase', 'checkout', 'place order', 'cancel subscription', 'wipe', 'deactivate']) {
      expect(DEFAULT_DENY.some((re) => re.test(w))).toBe(true);
    }
  });
});
