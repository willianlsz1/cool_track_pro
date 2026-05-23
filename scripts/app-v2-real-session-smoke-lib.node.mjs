import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  missingConfigKeys,
  parseDotEnv,
  resolveCpYConfig,
  storageKeyForSupabaseUrl,
} from './app-v2-real-session-smoke-lib.mjs';

describe('app-v2 CP-Y real session smoke config', () => {
  it('parses simple dotenv files without exposing comments or blank lines', () => {
    assert.deepEqual(
      parseDotEnv(`
        # local Supabase
        VITE_SUPABASE_URL=https://example.supabase.co

        VITE_SUPABASE_ANON_KEY="anon-key"
      `),
      {
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'anon-key',
      },
    );
  });

  it('prefers explicit APP_V2 credentials and falls back to TEST_USER credentials', () => {
    const config = resolveCpYConfig({
      env: {
        TEST_USER_EMAIL: 'fallback@example.com',
        TEST_USER_PASSWORD: 'fallback-secret',
        APP_V2_TEST_EMAIL: 'appv2@example.com',
        APP_V2_TEST_PASSWORD: 'appv2-secret',
      },
      dotEnv: {
        VITE_SUPABASE_URL: 'https://project.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'anon-key',
      },
    });

    assert.equal(config.email, 'appv2@example.com');
    assert.equal(config.password, 'appv2-secret');
    assert.equal(config.supabaseUrl, 'https://project.supabase.co');
    assert.equal(config.supabaseAnonKey, 'anon-key');
    assert.equal(config.baseUrl, 'http://127.0.0.1:5173');
  });

  it('reports missing required values with public key names only', () => {
    assert.deepEqual(
      missingConfigKeys(
        resolveCpYConfig({
          env: {},
          dotEnv: { VITE_SUPABASE_URL: 'https://project.supabase.co' },
        }),
      ),
      [
        'APP_V2_TEST_EMAIL or TEST_USER_EMAIL',
        'APP_V2_TEST_PASSWORD or TEST_USER_PASSWORD',
        'VITE_SUPABASE_ANON_KEY',
      ],
    );
  });

  it('derives the Supabase browser storage key from the project host', () => {
    assert.equal(
      storageKeyForSupabaseUrl('https://lrtfpeqdpzvbdrgfvasv.supabase.co'),
      'sb-lrtfpeqdpzvbdrgfvasv-auth-token',
    );
    assert.equal(storageKeyForSupabaseUrl('http://127.0.0.1:54321'), 'sb-127-auth-token');
  });
});
