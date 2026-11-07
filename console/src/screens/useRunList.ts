import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../app-context';
import { isActive } from '../lib';
import type { RunSummary } from '../types';

export const RUN_STATUSES = ['QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'POLICY_VIOLATION', 'CANCELLED'] as const;

/** True when a run that was in `previous` now has another status in `next`: the daily usage may have changed. */
export function statusChanged(previous: RunSummary[], next: RunSummary[]): boolean {
  return previous.some((old) => {
    const fresh = next.find((run) => run.id === old.id);
    return fresh !== undefined && fresh.status !== old.status;
  });
}

export interface LoadOptions { more?: boolean; silent?: boolean }

/**
 * The runs list: status filter on the server, pages with a cursor, and polling.
 * A poll re-reads every page loaded so far, so runs loaded with "Load more" stay current. Each request carries a
 * sequence number: only the newest one may update the screen, and a poll never starts while another load is running.
 */
export function useRunList() {
  const { api, call, refreshUsage, reportRuns } = useApp();
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatusState] = useState('all');
  const runsRef = useRef<RunSummary[]>([]);
  const cursorRef = useRef<string | null>(null);
  const statusRef = useRef('all');
  const pagesRef = useRef(1);
  const sequence = useRef(0);
  const inFlight = useRef(0);

  const load = useCallback(async (options: LoadOptions = {}): Promise<void> => {
    if (options.silent && inFlight.current > 0) return;
    const id = ++sequence.current;
    const requested = statusRef.current;
    const read = (cursor: string | null) => {
      const params: { limit: number; status?: string; cursor?: string } = { limit: 50 };
      if (requested !== 'all') params.status = requested;
      if (cursor) params.cursor = cursor;
      return call(() => api.runs.list(params));
    };
    const current = () => sequence.current === id && statusRef.current === requested;
    if (!options.silent) inFlight.current += 1;
    try {
      const previous = runsRef.current;
      let incoming: RunSummary[] = [];
      let cursor: string | null = null;
      let pages = 0;
      if (options.more) {
        const result = await read(cursorRef.current);
        incoming = previous.concat(result.runs || []);
        cursor = result.nextCursor || null;
        pages = pagesRef.current + 1;
      } else {
        const wanted = options.silent ? pagesRef.current : 1;
        for (let index = 0; index < wanted; index += 1) {
          const result = await read(cursor);
          incoming = incoming.concat(result.runs || []);
          cursor = result.nextCursor || null;
          pages = index + 1;
          if (!cursor) break;
        }
      }
      if (!current()) return;
      runsRef.current = incoming;
      cursorRef.current = cursor;
      pagesRef.current = pages;
      setRuns(incoming);
      setNextCursor(cursor);
      setError(null);
      setLoaded(true);
      if (!options.more && statusChanged(previous, incoming)) void refreshUsage();
    } catch (failure) {
      if (!current()) return;
      setError(failure);
      setLoaded(true);
      if (options.silent) throw failure;
    } finally {
      if (!options.silent) inFlight.current -= 1;
    }
  }, [api, call, refreshUsage]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { reportRuns('runs', runs); }, [runs, reportRuns]);
  // The screen is leaving: the sidebar badge must not keep counting runs nobody is watching any more.
  useEffect(() => () => reportRuns('runs', []), [reportRuns]);

  const setStatus = useCallback((value: string): Promise<void> => {
    statusRef.current = value;
    setStatusState(value);
    return load();
  }, [load]);

  const hasActive = runs.some((run) => isActive(run.status));
  return { runs, nextCursor, loaded, error, status, setStatus, load, hasActive };
}
