/**
 * DOM and formatting helpers for the live console.
 * Every value that comes from the API is put into the page with textContent or DOM
 * construction. Nothing here builds markup from strings.
 */

/** Create an element. attrs: class, text, dataset, on (event map), aria/other attributes. */
export function h(tag, attrs, ...children) {
  const element = document.createElement(tag);
  const options = attrs || {};
  Object.keys(options).forEach(function (key) {
    const value = options[key];
    if (value === undefined || value === null || value === false) return;
    if (key === "class") element.className = value;
    else if (key === "text") element.textContent = String(value);
    else if (key === "dataset") Object.keys(value).forEach(function (name) { element.dataset[name] = value[name]; });
    else if (key === "on") Object.keys(value).forEach(function (name) { element.addEventListener(name, value[name]); });
    else if (key === "value") element.value = value;
    else if (key === "checked" || key === "disabled" || key === "hidden" || key === "required" || key === "readOnly") element[key] = Boolean(value);
    else if (value === true) element.setAttribute(key, "");
    else element.setAttribute(key, String(value));
  });
  append(element, children);
  return element;
}

export function append(parent, children) {
  children.forEach(function (child) {
    if (child === undefined || child === null || child === false) return;
    if (Array.isArray(child)) append(parent, child);
    else if (child instanceof Node) parent.append(child);
    else parent.append(document.createTextNode(String(child)));
  });
  return parent;
}

export function clear(element) {
  element.replaceChildren();
  return element;
}

export function byId(id) { return document.getElementById(id); }

let uid = 0;
export function nextId(prefix) {
  uid += 1;
  return (prefix || "lv") + "-" + uid;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatDuration(milliseconds) {
  if (milliseconds === null || milliseconds === undefined || Number.isNaN(Number(milliseconds))) return "—";
  const ms = Number(milliseconds);
  if (ms < 1000) return Math.round(ms) + " ms";
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? seconds + " s" : Math.floor(seconds / 60) + "m " + String(seconds % 60).padStart(2, "0") + "s";
}

export function formatDateTime(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" }).format(date);
}

export function formatTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

export function formatRelative(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return "just now";
  if (seconds < 3600) return Math.round(seconds / 60) + " min ago";
  if (seconds < 86400) return Math.round(seconds / 3600) + " h ago";
  if (seconds < 86400 * 7) return Math.round(seconds / 86400) + " d ago";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const number = Number(value);
  // The API reports a fraction (0..1). Accept a 0..100 percentage as well.
  const percent = number <= 1 ? number * 100 : number;
  return (Math.round(percent * 10) / 10) + "%";
}

export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat().format(Number(value));
}

export const STATUS_LABELS = {
  QUEUED: "Queued",
  RUNNING: "Running",
  SUCCESS: "Passed",
  FAILED: "Failed",
  POLICY_VIOLATION: "Policy blocked",
  CANCELLED: "Cancelled",
};

export const ACTIVE_STATUSES = ["QUEUED", "RUNNING"];
export function isActive(status) { return ACTIVE_STATUSES.indexOf(status) !== -1; }

export function statusPill(status) {
  const known = Object.prototype.hasOwnProperty.call(STATUS_LABELS, status) ? status : "UNKNOWN";
  return h("span", { class: "lv-pill lv-pill-" + known.toLowerCase(), text: STATUS_LABELS[known] || "Unknown" });
}

export function failureLabel(reason) {
  const labels = {
    STEP_FAILED: "A step failed",
    TIMEOUT: "The run timed out",
    TARGET_BLOCKED: "The target address was blocked by the service guard",
    BROWSER_ERROR: "The browser failed",
    INTERNAL: "Internal error",
    CANCELLED: "Cancelled",
  };
  return labels[reason] || reason || "";
}

export function initials(text) {
  const source = String(text || "?");
  const parts = (source.indexOf("@") > 0 ? source.slice(0, source.indexOf("@")) : source).split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0] ? parts[0][0] : "?") + (parts[1] ? parts[1][0] : "");
  return letters.toUpperCase();
}

// ---------------------------------------------------------------------------
// Announcements, toasts, clipboard
// ---------------------------------------------------------------------------

export function announce(message) {
  const region = byId("live-announcer");
  if (!region) return;
  region.textContent = "";
  window.setTimeout(function () { region.textContent = message; }, 30);
}

export function copyText(text) {
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

/** A button that copies `getText()` and briefly says so. */
export function copyButton(label, getText, toast) {
  const button = h("button", { type: "button", class: "lv-btn lv-btn-quiet lv-btn-small", text: label });
  button.addEventListener("click", async function () {
    try {
      await copyText(getText());
      button.textContent = "Copied";
      announce("Copied to clipboard");
      if (toast) toast("Copied to clipboard");
    } catch (error) {
      button.textContent = "Copy unavailable";
    }
    window.setTimeout(function () { button.textContent = label; }, 1600);
  });
  return button;
}

/** A code block with a copy button. */
export function codeBlock(text, label, toast) {
  const pre = h("pre", { class: "lv-code", tabindex: "0" }, h("code", { text: text }));
  return h("div", { class: "lv-code-wrap" }, pre, copyButton(label || "Copy", function () { return text; }, toast));
}

// ---------------------------------------------------------------------------
// Confirmation dialog (native <dialog>: focus trap, Escape, inert background)
// ---------------------------------------------------------------------------

export function confirmDialog(options) {
  return new Promise(function (resolve) {
    const opener = document.activeElement;
    const titleId = nextId("dlg-title");
    const bodyId = nextId("dlg-body");
    const dialog = h("dialog", { class: "lv-dialog", "aria-labelledby": titleId, "aria-describedby": bodyId });
    let settled = false;
    function finish(result) {
      if (settled) return;
      settled = true;
      if (dialog.open) dialog.close();
      dialog.remove();
      if (opener && typeof opener.focus === "function" && document.contains(opener)) opener.focus();
      resolve(result);
    }
    const cancel = h("button", { type: "button", class: "lv-btn", text: options.cancelLabel || "Cancel", on: { click: function () { finish(false); } } });
    const confirm = h("button", { type: "button", class: "lv-btn " + (options.danger ? "lv-btn-danger" : "lv-btn-primary"), text: options.confirmLabel || "Confirm", on: { click: function () { finish(true); } } });
    dialog.append(
      h("h2", { id: titleId, text: options.title }),
      h("p", { id: bodyId, text: options.message }),
      h("div", { class: "lv-dialog-actions" }, cancel, confirm)
    );
    dialog.addEventListener("cancel", function (event) { event.preventDefault(); finish(false); });
    document.body.append(dialog);
    dialog.showModal();
    cancel.focus();
  });
}

// ---------------------------------------------------------------------------
// API errors -> user-facing messages
// ---------------------------------------------------------------------------

/**
 * Returns { message, issues } for any error thrown by the API client.
 * issues is a list of "path: message" strings for INVALID_REQUEST.
 */
export function describeError(error) {
  const code = error && error.code;
  const result = { message: (error && error.message) || "Something went wrong. Try again.", issues: [], code: code || "INTERNAL" };
  if (code === "DAILY_QUOTA_EXCEEDED") {
    const quota = error.quota;
    if (quota) {
      result.message = quota.used + " of " + quota.limit + " runs used today. Resets at " + formatTime(quota.resetAt) + ".";
    }
  } else if (code === "INVALID_REQUEST" || code === "UNSUPPORTED_FIELD") {
    result.message = error.message || "The request was not accepted.";
    if (Array.isArray(error.issues)) {
      result.issues = error.issues.map(function (issue) { return (issue.path ? issue.path + ": " : "") + issue.message; });
    }
  } else if (code === "RATE_LIMITED") {
    result.message = error.message || "Too many requests. Wait a moment and try again.";
  }
  return result;
}

/** Build an alert box for a described error. */
export function errorBox(info) {
  const box = h("div", { class: "lv-alert lv-alert-error", role: "alert" });
  box.append(h("strong", { text: info.message }));
  if (info.issues && info.issues.length) {
    box.append(h("ul", {}, info.issues.map(function (line) { return h("li", { text: line }); })));
  }
  return box;
}
