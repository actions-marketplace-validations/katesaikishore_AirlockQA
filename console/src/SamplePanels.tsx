import type { ComponentType } from 'react';
import type { View } from './router';
import AnalyticsPanel from './generated/AnalyticsPanel';
import AuditPanel from './generated/AuditPanel';
import CapsulesPanel from './generated/CapsulesPanel';
import ChaosPanel from './generated/ChaosPanel';
import CheckpointsPanel from './generated/CheckpointsPanel';
import DashboardPanel from './generated/DashboardPanel';
import ExplorerPanel from './generated/ExplorerPanel';
import FixturesPanel from './generated/FixturesPanel';
import HealingPanel from './generated/HealingPanel';
import IntegrationsPanel from './generated/IntegrationsPanel';
import PolicyPanel from './generated/PolicyPanel';
import RecorderPanel from './generated/RecorderPanel';
import RunDetailPanel from './generated/RunDetailPanel';
import RunsPanel from './generated/RunsPanel';
import SettingsPanel from './generated/SettingsPanel';
import TimewarpPanel from './generated/TimewarpPanel';

/** Sample mode: the illustrative design screens, shown under a "Sample data" banner. */
const PANELS: Partial<Record<View, ComponentType>> = {
  dashboard: DashboardPanel, runs: RunsPanel, 'run-detail': RunDetailPanel, explorer: ExplorerPanel,
  analytics: AnalyticsPanel, recorder: RecorderPanel, healing: HealingPanel, checkpoints: CheckpointsPanel,
  policy: PolicyPanel, audit: AuditPanel, timewarp: TimewarpPanel, fixtures: FixturesPanel, chaos: ChaosPanel,
  capsules: CapsulesPanel, integrations: IntegrationsPanel, settings: SettingsPanel,
};

export default function SamplePanel({ view }: { view: View }) {
  const Panel = PANELS[view];
  if (!Panel) return <p className="lv-muted">Sign in to Airlock Cloud to see QA runs. This screen has no sample data.</p>;
  return <Panel />;
}
