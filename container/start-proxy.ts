/**
 * Standalone Airlock HTTP proxy for the container. Runs as the dedicated proxy user;
 * the egress firewall exempts only that uid.
 *
 * Environment:
 *   AIRLOCK_CONFIG               config file path (default: airlock.config.json lookup)
 *   AIRLOCK_PROXY_LISTEN         listen address (default 127.0.0.1)
 *   AIRLOCK_PROXY_PORT           listen port (default: config proxy.port or 8899)
 *   AIRLOCK_CONNECT_ALLOW_HOSTS  comma-separated host[:port] patterns that may be
 *                                tunnelled with CONNECT, uninspected (default: none)
 *   AIRLOCK_MAX_BODY_BYTES       request / inspected text response cap (default 10 MiB)
 */
import { loadConfig } from '../src/config/loader.js';
import { AirlockGateway } from '../src/proxy/gateway.js';

const config = loadConfig(process.env.AIRLOCK_CONFIG);
const list = (v: string | undefined) =>
  (v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const gateway = new AirlockGateway(config, {
  connectAllowHosts: list(process.env.AIRLOCK_CONNECT_ALLOW_HOSTS),
  maxBodyBytes: process.env.AIRLOCK_MAX_BODY_BYTES ? Number(process.env.AIRLOCK_MAX_BODY_BYTES) : undefined,
});

const port = Number(process.env.AIRLOCK_PROXY_PORT || config.proxy?.port || 8899);
const listen = process.env.AIRLOCK_PROXY_LISTEN || '127.0.0.1';
await gateway.startHttpProxy(port, listen);

const shutdown = async () => {
  await gateway.stop();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
