# QAFind Cloud: client and service boundary

QAFind Cloud is a hosted service at [qafind.si](https://qafind.si) with its API at `https://api.qafind.si`. This page states what this repository contains and what it does not. The public API is described in [cloud-api.md](cloud-api.md).

## In this repository

- **The CLI client:** `qafind login`, `logout`, `whoami`, `usage`, `runs` and `test --cloud`.
- **The web pages** in `public/`: the marketing page, sign-in and create-account, and the console. The console calls the API from the browser and also has a labelled sample mode.
- **The public API contract** in `cloud/shared/`: request and response schemas, plan limits, error codes and the URL guard for hosted targets.

## Not in this repository

The service itself (API server, run worker, container and network configuration, deployment) is closed source and lives in a separate private repository. Nothing in this repository can issue keys, enforce quotas or run a hosted browser.

## What the client guarantees

- **Transport:** the API key is sent only in an `Authorization: Bearer` header, over HTTPS (HTTP is allowed only for `localhost`).
- **Key storage:** `qafind login` writes the key to `~/.config/qafind/credentials.json` (or `QAFIND_CONFIG_DIR`) with owner-only permissions, and refuses a symbolic link there. Environment variables take precedence in CI.
- **Endpoint binding:** a saved key is never sent to an endpoint other than the one it was saved for; `QAFIND_CLOUD_URL` or `--api-url` pointing elsewhere is refused until you log in again for that endpoint.
- **No real credentials:** the request carries phantom placeholders and request-policy rules only. Workflows that use `${env:NAME}` are refused locally.
- **Local pre-checks:** hosted targets are checked before anything is sent, so a `localhost` URL fails with an explanation instead of a server error.
- **Evidence:** a hosted run's signed bundle is downloaded and verified against the service key pinned at login (trust on first use), or against `QAFIND_TRUSTED_PUBLIC_KEY` when set.
- **Output safety:** control characters in text that comes from the service are replaced before printing.

## What the service enforces (free plan)

100 accepted runs per workspace per UTC day, one concurrent run, 50 workflow steps and 90 seconds per run. Limits are enforced on the server; client-side counters are only feedback. Details and error responses are in [cloud-api.md](cloud-api.md).

## Known limits

- Email addresses are not verified (there is no mail service). Sign-ups are rate-limited and capped per day.
- The service holds no application secrets. A hosted run cannot substitute credentials.
- The hosted browser runs inside a hardened container with an address-validating proxy and a network firewall instead of Chromium's own sandbox.
- There is no GitHub or single sign-on, billing, paid plan, or pull-request integration.

## CI

Store the key as a repository or environment secret named `QAFIND_API_KEY` and expose it only to the step that runs `qafind test --cloud`. Do not give it to workflows triggered by untrusted fork pull requests.
