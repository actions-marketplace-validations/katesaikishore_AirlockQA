import { useEffect, useState } from 'react';

export const VIEWS = [
  'dashboard', 'runs', 'run-detail', 'qa', 'explorer', 'analytics', 'recorder', 'healing', 'checkpoints', 'policy',
  'audit', 'timewarp', 'fixtures', 'chaos', 'capsules', 'integrations', 'settings',
] as const;
export type View = (typeof VIEWS)[number];

export const VIEW_ALIASES: Record<string, View> = {
  dashboard: 'dashboard', overview: 'dashboard', runs: 'runs', 'run-detail': 'run-detail', qa: 'qa', 'qa-runs': 'qa',
  explorer: 'explorer', tests: 'explorer', analytics: 'analytics', recorder: 'recorder',
  healing: 'healing', 'self-healing': 'healing', checkpoints: 'checkpoints', policy: 'policy',
  'request-policy': 'policy', audit: 'audit', evidence: 'audit', timewarp: 'timewarp', 'time-warp': 'timewarp',
  fixtures: 'fixtures', chaos: 'chaos', 'chaos-report': 'chaos', capsules: 'capsules', 'bug-capsules': 'capsules',
  integrations: 'integrations', cicd: 'integrations', settings: 'settings',
};

export const VIEW_TITLES: Record<View, string> = {
  dashboard: 'Overview', runs: 'Runs', 'run-detail': 'Run detail', qa: 'QA', explorer: 'Tests', analytics: 'Analytics',
  recorder: 'Recorder', healing: 'Self-healing', checkpoints: 'Checkpoints', policy: 'Request policy',
  audit: 'Evidence', timewarp: 'Time warp', fixtures: 'Fixtures', chaos: 'Chaos report', capsules: 'Bug capsules',
  integrations: 'CI/CD & API', settings: 'Settings',
};

export interface Route { view: View; param: string }

/** `#runs`, `#run-detail/<id>` and `#runs/new` all resolve here. Unknown hashes show the overview. */
export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '').replace(/^view-/, '');
  const slash = raw.indexOf('/');
  let param = '';
  try {
    param = slash === -1 ? '' : decodeURIComponent(raw.slice(slash + 1));
  } catch {
    param = '';
  }
  const value = slash === -1 ? raw : raw.slice(0, slash);
  return { view: VIEW_ALIASES[value] || 'dashboard', param };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute((current) => {
      const next = parseHash(window.location.hash);
      return next.view === current.view && next.param === current.param ? current : next;
    });
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function navigate(hash: string): void {
  const target = hash.startsWith('#') ? hash : `#${hash}`;
  if (window.location.hash !== target) window.location.hash = target;
}
