import type { BrowserContext, Frame, Page } from 'playwright-core';
import type { ElementFingerprint, TraceActionType } from '../types/index.js';
import type { TraceRecorder } from './trace-recorder.js';

/** Payload sent from the page by the recorder init script. */
export interface CapturedInteraction {
  action: 'click' | 'fill' | 'press' | 'select';
  selector: string;
  value?: string;
  fingerprint: ElementFingerprint;
  url: string;
}

const BINDING_NAME = '__qafindRecord';
/** Value recorded in place of anything typed into a password field. */
export const REDACTED_VALUE = '<redacted-password>';
const REDACTED = REDACTED_VALUE;

/**
 * Runs in every page before its own scripts. It listens (in the capture phase) for trusted user
 * input, computes a selector that matches exactly the element acted on, and reports it to Node
 * through the exposed binding.
 */
export const RECORDER_INIT_SCRIPT = `(() => {
  if (window.top !== window || window.__qafindRecorderInstalled) return;
  window.__qafindRecorderInstalled = true;

  const send = (payload) => {
    try { window.${BINDING_NAME}(payload); } catch (e) { /* binding not ready */ }
  };
  const INTERACTIVE = 'button, a[href], input, textarea, select, label, summary, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="tab"], [role="menuitem"], [role="option"], [role="switch"], [onclick]';
  const NON_TEXT_INPUTS = ['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'image', 'range', 'color', 'hidden'];
  const cssEscape = (v) => (window.CSS && CSS.escape) ? CSS.escape(v) : String(v).replace(/([^a-zA-Z0-9_-])/g, '\\\\$1');
  const attr = (v) => String(v).replace(/\\\\/g, '\\\\\\\\').replace(/"/g, '\\\\"');
  const stableId = (id) => !/\\d{4,}/.test(id) && !/^(:r|radix-|headlessui-|mui-)/.test(id);

  const isUnique = (selector, el) => {
    try {
      const found = document.querySelectorAll(selector);
      return found.length === 1 && found[0] === el;
    } catch (e) { return false; }
  };

  const cssPath = (el) => {
    const parts = [];
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      if (node.id && stableId(node.id)) {
        const withId = ['#' + cssEscape(node.id), ...parts].join(' > ');
        if (isUnique(withId, el)) return withId;
      }
      let part = node.tagName.toLowerCase();
      const parent = node.parentElement;
      if (parent) {
        const same = Array.from(parent.children).filter((c) => c.tagName === node.tagName);
        if (same.length > 1) part += ':nth-of-type(' + (same.indexOf(node) + 1) + ')';
      }
      parts.unshift(part);
      const candidate = parts.join(' > ');
      if (isUnique(candidate, el)) return candidate;
    }
    return parts.join(' > ');
  };

  const selectorFor = (el) => {
    const tag = el.tagName.toLowerCase();
    const candidates = [];
    for (const name of ['data-testid', 'data-test', 'data-cy']) {
      const v = el.getAttribute(name);
      if (v) candidates.push('[' + name + '="' + attr(v) + '"]');
    }
    if (el.id && stableId(el.id)) candidates.push('#' + cssEscape(el.id));
    const nameAttr = el.getAttribute('name');
    if (nameAttr) candidates.push(tag + '[name="' + attr(nameAttr) + '"]');
    const aria = el.getAttribute('aria-label');
    if (aria) candidates.push(tag + '[aria-label="' + attr(aria) + '"]');
    for (const c of candidates) if (isUnique(c, el)) return c;
    return cssPath(el);
  };

  const fingerprint = (el, selector) => {
    const tag = el.tagName.toLowerCase();
    const attributes = {};
    for (const a of Array.from(el.attributes)) {
      if (a.name === 'value' && tag === 'input' && (el.type || '').toLowerCase() === 'password') continue;
      attributes[a.name] = a.value;
    }
    const rect = el.getBoundingClientRect();
    const text = (el.textContent || '').trim();
    const testId = el.getAttribute('data-testid') || el.getAttribute('data-test') || el.getAttribute('data-cy');
    return {
      css: selector,
      tagName: tag,
      ariaRole: el.getAttribute('role') || (tag === 'button' ? 'button' : tag === 'a' ? 'link' : undefined),
      ariaName: el.getAttribute('aria-label') || el.getAttribute('name') || text.substring(0, 50) || undefined,
      dataTestId: testId || undefined,
      textContent: text || undefined,
      attributes,
      domContextSnippet: el.outerHTML.substring(0, 300),
      boundingClientRect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
    };
  };

  const emit = (action, el, value) => {
    const selector = selectorFor(el);
    send({ action, selector, value, fingerprint: fingerprint(el, selector), url: location.href });
  };

  const isTextField = (el) => {
    if (!el || el.nodeType !== 1) return false;
    if (el.isContentEditable || el.tagName === 'TEXTAREA') return true;
    return el.tagName === 'INPUT' && !NON_TEXT_INPUTS.includes((el.type || 'text').toLowerCase());
  };

  // Typing is recorded as one fill per field, with the field's final value.
  let pending = null;
  const lastFilled = new WeakMap();
  const flush = () => {
    if (!pending) return;
    const el = pending;
    pending = null;
    const value = el.isContentEditable ? (el.textContent || '') : el.value;
    if (lastFilled.get(el) === value) return;
    lastFilled.set(el, value);
    // Never write typed passwords into the trace file.
    const isPassword = el.tagName === 'INPUT' && (el.type || '').toLowerCase() === 'password';
    emit('fill', el, isPassword ? '${REDACTED}' : value);
  };

  document.addEventListener('input', (e) => {
    if (!e.isTrusted) return;
    const el = e.composedPath()[0];
    if (!isTextField(el)) return;
    if (pending && pending !== el) flush();
    pending = el;
  }, true);

  document.addEventListener('change', (e) => {
    const el = e.target;
    // Option pickers fire an untrusted change in some browsers and automation tools; setting
    // .value from page script fires no event at all, so accepting it here is safe.
    if (el && el.tagName === 'SELECT') {
      flush();
      const value = el.multiple ? Array.from(el.selectedOptions).map((o) => o.value).join(',') : el.value;
      emit('select', el, value);
    } else if (e.isTrusted && el === pending) {
      flush();
    }
  }, true);

  let labelForwarded = null;
  document.addEventListener('click', (e) => {
    if (!e.isTrusted) return;
    flush();
    const origin = e.composedPath()[0];
    const start = origin && origin.nodeType === 1 ? origin : origin && origin.parentElement;
    if (!start) return;
    const el = start.closest(INTERACTIVE) || start;
    if (el.tagName === 'SELECT' || el.tagName === 'OPTION' || isTextField(el)) return;
    // A click on a <label> is forwarded by the browser to its control; record only the label click.
    if (labelForwarded && labelForwarded.el === el && Date.now() - labelForwarded.at < 100) return;
    labelForwarded = el.tagName === 'LABEL' && el.control ? { el: el.control, at: Date.now() } : null;
    emit('click', el);
  }, true);

  const TEXT_FIELD_KEYS = ['Enter', 'Tab', 'Escape'];
  const SPECIAL_KEYS = TEXT_FIELD_KEYS.concat(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', 'Backspace', 'Delete', ' ']);
  document.addEventListener('keydown', (e) => {
    if (!e.isTrusted || e.repeat) return;
    const el = e.composedPath()[0];
    const target = el && el.nodeType === 1 ? el : document.activeElement || document.body;
    const inText = isTextField(target);
    const hasCommandModifier = e.ctrlKey || e.metaKey || e.altKey;
    if (inText ? !TEXT_FIELD_KEYS.includes(e.key) : !(SPECIAL_KEYS.includes(e.key) || hasCommandModifier)) return;
    if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) return;
    flush();
    const mods = [];
    if (e.ctrlKey) mods.push('Control');
    if (e.altKey) mods.push('Alt');
    if (e.metaKey) mods.push('Meta');
    if (e.shiftKey && (hasCommandModifier || SPECIAL_KEYS.includes(e.key))) mods.push('Shift');
    const key = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toLowerCase() : e.key;
    emit('press', target, mods.concat([key]).join('+'));
  }, true);

  window.__qafindFlush = flush;
  window.addEventListener('pagehide', flush, true);
  document.addEventListener('visibilitychange', flush, true);
})();`;

export interface InteractionRecorderOptions {
  /** A main-frame navigation within this many ms of a recorded action is treated as caused by it. */
  navigationGraceMs?: number;
}

/**
 * Records a user's real browser interactions (click, fill, press, select) into a TraceRecorder,
 * plus navigations the user made directly (typing a URL, back/forward).
 */
export class InteractionRecorder {
  private queue: Promise<void> = Promise.resolve();
  private lastActionAt = 0;
  private lastGotoUrl: string | undefined;
  private readonly graceMs: number;
  private readonly watched = new WeakSet<Page>();

  constructor(private readonly trace: TraceRecorder, options: InteractionRecorderOptions = {}) {
    this.graceMs = options.navigationGraceMs ?? 1500;
  }

  async attach(context: BrowserContext): Promise<void> {
    await context.exposeBinding(BINDING_NAME, (_source, payload: CapturedInteraction) => {
      this.lastActionAt = Date.now();
      this.enqueue(() => this.recordInteraction(payload));
    });
    await context.addInitScript({ content: RECORDER_INIT_SCRIPT });
    for (const page of context.pages()) this.watchPage(page);
    context.on('page', (page) => this.watchPage(page));
  }

  /**
   * Ask every open page to report a field that is still being typed in, then wait until every
   * interaction received so far has been written to the trace.
   */
  async flush(context?: BrowserContext): Promise<void> {
    if (context) {
      await Promise.all(
        context.pages().filter((p) => !p.isClosed()).map((p) =>
          p.evaluate(() => (window as unknown as { __qafindFlush?: () => void }).__qafindFlush?.()).catch(() => {})
        )
      );
      // Give the binding calls triggered by the flush a moment to arrive.
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await this.queue;
  }

  private enqueue(fn: () => void | Promise<void>): void {
    this.queue = this.queue.then(fn).catch(() => {});
  }

  private watchPage(page: Page): void {
    if (this.watched.has(page)) return;
    this.watched.add(page);
    page.on('framenavigated', (frame: Frame) => {
      if (frame !== page.mainFrame()) return;
      const url = frame.url();
      if (!url || url === 'about:blank') return;
      if (Date.now() - this.lastActionAt < this.graceMs) return;
      if (url === this.lastGotoUrl) return;
      this.lastGotoUrl = url;
      this.enqueue(() => {
        this.trace.recordCapturedStep('goto', { url });
      });
    });
  }

  private recordInteraction(payload: CapturedInteraction): void {
    const allowed: TraceActionType[] = ['click', 'fill', 'press', 'select'];
    if (!payload || !allowed.includes(payload.action) || typeof payload.selector !== 'string') return;
    this.lastGotoUrl = undefined;
    this.trace.recordCapturedStep(payload.action, {
      target: { ...payload.fingerprint, css: payload.selector },
      value: payload.value,
    });
  }
}
