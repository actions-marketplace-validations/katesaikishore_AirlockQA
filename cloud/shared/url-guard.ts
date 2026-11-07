/**
 * SSRF guard for hosted runs. A hosted browser must only reach the public internet:
 * never loopback, private networks, link-local addresses (including cloud metadata) or
 * the Docker bridge the service itself runs on.
 *
 * `checkUrlSyntax` is synchronous and needs no DNS. `assertPublicTarget` also resolves the
 * host and requires every resolved address to be public. The worker's forward proxy calls
 * `assertPublicHost` on each connection and connects to the validated address, so DNS
 * rebinding cannot swap in a private address after the check.
 */
import * as dns from 'node:dns/promises';
import * as net from 'node:net';

export class TargetBlockedError extends Error {
  readonly code = 'TARGET_BLOCKED';
  constructor(message: string) {
    super(message);
    this.name = 'TargetBlockedError';
  }
}

const V4_BLOCKS: Array<[string, number]> = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

function v4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, part) => acc * 256 + Number(part), 0);
}

function inV4Block(ip: string, base: string, bits: number): boolean {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return ((v4ToInt(ip) & mask) >>> 0) === ((v4ToInt(base) & mask) >>> 0);
}

/** Parse an IPv6 address (with optional embedded IPv4 tail) to a 128-bit integer. */
export function parseIPv6(input: string): bigint | null {
  let ip = input;
  const zone = ip.indexOf('%');
  if (zone !== -1) ip = ip.slice(0, zone);
  if (!net.isIPv6(ip)) return null;

  let tail: bigint[] = [];
  const lastColon = ip.lastIndexOf(':');
  const maybeV4 = ip.slice(lastColon + 1);
  if (net.isIPv4(maybeV4)) {
    const n = v4ToInt(maybeV4);
    tail = [BigInt(n >>> 16), BigInt(n & 0xffff)];
    ip = ip.slice(0, lastColon + 1) + '0:0';
  }

  const [head, rest] = ip.split('::');
  const headParts = head ? head.split(':') : [];
  const restParts = rest !== undefined && rest !== '' ? rest.split(':') : [];
  const missing = 8 - headParts.length - restParts.length;
  if (rest === undefined ? headParts.length !== 8 : missing < 0) return null;
  const parts = rest === undefined ? headParts : [...headParts, ...Array(missing).fill('0'), ...restParts];
  const groups = parts.map((p) => BigInt(parseInt(p || '0', 16)));
  if (tail.length) {
    groups[6] = tail[0];
    groups[7] = tail[1];
  }
  return groups.reduce((acc, g) => (acc << 16n) | g, 0n);
}

function v6Prefix(value: bigint, base: bigint, bits: number): boolean {
  const shift = BigInt(128 - bits);
  return value >> shift === base >> shift;
}

const V6_BLOCKS: Array<[string, number]> = [
  ['::', 128],
  ['::1', 128],
  ['100::', 64],
  ['2001::', 32],
  ['2001:db8::', 32],
  ['fc00::', 7],
  ['fe80::', 10],
  ['fec0::', 10],
  ['ff00::', 8],
];

function embeddedV4(value: bigint): string {
  const n = Number(value & 0xffffffffn);
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

/** True when the address is not a normal public unicast address. Unparseable input is blocked. */
export function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) return V4_BLOCKS.some(([base, bits]) => inV4Block(ip, base, bits));
  const v6 = parseIPv6(ip);
  if (v6 === null) return true;
  // IPv4-mapped (::ffff:0:0/96), NAT64 (64:ff9b::/96) and 6to4 (2002::/16) carry an IPv4 address.
  if (v6Prefix(v6, parseIPv6('::ffff:0:0')!, 96) || v6Prefix(v6, parseIPv6('64:ff9b::')!, 96)) {
    return isBlockedIp(embeddedV4(v6));
  }
  if (v6Prefix(v6, parseIPv6('2002::')!, 16)) {
    return isBlockedIp(embeddedV4((v6 >> 80n) & 0xffffffffn));
  }
  return V6_BLOCKS.some(([base, bits]) => v6Prefix(v6, parseIPv6(base)!, bits));
}

const BLOCKED_SUFFIXES = ['.localhost', '.local', '.internal', '.localdomain', '.lan', '.home', '.corp', '.intranet', '.arpa'];

/** Ports a hosted run may use: 80, 443 and the unprivileged range. */
export function isAllowedPort(port: number): boolean {
  return port === 80 || port === 443 || (port >= 1024 && port <= 65535);
}

export interface GuardedUrl {
  url: URL;
  hostname: string;
  port: number;
}

/** Synchronous checks: scheme, credentials, port and host name shape. Throws TargetBlockedError. */
export function checkUrlSyntax(raw: string): GuardedUrl {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new TargetBlockedError('The target is not a valid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TargetBlockedError('Only http and https targets are allowed');
  }
  if (url.username || url.password) throw new TargetBlockedError('Targets with embedded credentials are not allowed');
  const port = url.port ? Number(url.port) : url.protocol === 'https:' ? 443 : 80;
  if (!isAllowedPort(port)) throw new TargetBlockedError(`Port ${port} is not allowed`);

  const hostname = url.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase();
  if (!hostname) throw new TargetBlockedError('The target has no host');
  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) throw new TargetBlockedError('Private, loopback and link-local addresses are not allowed');
  } else {
    if (hostname === 'localhost' || BLOCKED_SUFFIXES.some((s) => hostname.endsWith(s))) {
      throw new TargetBlockedError('Internal host names are not allowed');
    }
    if (!hostname.includes('.')) throw new TargetBlockedError('Single-label host names are not allowed');
  }
  return { url, hostname, port };
}

export type Resolver = (hostname: string) => Promise<string[]>;

const defaultResolver: Resolver = async (hostname) => {
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  return records.map((r) => r.address);
};

/**
 * Resolve a host name and require every address to be public. Returns the addresses so the
 * caller can connect to one of them directly. IP literals are checked without DNS.
 */
export async function assertPublicHost(hostname: string, resolve: Resolver = defaultResolver): Promise<string[]> {
  const bare = hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(bare)) {
    if (isBlockedIp(bare)) throw new TargetBlockedError('Private, loopback and link-local addresses are not allowed');
    return [bare];
  }
  let addresses: string[];
  try {
    addresses = await resolve(bare);
  } catch {
    throw new TargetBlockedError(`Could not resolve ${bare}`);
  }
  if (addresses.length === 0) throw new TargetBlockedError(`Could not resolve ${bare}`);
  const blocked = addresses.find(isBlockedIp);
  if (blocked) throw new TargetBlockedError(`${bare} resolves to a private or reserved address`);
  return addresses;
}

/** Full check for a run target: syntax, then DNS. */
export async function assertPublicTarget(raw: string, resolve?: Resolver): Promise<GuardedUrl & { addresses: string[] }> {
  const guarded = checkUrlSyntax(raw);
  const addresses = await assertPublicHost(guarded.hostname, resolve);
  return { ...guarded, addresses };
}
