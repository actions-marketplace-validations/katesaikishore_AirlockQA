import { createSampleRun, sampleAnalytics, sampleMetrics, sampleRuns } from "./dashboard-data.js";

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = motionPreference.matches;
const flowCard = document.getElementById("flow-card");
const canvas = document.getElementById("flow-canvas");
const motionStatus = document.getElementById("motion-status");
const recordButton = document.getElementById("record-motion");
const downloadLink = document.getElementById("download-motion");
const replayButton = document.getElementById("replay-flow");
const exportEvidenceButton = document.getElementById("export-sample-evidence");
let networkScene = null;
let downloadObjectUrl = null;
let toastTimer = 0;
let activeRun = sampleRuns[0] || null;

function byId(id) { return document.getElementById(id); }
function setText(id, value) {
  const element = byId(id);
  if (element) element.textContent = value == null ? "" : String(value);
}
function showToast(message) {
  const toast = byId("app-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
}

// The dashboard is a client-side preview. Navigation changes only the visible
// view and hash; no run-history, usage, project, or API-key endpoint is called.
const navItems = Array.from(document.querySelectorAll("[data-nav]"));
const viewPanels = Array.from(document.querySelectorAll("[data-view-panel]"));
const knownViews = new Set(viewPanels.map(function (panel) { return panel.dataset.viewPanel; }));

function viewFromHash() {
  const value = window.location.hash.replace(/^#\/?/, "").replace(/^view-/, "");
  if (knownViews.has(value)) return value;
  return knownViews.has("dashboard") ? "dashboard" : (viewPanels[0] && viewPanels[0].dataset.viewPanel) || "dashboard";
}

function showView(view, options) {
  const settings = options || {};
  const nextView = knownViews.has(view) ? view : (knownViews.has("dashboard") ? "dashboard" : view);
  viewPanels.forEach(function (panel) {
    panel.hidden = panel.dataset.viewPanel !== nextView;
    panel.setAttribute("aria-hidden", String(panel.hidden));
  });
  navItems.forEach(function (item) {
    const selected = item.dataset.nav === nextView;
    item.classList.toggle("is-active", selected);
    if (selected) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
    if (item.hasAttribute("aria-pressed")) item.setAttribute("aria-pressed", String(selected));
  });
  if (nextView === "run-detail" && activeRun) renderRunDetail(activeRun);
  const headingNames = { dashboard: "Overview", runs: "Test runs", "run-detail": "Run detail", explorer: "Test explorer", analytics: "Analytics", audit: "Audit & evidence", integrations: "API & CI/CD" };
  setText("page-heading", headingNames[nextView] || "Overview");
  if (settings.updateHash && window.location.hash !== "#" + nextView) window.location.hash = nextView;
  if (settings.focus) {
    const panel = viewPanels.find(function (candidate) { return candidate.dataset.viewPanel === nextView; });
    const heading = panel && panel.querySelector("h1, h2, [data-view-heading]");
    if (heading) {
      if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
}

navItems.forEach(function (item) {
  item.addEventListener("click", function (event) {
    const view = item.dataset.nav;
    if (!knownViews.has(view)) return;
    if (item instanceof HTMLAnchorElement) event.preventDefault();
    showView(view, { updateHash: true });
  });
});
window.addEventListener("hashchange", function () { showView(viewFromHash()); });
if (viewPanels.length) showView(viewFromHash());

const globalSearchButton = byId("open-run-search");
if (globalSearchButton) globalSearchButton.addEventListener("click", function () {
  showView("runs", { updateHash: true });
  window.requestAnimationFrame(function () {
    const search = byId("run-search-full");
    if (search) search.focus();
  });
});
const openAuditButton = byId("open-audit");
if (openAuditButton) openAuditButton.addEventListener("click", function () {
  showView("audit", { updateHash: true, focus: true });
});

function formatDuration(milliseconds) {
  const seconds = Math.max(1, Math.round(Number(milliseconds) / 1000));
  return seconds < 60 ? seconds + "s" : Math.floor(seconds / 60) + "m " + String(seconds % 60).padStart(2, "0") + "s";
}

function formatDate(timestamp, options) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return String(timestamp || "—");
  return new Intl.DateTimeFormat(undefined, options || { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function statusLabel(status) {
  const labels = { success: "Passed", failed: "Failed", policy_violation: "Policy blocked" };
  return labels[status] || String(status || "Unknown").replaceAll("_", " ");
}

function statusMatches(runStatus, filter) {
  if (!filter || filter === "all") return true;
  const aliases = {
    passed: ["success", "passed"],
    success: ["success", "passed"],
    failed: ["failed", "error"],
    blocked: ["policy_violation", "blocked", "policy-blocked"],
    policy_violation: ["policy_violation", "blocked", "policy-blocked"]
  };
  return (aliases[filter] || [filter]).includes(runStatus);
}

function cellContent(value, className) {
  const cell = document.createElement("td");
  if (className) cell.className = className;
  if (value instanceof Node) cell.append(value);
  else cell.textContent = value == null ? "—" : String(value);
  return cell;
}

function runTitle(run) { return "Run #" + String(run.id).slice(-4); }

function createRunRow(run, headings) {
  const row = document.createElement("tr");
  row.dataset.runRow = "";
  row.dataset.runId = run.id;
  row.dataset.runStatus = run.status;
  const normalized = headings.map(function (heading) { return heading.textContent.trim().toLowerCase(); });

  function valueForHeading(heading) {
    if (/status|result/.test(heading)) {
      const badge = document.createElement("span");
      badge.className = "status-pill status-" + run.status.replace(/[^a-z0-9_-]/gi, "-");
      badge.textContent = statusLabel(run.status);
      return badge;
    }
    if (/branch/.test(heading)) return run.branch;
    if (/commit|revision/.test(heading)) return run.commit;
    if (/duration|time/.test(heading) && !/started|date|last/.test(heading)) return formatDuration(run.durationMs);
    if (/step|passed/.test(heading)) return run.passedSteps + "/" + run.totalSteps;
    if (/trigger|actor|author/.test(heading)) return run.actor;
    if (/environment|target/.test(heading)) return run.environment;
    if (/date|started|last run|created/.test(heading)) return formatDate(run.timestamp);
    if (/suite|scenario|test/.test(heading)) return run.scenarioLabel;
    if (/run|id/.test(heading)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "run-link";
      button.dataset.openRun = run.id;
      button.textContent = runTitle(run);
      button.setAttribute("aria-label", "Open " + runTitle(run) + ", " + run.scenarioLabel);
      return button;
    }
    return run.scenarioLabel;
  }

  const columns = headings.length ? headings : [
    { textContent: "Run" }, { textContent: "Status" }, { textContent: "Branch" },
    { textContent: "Duration" }, { textContent: "Triggered by" }, { textContent: "Started" }
  ];
  columns.forEach(function (heading, index) {
    const key = normalized[index] || String(heading.textContent || "").toLowerCase();
    const value = valueForHeading(key);
    const cell = cellContent(value, key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    if (index === 0 && !/run|id/.test(key)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "run-link";
      button.dataset.openRun = run.id;
      button.textContent = runTitle(run);
      button.setAttribute("aria-label", "Open " + runTitle(run) + ", " + run.scenarioLabel);
      cell.replaceChildren(button);
    }
    row.append(cell);
  });
  return row;
}

function renderRunTable() {
  const tableBody = byId("run-table-body");
  if (!tableBody) return;
  const table = tableBody.closest("table");
  const headings = table ? Array.from(table.querySelectorAll("thead th")) : [];
  tableBody.replaceChildren(...sampleRuns.map(function (run) { return createRunRow(run, headings); }));
  const historyBody = byId("run-history-table-body");
  if (historyBody) {
    const historyTable = historyBody.closest("table");
    const historyHeadings = historyTable ? Array.from(historyTable.querySelectorAll("thead th")) : [];
    historyBody.replaceChildren(...sampleRuns.map(function (run) { return createRunRow(run, historyHeadings); }));
  }
  filterRunTable();
}

function filterRunTable() {
  const fullRunsView = byId("view-runs") && !byId("view-runs").hidden;
  const searchControl = byId(fullRunsView ? "run-search-full" : "run-search");
  const statusControl = byId(fullRunsView ? "run-status-filter-full" : "run-status-filter");
  const query = (searchControl && searchControl.value || "").trim().toLowerCase();
  const filter = statusControl && statusControl.value || "all";
  document.querySelectorAll("[data-run-row]").forEach(function (row) {
    const id = row.dataset.runId || "";
    const run = sampleRuns.find(function (candidate) { return candidate.id === id; });
    const text = (row.textContent + " " + (run ? [run.scenarioLabel, run.branch, run.commit, run.actor, run.environment].join(" ") : "")).toLowerCase();
    row.hidden = !(statusMatches(row.dataset.runStatus, filter) && (!query || text.includes(query)));
  });
  const empty = byId("run-empty-state");
  const visibleRows = Array.from(document.querySelectorAll("[data-run-row]")).filter(function (row) {
    const panel = row.closest("[data-view-panel]");
    return !row.hidden && (!panel || !panel.hidden);
  }).length;
  if (empty) empty.hidden = visibleRows !== 0;
  const count = byId("run-result-count");
  if (count) count.textContent = visibleRows + " sample " + (visibleRows === 1 ? "run" : "runs");
}

const searchInput = byId("run-search");
const statusFilter = byId("run-status-filter");
if (searchInput) searchInput.addEventListener("input", filterRunTable);
if (statusFilter) statusFilter.addEventListener("change", filterRunTable);
const fullSearchInput = byId("run-search-full");
const fullStatusFilter = byId("run-status-filter-full");
if (fullSearchInput) fullSearchInput.addEventListener("input", filterRunTable);
if (fullStatusFilter) fullStatusFilter.addEventListener("change", filterRunTable);
renderRunTable();

function renderList(container, entries, renderItem) {
  if (!container) return;
  container.replaceChildren();
  entries.forEach(function (entry) { container.append(renderItem(entry)); });
}

function renderRunDetail(run) {
  activeRun = run;
  setText("run-detail-title", run.scenarioLabel);
  setText("run-detail-status", statusLabel(run.status));
  setText("run-detail-id", run.id);
  setText("run-detail-date", formatDate(run.timestamp, { dateStyle: "medium", timeStyle: "short" }));
  setText("run-detail-summary", run.passedSteps + " of " + run.totalSteps + " steps passed · " + formatDuration(run.durationMs) + " · " + run.environment);

  const status = byId("run-detail-status");
  if (status) {
    status.dataset.status = run.status;
    status.className = "status-pill status-" + run.status.replace(/[^a-z0-9_-]/gi, "-");
  }

  const events = byId("run-detail-events");
  renderList(events, run.events, function (event) {
    const item = document.createElement("li");
    item.className = "run-event";
    item.dataset.tone = event.tone;
    const time = document.createElement("time");
    time.textContent = "+" + event.offset;
    const mark = document.createElement("span");
    mark.className = "event-mark";
    mark.setAttribute("aria-hidden", "true");
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = event.title;
    const detail = document.createElement("p");
    detail.textContent = event.detail;
    copy.append(title, detail);
    item.append(time, mark, copy);
    return item;
  });

  const requests = byId("run-detail-requests");
  if (requests) {
    const rows = run.packets.map(function (packet) {
      const row = document.createElement("tr");
      row.append(cellContent(packet.method + " " + packet.path), cellContent(packet.host), cellContent(packet.action));
      const verdict = document.createElement("span");
      verdict.className = packet.blocked ? "status-pill status-policy_violation" : "status-pill status-success";
      verdict.textContent = packet.verdict;
      row.append(cellContent(verdict));
      return row;
    });
    requests.replaceChildren(...rows);
  }

  const checkpoints = byId("run-detail-checkpoints");
  renderList(checkpoints, run.checkpoints, function (checkpoint) {
    const item = document.createElement(checkpoints.tagName === "UL" || checkpoints.tagName === "OL" ? "li" : "article");
    item.className = "checkpoint-item";
    const title = document.createElement("strong");
    title.textContent = checkpoint.name;
    const meta = document.createElement("span");
    meta.textContent = checkpoint.memory + " · Step " + checkpoint.step + " · " + checkpoint.id;
    item.append(title, meta);
    return item;
  });

  document.querySelectorAll("[data-run-field]").forEach(function (field) {
    const value = run[field.dataset.runField];
    field.textContent = value == null ? "—" : String(value);
  });
}

function openRun(runId) {
  const run = sampleRuns.find(function (candidate) { return candidate.id === runId; }) || sampleRuns[0];
  if (!run) return;
  renderRunDetail(run);
  if (knownViews.has("run-detail")) showView("run-detail", { updateHash: true });
}

document.addEventListener("click", function (event) {
  const opener = event.target.closest("[data-open-run]");
  if (opener) {
    const row = opener.closest("[data-run-row]");
    openRun(opener.dataset.openRun || (row && row.dataset.runId));
    return;
  }
  if (event.target.closest("[data-back-runs]")) {
    if (knownViews.has("runs")) showView("runs", { updateHash: true });
  }
});

function renderSampleMetrics() {
  const metricMap = {
    "metric-runs": sampleMetrics.totalRuns,
    "metric-pass-rate": sampleMetrics.passRate,
    "metric-reliability": sampleMetrics.reliability,
    "metric-duration": sampleMetrics.medianDuration,
    "metric-runs-today": sampleMetrics.runsToday,
    "metric-policy-blocks": sampleMetrics.policyBlocks
  };
  Object.keys(metricMap).forEach(function (id) { setText(id, metricMap[id]); });
  document.querySelectorAll("[data-preview-metric]").forEach(function (element) {
    const value = sampleMetrics[element.dataset.previewMetric];
    if (value != null) element.textContent = String(value);
  });
  document.querySelectorAll("[data-sample-run-count]").forEach(function (element) { element.textContent = String(sampleRuns.length); });
}
renderSampleMetrics();

// Optional chart hooks let the static markup keep a useful fallback when SVG
// or JavaScript rendering is unavailable.
function renderBars(selector, values) {
  document.querySelectorAll(selector).forEach(function (container) {
    if (container.dataset.rendered === "true") return;
    container.dataset.rendered = "true";
    const max = Math.max.apply(null, values);
    values.forEach(function (value, index) {
      const bar = document.createElement("span");
      bar.className = "preview-bar";
      bar.style.setProperty("--bar-height", Math.max(8, value / max * 100) + "%");
      bar.style.height = "var(--bar-height)";
      bar.setAttribute("aria-label", "Sample day " + (index + 1) + ": " + value);
      container.append(bar);
    });
  });
}
renderBars('[data-preview-chart="runs"]', sampleAnalytics.dailyRuns);
renderBars('[data-preview-chart="pass-rate"]', sampleAnalytics.dailyPassRate);

// Make the status filter useful with common label values in markup.
if (statusFilter) {
  Array.from(statusFilter.options).forEach(function (option) {
    const value = option.value.toLowerCase();
    if (value === "pass") option.value = "passed";
    else if (value === "policy-blocked") option.value = "blocked";
  });
}

// Four-stage CI -> Airlock run API -> browser runner -> run response path.
async function initNetworkIllustration() {
  if (!canvas || !flowCard) return;
  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js");
    if (!window.WebGLRenderingContext && !window.WebGL2RenderingContext) throw new Error("WebGL is unavailable");

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power", preserveDrawingBuffer: true });
    // MediaRecorder/WebM does not preserve canvas transparency, so use the
    // panel's white surface instead of letting recorded clips turn black.
    renderer.setClearColor(0xffffff, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    camera.position.set(0, 0.08, 10.3);
    const world = new THREE.Group();
    scene.add(world);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdbe6f1, 2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(-2, 4, 6);
    scene.add(keyLight);

    const points = [-2.7, -0.9, 0.9, 2.7];
    const colors = [0x3374df, 0x168c78, 0x536c8d, 0x8162d5];
    const baseY = 0.05;
    const materials = [];
    const geometries = [];
    const halos = [];
    const packets = [];
    function material(value) { materials.push(value); return value; }
    function geometry(value) { geometries.push(value); return value; }
    function makeLine(coords, color, opacity, dashed) {
      const path = new THREE.BufferGeometry().setFromPoints(coords.map(function (point) { return new THREE.Vector3(point[0], point[1], point[2] || 0); }));
      geometries.push(path);
      const lineMaterial = dashed
        ? material(new THREE.LineDashedMaterial({ color, dashSize: 0.1, gapSize: 0.085, transparent: true, opacity }))
        : material(new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
      const line = new THREE.Line(path, lineMaterial);
      if (dashed) line.computeLineDistances();
      world.add(line);
    }

    for (let stage = 0; stage < points.length - 1; stage += 1) {
      makeLine([[points[stage] + 0.34, baseY, 0], [points[stage + 1] - 0.34, baseY, 0]], colors[stage], 0.45, false);
      // Tiny arrow chevron at each stage transition.
      const arrowX = points[stage + 1] - 0.42;
      makeLine([[arrowX - 0.11, baseY + 0.09, 0.02], [arrowX, baseY, 0.02], [arrowX - 0.11, baseY - 0.09, 0.02]], colors[stage], 0.62, false);
    }

    // The egress boundary is illustrated at the Cloud API edge.
    const boundary = new THREE.Line(
      geometry(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -0.86, -0.1), new THREE.Vector3(0, 0.94, -0.1)])),
      material(new THREE.LineDashedMaterial({ color: 0x168c78, dashSize: 0.055, gapSize: 0.075, transparent: true, opacity: 0.4 }))
    );
    boundary.computeLineDistances();
    world.add(boundary);

    points.forEach(function (x, index) {
      const node = new THREE.Group();
      node.position.set(x, baseY, 0.12);
      const shell = new THREE.Mesh(geometry(new THREE.SphereGeometry(0.3, 32, 24)), material(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, emissive: colors[index], emissiveIntensity: 0.075 })));
      const core = new THREE.Mesh(geometry(new THREE.SphereGeometry(0.16, 24, 18)), material(new THREE.MeshStandardMaterial({ color: colors[index], roughness: 0.28, emissive: colors[index], emissiveIntensity: 0.1 })));
      const ring = new THREE.Mesh(geometry(new THREE.TorusGeometry(0.4, 0.012, 6, 72)), material(new THREE.MeshBasicMaterial({ color: colors[index], transparent: true, opacity: 0.42 })));
      ring.rotation.x = 0.25;
      const halo = new THREE.Mesh(geometry(new THREE.RingGeometry(0.47, 0.51, 64)), material(new THREE.MeshBasicMaterial({ color: colors[index], transparent: true, opacity: 0.12, side: THREE.DoubleSide })));
      halo.position.z = -0.2;
      node.add(shell, core, ring, halo);
      world.add(node);
      halos.push({ ring, halo });
    });

    for (let index = 0; index < 4; index += 1) {
      const packet = new THREE.Mesh(geometry(new THREE.SphereGeometry(0.055, 16, 12)), material(new THREE.MeshBasicMaterial({ color: colors[index] })));
      world.add(packet);
      packets.push({ mesh: packet, delay: index * 0.22 });
    }

    function resize() {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 440 ? 11.2 : 10.3;
      camera.updateProjectionMatrix();
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement || flowCard);
    resize();
    flowCard.classList.add("has-three");

    let frame = 0;
    let start = performance.now();
    function draw(now) {
      const elapsed = (now - start) / 1000;
      halos.forEach(function (item, index) {
        item.ring.rotation.z = Math.sin(elapsed * 0.34 + index * 0.8) * 0.11;
        item.ring.scale.setScalar(1 + Math.sin(elapsed * 1.15 + index) * 0.014);
        item.halo.material.opacity = 0.1 + Math.max(0, Math.sin(elapsed * 1.1 + index * 0.8)) * 0.08;
      });
      packets.forEach(function (packet) {
        const progress = ((elapsed * 0.31 - packet.delay) % 1 + 1) % 1;
        const pathProgress = progress * (points.length - 1);
        const segment = Math.min(points.length - 2, Math.floor(pathProgress));
        const localProgress = pathProgress - segment;
        const x = points[segment] + (points[segment + 1] - points[segment]) * localProgress;
        packet.mesh.position.set(x, baseY + Math.sin(progress * Math.PI * 2) * 0.025, 0.34);
        packet.mesh.material.opacity = progress > 0.94 ? Math.max(0.18, (1 - progress) * 16) : 0.92;
      });
      renderer.render(scene, camera);
      if (!reducedMotion && document.visibilityState === "visible") frame = requestAnimationFrame(draw);
    }
    draw(start);
    function onVisibilityChange() {
      cancelAnimationFrame(frame);
      if (!reducedMotion && document.visibilityState === "visible") {
        start = performance.now();
        frame = requestAnimationFrame(draw);
      }
    }
    function onMotionPreferenceChange(event) {
      reducedMotion = event.matches;
      cancelAnimationFrame(frame);
      if (reducedMotion) draw(performance.now());
      else if (document.visibilityState === "visible") {
        start = performance.now();
        frame = requestAnimationFrame(draw);
      }
      if (motionStatus) motionStatus.textContent = reducedMotion ? "Three.js flow · reduced motion" : "Three.js CI to attestation flow";
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionPreference.addEventListener("change", onMotionPreferenceChange);
    networkScene = {
      canvas,
      replay: function () {
        start = performance.now();
        cancelAnimationFrame(frame);
        draw(start);
      },
      cleanup: function () {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibilityChange);
        motionPreference.removeEventListener("change", onMotionPreferenceChange);
        geometries.forEach(function (resource) { resource.dispose(); });
        materials.forEach(function (resource) { resource.dispose(); });
        renderer.dispose();
      }
    };
    if (motionStatus) motionStatus.textContent = reducedMotion ? "Three.js flow · reduced motion" : "Three.js CI to attestation flow";
  } catch (error) {
    if (motionStatus) motionStatus.textContent = "Static flow illustration · animation unavailable";
  }
}

function recordMotionClip() {
  if (!networkScene || !networkScene.canvas.captureStream || typeof MediaRecorder === "undefined") {
    if (motionStatus) motionStatus.textContent = "Video capture is unavailable in this browser.";
    return;
  }
  const stream = networkScene.canvas.captureStream(30);
  const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(function (type) { return MediaRecorder.isTypeSupported(type); });
  if (!mimeType) {
    stream.getTracks().forEach(function (track) { track.stop(); });
    if (motionStatus) motionStatus.textContent = "This browser does not support WebM recording.";
    return;
  }
  let recorder;
  const chunks = [];
  try {
    recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1800000 });
  } catch (error) {
    stream.getTracks().forEach(function (track) { track.stop(); });
    if (motionStatus) motionStatus.textContent = "Could not start video capture.";
    return;
  }
  recordButton.disabled = true;
  if (motionStatus) motionStatus.textContent = "Recording the 5 second request path…";
  recorder.addEventListener("dataavailable", function (event) { if (event.data && event.data.size) chunks.push(event.data); });
  recorder.addEventListener("stop", async function () {
    stream.getTracks().forEach(function (track) { track.stop(); });
    const blob = new Blob(chunks, { type: mimeType });
    if (!blob.size) {
      recordButton.disabled = false;
      if (motionStatus) motionStatus.textContent = "The browser produced an empty clip. Please try recording again.";
      return;
    }

    if (motionStatus) motionStatus.textContent = "Saving the recorded clip…";
    try {
      const response = await fetch("/api/preview-recording", {
        method: "POST",
        headers: { "Content-Type": "video/webm" },
        body: blob,
        credentials: "same-origin",
        cache: "no-store"
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const saved = await response.json();
      const artifactPath = saved && typeof saved.path === "string" ? saved.path.trim() : "";
      const pathSegments = artifactPath.replace(/\\/g, "/").split("/");
      if (!saved || !artifactPath || artifactPath.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(artifactPath) || pathSegments.includes("..") || !Number.isSafeInteger(saved.bytes) || saved.bytes !== blob.size) {
        throw new Error("The recording response did not match the uploaded clip.");
      }
      recordButton.disabled = false;
      if (motionStatus) motionStatus.textContent = "Video saved: " + artifactPath + " · " + saved.bytes + " bytes";
    } catch (error) {
      if (!downloadLink) {
        recordButton.disabled = false;
        if (motionStatus) motionStatus.textContent = "The server could not save the clip. No download link is available.";
        return;
      }
      if (downloadObjectUrl) URL.revokeObjectURL(downloadObjectUrl);
      downloadObjectUrl = URL.createObjectURL(blob);
      downloadLink.href = downloadObjectUrl;
      downloadLink.hidden = false;
      downloadLink.style.display = "inline-flex";
      recordButton.hidden = true;
      if (motionStatus) motionStatus.textContent = "Server save unavailable (" + error.message + "). Select Download recorded clip to save the video.";
    }
  });
  recorder.start(250);
  window.setTimeout(function () { if (recorder.state !== "inactive") recorder.stop(); }, 5000);
}

// The walkthrough remains local and uses fixtures only. It never submits a
// cloud run or creates a genuine attestation.
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
function selectTab(name, moveFocus) {
  tabButtons.forEach(function (button) {
    const selected = button.dataset.tab === name;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
    const panel = byId("panel-" + button.dataset.tab);
    if (panel) panel.hidden = !selected;
    if (selected && moveFocus) button.focus();
  });
}
tabButtons.forEach(function (button, index) {
  button.addEventListener("click", function () { selectTab(button.dataset.tab, false); });
  button.addEventListener("keydown", function (event) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabButtons.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabButtons.length) % tabButtons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabButtons.length - 1;
    else return;
    event.preventDefault();
    selectTab(tabButtons[next].dataset.tab, true);
  });
});
if (tabButtons.length) selectTab("events", false);

const scenarioSelect = byId("scenario-select");
const runButton = byId("run-sample");
const runStatus = byId("run-status");
const eventList = byId("event-list");
const eventsEmpty = byId("events-empty");
let runSequence = 0;
function delay(ms) { return new Promise(function (resolve) { window.setTimeout(resolve, reducedMotion ? 40 : ms); }); }
function appendWalkthroughEvent(event) {
  if (!eventList) return;
  const item = document.createElement("li");
  item.className = "event-item";
  item.dataset.tone = event.tone;
  const time = document.createElement("span");
  time.className = "event-time";
  time.textContent = "+" + event.offset;
  const mark = document.createElement("span");
  mark.className = "event-mark";
  mark.setAttribute("aria-hidden", "true");
  const copy = document.createElement("span");
  const title = document.createElement("strong");
  title.className = "event-title";
  title.textContent = event.title;
  const detail = document.createElement("span");
  detail.className = "event-detail";
  detail.textContent = event.detail;
  copy.append(title, detail);
  item.append(time, mark, copy);
  eventList.append(item);
}
function addCell(row, value) { row.append(cellContent(value)); }
function renderPackets(run) {
  const body = byId("wire-table-body");
  if (!body) return;
  body.replaceChildren();
  run.packets.forEach(function (packet) {
    const row = document.createElement("tr");
    addCell(row, packet.method + " " + packet.path);
    addCell(row, packet.host);
    addCell(row, packet.action);
    const verdict = document.createElement("span");
    verdict.className = packet.blocked ? "verdict verdict-blocked" : "verdict";
    verdict.textContent = packet.verdict;
    addCell(row, verdict);
    body.append(row);
  });
  const empty = byId("wire-empty");
  const wrap = byId("wire-table-wrap");
  if (empty) empty.hidden = true;
  if (wrap) wrap.hidden = false;
}
function renderCheckpoints(run) {
  const list = byId("checkpoint-list");
  if (!list) return;
  list.replaceChildren();
  run.checkpoints.forEach(function (checkpoint) {
    const card = document.createElement("article");
    card.className = "snapshot";
    const top = document.createElement("div");
    top.className = "snapshot-top";
    const group = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = checkpoint.name;
    const id = document.createElement("small");
    id.textContent = checkpoint.id;
    group.append(title, id);
    const tag = document.createElement("span");
    tag.className = "snapshot-tag";
    tag.textContent = "Sample";
    top.append(group, tag);
    const meta = document.createElement("div");
    meta.className = "snapshot-meta";
    meta.textContent = checkpoint.memory + " · Step " + checkpoint.step;
    card.append(top, meta);
    list.append(card);
  });
  const empty = byId("checkpoints-empty");
  if (empty) empty.hidden = true;
  list.hidden = false;
}
function renderProof(run) {
  setText("proof-run-id", run.id);
  setText("proof-time", run.timestamp);
  setText("proof-root", run.proof.root);
  setText("proof-signature", run.proof.signature);
  const empty = byId("proof-empty");
  const card = byId("proof-card");
  if (empty) empty.hidden = true;
  if (card) card.hidden = false;
}

function exportSampleEvidence() {
  const evidence = {
    type: "airlockqa-sample-evidence",
    generatedAt: new Date().toISOString(),
    previewData: true,
    note: "Illustrative sample records only. This file is not a signed attestation.",
    runs: sampleRuns.map(function (run) {
      return {
        id: run.id,
        scenario: run.scenarioLabel,
        status: statusLabel(run.status),
        branch: run.branch,
        commit: run.commit,
        stepsPassed: run.passedSteps,
        totalSteps: run.totalSteps,
        durationMs: run.durationMs,
        timestamp: run.timestamp
      };
    })
  };
  const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "airlockqa-sample-evidence.json";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  showToast("Sample evidence downloaded");
}
if (exportEvidenceButton) exportEvidenceButton.addEventListener("click", exportSampleEvidence);

async function playSampleRun() {
  if (!scenarioSelect || !runButton || runButton.disabled) return;
  runSequence += 1;
  const run = createSampleRun(scenarioSelect.value, runSequence, Date.now());
  runButton.disabled = true;
  runButton.setAttribute("aria-busy", "true");
  if (runStatus) runStatus.textContent = "Walking through " + run.scenarioLabel.toLowerCase() + "…";
  if (flowCard) flowCard.classList.add("is-running");
  if (eventList) {
    eventList.replaceChildren();
    eventList.hidden = false;
  }
  if (eventsEmpty) eventsEmpty.hidden = true;
  setText("event-count", "0");
  if (tabButtons.length) selectTab("events", false);
  try {
    for (const event of run.events) {
      await delay(380);
      appendWalkthroughEvent(event);
      setText("event-count", eventList ? eventList.children.length : 0);
    }
    renderPackets(run);
    renderCheckpoints(run);
    renderProof(run);
    if (runStatus) runStatus.textContent = "Sample complete · " + run.id;
  } catch (error) {
    if (runStatus) runStatus.textContent = "Sample preview could not complete.";
  } finally {
    if (flowCard) flowCard.classList.remove("is-running");
    runButton.removeAttribute("aria-busy");
    runButton.disabled = false;
  }
}
if (runButton) runButton.addEventListener("click", playSampleRun);

// CLI mode tabs and copy controls use element IDs from data-copy-target. No
// secret value is requested, generated, or copied by this UI.
const modeButtons = Array.from(document.querySelectorAll("[data-cli-mode]"));
function setCliMode(mode) {
  const selectedMode = mode === "bun" ? "bun" : "npm";
  modeButtons.forEach(function (button) {
    const selected = button.dataset.cliMode === selectedMode;
    button.setAttribute("aria-pressed", String(selected));
    button.classList.toggle("is-active", selected);
  });
  ["npm", "bun"].forEach(function (name) {
    const panel = byId("cli-" + name);
    if (panel) panel.hidden = name !== selectedMode;
    const cloudPanel = byId("ci-setup-" + name);
    if (cloudPanel) cloudPanel.hidden = name !== selectedMode;
  });
  document.querySelectorAll("[data-cli-panel]").forEach(function (panel) {
    panel.hidden = panel.dataset.cliPanel !== selectedMode;
  });
  const label = byId("cli-label");
  if (label && !label.dataset.preserveLabel) {
    label.textContent = selectedMode.toUpperCase() + (byId("view-integrations") ? " · AIRLOCK CLOUD" : " · LOCAL RUNNER");
  }
  const cloudLabel = byId("cloud-cli-label");
  if (cloudLabel) cloudLabel.textContent = selectedMode.toUpperCase() + " · AIRLOCK CLOUD";
}
modeButtons.forEach(function (button) { button.addEventListener("click", function () { setCliMode(button.dataset.cliMode); }); });
if (modeButtons.length) {
  const active = modeButtons.find(function (button) { return button.getAttribute("aria-pressed") === "true"; });
  setCliMode(active ? active.dataset.cliMode : "npm");
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  return new Promise(function (resolve, reject) {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    if (copied) resolve();
    else reject(new Error("Clipboard permission is unavailable"));
  });
}

async function copyTarget(button) {
  const targetId = button.dataset.copyTarget && button.dataset.copyTarget.replace(/^#/, "");
  const target = targetId ? byId(targetId) : null;
  const content = target ? target.innerText || target.textContent : button.dataset.copyText;
  if (!content) return;
  const original = button.dataset.copyLabel || button.textContent.trim() || "Copy";
  try {
    await copyText(content.trim());
    button.textContent = "Copied";
    button.dataset.copyState = "success";
  } catch (error) {
    button.textContent = "Copy unavailable";
    button.dataset.copyState = "error";
  }
  window.setTimeout(function () {
    button.textContent = original;
    delete button.dataset.copyState;
  }, 1600);
}
document.querySelectorAll("[data-copy-target]").forEach(function (button) {
  button.addEventListener("click", function () { copyTarget(button); });
});
const oldCopyButton = byId("copy-cli");
if (oldCopyButton && !oldCopyButton.hasAttribute("data-copy-target")) {
  oldCopyButton.addEventListener("click", function () {
    const code = byId(byId("cli-npm") && byId("cli-npm").hidden ? "cli-bun" : "cli-npm");
    if (code) copyTarget({ dataset: { copyText: code.innerText || code.textContent }, textContent: oldCopyButton.textContent, setAttribute: oldCopyButton.setAttribute.bind(oldCopyButton) });
  });
}

initNetworkIllustration();
if (replayButton) replayButton.addEventListener("click", function () {
  if (networkScene && networkScene.replay) {
    networkScene.replay();
    if (motionStatus) motionStatus.textContent = reducedMotion ? "Three.js flow · reduced motion" : "Three.js flow replayed";
  } else if (motionStatus) {
    motionStatus.textContent = "Static flow shown · animation unavailable in this browser.";
  }
});
if (recordButton) recordButton.addEventListener("click", recordMotionClip);
window.addEventListener("beforeunload", function () {
  if (networkScene) networkScene.cleanup();
  if (downloadObjectUrl) URL.revokeObjectURL(downloadObjectUrl);
});
