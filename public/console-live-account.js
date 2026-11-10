/**
 * Live views that are about the account and trust rather than runs:
 * Evidence, CI/CD & API (keys, usage, snippets), Settings, and the honest "runs on your
 * machine" panels for the local-CLI features.
 */
import {
  announce, clear, codeBlock, confirmDialog, copyButton, describeError, errorBox, formatDateTime, formatNumber, h, statusPill,
} from "./console-dom.js";

const API_BASE = "https://api.qafind.si";

// ---------------------------------------------------------------------------
// Local-CLI feature panels
// ---------------------------------------------------------------------------

const LOCAL_FEATURES = {
  explorer: {
    title: "Tests",
    what: "Test specs live in your repository and run on your machine with Playwright. The hosted service does not run spec code: it runs declarative workflows, which you start from the Runs page.",
    commands: [
      ["Run your specs locally", "qafind test"],
      ["Run a workflow on QAFind Cloud", "qafind test --cloud --workflow workflow.json"],
    ],
  },
  recorder: {
    title: "Recorder",
    what: "The recorder opens a real browser window and saves your clicks, typing and key presses as a trace. Compile the trace into a Playwright spec afterwards.",
    commands: [
      ["Record a trace", "qafind explore https://staging.example.com"],
      ["Compile a trace into a spec", "qafind compile <tracePath>"],
    ],
  },
  healing: {
    title: "Self-healing",
    what: "When a locator stops matching, the local runner can look for a safer one and log what it changed. Healing happens inside your local test run, not in hosted runs.",
    commands: [
      ["Run specs with healing on", "qafind test"],
      ["Inspect logged locator patches", "qafind dataset"],
    ],
  },
  checkpoints: {
    title: "Checkpoints",
    what: "A checkpoint saves browser state part-way through a local run. Forking restores it into parallel browser contexts and tries one input value in each.",
    commands: [
      ["Fork a checkpoint", "qafind fork <checkpointName> --values \"SAVE10,SAVE20\" --input \"#coupon\" --action \"#apply\""],
    ],
  },
  policy: {
    title: "Request policy",
    what: "The request policy decides which hosts, methods and paths a test may reach. Hosted runs apply the allowed hosts, methods and blocked paths you send as phantomConfig; the full policy files are managed locally.",
    commands: [
      ["Create configuration and sample policies", "qafind init"],
      ["Run a workflow locally with the policy", "qafind run"],
    ],
  },
  timewarp: {
    title: "Time warp",
    what: "Time warp moves the browser's clock forward so you can test expiry, trials and scheduled behaviour without waiting. It works in the local browser.",
    commands: [["Fast-forward the virtual clock", "qafind warp \"+14 days\""]],
  },
  fixtures: {
    title: "Fixtures",
    what: "Fixtures pin recorded API responses so a test does not change when a real service does. They are part of the local runner. The hosted service has no fixture store.",
    commands: [["Run specs locally", "qafind test"]],
  },
  chaos: {
    title: "Chaos report",
    what: "The chaos check triggers one mutation, such as a checkout click, and reports whether the request carries an idempotency key. It runs against a URL from your machine.",
    commands: [["Check a mutation", "qafind chaos https://staging.example.com --action \"#pay\""]],
  },
  capsules: {
    title: "Bug capsules",
    what: "A bug capsule is a saved browser state. Teleporting a capsule writes a Playwright spec that reproduces the bug.",
    commands: [["Write a repro spec from a capsule", "qafind teleport <capsulePath> --out repro.spec.ts"]],
  },
};

function buildLocalPanel(main, key, feature, shared) {
  main.append(
    h("div", { class: "lv-head" },
      h("div", { class: "lv-head-text" },
        h("div", { class: "lv-title-row" },
          h("h1", { class: "lv-title", tabindex: "-1", text: feature.title }),
          h("span", { class: "lv-badge-preview", text: "Preview" })),
        h("p", { class: "lv-sub", text: feature.what }))),
    h("section", { class: "lv-card", "aria-labelledby": "local-" + key },
      h("h2", { id: "local-" + key, class: "lv-card-title", text: "Runs on your machine" }),
      h("p", { class: "lv-muted", text: "This feature is part of the local CLI. The hosted console does not run it or store its results yet, so there is nothing to show here." }),
      h("div", { class: "lv-stack" }, feature.commands.map(function (entry) {
        return h("div", {}, h("p", { class: "lv-small lv-muted", text: entry[0] }), codeBlock(entry[1], "Copy", shared.ctx.toast));
      })),
      h("p", { class: "lv-muted lv-small" }, "To use QAFind Cloud instead, ", shared.link("#runs/new", "start a cloud run"), ".")));
  shared.views[key] = { main: main, show: function () {} };
}

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

function buildEvidence(main, shared) {
  const { ctx, call } = shared;
  const keyBody = h("div", { id: "evidence-key" });
  const listBody = h("div", { id: "evidence-list" });
  const results = new Map();
  let keyInfo = null;

  main.append(
    shared.pageHeader("Evidence", "Every finished cloud run has a signed evidence bundle. Verify it here, or on your own machine with the CLI."),
    shared.card("Service signing key", keyBody),
    shared.card("Runs with evidence", listBody));

  function renderKey() {
    clear(keyBody);
    if (!keyInfo) {
      keyBody.append(shared.loadingBlock("Loading signing key"));
      return;
    }
    if (keyInfo.error) {
      keyBody.append(shared.retryBlock(keyInfo.error, loadKey));
      return;
    }
    const pem = keyInfo.publicKeyPem || "";
    keyBody.append(
      h("dl", { class: "lv-meta" },
        h("div", { class: "lv-meta-item" }, h("dt", { text: "Key id" }), h("dd", {}, h("span", { class: "lv-mono lv-wrap", id: "evidence-key-id", text: keyInfo.keyId }), " ", copyButton("Copy key id", function () { return keyInfo.keyId; }, ctx.toast))),
        h("div", { class: "lv-meta-item" }, h("dt", { text: "Algorithm" }), h("dd", { text: keyInfo.algorithm }))),
      h("p", { class: "lv-small lv-muted", text: "Public key" }),
      h("div", { class: "lv-code-wrap" },
        h("pre", { class: "lv-code", id: "evidence-public-key", tabindex: "0" }, h("code", { text: pem })),
        copyButton("Copy public key", function () { return pem; }, ctx.toast)),
      h("p", { class: "lv-small lv-muted", text: "Check a bundle on your machine. Pin the public key above so the check does not trust the bundle's own key:" }),
      codeBlock("QAFIND_TRUSTED_PUBLIC_KEY=... qafind audit <bundle.json>", "Copy", ctx.toast),
      h("div", { class: "lv-actions" },
        copyButton("Copy command with this key", function () { return "QAFIND_TRUSTED_PUBLIC_KEY='" + pem.trim() + "' qafind audit <bundle.json>"; }, ctx.toast)),
      h("p", { class: "lv-small lv-muted", text: "A valid bundle shows the recorded ledger was not changed after signing. It does not show that the target application is secure and is not a compliance assessment." }));
  }

  async function loadKey() {
    keyInfo = null;
    renderKey();
    try {
      keyInfo = await call(function () { return ctx.api.evidenceKey(); });
    } catch (error) {
      keyInfo = { error: error };
    }
    renderKey();
  }

  function resultNode(outcome) {
    if (outcome.pending) return h("p", { class: "lv-muted", text: "Verifying…" });
    if (outcome.error) return errorBox(describeError(outcome.error));
    const result = outcome.result || {};
    const warnings = Array.isArray(result.warnings) ? result.warnings : [];
    return h("div", { class: "lv-alert " + (result.valid ? "lv-alert-ok" : "lv-alert-error"), "data-verify-result": result.valid ? "valid" : "invalid" },
      h("strong", { text: result.valid ? "Valid" : "Invalid" }),
      result.reason ? h("p", { class: "lv-wrap", text: result.reason }) : null,
      warnings.length ? h("ul", {}, warnings.map(function (warning) { return h("li", { text: String(warning) }); })) : null,
      h("p", { class: "lv-small lv-muted", text: "Checked by the service against its signing key." }));
  }

  async function verify(run, resultSlot, button) {
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    results.set(run.id, { pending: true });
    clear(resultSlot);
    resultSlot.append(resultNode({ pending: true }));
    try {
      const bundle = await call(function () { return ctx.api.runs.evidence(run.id); });
      const result = await call(function () { return ctx.api.verifyEvidence(bundle); });
      results.set(run.id, { result: result });
      announce("Evidence for " + run.suiteName + " is " + (result && result.valid ? "valid" : "invalid"));
    } catch (error) {
      results.set(run.id, { error: error });
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
    clear(resultSlot);
    resultSlot.append(resultNode(results.get(run.id)));
  }

  function renderList(runs) {
    clear(listBody);
    const withEvidence = runs.filter(function (run) { return run.hasEvidence; });
    if (withEvidence.length === 0) {
      listBody.append(h("div", { class: "lv-empty", id: "evidence-empty" },
        h("p", { class: "lv-muted", text: "No finished runs have evidence yet. Evidence is signed when a cloud run finishes." }),
        shared.link("#runs/new", "Start a cloud run", "lv-btn lv-btn-primary")));
      return;
    }
    listBody.append(h("ul", { class: "lv-evidence-list" }, withEvidence.map(function (run) {
      const slot = h("div", { class: "lv-verify-slot", "aria-live": "polite" });
      if (results.has(run.id)) slot.append(resultNode(results.get(run.id)));
      const button = h("button", { type: "button", class: "lv-btn lv-btn-small", "data-verify": run.id, text: "Verify", "aria-label": "Verify evidence for " + run.suiteName });
      button.addEventListener("click", function () { verify(run, slot, button); });
      return h("li", { class: "lv-evidence-item" },
        h("div", { class: "lv-evidence-row" },
          h("div", { class: "lv-evidence-main" },
            shared.link("#run-detail/" + encodeURIComponent(run.id), run.suiteName, "lv-link lv-run-link"),
            h("div", { class: "lv-small lv-muted" }, statusPill(run.status), " ", formatDateTime(run.finishedAt || run.createdAt), " · ", h("span", { class: "lv-mono", text: run.id.slice(0, 8) }))),
          button),
        slot);
    })));
  }

  async function loadList() {
    clear(listBody);
    listBody.append(shared.loadingBlock("Loading runs"));
    try {
      const result = await call(function () { return ctx.api.runs.list({ limit: 50 }); });
      renderList(result.runs || []);
    } catch (error) {
      clear(listBody);
      listBody.append(shared.retryBlock(error, loadList));
    }
  }

  shared.views.audit = {
    main: main,
    show: function () {
      if (!keyInfo || keyInfo.error) loadKey();
      loadList();
    },
  };
}

// ---------------------------------------------------------------------------
// CI/CD & API
// ---------------------------------------------------------------------------

const GITHUB_ACTIONS = [
  "name: QAFind browser tests",
  "on: [push, pull_request]",
  "jobs:",
  "  qafind:",
  "    runs-on: ubuntu-latest",
  "    steps:",
  "      - uses: actions/checkout@v4",
  "      - uses: actions/setup-node@v4",
  "        with:",
  "          node-version: 20",
  "      - run: npx qafind test --cloud",
  "        env:",
  "          QAFIND_API_KEY: ${{ secrets.QAFIND_API_KEY }}",
].join("\n");

const CURL_EXAMPLE = [
  "curl -X POST " + API_BASE + "/v1/runs \\",
  "  -H \"Authorization: Bearer $QAFIND_API_KEY\" \\",
  "  -H \"Content-Type: application/json\" \\",
  "  -d '{\"suiteName\":\"checkout\",\"targetUrl\":\"https://staging.example.com\"}'",
].join("\n");

const CURL_STATUS = "curl -H \"Authorization: Bearer $QAFIND_API_KEY\" " + API_BASE + "/v1/runs/<runId>";

function buildIntegrations(main, shared) {
  const { ctx, call } = shared;
  const usageHost = h("div", { "data-usage-card": "" });
  const limitsHost = h("div", { id: "usage-limits" });
  const tokenHost = h("div", { id: "new-key-host" });
  const keysHost = h("div", { id: "keys-list" });
  let keys = null;
  let keysError = null;

  const nameInput = h("input", { id: "key-name", class: "lv-input", type: "text", maxlength: "60", autocomplete: "off", placeholder: "ci-main", required: true, "aria-describedby": "key-name-hint" });
  const createButton = h("button", { type: "submit", class: "lv-btn lv-btn-primary", text: "Create key" });
  const createResult = h("div", { id: "create-key-result" });
  const form = h("form", { class: "lv-form lv-form-inline", id: "create-key-form", novalidate: true },
    h("div", { class: "lv-field" }, h("label", { for: "key-name", text: "Key name" }), nameInput, h("p", { id: "key-name-hint", class: "lv-hint", text: "A label so you can tell keys apart, for example the CI job that uses it." })),
    createButton);

  main.append(
    shared.pageHeader("CI/CD & API", "Create an API key, then run hosted tests from your terminal or CI. The API lives at " + API_BASE + "."),
    shared.card("Usage and limits", h("div", {}, usageHost, limitsHost)),
    shared.card("API keys", h("div", {}, form, createResult, tokenHost, keysHost)),
    shared.card("GitHub Actions", h("div", {},
      h("p", { class: "lv-muted", text: "Store a key as a repository secret named QAFIND_API_KEY (Settings, Secrets and variables, Actions), then add this workflow." }),
      codeBlock(GITHUB_ACTIONS, "Copy workflow", ctx.toast))),
    shared.card("curl", h("div", {},
      h("p", { class: "lv-muted", text: "Submit a run and read its result with any HTTP client." }),
      codeBlock(CURL_EXAMPLE, "Copy", ctx.toast),
      codeBlock(CURL_STATUS, "Copy", ctx.toast))),
    shared.card("CLI", h("ul", { class: "lv-cli-list" },
      [
        ["qafind login", "Save an API key on this machine"],
        ["qafind whoami", "Show which key and plan this machine uses"],
        ["qafind usage", "Show today's run usage and limits"],
        ["qafind test --cloud [spec] [--workflow file]", "Start a hosted run"],
        ["qafind runs [runId]", "List recent runs, or show one run with its steps"],
        ["qafind audit <bundle>", "Verify a signed evidence bundle"],
        ["qafind logout", "Remove the saved key from this machine"],
      ].map(function (entry) { return h("li", {}, h("code", { text: entry[0] }), h("span", { class: "lv-muted", text: " " + entry[1] })); }))));

  function renderLimits() {
    clear(limitsHost);
    shared.renderUsageCard(usageHost);
    const usage = ctx.usage;
    if (!usage) return;
    limitsHost.append(h("dl", { class: "lv-meta" },
      h("div", { class: "lv-meta-item" }, h("dt", { text: "Plan" }), h("dd", { text: "Free" })),
      h("div", { class: "lv-meta-item" }, h("dt", { text: "Concurrent runs" }), h("dd", { text: usage.concurrent.running + " running of " + usage.concurrent.limit + ", " + usage.concurrent.queued + " queued" })),
      h("div", { class: "lv-meta-item" }, h("dt", { text: "Steps per run" }), h("dd", { text: "Up to " + usage.limits.maxSteps })),
      h("div", { class: "lv-meta-item" }, h("dt", { text: "Run time limit" }), h("dd", { text: usage.limits.runTimeoutSec + " seconds" })),
      h("div", { class: "lv-meta-item" }, h("dt", { text: "Active API keys" }), h("dd", { text: (keys ? keys.length + " of " : "Up to ") + usage.limits.maxActiveKeys }))));
  }

  function renderKeys() {
    clear(keysHost);
    if (keysError) {
      keysHost.append(shared.retryBlock(keysError, loadKeys));
      return;
    }
    if (!keys) {
      keysHost.append(shared.loadingBlock("Loading keys"));
      return;
    }
    if (keys.length === 0) {
      keysHost.append(h("p", { class: "lv-muted", id: "keys-empty", text: "No active API keys. Create one above to use the CLI or CI." }));
      return;
    }
    const head = ["Name", "Key", "Created", "Last used", ""];
    keysHost.append(h("div", { class: "lv-table-wrap" }, h("table", { class: "lv-table", id: "keys-table" },
      h("caption", { class: "sr-only", text: "Active API keys" }),
      h("thead", {}, h("tr", {}, head.map(function (title) { return h("th", { scope: "col" }, title ? title : h("span", { class: "sr-only", text: "Actions" })); }))),
      h("tbody", {}, keys.map(function (key) {
        const revoke = h("button", { type: "button", class: "lv-btn lv-btn-small lv-btn-danger-quiet", text: "Revoke", "aria-label": "Revoke key " + key.name, "data-revoke": key.id });
        revoke.addEventListener("click", function () { revokeKey(key, revoke); });
        return h("tr", { "data-key-id": key.id },
          h("td", { class: "lv-wrap", text: key.name }),
          h("td", { class: "lv-mono", text: key.prefix + "…" }),
          h("td", { text: formatDateTime(key.createdAt) }),
          h("td", { text: key.lastUsedAt ? formatDateTime(key.lastUsedAt) : "Never" }),
          h("td", {}, revoke));
      })))));
  }

  async function loadKeys() {
    try {
      const result = await call(function () { return ctx.api.keys.list(); });
      keys = (result.keys || []).filter(function (key) { return !key.revokedAt; });
      keysError = null;
    } catch (error) {
      keysError = error;
    }
    renderKeys();
    renderLimits();
  }

  async function revokeKey(key, button) {
    const confirmed = await confirmDialog({
      title: "Revoke \"" + key.name + "\"?",
      message: "Anything using this key stops working immediately. This cannot be undone.",
      confirmLabel: "Revoke key",
      danger: true,
    });
    if (!confirmed) return;
    button.disabled = true;
    try {
      await call(function () { return ctx.api.keys.revoke(key.id); });
      keys = (keys || []).filter(function (other) { return other.id !== key.id; });
      renderKeys();
      renderLimits();
      announce("Key " + key.name + " revoked");
      ctx.toast("Key revoked");
      nameInput.focus();
    } catch (error) {
      button.disabled = false;
      clear(createResult);
      createResult.append(errorBox(describeError(error)));
    }
  }

  function showToken(created) {
    clear(tokenHost);
    const token = created.token;
    const panel = h("section", { class: "lv-alert lv-alert-warn lv-token", id: "new-key-panel", tabindex: "-1", role: "region", "aria-label": "New API key" },
      h("strong", { text: "Copy this key now. You will not see it again." }),
      h("p", { class: "lv-small", text: "Key \"" + created.key.name + "\" was created. Store it as QAFIND_API_KEY in your CI secrets, or paste it into qafind login." }),
      h("div", { class: "lv-token-row" },
        h("code", { class: "lv-token-value", id: "new-key-token", text: token }),
        copyButton("Copy key", function () { return token; }, ctx.toast)),
      h("div", { class: "lv-actions" },
        h("button", { type: "button", class: "lv-btn lv-btn-small", id: "dismiss-token", text: "I have saved it, dismiss", on: { click: function () { clear(tokenHost); nameInput.focus(); } } })));
    tokenHost.append(panel);
    panel.focus();
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clear(createResult);
    const name = nameInput.value.trim();
    if (!name) {
      createResult.append(errorBox({ message: "Give the key a name.", issues: [] }));
      nameInput.focus();
      return;
    }
    createButton.disabled = true;
    createButton.setAttribute("aria-busy", "true");
    try {
      const created = await call(function () { return ctx.api.keys.create(name); });
      nameInput.value = "";
      showToken(created);
      announce("API key created. Copy it now: it is shown once.");
      await loadKeys();
    } catch (error) {
      createResult.append(errorBox(describeError(error)));
    } finally {
      createButton.disabled = false;
      createButton.removeAttribute("aria-busy");
    }
  });

  shared.views.integrations = {
    main: main,
    onUsage: renderLimits,
    show: function () {
      renderLimits();
      renderKeys();
      loadKeys();
      shared.refreshUsage();
    },
  };
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

function buildSettings(main, shared) {
  const { ctx, call } = shared;
  const workspace = ctx.me.workspace || {};
  const user = ctx.me.user || {};
  const detailHost = h("div", { id: "settings-details" });
  const limitsHost = h("div", { id: "settings-limits" });
  const result = h("div", { id: "rename-result", "aria-live": "polite" });
  const nameInput = h("input", { id: "workspace-name", class: "lv-input", type: "text", maxlength: "80", required: true, autocomplete: "off", value: workspace.name || "" });
  const save = h("button", { type: "submit", class: "lv-btn lv-btn-primary", text: "Save name" });
  const form = h("form", { class: "lv-form lv-form-inline", id: "rename-form", novalidate: true },
    h("div", { class: "lv-field" }, h("label", { for: "workspace-name", text: "Workspace name" }), nameInput),
    save);

  main.append(
    shared.pageHeader("Settings", "Your workspace and account."),
    shared.card("Workspace", h("div", {}, form, result, detailHost)),
    shared.card("Account", h("dl", { class: "lv-meta" },
      h("div", { class: "lv-meta-item" }, h("dt", { text: "Email" }), h("dd", { id: "settings-email", class: "lv-wrap", text: user.email || "—" })),
      user.name ? h("div", { class: "lv-meta-item" }, h("dt", { text: "Name" }), h("dd", { class: "lv-wrap", text: user.name })) : null)),
    shared.card("Plan", h("div", {},
      h("p", {}, h("strong", { text: "Free" })),
      limitsHost)),
    h("div", { class: "lv-actions" }, h("button", { type: "button", class: "lv-btn", id: "settings-signout", text: "Sign out", on: { click: function () { ctx.signOut(); } } })));

  function renderDetails(info) {
    clear(detailHost);
    detailHost.append(h("dl", { class: "lv-meta" },
      info.createdAt ? h("div", { class: "lv-meta-item" }, h("dt", { text: "Created" }), h("dd", { text: formatDateTime(info.createdAt) })) : null,
      h("div", { class: "lv-meta-item" }, h("dt", { text: "Plan" }), h("dd", { text: "Free" }))));
  }

  function renderLimits() {
    clear(limitsHost);
    const usage = ctx.usage;
    if (!usage) {
      limitsHost.append(h("p", { class: "lv-muted", text: "Limits are unavailable right now." }));
      return;
    }
    limitsHost.append(h("dl", { class: "lv-meta" },
      h("div", { class: "lv-meta-item" }, h("dt", { text: "Cloud runs per day" }), h("dd", { text: formatNumber(usage.daily.limit) })),
      h("div", { class: "lv-meta-item" }, h("dt", { text: "Concurrent runs" }), h("dd", { text: String(usage.concurrent.limit) })),
      h("div", { class: "lv-meta-item" }, h("dt", { text: "Steps per run" }), h("dd", { text: String(usage.limits.maxSteps) })),
      h("div", { class: "lv-meta-item" }, h("dt", { text: "Run time limit" }), h("dd", { text: usage.limits.runTimeoutSec + " seconds" })),
      h("div", { class: "lv-meta-item" }, h("dt", { text: "Active API keys" }), h("dd", { text: String(usage.limits.maxActiveKeys) }))));
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clear(result);
    const name = nameInput.value.trim();
    if (!name) {
      result.append(errorBox({ message: "Enter a workspace name.", issues: [] }));
      nameInput.focus();
      return;
    }
    save.disabled = true;
    save.setAttribute("aria-busy", "true");
    try {
      const updated = await call(function () { return ctx.api.renameWorkspace(name); });
      ctx.me.workspace = Object.assign({}, ctx.me.workspace, { name: (updated && updated.name) || name });
      nameInput.value = ctx.me.workspace.name;
      shared.updateShell();
      result.append(h("div", { class: "lv-alert lv-alert-ok", role: "status" }, h("strong", { text: "Workspace renamed." })));
      announce("Workspace renamed");
    } catch (error) {
      result.append(errorBox(describeError(error)));
    } finally {
      save.disabled = false;
      save.removeAttribute("aria-busy");
    }
  });

  shared.views.settings = {
    main: main,
    onUsage: renderLimits,
    show: async function () {
      renderDetails(ctx.me.workspace || {});
      renderLimits();
      try {
        const info = await call(function () { return ctx.api.workspace(); });
        if (info) {
          ctx.me.workspace = Object.assign({}, ctx.me.workspace, info);
          renderDetails(info);
          if (document.activeElement !== nameInput) nameInput.value = info.name || nameInput.value;
          shared.updateShell();
        }
      } catch (error) {
        // The details already on screen come from api.me(); keep them.
      }
      shared.refreshUsage();
    },
  };
}

export function mountAccountViews(mains, shared) {
  if (mains.audit) buildEvidence(mains.audit, shared);
  if (mains.integrations) buildIntegrations(mains.integrations, shared);
  if (mains.settings) buildSettings(mains.settings, shared);
  Object.keys(LOCAL_FEATURES).forEach(function (key) {
    if (mains[key]) buildLocalPanel(mains[key], key, LOCAL_FEATURES[key], shared);
  });
}

