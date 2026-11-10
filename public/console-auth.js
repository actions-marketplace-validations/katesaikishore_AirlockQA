// Classic script loaded before the console module. It only records whether a sample (demo)
// session exists. The console module (dashboard.js) decides the mode: it asks the API who is
// signed in first, then falls back to the sample session, then redirects to /login.
const DEMO_SESSION_KEY = "qafind-demo-session";

try {
  if (window.sessionStorage.getItem(DEMO_SESSION_KEY) === "preview") {
    document.documentElement.dataset.demoSession = "preview";
  }
} catch {
  // Storage can be blocked; the console treats that as "no sample session".
}
