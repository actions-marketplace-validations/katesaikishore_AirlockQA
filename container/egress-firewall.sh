#!/usr/bin/env bash
# ==============================================================================
# AirlockQA egress firewall (Linux iptables / ip6tables, filter table)
#
# Default-deny outbound traffic for every process in the container except:
#   * loopback traffic (so sandboxed clients can reach the proxy on 127.0.0.1),
#   * replies on connections that were opened *to* the container,
#   * the dedicated proxy user (AIRLOCK_PROXY_USER, never root/uid 0).
#
# Sandboxed clients must send HTTP through the Airlock proxy with HTTP_PROXY.
# HTTPS clients would use HTTPS_PROXY + CONNECT, which the proxy DENIES by default
# because a TLS tunnel cannot be inspected (no phantom-token swap, no response
# sanitizing). Hosts may be opted in for uninspected tunnelling with
# AIRLOCK_CONNECT_ALLOW_HOSTS. Direct 443 is REJECTED; it is never redirected to the
# plain-HTTP proxy. Inspecting HTTPS would need a TLS-terminating proxy with its own
# CA trusted by the sandbox; AirlockQA does not ship one.
#
# Limits: this is a packet-filter backstop for one container, not a proof of
# isolation. Anything running as AIRLOCK_PROXY_USER, or root (which can flush these
# rules), is not constrained. Run sandboxed code as a different, unprivileged user.
# ==============================================================================

set -euo pipefail

AIRLOCK_PROXY_USER=${AIRLOCK_PROXY_USER:-airlock-proxy}

if ! PROXY_UID=$(id -u "$AIRLOCK_PROXY_USER" 2>/dev/null); then
  echo "egress-firewall: proxy user '$AIRLOCK_PROXY_USER' does not exist" >&2
  exit 1
fi
if [ "$PROXY_UID" = "0" ]; then
  echo "egress-firewall: refusing to exempt uid 0; run the proxy as a dedicated unprivileged user" >&2
  exit 1
fi

apply_rules() {
  local ipt="$1"
  command -v "$ipt" >/dev/null 2>&1 || { echo "egress-firewall: $ipt not found, skipping"; return 0; }

  "$ipt" -D OUTPUT -j AIRLOCK_EGRESS 2>/dev/null || true
  "$ipt" -F AIRLOCK_EGRESS 2>/dev/null || true
  "$ipt" -X AIRLOCK_EGRESS 2>/dev/null || true
  "$ipt" -N AIRLOCK_EGRESS

  "$ipt" -A AIRLOCK_EGRESS -o lo -j ACCEPT
  "$ipt" -A AIRLOCK_EGRESS -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
  "$ipt" -A AIRLOCK_EGRESS -m owner --uid-owner "$PROXY_UID" -j ACCEPT
  "$ipt" -A AIRLOCK_EGRESS -p tcp -j REJECT --reject-with tcp-reset
  "$ipt" -A AIRLOCK_EGRESS -j REJECT

  "$ipt" -I OUTPUT 1 -j AIRLOCK_EGRESS
}

echo "Applying AirlockQA egress firewall (proxy user: $AIRLOCK_PROXY_USER, uid $PROXY_UID)..."
apply_rules iptables
apply_rules ip6tables

echo "Egress firewall active: outbound traffic is rejected except loopback, established replies,"
echo "and uid $PROXY_UID. Direct TCP 80/443 from other users is rejected; use HTTP_PROXY."
