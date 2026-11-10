# ==============================================================================
# Hardened Linux Runner Sandbox
# QAFind Zero-Credential & Egress-Controlled Execution Environment
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
#   qafind        runs the CLI, the browser and any sandboxed code
#   qafind-proxy  runs only the QAFind proxy; the egress firewall exempts this uid alone
RUN useradd -m -s /bin/bash qafind && \
    useradd -r -M -s /usr/sbin/nologin qafind-proxy && \
    mkdir -p /home/qafind/app && \
    chown -R qafind:qafind /home/qafind && \
    chmod 0755 /home/qafind

WORKDIR /home/qafind/app

# Copy application files
COPY --chown=qafind:qafind package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile --production
COPY --chown=qafind:qafind src ./src
COPY --chown=qafind:qafind bin ./bin
COPY --chown=qafind:qafind examples ./examples
COPY --chown=qafind:qafind container/start-proxy.ts ./container/start-proxy.ts
# Firewall and entrypoint are root-owned so the sandbox user cannot change them
COPY --chown=root:root container/egress-firewall.sh ./egress-firewall.sh
COPY --chown=root:root container/entrypoint.sh /usr/local/bin/qafind-entrypoint

RUN chmod 0755 ./egress-firewall.sh /usr/local/bin/qafind-entrypoint ./bin/qafind.ts

# The container starts as root only so the entrypoint can apply the egress firewall
# (QAFIND_EGRESS_FIREWALL=1, needs NET_ADMIN). It then drops to 'qafind' for the CLI
# and to 'qafind-proxy' for the proxy. Without the firewall flag it just drops to 'qafind'.

# Tell Playwright where Chromium is
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV QAFIND_SANDBOX=true

# The proxy listens on 127.0.0.1 inside the container only; it is not exposed.
EXPOSE 4100

ENTRYPOINT ["/usr/local/bin/qafind-entrypoint"]
CMD ["run"]

