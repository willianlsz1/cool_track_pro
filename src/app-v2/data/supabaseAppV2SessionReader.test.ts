import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { createSupabaseAppV2SessionReader } from './supabaseAppV2SessionReader';

describe('createSupabaseAppV2SessionReader', () => {
  it('retorna usuario autenticado normalizado a partir do Supabase', async () => {
    const getUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: ' user-real-1 ',
          email: 'tecnico@cooltrack.test',
        },
      },
      error: null,
    });
    const sessionReader = createSupabaseAppV2SessionReader({ auth: { getUser } });

    await expect(sessionReader.getCurrentUser()).resolves.toEqual({
      id: 'user-real-1',
      email: 'tecnico@cooltrack.test',
    });
    expect(getUser).toHaveBeenCalledTimes(1);
  });

  it('retorna null quando Supabase nao tem usuario valido', async () => {
    const sessionReader = createSupabaseAppV2SessionReader({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: '   ', email: 'sem-id@cooltrack.test' } },
          error: null,
        }),
      },
    });

    await expect(sessionReader.getCurrentUser()).resolves.toBeNull();
  });

  it('retorna null quando Supabase informa erro de auth', async () => {
    const sessionReader = createSupabaseAppV2SessionReader({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-real-1' } },
          error: { message: 'JWT expired' },
        }),
      },
    });

    await expect(sessionReader.getCurrentUser()).resolves.toBeNull();
  });

  it('retorna null quando leitura de auth rejeita', async () => {
    const sessionReader = createSupabaseAppV2SessionReader({
      auth: {
        getUser: vi.fn().mockRejectedValue(new Error('auth offline')),
      },
    });

    await expect(sessionReader.getCurrentUser()).resolves.toBeNull();
  });

  it('mantem adapter sem importar auth, Supabase ou storage diretamente', () => {
    const source = readFileSync(resolve(__dirname, 'supabaseAppV2SessionReader.ts'), 'utf8');

    expect(source).not.toContain('core/auth');
    expect(source).not.toContain('core/supabase');
    expect(source).not.toContain('@supabase');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
  });
});
