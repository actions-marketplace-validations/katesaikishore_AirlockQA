# Cloud API authentication and quota boundary

This document separates what the open-source repository implements from the hosted Cloud and Enterprise services that still need to exist.

## Implemented in this repository

- The open-source CLI can run locally without an Airlock API key.
- `--cloud` requires `AIRLOCK_API_KEY`; there is no demo-key fallback.
- The CLI sends the Cloud key only in `Authorization: Bearer …`, and only over HTTPS (HTTP is allowed for loopback development).
- The run body contains phantom placeholders and egress policy fields, but not `real` application credentials or the Cloud API key.
- The CLI accepts a queued response with either `runId` or `run_id`, prints useful 401/403/429 errors, and warns when rate-limit headers show 20% or less remaining.
- `AIRLOCK_CLOUD_URL` configures the API base URL. The same client can target a separate Enterprise deployment with a key provisioned by that deployment.
- The default API base is `https://api.qbrin.cloud`; the client appends `/v1/runs`.

The CLI does not enforce a quota. Client-side counters can be bypassed and must never be the source of billing or resource authorization.

## Not implemented here

This repository has no Cloud identity service, GitHub OAuth callback, API-key creation/revocation endpoint, Postgres schema, Redis quota/concurrency service, `/v1/runs` server handler, or isolated worker dispatcher. The staging site is a static preview. Consequently:

- No API key can be created or revoked from this repo's UI.
- No 100-runs-per-day limit is currently enforced by the hosted service from this repo.
- No worker resource limit or tenant isolation is provided by the CLI.
- The Cloud run request must not contain a customer's real app secret. A future server-side vault integration is required before hosted secret substitution can work.
- The CLI's acceptance of rate-limit headers is only client feedback; it does not make a server quota atomic or durable.

Do not announce hosted run allowances or cloud-managed Phantom Secrets until the Cloud service implementing these controls is deployed and tested.

## Proposed product policy

The following numbers are the product proposal from the Cloud launch brief, not current entitlements or implemented limits:

| Tier | Per-repository daily ceiling | Workspace daily ceiling | Concurrent workers |
| --- | ---: | ---: | ---: |
| Free | 100 | 100 total | 1 |
| Pro | 100 | 300 total | Set from measured capacity |
| Enterprise | Contracted | Contracted | Deployment-specific |

Enforce both the per-repository and workspace ceilings. Define one accepted worker execution as one run; each parallel worker and each retry is an additional run. Choose limits based on actual measured worker cost, duration, and memory use. Keep a hard execution timeout and container or VM resource ceilings. A daily run count alone does not cap CPU, memory, or unusually expensive suites.

If the service adopts the proposed free limits, it should also return `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` on accepted runs. Rejections should use HTTP 429 with a stable response such as:

```json
{
  "code": "DAILY_QUOTA_EXCEEDED",
  "quota": {
    "scope": "workspace",
    "used": 100,
    "limit": 100,
    "resetAt": "2026-11-07T00:00:00Z"
  }
}
```

The client now formats this response and provides the run ID from either `runId` or `run_id` when the service accepts a run.

The launch brief also proposes exposing the feature set early while limiting cost and retention. Keep this as a product policy proposal until each underlying capability passes its technical acceptance gates:

| Capability | Proposed Free access | Current repo status |
| --- | --- | --- |
| Deterministic self-healing | Included; at most 10 hosted AI calls/day | Local selector-recovery prototype; no hosted LLM quota service |
| Time-travel snapshots | Included; 2-hour snapshot retention | Browser-context checkpoints only; no VM memory snapshots or CoW VM cloning |
| Phantom credential proxy | Included; up to 3 secrets in hosted vault | Local proxy prototype; no hosted secret vault |
| Signed audit evidence | Show run hash/trace preview; downloadable compliance export on paid tiers | Local signing/reporting prototype; no certified SOC 2 or ISO service |

Do not expose a feature as operational in Cloud until the hosting, isolation, retention, and entitlement controls for that feature exist. In particular, browser-context checkpoints must not be labeled VM snapshots.

## Credential and product separation

- **Open-source/local:** the CLI and local runner use the customer's machine/CI resources and do not require an Airlock Cloud key.
- **Airlock Cloud:** a workspace/project-scoped, revocable API key authorizes submission to hosted workers. The service should display a token once, store only a cryptographic hash and safe prefix, and support rotation and revocation. CI providers should inject it as an environment variable; never commit it or put it in a command argument.
- **Enterprise:** use a separate deployment endpoint, tenant store, and deployment-scoped credential/license. Do not reuse Cloud workspace keys as Enterprise licenses.
- **Target application secrets:** these are distinct from the Cloud API key. Keep them in a future server-side secret vault and inject only inside the isolated worker. Do not send them in the CLI run payload.

For GitHub Actions, configure `AIRLOCK_API_KEY` as a repository, organization, or environment secret and expose it to the run step through the `secrets` context. Protect workflows so untrusted fork pull requests do not receive the credential.

## Backend acceptance gates

Before activating the proposed allowances, the hosted service needs:

1. Authenticated workspace/project key issuance and revocation, with hashed key storage and tenant-scoped lookup.
2. An atomic server-side check of per-repository and workspace quotas, plus concurrency/burst control. A failed or raced check must not dispatch a worker.
3. A durable run record and worker queue; counters must be released or finalized correctly on success, failure, timeout, cancellation, and worker crash.
4. Workers isolated from the API/control-plane host, with bounded CPU, memory, process count, duration, and network egress.
5. Integration tests for invalid/revoked keys, cross-tenant IDs, repo/workspace cap races, retries, parallel runs, cleanup, and the structured 429 response.

The local static preview and the TypeScript CLI are not substitutes for those backend gates.
