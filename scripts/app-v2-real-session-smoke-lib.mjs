export function parseDotEnv(content) {
  const values = {};

  for (const rawLine of String(content || '').split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripQuotes(line.slice(separatorIndex + 1).trim());

    values[key] = value;
  }

  return values;
}

export function resolveCpYConfig({ env = {}, dotEnv = {} } = {}) {
  return {
    email: firstValue(env.APP_V2_TEST_EMAIL, env.TEST_USER_EMAIL),
    password: firstValue(env.APP_V2_TEST_PASSWORD, env.TEST_USER_PASSWORD),
    supabaseUrl: firstValue(env.VITE_SUPABASE_URL, dotEnv.VITE_SUPABASE_URL),
    supabaseAnonKey: firstValue(env.VITE_SUPABASE_ANON_KEY, dotEnv.VITE_SUPABASE_ANON_KEY),
    baseUrl: firstValue(env.APP_V2_BASE_URL, 'http://127.0.0.1:5173'),
  };
}

export function missingConfigKeys(config) {
  const missing = [];

  if (!config.email) {
    missing.push('APP_V2_TEST_EMAIL or TEST_USER_EMAIL');
  }

  if (!config.password) {
    missing.push('APP_V2_TEST_PASSWORD or TEST_USER_PASSWORD');
  }

  if (!config.supabaseUrl) {
    missing.push('VITE_SUPABASE_URL');
  }

  if (!config.supabaseAnonKey) {
    missing.push('VITE_SUPABASE_ANON_KEY');
  }

  return missing;
}

export function storageKeyForSupabaseUrl(supabaseUrl) {
  try {
    const host = new URL(supabaseUrl).hostname;
    return `sb-${host.split('.')[0]}-auth-token`;
  } catch {
    return 'sb-127-auth-token';
  }
}

function firstValue(...values) {
  for (const value of values) {
    const normalized = String(value || '').trim();

    if (normalized) {
      return normalized;
    }
  }

  return '';
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
