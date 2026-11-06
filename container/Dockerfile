# ==============================================================================
# Hardened Linux Runner Sandbox
# AirlockQA Zero-Credential & Egress-Controlled Execution Environment
# ==============================================================================

FROM debian:bookworm-slim

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install minimal runtime dependencies, iptables for network firewall, and Chrome
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    iptables \
    iproute2 \
    procps \
    git \
    unzip \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libasound2 \
    chromium \
    util-linux \
    && rm -rf /var/lib/apt/lists/*

# Install Bun system-wide (not under /root, which other users cannot read)
RUN curl -fsSL https://bun.sh/install | BUN_INSTALL=/usr/local bash

# Two unprivileged users:
#   airlock        runs the CLI, the browser and any sandboxed code
#   airlock-proxy  runs only the Airlock proxy; the egress firewall exempts this uid alone
RUN useradd -m -s /bin/bash airlock && \
    useradd -r -M -s /usr/sbin/nologin airlock-proxy && \
    mkdir -p /home/airlock/app && \
    chown -R airlock:airlock /home/airlock && \
    chmod 0755 /home/airlock

WORKDIR /home/airlock/app

# Copy application files
COPY --chown=airlock:airlock package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile --production
COPY --chown=airlock:airlock src ./src
COPY --chown=airlock:airlock bin ./bin
COPY --chown=airlock:airlock examples ./examples
COPY --chown=airlock:airlock container/start-proxy.ts ./container/start-proxy.ts
# Firewall and entrypoint are root-owned so the sandbox user cannot change them
COPY --chown=root:root container/egress-firewall.sh ./egress-firewall.sh
COPY --chown=root:root container/entrypoint.sh /usr/local/bin/airlock-entrypoint

RUN chmod 0755 ./egress-firewall.sh /usr/local/bin/airlock-entrypoint ./bin/airlock.ts

# The container starts as root only so the entrypoint can apply the egress firewall
# (AIRLOCK_EGRESS_FIREWALL=1, needs NET_ADMIN). It then drops to 'airlock' for the CLI
# and to 'airlock-proxy' for the proxy. Without the firewall flag it just drops to 'airlock'.

# Tell Playwright where Chromium is
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV AIRLOCK_SANDBOX=true

# The proxy listens on 127.0.0.1 inside the container only; it is not exposed.
EXPOSE 4100

ENTRYPOINT ["/usr/local/bin/airlock-entrypoint"]
CMD ["run"]

