#!/usr/bin/env bash
# AirlockQA container entrypoint.
#
# AIRLOCK_EGRESS_FIREWALL=1 (needs root + NET_ADMIN):
#   1. apply egress-firewall.sh (default-deny; only the proxy uid may reach the network),
#   2. start the Airlock proxy as AIRLOCK_PROXY_USER on 127.0.0.1:AIRLOCK_PROXY_PORT,
#   3. run the CLI as the unprivileged 'airlock' user with HTTP_PROXY/HTTPS_PROXY set.
# Otherwise the CLI runs as 'airlock' with no OS-level egress control.
set -euo pipefail

APP_DIR=/home/airlock/app
AIRLOCK_PROXY_USER=${AIRLOCK_PROXY_USER:-airlock-proxy}
AIRLOCK_PROXY_PORT=${AIRLOCK_PROXY_PORT:-8899}
SANDBOX_USER=airlock

if [ "${AIRLOCK_EGRESS_FIREWALL:-0}" = "1" ]; then
  if [ "$(id -u)" != "0" ]; then
    echo "entrypoint: AIRLOCK_EGRESS_FIREWALL=1 requires starting as root with NET_ADMIN" >&2
    exit 1
  fi
  "$APP_DIR/egress-firewall.sh"

  runuser -u "$AIRLOCK_PROXY_USER" -- env \
    AIRLOCK_PROXY_PORT="$AIRLOCK_PROXY_PORT" \
    AIRLOCK_CONNECT_ALLOW_HOSTS="${AIRLOCK_CONNECT_ALLOW_HOSTS:-}" \
    AIRLOCK_MAX_BODY_BYTES="${AIRLOCK_MAX_BODY_BYTES:-}" \
    bun "$APP_DIR/container/start-proxy.ts" &

  for _ in $(seq 1 50); do
    if (exec 3<>"/dev/tcp/127.0.0.1/$AIRLOCK_PROXY_PORT") 2>/dev/null; then break; fi
    sleep 0.1
  done

  export HTTP_PROXY="http://127.0.0.1:${AIRLOCK_PROXY_PORT}"
  export HTTPS_PROXY="$HTTP_PROXY"
  export http_proxy="$HTTP_PROXY"
  export https_proxy="$HTTP_PROXY"
  export NO_PROXY="localhost,127.0.0.1,::1"
  export no_proxy="$NO_PROXY"
fi

cd "$APP_DIR"
if [ "$(id -u)" = "0" ]; then
  exec runuser -u "$SANDBOX_USER" -- bun ./bin/airlock.ts "$@"
fi
exec bun ./bin/airlock.ts "$@"
