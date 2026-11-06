import * as crypto from 'node:crypto';

/**
 * Compute standard SHA-256 hash in hex format
 */
export function sha256(data: string | Buffer | object): string {
  const content = typeof data === 'string'
    ? data
    : Buffer.isBuffer(data)
      ? data
      : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generate a cryptographically secure phantom token
 */
export function generatePhantomToken(prefix = 'ph_sec'): string {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${randomBytes}`;
}

/**
 * Sign payload using HMAC-SHA256
 */
export function signHmac(data: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(data).digest('hex');
}

/**
 * Verify HMAC-SHA256 signature
 */
export function verifyHmac(data: string, signature: string, secretKey: string): boolean {
  const expected = signHmac(data, secretKey);
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Generate a deterministic ID for steps or events
 */
export function deterministicId(prefix: string, seed: string | number): string {
  const hash = crypto.createHash('sha256').update(String(seed)).digest('hex').substring(0, 12);
  return `${prefix}_${hash}`;
}

/**
 * Redact sensitive substrings from text
 */
export function redactSecrets(text: string, secrets: string[], mask = '[REDACTED_BY_AIRLOCK]'): string {
  let result = text;
  for (const secret of secrets) {
    if (secret && secret.length >= 4) {
      result = result.split(secret).join(mask);
    }
  }
  return result;
}

