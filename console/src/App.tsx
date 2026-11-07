import { Suspense, lazy, useEffect, useRef } from 'react';
import { useApp } from './app-context';
import { Footer, Panel, SampleBanner, Sidebar, Topbar } from './Shell';
import { VIEW_TITLES, useRoute, type Route, type View } from './router';
import Overview from './screens/Overview';
import Runs from './screens/Runs';
import Qa from './screens/Qa';
import RunDetail from './screens/RunDetail';
import Analytics from './screens/Analytics';
import Evidence from './screens/Evidence';
import Integrations from './screens/Integrations';
import Settings from './screens/Settings';
import LabPreview from './screens/LabPreview';

// The sample screens are large static markup: load them only in sample mode.
const SamplePanel = lazy(() => import('./SamplePanels'));

function LiveScreen({ route }: { route: Route }) {
  switch (route.view) {
    case 'dashboard': return <Overview param={route.param} />;
    case 'runs': return <Runs param={route.param} />;
    case 'run-detail': return <RunDetail param={route.param} />;
    case 'qa': return <Qa param={route.param} />;
    case 'analytics': return <Analytics param={route.param} />;
    case 'audit': return <Evidence param={route.param} />;
    case 'integrations': return <Integrations param={route.param} />;
    case 'settings': return <Settings param={route.param} />;
    default: return <LabPreview view={route.view as View} />;
  }
}

export default function App() {
  const app = useApp();
  const route = useRoute();
  const live = app.mode === 'live';
  const first = useRef(true);

  useEffect(() => { void app.refreshUsage(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = `${VIEW_TITLES[route.view]} · AirlockQA Console`;
    // Moving to another screen puts keyboard focus on its heading; the first render keeps the browser default.
    if (first.current) { first.current = false; return; }
    // Run detail focuses its own title once the run has loaded, and #runs/new focuses the form's first field.
    if (route.view === 'run-detail' || (route.view === 'runs' && route.param === 'new')) return;
    const heading = document.querySelector<HTMLElement>(`#view-${route.view} h1`);
    heading?.focus({ preventScroll: true });
  }, [route.view]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div id="dc-root">
      <div className="cx">
        <Sidebar route={route} />
        <div className="main-shell">
          {live ? null : <SampleBanner />}
          <Topbar route={route} />
          <div className="main-body">
            <Panel view={route.view}>
              {live ? (
                <LiveScreen route={route} />
              ) : (
                <Suspense fallback={<p className="lv-muted" role="status">Loading</p>}>
                  <SamplePanel view={route.view} />
                </Suspense>
              )}
            </Panel>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
