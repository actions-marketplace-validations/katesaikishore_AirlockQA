#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BASE_URL="${BASE_URL:-https://staging.qbrin.cloud}"
BASE_URL="${BASE_URL%/}"
OUT_DIR="${OUT_DIR:-artifacts/gui-qa/pr}"
DEMO_PORT="${DEMO_PORT:-3999}"
SESSION_SUFFIX="$$"
STAGE_SESSION="airlockqa-stage-${SESSION_SUFFIX}"
DEMO_SESSION="airlockqa-demo-${SESSION_SUFFIX}"
CAPTURE_SESSION="airlockqa-capture-${SESSION_SUFFIX}"
DEMO_PID=""
CAPTURE_PID=""
PASS_COUNT=0
SUMMARY_FILE="$OUT_DIR/gui-smoke-summary.md"
CAPTURE_PORT="${CAPTURE_PORT:-4101}"
BROWSER_ARGS=()
if [[ -n "${AGENT_BROWSER_LAUNCH_ARGS:-}" ]]; then
  BROWSER_ARGS=(--args "$AGENT_BROWSER_LAUNCH_ARGS")
fi

mkdir -p "$OUT_DIR"
printf '# GUI smoke results\n\n- Staging: %s\n- Captured: %s\n\n' \
  "$BASE_URL" "$(date -u '+%Y-%m-%d %H:%M UTC')" > "$SUMMARY_FILE"

if ! command -v agent-browser >/dev/null 2>&1; then
  printf 'Install agent-browser before running the GUI suite.\n' >&2
  exit 2
fi

ab() { agent-browser --session "$STAGE_SESSION" "${BROWSER_ARGS[@]}" "$@"; }
ab_demo() { agent-browser --session "$DEMO_SESSION" "${BROWSER_ARGS[@]}" "$@"; }
ab_capture() { agent-browser --session "$CAPTURE_SESSION" "${BROWSER_ARGS[@]}" "$@"; }

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf 'PASS %s\n' "$1"
  printf -- '- PASS: %s\n' "$1" >> "$SUMMARY_FILE"
}

fail() {
  printf 'FAIL %s\n' "$1" >&2
  printf -- '- FAIL: %s\n' "$1" >> "$SUMMARY_FILE"
  exit 1
}

expect_text() {
  local selector="$1" expected="$2" actual
  actual="$(ab get text "$selector")" || fail "could not read $selector"
  [[ "$actual" == *"$expected"* ]] || fail "$selector did not contain: $expected"
}

expect_demo_text() {
  local selector="$1" expected="$2" actual
  actual="$(ab_demo get text "$selector")" || fail "could not read demo $selector"
  [[ "$actual" == *"$expected"* ]] || fail "demo $selector did not contain: $expected"
}

expect_url_path() {
  local path="$1" actual
  actual="$(ab get url)" || fail 'could not read current URL'
  [[ "$actual" == "$BASE_URL$path"* ]] || fail "expected $BASE_URL$path, got $actual"
}

expect_visible() {
  ab is visible "$1" >/dev/null || fail "expected $1 to be visible"
}

audit_page() {
  local label="$1" browser_kind="${2:-stage}" report="$OUT_DIR/.axe-${1}.json"
  if [[ "$browser_kind" == "demo" ]]; then
    ab_demo a11y --json > "$report" || fail "axe audit could not run for $label"
  else
    ab a11y --json > "$report" || fail "axe audit could not run for $label"
  fi
  python3 - "$report" "$label" "$SUMMARY_FILE" <<'PY'
import json
import sys

report_path, label, summary_path = sys.argv[1:]
with open(report_path, encoding='utf-8') as source:
    result = json.load(source)
violations = result.get('violations', [])
incomplete = len(result.get('data', {}).get('incomplete', []))
if violations:
    for violation in violations:
        print(f"{label}: {violation.get('id')} ({violation.get('impact')}): {violation.get('help')}", file=sys.stderr)
    raise SystemExit(1)
with open(summary_path, 'a', encoding='utf-8') as summary:
    summary.write(f"- AXE: {label}: 0 violations ({incomplete} rule groups need manual review).\n")
PY
  rm -f "$report"
  pass "axe accessibility audit: $label"
}

cleanup() {
  ab close >/dev/null 2>&1 || true
  ab_demo close >/dev/null 2>&1 || true
  ab_capture close >/dev/null 2>&1 || true
  if [[ -n "$DEMO_PID" ]]; then
    kill "$DEMO_PID" >/dev/null 2>&1 || true
    wait "$DEMO_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "$CAPTURE_PID" ]]; then
    kill "$CAPTURE_PID" >/dev/null 2>&1 || true
    wait "$CAPTURE_PID" >/dev/null 2>&1 || true
  fi
  rm -f "$OUT_DIR/.demo-server.log" "$OUT_DIR/.capture-server.log" "$OUT_DIR"/.axe-*.json
}
trap cleanup EXIT

ab open "$BASE_URL/"
ab set viewport 1440 900
ab wait 350
expect_text 'h1' 'Turn browser explorations'
ab screenshot "$OUT_DIR/marketing.png"
audit_page marketing
ab mouse move 700 320 --duration 350 --steps 24 --human --seed 9
ab mouse wheel 560
ab wait 250
ab screenshot "$OUT_DIR/marketing-scroll.png"
ab mouse wheel -560
ab click '.hero-actions .button-primary' --human
ab wait 250
expect_url_path '/login?next=%2Fconsole'
expect_text 'body' 'Authentication is not connected in this preview'
[[ "$(ab get count 'input')" == "0" ]] || fail 'sample sign-in unexpectedly exposed credential fields'
ab screenshot "$OUT_DIR/login-preview.png"
audit_page login
pass 'sample sign-in disclosure and no credential form'

# A same-origin allowlist must reject an off-site login destination.
ab open "$BASE_URL/login?next=https%3A%2F%2Fevil.example"
ab click '#demo-login' --human
ab wait 350
expect_url_path '/console'
pass 'login redirect stays on the same origin'
expect_text '#page-heading' 'Overview'
expect_text 'body' 'preview data'
ab screenshot "$OUT_DIR/console-overview.png"
audit_page overview

ab click '#open-run-search' --human
expect_url_path '/console#runs'
expect_visible '#run-search-full'
ab fill '#run-search-full' 'checkout'
ab select '#run-status-filter-full' failed
expect_text '#run-history-table-body' 'fix/checkout-retry'
[[ "$(ab get text '#run-result-count')" == '1 sample run' ]] || fail 'combined run search and status filter did not return one matching run'
ab screenshot "$OUT_DIR/console-runs-filtered.png"
audit_page runs
ab fill '#run-search-full' 'no-such-sample-run'
expect_visible '#run-empty-state'
ab fill '#run-search-full' ''
ab select '#run-status-filter-full' all
[[ "$(ab get text '#run-result-count')" == '6 sample runs' ]] || fail 'clearing filters did not restore all sample runs'
ab click '#run-history-table-body [data-open-run="preview-run-1039"]' --human
expect_text '#run-detail-title' 'Checkout payment'
expect_text '#run-detail-summary' '16 of 18 steps passed'
ab screenshot "$OUT_DIR/console-run-detail.png"
audit_page run-detail
ab click '[data-copy-target="proof-root"]' --human
expect_text '[data-copy-target="proof-root"]' 'Copied'
ab click '[data-back-runs]' --human
expect_text '#page-heading' 'Test runs'
pass 'run filtering, empty state, detail view, evidence copy, and back navigation'

ab click '.primary-nav [data-nav="explorer"]' --human
expect_text '#page-heading' 'Test explorer'
expect_text '#view-explorer' 'Sample suite groups'
ab screenshot "$OUT_DIR/console-explorer.png"
audit_page explorer

ab click '.primary-nav [data-nav="analytics"]' --human
expect_text '#page-heading' 'Analytics'
expect_text '#view-analytics' 'Sample analytics'
ab screenshot "$OUT_DIR/console-analytics.png"
audit_page analytics

ab click '.primary-nav [data-nav="audit"]' --human
expect_text '#page-heading' 'Audit & evidence'
expect_text '#view-audit' 'Example identifiers are not signed evidence'
ab screenshot "$OUT_DIR/console-audit.png"
audit_page audit
ab download '#export-sample-evidence' "$OUT_DIR/sample-evidence.json"
python3 - "$OUT_DIR/sample-evidence.json" <<'PY'
import json
import sys
with open(sys.argv[1], encoding='utf-8') as source:
    evidence = json.load(source)
assert evidence['previewData'] is True
assert 'not a signed attestation' in evidence['note']
assert len(evidence['runs']) == 6
PY
pass 'sample evidence export contains only disclosed preview data'
ab click '#open-audit' --human
expect_url_path '/console#audit'

ab click '.primary-nav [data-nav="integrations"]' --human
ab wait 1100
expect_text '#page-heading' 'API & CI/CD'
expect_text '#motion-status' 'Three.js CI to attestation flow'
expect_text '#view-integrations' 'POST /v1/runs'
ab screenshot "$OUT_DIR/console-integrations.png"
audit_page integrations
ab click '#replay-flow' --human
expect_text '#motion-status' 'Three.js flow replayed'
ab click '[data-cli-mode="bun"]' --human
expect_visible '[data-cli-panel="bun"]'
ab click '[data-copy-target="bun-install-command"]' --human
expect_text '[data-copy-target="bun-install-command"]' 'Copied'
ab click '[data-cli-mode="npm"]' --human
expect_visible '[data-cli-panel="npm"]'
ab scrollintoview '#record-motion'
ab click '#record-motion' --human
ab wait 6800
expect_text '#motion-status' 'Server save unavailable'
ab scrollintoview '#download-motion'
expect_visible '#download-motion'
blob_link="$(ab eval 'document.querySelector("#download-motion").href.startsWith("blob:")')"
[[ "$blob_link" == 'true' || "$blob_link" == '"true"' ]] || fail 'Three.js fallback did not expose a local browser download'
pass 'Three.js canvas render, replay, CLI tabs, clipboard, and local recording fallback'

ab click '.profile-button[data-demo-signout]' --human
ab wait 250
expect_url_path '/login'
ab open "$BASE_URL/login?next=%2Fconsole"
ab click '#demo-login' --human
ab wait 250
ab set viewport 390 844
ab click '.primary-nav [data-nav="integrations"]' --human
ab wait 900
ab screenshot "$OUT_DIR/console-integrations-mobile.png"
layout_check="$(ab eval 'document.documentElement.scrollWidth <= window.innerWidth')"
[[ "$layout_check" == 'true' || "$layout_check" == '"true"' ]] || fail 'mobile console has horizontal overflow'
audit_page integrations-mobile
pass 'mobile console at 390px has no horizontal overflow'
pass 'staging GUI journey completed through mouse-driven navigation'

# Save the same five-second canvas clip through the local dashboard endpoint.
# Staging stays static and exposes only its browser download fallback.
if curl -fsS --max-time 1 "http://127.0.0.1:${CAPTURE_PORT}/" >/dev/null 2>&1; then
  fail "local capture port ${CAPTURE_PORT} is already in use"
fi
CAPTURE_PORT="$CAPTURE_PORT" CAPTURE_OUTPUT_DIR="$OUT_DIR" bun -e 'import { startDashboardServer } from "./src/dashboard/server.ts"; startDashboardServer({ compliance: { outputDir: "./.airlock/compliance" } }, Number(process.env.CAPTURE_PORT), process.env.CAPTURE_OUTPUT_DIR);' > "$OUT_DIR/.capture-server.log" 2>&1 &
CAPTURE_PID=$!
for attempt in $(seq 1 50); do
  if curl -fsS --max-time 1 "http://127.0.0.1:${CAPTURE_PORT}/" >/dev/null 2>&1; then break; fi
  sleep 0.2
done
curl -fsS --max-time 2 "http://127.0.0.1:${CAPTURE_PORT}/" >/dev/null || fail 'local dashboard capture server did not start'
ab_capture open "http://127.0.0.1:${CAPTURE_PORT}/login?next=%2Fconsole"
ab_capture set viewport 1440 900
ab_capture click '#demo-login' --human
ab_capture wait 350
ab_capture click '.primary-nav [data-nav="integrations"]' --human
ab_capture wait 1100
ab_capture scrollintoview '#record-motion'
ab_capture click '#record-motion' --human
ab_capture wait 6800
capture_status="$(ab_capture get text '#motion-status')"
[[ "$capture_status" == *'Video saved: artifacts/gui-qa/pr/airlockqa-motion-preview.webm'* ]] || fail "local dashboard did not save the canvas clip: $capture_status"
python3 - "$OUT_DIR/airlockqa-motion-preview.webm" <<'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
data = path.read_bytes()
assert data[:4] == bytes.fromhex('1a45dfa3'), 'recording is not a WebM file'
assert len(data) > 4096, 'recording is empty or too small'
PY
pass 'local dashboard saved a valid five-second Three.js WebM preview'
ab_capture close

# Exercise real login, coupon, and checkout form submissions against the local
# demo API only. The checkout request is intentionally sent without Airlock so
# the demo server confirms a raw phantom credential is rejected.
if curl -fsS --max-time 1 "http://127.0.0.1:${DEMO_PORT}/" >/dev/null 2>&1; then
  fail "local demo port ${DEMO_PORT} is already in use"
fi
DEMO_PORT="$DEMO_PORT" bun -e 'import { startDemoServer } from "./examples/demo-store/server.ts"; await startDemoServer(Number(process.env.DEMO_PORT));' > "$OUT_DIR/.demo-server.log" 2>&1 &
DEMO_PID=$!
for attempt in $(seq 1 50); do
  if curl -fsS --max-time 1 "http://127.0.0.1:${DEMO_PORT}/" >/dev/null 2>&1; then break; fi
  sleep 0.2
done
curl -fsS --max-time 2 "http://127.0.0.1:${DEMO_PORT}/" >/dev/null || fail 'local demo store did not start'

ab_demo open "http://127.0.0.1:${DEMO_PORT}/"
ab_demo set viewport 1440 900
ab_demo wait 250
ab_demo eval 'localStorage.clear(); sessionStorage.clear(); document.cookie = "acme_session=; Max-Age=0; path=/"'
ab_demo open "http://127.0.0.1:${DEMO_PORT}/"
shop_hidden="$(ab_demo eval 'getComputedStyle(document.querySelector("#shop-section")).display === "none"')"
[[ "$shop_hidden" == 'true' || "$shop_hidden" == '"true"' ]] || fail 'local demo did not begin signed out'
ab_demo screenshot "$OUT_DIR/demo-login-form.png"
audit_page demo-login demo
ab_demo fill 'input[name="email"]' 'not-an-email'
ab_demo fill 'input[name="password"]' 'demo-only-password'
ab_demo click '#login-btn' --human
invalid_form="$(ab_demo eval 'document.querySelector("input[name=email]").validity.valid ? "valid" : "invalid"')"
[[ "$invalid_form" == *invalid* ]] || fail 'browser accepted an invalid email address'
shop_hidden="$(ab_demo eval 'getComputedStyle(document.querySelector("#shop-section")).display === "none"')"
[[ "$shop_hidden" == 'true' || "$shop_hidden" == '"true"' ]] || fail 'invalid login form opened the shop'
pass 'browser blocks malformed email before the login form submits'
ab_demo fill 'input[name="email"]' 'qa-user@example.test'
ab_demo fill 'input[name="password"]' 'demo-only-password'
ab_demo click '#login-btn' --human
expect_demo_text '#auth-status' 'Logged in as admin@acme.com'
shop_hidden="$(ab_demo eval 'getComputedStyle(document.querySelector("#shop-section")).display === "none"')"
[[ "$shop_hidden" == 'false' || "$shop_hidden" == '"false"' ]] || fail 'valid login did not open the shop'
ab_demo click '#add-btn' --human
expect_demo_text '#cart-count' '1'
ab_demo fill '[data-testid="coupon-input"]' 'EXPIRED'
ab_demo click '[data-testid="apply-coupon-btn"]' --human
expect_demo_text '#coupon-status' 'Invalid or expired coupon code'
expect_demo_text '#cart-total' '$50.00'
ab_demo fill '[data-testid="coupon-input"]' 'AIRLOCK20'
ab_demo click '[data-testid="apply-coupon-btn"]' --human
expect_demo_text '#coupon-status' '20% discount applied'
expect_demo_text '#cart-total' '$40.00'
ab_demo screenshot "$OUT_DIR/demo-checkout-form.png"
ab_demo click '#checkout-btn' --human
ab_demo wait 700
expect_demo_text '#checkout-status' 'UNAUTHORIZED_PHANTOM_TOKEN_RECEIVED'
ab_demo screenshot "$OUT_DIR/demo-checkout-blocked.png"
audit_page demo-checkout demo
pass 'demo login, invalid and valid coupons, total calculation, and raw-phantom rejection'
ab_demo close

printf '\nCompleted %s GUI checks. Screenshots and recordings: %s\n' "$PASS_COUNT" "$OUT_DIR"
printf '\n- Result: PASS (%s checks)\n' "$PASS_COUNT" >> "$SUMMARY_FILE"
