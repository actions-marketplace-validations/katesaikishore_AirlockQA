# Encrypted local-to-cloud sync

`qafind sync` uploads the files a local run produces — traces, checkpoints, healing logs, fixtures and bug capsules —
to your QAFind Cloud account. Everything is encrypted **on your machine** before it leaves the process. The service
never receives `QAFIND_SYNC_KEY` and cannot read the files.

## What is uploaded

| Kind | Default directory |
| :--- | :--- |
| `trace` | `.qafind/traces/*.json` |
| `checkpoint` | `.qafind/checkpoints/*.json` |
| `healing` | `.qafind/dataset/**` |
| `fixtures` | `.qafind/shadow/*.json` |
| `capsule` | `.qafind/capsules/*.json` |

Files larger than 2 MB are skipped. Each workspace can store 200 artifacts and 50 MB in total.

## Commands

```bash
# Required on the machine that uploads and downloads. At least 12 characters.
export QAFIND_SYNC_KEY='a long passphrase only you know'

qafind sync                              # upload every kind
qafind sync --kind trace,checkpoint      # only those kinds
qafind sync --dry-run                    # list files, send nothing
qafind sync --json                       # machine-readable result

qafind sync list                         # metadata only
qafind sync download sync_abc123 --out ./checkpoint.json
```

The upload is AES-256-GCM with a scrypt-derived key (16-byte salt, 12-byte IV, authentication tag). The server stores
the envelope as opaque bytes plus metadata: kind, display name, plaintext size, stored size, SHA-256 (of the plaintext,
computed by the client), content type and creation time. It cannot verify that hash; it is for display and integrity
checks after decryption.

## What the server sees

- The account/workspace and the API key used.
- The display name (a relative path such as `.qafind/traces/checkout.json`), kind, sizes, timestamps.
- The ciphertext. Not the plaintext, cookies, storage, DOM, URLs or event contents.

## Limits and honest caveats

- **Losing `QAFIND_SYNC_KEY` means the uploaded artifacts cannot be recovered.** There is no key escrow and no reset.
- **Checkpoints and capsules are sensitive.** They can contain cookies, session storage, DOM content and form values. The
  upload is encrypted, but review what a checkpoint contains before syncing it.
- The server cannot scan encrypted content for secrets or malware. Treat it as an opaque blob store.
- Sync does not make a checkpoint available to a hosted run. It is a backup/transfer path, not cross-run state.
- The console lists the metadata and downloads the encrypted envelope; decrypt it with `qafind sync download`.
- Deleting an artifact removes the metadata and the ciphertext file; it cannot be undone.

## HTTP API

`POST /v1/sync/artifacts` takes `{ kind, name, contentType, plaintextSize, sha256, payloadBase64, encrypted: true }`.
`GET /v1/sync/artifacts` lists metadata, `GET /v1/sync/artifacts/:id` returns the ciphertext and
`DELETE /v1/sync/artifacts/:id` removes it. All routes require an API key or a signed-in session and are scoped to the
owning workspace.
