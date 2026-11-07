# AirlockQA: Complete User & Operator Guide

> **Zero-Trust, Self-Healing, Time-Traveling Browser Test Automation & Compliance Ledger**

This guide provides end-to-end instructions for installing, configuring, running, and deploying **AirlockQA** across local machines, CI/CD runners, and cloud endpoints.

---

## Table of Contents

1. [Architectural Model](#1-architectural-model)
2. [Prerequisites & Installation](#2-prerequisites--installation)
3. [Configuration Reference (`airlock.config.json`)](#3-configuration-reference-airlockconfigjson)
4. [Core CLI Commands](#4-core-cli-commands)
   - [`airlock init`](#airlock-init)
   - [`airlock explore [url]`](#airlock-explore-url)
   - [`airlock compile <tracePath>`](#airlock-compile-tracepath)
   - [`airlock test [--local | --cloud]`](#airlock-test---local----cloud)
   - [`airlock run`](#airlock-run)
   - [`airlock fork <checkpointName>`](#airlock-fork-checkpointname)
   - [`airlock warp <duration>`](#airlock-warp-duration)
   - [`airlock chaos [url]`](#airlock-chaos-url)
   - [`airlock teleport <capsulePath>`](#airlock-teleport-capsulepath)
   - [`airlock audit [bundlePath]`](#airlock-audit-bundlepath)
   - [`airlock dataset`](#airlock-dataset)
   - [`airlock serve [-p <port>]`](#airlock-serve--p-port)
5. [CI/CD Workflow Integration](#5-cicd-workflow-integration)
6. [Web Console & Staging GUI QA](#6-web-console--staging-gui-qa)
7. [Cloud Quotas & Security Model](#7-cloud-quotas--security-model)

---

## 1. Architectural Model

AirlockQA distinguishes between **Local Execution** and the optional hosted service, **Airlock Cloud**:

| Mode | Where Tests Run | Credentials Needed | Quota & Compute |
| :--- | :--- | :--- | :--- |
| **Open-Source Local** | User laptop or CI runner | None (`--local`) | Free, unbounded local execution |
| **Airlock Cloud** | Isolated headless browser on the hosted service | API key from the console (`airlock login`) | Free plan: 100 runs per workspace per day, one at a time |
| **Another deployment** | A deployment of the service that you operate | Its key and `AIRLOCK_CLOUD_URL` | Set by its operator |

```
                       ┌─────────────────────────┐
                       │     AirlockQA CLI       │
                       └────────────┬────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────┐                           ┌─────────────────────┐
│  --local (Free)     │                           │  --cloud / API      │
│  Local Playwright   │                           │  Hosted browser     │
│  Browser Context    │                           │  Bearer Token Auth  │
└──────────┬──────────┘                           └──────────┬──────────┘
           │                                                 │
           ▼                                                 ▼
┌─────────────────────┐                           ┌─────────────────────┐
│ Egress Guard &      │                           │ Merkle Proof &      │
│ Phantom Tokens      │                           │ Attestation Bundle  │
└─────────────────────┘                           └─────────────────────┘
```

---

## 2. Prerequisites & Installation

### Requirements
- **Bun** (>= 1.1) or **Node.js** (>= 18)
- **Chromium** (Playwright-managed)

### Install Dependencies
Clone the repository and install packages:

```bash
git clone https://github.com/katesaikishore/AirlockQA.git
cd AirlockQA
bun install
```

Install the Playwright browser binary (skip this if `browser.executablePath` points at an installed Chrome; on macOS the CLI uses `/Applications/Google Chrome.app` automatically):
```bash
bunx playwright install chromium
```

`airlock test --local` and `airlock run <specPath>` run specs with Playwright Test, so install `@playwright/test` as well:
```bash
bun add -d @playwright/test
```

Build the TypeScript distribution:
```bash
bun run build
```

Run test suite to verify everything is green:
```bash
bun test
```

---

## 3. Configuration Reference (`airlock.config.json`)

Running `bun run cli init` (or `npx airlock init`) generates a default configuration file:

```json
{
  "projectName": "Acme SaaS QA",
  "baseUrl": "http://localhost:3000",
  "browser": {
    "headless": true,
    "viewport": { "width": 1280, "height": 800 }
  },
  "proxy": {
    "enabled": true,
    "port": 8899
  },
  "secrets": {
    "STRIPE_KEY": {
      "realFromEnv": "STRIPE_SECRET_KEY",
      "real": "REPLACE_ME_API_TOKEN",
      "phantom": "ph_sec_stripe_test_placeholder",
      "allowedHosts": ["localhost", "127.0.0.1", "api.stripe.com"],
      "allowedMethods": ["GET", "POST"],
      "blockedPaths": ["*/refunds*", "*/transfers*", "*/wipe*"]
    }
  },
  "policy": {
    "defaultAction": "BLOCK",
    "allowedEgressHosts": ["127.0.0.1", "localhost", "api.stripe.com"],
    "blockedEgressHosts": ["pastebin.com", "webhook.site", "transfer.sh"],
    "rules": [
      {
        "id": "block-destructive-refunds",
        "description": "Prevent accidental refunds or wipes during test runs",
        "hostPattern": "*",
        "blockedPaths": ["*/refunds*", "*/wipe*", "*/delete-all*"],
        "action": "BLOCK"
      }
    ],
    "logPayloads": true
  },
  "compiler": {
    "outputDir": "./examples/tests",
    "defaultTimeoutMs": 10000,
    "emitAriaFallbacks": true
  },
  "healer": {
    "autoHeal": true,
    "confidenceThreshold": 0.8,
    "datasetDir": "./.airlock/dataset",
    "saveMutations": true
  },
  "forker": {
    "checkpointsDir": "./.airlock/checkpoints",
    "maxParallelForks": 5
  },
  "compliance": {
    "outputDir": "./.airlock/compliance",
    "generateHtmlReport": true
  }
}
```

`compliance.signingKey` has no default and is intentionally left out of the sample: keep it out of committed files and supply it from a local, untracked config. Each secret's real value is read from the environment variable named by `realFromEnv`; the literal `real` value is only a fallback placeholder. Set `browser.executablePath` or `AIRLOCK_CHROME_PATH` to use a specific Chrome build. Set `AIRLOCK_CHECKPOINT_KEY` to encrypt saved browser-state checkpoints (they contain cookies and storage).

### Request policy rules
1. **Phantom placeholders in the browser**: the browser only sees `phantom` values. The real value lives in the runner process and is substituted by the gateway after policy allows the request. Real values are sent upstream by the runner's own HTTP client (`context.request.fetch`), never by the browser. If that forwarding fails, the browser request is aborted and reported; it is not retried through the browser.
2. **Secret host binding**: a request that carries a phantom token for a host outside that secret's `allowedHosts` is blocked with 403. An empty `allowedHosts` list allows no host.
3. **Path and method rules**: requests that match blocked paths (like `*/refund*` or `*/wipe*`) or disallowed methods get a 403 response.
4. **Value validation**: `real` and `phantom` must each be at least 8 characters, and no configured value may contain another. Invalid secrets fail at startup.
5. **Host patterns**: `api.example.com` (that host, any port), `*.example.com` (the domain and its subdomains, any port), `host:port` (that port only; a URL without a port uses 80/443), or `*`.

What it does not do: substitution and sanitizing are exact string matches in text bodies (`text/*`, JSON, form, XML, JavaScript). Binary bodies pass through unchanged, and encoded or transformed secrets are not detected. Only traffic routed through the Playwright context or the standalone proxy is covered. See the README section "Request policy limits" for the proxy and container details.

---

## 4. Core CLI Commands

Use `bun run cli <command>` or `npx airlock <command>`:

### `airlock init`
Initializes a new `airlock.config.json` with sample policies and directory scaffolding (`.airlock/checkpoints`, `.airlock/compliance`, `.airlock/traces`).

```bash
bun run cli init
```

---

### `airlock explore [url]`
Opens a visible Chromium window at `url` (default: `baseUrl`) and records what you do in it: clicks, typing (one `fill` per field with its final value), special key presses (Enter, Tab, Escape, arrows, shortcuts) and `<select>` changes. Each step stores a selector that matches exactly the element you used, plus an element fingerprint (tag, role, test id, text, attributes, position). URLs you open directly are recorded as `goto` steps. Text typed into password fields is saved as `<redacted-password>`.

Close the browser window, or press Ctrl+C in the terminal, to stop. The trace is then written to `.airlock/traces/<name>-trace.json`.

```bash
bun run cli explore http://localhost:3000 --name checkout-flow
bun run cli explore http://localhost:3000 --out ./traces/checkout.json
```

| Option | Description |
| :--- | :--- |
| `-n, --name <name>` | Suite name stored in the trace (default: `explore-<host>`) |
| `-o, --out <path>` / `--output <path>` | Trace output path |
| `--headless` | Record without a visible window (for scripted sessions) |

---

### `airlock compile <tracePath>`
Compiles a recorded trace into a Playwright TypeScript spec with multi-attribute fallback locators. Writes to `compiler.outputDir/<suite>.spec.ts` unless `--out` (or `--output`) is given. Exits with code 1 when the trace is missing or invalid.

```bash
bun run cli compile .airlock/traces/checkout-flow-trace.json --out ./tests/checkout.spec.ts
```

---

### `airlock test [specPath] [--local | --cloud]`
Routes test execution to Playwright Test on your machine or to the remote Airlock Cloud API.

#### 1. Local run
Runs the spec file or directory with Playwright Test (default: `compiler.outputDir`). `--url` sets Playwright's `baseURL`, so `page.goto('/')` opens your app. The command exits with Playwright's exit code, so it is non-zero when any test fails.

`@playwright/test` must be installed next to `airlockqa` (it is a peer dependency):
```bash
bun add -d @playwright/test
bun run cli test --local ./tests/checkout.spec.ts --url http://localhost:3000
```

To get the Airlock gateway (phantom credential swap, request policy) and a signed evidence bundle in every test, import `test` from the Airlock fixture instead of `@playwright/test`:

```ts
import { test, expect } from 'airlockqa/dist/src/testing/airlock-test.js';

test('checkout', async ({ page, airlock }) => {
  await page.goto('/');
  airlock.step('CLICK', 'checkout');            // optional: record a step in the ledger
  await page.getByTestId('checkout-btn').click();
  await expect(page.getByTestId('status')).toContainText('Paid');
});
```

The fixture is automatic, so the gateway is attached even when a test does not use `airlock`. After each test the bundle is attached to the Playwright result as `airlock-evidence`. Playwright output goes to `.airlock/playwright/` (JSON results in `results.json`).

#### 2. Cloud Run (hosted workflow):
```bash
bun run cli login            # paste a key created in the console under CI/CD & API (input is hidden)
bun run cli test --cloud --url https://staging.example.com --workflow workflow.json
bun run cli runs             # recent hosted runs; `runs <id>` shows one with its steps
bun run cli usage            # today's run count and limits
```

Hosted runs execute the **declarative workflow** (from `--workflow <file>` or the config's `workflow`; with neither, a smoke check that opens the URL). Spec files are not uploaded. The target must be a public address, and workflows may not use `${env:NAME}`. `test --cloud` waits for the result (`--no-wait` to return at once, `--timeout <seconds>`), downloads the evidence to `.airlock/compliance/cloud-<runId>.json` and verifies it against the signing key pinned by `airlock login`.

The suite name sent to the API is `--suite <name>`, else the spec file name (`checkout`), else `projectName` from the config. A run reported as `FAILED`, `POLICY_VIOLATION` or `CANCELLED` sets exit code 1. In CI, set `AIRLOCK_API_KEY` from a secret instead of running `login`.

*Note: The CLI transmits your key only as `Authorization: Bearer <key>` over HTTPS (HTTP only for localhost), never to an endpoint other than the one it was saved for. Real application secrets are never part of the cloud request.*

#### 3. Another endpoint:
```bash
export AIRLOCK_CLOUD_URL="https://airlock.example.org"   # a deployment of the service that you operate
export AIRLOCK_API_KEY="air_live_key_issued_by_that_deployment"
bun run cli test --cloud
```

---

### `airlock run [specPath]`
Runs the `workflow` defined in `airlock.config.json` (or in a file passed with `--workflow`) in one browser with the Airlock gateway attached, then writes a signed evidence bundle. With a `specPath` it runs that spec with Playwright Test instead, like `test --local`.

Execution stops at the first failing step and the command exits with code 1.

```json
{
  "workflow": {
    "name": "checkout",
    "steps": [
      { "action": "goto", "url": "/" },
      { "action": "fill", "selector": "input[name=\"email\"]", "value": "${env:QA_EMAIL}" },
      { "action": "fill", "selector": "input[name=\"password\"]", "value": "${env:QA_PASSWORD}" },
      { "action": "click", "selector": "button[type=\"submit\"]" },
      { "action": "checkpoint", "name": "post_auth" },
      { "action": "click", "selector": "[data-testid=\"add-pro-plan\"]" },
      { "action": "expectText", "selector": "[data-testid=\"cart-total\"]", "text": "$50.00" },
      { "action": "checkpoint", "name": "cart_ready" },
      { "action": "request", "method": "POST", "url": "/api/admin/refund",
        "phantomSecret": "STRIPE_SECRET_KEY", "body": { "chargeId": "ch_1" }, "expectStatus": 403 }
    ]
  }
}
```

| Step | Fields | Fails when |
| :--- | :--- | :--- |
| `goto` | `url` (relative to `baseUrl` or absolute) | navigation fails |
| `click`, `fill`, `press`, `select` | `selector`, plus `value` / `key` | the element is not found or not actionable |
| `waitFor` | `selector`, `state` (`visible` by default) | the state is not reached |
| `expectVisible` | `selector` | the element is not visible |
| `expectText` | `selector`, `text` | the element's text does not contain `text` |
| `checkpoint` | `name` | the checkpoint cannot be saved (used later by `airlock fork`) |
| `request` | `url`, `method`, `headers`, `body`, `phantomSecret`, `expectStatus` | the status differs from `expectStatus`, or the request errors |

`request` steps are sent with `fetch` from the page, so they pass through the gateway. Use `expectStatus: 403` to prove that a destructive endpoint is blocked. `${env:NAME}` in any string is replaced with the environment variable; an unset variable fails the step. Step logs show the uninterpolated value.

The step timeout is `compiler.defaultTimeoutMs`.

The evidence bundle uses spec 2.0.0 with the ledger embedded; see [`airlock audit`](#airlock-audit-bundlepath) for signing keys.

```bash
QA_EMAIL=qa@example.com QA_PASSWORD=... bun run cli run --url http://localhost:3000
bun run cli run --workflow ./workflows/refund-guard.json
```

---

### `airlock fork <checkpointName>`
Restores a saved checkpoint (for example `cart_ready` from a `run` workflow) into parallel browser contexts and tries one input value per context, without repeating login or navigation. Each variation fills `--input`, clicks `--action` and then checks the expectation. Every action and expectation counts as a check; the command exits with code 1 if any variation fails.

```bash
bun run cli fork cart_ready \
  --input '[data-testid="coupon-input"]' --action '[data-testid="apply-coupon-btn"]' \
  --values 'AIRLOCK20,VIP50,EXPIRED2020' --expect-selector '#coupon-status' --expect-text '✔'
```

Or describe the variations in a JSON file (flags override file values):

```json
{
  "inputSelector": "[data-testid=\"coupon-input\"]",
  "actionSelector": "[data-testid=\"apply-coupon-btn\"]",
  "expect": { "selector": "#coupon-status", "text": "applied" },
  "variations": [
    { "id": "vip", "value": "VIP50" },
    { "id": "expired", "value": "EXPIRED2020", "expect": { "selector": "#coupon-status", "text": "Invalid" } }
  ]
}
```

```bash
bun run cli fork cart_ready --variations ./coupon-variations.json --workers 2
```

`--workers <n>` limits how many variations are run.

---

### `airlock warp <duration>`
Fast-forwards the virtual browser clock across Date offsets without waiting real time. Ideal for testing 14-day trials, subscription renewals, or expiration countdowns.

```bash
bun run cli warp "+14 days"
bun run cli warp "+1 hour"
```

---

### `airlock chaos [url]`
Clicks `--action` once (after optional setup steps), observes the matching mutation request and reports whether it carried an idempotency key (`Idempotency-Key` or `X-Idempotency-Key`). It does not replay requests or inject faults. The command exits with code 1 if the click fails, no matching request is seen, or the request has no idempotency key.

```bash
bun run cli chaos http://localhost:3000 --action '[data-testid="checkout-btn"]' --endpoint '/api/checkout'
bun run cli chaos --file ./chaos-checkout.json
```

The JSON file can set `url`, `actionSelector`, `endpointPattern` (a regular expression) and `setup`, a list of `run` workflow steps executed first (for example login and add-to-cart).

---

### `airlock teleport <capsulePath>`
Reads a browser-state capsule and generates a Playwright reproduction spec in `compiler.outputDir` (or `--out` / `--output`). Exits with code 1 when the capsule is missing or invalid.

```bash
bun run cli teleport .airlock/traces/crash-capsule.json --out ./tests/repro-bug.spec.ts
```

---

### `airlock qa [--suites <list>] [--gate strict|default] [--continue-on-failure] [--dry-run] [--wait]`
Runs QA on the **pushed** commit of the repository you are in, in Airlock Cloud.

- `--dry-run` prints the exact request that would be sent and sends nothing. It checks that the remote is a public `https://github.com/<owner>/<repo>` URL, that the commit is on GitHub, and that every script name is a plain npm script name (never a shell command).
- Without `--dry-run`, the request is submitted with your saved key (`airlock login`) or `AIRLOCK_API_KEY`.
- `--wait` waits for the run to finish. The exit code is `0` only if the run succeeded and the gate passed.
- `--suites` takes any of `unit`, `integration`, `e2e`, `smoke`, `a11y`, `security`, `load`, `explore`. `smoke` (the build, start and health check) always runs first. `integration` and `e2e` run only after a green `unit` suite. The `a11y`, `security` and `load` suites run only when the request names a script for them (for example `scripts["test:security"]`); otherwise they are reported as `NOT_RUN` with a reason, never as a pass. `explore` runs Airlock's own checker (below) unless you name a `test:explore` script.
- `--continue-on-failure` keeps the extra suites running after a failing test suite (a unit or e2e failure, for example). Build, start and smoke failures still stop the run, because the app cannot be tested without them. Without the flag, the first failing suite stops the extra suites, which are reported as `NOT_RUN`.
- Only one QA run may be queued or running on the shared staging host at a time. Each account has a separate daily QA quota (5 by default).

```bash
airlock qa --dry-run
airlock qa --wait --gate strict
airlock qa --wait --suites unit,e2e,a11y,security --continue-on-failure
```

The `qa` block in `airlock.config.json` tells the cloud how to build, start and test your app. Every value in `scripts` is the **name** of an npm script in your `package.json`, never a shell command:

```json
{
  "qa": {
    "port": 3000,
    "healthPath": "/health",
    "scripts": {
      "start": "start",
      "test": "test",
      "test:integration": "test:integration",
      "test:e2e": "test:e2e",
      "test:a11y": "test:a11y",
      "test:security": "test:security",
      "test:load": "test:load",
      "test:explore": "test:explore"
    }
  }
}
```

| Key | Default | Notes |
| --- | --- | --- |
| `healthPath` | `/` | The smoke check asks for this path and needs a 2xx answer. |
| `port` | `3000` | The port your app listens on inside the sandbox; `PORT` is set to it. |
| `scripts.start` | `npm start` | Starts the app. It must listen on `0.0.0.0` at `port`. |
| `scripts.test` | `test` | The `unit` suite. |
| `scripts["test:integration"]`, `scripts["test:e2e"]` | as named | Used by the `integration` and `e2e` suites. `e2e` runs against the started app (`BASE_URL` is set). |
| `scripts["test:a11y"]`, `["test:security"]`, `["test:load"]` | none | **Required** for those suites. Without one, the suite is reported `NOT_RUN` with the reason. |
| `scripts["test:explore"]` | none | Optional. When set, your script runs instead of Airlock's checker. |

Before any script runs, the cloud installs dependencies with the package manager your lockfile names: `pnpm install --frozen-lockfile` for `pnpm-lock.yaml`, `yarn install --frozen-lockfile` for `yarn.lock` (both through corepack, at the version in your `packageManager` field), otherwise `npm ci` (falling back to `npm install`). devDependencies are installed. Then it runs your `build` script when there is one, and starts the app with `NODE_ENV=production`.

- **Port.** Your app gets `PORT` set to the `port` in the `qa` block (default 3000) and `HOST=0.0.0.0`. If your start script fixes its own port (for example `astro dev --port 8000`), set `port` to match.
- **Listen on all interfaces.** The health check comes from outside the sandbox, so the app must listen on `0.0.0.0`, not only on `localhost`. Many dev servers default to `localhost`; pass `--host 0.0.0.0` in the start script. When the app only answers on `localhost`, the run says so after about 5 minutes.
- **Node 22.** The sandbox runs Node 22. A project that requires a newer Node fails at install, with that reason.
- **No environment variables yet.** A build that needs, for example, `DATABASE_URL` cannot run yet.
- When a run fails, its reasons include the sandbox's own last error lines, and the phase says whether the build failed (`BUILD_FAILED`) or the app did not come up (`DEPLOY_UNHEALTHY`).
- The `install` and `build` script names are accepted but not used yet: the install and build commands are fixed as above.

#### The `explore` suite: Airlock's own checker

Without a `test:explore` script, `explore` runs Airlock's checker against your app while it runs on the staging slot. The checker runs in its own container, not inside your app's, so what it reports is **first-party**: seen by Airlock, not reported by your tests.

- It visits up to 30 pages of your app (same site only), then clicks up to 25 buttons. It skips any control whose name sounds destructive: delete, remove, pay, buy, checkout, send, publish, transfer, refund, cancel, sign out, reset and similar.
- **It cannot change your data.** Every request other than GET, HEAD or OPTIONS, and every request to another site, is blocked in its browser. A form it submits, or a button the skip list misses, is stopped before it reaches your server. Errors your page throws because of that blocking are ignored.
- It reports server errors (5xx), uncaught exceptions, console errors, dead internal links, images without alt text, images over 1 MB, a missing `Content-Security-Policy` or `Strict-Transport-Security` header, and session cookies without `HttpOnly`, `Secure` or `SameSite`. Headers are checked on your app's own response; a proxy in front of it in production may add them.
- An S1 or S2 finding (a 5xx or an uncaught exception) fails the suite. S3 and S4 findings are recorded without failing it.
- Limits: it only looks and clicks. It does not fill in forms with data, log in, or know what a page *should* show.

#### Findings

Each run lists its findings with a severity (S1 to S4) and who saw them: **Airlock checker** (first-party) or **your tests** (self-reported, read from your test output by fixed rules). A failing test that no rule names becomes a `failing_test` finding, named by file and test title, so it is tracked from run to run as new, still open or fixed. When both sources report the same bug, the first-party one is kept. Findings do not change a gate by themselves: self-reported findings are already covered by the suite that failed, and first-party S1/S2 findings fail the `explore` suite, which fails a `strict` gate (the default gate only warns).

`airlock qa --dry-run` prints the exact request, so you can check what will be sent before you use a run of your daily quota.

Gates: `default` fails only when the build or the health check (smoke) fails; other failing or unrun suites are reported as warnings. `strict` also fails on any suite that failed, did not run or was flaky, and on any first-party S1 or S2 finding. Heuristic leads never fail a gate unless someone promotes them.

### `airlock audit [bundlePath]`
Verifies a signed run-evidence bundle (spec **2.0.0**). It recomputes the ledger hash chain and the Merkle root from the blocks embedded in the bundle, then checks a signature that covers **every field** of the bundle (everything except `signature` itself). It exits with code `1` on any failure.

```bash
AIRLOCK_SIGNING_KEY=... bun run cli audit .airlock/compliance/latest-attestation.json
```

The output shows only what the bundle records: block count, dispatched-step count, durations, request-policy counts, and the SOC 2 mapping, which is always `NOT_ASSESSED`. Fields the runner does not measure (passed/failed steps, AI token cost, real secrets exposed to the sandbox) are printed as `not measured`. A valid bundle is signed run evidence, not a compliance assessment.

#### Signing keys

| Setting | Effect |
| --- | --- |
| `AIRLOCK_SIGNING_KEY` env var | Signing key (takes precedence over `compliance.signingKey`). |
| `compliance.signingKey` | Signing key from config. Shipped placeholder values count as unset. |
| `AIRLOCK_SIGNING_ALGORITHM` | `HMAC-SHA256` (default) or `Ed25519`. A PEM private key selects Ed25519 automatically. |
| `AIRLOCK_TRUSTED_PUBLIC_KEY` | Ed25519 SPKI PEM public key that `audit` requires the bundle to be signed with. |

- With no key and `CI` set, `run` and `audit` fail.
- With no key locally, a clearly labelled development key is used, a loud warning is printed, and the bundle records `insecureDevKey: true`. Such a bundle proves nothing, because the dev key is public.
- **HMAC-SHA256**: the verifier needs the same secret.
- **Ed25519**: the bundle carries the public key (`publicKey`) and its id (`publicKeyOrKeyId: ed25519:<fingerprint>`). Use a PKCS#8 PEM private key, or any secret from which a key is derived. Pin the signer with `AIRLOCK_TRUSTED_PUBLIC_KEY` or the signing key; otherwise `audit` warns that the key is not pinned.

Generate an Ed25519 key with `openssl genpkey -algorithm ed25519 -out airlock-signing.pem`.

#### Bundle format (spec 2.0.0)

- `ledgerBlocks`: the full ledger. Each block hash is SHA-256 over the canonical JSON of the block (keys sorted at every depth), so nested payload fields are covered.
- `merkleRoot`: Merkle root over the block hashes, with domain separation (leaves `SHA-256(0x00 || leaf)`, inner nodes `SHA-256(0x01 || left || right)`). An unpaired node is promoted rather than duplicated.
- `signature`: HMAC-SHA256 (hex) or Ed25519 (base64) over `"airlockqa-run-evidence-v2\n" + canonicalJson(bundle without signature)`.
- v1 bundles (`specVersion: 1.0.0`) signed only the Merkle root and are rejected with a clear error. Re-run to produce a v2 bundle.

---

### `airlock dataset`
Inspects the local self-healing locator dataset, showing heuristic match rates, CSS/XPath resolutions, and observed UI framework tags.

```bash
bun run cli dataset
```

---

### `airlock serve [-p <port>]`
Launches the interactive Web Console, Marketing Portal, and Compliance Report viewer.

```bash
bun run cli serve -p 4100
```
Open **`http://localhost:4100`** in your browser to inspect runs, view audits, and explore the interactive console.

---

## 5. CI/CD Workflow Integration

Add AirlockQA to your GitHub Actions workflow (`.github/workflows/airlock.yml`):

```yaml
name: AirlockQA Compliance Gate

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      # Required: runs and audits fail in CI without a signing key.
      AIRLOCK_SIGNING_KEY: ${{ secrets.AIRLOCK_SIGNING_KEY }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install Dependencies
        run: |
          bun install
          bunx playwright install --with-deps chromium

      - name: Build & Run Local Tests
        run: |
          bun run build
          bun test

      - name: Execute Airlock Test & Compliance Gate
        env:
          AIRLOCK_API_KEY: ${{ secrets.AIRLOCK_API_KEY }}
        run: |
          # If AIRLOCK_API_KEY is configured, submit cloud run, else run local
          if [ -n "$AIRLOCK_API_KEY" ]; then
            bun run cli test --cloud
          else
            bun run cli test --local
          fi

      - name: Run GUI Smoke & Accessibility Check
        run: bun run qa:gui

      - name: Verify Signed Evidence Ledger
        run: bun run cli audit
```

---

## 6. Web Console & Staging GUI QA

PR #1 introduces a modern, high-contrast Web Console and automated GUI smoke suite:

### 1. Launching the Local Console
```bash
bun run cli serve -p 4100
```
- **Marketing Site**: `http://localhost:4100/`
- **Interactive Console**: `http://localhost:4100/console.html`
- **Audit Ledger**: `http://localhost:4100/explorer.html`
- **Login Preview**: `http://localhost:4100/login.html`

### 2. Running Automated GUI Smoke & Axe Audits
```bash
bun run qa:gui
```
This script executes:
- Headless browser verification across desktop (1280x800) and mobile (390x844).
- Axe-core accessibility auditing (enforcing **0 violations**).
- Proof generation saved to `artifacts/gui-qa/`.

### 3. Docker Staging Topology
To run the isolated staging container stack:
```bash
docker compose -f container/docker-compose.staging.yml up -d
```

---

## 7. Cloud Quotas & Security Model

When executing against **Airlock Cloud** (`--cloud`). The full API is in [cloud-api.md](cloud-api.md).

1. **Authentication**: requests send `Authorization: Bearer air_live_...`. Keys are created and revoked in the console; only a hash is stored by the service.
2. **Quota** (free plan):
   - **100 accepted runs per workspace per UTC day.** The check and the count happen in one transaction. A run cancelled while still queued is refunded, within a daily refund limit.
   - One run at a time, up to 50 workflow steps and 90 seconds per run.
   - When the limit is reached the service returns HTTP `429` with code `DAILY_QUOTA_EXCEEDED` and the reset time. Accepted runs carry `X-RateLimit-*` headers, and the CLI warns when 20% or less remains.
3. **What is sent**:
   - Only the target URL, suite name, optional workflow, and phantom placeholders with their policy. `real` credentials are never sent, and the service rejects a request that contains one.
   - Targets must be public addresses; the service refuses private, loopback and link-local ones, and every browser request goes through an address-validating proxy.
4. **Evidence**: each run's evidence is signed with the service's Ed25519 key. `airlock test --cloud` verifies it against the key pinned at `airlock login`; `AIRLOCK_TRUSTED_PUBLIC_KEY` pins it explicitly.
