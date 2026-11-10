# Attach demo — an unmodified Playwright suite

This project is a normal Playwright suite: its config imports only `@playwright/test`, and its specs
have no QAFind imports. The attach path adds one generated wrapper, a reporter, and (with
`--determinism`) a tsconfig alias + auto-use fixture for network replay and a fixed clock.

From this directory, with the repository dependencies installed:

```bash
# 1. Attach (writes .qafind/*; original config untouched)
bun ../../bin/qafind.ts attach . --determinism

# 2. Seed deterministic network + record the suite (starts the local store)
QAFIND_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  QAFIND_ATTACH_NETWORK=record FLAKE_ROUND=1 bunx playwright test --config .qafind/playwright.qafind.config.ts

# 3. Replay with no network dependency (webServer is disabled by the config for replay)
QAFIND_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  QAFIND_ATTACH_NETWORK=replay FLAKE_ROUND=1 bunx playwright test --config .qafind/playwright.qafind.config.ts

# 4. Triage (run rounds 1..3 to seed the three flaky cases first)
QAFIND_ATTACH_NETWORK=record FLAKE_ROUND=2 bunx playwright test --config .qafind/playwright.qafind.config.ts
QAFIND_ATTACH_NETWORK=record FLAKE_ROUND=3 bunx playwright test --config .qafind/playwright.qafind.config.ts
bun ../../bin/qafind.ts flake .qafind/reports --markdown
bun ../../bin/qafind.ts flake .qafind/reports --owner-map owners.json --quarantine .qafind/quarantine.json
```

Each round exits non-zero because one test fails by design; the reporter still writes the manifest.
`qafind flake` reports the three seeded tests as flaky (network fixture, selector drift, timing), the
stable failure as not flaky, and it reads `.qafind/ledgers/` as corroborating evidence.

The generated `.qafind/` directory is disposable; the demo's original config and all specs are
unchanged by attach except the seeded tests themselves. Replay proof is in
[`artifacts/attach-flake-demo/determinism`](../../artifacts/attach-flake-demo/determinism).
