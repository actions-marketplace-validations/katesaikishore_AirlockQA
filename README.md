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

- **🛡️ Request Policy Prototype:** The Playwright-context gateway can inspect configured phantom tokens, apply host/path/method rules, substitute configured values, and sanitize matching upstream responses. This is browser-request interception; it is not a general OS-level egress firewall or a guarantee that production credentials never enter the runner process.
- **⚡ Trace Compilation:** Converts recorded browser actions into Playwright-oriented test code. Runtime and stability depend on the application and environment.
- **🔄 Locator Recovery Prototype:** A similarity-based helper can suggest or resolve candidate locators from available DOM features; review recovered selectors in your application’s test context.
- **⏱️ Browser Checkpoints:** Saves browser storage state, session storage, URL, and a DOM snapshot/hash, then can restore that data into a browser context. It does not snapshot process or VM memory.
- **📜 Execution Evidence:** Builds hash-linked ledger entries and signed bundles that can be verified with the configured key. This is an evidence mechanism, not a compliance certification.

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

Record an exploratory browser session against your staging application:

```bash
npx airlock explore http://localhost:3000
```

Compile the recorded trace into a deterministic test spec:

```bash
npx airlock compile trace.json --output ./tests/checkout.spec.ts
```

### 4. Run Tests

Execute the compiled test suite locally:

```bash
npx airlock test --local
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
      "real": "REPLACE_ME_REAL_SECRET",
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

`compliance.signingKey` has no default and is intentionally left out of the sample: keep it out of committed files and supply it from a local, untracked config. Each secret's real value is read from the environment variable named by `realFromEnv`; the literal `real` value is only a fallback placeholder. Set `browser.executablePath` or `AIRLOCK_CHROME_PATH` to use a specific Chrome build. Set `AIRLOCK_CHECKPOINT_KEY` to encrypt saved browser-state checkpoints (they contain cookies and storage).

---

## CLI Reference

| Command | Description |
| :--- | :--- |
| `airlock init` | Initialize default configuration and sample policy |
| `airlock explore [url]` | Launch an interactive browser session to record DOM actions |
| `airlock compile <trace>` | Convert exploration trace into Playwright-oriented code |
| `airlock test [options]` | Run tests locally (`--local`) or via cloud cluster (`--cloud`) |
| `airlock fork <checkpoint>` | Create isolated Playwright browser contexts from a saved browser-state checkpoint |
| `airlock warp <duration>` | Apply the current browser time-warp prototype (`+14 days`, `+1 hour`); see limitations below |
| `airlock chaos [url]` | Generate a prototype mutation/race-condition audit report; scenarios are not yet executed as kernel or VM faults |
| `airlock teleport <capsule>` | Load a state-capsule prototype and synthesize a basic Playwright reproduction spec |
| `airlock audit [bundle]` | Verify cryptographic signature and Merkle root of an audit bundle |
| `airlock dataset` | View logged UI mutation patches and selector healing accuracy |
| `airlock serve` | Launch the local dashboard and run-evidence viewer |

---

## Prototype capabilities and limitations

The commands below are early prototypes. Their current names do not imply kernel clock control, VM snapshots, network-wide capture, or production crash replay. Track the implementation gates in [`docs/five-impossible-moats-implementation-plan.md`](docs/five-impossible-moats-implementation-plan.md).

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
