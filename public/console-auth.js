const DEMO_SESSION_KEY = "airlock-demo-session";

let hasDemoSession = false;
try {
  hasDemoSession = window.sessionStorage.getItem(DEMO_SESSION_KEY) === "preview";
} catch {
  hasDemoSession = false;
}

if (!hasDemoSession) {
  const requestedPath = window.location.pathname + window.location.search + window.location.hash;
  window.location.replace("/login?next=" + encodeURIComponent(requestedPath));
} else {
  document.documentElement.dataset.demoSession = "preview";
  document.addEventListener("click", function (event) {
    const signOutControl = event.target.closest("[data-demo-signout]");
    if (!signOutControl) return;
    event.preventDefault();
    try {
      window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    } finally {
      window.location.assign("/login");
    }
  });
}
