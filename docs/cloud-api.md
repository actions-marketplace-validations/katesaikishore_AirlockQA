# Airlock Cloud API (v1)

The hosted service behind `https://api.qbrin.cloud` (also reachable as `https://qbrin.cloud/api`).
The machine-readable contract is [`cloud/shared/contract.ts`](../cloud/shared/contract.ts); this page explains it.

## What the service does

- Accounts: email and password sign-up, one workspace per account.
- API keys for CLI and CI use. A token is shown once; only its SHA-256 hash is stored.
- Hosted browser runs. A run executes a **declarative workflow** (the same `workflow` steps that `airlock run` reads) in an isolated headless browser, with the Airlock request policy attached, and returns signed evidence.
- A free plan with a daily run quota per workspace.

What it deliberately does **not** do: run arbitrary spec code, hold your application secrets (there is no vault), sign in with GitHub or SSO, or post to pull requests.

## Conventions

- JSON in and out. Errors are `{ "code": "...", "message": "...", ... }` with a matching HTTP status. Codes are listed in the contract.
- Authentication is either `Authorization: Bearer air_live_...` (API key) or the `airlock_session` cookie (HttpOnly, Secure, SameSite=Lax). Cookie-authenticated requests that change state must send `X-Airlock-Csrf: 1`.
- Account, key and workspace routes require a session. Run, usage and evidence routes accept either.
- Paths below are relative to the API base (`/v1/...`). Behind `qbrin.cloud/api` the `/api` prefix is stripped by nginx.

## Quota

Each workspace may **accept** `dailyRuns` runs per UTC day (default 100 on the free plan). An accepted run counts even if it later fails. A run cancelled while still queued is refunded, at most 10 refunds per workspace per UTC day (further cancels still work but are not refunded). A run that waits in the queue for more than 30 minutes without a worker is cancelled by the service and refunded, because it never executed. The check and the increment happen in one database transaction, so concurrent submissions cannot exceed the limit.

When the limit is reached, `POST /v1/runs` returns `429` with:

```json
{ "code": "DAILY_QUOTA_EXCEEDED", "message": "...", "quota": { "scope": "workspace", "used": 100, "limit": 100, "remaining": 0, "resetAt": "2026-11-08T00:00:00.000Z" } }
```

Accepted runs and `GET /v1/usage` return `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset` (Unix seconds).

Other free-plan limits: 1 concurrent run, 50 workflow steps, 90 seconds per run, 10 active API keys, and at most (concurrent runs + 5) queued runs per workspace (`429 RATE_LIMITED` beyond that). Submissions are also limited to 60 per minute per API key or session and 60 per minute per workspace.

## Endpoints

### Health and evidence key (no auth)

| Method and path | Result |
| :--- | :--- |
| `GET /health` | `{ ok, version, db, queue: { queued, running } }` |
| `GET /v1/evidence-key` | `{ algorithm: "Ed25519", keyId, publicKeyPem }`. Pin this key when verifying bundles. |
| `POST /v1/evidence/verify` | Body: an evidence bundle (at most 1 MB and 2000 ledger blocks; rate limited). Result: `{ valid, reason?, warnings[] }`, checked against the service key. |

### Accounts (session)

| Method and path | Body | Result |
| :--- | :--- | :--- |
| `POST /v1/auth/signup` | `{ email, password (10+ chars), name? }` | `201 { user, workspace }`, sets the session cookie. `409 EMAIL_TAKEN`, `400 WEAK_PASSWORD`, `429 RATE_LIMITED`. |
| `POST /v1/auth/login` | `{ email, password }` | `200 { user, workspace }`. `401 INVALID_CREDENTIALS`. |
| `POST /v1/auth/logout` | | `204` |
| `GET /v1/auth/me` | | `200 { user, workspace }` or `401 UNAUTHENTICATED` |
| `GET /v1/workspace` | | `{ id, name, plan, createdAt, limits }` |
| `PATCH /v1/workspace` | `{ name }` | the updated workspace |

Email addresses are **not verified** yet (there is no mail service). Sign-ups are rate-limited per client address (IPv6 clients are grouped by /64) and capped per day. Failed logins are limited per client address (10 per 15 minutes), per email and address pair (5 per 15 minutes) and per email overall (30 per 15 minutes); successful logins are not counted.

The server uses `X-Forwarded-For` for client addresses only when `AIRLOCK_TRUST_PROXY` is set (the deployment sets it behind nginx, which must overwrite the header). By default it is off.

### Keys (session)

| Method and path | Result |
| :--- | :--- |
| `GET /v1/keys` | `{ keys: ApiKeyInfo[] }` |
| `POST /v1/keys` `{ name }` | `201 { key: ApiKeyInfo, token }`. The token is returned once. `409 KEY_LIMIT_REACHED` at 10 active keys. |
| `DELETE /v1/keys/:id` | `204`. The key stops working immediately. |

### Runs (key or session)

| Method and path | Result |
| :--- | :--- |
| `POST /v1/runs` | `202 { runId, id, status: "QUEUED", queuePosition, quota }` |
| `GET /v1/runs?limit&status&suite&cursor` | `{ runs: RunSummary[], nextCursor }`. `queuePosition` is the run's rank among your own workspace's queued runs. |
| `GET /v1/runs/:id` | `RunDetail` (steps, request log, evidence summary) |
| `GET /v1/runs/:id/evidence` | The signed bundle (`404` until the run finishes) |
| `POST /v1/runs/:id/cancel` | `RunDetail`. Queued runs are cancelled at once; running runs are stopped at their next heartbeat. |
| `GET /v1/usage` | `UsageInfo` |
| `GET /v1/analytics?days=30` | `{ days: [{ date, runs, success, failed }], totals: { runs, passRate, medianMs, requestsAllowed, requestsBlocked } }` |

#### `POST /v1/runs` body

```json
{
  "suiteName": "checkout",
  "targetUrl": "https://staging.example.com",
  "phantomConfig": {
    "STRIPE_SECRET_KEY": { "phantom": "ph_sec_example_01", "allowedHosts": ["staging.example.com"], "blockedPaths": ["*/refund*"] }
  },
  "workflow": { "name": "checkout", "steps": [ { "action": "goto", "url": "/" }, { "action": "expectVisible", "selector": "#cart" } ] }
}
```

Rules:

- `targetUrl` must be a public `http(s)` address. Private, loopback, link-local and metadata addresses are refused at submission and again by the worker (`POLICY_VIOLATION`, `TARGET_BLOCKED`).
- A property named `real` anywhere in the body is rejected with `REAL_SECRET_REJECTED`. The service also does a best-effort scan of every string value for well-known secret formats and rejects those the same way: `sk_live_` keys, AWS access key ids (`AKIA` plus 16 characters), GitHub `ghp_` tokens, PEM private key blocks and JWT-shaped strings. It cannot detect an arbitrary secret value, so do not send real credentials at all; only placeholders belong in a request. `${env:NAME}` references are rejected with `ENV_REFERENCE_REJECTED`: hosted runs never receive your environment.
- The body may be nested at most 32 levels deep.
- `compiledSpecContent`, `egressPolicyYaml` and other unknown properties are rejected (`INVALID_REQUEST`). Hosted runs execute declarative workflows only.
- `phantomConfig` supplies **policy** (allowed hosts, methods, blocked paths). Phantom placeholders are not swapped for real values, because the service holds no secrets.

#### Run statuses

`QUEUED`, `RUNNING`, `SUCCESS` (every step passed), `FAILED` (a step failed, the run timed out or the browser failed), `POLICY_VIOLATION` (the service guard refused the target or a redirect to it) and `CANCELLED`.

## Evidence

Each finished run has a bundle in the `2.0.0` evidence format, signed with the service's Ed25519 key. Verify it with `airlock audit` and `AIRLOCK_TRUSTED_PUBLIC_KEY` set to the key from `GET /v1/evidence-key`, or with `POST /v1/evidence/verify`. A bundle shows that the recorded ledger was not changed after signing. It does not show that the target application is secure and it is not a compliance assessment.
