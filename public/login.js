const DEMO_SESSION_KEY = "airlock-demo-session";

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

const demoLoginButton = document.getElementById("demo-login");
const authError = document.getElementById("auth-error");

if (demoLoginButton) {
  demoLoginButton.addEventListener("click", function () {
    try {
      window.sessionStorage.setItem(DEMO_SESSION_KEY, "preview");
      window.location.assign(getConsoleDestination());
    } catch {
      if (authError) authError.hidden = false;
    }
  });
}
