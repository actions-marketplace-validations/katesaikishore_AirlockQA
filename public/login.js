import { api, ApiError } from "/api.js";

const DEMO_SESSION_KEY = "airlock-demo-session";
const MIN_PASSWORD_LENGTH = 10;

/** Only same-origin /console paths are accepted as a post-login destination. */
function getConsoleDestination() {
  const requested = new URLSearchParams(window.location.search).get("next");
  if (!requested) return "/console";

  try {
    const destination = new URL(requested, window.location.origin);
    if (destination.origin === window.location.origin && destination.pathname === "/console") {
      return destination.pathname + destination.search + destination.hash;
    }
  } catch {
    // Invalid redirect targets fall back to the console entry.
  }
  return "/console";
}

const form = document.getElementById("auth-form");
const nameRow = document.getElementById("name-row");
const nameInput = document.getElementById("auth-name");
const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");
const passwordRule = document.getElementById("password-rule");
const submitButton = document.getElementById("auth-submit");
const errorBox = document.getElementById("auth-error");
const signupNote = document.getElementById("signup-note");
const title = document.getElementById("si-title");
const subtitle = document.getElementById("si-sub");
const switchText = document.getElementById("switch-text");
const switchButton = document.getElementById("switch-mode");
const modeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-mode]"));
const demoLink = document.getElementById("demo-login");

let mode = "signin";
let pending = false;

const COPY = {
  signin: {
    title: "Sign in to Airlock Cloud",
    subtitle: "Use your email and password. The free plan includes 100 hosted runs a day.",
    submit: "Sign in",
    busy: "Signing in…",
    switchText: "New to Airlock Cloud?",
    switchLabel: "Create a free account",
    autocomplete: "current-password",
    pageTitle: "Sign in · Airlock Cloud"
  },
  signup: {
    title: "Create your free account",
    subtitle: "Free plan: 100 hosted runs a day, API keys for the CLI, and signed run evidence.",
    submit: "Create account",
    busy: "Creating account…",
    switchText: "Already have an account?",
    switchLabel: "Sign in",
    autocomplete: "new-password",
    pageTitle: "Create account · Airlock Cloud"
  }
};

function clearError() {
  errorBox.textContent = "";
  errorBox.hidden = true;
  [emailInput, passwordInput].forEach(function (input) {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  });
  if (mode === "signup") passwordInput.setAttribute("aria-describedby", "password-rule");
}

function showError(message, field) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  if (field) {
    field.setAttribute("aria-invalid", "true");
    const ids = ["auth-error"];
    if (field === passwordInput && mode === "signup") ids.push("password-rule");
    field.setAttribute("aria-describedby", ids.join(" "));
    field.focus();
  }
}

function setMode(next, options) {
  mode = next === "signup" ? "signup" : "signin";
  const copy = COPY[mode];
  title.textContent = copy.title;
  subtitle.textContent = copy.subtitle;
  submitButton.textContent = copy.submit;
  switchText.textContent = copy.switchText;
  switchButton.textContent = copy.switchLabel;
  passwordInput.setAttribute("autocomplete", copy.autocomplete);
  nameRow.hidden = mode !== "signup";
  passwordRule.hidden = mode !== "signup";
  signupNote.hidden = mode !== "signup";
  modeButtons.forEach(function (button) {
    button.setAttribute("aria-pressed", button.getAttribute("data-mode") === mode ? "true" : "false");
  });
  document.title = copy.pageTitle;
  clearError();
  if (options && options.updateUrl) {
    const url = new URL(window.location.href);
    if (mode === "signup") url.searchParams.set("mode", "signup");
    else url.searchParams.delete("mode");
    try {
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch {
      // History updates are cosmetic.
    }
  }
  if (options && options.focus) emailInput.focus();
}

function setPending(value) {
  pending = value;
  submitButton.disabled = value;
  submitButton.setAttribute("aria-busy", value ? "true" : "false");
  submitButton.textContent = value ? COPY[mode].busy : COPY[mode].submit;
  modeButtons.forEach(function (button) { button.disabled = value; });
  switchButton.disabled = value;
}

function retryHint(error) {
  const seconds = Number(error && error.retryAfter);
  if (Number.isFinite(seconds) && seconds > 0) {
    const minutes = Math.ceil(seconds / 60);
    return minutes <= 1 ? "Try again in about a minute." : "Try again in about " + minutes + " minutes.";
  }
  return "Wait a minute, then try again.";
}

function describeError(error) {
  if (!(error instanceof ApiError)) {
    return { message: "Something went wrong. Please try again.", field: null };
  }
  switch (error.code) {
    case "INVALID_CREDENTIALS":
      return { message: "That email and password do not match. Check them and try again.", field: passwordInput };
    case "EMAIL_TAKEN":
      return { message: "An account with this email already exists. Sign in instead, or use a different email.", field: emailInput };
    case "WEAK_PASSWORD":
      // The server explains exactly what is wrong (too short, too common, matches the email).
      return { message: error.message || "Choose a password with at least " + MIN_PASSWORD_LENGTH + " characters.", field: passwordInput };
    case "RATE_LIMITED":
      return { message: "Too many attempts. " + retryHint(error), field: null };
    case "SIGNUPS_PAUSED":
      return { message: "New sign-ups are paused right now. Please try again later.", field: null };
    case "INVALID_REQUEST":
      return { message: "Check the email address and password, then try again.", field: emailInput };
    default:
      // nginx answers with HTTP 429 and an HTML page when its own rate limit trips before the API sees the request.
      if (error.status === 429) {
        return { message: "Too many attempts. " + retryHint(error), field: null };
      }
      if (error.status === 0) {
        return { message: "Cannot reach Airlock Cloud. Check your connection and try again.", field: null };
      }
      return { message: "Something went wrong on our side. Please try again in a moment.", field: null };
  }
}

function validate() {
  const email = emailInput.value.trim();
  if (!email) {
    showError("Enter your email address.", emailInput);
    return false;
  }
  if (!emailInput.checkValidity()) {
    showError("Enter a valid email address.", emailInput);
    return false;
  }
  if (!passwordInput.value) {
    showError(mode === "signup" ? "Choose a password with at least " + MIN_PASSWORD_LENGTH + " characters." : "Enter your password.", passwordInput);
    return false;
  }
  if (mode === "signup" && passwordInput.value.length < MIN_PASSWORD_LENGTH) {
    showError("Your password needs at least " + MIN_PASSWORD_LENGTH + " characters.", passwordInput);
    return false;
  }
  return true;
}

async function onSubmit(event) {
  event.preventDefault();
  if (pending) return;
  clearError();
  if (!validate()) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const name = nameInput.value.trim();
  setPending(true);
  try {
    if (mode === "signup") await api.signup(email, password, name || undefined);
    else await api.login(email, password);
  } catch (error) {
    setPending(false);
    const described = describeError(error);
    showError(described.message, described.field);
    if (described.field === passwordInput && error.code === "INVALID_CREDENTIALS") passwordInput.select();
    return;
  }
  try {
    // A session now exists, so a leftover sample-workspace flag must not hide real data.
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // Session storage is optional.
  }
  window.location.assign(getConsoleDestination());
}

// The browser may restore this page from its back/forward cache with the form still marked busy.
window.addEventListener("pageshow", function (event) {
  if (event.persisted && pending) setPending(false);
});

form.addEventListener("submit", onSubmit);
modeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    if (pending) return;
    const next = button.getAttribute("data-mode");
    if (next !== mode) setMode(next, { updateUrl: true, focus: true });
  });
});
switchButton.addEventListener("click", function () {
  if (pending) return;
  setMode(mode === "signup" ? "signin" : "signup", { updateUrl: true, focus: true });
});

if (demoLink) {
  demoLink.addEventListener("click", function (event) {
    event.preventDefault();
    try {
      window.sessionStorage.setItem(DEMO_SESSION_KEY, "preview");
    } catch {
      showError("This browser blocked the sample workspace. Allow site storage and try again.", null);
      return;
    }
    window.location.assign(getConsoleDestination());
  });
}

setMode(new URLSearchParams(window.location.search).get("mode") === "signup" ? "signup" : "signin", {});

// Already signed in: skip the form.
api.me().then(function (session) {
  if (session && session.user) window.location.replace(getConsoleDestination());
}).catch(function () {
  // Offline or the service is unavailable: stay on the form.
});
