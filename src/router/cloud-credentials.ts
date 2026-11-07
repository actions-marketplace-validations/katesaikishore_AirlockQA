import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export const DEFAULT_CLOUD_URL = 'https://api.qbrin.cloud';
const KEY_PREFIX = 'air_live_';

export interface StoredCredentials {
  apiUrl: string;
  apiKey: string;
  /** Evidence signing key of the service, pinned when the user signed in (trust on first use). */
  evidenceKeyId?: string;
  evidencePublicKey?: string;
  savedAt: string;
}

type Env = Record<string, string | undefined>;

/** Directory for the credentials file. `AIRLOCK_CONFIG_DIR` overrides `~/.config/airlock`. */
export function configDirectory(env: Env = process.env): string {
  if (env.AIRLOCK_CONFIG_DIR) return path.resolve(env.AIRLOCK_CONFIG_DIR);
  const base = env.XDG_CONFIG_HOME ? path.resolve(env.XDG_CONFIG_HOME) : path.join(os.homedir(), '.config');
  return path.join(base, 'airlock');
}

export function credentialsPath(env: Env = process.env): string {
  return path.join(configDirectory(env), 'credentials.json');
}

export function loadCredentials(env: Env = process.env): StoredCredentials | null {
  const file = credentialsPath(env);
  let raw: string;
  try {
    if (fs.lstatSync(file).isSymbolicLink()) {
      throw new Error(`Credentials file ${file} is a symbolic link; refusing to read it. Remove it and run "airlock login".`);
    }
    raw = fs.readFileSync(file, 'utf8');
  } catch (error) {
    if (error instanceof Error && error.message.includes('symbolic link')) throw error;
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredCredentials>;
    if (typeof parsed.apiKey === 'string' && typeof parsed.apiUrl === 'string') return parsed as StoredCredentials;
  } catch {
    // fall through
  }
  throw new Error(`Credentials file ${file} is not valid. Run "airlock logout" and sign in again.`);
}

/** Write the credentials atomically with owner-only permissions. Returns the file path. */
export function saveCredentials(credentials: StoredCredentials, env: Env = process.env): string {
  const dir = configDirectory(env);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  try {
    fs.chmodSync(dir, 0o700);
  } catch {
    // Not fatal on filesystems without POSIX modes.
  }
  const file = credentialsPath(env);
  try {
    if (fs.lstatSync(file).isSymbolicLink()) throw new Error(`Refusing to overwrite ${file}: it is a symbolic link.`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Refusing')) throw error;
  }
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(credentials, null, 2) + '\n', { mode: 0o600, flag: 'w' });
  fs.renameSync(temporary, file);
  try {
    fs.chmodSync(file, 0o600);
  } catch {
    // Not fatal on filesystems without POSIX modes.
  }
  return file;
}

export function clearCredentials(env: Env = process.env): boolean {
  try {
    fs.unlinkSync(credentialsPath(env));
    return true;
  } catch {
    return false;
  }
}

export interface CloudAuth {
  apiUrl: string;
  apiKey: string;
  keySource: 'option' | 'env' | 'stored';
  stored: StoredCredentials | null;
}

/**
 * Work out which Cloud key and endpoint to use.
 * Key: explicit option, then AIRLOCK_API_KEY, then the key saved by `airlock login`.
 * URL: explicit option, then AIRLOCK_CLOUD_URL, then the saved URL (only when the saved key is used,
 * so a key from the environment is never sent to a host it was not meant for), then the default.
 */
export function resolveCloudAuth(
  options: { apiKey?: string; apiUrl?: string } = {},
  env: Env = process.env
): CloudAuth | null {
  const stored = loadCredentials(env);
  let apiKey: string | undefined;
  let keySource: CloudAuth['keySource'];
  if (options.apiKey?.trim()) {
    apiKey = options.apiKey.trim();
    keySource = 'option';
  } else if (env.AIRLOCK_API_KEY?.trim()) {
    apiKey = env.AIRLOCK_API_KEY.trim();
    keySource = 'env';
  } else if (stored?.apiKey) {
    apiKey = stored.apiKey;
    keySource = 'stored';
  } else {
    return null;
  }
  const requested = options.apiUrl?.trim() || env.AIRLOCK_CLOUD_URL?.trim();
  if (keySource === 'stored' && stored && requested && !sameEndpoint(requested, stored.apiUrl)) {
    // The saved key was issued by one deployment. Never send it to another host because an environment
    // variable or a flag says so.
    throw new Error(
      `The saved key belongs to ${stored.apiUrl} and will not be sent to ${requested}. ` +
        `Run "airlock login --api-url ${requested}" to sign in there, or remove the override.`
    );
  }
  const apiUrl = requested || (keySource === 'stored' ? stored?.apiUrl : undefined) || DEFAULT_CLOUD_URL;
  return { apiUrl, apiKey, keySource, stored };
}

function sameEndpoint(a: string, b: string): boolean {
  const normalize = (value: string) => {
    try {
      const url = new URL(value);
      return `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, '')}`.toLowerCase();
    } catch {
      return value.trim().toLowerCase();
    }
  };
  return normalize(a) === normalize(b);
}

export function looksLikeApiKey(value: string): boolean {
  return value.startsWith(KEY_PREFIX) && value.length >= KEY_PREFIX.length + 16 && /^[A-Za-z0-9_-]+$/.test(value);
}

/** Safe display form of a key: its prefix only. */
export function keyPrefix(key: string): string {
  return `${key.slice(0, 13)}...`;
}
