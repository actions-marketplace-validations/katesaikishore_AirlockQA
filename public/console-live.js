/**
 * Live mode of the console: the views are backed by the Airlock Cloud API (docs/cloud-api.md).
 * dashboard.js imports this module only when api.me() returned a signed-in user.
 *
 * Rules kept throughout: API values are rendered with textContent / DOM construction only,
 * nothing is invented (no fake run numbers or metrics) and status changes are announced.
 */
import {
  announce, byId, clear, codeBlock, confirmDialog, describeError, errorBox, failureLabel,
  formatDateTime, formatDuration, formatNumber, formatPercent, formatRelative, formatTime, h, initials, isActive, nextId,
  statusPill,
} from "./console-dom.js";
import { mountAccountViews } from "./console-live-account.js";

const POLL_MS = 3000;
const EXAMPLE_WORKFLOW = {
  name: "checkout",
  steps: [
    { action: "goto", url: "/" },
    { action: "expectVisible", selector: "#cart" },
  ],
};

const ctx = {
  api: null,
  me: null,
  toast: function () {},
  signOut: function () {},
  usage: null,
  usageError: false,
};

const state = {
  view: "",
  runs: [],
  nextCursor: null,
  runsLoaded: false,
  runsError: null,
  status: "all",
  search: "",
  recent: [],
  detail: null,
  detailId: "",
  detailSignature: "",
  analyticsDays: 30,
};

const views = {};
let pollTimer = 0;
let pollBusy = false;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function redirectToLogin() {
  const requestedPath = window.location.pathname + window.location.search + window.location.hash;
  window.location.replace("/login?next=" + encodeURIComponent(requestedPath));
}

/** Run an API call. A 401 means the session ended: go to the sign-in page. */
async function call(fn) {
  try {
    return await fn();
  } catch (error) {
    if (error && error.status === 401) {
      redirectToLogin();
      await new Promise(function () {});
    }
    throw error;
  }
}

function pageHeader(title, subtitle, actions) {
  return h("div", { class: "lv-head" },
    h("div", { class: "lv-head-text" },
      h("h1", { class: "lv-title", tabindex: "-1", text: title }),
      subtitle ? h("p", { class: "lv-sub", text: subtitle }) : null),
    actions ? h("div", { class: "lv-actions" }, actions) : null);
}

function card(title, body, options) {
  const settings = options || {};
  const id = nextId("card");
  return h("section", { class: "lv-card" + (settings.className ? " " + settings.className : ""), "aria-labelledby": id },
    title ? h("div", { class: "lv-card-head" }, h("h2", { id: id, class: "lv-card-title", text: title }), settings.aside || null) : null,
    body);
}

function kpi(label, value, foot, id) {
  return h("article", { class: "lv-kpi" },
    h("div", { class: "lv-kpi-label", text: label }),
    h("div", { class: "lv-kpi-value", text: value, id: id || null }),
    foot ? h("div", { class: "lv-kpi-foot", text: foot }) : null);
}

function link(href, text, className) {
  return h("a", { href: href, class: className || "lv-link", text: text });
}

function shortId(id) { return String(id || "").slice(0, 8); }

function loadingBlock(text) {
  return h("p", { class: "lv-muted", role: "status", text: text || "Loading" });
}

function retryBlock(error, retry) {
  const info = describeError(error);
  return h("div", { class: "lv-alert lv-alert-error", role: "alert" },
    h("strong", { text: info.message }),
    h("button", { type: "button", class: "lv-btn lv-btn-small", text: "Try again", on: { click: retry } }));
}

function targetHost(url) {
  try {
    const parsed = new URL(url);
    return parsed.host + (parsed.pathname === "/" ? "" : parsed.pathname);
  } catch (error) {
    return String(url || "");
  }
}

// ---------------------------------------------------------------------------
// Shell: header, sidebar, usage meter
// ---------------------------------------------------------------------------

function setText(id, value) {
  const element = byId(id);
  if (element) element.textContent = value;
}

function updateShell() {
  const user = ctx.me.user || {};
  const workspace = ctx.me.workspace || {};
  const email = user.email || "";
  const plan = workspace.plan ? workspace.plan.charAt(0).toUpperCase() + workspace.plan.slice(1) : "Free";
  const workspaceName = workspace.name || "Workspace";
  const displayName = user.name || email || "Account";

  setText("crumb-workspace", workspaceName);
  setText("ws-name", workspaceName);
  setText("ws-plan", plan + " plan");
  setText("profile-name", displayName);
  setText("profile-role", user.name ? email : plan + " plan");
  setText("profile-avatar", initials(displayName));
  const avatar = byId("topbar-avatar");
  if (avatar) {
    avatar.textContent = initials(displayName);
    avatar.setAttribute("aria-label", "Sign out " + email);
    avatar.title = "Sign out";
  }
  const chip = byId("workspace-chip");
  if (chip) {
    chip.replaceChildren(h("i", { class: "chip-dot" }), h("span", { class: "chip-text", id: "signed-in-email", text: email }));
    chip.title = "Signed in as " + email;
  }
  document.querySelectorAll("[data-demo-signout]").forEach(function (button) {
    button.setAttribute("aria-label", "Sign out " + email);
  });
  const switcher = byId("ws-button");
  if (switcher) {
    switcher.disabled = true;
    switcher.setAttribute("aria-label", "Workspace: " + workspaceName + ", " + plan + " plan");
    const chevron = switcher.querySelector("svg");
    if (chevron) chevron.remove();
    switcher.style.cursor = "default";
  }
  const search = byId("open-run-search");
  if (search) search.setAttribute("aria-label", "Search runs");
}

export function renderUsage() {
  const count = byId("usage-count");
  const bar = byId("usage-bar");
  const track = byId("usage-track");
  const reset = byId("usage-reset");
  const usage = ctx.usage;
  if (!count || !bar) return;
  if (!usage) {
    count.textContent = ctx.usageError ? "Unavailable" : "…";
    bar.style.width = "0%";
    if (reset) reset.hidden = true;
    return;
  }
  const daily = usage.daily;
  const percent = daily.limit > 0 ? Math.min(100, Math.round((daily.used / daily.limit) * 100)) : 0;
  count.textContent = daily.used + " / " + daily.limit;
  bar.style.width = percent + "%";
  bar.style.background = percent >= 100 ? "rgb(180, 35, 24)" : percent >= 80 ? "rgb(181, 106, 20)" : "rgb(47, 111, 91)";
  if (track) {
    track.setAttribute("aria-valuenow", String(daily.used));
    track.setAttribute("aria-valuemax", String(daily.limit));
    track.setAttribute("aria-valuetext", daily.used + " of " + daily.limit + " runs used today");
  }
  if (reset) {
    reset.hidden = false;
    reset.textContent = "Resets at " + formatTime(daily.resetAt);
  }
  document.querySelectorAll("[data-usage-card]").forEach(renderUsageCard);
}

function renderUsageCard(container) {
  const usage = ctx.usage;
  clear(container);
  if (!usage) {
    container.append(h("p", { class: "lv-muted", text: ctx.usageError ? "Usage is unavailable right now." : "Loading usage" }));
    return;
  }
  const daily = usage.daily;
  const percent = daily.limit > 0 ? Math.min(100, Math.round((daily.used / daily.limit) * 100)) : 0;
  container.append(
    h("div", { class: "lv-usage-line" },
      h("strong", { class: "lv-mono", text: daily.used + " / " + daily.limit }),
      h("span", { class: "lv-muted", text: "cloud runs today" })),
    h("div", { class: "lv-meter", "aria-hidden": "true" }, h("span", { style: "width:" + percent + "%" })),
    h("p", { class: "lv-muted lv-small", text: daily.remaining + " remaining. Resets at " + formatTime(daily.resetAt) + "." }));
}

export async function refreshUsage() {
  try {
    ctx.usage = await call(function () { return ctx.api.usage(); });
    ctx.usageError = false;
  } catch (error) {
    ctx.usageError = true;
  }
  renderUsage();
  if (views.integrations && views.integrations.onUsage) views.integrations.onUsage();
  if (views.settings && views.settings.onUsage) views.settings.onUsage();
}

function updateRunsBadge() {
  const nav = document.querySelector(".primary-nav");
  if (!nav) return;
  nav.querySelectorAll("a.cn-item").forEach(function (item) {
    if (item.children.length < 3) return;
    const badge = item.children[2];
    if (item.dataset.nav === "runs") {
      const active = state.runs.concat(state.recent).filter(function (run, index, all) {
        return isActive(run.status) && all.findIndex(function (other) { return other.id === run.id; }) === index;
      }).length;
      badge.hidden = active === 0;
      badge.textContent = String(active);
      badge.setAttribute("aria-label", active + " active " + (active === 1 ? "run" : "runs"));
    } else {
      badge.remove();
    }
  });
}

// ---------------------------------------------------------------------------
// Polling: every 3 seconds while a run is QUEUED or RUNNING, paused while the tab is hidden
// ---------------------------------------------------------------------------

function pollWanted() {
  if (document.hidden) return false;
  if (state.view === "runs") return state.runs.some(function (run) { return isActive(run.status); });
  if (state.view === "dashboard") return state.recent.some(function (run) { return isActive(run.status); });
  if (state.view === "run-detail") return Boolean(state.detail && isActive(state.detail.status));
  return false;
}

function stopPolling() {
  window.clearTimeout(pollTimer);
  pollTimer = 0;
}

function schedulePoll() {
  stopPolling();
  if (!pollWanted()) return;
  pollTimer = window.setTimeout(pollTick, POLL_MS);
}

async function pollTick() {
  pollTimer = 0;
  if (pollBusy || !pollWanted()) return;
  pollBusy = true;
  const view = state.view;
  try {
    if (view === "runs") await loadRuns({ silent: true });
    else if (view === "dashboard") await views.dashboard.loadRecent();
    else if (view === "run-detail") await loadDetail(state.detailId, { silent: true });
  } catch (error) {
    // A failed poll keeps the last good data on screen; the next tick retries.
  } finally {
    pollBusy = false;
  }
  if (state.view === view) schedulePoll();
}

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    stopPolling();
  } else if (pollWanted()) {
    pollTick();
  }
});

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function recentRunItem(run) {
  return h("li", { class: "lv-recent-item" },
    h("a", { class: "lv-recent-link", href: "#run-detail/" + encodeURIComponent(run.id) },
      h("span", { class: "lv-recent-main" },
        h("strong", { text: run.suiteName }),
        h("span", { class: "lv-muted lv-small", text: targetHost(run.targetUrl) })),
      h("span", { class: "lv-recent-side" },
        statusPill(run.status),
        h("span", { class: "lv-muted lv-small", text: run.status === "QUEUED" && run.queuePosition ? "Position " + run.queuePosition : formatRelative(run.createdAt) }))));
}

function onboardingCard() {
  return h("section", { class: "lv-card lv-onboard", "aria-labelledby": "ov-empty-title" },
    h("h2", { id: "ov-empty-title", class: "lv-card-title", text: "No runs yet" }),
    h("p", { class: "lv-sub", text: "Cloud runs open your site in an isolated browser, apply the request policy and return signed evidence. Start one here, or from your terminal:" }),
    h("div", { class: "lv-actions" }, link("#runs/new", "Start a cloud run", "lv-btn lv-btn-primary")),
    h("div", { class: "lv-stack" },
      codeBlock("airlock login", "Copy", ctx.toast),
      codeBlock("airlock test --cloud", "Copy", ctx.toast)),
    h("p", { class: "lv-muted lv-small" }, "Create an API key under ", link("#cicd", "CI/CD & API"), " first, then paste it when ", h("code", { text: "airlock login" }), " asks."));
}

function buildOverview(main) {
  const intro = h("div", { class: "lv-overview-intro" });
  const kpis = h("section", { class: "lv-grid lv-grid-kpi", "aria-label": "Workspace at a glance" });
  const body = h("div", { class: "lv-two-col" });
  const recentBody = h("div", { id: "ov-recent" });
  const usageBody = h("div", { "data-usage-card": "" });
  const state2 = { analytics: null, error: null, loading: true, recentLoaded: false };
  const email = ctx.me.user && ctx.me.user.email;
  const workspace = ctx.me.workspace && ctx.me.workspace.name;

  main.append(
    pageHeader("Overview", (workspace || "Workspace") + (email ? " · " + email : ""), [
      link("#cicd", "Connect CI", "lv-btn"),
      link("#runs/new", "Start cloud run", "lv-btn lv-btn-primary"),
    ]),
    intro, kpis, body);
  body.append(
    card("Recent runs", recentBody, { aside: link("#runs", "All runs") }),
    card("Usage today", usageBody, { className: "lv-card-side" }));

  function runsThisWeek(days) {
    const cutoff = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
    return days.filter(function (day) { return String(day.date) >= cutoff; }).reduce(function (sum, day) { return sum + (Number(day.runs) || 0); }, 0);
  }

  function renderKpis() {
    clear(kpis);
    const data = state2.analytics;
    if (state2.loading) {
      kpis.append(loadingBlock("Loading metrics"));
      return;
    }
    if (!data) {
      kpis.append(retryBlock(state2.error, function () { views.dashboard.show(); }));
      return;
    }
    const totals = data.totals || {};
    const finished = totals.runs > 0;
    kpis.append(
      kpi("Runs this week", formatNumber(runsThisWeek(data.days || [])), "Last 7 days, UTC"),
      kpi("Pass rate", finished ? formatPercent(totals.passRate) : "—", "Last 30 days"),
      kpi("Requests allowed", formatNumber(totals.requestsAllowed), "Last 30 days"),
      kpi("Requests blocked", formatNumber(totals.requestsBlocked), "Last 30 days"));
  }

  function renderRecent() {
    clear(recentBody);
    if (!state2.recentLoaded) {
      recentBody.append(loadingBlock("Loading runs"));
      return;
    }
    if (state.recent.length === 0) {
      recentBody.append(h("p", { class: "lv-muted", text: "Nothing has run yet." }));
      return;
    }
    recentBody.append(h("ul", { class: "lv-recent" }, state.recent.map(recentRunItem)));
  }

  function renderIntro() {
    clear(intro);
    const data = state2.analytics;
    const empty = state2.recentLoaded && state.recent.length === 0 && (!data || !data.totals || !data.totals.runs);
    if (empty) intro.append(onboardingCard());
  }

  let signature = "";
  views.dashboard = {
    main: main,
    async loadRecent() {
      const result = await call(function () { return ctx.api.runs.list({ limit: 5 }); });
      const previous = state.recent;
      state.recent = result.runs || [];
      state2.recentLoaded = true;
      const next = JSON.stringify(state.recent.map(function (run) { return [run.id, run.status, run.queuePosition, run.passedSteps]; }));
      if (next !== signature) {
        signature = next;
        renderRecent();
        renderIntro();
      }
      updateRunsBadge();
      const changed = previous.some(function (old) {
        const fresh = state.recent.find(function (run) { return run.id === old.id; });
        return fresh && fresh.status !== old.status;
      });
      if (changed) refreshUsage();
    },
    async show() {
      state2.loading = state2.analytics === null;
      renderKpis();
      renderRecent();
      renderUsage();
      document.querySelectorAll("[data-usage-card]").forEach(renderUsageCard);
      const [analytics, recent] = await Promise.allSettled([
        call(function () { return ctx.api.analytics(30); }),
        views.dashboard.loadRecent(),
      ]);
      state2.loading = false;
      if (analytics.status === "fulfilled") {
        state2.analytics = analytics.value;
        state2.error = null;
      } else {
        state2.error = analytics.reason;
      }
      if (recent.status === "rejected") {
        state2.recentLoaded = true;
        clear(recentBody);
        recentBody.append(retryBlock(recent.reason, function () { views.dashboard.show(); }));
      }
      renderKpis();
      renderIntro();
      schedulePoll();
    },
  };
}

// ---------------------------------------------------------------------------
// Runs list and the "Start cloud run" form
// ---------------------------------------------------------------------------

function runMatchesSearch(run, query) {
  if (!query) return true;
  const haystack = [run.suiteName, run.targetUrl, run.id, run.workflowName, run.status].join(" ").toLowerCase();
  return haystack.indexOf(query) !== -1;
}

function visibleRuns() {
  const query = state.search.trim().toLowerCase();
  return state.runs.filter(function (run) {
    return (state.status === "all" || run.status === state.status) && runMatchesSearch(run, query);
  });
}

function runsTable(runs) {
  const head = ["Run", "Status", "Target", "Steps", "Duration", "Requests", "Started"];
  return h("div", { class: "lv-table-wrap" },
    h("table", { class: "lv-table" },
      h("caption", { class: "sr-only", text: "Cloud runs" }),
      h("thead", {}, h("tr", {}, head.map(function (title) { return h("th", { scope: "col", text: title }); }))),
      h("tbody", {}, runs.map(function (run) {
        return h("tr", { "data-run-id": run.id, "data-status": run.status },
          h("td", {},
            h("a", { class: "lv-link lv-run-link", href: "#run-detail/" + encodeURIComponent(run.id), text: run.suiteName }),
            h("div", { class: "lv-mono lv-small lv-muted", text: shortId(run.id) })),
          h("td", {}, statusPill(run.status), run.status === "QUEUED" && run.queuePosition ? h("div", { class: "lv-small lv-muted", text: "Position " + run.queuePosition }) : null),
          h("td", { class: "lv-wrap", text: targetHost(run.targetUrl) }),
          h("td", { class: "lv-mono", text: run.totalSteps ? run.passedSteps + "/" + run.totalSteps : "—" }),
          h("td", { class: "lv-mono", text: formatDuration(run.executionTimeMs) }),
          h("td", { class: "lv-mono", text: run.requestsAllowed + " ok · " + run.requestsBlocked + " blocked" }),
          h("td", { title: formatDateTime(run.createdAt), text: formatRelative(run.createdAt) }));
      }))));
}

function buildStartForm(onCreated) {
  const suite = h("input", { id: "start-suite", class: "lv-input", name: "suiteName", type: "text", maxlength: "80", required: true, autocomplete: "off", placeholder: "checkout" });
  const target = h("input", { id: "start-target", class: "lv-input", name: "targetUrl", type: "url", required: true, autocomplete: "off", placeholder: "https://staging.example.com", "aria-describedby": "start-target-hint" });
  const workflow = h("textarea", { id: "start-workflow", class: "lv-input lv-textarea", name: "workflow", rows: "7", spellcheck: "false", "aria-describedby": "start-workflow-hint start-workflow-error", placeholder: "Leave empty to run a smoke test: open the URL and expect the page to render." });
  const workflowError = h("p", { id: "start-workflow-error", class: "lv-field-error", role: "alert", hidden: true });
  const result = h("div", { id: "start-result", "aria-live": "polite" });
  const submit = h("button", { type: "submit", class: "lv-btn lv-btn-primary", text: "Start cloud run" });
  const cancel = h("button", { type: "button", class: "lv-btn", text: "Close" });
  const example = JSON.stringify(EXAMPLE_WORKFLOW, null, 2);

  const form = h("form", { class: "lv-form", id: "start-run-form", novalidate: true },
    h("div", { class: "lv-form-row" },
      h("div", { class: "lv-field" }, h("label", { for: "start-suite", text: "Suite name" }), suite),
      h("div", { class: "lv-field" }, h("label", { for: "start-target", text: "Target URL" }), target,
        h("p", { id: "start-target-hint", class: "lv-hint", text: "A public http(s) address. Private and loopback addresses are refused." }))),
    h("div", { class: "lv-field" },
      h("label", { for: "start-workflow", text: "Workflow JSON (optional)" }),
      workflow,
      h("p", { id: "start-workflow-hint", class: "lv-hint", text: "Declarative steps only. Do not put real secrets or ${env:NAME} references in it: hosted runs never see your environment." }),
      workflowError,
      h("details", { class: "lv-details" },
        h("summary", { text: "Show an example workflow" }),
        h("pre", { class: "lv-code" }, h("code", { text: example })),
        h("button", { type: "button", class: "lv-btn lv-btn-small", text: "Use this example", on: { click: function () { workflow.value = example; workflowError.hidden = true; workflow.removeAttribute("aria-invalid"); } } }))),
    result,
    h("div", { class: "lv-actions" }, submit, cancel));

  function validateWorkflow() {
    const text = workflow.value.trim();
    workflowError.hidden = true;
    workflow.removeAttribute("aria-invalid");
    if (!text) return { ok: true, value: undefined };
    try {
      const parsed = JSON.parse(text);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("The workflow must be a JSON object with a steps array.");
      return { ok: true, value: parsed };
    } catch (error) {
      workflowError.textContent = "Workflow is not valid JSON: " + error.message;
      workflowError.hidden = false;
      workflow.setAttribute("aria-invalid", "true");
      return { ok: false };
    }
  }
  // Validate on submit only: validating on blur would move the submit button under the pointer.
  workflow.addEventListener("input", function () { workflowError.hidden = true; workflow.removeAttribute("aria-invalid"); });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clear(result);
    const suiteName = suite.value.trim();
    const targetUrl = target.value.trim();
    if (!suiteName) { result.append(errorBox({ message: "Enter a suite name.", issues: [] })); suite.focus(); return; }
    if (!/^https?:\/\//i.test(targetUrl)) { result.append(errorBox({ message: "Enter a target URL that starts with http:// or https://.", issues: [] })); target.focus(); return; }
    const parsed = validateWorkflow();
    if (!parsed.ok) { workflow.focus(); return; }
    const body = { suiteName: suiteName, targetUrl: targetUrl };
    if (parsed.value !== undefined) body.workflow = parsed.value;

    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    try {
      const created = await call(function () { return ctx.api.runs.create(body); });
      const runId = created.runId || created.id;
      const note = h("div", { class: "lv-alert lv-alert-ok", role: "status" },
        h("strong", { text: "Run queued." }),
        " ",
        created.queuePosition ? "Position " + created.queuePosition + " in the queue. " : "",
        link("#run-detail/" + encodeURIComponent(runId), "Open run"));
      result.append(note);
      announce("Run queued");
      state.status = "all";
      const statusSelect = byId("run-status-filter-full");
      if (statusSelect) statusSelect.value = "all";
      await Promise.allSettled([loadRuns({ silent: true }), refreshUsage()]);
      schedulePoll();
      if (onCreated) onCreated(created);
    } catch (error) {
      const info = describeError(error);
      result.append(errorBox(info));
      if (info.code === "DAILY_QUOTA_EXCEEDED") refreshUsage();
    } finally {
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
    }
  });

  return { form: form, suite: suite, cancel: cancel };
}

function buildRuns(main) {
  const results = h("div", { id: "run-results" });
  const count = h("p", { id: "run-result-count", class: "lv-muted lv-small", "aria-live": "polite" });
  const moreWrap = h("div", { class: "lv-actions" });
  const startPanel = h("section", { class: "lv-card", id: "start-run-panel", hidden: true, "aria-labelledby": "start-run-title" });
  const startBody = buildStartForm();
  startPanel.append(h("h2", { id: "start-run-title", class: "lv-card-title", text: "Start cloud run" }), startBody.form);
  const toggle = h("button", { type: "button", class: "lv-btn lv-btn-primary", id: "start-run-toggle", "aria-expanded": "false", "aria-controls": "start-run-panel", text: "Start cloud run" });

  function setForm(open, focus) {
    startPanel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open && focus) startBody.suite.focus();
    if (!open && focus) toggle.focus();
  }
  toggle.addEventListener("click", function () { setForm(startPanel.hidden, true); });
  startBody.cancel.addEventListener("click", function () { setForm(false, true); });

  const search = h("input", { id: "run-search-full", class: "lv-input", type: "search", placeholder: "Search suite, URL or run id", "aria-label": "Search runs", autocomplete: "off" });
  const select = h("select", { id: "run-status-filter-full", class: "lv-input", "aria-label": "Filter by status" },
    h("option", { value: "all", text: "All statuses" }),
    ["QUEUED", "RUNNING", "SUCCESS", "FAILED", "POLICY_VIOLATION", "CANCELLED"].map(function (status) {
      return h("option", { value: status, text: { QUEUED: "Queued", RUNNING: "Running", SUCCESS: "Passed", FAILED: "Failed", POLICY_VIOLATION: "Policy blocked", CANCELLED: "Cancelled" }[status] });
    }));
  search.addEventListener("input", function () { state.search = search.value; views.runs.render(true); });
  select.addEventListener("change", function () { state.status = select.value; loadRuns({}).then(schedulePoll); });

  main.append(
    pageHeader("Test runs", "Hosted browser runs on Airlock Cloud. The list refreshes every 3 seconds while a run is queued or running.", [toggle]),
    startPanel,
    h("div", { class: "lv-toolbar" }, search, select, count),
    results, moreWrap);

  let signature = "";
  function renderRuns(force) {
    const runs = visibleRuns();
    const key = JSON.stringify([state.search, state.status, state.runsError && state.runsError.message, state.runsLoaded, runs.map(function (run) { return [run.id, run.status, run.queuePosition, run.passedSteps, run.failedSteps, run.executionTimeMs, run.requestsAllowed, run.requestsBlocked]; })]);
    if (!force && key === signature) return;
    signature = key;
    clear(results);
    clear(moreWrap);
    if (!state.runsLoaded && !state.runsError) {
      results.append(loadingBlock("Loading runs"));
      count.textContent = "";
      return;
    }
    if (state.runsError && state.runs.length === 0) {
      results.append(retryBlock(state.runsError, function () { loadRuns({}).then(schedulePoll); }));
      count.textContent = "";
      return;
    }
    count.textContent = runs.length + " loaded " + (runs.length === 1 ? "run" : "runs") + (state.nextCursor ? " (more available)" : "");
    if (runs.length === 0) {
      if (state.runs.length === 0 && state.status === "all" && !state.search) {
        results.append(h("div", { class: "lv-empty", id: "run-empty-state" },
          h("h2", { class: "lv-card-title", text: "No runs yet" }),
          h("p", { class: "lv-muted", text: "Start a cloud run with the button above, or from your terminal:" }),
          codeBlock("airlock login", "Copy", ctx.toast),
          codeBlock("airlock test --cloud", "Copy", ctx.toast)));
      } else {
        results.append(h("div", { class: "lv-empty", id: "run-empty-state" }, h("p", { class: "lv-muted", text: state.nextCursor && state.search ? "No loaded runs match. Load more runs to search further." : "No runs match this filter." })));
        if (state.nextCursor) {
          moreWrap.append(h("button", { type: "button", class: "lv-btn", text: "Load more runs", on: { click: function () { loadRuns({ more: true }); } } }));
        }
      }
      return;
    }
    results.append(runsTable(runs));
    if (state.nextCursor) {
      moreWrap.append(h("button", { type: "button", class: "lv-btn", text: "Load more runs", on: { click: function () { loadRuns({ more: true }); } } }));
    }
  }

  views.runs = {
    main: main,
    render: renderRuns,
    async show(param) {
      const wantForm = param === "new";
      if (wantForm) setForm(true, true);
      renderRuns(true);
      await loadRuns({});
      schedulePoll();
    },
  };
}

async function loadRuns(options) {
  const settings = options || {};
  const params = { limit: 50 };
  if (state.status !== "all") params.status = state.status;
  if (settings.more && state.nextCursor) params.cursor = state.nextCursor;
  try {
    const result = await call(function () { return ctx.api.runs.list(params); });
    const previous = state.runs;
    const incoming = result.runs || [];
    if (settings.more) {
      state.runs = previous.concat(incoming);
      state.nextCursor = result.nextCursor || null;
    } else if (settings.silent && previous.length > incoming.length) {
      // A poll only refreshes the first page: keep runs loaded with "Load more" and their cursor.
      const fresh = new Map(incoming.map(function (run) { return [run.id, run]; }));
      const merged = incoming.slice();
      previous.forEach(function (run) { if (!fresh.has(run.id)) merged.push(run); });
      state.runs = merged;
    } else {
      state.runs = incoming;
      state.nextCursor = result.nextCursor || null;
    }
    state.runsError = null;
    state.runsLoaded = true;
    if (!settings.more) {
      const changed = previous.some(function (old) {
        const fresh = incoming.find(function (run) { return run.id === old.id; });
        return fresh && fresh.status !== old.status;
      });
      if (changed) refreshUsage();
    }
  } catch (error) {
    state.runsError = error;
    state.runsLoaded = true;
    if (settings.silent) throw error;
  }
  if (views.runs) views.runs.render(false);
  updateRunsBadge();
}

// ---------------------------------------------------------------------------
// Run detail
// ---------------------------------------------------------------------------

function metaItem(label, value) {
  return h("div", { class: "lv-meta-item" }, h("dt", { text: label }), h("dd", {}, value));
}

function buildRunDetail(main) {
  const body = h("div", { id: "run-detail-body", "aria-live": "off" });
  main.append(link("#runs", "Back to runs", "lv-back"), body);
  views["run-detail"] = {
    main: main,
    show(param) {
      if (!param) {
        window.location.hash = "runs";
        return;
      }
      if (state.detailId !== param) {
        state.detail = null;
        state.detailSignature = "";
        clear(body);
        body.append(loadingBlock("Loading run"));
      }
      state.detailId = param;
      loadDetail(param, {}).then(schedulePoll);
    },
    body: body,
  };
}

function stepList(steps) {
  if (!steps || steps.length === 0) return h("p", { class: "lv-muted", text: "No steps were recorded for this run." });
  return h("ol", { class: "lv-steps" }, steps.map(function (step) {
    return h("li", { class: "lv-step " + (step.ok ? "is-ok" : "is-fail") },
      h("span", { class: "lv-step-mark", "aria-hidden": "true", text: step.ok ? "✓" : "✕" }),
      h("div", { class: "lv-step-body" },
        h("div", { class: "lv-step-line" },
          h("strong", { class: "lv-mono", text: step.action }),
          step.target ? h("span", { class: "lv-wrap lv-muted", text: step.target }) : null,
          h("span", { class: "lv-pill " + (step.ok ? "lv-pill-success" : "lv-pill-failed"), text: step.ok ? "Passed" : "Failed" })),
        step.detail ? h("p", { class: "lv-muted lv-small", text: step.detail }) : null,
        step.error ? h("pre", { class: "lv-step-error", text: step.error }) : null));
  }));
}

function requestTable(requests) {
  if (!requests || requests.length === 0) return h("p", { class: "lv-muted", text: "No requests were logged for this run." });
  const head = ["Time", "Method", "Host", "Path", "Verdict", "Reason"];
  return h("div", { class: "lv-table-wrap" },
    h("table", { class: "lv-table lv-table-compact" },
      h("caption", { class: "sr-only", text: "Request log" }),
      h("thead", {}, h("tr", {}, head.map(function (title) { return h("th", { scope: "col", text: title }); }))),
      h("tbody", {}, requests.map(function (entry) {
        const verdict = String(entry.verdict || "");
        return h("tr", {},
          h("td", { class: "lv-mono", text: formatTime(entry.timestamp) || entry.timestamp }),
          h("td", { class: "lv-mono", text: entry.method }),
          h("td", { class: "lv-wrap", text: entry.host }),
          h("td", { class: "lv-wrap lv-mono", text: entry.path }),
          h("td", {}, h("span", { class: "lv-pill " + (verdict === "BLOCKED" ? "lv-pill-failed" : verdict === "SANITIZED" ? "lv-pill-queued" : "lv-pill-success"), text: verdict })),
          h("td", { class: "lv-wrap", text: entry.reason || "" }));
      }))));
}

async function downloadEvidence(run, button) {
  button.disabled = true;
  try {
    const bundle = await call(function () { return ctx.api.runs.evidence(run.id); });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = h("a", { href: url, download: "airlock-evidence-" + run.id + ".json" });
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    ctx.toast("Evidence downloaded");
  } catch (error) {
    ctx.toast(describeError(error).message);
  } finally {
    button.disabled = false;
  }
}

async function cancelRun(run, button) {
  const confirmed = await confirmDialog({
    title: "Cancel this run?",
    message: run.status === "QUEUED" ? "The run is still queued. A cancelled queued run is usually refunded to your daily quota, but refunds have a daily limit." : "The run is stopped at its next heartbeat. It still counts toward your daily quota.",
    confirmLabel: "Cancel run",
    cancelLabel: "Keep running",
    danger: true,
  });
  if (!confirmed) return;
  button.disabled = true;
  button.textContent = "Cancelling...";
  try {
    const updated = await call(function () { return ctx.api.runs.cancel(run.id); });
    state.cancelRequested = state.cancelRequested || new Set();
    if (updated && updated.status === "CANCELLED") {
      state.cancelRequested.delete(run.id);
      renderDetail(updated, true);
      announce("Run cancelled");
    } else {
      state.cancelRequested.add(run.id);
      renderDetail(updated, true);
      announce("Cancellation requested. The run will stop shortly.");
      ctx.toast("Cancellation requested. The run will stop shortly.");
    }
    refreshUsage();
  } catch (error) {
    ctx.toast(describeError(error).message);
    button.disabled = false;
    button.textContent = "Cancel run";
  }
}

function renderDetail(run, force) {
  const body = views["run-detail"].body;
  const signature = JSON.stringify(run);
  if (!force && signature === state.detailSignature) return;
  const previousStatus = state.detail && state.detail.id === run.id ? state.detail.status : null;
  state.detail = run;
  state.detailSignature = signature;
  const hadFocus = body.contains(document.activeElement) && document.activeElement !== document.body;
  clear(body);

  const downloadButton = h("button", { type: "button", class: "lv-btn", id: "download-evidence", text: "Download evidence" });
  downloadButton.addEventListener("click", function () { downloadEvidence(run, downloadButton); });
  const actions = [];
  if (run.hasEvidence || run.evidence) actions.push(downloadButton);
  if (isActive(run.status)) {
    const cancelButton = h("button", { type: "button", class: "lv-btn lv-btn-danger", id: "cancel-run", text: "Cancel run" });
    if (state.cancelRequested && state.cancelRequested.has(run.id)) {
      cancelButton.disabled = true;
      cancelButton.textContent = "Cancelling...";
    }
    cancelButton.addEventListener("click", function () { cancelRun(run, cancelButton); });
    actions.push(cancelButton);
  }

  body.append(
    h("div", { class: "lv-head" },
      h("div", { class: "lv-head-text" },
        h("h1", { class: "lv-title", id: "run-detail-title", tabindex: "-1", text: run.suiteName }),
        h("p", { class: "lv-sub" },
          h("span", { id: "run-detail-status" }, statusPill(run.status)),
          " ",
          h("span", { class: "lv-mono lv-wrap", id: "run-detail-id", text: run.id }),
          run.status === "QUEUED" && run.queuePosition ? h("span", { class: "lv-muted", text: " · Position " + run.queuePosition + " in the queue" }) : null)),
      actions.length ? h("div", { class: "lv-actions" }, actions) : null));

  if (run.status === "CANCELLED") {
    body.append(h("div", { class: "lv-alert lv-alert-info", id: "run-cancelled" }, h("strong", { text: "This run was cancelled." })));
  } else if (run.failureReason || run.error) {
    body.append(h("div", { class: "lv-alert lv-alert-error", id: "run-failure" },
      h("strong", { text: failureLabel(run.failureReason) || "The run did not complete" }),
      run.error ? h("p", { class: "lv-wrap", text: run.error }) : null));
  }

  body.append(card("Summary", h("dl", { class: "lv-meta" },
    metaItem("Target", run.targetUrl),
    metaItem("Workflow", run.workflowName || "—"),
    metaItem("Queued", formatDateTime(run.createdAt)),
    metaItem("Started", formatDateTime(run.startedAt)),
    metaItem("Finished", formatDateTime(run.finishedAt)),
    metaItem("Duration", formatDuration(run.executionTimeMs)),
    metaItem("Steps", run.totalSteps ? run.passedSteps + " passed, " + run.failedSteps + " failed of " + run.totalSteps : "—"),
    metaItem("Requests", run.requestsAllowed + " allowed, " + run.requestsBlocked + " blocked"),
    metaItem("Started by", run.createdBy ? run.createdBy.label + " (" + (run.createdBy.type === "key" ? "API key" : "console session") + ")" : "—"))));

  body.append(card("Steps", stepList(run.steps)));
  body.append(card("Request log", requestTable(run.requests)));

  const evidence = run.evidence;
  body.append(card("Evidence",
    evidence
      ? h("div", {},
        h("dl", { class: "lv-meta" },
          metaItem("Merkle root", h("span", { class: "lv-mono lv-wrap", text: evidence.merkleRoot })),
          metaItem("Signature", h("span", { class: "lv-mono lv-wrap", text: evidence.signature })),
          metaItem("Algorithm", evidence.signingAlgorithm),
          metaItem("Key id", h("span", { class: "lv-mono lv-wrap", text: evidence.keyId })),
          metaItem("Ledger blocks", String(evidence.blocksCount))),
        h("p", { class: "lv-muted lv-small" }, "Check it on the ", link("#evidence", "Evidence page"), " or with ", h("code", { text: "airlock audit <bundle.json>" }), "."))
      : h("p", { class: "lv-muted", text: isActive(run.status) ? "Evidence is signed when the run finishes." : "This run has no evidence bundle." })));

  if (previousStatus && previousStatus !== run.status) {
    announce("Run " + run.suiteName + " is now " + ({ SUCCESS: "passed", FAILED: "failed", POLICY_VIOLATION: "policy blocked", CANCELLED: "cancelled", RUNNING: "running", QUEUED: "queued" }[run.status] || run.status));
  }
  if (hadFocus) {
    const title = byId("run-detail-title");
    if (title) title.focus({ preventScroll: true });
  }
}

async function loadDetail(id, options) {
  const settings = options || {};
  const body = views["run-detail"].body;
  try {
    const run = await call(function () { return ctx.api.runs.get(id); });
    if (state.detailId !== id) return;
    const wasActive = state.detail && state.detail.id === id && isActive(state.detail.status);
    renderDetail(run, false);
    if (wasActive && !isActive(run.status)) refreshUsage();
  } catch (error) {
    if (settings.silent) throw error;
    if (state.detailId !== id) return;
    clear(body);
    if (error && error.status === 404) {
      body.append(h("div", { class: "lv-empty" }, h("h2", { class: "lv-card-title", text: "Run not found" }), h("p", { class: "lv-muted", text: "It may belong to another workspace or no longer exist." }), link("#runs", "Back to runs", "lv-btn")));
    } else {
      body.append(retryBlock(error, function () { loadDetail(id, {}).then(schedulePoll); }));
    }
  }
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

function buildAnalytics(main) {
  const content = h("div", { id: "analytics-content" });
  const rangeGroup = h("div", { class: "lv-seg", role: "group", "aria-label": "Day range" });
  const ranges = [7, 14, 30];
  const buttons = ranges.map(function (days) {
    const button = h("button", { type: "button", class: "lv-seg-btn", dataset: { days: String(days) }, "aria-pressed": String(days === state.analyticsDays), text: days + " days" });
    button.addEventListener("click", function () {
      state.analyticsDays = days;
      buttons.forEach(function (other) { other.setAttribute("aria-pressed", String(other === button)); });
      views.analytics.show();
    });
    return button;
  });
  rangeGroup.append(...buttons);
  main.append(pageHeader("Analytics", "How your hosted runs are doing. Days are UTC.", [rangeGroup]), content);

  function chart(days) {
    const max = Math.max.apply(null, days.map(function (day) { return Number(day.runs) || 0; }).concat([1]));
    const total = days.reduce(function (sum, day) { return sum + (Number(day.runs) || 0); }, 0);
    const bars = h("div", { class: "lv-bars" }, days.map(function (day) {
      const runs = Number(day.runs) || 0;
      const success = Number(day.success) || 0;
      const failed = Number(day.failed) || 0;
      return h("div", { class: "lv-bar-col", title: day.date + ": " + runs + " runs, " + success + " passed, " + failed + " failed" },
        h("div", { class: "lv-bar", style: "height:" + (runs / max) * 100 + "%" },
          h("span", { class: "lv-bar-fail", style: "height:" + (runs ? (failed / runs) * 100 : 0) + "%" }),
          h("span", { class: "lv-bar-ok", style: "height:" + (runs ? (success / runs) * 100 : 0) + "%" })));
    }));
    const first = days[0] ? days[0].date : "";
    const last = days[days.length - 1] ? days[days.length - 1].date : "";
    const table = h("table", { class: "lv-table lv-table-compact" },
      h("caption", { class: "sr-only", text: "Runs per day" }),
      h("thead", {}, h("tr", {}, ["Day", "Runs", "Passed", "Failed"].map(function (title) { return h("th", { scope: "col", text: title }); }))),
      h("tbody", {}, days.map(function (day) {
        return h("tr", {}, h("td", { text: day.date }), h("td", { class: "lv-mono", text: String(day.runs) }), h("td", { class: "lv-mono", text: String(day.success) }), h("td", { class: "lv-mono", text: String(day.failed) }));
      })));
    return h("div", {},
      h("div", { role: "img", "aria-label": "Runs per day over the last " + days.length + " days, " + total + " runs in total. A data table follows." }, bars),
      h("div", { class: "lv-axis" }, h("span", { text: first }), h("span", { text: last })),
      h("div", { class: "lv-legend" }, h("span", { class: "lv-legend-ok", text: "Passed" }), h("span", { class: "lv-legend-fail", text: "Failed or other" })),
      h("details", { class: "lv-details" }, h("summary", { text: "Show data table" }), h("div", { class: "lv-table-wrap" }, table)));
  }

  views.analytics = {
    main: main,
    async show() {
      clear(content);
      content.append(loadingBlock("Loading analytics"));
      const days = state.analyticsDays;
      try {
        const data = await call(function () { return ctx.api.analytics(days); });
        if (days !== state.analyticsDays) return;
        clear(content);
        const totals = data.totals || {};
        content.append(
          h("section", { class: "lv-grid lv-grid-kpi", "aria-label": "Totals for the last " + days + " days" },
            kpi("Runs", formatNumber(totals.runs), "Last " + days + " days"),
            kpi("Pass rate", totals.runs > 0 ? formatPercent(totals.passRate) : "—", "Finished runs that passed every step"),
            kpi("Median duration", totals.runs > 0 ? formatDuration(totals.medianMs) : "—", "Per run"),
            kpi("Requests allowed", formatNumber(totals.requestsAllowed), "Through the request policy"),
            kpi("Requests blocked", formatNumber(totals.requestsBlocked), "Stopped by the request policy")),
          card("Runs per day", (data.days || []).length ? chart(data.days) : h("p", { class: "lv-muted", text: "No runs in this period." })));
      } catch (error) {
        clear(content);
        content.append(retryBlock(error, function () { views.analytics.show(); }));
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Entry points used by dashboard.js
// ---------------------------------------------------------------------------

export function mount(options) {
  ctx.api = options.api;
  ctx.me = options.me;
  ctx.toast = options.toast || ctx.toast;
  ctx.signOut = options.signOut;

  const panels = Array.from(document.querySelectorAll("[data-view-panel]"));
  const mains = {};
  panels.forEach(function (panel) {
    const main = h("main", { class: "lv-main", id: "live-" + panel.dataset.viewPanel });
    panel.replaceChildren(main);
    mains[panel.dataset.viewPanel] = main;
  });

  const shared = {
    ctx: ctx, state: state, views: views, call: call, pageHeader: pageHeader, card: card, kpi: kpi, link: link,
    loadingBlock: loadingBlock, retryBlock: retryBlock, refreshUsage: refreshUsage, renderUsageCard: renderUsageCard,
    updateShell: updateShell,
  };
  if (mains.dashboard) buildOverview(mains.dashboard);
  if (mains.runs) buildRuns(mains.runs);
  if (mains["run-detail"]) buildRunDetail(mains["run-detail"]);
  if (mains.analytics) buildAnalytics(mains.analytics);
  mountAccountViews(mains, shared);

  updateShell();
  renderUsage();
  updateRunsBadge();
  refreshUsage();

  const cta = byId("side-cta");
  if (cta) {
    cta.setAttribute("href", "#runs/new");
    cta.removeAttribute("data-nav");
    const label = cta.lastChild;
    if (label && label.nodeType === Node.TEXT_NODE) label.textContent = "Start cloud run";
  }

  const globalSearch = byId("global-search");
  if (globalSearch) {
    globalSearch.setAttribute("placeholder", "Search runs…");
    globalSearch.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      event.preventDefault();
      state.search = globalSearch.value;
      const runSearch = byId("run-search-full");
      if (runSearch) runSearch.value = state.search;
      window.location.hash = "runs";
      if (views.runs) views.runs.render(true);
    });
  }
}

export function onShow(view, param) {
  stopPolling();
  state.view = view;
  const target = views[view];
  if (target && target.show) target.show(param);
}

