/**
 * Standalone QAFind HTTP proxy for the container. Runs as the dedicated proxy user;
 * the egress firewall exempts only that uid.
 *
 * Environment:
 *   QAFIND_CONFIG               config file path (default: qafind.config.json lookup)
 *   QAFIND_PROXY_LISTEN         listen address (default 127.0.0.1)
 *   QAFIND_PROXY_PORT           listen port (default: config proxy.port or 8899)
 *   QAFIND_CONNECT_ALLOW_HOSTS  comma-separated host[:port] patterns that may be
 *                                tunnelled with CONNECT, uninspected (default: none)
 *   QAFIND_MAX_BODY_BYTES       request / inspected text response cap (default 10 MiB)
 */
import { loadConfig } from '../src/config/loader.js';
import { QAFindGateway } from '../src/proxy/gateway.js';

const config = loadConfig(process.env.QAFIND_CONFIG);
const list = (v: string | undefined) =>
  (v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const gateway = new QAFindGateway(config, {
  connectAllowHosts: list(process.env.QAFIND_CONNECT_ALLOW_HOSTS),
  maxBodyBytes: process.env.QAFIND_MAX_BODY_BYTES ? Number(process.env.QAFIND_MAX_BODY_BYTES) : undefined,
});

const port = Number(process.env.QAFIND_PROXY_PORT || config.proxy?.port || 8899);
const listen = process.env.QAFIND_PROXY_LISTEN || '127.0.0.1';
await gateway.startHttpProxy(port, listen);

const shutdown = async () => {
  await gateway.stop();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
