import { afterEach, describe, expect, it, vi } from 'vitest';

function base64UrlJson(value) {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function jwtWithPayload(payload) {
  return `${base64UrlJson({ alg: 'HS256', typ: 'JWT' })}.${base64UrlJson(payload)}.signature`;
}

async function loadConfig() {
  vi.resetModules();
  return import('../core/supabaseConfig.js');
}

describe('supabase frontend env config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses VITE_SUPABASE_ANON_KEY as the explicit frontend key contract', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-public-key');
    vi.stubEnv('VITE_SUPABASE_KEY', 'legacy-ambiguous-key');

    const { getSupabaseBrowserConfig } = await loadConfig();

    expect(getSupabaseBrowserConfig()).toEqual({
      url: 'https://project.supabase.co',
      anonKey: 'anon-public-key',
    });
  });

  it('does not accept VITE_SUPABASE_KEY as a fallback', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubEnv('VITE_SUPABASE_KEY', 'legacy-ambiguous-key');

    const { getSupabaseBrowserConfig } = await loadConfig();

    expect(() => getSupabaseBrowserConfig()).toThrow('VITE_SUPABASE_ANON_KEY');
  });

  it('rejects service_role JWTs without exposing the key value', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://project.supabase.co');
    const serviceRoleJwt = jwtWithPayload({ role: 'service_role', exp: 9999999999 });
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', serviceRoleJwt);

    const { getSupabaseBrowserConfig } = await loadConfig();

    expect(() => getSupabaseBrowserConfig()).toThrow(/service_role/i);
    expect(() => getSupabaseBrowserConfig()).not.toThrow(serviceRoleJwt);
  });

  it('accepts non-JWT anon or mock keys used by local tests', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'placeholder-key-for-tests');

    const { getSupabaseBrowserConfig } = await loadConfig();

    expect(getSupabaseBrowserConfig().anonKey).toBe('placeholder-key-for-tests');
  });
});
