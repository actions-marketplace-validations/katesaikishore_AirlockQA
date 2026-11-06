# AirlockQA quality plan

This is the working acceptance map for the current repository. It covers the implemented runtime, local demo API, static cloud preview, and the staging site. It does not label prototype behavior as infrastructure capability.

## Run the checks

```bash
bun run build
bun test
bun run qa:gui
```

`bun run qa` runs those steps in order. The GUI suite needs `agent-browser`, a local Chrome installation, and access to the staging URL. Set `BASE_URL` to test a different deployment. It writes screenshots, a five-second Three.js WebM clip through the local loopback preview server, a sample evidence export, and a concise report under `artifacts/gui-qa/pr/`.

The GUI script deliberately uses the local Demo Store for form submission. Its browser pass checks malformed email validation, sample login, cart add, invalid and valid coupons, total calculation, and that a checkout request carrying a raw phantom value is rejected. The regular Playwright integration suite also runs checkout through `AirlockRunner`, verifies its configured token swap, checks the blocked refund request, generates and verifies an attestation, and tests locator recovery.

## Coverage map

| Area | Current automated coverage | Acceptance signal |
| --- | --- | --- |
| Build and public exports | TypeScript compiler | `bun run build` exits successfully |
| Configuration and parsing | Zod schema, config loading | Valid defaults parse; invalid values fail |
| Policy and phantom credentials | Host/path/method rules, allow/deny, swap, response sanitization | Approved local request reaches the demo API with the configured fake test credential; destructive paths are blocked |
| Browser execution | Playwright runner, actions, checkpoints, forks, locator fallback | Demo flow completes and assertions match; failed/missing checkpoints return explicitly |
| Trace compilation | Trace to Playwright spec | Supported actions compile to stable, escaped output |
| Browser fixtures and clock | Request recording/replay prototype and page clock override | Matching fixtures and time offsets are visible at the browser layer only |
| Evidence | Hash chain, Merkle proofs, signatures, HTML report | Valid bundles verify; modified records or signatures fail verification |
| Dashboard server | Static routes, content types, path traversal, preview recording origin/type/signature | Allowed requests succeed; invalid origin, content type, traversal, and malformed recording fail closed |
| GUI navigation | Marketing, sample sign-in, overview, runs, detail, explorer, analytics, audit, CI setup | Each view opens; search/filter, empty state, detail/back, copy/export, sign-out, and responsive layout behave as expected |
| GUI accessibility and motion | axe checks, reduced motion, WebGL/Three.js flow, screenshots/video | Zero automated axe violations on checked views; canvas renders under staging CSP; mobile has no horizontal overflow |
| Demo forms | Browser native validation, login, cart, coupons, checkout boundary | Invalid email/coupon paths remain visible; coupon total is correct; raw phantom checkout gets rejected |

## Staging contract

`https://staging.qbrin.cloud` is a Docker-isolated static preview on the existing Hostinger KVM 4 VPS (4 vCPU, 16 GB RAM). Hostinger disables nested virtualization on VPS plans, so this host cannot be split into additional full VMs; Docker Compose supplies the isolated staging service instead. It does not forward GUI actions to the production run service. The cloud contract currently exposes only `POST /v1/runs`; the preview has no real account authentication, run-history, analytics, usage, project, or API-key endpoints. Therefore the GUI suite verifies the sample experience and does not create cloud runs or claim live account data.

Use a dedicated staging API credential and a disposable test project before adding live `POST /v1/runs` coverage. Never send a production API key or real customer data from the GUI suite.

## Security and failure cases to keep

- Unknown or malformed configuration, bad URLs, absent browser objects, and missing checkpoint files.
- Default-deny egress, host/path/method mismatch, blocked domains, phantom token on an unapproved host, sanitized response data, and raw-secret exposure attempts.
- Invalid coupon, missing/invalid email, empty search results, unknown route, malformed JSON, invalid WebM signature, wrong upload origin/content type, oversized uploads, and encoded traversal.
- Tampered ledger, wrong signing key, malformed or unsupported bundle, replay mismatch, and out-of-scope clock/network/VM requests.
- Login redirect to a non-console origin, sign-out, reduced motion, mobile viewport, browser console/page errors, and failed WebGL/CDN fallback.

## Capability boundaries

Coverage is not the same as feature support. The TypeScript repository contains prototypes for browser-context request interception, browser-state checkpointing, browser `Date` offset, fixture replay, diagnostic events, and a chaos report. It does not currently prove guest/OS clock changes, backend/database time synchronization, kernel fault injection, full-process network capture, VM-memory snapshots, multi-tenant cloud isolation, live authentication, or compliance certification. Keep these as explicitly unsupported or simulated until infrastructure and contract tests exist.

The plan follows Playwright's guidance to use retrying assertions and actionability checks for browser tests, and the OWASP Web Security Testing Guide's categories for identity, authorization, session management, input validation, error handling, client-side behavior, and deployment configuration:

- [Playwright actionability and auto-waiting](https://playwright.dev/docs/actionability)
- [Playwright web assertions](https://playwright.dev/docs/test-assertions)
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
