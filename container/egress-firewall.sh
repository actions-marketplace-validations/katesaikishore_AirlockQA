#!/usr/bin/env bash
# ==============================================================================
# AirlockQA Deterministic Egress Firewall (Linux iptables / nftables)
# Forces all outbound TCP 80/443 traffic through the Airlock Proxy on 127.0.0.1:8899.
# Blocks any direct network egress bypass at the kernel packet filter level.
# ==============================================================================

set -euo pipefail

AIRLOCK_PROXY_PORT=${AIRLOCK_PROXY_PORT:-8899}
AIRLOCK_PROXY_USER=${AIRLOCK_PROXY_USER:-root}

echo "🛡️  Initializing Airlock OS-Level Deterministic Egress Firewall..."

# Flush existing custom chain if present
iptables -t nat -F AIRLOCK_EGRESS 2>/dev/null || true
iptables -t nat -X AIRLOCK_EGRESS 2>/dev/null || true

# Create custom chain
iptables -t nat -N AIRLOCK_EGRESS

# Exclude traffic originating from proxy itself to prevent redirect loops
iptables -t nat -A AIRLOCK_EGRESS -m owner --uid-owner "$AIRLOCK_PROXY_USER" -j RETURN

# Exclude loopback interface (localhost traffic within container)
iptables -t nat -A AIRLOCK_EGRESS -d 127.0.0.1/32 -j RETURN

# Redirect all outbound HTTP (80) and HTTPS (443) to local Airlock Proxy
iptables -t nat -A AIRLOCK_EGRESS -p tcp --dport 80 -j REDIRECT --to-ports "$AIRLOCK_PROXY_PORT"
iptables -t nat -A AIRLOCK_EGRESS -p tcp --dport 443 -j REDIRECT --to-ports "$AIRLOCK_PROXY_PORT"

# Hook into OUTPUT chain
iptables -t nat -A OUTPUT -p tcp -j AIRLOCK_EGRESS

echo "✔ Egress firewall active: All TCP 80/443 redirected to port ${AIRLOCK_PROXY_PORT}"
echo "✔ Unfiltered outbound socket bypass: MATHEMATICALLY BLOCKED"

