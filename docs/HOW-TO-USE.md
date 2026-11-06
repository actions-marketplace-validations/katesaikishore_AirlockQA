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

AirlockQA strictly distinguishes between **Local Execution**, **Airlock Cloud**, and **Enterprise Deployments**:

| Mode | Where Tests Run | Credentials Needed | Quota & Compute |
| :--- | :--- | :--- | :--- |
| **Open-Source Local** | User laptop or CI runner | None (`--local`) | Free, unbounded local execution |
| **Airlock Cloud** | Hosted microVM execution | Project API key (`AIRLOCK_API_KEY`) | Metered quota (e.g. 100 runs/day/repo) |
| **Enterprise** | Dedicated customer infrastructure | Enterprise endpoint (`AIRLOCK_CLOUD_URL`) | Per enterprise license agreement |

```
                       ┌─────────────────────────┐
                       │     AirlockQA CLI       │
                       └────────────┬────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────┐                           ┌─────────────────────┐
│  --local (Free)     │                           │  --cloud / API      │
│  Local Playwright   │                           │  Hosted Workers     │
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

Install the Playwright browser binary:
```bash
bunx playwright install chromium
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
      "real": "sk_live_actual_production_secret_key",
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
    "signingKey": "airlock-hmac-master-key-32-chars-long!",
    "outputDir": "./.airlock/compliance",
    "generateHtmlReport": true
  }
}
```

### Security Rules:
1. **Never send real secrets over the network**: Real secret values are kept exclusively in runner memory or edge vaults. The browser test runtime only sees `phantom` placeholders (e.g. `ph_sec_stripe_test_placeholder`).
2. **Egress Firewall**: Outbound HTTP/HTTPS requests that attempt to invoke blocked paths (like `*/refund*` or `*/wipe*`) are immediately aborted with a 403 status.

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
Spawns an interactive browser session, explores user workflows (authentication, cart actions, checkout forms), and records a complete DOM & network trace into `.airlock/traces/<suite>-trace.json`.

```bash
bun run cli explore http://localhost:3000 --name checkout-flow
```

---

### `airlock compile <tracePath>`
Compiles a recorded trace into zero-token, high-speed, deterministic Playwright TypeScript code with resilient multi-attribute fallback locators.

```bash
bun run cli compile .airlock/traces/checkout-flow-trace.json -o ./examples/tests/checkout.spec.ts
```

---

### `airlock test [--local | --cloud]`
Routes test execution to either your local Playwright browser or the remote Airlock Cloud API:

#### 1. Local Run (Free, 100% offline):
```bash
bun run cli test --local
```

#### 2. Cloud Run (Requires `AIRLOCK_API_KEY`):
```bash
export AIRLOCK_API_KEY="air_live_your_project_key"
bun run cli test --cloud
```

*Note: The CLI transmits your token only via `Authorization: Bearer <token>` over HTTPS. Real application secrets are automatically stripped from the cloud payload.*

#### 3. Custom Enterprise Endpoint:
```bash
export AIRLOCK_CLOUD_URL="https://airlock.internal.corp"
export AIRLOCK_API_KEY="air_ent_your_key"
bun run cli test --cloud
```

---

### `airlock run`
Executes your full end-to-end integration test locally, demonstrating:
- Phantom credential substitution
- Egress firewall policy blocking destructive mutations
- Parallel state forking from saved checkpoints
- Generation of the signed run-evidence bundle (spec 2.0.0, with the ledger embedded); see [`airlock audit`](#airlock-audit-bundlepath) for signing keys

```bash
bun run cli run
```

---

### `airlock fork <checkpointName>`
Instantly branches execution into parallel browser contexts from a warm checkpoint (such as post-login or cart-filled) **without** repeating the preceding navigation and login steps.

```bash
bun run cli fork cart_ready --workers 5
```

---

### `airlock warp <duration>`
Fast-forwards the virtual browser clock across Date offsets without waiting real time. Ideal for testing 14-day trials, subscription renewals, or expiration countdowns.

```bash
bun run cli warp "+14 days"
bun run cli warp "+1 hour"
```

---

### `airlock chaos [url]`
Launches a 4-clone parallel chaos test against mutation buttons (checkout, submit, pay) to detect idempotency vulnerabilities, double-spend risks, and race conditions.

```bash
bun run cli chaos http://localhost:3000
```

---

### `airlock teleport <capsulePath>`
Ingests a production bug capsule (containing masked state and ring-buffer network/DOM logs) and generates a deterministic Playwright reproduction test.

```bash
bun run cli teleport .airlock/traces/crash-capsule.json -o ./examples/tests/repro-bug.spec.ts
```

---

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

When executing against **Airlock Cloud** (`--cloud`):

1. **Authentication**: All requests send `Authorization: Bearer air_live_...`.
2. **Quota Enforcement**:
   - Plans typically allow **100 runs per day per repository**.
   - Cloud servers return HTTP `429 Too Many Requests` when limits are reached.
   - The CLI monitors `x-ratelimit-remaining` and warns developers when remaining quota drops below 20%.
3. **Data Quarantine**:
   - The CLI strictly filters the payload to exclude `real` app credentials.
   - Only `phantom` placeholders and route policies are transmitted to workers.
