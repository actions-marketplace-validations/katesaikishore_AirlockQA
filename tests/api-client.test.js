import { describe, expect, it } from 'bun:test';
import { ApiError, createApi } from '../public/api.js';

function jsonResponse(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function fakeFetch(handler) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    return handler(url, init, calls.length);
  };
  return { impl, calls };
}

describe('QAFind Cloud browser API client', () => {
  it('sends requests to the same-origin /api base with the CSRF header and credentials', async () => {
    const { impl, calls } = fakeFetch(() => jsonResponse(200, { ok: true }));
    const api = createApi({ fetch: impl });
    expect(await api.health()).toEqual({ ok: true });
    expect(calls[0].url).toBe('/api/health');
    expect(calls[0].init.method).toBe('GET');
    expect(calls[0].init.credentials).toBe('same-origin');
    expect(calls[0].init.headers['X-QAFind-Csrf']).toBe('1');
    expect(calls[0].init.headers.Accept).toBe('application/json');
    expect(calls[0].init.body).toBeUndefined();
    expect(calls[0].init.headers['Content-Type']).toBeUndefined();
  });

  it('sends JSON bodies with a content type', async () => {
    const { impl, calls } = fakeFetch(() => jsonResponse(201, { user: { id: 'u1' }, workspace: { id: 'w1' } }));
    const api = createApi({ fetch: impl });
    const result = await api.signup('a@example.com', 'correct horse battery', 'Ada');
    expect(result.user.id).toBe('u1');
    expect(calls[0].url).toBe('/api/v1/auth/signup');
    expect(calls[0].init.method).toBe('POST');
    expect(calls[0].init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(calls[0].init.body)).toEqual({ email: 'a@example.com', password: 'correct horse battery', name: 'Ada' });

    await api.login('a@example.com', 'pw');
    expect(calls[1].url).toBe('/api/v1/auth/login');
    expect(JSON.parse(calls[1].init.body)).toEqual({ email: 'a@example.com', password: 'pw' });
  });

  it('omits an empty optional name and encodes ids and query strings', async () => {
    const { impl, calls } = fakeFetch(() => jsonResponse(200, {}));
    const api = createApi({ fetch: impl });
    await api.signup('a@example.com', 'correct horse battery');
    expect(JSON.parse(calls[0].init.body)).toEqual({ email: 'a@example.com', password: 'correct horse battery' });
    await api.runs.get('run/1 2');
    expect(calls[1].url).toBe('/api/v1/runs/run%2F1%202');
    await api.runs.list({ limit: 10, status: '', suite: undefined, cursor: 'a b' });
    expect(calls[2].url).toBe('/api/v1/runs?limit=10&cursor=a%20b');
  });

  it('turns error responses into ApiError with status, code, issues and quota', async () => {
    const quota = { scope: 'workspace', used: 100, limit: 100, remaining: 0, resetAt: '2026-11-08T00:00:00.000Z' };
    const { impl } = fakeFetch((url) => {
      if (url.endsWith('/v1/runs')) return jsonResponse(429, { code: 'DAILY_QUOTA_EXCEEDED', message: 'Daily limit reached', quota });
      return jsonResponse(400, { code: 'WEAK_PASSWORD', message: 'Too short', issues: [{ path: ['password'] }] });
    });
    const api = createApi({ fetch: impl });

    const quotaError = await api.runs.create({ suiteName: 's', targetUrl: 'https://example.com' }).catch((e) => e);
    expect(quotaError).toBeInstanceOf(ApiError);
    expect(quotaError.status).toBe(429);
    expect(quotaError.code).toBe('DAILY_QUOTA_EXCEEDED');
    expect(quotaError.message).toBe('Daily limit reached');
    expect(quotaError.quota).toEqual(quota);
    expect(quotaError.issues).toBeNull();

    const weak = await api.signup('a@example.com', 'short').catch((e) => e);
    expect(weak.code).toBe('WEAK_PASSWORD');
    expect(weak.issues).toEqual([{ path: ['password'] }]);
    expect(weak.quota).toBeNull();
  });

  it('falls back to a generic ApiError when the error body is not JSON', async () => {
    const { impl } = fakeFetch(() => new Response('<html>Bad gateway</html>', { status: 502 }));
    const error = await createApi({ fetch: impl }).health().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
    expect(error.code).toBe('INTERNAL');
    expect(error.message).toContain('502');
  });

  it('me() resolves to the session, or null on 401, and rethrows other errors', async () => {
    let status = 200;
    const { impl } = fakeFetch(() =>
      status === 200
        ? jsonResponse(200, { user: { id: 'u1', email: 'a@example.com' }, workspace: { id: 'w1' } })
        : jsonResponse(status, { code: status === 401 ? 'UNAUTHENTICATED' : 'INTERNAL', message: 'nope' })
    );
    const api = createApi({ fetch: impl });
    expect((await api.me()).user.email).toBe('a@example.com');
    status = 401;
    expect(await api.me()).toBeNull();
    status = 500;
    const error = await api.me().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
  });

  it('returns null for 204 responses without reading a body', async () => {
    const { impl, calls } = fakeFetch(() => new Response(null, { status: 204 }));
    const api = createApi({ fetch: impl });
    expect(await api.logout()).toBeNull();
    expect(calls[0].init.method).toBe('POST');
    expect(calls[0].url).toBe('/api/v1/auth/logout');
    expect(await api.keys.revoke('key_1')).toBeNull();
    expect(calls[1].init.method).toBe('DELETE');
  });

  it('reports network failures as ApiError with status 0', async () => {
    const api = createApi({
      fetch: async () => {
        throw new TypeError('Failed to fetch');
      },
    });
    const error = await api.login('a@example.com', 'pw').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.code).toBe('INTERNAL');
    expect(error.message).toContain('Cannot reach QAFind Cloud');
    // me() must not hide an outage as "signed out".
    expect(await api.me().catch((e) => e)).toBeInstanceOf(ApiError);
  });
});
