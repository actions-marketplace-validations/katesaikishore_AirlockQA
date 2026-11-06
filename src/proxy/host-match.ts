/**
 * Shared host matching used by the policy engine and the phantom engine.
 *
 * Supported pattern forms (case-insensitive, a trailing dot is ignored):
 *   "*"                  any host, any port
 *   "api.example.com"    exactly that hostname, any port
 *   "*.example.com"      example.com or any subdomain of it, any port
 *   "api.example.com:8443", "*.example.com:443", "[::1]:3000"
 *                        as above, but only on that port
 *
 * The port of the host being checked is always split off before the hostname
 * is compared, so a port in the request never changes how the hostname matches.
 * When the host carries no explicit port, `defaultPort` (for example 443 for an
 * https:// URL) is used for "host:port" patterns.
 */

export interface HostParts {
  hostname: string;
  port?: number;
}

function normalizeHostname(hostname: string): string {
  let h = hostname.trim().toLowerCase();
  if (h.startsWith('[') && h.endsWith(']')) h = h.slice(1, -1);
  if (h.endsWith('.')) h = h.slice(0, -1);
  return h;
}

/**
 * Split "host", "host:port", "[v6]" or "[v6]:port" into hostname and port.
 * A bare IPv6 address without brackets is treated as a hostname with no port.
 */
export function splitHostPort(value: string): HostParts {
  const input = value.trim();
  if (input.startsWith('[')) {
    const end = input.indexOf(']');
    if (end !== -1) {
      const hostname = normalizeHostname(input.slice(0, end + 1));
      const rest = input.slice(end + 1);
      if (rest.startsWith(':') && /^\d+$/.test(rest.slice(1))) {
        return { hostname, port: Number(rest.slice(1)) };
      }
      return { hostname };
    }
  }
  const colons = input.split(':').length - 1;
  if (colons === 1) {
    const idx = input.lastIndexOf(':');
    const portStr = input.slice(idx + 1);
    if (/^\d+$/.test(portStr)) {
      return { hostname: normalizeHostname(input.slice(0, idx)), port: Number(portStr) };
    }
  }
  return { hostname: normalizeHostname(input) };
}

/** Default port for a URL scheme, or undefined when unknown. */
export function defaultPortForUrl(rawUrl: string | undefined): number | undefined {
  if (!rawUrl) return undefined;
  try {
    const u = new URL(rawUrl);
    if (u.port) return Number(u.port);
    if (u.protocol === 'https:' || u.protocol === 'wss:') return 443;
    if (u.protocol === 'http:' || u.protocol === 'ws:') return 80;
  } catch {
    // not an absolute URL
  }
  return undefined;
}

export function matchHost(host: string, pattern: string, defaultPort?: number): boolean {
  if (!pattern) return false;
  if (pattern.trim() === '*') return true;

  const target = splitHostPort(host);
  const pat = splitHostPort(pattern);

  if (pat.port !== undefined) {
    const effectivePort = target.port ?? defaultPort;
    if (effectivePort !== pat.port) return false;
  }

  if (pat.hostname === '*') return true;
  if (pat.hostname.startsWith('*.')) {
    const suffix = pat.hostname.slice(2);
    return target.hostname === suffix || target.hostname.endsWith('.' + suffix);
  }
  return target.hostname === pat.hostname;
}

export function matchAnyHost(host: string, patterns: readonly string[], defaultPort?: number): boolean {
  return patterns.some((p) => matchHost(host, p, defaultPort));
}
