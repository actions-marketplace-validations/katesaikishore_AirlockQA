import { describe, expect, it } from 'bun:test';
import {
  TargetBlockedError,
  assertPublicHost,
  assertPublicTarget,
  checkUrlSyntax,
  isAllowedPort,
  isBlockedIp,
} from '../cloud/shared/url-guard.js';

describe('isBlockedIp', () => {
  const blockedV4 = [
    '0.0.0.0', '10.1.2.3', '100.64.0.1', '127.0.0.1', '127.255.255.254', '169.254.169.254', '172.16.0.1',
    '172.31.255.255', '192.168.1.1', '198.18.0.5', '224.0.0.1', '240.0.0.1', '255.255.255.255', '192.0.2.10',
  ];
  for (const ip of blockedV4) it(`blocks ${ip}`, () => expect(isBlockedIp(ip)).toBe(true));

  const publicV4 = ['1.1.1.1', '8.8.8.8', '93.184.216.34', '172.32.0.1', '172.15.255.255', '100.63.255.255', '198.20.0.1'];
  for (const ip of publicV4) it(`allows ${ip}`, () => expect(isBlockedIp(ip)).toBe(false));

  const blockedV6 = [
    '::', '::1', 'fe80::1', 'fc00::1', 'fd12:3456::1', 'ff02::1', '2001:db8::1', 'fec0::1',
    '::ffff:127.0.0.1', '::ffff:10.0.0.1', '::ffff:7f00:1', '64:ff9b::7f00:1', '2002:7f00:1::1', '::ffff:169.254.169.254',
  ];
  for (const ip of blockedV6) it(`blocks ${ip}`, () => expect(isBlockedIp(ip)).toBe(true));

  const publicV6 = ['2606:4700:4700::1111', '2001:4860:4860::8888', '::ffff:8.8.8.8'];
  for (const ip of publicV6) it(`allows ${ip}`, () => expect(isBlockedIp(ip)).toBe(false));

  it('blocks input it cannot parse', () => expect(isBlockedIp('not-an-ip')).toBe(true));
});

describe('checkUrlSyntax', () => {
  const rejected = [
    'file:///etc/passwd', 'ftp://example.com/', 'gopher://example.com/', 'javascript:alert(1)', 'data:text/html,hi',
    'http://localhost/', 'http://LOCALHOST:3000/', 'http://app.localhost/', 'http://127.0.0.1/', 'http://[::1]/',
    'http://0x7f.1/', 'http://2130706433/', 'http://0177.0.0.1/', 'http://169.254.169.254/latest/meta-data/',
    'http://metadata.google.internal/', 'http://redis:6379/', 'http://app_server:8000/', 'http://10.0.0.5/',
    'http://user:pass@example.com/', 'http://example.com:22/', 'http://example.com:25/', 'http://printer.local/',
    'not a url', '', 'http://', 'http://[::ffff:127.0.0.1]/',
  ];
  for (const raw of rejected) it(`rejects ${JSON.stringify(raw)}`, () => expect(() => checkUrlSyntax(raw)).toThrow(TargetBlockedError));

  it('accepts public http and https targets', () => {
    expect(checkUrlSyntax('https://example.com/path?q=1').port).toBe(443);
    expect(checkUrlSyntax('http://example.com').port).toBe(80);
    expect(checkUrlSyntax('https://example.com:8443/').port).toBe(8443);
    expect(checkUrlSyntax('http://8.8.8.8/').hostname).toBe('8.8.8.8');
  });

  it('allows only 80, 443 and unprivileged ports', () => {
    expect(isAllowedPort(80)).toBe(true);
    expect(isAllowedPort(443)).toBe(true);
    expect(isAllowedPort(3000)).toBe(true);
    expect(isAllowedPort(22)).toBe(false);
    expect(isAllowedPort(1023)).toBe(false);
    expect(isAllowedPort(70000)).toBe(false);
  });
});

describe('assertPublicHost / assertPublicTarget', () => {
  it('rejects a host that resolves to a private address', async () => {
    await expect(assertPublicHost('evil.example.com', async () => ['10.0.0.8'])).rejects.toThrow(TargetBlockedError);
  });

  it('rejects when any resolved address is private (rebinding mix)', async () => {
    await expect(assertPublicHost('mix.example.com', async () => ['8.8.8.8', '127.0.0.1'])).rejects.toThrow(/private or reserved/);
  });

  it('rejects names that do not resolve', async () => {
    await expect(
      assertPublicHost('nope.example.com', async () => {
        throw new Error('ENOTFOUND');
      })
    ).rejects.toThrow(/Could not resolve/);
    await expect(assertPublicHost('empty.example.com', async () => [])).rejects.toThrow(TargetBlockedError);
  });

  it('returns the validated addresses for a public host', async () => {
    const result = await assertPublicTarget('https://ok.example.com/x', async () => ['93.184.216.34']);
    expect(result.addresses).toEqual(['93.184.216.34']);
    expect(result.port).toBe(443);
  });

  it('checks IP literals without DNS', async () => {
    await expect(assertPublicHost('127.0.0.1', async () => ['8.8.8.8'])).rejects.toThrow(TargetBlockedError);
    expect(await assertPublicHost('8.8.8.8', async () => [])).toEqual(['8.8.8.8']);
  });
});
