# Product boundary: what runs where

This is the explicit decision behind the console labels and the README status table.

## Hosted QAFind Cloud

These run in the service, in a fresh browser context, and produce a signed result:

| Capability | Scope |
| :--- | :--- |
| Workflow runs | Declarative steps only; no arbitrary spec code |
| `warp` | `Date` inside the page. Not servers, databases, cron, TLS or the host clock |
| `checkpoint` / `restoreCheckpoint` | Within one run, in the run's scratch directory. Removed at the end; not shared across runs |
| `fixture` | Same-origin, method-specific response served in the page. No upstream request, no server-side fixture store |
| `chaos` | Observes one click for an idempotency key. No replay, no network fault injection |
| QA runs | Builds and tests a public repository; unit/e2e/explore/a11y/security/load and failure screenshots |
| Evidence | Signed ledger and QA seals |

## Local CLI only

These remain on the machine. The hosted console labels them **Local** or **Preview**:

- `qafind test` and hand-written specs (the cloud does not run spec code)
- `qafind explore` / `compile` recorder and trace compiler
- self-healing locator runs
- `qafind fork` and cross-run checkpoint files
- the full request-policy files and editor
- the local fixture catalog
- the `qafind warp` command (the workflow step is the supported cloud path)
- the `qafind chaos` command (the workflow step is the supported cloud path)
- bug capsules and `qafind teleport`

## Local-to-cloud sync

`qafind sync` uploads traces, checkpoints, healing logs, fixtures and capsules as **client-encrypted** blobs. The
service stores ciphertext and metadata, cannot decrypt it, and never executes it. This is backup/transfer, not
cross-run state.

## Explicit non-goals (not claimed)

- OS, vDSO, kernel, database or TLS clock control.
- VM memory snapshots or copy-on-write clone paths.
- Kernel `tc netem` faults, host TAP capture or network-wide mock capture.
- eBPF/backend/database trace correlation.
- A server-side fixture store or arbitrary spec execution.
- Compliance certification; the SOC 2 fields are `NOT_ASSESSED`.

If a capability is not listed under "Hosted QAFind Cloud", it is not a cloud feature today.
