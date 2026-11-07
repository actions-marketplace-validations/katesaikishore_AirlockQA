import { describe, expect, it } from 'bun:test';
import { runQaPipeline, type PipelineBackends, type PhaseName } from '../src/qa/pipeline.js';

/** Stub backends that record every call, so the tests can check order and cleanup. */
function stubs(over: Partial<Record<PhaseName, () => Promise<void>>> = {}) {
  const calls: string[] = [];
  const ok = (name: string) => async () => {
    calls.push(name);
  };
  const backends: PipelineBackends = {
    lease: over.lease ?? ok('lease'),
    build: over.build ?? ok('build'),
    unit: over.unit ?? ok('unit'),
    start: over.start ?? ok('start'),
    smoke: over.smoke ?? ok('smoke'),
    e2e: over.e2e ?? ok('e2e'),
    integration: over.integration ?? ok('integration'),
    release: over.release ?? ok('release'),
  } as any;
  return { calls, backends };
}

const SUITES = ['unit', 'e2e'] as const;

describe('qa pipeline: integration', () => {
  it('runs integration after a green unit suite, before the app starts', async () => {
    const { calls, backends } = stubs();
    const r = await runQaPipeline({ suites: ['unit', 'integration', 'smoke'], gate: 'default', backends });
    expect(calls.indexOf('unit')).toBeLessThan(calls.indexOf('integration'));
    expect(r.suites.find((s) => s.suite === 'integration')).toMatchObject({ status: 'PASS' });
  });

  it('a unit failure stops integration, which is reported NOT_RUN', async () => {
    const { calls, backends } = stubs({ unit: async () => { throw new Error('x'); } });
    const r = await runQaPipeline({ suites: ['unit', 'integration'], gate: 'default', backends });
    expect(calls).not.toContain('integration');
    expect(r.suites.find((s) => s.suite === 'integration')).toMatchObject({ status: 'NOT_RUN' });
  });

  it('a failing integration suite is a failure, not a pass', async () => {
    const { backends } = stubs({ integration: async () => { throw new Error('y'); } });
    const r = await runQaPipeline({ suites: ['integration'], gate: 'strict', backends });
    expect(r.suites.find((s) => s.suite === 'integration')).toMatchObject({ status: 'FAIL' });
    expect(r.exitCode).toBe(1);
  });
});

describe('qa pipeline: order and cleanup', () => {
  it('runs LEASE, BUILD, UNIT, START, SMOKE, E2E, RELEASE in that order on a green run', async () => {
    const { calls, backends } = stubs();
    const r = await runQaPipeline({ suites: [...SUITES], gate: 'default', backends });
    expect(calls).toEqual(['lease', 'build', 'unit', 'start', 'smoke', 'e2e', 'release']);
    expect(r.exitCode).toBe(0);
    expect(r.phase).toBe('DONE');
  });

  it('a unit failure skips e2e (NOT_RUN, blocked by unit) and still releases the slot', async () => {
    const { calls, backends } = stubs({ unit: async () => { throw new Error('2 tests failed'); } });
    const r = await runQaPipeline({ suites: [...SUITES], gate: 'default', backends });
    expect(calls).not.toContain('e2e');
    expect(calls.at(-1)).toBe('release');
    expect(r.suites.find((s) => s.suite === 'e2e')).toMatchObject({ status: 'NOT_RUN' });
    expect(r.exitCode).toBe(0); // default gate: a unit failure warns
  });

  it('a unit failure under the strict gate exits 1', async () => {
    const { backends } = stubs({ unit: async () => { throw new Error('boom'); } });
    expect((await runQaPipeline({ suites: [...SUITES], gate: 'strict', backends })).exitCode).toBe(1);
  });

  it('a build failure ends BUILD_FAILED, never starts the app, and still releases', async () => {
    const { calls, backends } = stubs({ build: async () => { throw new Error('npm ci failed'); } });
    const r = await runQaPipeline({ suites: [...SUITES], gate: 'default', backends });
    expect(r.phase).toBe('BUILD_FAILED');
    expect(calls).not.toContain('start');
    expect(calls.at(-1)).toBe('release');
    expect(r.exitCode).toBe(1);
  });

  it('an unhealthy app (smoke fails) ends DEPLOY_UNHEALTHY and releases the slot', async () => {
    const { calls, backends } = stubs({ smoke: async () => { throw new Error('HTTP 503'); } });
    const r = await runQaPipeline({ suites: [...SUITES], gate: 'default', backends });
    expect(r.phase).toBe('DEPLOY_UNHEALTHY');
    expect(calls.at(-1)).toBe('release');
    expect(calls).not.toContain('e2e');
  });

  it('releases the slot even when a phase throws something unexpected', async () => {
    const { calls, backends } = stubs({ start: async () => { throw new Error('EADDRINUSE'); } });
    const r = await runQaPipeline({ suites: [...SUITES], gate: 'default', backends });
    expect(calls.at(-1)).toBe('release');
    expect(r.phase).toBe('DEPLOY_UNHEALTHY');
  });

  it('a lease that is refused ends the run without touching the build or the app', async () => {
    const { calls, backends } = stubs({ lease: async () => { throw new Error('capacity: concurrency'); } });
    const r = await runQaPipeline({ suites: [...SUITES], gate: 'default', backends });
    expect(r.phase).toBe('SLOT_UNAVAILABLE');
    expect(calls).toEqual([]); // no release either: nothing was leased
  });

  it('cancellation mid-build stops the run and releases the slot', async () => {
    const controller = new AbortController();
    const { calls, backends } = stubs({
      build: async () => {
        controller.abort();
        await new Promise((resolve) => setTimeout(resolve, 5));
      },
    });
    const r = await runQaPipeline({ suites: [...SUITES], gate: 'default', backends, signal: controller.signal });
    expect(r.phase).toBe('CANCELLED');
    expect(calls).not.toContain('unit');
    expect(calls.at(-1)).toBe('release');
  });

  it('a release that fails is reported, not hidden', async () => {
    const { backends } = stubs({ release: async () => { throw new Error('nginx -t failed'); } });
    const r = await runQaPipeline({ suites: [...SUITES], gate: 'default', backends });
    expect(r.releaseError).toMatch(/nginx/);
    expect(r.exitCode).toBe(1);
  });

  it('every phase and suite the run did not reach is listed, never green', async () => {
    const { backends } = stubs({ build: async () => { throw new Error('x'); } });
    const r = await runQaPipeline({ suites: [...SUITES], gate: 'default', backends });
    expect(r.suites.every((s) => s.status === 'NOT_RUN' || s.status === 'BLOCKED')).toBe(true);
  });
});

const EXTRA = ['a11y', 'security', 'load', 'explore'] as const;

/** Stubs plus one extra-suite backend per name. Every call is recorded in the same list as the core phases. */
function withExtras(over: Partial<Record<string, () => Promise<void>>> = {}) {
  const { calls, backends } = stubs();
  const extras: Record<string, () => Promise<void>> = {};
  for (const name of EXTRA) {
    extras[name] = over[name] ?? (async () => {
      calls.push(name);
    });
  }
  return { calls, backends: { ...backends, extras } as PipelineBackends };
}

describe('qa pipeline: extra suites (a11y, security, load, explore)', () => {
  it('runs each requested extra suite after e2e, against the started app, and reports PASS', async () => {
    const { calls, backends } = withExtras();
    const r = await runQaPipeline({ suites: ['unit', 'e2e', 'a11y', 'security', 'load', 'explore'], gate: 'default', backends });
    expect(calls).toEqual(['lease', 'build', 'unit', 'start', 'smoke', 'e2e', 'a11y', 'security', 'load', 'explore', 'release']);
    for (const name of EXTRA) {
      expect(r.suites.find((s) => s.suite === name)).toMatchObject({ status: 'PASS' });
    }
    expect(r.exitCode).toBe(0);
  });

  it('a failing extra suite is FAIL, the suites after it are NOT_RUN, and a strict gate exits 1', async () => {
    const { calls, backends } = withExtras({ a11y: async () => { throw new Error('2 serious violations'); } });
    const r = await runQaPipeline({ suites: ['a11y', 'load', 'smoke'], gate: 'strict', backends });
    expect(r.suites.find((s) => s.suite === 'a11y')).toMatchObject({ status: 'FAIL' });
    expect(r.suites.find((s) => s.suite === 'load')).toMatchObject({ status: 'NOT_RUN' });
    expect(calls).not.toContain('load');
    expect(r.phase).toBe('TESTS_FAILED');
    expect(r.exitCode).toBe(1);
    expect(calls.at(-1)).toBe('release');
  });

  it('under the default gate a failing extra suite is a warning, not a failed run', async () => {
    const { backends } = withExtras({ security: async () => { throw new Error('missing HSTS'); } });
    const r = await runQaPipeline({ suites: ['security'], gate: 'default', backends });
    expect(r.suites.find((s) => s.suite === 'security')).toMatchObject({ status: 'FAIL' });
    expect(r.exitCode).toBe(0);
    expect(r.reasons.join(' ')).toMatch(/warning: suite security failed/);
  });

  it('extra suites do not run after a unit failure: they are NOT_RUN and the slot is still released', async () => {
    const { calls, backends } = withExtras();
    backends.unit = async () => {
      throw new Error('1 test failed');
    };
    const r = await runQaPipeline({ suites: ['unit', 'a11y'], gate: 'default', backends });
    expect(calls).not.toContain('a11y');
    expect(r.suites.find((s) => s.suite === 'a11y')).toMatchObject({ status: 'NOT_RUN' });
    expect(calls.at(-1)).toBe('release');
  });

  it('an extra suite with no backend is NOT_RUN, never PASS', async () => {
    const { backends } = stubs();
    const r = await runQaPipeline({ suites: ['explore', 'smoke'], gate: 'strict', backends: { ...backends, extras: {} } });
    expect(r.suites.find((s) => s.suite === 'explore')).toMatchObject({ status: 'NOT_RUN' });
    expect(r.exitCode).toBe(1);
  });
});

describe('qa pipeline: continue on failure', () => {
  function withExtras(over: Partial<Record<PhaseName, () => Promise<void>>> = {}, extraFail: string[] = []) {
    const { calls, backends } = stubs(over);
    const extras: Record<string, () => Promise<void>> = {};
    for (const name of ['a11y', 'security', 'load', 'explore']) {
      extras[name] = async () => {
        calls.push(name);
        if (extraFail.includes(name)) throw new Error(`${name} failed`);
      };
    }
    return { calls, backends: { ...backends, extras } as PipelineBackends };
  }
  const SUITES_ALL = ['unit', 'e2e', 'a11y', 'security', 'load', 'explore'];

  it('by default, a unit failure stops the extra suites (existing behaviour)', async () => {
    const { calls, backends } = withExtras({ unit: async () => { throw new Error('x'); } });
    const r = await runQaPipeline({ suites: SUITES_ALL, gate: 'default', backends });
    expect(calls).not.toContain('a11y');
    expect(r.suites.find((s) => s.suite === 'a11y')).toMatchObject({ status: 'NOT_RUN' });
  });

  it('with continueOnFailure, a unit failure still runs the extra suites', async () => {
    const { calls, backends } = withExtras({ unit: async () => { throw new Error('x'); } });
    const r = await runQaPipeline({ suites: SUITES_ALL, gate: 'default', backends, continueOnFailure: true });
    expect(calls).toEqual(expect.arrayContaining(['a11y', 'security', 'load', 'explore']));
    expect(r.suites.find((s) => s.suite === 'unit')).toMatchObject({ status: 'FAIL' });
    expect(r.suites.find((s) => s.suite === 'e2e')).toMatchObject({ status: 'NOT_RUN' }); // still depends on unit
    expect(r.phase).toBe('TESTS_FAILED');
    expect(calls.at(-1)).toBe('release');
  });

  it('with continueOnFailure, one failing extra does not stop the next extra', async () => {
    const { calls, backends } = withExtras({}, ['a11y']);
    const r = await runQaPipeline({ suites: SUITES_ALL, gate: 'default', backends, continueOnFailure: true });
    expect(calls).toEqual(expect.arrayContaining(['security', 'load', 'explore']));
    expect(r.suites.find((s) => s.suite === 'a11y')).toMatchObject({ status: 'FAIL' });
    expect(r.suites.find((s) => s.suite === 'explore')).toMatchObject({ status: 'PASS' });
  });

  it('with continueOnFailure, a build failure still stops everything', async () => {
    const { calls, backends } = withExtras({ build: async () => { throw new Error('npm ci'); } });
    const r = await runQaPipeline({ suites: SUITES_ALL, gate: 'default', backends, continueOnFailure: true });
    expect(r.phase).toBe('BUILD_FAILED');
    expect(calls).not.toContain('a11y');
    expect(calls.at(-1)).toBe('release');
  });

  it('with continueOnFailure, an unhealthy app (smoke) still stops everything', async () => {
    const { calls, backends } = withExtras({ smoke: async () => { throw new Error('502'); } });
    const r = await runQaPipeline({ suites: SUITES_ALL, gate: 'default', backends, continueOnFailure: true });
    expect(r.phase).toBe('DEPLOY_UNHEALTHY');
    expect(calls).not.toContain('a11y');
    expect(calls.at(-1)).toBe('release');
  });
});
