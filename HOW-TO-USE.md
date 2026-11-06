# AirlockQA: Complete User & Operator Guide

The complete guide has been published to [`docs/HOW-TO-USE.md`](docs/HOW-TO-USE.md).

### Quick Links:
- 🚀 [Architectural Model](docs/HOW-TO-USE.md#1-architectural-model)
- 📦 [Prerequisites & Installation](docs/HOW-TO-USE.md#2-prerequisites--installation)
- ⚙️ [Configuration Reference (`airlock.config.json`)](docs/HOW-TO-USE.md#3-configuration-reference-airlockconfigjson)
- 💻 [Core CLI Commands](docs/HOW-TO-USE.md#4-core-cli-commands)
  - `airlock init`
  - `airlock explore`
  - `airlock compile`
  - `airlock test [--local | --cloud]`
  - `airlock run`
  - `airlock fork`
  - `airlock warp`
  - `airlock chaos`
  - `airlock teleport`
  - `airlock audit`
  - `airlock dataset`
  - `airlock serve`
- 🔄 [CI/CD Integration](docs/HOW-TO-USE.md#5-cicd-workflow-integration)
- 🖥️ [Web Console & Staging GUI QA](docs/HOW-TO-USE.md#6-web-console--staging-gui-qa)
- 🔒 [Cloud Quotas & Security Model](docs/HOW-TO-USE.md#7-cloud-quotas--security-model)

---

### Quick Start in 60 Seconds

```bash
# 1. Install dependencies
bun install
bunx playwright install chromium

# 2. Build TypeScript distribution
bun run build

# 3. Run all tests
bun test

# 4. Run local test suite
bun run cli test --local

# 5. Launch interactive Web Console
bun run cli serve -p 4100
```
