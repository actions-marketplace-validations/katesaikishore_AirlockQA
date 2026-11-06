# 🛡️ AirlockQA

> **Fast, deterministic browser testing with self-healing locators and zero-leak credential isolation.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Runtime](https://img.shields.io/badge/Bun%20%2F%20Node.js-Ready-green)](#quick-start)
[![Playwright](https://img.shields.io/badge/Playwright-Core-orange)](https://playwright.dev/)

---

## Overview

AirlockQA is an end-to-end web testing runtime built for reliability, security, and developer speed. It combines deterministic browser execution with automatic selector self-healing and client-side credential protection.

```
                    ┌─────────────────────────┐
                    │     AirlockQA Test      │
                    └────────────┬────────────┘
                                 │
                                 ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                    Execution Sandbox                        │
   │                                                             │
   │   • Headless Browser (Playwright)                           │
   │   • Phantom credentials only (real keys never in memory)    │
   │   • Point-in-time state checkpoints for sub-second replay   │
   └─────────────────────────────┬───────────────────────────────┘
                                 │ (HTTP/TCP Egress)
                                 ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                 Deterministic Egress Gateway                │
   │                                                             │
   │   • Whitelist validation on all outbound hosts              │
   │   • Mutation policy guard (blocks unauthorized endpoints)   │
   │   • In-flight token replacement at network boundary         │
   │   • Cryptographic audit ledger and execution attestation    │
   └─────────────────────────────────────────────────────────────┘
```

---

## Key Features

- **🛡️ Credential Isolation:** Tests execute with dummy phantom tokens (`ph_sec_***`). The network gateway swaps in real credentials in-flight at the boundary, ensuring raw production keys are never exposed to test scripts or sandbox memory.
- **⚡ Deterministic Execution:** Compiles exploratory browser sessions into high-speed, zero-overhead Playwright scripts that execute consistently in under a second.
- **🔄 Self-Healing Locators:** When UI components refactor, the built-in similarity engine automatically resolves broken selectors using token-overlap and DOM tree analysis.
- **⏱️ Point-in-Time Checkpoints:** Capture warm browser memory states (e.g. authenticated sessions, populated shopping carts) to test variations in parallel without repeating slow setup flows.
- **📜 Tamper-Evident Audit Ledger:** Generates cryptographically verifiable execution reports with Merkle root signatures for compliance and non-repudiation.

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
export AIRLOCK_API_KEY="your-api-key"
npx airlock test --cloud
```

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
      "real": "sec_live_prod_actual_key_12345",
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
    "signingKey": "your-secret-signing-key-32-chars",
    "outputDir": "./.airlock/compliance",
    "generateHtmlReport": true
  }
}
```

---

## CLI Reference

| Command | Description |
| :--- | :--- |
| `airlock init` | Initialize default configuration and sample policy |
| `airlock explore [url]` | Launch an interactive browser session to record DOM actions |
| `airlock compile <trace>` | Convert exploration trace into deterministic Playwright code |
| `airlock test [options]` | Run tests locally (`--local`) or via cloud cluster (`--cloud`) |
| `airlock fork <checkpoint>` | Spawn parallel test workers from a warm memory checkpoint |
| `airlock warp <duration>` | Fast-forward virtual clock across kernel, V8, and DOM simultaneously (`+14 days`, `+1 hour`) |
| `airlock chaos [url]` | Run deterministic 4-clone race condition hunter against mutations to audit idempotency |
| `airlock teleport <capsule>` | Rehydrate a production crash capsule and auto-synthesize a Playwright repro spec |
| `airlock audit [bundle]` | Verify cryptographic signature and Merkle root of an audit bundle |
| `airlock dataset` | View logged UI mutation patches and selector healing accuracy |
| `airlock serve` | Launch local interactive dashboard and compliance viewer |

---

## Advanced Capabilities

### 1. Virtual Time-Warp
Fast-forward virtual clocks across the Linux kernel, V8 JavaScript runtime, and DOM reactive loops simultaneously. Test 14-day trials, 1-hour session timeouts, or monthly billing cycles in milliseconds without breaking TLS handshakes:

```typescript
import { AirlockRunner } from 'airlockqa';

const runner = new AirlockRunner();
await runner.initialize(context, page);

// Fast-forward 14 days in ~10 milliseconds
await runner.warpTime('+14 days');
```

Or via CLI:
```bash
npx airlock warp "+14 days"
```

### 2. Deterministic Chaos & Race-Condition Hunter
Forks 4 parallel ghost microVM clones at mutation steps (e.g. checkout, transfer) to test:
- **Clone 1:** Baseline normal execution.
- **Clone 2:** 2ms rapid duplicate clicks (detects missing `Idempotency-Key` or double-spend race conditions).
- **Clone 3:** Mid-stream TCP packet drop (tests half-committed states and retry resilience).
- **Clone 4:** 502 Bad Gateway + delayed asynchronous webhook recovery.

```bash
npx airlock chaos http://localhost:3000
```

### 3. Full-Stack Causal X-Ray
Injects W3C `traceparent` headers into browser sessions to correlate DOM assertion failures with network wire transactions, backend exceptions, and SQL queries to pinpoint the root cause down to the file and line number:

```bash
┌──────────────────────────────────────────────────────────────────────────┐
│ 🧬 AIRLOCK CAUSAL X-RAY: ROOT-CAUSE DIAGNOSTIC                           │
├──────────────────────────────────────────────────────────────────────────┤
│ 💥 Failed Step:     Payment Verification Step                            │
│ 🌐 Network Wire:    POST /api/v1/charge -> 500 Internal Server Error     │
│ 🔑 Traceparent ID:  4bf92f3577b34da6a3ce929d0e0e4736                     │
├──────────────────────────────────────────────────────────────────────────┤
│ 📍 Culprit File:    src/controllers/checkout.ts:88:14                    │
│ 🧩 Function / Class:chargeCustomerCard                                   │
│ ⚠️ Root Cause:      Card declined: Insufficient funds                    │
│ 🗄️ Database Query:  SELECT status FROM orders WHERE id = $1              │
│    > await stripe.charges.create({ amount, currency });                  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4. Production-to-MicroVM Bug Teleportation
Client-side 3KB telemetry snippet with a rolling 15-second sanitized circular ring buffer (PII, cards, and secrets redacted). When an uncaught exception occurs in production, it exports a State Capsule that can be teleported and replayed locally:

```bash
npx airlock teleport ./capsules/capsule_crash.json --out ./tests/repro-crash.spec.ts
```

---

## Continuous Integration

Add AirlockQA to your GitHub Actions workflow:

```yaml
# .github/workflows/airlock.yml
name: AirlockQA Test Suite

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install chromium --with-deps

      - name: Run AirlockQA Tests
        run: npx airlock test --local

      - name: Archive Compliance Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: airlock-compliance-report
          path: .airlock/compliance/
```

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
```

---

## License

[MIT](LICENSE) &copy; 2026 Sai Kishore Kate
