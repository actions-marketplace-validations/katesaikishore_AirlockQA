# 🛡️ AirlockQA

> **Browser testing tools with locator recovery, configurable request policies, state checkpoints, and execution evidence.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Runtime](https://img.shields.io/badge/Bun%20%2F%20Node.js-Ready-green)](#quick-start)
[![Playwright](https://img.shields.io/badge/Playwright-Core-orange)](https://playwright.dev/)

---

## Overview

AirlockQA is an early-stage TypeScript browser testing runtime. It includes exploratory recording and compilation, Playwright-based execution, configurable request policy and phantom-token substitution, browser-state checkpoints, and audit artifacts. Cloud execution is submitted through `POST /v1/runs`; verify the capabilities enabled by your deployment before relying on them.

📖 **Complete User Guide:** See [`docs/HOW-TO-USE.md`](docs/HOW-TO-USE.md) for detailed instructions on all CLI commands, state forking, virtual time warping, chaos hunting, web console, and CI integration.

```
                    ┌─────────────────────────┐
                    │     AirlockQA Test      │
                    └────────────┬────────────┘
                                 │
                                 ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                 Playwright Test Process                      │
   │                                                             │
   │   • Headless Browser (Playwright)                           │
   │   • Configured phantom-token substitution and policy       │
   │   • Browser storage and DOM snapshots (not VM memory)      │
   └─────────────────────────────┬───────────────────────────────┘
                                 │ (HTTP/TCP Egress)
                                 ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                Browser Request Policy                        │
   │                                                             │
   │   • Host, path, and method checks for routed browser traffic │
   │   • Configured mutation rules                                │
   │   • Configured token substitution                            │
   │   • Signed run evidence                                      │
   └─────────────────────────────────────────────────────────────┘
```

---

## Key Features

- **🛡️ Request Policy Prototype:** The Playwright-context gateway can inspect configured phantom tokens, apply host/path/method rules, substitute configured values, and sanitize matching upstream responses. This is browser-request interception; it is not a general OS-level egress firewall or a guarantee that production credentials never enter the runner process. See [Request policy limits](#request-policy-limits).
- **⚡ Trace Compilation:** Converts recorded browser actions into Playwright-oriented test code. Runtime and stability depend on the application and environment.
- **🔄 Locator Recovery Prototype:** A similarity-based helper can suggest or resolve candidate locators from available DOM features; review recovered selectors in your application’s test context.
- **⏱️ Browser Checkpoints:** Saves browser storage state, session storage, URL, and a DOM snapshot/hash, then can restore that data into a browser context. It does not snapshot process or VM memory.
- **📜 Execution Evidence:** Builds hash-linked ledger entries and signed bundles (spec 2.0.0) that embed the full ledger. The HMAC-SHA256 or Ed25519 signature covers every field of the bundle, and `airlock audit` recomputes the hash chain and Merkle root. This is an evidence mechanism, not a compliance certification.

---

## Quick Start

### 1. Installation

Install via npm or use directly with `npx`:

```bash
npm install --save-dev airlockqa
```

Or with Bun:

```bash
bun add -d airlockqa
```

### 2. Initialize Configuration

Generate an `airlock.config.json` file in your project root:

```bash
npx airlock init
```

### 3. Record & Compile a Test

Open a browser on your app and record what you do. Close the window (or press Ctrl+C) to save the trace:

```bash
npx airlock explore http://localhost:3000 --name checkout
```

Compile the recorded trace into a Playwright spec:

```bash
npx airlock compile .airlock/traces/checkout-trace.json --out ./tests/checkout.spec.ts
```

(`--output` is accepted as an alias for `--out`.)

### 4. Run Tests

Run specs locally with Playwright Test. This needs `@playwright/test` (a peer dependency). The command exits non-zero when a test fails:

```bash
npm install --save-dev @playwright/test
npx airlock test --local ./tests/checkout.spec.ts --url http://localhost:3000
```

Import `test` from the Airlock fixture to attach the request gateway and a signed evidence bundle to every test:

```ts
import { test, expect } from 'airlockqa/dist/src/testing/airlock-test.js';

test('checkout', async ({ page, airlock }) => {
  await page.goto('/');
  await page.getByTestId('checkout-btn').click();
});
```

Or run the workflow defined in the `workflow` section of `airlock.config.json` (see [Workflows](#workflows)):

```bash
npx airlock run --url http://localhost:3000
```

Or connect to an Airlock Cloud runner:

```bash
export AIRLOCK_API_KEY="air_live_..."
npx airlock test --cloud
```

In GitHub Actions, store the key as an `AIRLOCK_API_KEY` repository, organization, or environment secret and pass it to the step with `env`. The CLI sends the key only as an HTTPS Bearer token. It never places the key or configured `real` app credentials in the run JSON body. `--local` remains keyless; `AIRLOCK_CLOUD_URL` can point the same open-source client at a separately configured Enterprise endpoint.

The current repository contains the Cloud API client and static console preview, not the hosted account/key service, quota database, or worker queue. It therefore does not issue keys or enforce daily run limits. See [`docs/cloud-api-auth-and-quota.md`](docs/cloud-api-auth-and-quota.md) before offering hosted quotas or cloud-managed app credentials.

---

## Configuration

AirlockQA is configured via `airlock.config.json` in the root of your repository:

```json
{
  "projectName": "My Web App",
  "baseUrl": "http://localhost:3000",
  "browser": {
    "headless": true,
    "viewport": {
      "width": 1280,
      "height": 800
    }
  },
  "proxy": {
    "enabled": true,
    "port": 8899
  },
  "secrets": {
    "API_TOKEN": {
      "realFromEnv": "API_TOKEN",
      "real": "REPLACE_ME_API_TOKEN",
      "phantom": "ph_sec_test_dummy_token",
      "allowedHosts": ["api.example.com"],
      "allowedMethods": ["GET", "POST"],
      "blockedPaths": ["/v1/delete*", "/v1/refund*"]
    }
  },
  "policy": {
    "defaultAction": "BLOCK",
    "allowedEgressHosts": ["localhost", "127.0.0.1", "api.example.com"],
    "blockedEgressHosts": ["pastebin.com", "webhook.site"],
    "rules": [
      {
        "id": "block-destructive-actions",
        "hostPattern": "*",
        "blockedPaths": ["*/delete*", "*/wipe*"],
        "action": "BLOCK"
      }
    ]
  },
  "compliance": {
    "outputDir": "./.airlock/compliance",
    "generateHtmlReport": true
  }
}
```

**Evidence signing keys.** Prefer setting `AIRLOCK_SIGNING_KEY` from a secret store over committing `compliance.signingKey`. Set `AIRLOCK_SIGNING_ALGORITHM=Ed25519`, or supply a PEM private key, to sign with Ed25519; the bundle then carries the public key, and verifiers can pin it with `AIRLOCK_TRUSTED_PUBLIC_KEY`. With no key configured, runs fail when `CI` is set. Locally they fall back to a labelled, insecure development key, print a warning, and mark the bundle `insecureDevKey: true`. Bundles from v1 (`specVersion: 1.0.0`) are rejected. See [docs/HOW-TO-USE.md](docs/HOW-TO-USE.md#airlock-audit-bundlepath).

`compliance.signingKey` has no default and is intentionally left out of the sample: keep it out of committed files and supply it from a local, untracked config. Each secret's real value is read from the environment variable named by `realFromEnv`; the literal `real` value is only a fallback placeholder. Set `browser.executablePath` or `AIRLOCK_CHROME_PATH` to use a specific Chrome build. Set `AIRLOCK_CHECKPOINT_KEY` to encrypt saved browser-state checkpoints (they contain cookies and storage).

---

## Workflows

`airlock run` executes an optional `workflow` section of `airlock.config.json` in one browser with the gateway attached, then signs an evidence bundle. It stops at the first failing step and exits with code 1.

```json
"workflow": {
  "name": "checkout",
  "steps": [
    { "action": "goto", "url": "/" },
    { "action": "fill", "selector": "input[name=\"email\"]", "value": "${env:QA_EMAIL}" },
    { "action": "click", "selector": "button[type=\"submit\"]" },
    { "action": "checkpoint", "name": "post_auth" },
    { "action": "expectText", "selector": "#cart-total", "text": "$50.00" },
    { "action": "request", "method": "POST", "url": "/api/admin/refund", "phantomSecret": "API_TOKEN", "expectStatus": 403 }
  ]
}
```

Step actions are `goto`, `click`, `fill`, `press`, `select`, `waitFor`, `expectVisible`, `expectText`, `checkpoint` and `request`. `${env:NAME}` reads credentials from the environment so they stay out of the config file. A `request` step with `expectStatus` fails unless the response has exactly that status. See [docs/HOW-TO-USE.md](docs/HOW-TO-USE.md#airlock-run-specpath) for every field.

---

## CLI Reference

Commands exit with a non-zero code when they fail (missing files, failed tests or steps, failed variations).

| Command | Description |
| :--- | :--- |
| `airlock init` | Initialize default configuration and sample policy |
| `airlock explore [url]` | Open a browser and record your clicks, typing, key presses and selections into a trace (`--name`, `--out`) |
| `airlock compile <trace>` | Convert a recorded trace into a Playwright spec (`--out`, alias `--output`) |
| `airlock test [spec] --local` | Run spec file(s) with Playwright Test (default: `compiler.outputDir`); `--url` sets `baseURL` |
| `airlock test [spec] --cloud` | Submit a run request to Airlock Cloud; the suite name comes from `--suite`, the spec file name or `projectName` |
| `airlock run [spec]` | Run the configured `workflow` (or `--workflow <file>`), or a spec, and sign an evidence bundle |
| `airlock fork <checkpoint>` | Restore a checkpoint into parallel contexts and try one value per context (`--input`, `--action`, `--values` or `--variations <file>`, `--expect-*`) |
| `airlock warp <duration>` | Apply the current browser time-warp prototype (`+14 days`, `+1 hour`); see limitations below |
| `airlock chaos [url]` | Click `--action` once and fail if the mutation request has no idempotency key; scenarios are not replayed |
| `airlock teleport <capsule>` | Synthesize a basic Playwright reproduction spec from a state capsule (`--out`, alias `--output`) |
| `airlock audit [bundle]` | Verify a run-evidence bundle: recompute the hash chain and Merkle root, check the signature over the whole bundle, and exit 1 on failure |
| `airlock dataset` | View logged UI mutation patches and selector healing accuracy |
| `airlock serve` | Launch the local dashboard and run-evidence viewer |

---

## Prototype capabilities and limitations

The commands below are early prototypes. Their current names do not imply kernel clock control, VM snapshots, network-wide capture, or production crash replay. Track the implementation gates in [`docs/five-impossible-moats-implementation-plan.md`](docs/five-impossible-moats-implementation-plan.md).

### Request policy limits

The request gateway has two entry points that apply the same leak check, policy and substitution:

- **Playwright context (`attachToBrowserContext`)**: routes every request in the context. Allowed requests are forwarded by the runner's own HTTP client with phantom tokens swapped for real values. Redirects come back to the browser, so each hop is checked against policy again. If forwarding fails, the request is aborted and reported (`forwardError`); it is never continued through the browser with real values. Response bodies are decompressed. Text bodies are sanitized and returned without the stale `content-encoding` or `content-length` headers. Binary bodies are returned byte-for-byte.
- **Standalone HTTP proxy (`startHttpProxy`)**: listens on `127.0.0.1` by default and only accepts absolute-form `http://` request URIs (`HTTP_PROXY`). The target comes from the request URI, and a request whose `Host` header does not match it is rejected with 400. Request bodies over `maxBodyBytes` (default 10 MiB) get 413. Binary responses are streamed through; text responses are buffered (with the same cap) so they can be sanitized.
- **HTTPS through the proxy**: `CONNECT` is denied with 403 by default because the proxy cannot see inside a TLS tunnel, so it cannot swap tokens, detect leaks or sanitize responses. Hosts listed in the `connectAllowHosts` gateway option (or the `AIRLOCK_CONNECT_ALLOW_HOSTS` environment variable in the container) are tunnelled without inspection. AirlockQA does not ship a TLS-terminating proxy.

Phantom tokens only work for the hosts in that secret's `allowedHosts`. A request carrying the token to any other host is blocked. Substitution and sanitizing are exact string matches in text content (`text/*`, JSON, form, XML, JavaScript). Binary, encoded or transformed values are not rewritten.

**Container egress firewall.** `container/egress-firewall.sh` sets a default-deny `OUTPUT` filter. It allows loopback traffic, replies on established connections, and traffic from the dedicated `airlock-proxy` user only. It refuses to exempt uid 0. Direct port 80/443 traffic from other users is rejected, not redirected. Start the image with `AIRLOCK_EGRESS_FIREWALL=1` and `NET_ADMIN`. The entrypoint then applies the rules, runs the proxy as `airlock-proxy` and runs the CLI as `airlock` with `HTTP_PROXY`/`HTTPS_PROXY` set. This is a packet-filter backstop for one container, not proof of isolation: root can remove the rules, and code running as the proxy user is not constrained. It is off in `docker-compose.yml` because the `run` command forwards browser traffic from its own process (same user as the browser), and Playwright's request client does not use `HTTP_PROXY`, so that traffic would be rejected.

### Browser clock override

`TimeWarper` maintains an offset and overrides `Date` in the current page, with an init script for later navigations and a custom `airlock:timewarp` event. It does not advance browser timers, the Linux clock, backend/database/Redis clocks, cron jobs, or TLS time. Do not use it to validate end-to-end subscription or certificate expiry yet.

```typescript
const result = await runner.warpTime('+14 days', page);
console.log(result.scope, result.affectedPageAPIs); // The current page's Date APIs only
```

### Browser request fixtures

`ShadowSynthesizer` intercepts requests made through a Playwright `BrowserContext`, serves matching saved fixtures, has one Stripe-shaped synthetic response, and otherwise allows requests through (including external misses). It does not see server-rendered, worker, container, or arbitrary process traffic and is not currently hermetic by default.

### Chaos report prototype

`ChaosHunter` invokes one browser action, observes a matching request when present, and reports whether an idempotency header was seen. A missing header is only a risk indicator; it does not prove duplicate behavior or backend enforcement. The remaining duplicate, connection-interruption, and 502/webhook entries are marked not run and have no measured timing.

### Browser trace diagnostics

`CausalXRay` adds W3C-style headers to browser requests and records browser response metadata. It reads file, function, and query details only when an upstream error response supplies them; response latency is currently unavailable. Treat the output as browser/network diagnostics only.

### State-capsule prototype

`TelemetryRingBuffer` redacts a limited set of patterns from event payloads, and `CapsuleManager` can serialize capsule state and perform basic Playwright replay. Redaction is heuristic: arbitrary storage, cookies, URLs, error stacks, or encoded secrets may remain sensitive. The current capsule format is not encrypted and replay does not boot a microVM. Do not send real user data or production credentials to this prototype.

## Continuous Integration

The included [GitHub Actions workflow](.github/workflows/airlock-ci.yml) builds the TypeScript package, runs automated tests and a local demo run, verifies the signed run-evidence bundle, and uploads the generated artifacts. The local GUI walkthrough is run separately with `bun run qa:gui` because it requires Chrome and `agent-browser`.

---

## Local Development & Testing

```bash
# Clone the repository
git clone https://github.com/katesaikishore/AirlockQA.git
cd AirlockQA

# Install dependencies
bun install

# Run unit and integration tests
bun test

# Build TypeScript
bun run build

# Run the browser-based staging smoke suite (agent-browser and Chrome required)
bun run qa:gui

# Build, run all tests, and drive the staging UI
bun run qa
```

The GUI suite writes screenshots, a sample evidence export, and a five-second Three.js preview under `artifacts/gui-qa/pr/`. See [`docs/qa-test-plan.md`](docs/qa-test-plan.md) for the covered flows and the limits of the staging preview.

---

## License

[MIT](LICENSE) &copy; 2026 Sai Kishore Kate
