import { useEffect, useRef } from 'react';

/**
 * Calls `tick` every `intervalMs` while `enabled` and the tab is visible, never overlapping two calls.
 * A failed tick keeps the last good data on screen; the next interval retries.
 */
export function usePolling(tick: () => Promise<unknown>, enabled: boolean, intervalMs = 3000): void {
  const latest = useRef(tick);
  latest.current = tick;
  useEffect(() => {
    if (!enabled) return undefined;
    let timer = 0;
    let busy = false;
    let stopped = false;
    const schedule = () => {
      window.clearTimeout(timer);
      if (stopped || document.hidden) return;
      timer = window.setTimeout(run, intervalMs);
    };
    const run = async () => {
      if (busy || stopped || document.hidden) return;
      busy = true;
      try { await latest.current(); } catch { /* retry on the next interval */ } finally { busy = false; }
      schedule();
    };
    const onVisibility = () => { if (document.hidden) window.clearTimeout(timer); else void run(); };
    document.addEventListener('visibilitychange', onVisibility);
    schedule();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, intervalMs]);
}
