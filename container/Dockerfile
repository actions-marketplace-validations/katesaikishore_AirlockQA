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
    && rm -rf /var/lib/apt/lists/*

# Install Bun runtime
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Create non-privileged airlock sandbox user
RUN useradd -m -s /bin/bash airlock && \
    mkdir -p /home/airlock/app && \
    chown -R airlock:airlock /home/airlock

WORKDIR /home/airlock/app

# Copy application files
COPY --chown=airlock:airlock package.json tsconfig.json ./
COPY --chown=airlock:airlock src ./src
COPY --chown=airlock:airlock bin ./bin
COPY --chown=airlock:airlock examples ./examples
COPY --chown=airlock:airlock container/egress-firewall.sh ./egress-firewall.sh

RUN chmod +x ./egress-firewall.sh ./bin/airlock.ts

# Switch to sandboxed non-root user
USER airlock

# Tell Playwright where Chromium is
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV AIRLOCK_SANDBOX=true

EXPOSE 4100 8899

ENTRYPOINT ["bun", "./bin/airlock.ts"]
CMD ["run"]

