# Five Moats: implementation plan and capability gates

This plan turns `five_impossible_moats_blueprint.md` into a testable engineering roadmap. The blueprint is a target architecture, not a description of the current product. Do not use a moat claim in product copy until its acceptance gate below passes in a supported deployment.

## Current state

The repository contains useful TypeScript prototypes: Playwright request interception and configured token swapping, browser-context checkpoints, a JavaScript `Date` offset, browser-only shadow routes, a chaos report generator, browser trace headers/response collection, and a crash-event capsule/replay helper. The VPS also has a bare-metal host daemon and health endpoint. These pieces are not yet one integrated, tenant-isolated, end-to-end cloud runner.

Known gaps include: no vDSO or kernel clock control; no synchronized backend/database clocks; no host-TAP TLS termination or network-wide mock capture; no kernel `tc netem` fault execution; no real VM-memory snapshots or copy-on-write clone path in the TypeScript runner; no eBPF/backend/database trace ingestion; and no encrypted, consent-scoped capsule transport. Existing report labels and simulated outcomes must not be presented as measurements from real infrastructure.

## Delivery order

### 0. Capability contract and safe defaults — prerequisite

- Define the supported local/cloud execution topology, API request/response schema, authentication, tenant boundary, artifact retention, and threat model.
- Separate `simulated` results from `executed` results in types, logs, reports, and UI. Remove fabricated timing and success measurements from operational output.
- Make run capabilities explicit (`browserClock`, `browserRouting`, `networkFaults`, `guestClock`, `hostTracing`, `vmSnapshot`) and reject or clearly mark unsupported requests.
- Gate: contract tests prove an unsupported capability cannot be reported as executed; API tests verify authentication, tenant scoping, size limits, and failure responses.

### 1. Crash capsules: privacy and replay integrity — first user-facing moat

- Replace regex-only redaction with an allowlist event schema and deny-by-default storage capture. Never collect input values, cookies, local/session storage, or DOM text unless an operator explicitly selects and scopes them.
- Add an explicit consent/configuration mechanism, retention limits, capsule size limits, secret-safe error serialization, and encryption in transit and at rest with managed key rotation.
- Add versioned capsule schema, integrity verification, origin/URL allowlists, and deterministic replay outcomes. Reproduce in a disposable browser context first; do not promise VM reconstruction.
- Gate: adversarial fixtures cover emails, cards, credentials, nested objects, stack traces and encoded secrets; tests prove excluded storage is absent; tamper, unsupported-version, expiry, and replay-mismatch tests fail closed.

### 2. Browser clock control and replay — bounded time testing

- Replace the hand-written global `Date` monkeypatch with Playwright's supported clock controls for `Date`, timers, and animation frames. Document that this controls only the browser page.
- Add repeatable set/freeze/advance/reset APIs, multiple navigation coverage, monotonic-time behavior, and browser/version compatibility tests.
- Gate: tests show deterministic browser timer and expiry behavior across reloads. Do not say OS, database, backend, Redis, cron, or TLS clocks moved.

### 3. Browser shadow fixtures, then opt-in network proxy

- First make browser-route recording/replay deterministic: canonical request keys, safe header/body filtering, explicit misses, strict mode, fixture provenance, and no default passthrough for configured external hosts.
- Only after the local mode is reliable, design an opt-in proxy inside the runner network namespace for backend/worker egress. Define TLS trust installation, certificate lifecycle, secret filtering, protocol limits, and audit logs before implementation.
- Gate: browser and backend fixture suites prove replay matching, miss behavior, cache isolation, no secret persistence, and no unexpected external requests. Until the proxy path passes, describe this as browser-request mocking only.

### 4. Causal diagnostics: browser trace first, instrumented services second

- Keep browser-generated W3C trace IDs/spans and real request/response timestamps, but remove guessed latency and placeholder file/query diagnostics.
- Add documented adapters for OpenTelemetry traces/logs from instrumented services. Correlate only data actually received; label missing backend/database telemetry as unavailable.
- Add redaction and bounded retention before persisting request bodies or headers.
- Gate: integration fixture propagates one trace across browser and instrumented API and verifies exact span relationships; missing instrumentation never yields invented root causes.

### 5. Deterministic fault injection — after isolated replay works

- Replace the current four-clone report with real Playwright scenario execution in isolated browser contexts and a controllable test server. Start with duplicate action, connection abort, injected 502, and delayed callback fixtures.
- Then consider runner-network `tc netem` support, with explicit capability checks, per-run namespace isolation, guaranteed cleanup, reproducible seeds, and resource quotas.
- Do not call browser contexts “microVM clones.” Real kernel or VM snapshots are a separate infrastructure milestone.
- Gate: each finding is tied to an observed request/response or state assertion; repeated seed reproduces the result; cleanup tests prove no fault rules leak to other runs.

### 6. Guest/host time, network tracing, and copy-on-write VM snapshots — infrastructure program

- Specify guest agent protocol and measure clock control first. Prototype Linux `timens` support separately and document which clock APIs it does and does not virtualize. Coordinate guest, service, database, and scheduler clocks explicitly.
- Build host TAP routing, policy enforcement, and network fault facilities in isolated namespaces. Evaluate eBPF collection with kernel compatibility, privilege, overhead, and tenant separation gates.
- Evaluate snapshotting with a supported hypervisor/runtime and real memory snapshots. Measure boot/clone latency from repeated production-like runs; do not hard-code 135 ms.
- Treat TLS anchoring as its own security review. Do not dynamically re-sign public upstream traffic until certificate trust, key isolation, pinning behavior, and tenant boundaries are independently reviewed.
- Gate: security review, multi-tenant isolation tests, host failure recovery, reproducible benchmark methodology, audit evidence, and load tests pass before any kernel/VM moat is advertised.

## Product-claim rules

- Say “browser clock override” until guest, service, and database clocks are proven synchronized.
- Say “browser-context request fixtures” until backend and worker traffic is captured and replayed.
- Say “scenario simulation” only when a result is simulated; use “fault injection” only for faults actually applied and observed.
- Say “browser trace and network response diagnostics” until backend/database telemetry is correlated.
- Say “sanitized event capsule prototype” until consent, allowlisting, encryption, retention, and replay gates pass.
- Never claim production-secret isolation, compliance certification, kernel isolation, or measured performance from code comments, mock reports, or an unverified deployment. Link claims to the tests and supported deployment that substantiate them.

## Suggested sequencing

Ship steps 0–2 first to establish trustworthy capability reporting and a bounded browser-level feature set. Then ship capsule privacy, browser fixtures, and browser diagnostics as independently gated releases. Schedule steps 5–6 as an infrastructure project with separate security and operations owners; they depend on a stable runner protocol and are not a frontend-only extension.
