import { StrictMode } from 'react';
// Keyboard access to scrollable code blocks and panels (the same helper the static console pages load).
import '../../public/scroll-regions.js';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppProvider, DEMO_SESSION_KEY, redirectToLogin, type Mode } from './app-context';
import { ApiError, api } from './api';
import type { Me } from './types';

function hasDemoSession(): boolean {
  try {
    return window.sessionStorage.getItem(DEMO_SESSION_KEY) === 'preview';
  } catch {
    return false;
  }
}

type Boot = { kind: 'ready'; mode: Mode; me: Me | null } | { kind: 'redirect' } | { kind: 'error'; message: string };

/** Live when the API knows the user, sample when a demo session exists, otherwise the sign-in page. */
async function resolveMode(): Promise<Boot> {
  let me: Me | null = null;
  let failure: unknown = null;
  try {
    me = await api.me();
  } catch (error) {
    failure = error;
  }
  if (me && me.user) return { kind: 'ready', mode: 'live', me };
  if (hasDemoSession()) return { kind: 'ready', mode: 'sample', me: null };
  // Only a 401 means "signed out". A proxy 429, a 5xx or a network failure must not log anyone out.
  if (failure && !(failure instanceof ApiError && failure.status === 401)) {
    return { kind: 'error', message: failure instanceof Error ? failure.message : 'Check your connection and try again.' };
  }
  return { kind: 'redirect' };
}

function BootError({ message }: { message: string }) {
  return (
    <div className="boot-error" role="alert">
      <h1>Airlock Cloud is not reachable</h1>
      <p>{message || 'Check your connection and try again.'}</p>
      <button type="button" onClick={() => window.location.reload()}>Try again</button>
    </div>
  );
}

async function start() {
  const container = document.getElementById('root');
  if (!container) return;
  const root = createRoot(container);
  const boot = await resolveMode();
  if (boot.kind === 'redirect') {
    redirectToLogin();
    return;
  }
  if (boot.kind === 'error') {
    document.documentElement.dataset.mode = 'error';
    root.render(<BootError message={boot.message} />);
    return;
  }
  document.documentElement.dataset.mode = boot.mode;

  // Back/forward can restore the console from the browser cache after sign-out: check the session again.
  window.addEventListener('pageshow', async (event) => {
    if (!event.persisted) return;
    if (boot.mode === 'live') {
      try {
        if (!(await api.me())) redirectToLogin();
      } catch { /* a transient failure is not a sign-out */ }
    } else if (!hasDemoSession()) {
      redirectToLogin();
    }
  });

  root.render(
    <StrictMode>
      <AppProvider mode={boot.mode} initialMe={boot.me}>
        <App />
      </AppProvider>
    </StrictMode>,
  );
}

void start();
