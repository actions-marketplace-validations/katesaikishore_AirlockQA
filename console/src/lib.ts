import { ApiError } from './api';

export function formatDuration(milliseconds: number | null | undefined): string {
  if (milliseconds === null || milliseconds === undefined || Number.isNaN(Number(milliseconds))) return '—';
  const ms = Number(milliseconds);
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
}

export function formatDateTime(timestamp: string | number | null | undefined): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(date);
}

export function formatTime(timestamp: string | number | null | undefined): string {
  const date = new Date(timestamp ?? NaN);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
}

export function formatRelative(timestamp: string | number | null | undefined): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '—';
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return 'just now';
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h ago`;
  if (seconds < 86400 * 7) return `${Math.round(seconds / 86400)} d ago`;
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

/** The API reports a fraction (0..1). A 0..100 percentage is accepted as well. */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const number = Number(value);
  const percent = number <= 1 ? number * 100 : number;
  return `${Math.round(percent * 10) / 10}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat().format(Number(value));
}

export const STATUS_LABELS: Record<string, string> = {
  QUEUED: 'Queued',
  RUNNING: 'Running',
  SUCCESS: 'Passed',
  FAILED: 'Failed',
  POLICY_VIOLATION: 'Policy blocked',
  CANCELLED: 'Cancelled',
};

export const isActive = (status: string | undefined | null): boolean => status === 'QUEUED' || status === 'RUNNING';

export function failureLabel(reason: string | null | undefined): string {
  const labels: Record<string, string> = {
    STEP_FAILED: 'A step failed',
    TIMEOUT: 'The run timed out',
    TARGET_BLOCKED: 'The target address was blocked by the service guard',
    BROWSER_ERROR: 'The browser failed',
    INTERNAL: 'Internal error',
    CANCELLED: 'Cancelled',
  };
  return (reason && labels[reason]) || reason || '';
}

export function initials(text: string | null | undefined): string {
  const source = String(text || '?');
  const parts = (source.indexOf('@') > 0 ? source.slice(0, source.indexOf('@')) : source).split(/[\s._-]+/).filter(Boolean);
  return ((parts[0] ? parts[0][0] : '?') + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

export function shortId(id: string | null | undefined): string {
  return String(id || '').slice(0, 8);
}

export function targetHost(url: string | null | undefined): string {
  try {
    const parsed = new URL(String(url));
    return parsed.host + (parsed.pathname === '/' ? '' : parsed.pathname);
  } catch {
    return String(url || '');
  }
}

export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.style.position = 'fixed';
  helper.style.opacity = '0';
  document.body.append(helper);
  helper.select();
  const copied = document.execCommand('copy');
  helper.remove();
  if (!copied) throw new Error('Clipboard permission is unavailable');
}

export interface ErrorInfo { message: string; issues: string[]; code: string }

/** A user-facing message for any error thrown by the API client. */
export function describeError(error: unknown): ErrorInfo {
  const err = (error || {}) as Partial<ApiError> & { message?: string };
  const code = err.code || 'INTERNAL';
  const info: ErrorInfo = { message: err.message || 'Something went wrong. Try again.', issues: [], code };
  if (code === 'DAILY_QUOTA_EXCEEDED' && err.quota) {
    info.message = `${err.quota.used} of ${err.quota.limit} runs used today. Resets at ${formatTime(err.quota.resetAt)}.`;
  } else if (code === 'INVALID_REQUEST' || code === 'UNSUPPORTED_FIELD') {
    info.message = err.message || 'The request was not accepted.';
    if (Array.isArray(err.issues)) info.issues = err.issues.map((issue) => (issue.path ? `${issue.path}: ` : '') + issue.message);
  } else if (code === 'RATE_LIMITED') {
    info.message = err.message || 'Too many requests. Wait a moment and try again.';
  }
  return info;
}
