import { useApp } from '../app-context';
import { formatTime } from '../lib';

/** The "cloud runs today" meter shown on the Overview, Integrations and Settings screens. */
export function UsageCard() {
  const { usage, usageError } = useApp();
  if (!usage) return <p className="lv-muted">{usageError ? 'Usage is unavailable right now.' : 'Loading usage'}</p>;
  const daily = usage.daily;
  const percent = daily.limit > 0 ? Math.min(100, Math.round((daily.used / daily.limit) * 100)) : 0;
  return (
    <div data-usage-card="">
      <div className="lv-usage-line">
        <strong className="lv-mono">{daily.used} / {daily.limit}</strong>
        <span className="lv-muted">cloud runs today</span>
      </div>
      <div className="lv-meter" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
      <p className="lv-muted lv-small">{daily.remaining} remaining. Resets at {formatTime(daily.resetAt)}.</p>
    </div>
  );
}
