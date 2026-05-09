const SUPABASE_URL_ENV = 'VITE_SUPABASE_URL';
const SUPABASE_ANON_KEY_ENV = 'VITE_SUPABASE_ANON_KEY';

function getEnvOrThrow(name) {
  const value =
    name === SUPABASE_URL_ENV
      ? import.meta.env.VITE_SUPABASE_URL
      : import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `[Supabase] Missing required environment variable: ${name}. ` +
        `Ensure it is defined in your environment configuration.`,
    );
  }

  return value.trim();
}

function getUrlEnvOrThrow(name) {
  const value = getEnvOrThrow(name);

  try {
    new URL(value);
  } catch {
    throw new Error(`[Supabase] Invalid URL format for environment variable: ${name}.`);
  }

  return value.replace(/\/$/, '');
}

function decodeJwtPayload(token) {
  const parts = String(token || '').split('.');
  if (parts.length < 2 || !parts[1]) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function assertFrontendSupabaseAnonKey(key) {
  const payload = decodeJwtPayload(key);
  if (payload?.role === 'service_role') {
    throw new Error(
      '[Supabase] Refusing to initialize frontend client with a service_role key. ' +
        'Use VITE_SUPABASE_ANON_KEY with the public anon key only.',
    );
  }
}

export function getSupabaseBrowserConfig() {
  const url = getUrlEnvOrThrow(SUPABASE_URL_ENV);
  const anonKey = getEnvOrThrow(SUPABASE_ANON_KEY_ENV);
  assertFrontendSupabaseAnonKey(anonKey);
  return { url, anonKey };
}
