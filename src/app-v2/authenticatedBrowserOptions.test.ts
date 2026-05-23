import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { createAuthenticatedAppV2BrowserOptions } from './authenticatedBrowserOptions';
import type { AppV2AuthenticatedBrowserClient } from './authenticatedBrowserOptions';

describe('createAuthenticatedAppV2BrowserOptions', () => {
  it('compoe session reader e clientesReader com client Supabase injetado', async () => {
    const getUser = vi.fn().mockResolvedValue({
      data: { user: { id: ' user-real-1 ', email: 'tecnico@cooltrack.test' } },
      error: null,
    });
    const eq = vi.fn().mockResolvedValue({
      data: [{ id: 'cliente-real-1', nome: 'Cliente Real' }],
      error: null,
    });
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    const options = createAuthenticatedAppV2BrowserOptions(
      asAppV2AuthenticatedBrowserClient({
        auth: { getUser },
        from,
      }),
    );

    await expect(options.sessionReader.getCurrentUser()).resolves.toEqual({
      id: 'user-real-1',
      email: 'tecnico@cooltrack.test',
    });
    await expect(options.clientesReader?.('user-real-1')).resolves.toEqual([
      { id: 'cliente-real-1', nome: 'Cliente Real' },
    ]);

    expect(from).toHaveBeenCalledWith('clientes');
    expect(eq).toHaveBeenCalledWith('user_id', 'user-real-1');
  });

  it('compoe clientesWriter com client Supabase injetado', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: '11111111-1111-4111-8111-111111111111',
        nome: 'Cliente Real',
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ insert }));
    const options = createAuthenticatedAppV2BrowserOptions(
      asAppV2AuthenticatedBrowserClient({
        auth: { getUser: vi.fn() },
        from,
      }),
    );

    await expect(
      options.clientesWriter?.({
        userId: '22222222-2222-4222-8222-222222222222',
        draft: {
          id: 'cliente-local',
          mode: 'create',
          nome: ' Cliente Real ',
        },
      }),
    ).resolves.toMatchObject({
      id: '11111111-1111-4111-8111-111111111111',
      nome: 'Cliente Real',
    });

    expect(from).toHaveBeenCalledWith('clientes');
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: '22222222-2222-4222-8222-222222222222',
        nome: 'Cliente Real',
      }),
    );
  });

  it('compoe equipamentosWriter com client Supabase injetado', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: 'equip-real-1',
        nome: 'Split recepcao',
        local: 'Recepcao',
        status: 'ok',
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ insert }));
    const options = createAuthenticatedAppV2BrowserOptions(
      asAppV2AuthenticatedBrowserClient({
        auth: { getUser: vi.fn() },
        from,
      }),
    );

    await expect(
      options.equipamentosWriter?.({
        userId: '22222222-2222-4222-8222-222222222222',
        draft: {
          id: ' equip-real-1 ',
          mode: 'create',
          nome: ' Split recepcao ',
          local: ' Recepcao ',
        },
      }),
    ).resolves.toMatchObject({
      id: 'equip-real-1',
      nome: 'Split recepcao',
      local: 'Recepcao',
    });

    expect(from).toHaveBeenCalledWith('equipamentos');
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'equip-real-1',
        user_id: '22222222-2222-4222-8222-222222222222',
        nome: 'Split recepcao',
        local: 'Recepcao',
      }),
    );
  });

  it('mantem factory sem importar auth ou storage diretamente', () => {
    const source = readFileSync(resolve(__dirname, 'authenticatedBrowserOptions.ts'), 'utf8');

    expect(source).not.toContain('core/auth');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
  });
});

function asAppV2AuthenticatedBrowserClient(value: unknown): AppV2AuthenticatedBrowserClient {
  return value as AppV2AuthenticatedBrowserClient;
}
