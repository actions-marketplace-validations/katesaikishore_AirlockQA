import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { ApiError, api, type Api } from './api';
import { isActive } from './lib';
import type { Me, RunSummary, UsageInfo } from './types';

export type Mode = 'live' | 'sample';
export const DEMO_SESSION_KEY = 'airlock-demo-session';

export interface AppContextValue {
  mode: Mode;
  api: Api;
  /** The signed-in user and workspace. Always set in live mode, null in sample mode. */
  me: Me | null;
  setWorkspaceName(name: string): void;
  /** Runs an API call. A 401 means the session ended: the browser goes to the sign-in page and the promise never settles. */
  call<T>(fn: () => Promise<T>): Promise<T>;
  toast(message: string): void;
  /** Says something to screen readers. */
  announce(message: string): void;
  signOut(): Promise<void>;
  usage: UsageInfo | null;
  usageError: boolean;
  refreshUsage(): Promise<void>;
  /** Screens report the runs they have loaded so the sidebar can show how many are active. */
  reportRuns(source: string, runs: RunSummary[]): void;
  activeRuns: number;
  /** Text typed in the topbar search; the Runs screen filters by it. */
  search: string;
  setSearch(value: string): void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside <AppProvider>');
  return value;
}

// State that must outlive a screen (the one-time API key token, verify results) but never outlive the session.
const sessionValues = new Map<string, unknown>();
const sessionListeners = new Set<() => void>();
const notifySession = () => sessionListeners.forEach((listener) => listener());

/** Like useState, but kept while the user moves between screens. Cleared on sign-out. `initial` must be a stable value. */
export function useSessionState<T>(key: string, initial: T): [T, (value: T | ((current: T) => T)) => void] {
  const value = useSyncExternalStore(
    (listener) => { sessionListeners.add(listener); return () => { sessionListeners.delete(listener); }; },
    () => (sessionValues.has(key) ? (sessionValues.get(key) as T) : initial),
  );
  const set = useCallback((next: T | ((current: T) => T)) => {
    const current = sessionValues.has(key) ? (sessionValues.get(key) as T) : initial;
    sessionValues.set(key, typeof next === 'function' ? (next as (current: T) => T)(current) : next);
    notifySession();
  }, [key, initial]);
  return [value, set];
}

export function clearSessionState(): void {
  sessionValues.clear();
  notifySession();
}

export function redirectToLogin(): void {
  const requested = window.location.pathname + window.location.search + window.location.hash;
  window.location.replace('/login?next=' + encodeURIComponent(requested));
}

export function AppProvider({ mode, initialMe, children }: { mode: Mode; initialMe: Me | null; children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(initialMe);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [usageError, setUsageError] = useState(false);
  const [toastText, setToastText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [search, setSearch] = useState('');
  const [runSources, setRunSources] = useState<Record<string, RunSummary[]>>({});
  const toastTimer = useRef(0);

  const call = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        redirectToLogin();
        return new Promise<T>(() => {});
      }
      throw error;
    }
  }, []);

  const toast = useCallback((message: string) => {
    setToastText(message);
    setToastVisible(true);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const announce = useCallback((message: string) => {
    setAnnouncement('');
    window.setTimeout(() => setAnnouncement(message), 30);
  }, []);

  const refreshUsage = useCallback(async () => {
    if (mode !== 'live') return;
    try {
      setUsage(await call(() => api.usage()));
      setUsageError(false);
    } catch {
      setUsageError(true);
    }
  }, [mode, call]);

  const signOut = useCallback(async () => {
    if (mode === 'live') {
      try {
        await api.logout();
      } catch (error) {
        const reason = error instanceof Error && error.message ? error.message : 'try again.';
        toast('Could not sign out: ' + reason);
        announce('Sign out failed. You are still signed in.');
        return;
      }
    } else {
      try { window.sessionStorage.removeItem(DEMO_SESSION_KEY); } catch { /* blocked storage */ }
    }
    // Nothing secret may stay in the page: a back/forward cache could show it again after sign-out.
    clearSessionState();
    window.location.replace('/login');
  }, [mode, toast, announce]);

  const reportRuns = useCallback((source: string, runs: RunSummary[]) => {
    setRunSources((current) => ({ ...current, [source]: runs }));
  }, []);

  const activeRuns = useMemo(() => {
    const seen = new Set<string>();
    Object.values(runSources).flat().forEach((run) => { if (isActive(run.status)) seen.add(run.id); });
    return seen.size;
  }, [runSources]);

  const setWorkspaceName = useCallback((name: string) => {
    setMe((current) => (current ? { ...current, workspace: { ...current.workspace, name } } : current));
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    mode, api, me, setWorkspaceName, call, toast, announce, signOut, usage, usageError, refreshUsage,
    reportRuns, activeRuns, search, setSearch,
  }), [mode, me, setWorkspaceName, call, toast, announce, signOut, usage, usageError, refreshUsage, reportRuns, activeRuns, search]);

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className={'toast' + (toastVisible ? ' is-visible' : '')} id="app-toast" role="status" aria-live="polite">{toastText}</div>
      <div className="sr-only" id="live-announcer" role="status" aria-live="polite">{announcement}</div>
    </AppContext.Provider>
  );
}
