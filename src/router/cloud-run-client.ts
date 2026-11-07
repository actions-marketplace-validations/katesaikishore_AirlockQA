import type { AirlockConfig } from '../types/index.js';
import type { CloudRunRequest, CloudRunResponse } from '../types/cloud-client.js';
import { logger } from '../utils/logger.js';
import { safeText } from '../utils/safe-text.js';

export type CloudRunPayload = Omit<CloudRunRequest, 'apiKey'>;

export interface CloudRunSubmitOptions {
  apiUrl: string;
  apiKey: string;
  payload: CloudRunPayload;
  fetcher?: typeof fetch;
  warn?: (message: string) => void;
}

interface QuotaInfo {
  code?: unknown;
  scope?: unknown;
  used?: unknown;
  limit?: unknown;
  remaining?: unknown;
  resetAt?: unknown;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function readQuotaInfo(body: unknown): QuotaInfo {
  const bodyRecord = asRecord(body);
  const nestedQuota = asRecord(bodyRecord?.quota);
  return {
    ...(bodyRecord || {}),
    ...(nestedQuota || {}),
  };
}

function numeric(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function formatResetTime(value: unknown, retryAfter: string | null): string | undefined {
  const stringValue = typeof value === 'string' ? value : undefined;
  const numericValue = numeric(value);
  let resetDate: Date | undefined;

  if (numericValue !== undefined) {
    // X-RateLimit-Reset and quota.resetAt numeric values are Unix seconds.
    resetDate = new Date(numericValue * 1000);
  } else if (stringValue) {
    const parsed = Date.parse(stringValue);
    if (Number.isFinite(parsed)) resetDate = new Date(parsed);
  }

  if (!resetDate && retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) resetDate = new Date(Date.now() + seconds * 1000);
    else {
      const parsed = Date.parse(retryAfter);
      if (Number.isFinite(parsed)) resetDate = new Date(parsed);
    }
  }

  return resetDate && Number.isFinite(resetDate.getTime())
    ? resetDate.toISOString().replace('.000Z', ' UTC').replace('Z', ' UTC')
    : undefined;
}

export class CloudApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    public readonly headers: Headers,
  ) {
    super(CloudApiError.describe(status, body, headers));
    this.name = 'CloudApiError';
  }

  private static describe(status: number, body: unknown, headers: Headers): string {
    if (status === 429) {
      const quota = readQuotaInfo(body);
      const limit = numeric(quota.limit) ?? numeric(headers.get('X-RateLimit-Limit'));
      const used = numeric(quota.used);
      const remaining = numeric(quota.remaining) ?? numeric(headers.get('X-RateLimit-Remaining'));
      const scope = typeof quota.scope === 'string' ? quota.scope : 'workspace';
      const parts: string[] = [];

      if (used !== undefined && limit !== undefined) parts.push(`${used}/${limit} runs used`);
      else if (limit !== undefined && remaining !== undefined) parts.push(`${limit - remaining}/${limit} runs used`);
      if (scope) parts.push(`${scope} limit`);

      const resetAt = formatResetTime(quota.resetAt ?? headers.get('X-RateLimit-Reset'), headers.get('Retry-After'));
      const resetText = resetAt ? ` Resets at ${resetAt}.` : '';
      const code = typeof quota.code === 'string' ? quota.code.toLowerCase() : '';
      const isQuota = code.includes('quota') || quota.limit !== undefined || quota.used !== undefined;

      return isQuota
        ? `Airlock Cloud daily quota reached${parts.length ? ` (${parts.join('; ')})` : ''}.${resetText} Ask your workspace administrator about a higher limit.`
        : `Airlock Cloud is rate-limiting this request (HTTP 429).${resetText} Retry after the indicated reset time.`;
    }

    if (status === 401 || status === 403) {
      return `Airlock Cloud rejected the API key (HTTP ${status}). Check that the key is valid and active (run "airlock login" to save a new one) and that it belongs to this deployment.`;
    }

    const record = asRecord(body);
    if (status >= 400 && status < 500 && typeof record?.message === 'string') {
      const issues = Array.isArray(record.issues)
        ? record.issues
            .map((issue) => asRecord(issue))
            .filter((issue): issue is Record<string, unknown> => Boolean(issue))
            .map((issue) => `${String(issue.path ?? '')}: ${String(issue.message ?? '')}`.replace(/^: /, ''))
        : [];
      const detail = issues.length ? ` (${issues.slice(0, 5).join('; ')})` : '';
      return `Airlock Cloud rejected the request (HTTP ${status}): ${safeText(record.message, 300)}${detail ? safeText(detail, 400) : ''}`;
    }

    return `Airlock Cloud request failed (HTTP ${status}).`;
  }
}

/** Build the public request shape without ever forwarding configured real credentials. */
export function createCloudRunPayload(
  config: AirlockConfig,
  targetUrl: string,
  suiteName?: string,
  workflow?: CloudRunRequest['workflow']
): CloudRunPayload {
  const phantomConfig: CloudRunRequest['phantomConfig'] = {};

  for (const [name, secret] of Object.entries(config.secrets || {})) {
    const { phantom, allowedHosts, allowedMethods, blockedPaths } = secret;
    phantomConfig[name] = {
      phantom,
      allowedHosts: [...allowedHosts],
      allowedMethods: allowedMethods ? [...allowedMethods] : undefined,
      blockedPaths: blockedPaths ? [...blockedPaths] : undefined,
    };
  }

  return {
    suiteName: suiteName || config.projectName,
    targetUrl,
    phantomConfig,
    ...(workflow ? { workflow } : {}),
  };
}

export function normalizeApiUrl(apiUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(apiUrl);
  } catch {
    throw new Error('Invalid Airlock Cloud API URL. Set AIRLOCK_CLOUD_URL to a valid HTTPS base URL.');
  }

  const isLocalHost = parsed.hostname === 'localhost'
    || parsed.hostname === '127.0.0.1'
    || parsed.hostname === '[::1]'
    || parsed.hostname === '::1';

  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLocalHost)) {
    throw new Error('AIRLOCK_API_KEY will only be sent over HTTPS (HTTP is allowed for localhost testing).');
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('AIRLOCK_CLOUD_URL must not include credentials, a query string, or a fragment.');
  }

  return parsed.toString().replace(/\/+$/, '');
}

function warnIfNearLimit(headers: Headers, warn: (message: string) => void): void {
  const limit = numeric(headers.get('X-RateLimit-Limit') ?? headers.get('RateLimit-Limit'));
  const remaining = numeric(headers.get('X-RateLimit-Remaining') ?? headers.get('RateLimit-Remaining'));
  if (limit === undefined || remaining === undefined || limit <= 0 || remaining < 0) return;
  if (remaining <= limit * 0.2) {
    warn(`Airlock Cloud quota is nearly used: ${remaining} of ${limit} runs remain today.`);
  }
}

/** Submit a Cloud run. The key is sent only in the Authorization header. */
export async function submitCloudRun(options: CloudRunSubmitOptions): Promise<CloudRunResponse> {
  const apiKey = options.apiKey.trim();
  if (!apiKey) {
    throw new Error('Cloud runs require AIRLOCK_API_KEY. Create a key in your Airlock Cloud workspace and store it in your CI secrets.');
  }

  const apiUrl = normalizeApiUrl(options.apiUrl);
  const fetcher = options.fetcher || fetch;
  const response = await fetcher(`${apiUrl}/v1/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(options.payload),
  });

  const responseText = await response.text();
  let responseBody: unknown;
  try {
    responseBody = responseText ? JSON.parse(responseText) : undefined;
  } catch {
    responseBody = undefined;
  }

  if (!response.ok) throw new CloudApiError(response.status, responseBody, response.headers);
  const responseRecord = asRecord(responseBody);
  if (!responseRecord) {
    throw new Error('Airlock Cloud returned an invalid response. Expected a JSON run result.');
  }

  warnIfNearLimit(response.headers, options.warn || ((message) => logger.warn(message)));
  const runId = typeof responseRecord.runId === 'string'
    ? responseRecord.runId
    : typeof responseRecord.run_id === 'string' ? responseRecord.run_id : undefined;
  const status = typeof responseRecord.status === 'string'
    ? responseRecord.status.toUpperCase()
    : response.status === 202 ? 'QUEUED' : undefined;
  const allowedStatuses = new Set(['ACCEPTED', 'QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'POLICY_VIOLATION']);

  if (!runId || !status || !allowedStatuses.has(status)) {
    throw new Error('Airlock Cloud returned an invalid run response. Expected a run ID and supported status.');
  }

  return { ...responseRecord, runId, status } as CloudRunResponse;
}
