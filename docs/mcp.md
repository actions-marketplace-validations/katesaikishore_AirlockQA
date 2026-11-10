# MCP server

Run the public MCP server over stdio:

```bash
bun bin/qafind.ts mcp
```

Tools:

| Tool | Purpose |
|---|---|
| `qafind_evidence_verify` | Verify a signed run-evidence bundle (Merkle root, hash chain, signature). Use `QAFIND_SIGNING_KEY` for HMAC or `QAFIND_TRUSTED_PUBLIC_KEY` for Ed25519. |
| `qafind_verify` | Verify a signed Verified Merge verdict offline. |
| `qafind_flake` | Read QAFind reporter manifests and return flake counts, causes and optional Markdown. |

Example MCP client config:

```json
{
  "mcpServers": {
    "qafind": {
      "command": "npx",
      "args": ["--yes", "qafind@latest", "mcp"]
    }
  }
}
```

The public server has no shell execution and no cloud credentials. It only reads files under the working
directory.
