#!/usr/bin/env bash
# QAFind container entrypoint.
#
# QAFIND_EGRESS_FIREWALL=1 (needs root + NET_ADMIN):
#   1. apply egress-firewall.sh (default-deny; only the proxy uid may reach the network),
#   2. start the QAFind proxy as QAFIND_PROXY_USER on 127.0.0.1:QAFIND_PROXY_PORT,
#   3. run the CLI as the unprivileged 'qafind' user with HTTP_PROXY/HTTPS_PROXY set.
# Otherwise the CLI runs as 'qafind' with no OS-level egress control.
set -euo pipefail

APP_DIR=/home/qafind/app
QAFIND_PROXY_USER=${QAFIND_PROXY_USER:-qafind-proxy}
QAFIND_PROXY_PORT=${QAFIND_PROXY_PORT:-8899}
SANDBOX_USER=qafind

if [ "${QAFIND_EGRESS_FIREWALL:-0}" = "1" ]; then
  if [ "$(id -u)" != "0" ]; then
    echo "entrypoint: QAFIND_EGRESS_FIREWALL=1 requires starting as root with NET_ADMIN" >&2
    exit 1
  fi
  "$APP_DIR/egress-firewall.sh"

  runuser -u "$QAFIND_PROXY_USER" -- env \
    QAFIND_PROXY_PORT="$QAFIND_PROXY_PORT" \
    QAFIND_CONNECT_ALLOW_HOSTS="${QAFIND_CONNECT_ALLOW_HOSTS:-}" \
    QAFIND_MAX_BODY_BYTES="${QAFIND_MAX_BODY_BYTES:-}" \
    bun "$APP_DIR/container/start-proxy.ts" &

  for _ in $(seq 1 50); do
    if (exec 3<>"/dev/tcp/127.0.0.1/$QAFIND_PROXY_PORT") 2>/dev/null; then break; fi
    sleep 0.1
  done

  export HTTP_PROXY="http://127.0.0.1:${QAFIND_PROXY_PORT}"
  export HTTPS_PROXY="$HTTP_PROXY"
  export http_proxy="$HTTP_PROXY"
  export https_proxy="$HTTP_PROXY"
  export NO_PROXY="localhost,127.0.0.1,::1"
  export no_proxy="$NO_PROXY"
fi

cd "$APP_DIR"
if [ "$(id -u)" = "0" ]; then
  exec runuser -u "$SANDBOX_USER" -- bun ./bin/qafind.ts "$@"
fi
exec bun ./bin/qafind.ts "$@"
