/**
 * Shared building blocks for the console screens. They use the lv-* classes from public/styles.css.
 * Every value that comes from the API is rendered as React text, which escapes it. Nothing here (or anywhere in
 * the console) may use dangerouslySetInnerHTML with API data.
 */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useApp } from './app-context';
import { STATUS_LABELS, copyText, describeError } from './lib';

export function PageHeader({ title, subtitle, actions, badge }: { title: string; subtitle?: ReactNode; actions?: ReactNode; badge?: ReactNode }) {
  const heading = <h1 className="lv-title" tabIndex={-1}>{title}</h1>;
  return (
    <div className="lv-head">
      <div className="lv-head-text">
        {badge ? <div className="lv-title-row">{heading}{badge}</div> : heading}
        {subtitle ? <p className="lv-sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="lv-actions">{actions}</div> : null}
    </div>
  );
}

export function Card({ title, aside, className, id, children }: { title?: string; aside?: ReactNode; className?: string; id?: string; children: ReactNode }) {
  const titleId = useId();
  return (
    <section className={'lv-card' + (className ? ' ' + className : '')} id={id} aria-labelledby={title ? titleId : undefined}>
      {title ? <div className="lv-card-head"><h2 id={titleId} className="lv-card-title">{title}</h2>{aside}</div> : null}
      {children}
    </section>
  );
}

export function Kpi({ label, value, foot, id }: { label: string; value: ReactNode; foot?: ReactNode; id?: string }) {
  return (
    <article className="lv-kpi">
      <div className="lv-kpi-label">{label}</div>
      <div className="lv-kpi-value" id={id}>{value}</div>
      {foot ? <div className="lv-kpi-foot">{foot}</div> : null}
    </article>
  );
}

export function StatusPill({ status }: { status: string }) {
  const known = Object.prototype.hasOwnProperty.call(STATUS_LABELS, status) ? status : 'UNKNOWN';
  return <span className={'lv-pill lv-pill-' + known.toLowerCase()}>{STATUS_LABELS[known] || 'Unknown'}</span>;
}

export function Loading({ text }: { text?: string }) {
  return <p className="lv-muted" role="status">{text || 'Loading'}</p>;
}

export function ErrorBox({ error }: { error: unknown }) {
  const info = describeError(error);
  return (
    <div className="lv-alert lv-alert-error" role="alert">
      <strong>{info.message}</strong>
      {info.issues.length ? <ul>{info.issues.map((line, index) => <li key={index}>{line}</li>)}</ul> : null}
    </div>
  );
}

export function RetryBlock({ error, retry }: { error: unknown; retry: () => void }) {
  const info = describeError(error);
  return (
    <div className="lv-alert lv-alert-error" role="alert">
      <strong>{info.message}</strong>
      <button type="button" className="lv-btn lv-btn-small" onClick={retry}>Try again</button>
    </div>
  );
}

/** A button that copies `getText()` and briefly says so. */
export function CopyButton({ label = 'Copy', getText }: { label?: string; getText: () => string }) {
  const { toast, announce } = useApp();
  const [text, setText] = useState(label);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const onClick = async () => {
    try {
      await copyText(getText());
      setText('Copied');
      announce('Copied to clipboard');
      toast('Copied to clipboard');
    } catch {
      setText('Copy unavailable');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setText(label), 1600);
  };
  return <button type="button" className="lv-btn lv-btn-quiet lv-btn-small" onClick={onClick}>{text}</button>;
}

export function CodeBlock({ text, label }: { text: string; label?: string }) {
  return (
    <div className={'lv-code-wrap' + (text.includes('\n') ? ' lv-code-multi' : '')}>
      <pre className="lv-code" tabIndex={0}><code>{text}</code></pre>
      <CopyButton label={label} getText={() => text} />
    </div>
  );
}

export interface ConfirmOptions { title: string; message: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean }

/** A native <dialog> (focus trap, Escape, inert background). Render it while `options` is set. */
export function ConfirmDialog({ options, onResult }: { options: ConfirmOptions; onResult: (confirmed: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement as HTMLElement | null;
    if (dialog && !dialog.open) dialog.showModal();
    cancelRef.current?.focus();
    return () => {
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="lv-dialog"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={(event) => { event.preventDefault(); onResult(false); }}
    >
      <h2 id={titleId}>{options.title}</h2>
      <p id={bodyId}>{options.message}</p>
      <div className="lv-dialog-actions">
        <button type="button" className="lv-btn" ref={cancelRef} onClick={() => onResult(false)}>{options.cancelLabel || 'Cancel'}</button>
        <button type="button" className={'lv-btn ' + (options.danger ? 'lv-btn-danger' : 'lv-btn-primary')} onClick={() => onResult(true)}>{options.confirmLabel || 'Confirm'}</button>
      </div>
    </dialog>
  );
}

/** `const [confirm, dialog] = useConfirm();` then `if (await confirm({...})) ...` and render `{dialog}`. */
export function useConfirm(): [(options: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const [pending, setPending] = useState<{ options: ConfirmOptions; resolve: (value: boolean) => void } | null>(null);
  const confirm = (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ options, resolve }));
  const dialog = pending ? (
    <ConfirmDialog options={pending.options} onResult={(value) => { pending.resolve(value); setPending(null); }} />
  ) : null;
  return [confirm, dialog];
}
