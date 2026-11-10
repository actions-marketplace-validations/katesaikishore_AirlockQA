import * as crypto from 'node:crypto';

/**
 * Canonical JSON serialisation: object keys are sorted (by UTF-16 code unit order)
 * at every nesting depth, with no whitespace. Used for every hash and signature so
 * that nested fields are always covered and key order never changes a digest.
 *
 * Follows JSON semantics: `toJSON()` is honoured, `undefined`/function/symbol object
 * members are dropped and become `null` inside arrays. Non-finite numbers and
 * BigInts are rejected because they have no stable JSON form.
 */
export function canonicalJson(value: unknown): string {
  const out = serialise(value, new Set());
  if (out === undefined) {
    throw new TypeError('canonicalJson: value has no JSON representation');
  }
  return out;
}

function serialise(value: unknown, seen: Set<object>): string | undefined {
  if (value !== null && typeof value === 'object' && typeof (value as { toJSON?: unknown }).toJSON === 'function') {
    value = (value as { toJSON: () => unknown }).toJSON();
  }
  if (value === null) return 'null';
  switch (typeof value) {
    case 'string':
    case 'boolean':
      return JSON.stringify(value);
    case 'number':
      if (!Number.isFinite(value)) throw new TypeError(`canonicalJson: non-finite number ${value}`);
      return JSON.stringify(value);
    case 'bigint':
      throw new TypeError('canonicalJson: BigInt is not supported');
    case 'undefined':
    case 'function':
    case 'symbol':
      return undefined;
  }
  const obj = value as object;
  if (seen.has(obj)) throw new TypeError('canonicalJson: circular reference');
  seen.add(obj);
  try {
    if (Array.isArray(obj)) {
      return `[${obj.map((v) => serialise(v, seen) ?? 'null').join(',')}]`;
    }
    const parts: string[] = [];
    for (const key of Object.keys(obj).sort()) {
      const v = serialise((obj as Record<string, unknown>)[key], seen);
      if (v !== undefined) parts.push(`${JSON.stringify(key)}:${v}`);
    }
    return `{${parts.join(',')}}`;
  } finally {
    seen.delete(obj);
  }
}

/**
 * Compute standard SHA-256 hash in hex format. Objects are hashed via canonicalJson.
 */
export function sha256(data: string | Buffer | object): string {
  const content = typeof data === 'string'
    ? data
    : Buffer.isBuffer(data)
      ? data
      : canonicalJson(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/** SHA-256 of raw bytes, returned as a Buffer. */
export function sha256Bytes(...parts: Buffer[]): Buffer {
  const h = crypto.createHash('sha256');
  for (const p of parts) h.update(p);
  return h.digest();
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

const ED25519_PKCS8_PREFIX = Buffer.from('302e020100300506032b657004220420', 'hex');

/**
 * Load an Ed25519 private key. Accepts a PKCS#8 PEM private key, or any other secret
 * string, from which a key is derived deterministically (seed = SHA-256(secret)).
 */
export function loadEd25519PrivateKey(keyMaterial: string): crypto.KeyObject {
  if (keyMaterial.includes('-----BEGIN')) {
    const key = crypto.createPrivateKey(keyMaterial);
    if (key.asymmetricKeyType !== 'ed25519') {
      throw new Error(`Expected an Ed25519 private key, got ${key.asymmetricKeyType}`);
    }
    return key;
  }
  const seed = crypto.createHash('sha256').update(keyMaterial).digest();
  return crypto.createPrivateKey({
    key: Buffer.concat([ED25519_PKCS8_PREFIX, seed]),
    format: 'der',
    type: 'pkcs8',
  });
}

/** Public key (SPKI PEM) for an Ed25519 private key or secret, or pass-through for a public PEM. */
export function ed25519PublicKeyPem(keyMaterial: string): string {
  if (keyMaterial.includes('BEGIN PUBLIC KEY')) {
    return crypto.createPublicKey(keyMaterial).export({ type: 'spki', format: 'pem' }).toString();
  }
  return crypto.createPublicKey(loadEd25519PrivateKey(keyMaterial)).export({ type: 'spki', format: 'pem' }).toString();
}

/** Short stable identifier for a public key: sha256 of its DER encoding, first 16 hex chars. */
export function ed25519KeyId(publicKeyPem: string): string {
  const der = crypto.createPublicKey(publicKeyPem).export({ type: 'spki', format: 'der' });
  return `ed25519:${crypto.createHash('sha256').update(der).digest('hex').substring(0, 16)}`;
}

export function signEd25519(data: string, keyMaterial: string): string {
  return crypto.sign(null, Buffer.from(data, 'utf8'), loadEd25519PrivateKey(keyMaterial)).toString('base64');
}

export function verifyEd25519(data: string, signature: string, publicKeyPem: string): boolean {
  try {
    const key = crypto.createPublicKey(publicKeyPem);
    if (key.asymmetricKeyType !== 'ed25519') return false;
    return crypto.verify(null, Buffer.from(data, 'utf8'), key, Buffer.from(signature, 'base64'));
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
export function redactSecrets(text: string, secrets: string[], mask = '[REDACTED_BY_QAFIND]'): string {
  let result = text;
  for (const secret of secrets) {
    if (secret && secret.length >= 4) {
      result = result.split(secret).join(mask);
    }
  }
  return result;
}

