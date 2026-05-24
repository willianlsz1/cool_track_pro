import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { createAppV2MockSnapshot } from './appV2MockStore';
import { createAppV2ClientesWriteDataAdapter } from './appV2ClientesWriteDataAdapter';
import { createMemoryAppV2DataAdapter } from './memoryAppV2DataAdapter';

describe('createAppV2ClientesWriteDataAdapter', () => {
  it('delega saveClient para a porta local quando writer ou userId nao existem', async () => {
    const adapter = createAppV2ClientesWriteDataAdapter({
      basePort: createMemoryAppV2DataAdapter(createAppV2MockSnapshot({ clientes: [] })),
      userId: '',
      clientesWriter: vi.fn().mockRejectedValue(new Error('nao deveria chamar')),
    });

    const state = await adapter.saveClient({
      id: 'cliente-local-1',
      nome: 'Cliente local',
      mode: 'create',
    });

    expect(state.clientes).toContainEqual({
      id: 'cliente-local-1',
      nome: 'Cliente local',
    });
  });

  it('usa writer real opcional e retorna snapshot com UUID gerado pelo banco', async () => {
    const clientesWriter = vi.fn().mockResolvedValue({
      id: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
      nome: 'Cliente real',
      contato: '(31) 99999-0000',
    });
    const adapter = createAppV2ClientesWriteDataAdapter({
      basePort: createMemoryAppV2DataAdapter(createAppV2MockSnapshot({ clientes: [] })),
      userId: ' user-1 ',
      clientesWriter,
    });

    const state = await adapter.saveClient({
      id: 'cliente-temp-1',
      nome: ' Cliente real ',
      contato: ' (31) 99999-0000 ',
      mode: 'create',
    });

    expect(clientesWriter).toHaveBeenCalledWith({
      userId: 'user-1',
      draft: {
        id: 'cliente-temp-1',
        nome: ' Cliente real ',
        contato: ' (31) 99999-0000 ',
        mode: 'create',
      },
    });
    expect(state.clientes).toEqual([
      {
        id: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
        nome: 'Cliente real',
        contato: '(31) 99999-0000',
      },
    ]);
  });

  it('propaga erro de writer real sem fallback silencioso para escrita local', async () => {
    const adapter = createAppV2ClientesWriteDataAdapter({
      basePort: createMemoryAppV2DataAdapter(createAppV2MockSnapshot({ clientes: [] })),
      userId: 'user-1',
      clientesWriter: vi.fn().mockRejectedValue(new Error('RLS denied')),
    });

    await expect(
      adapter.saveClient({
        id: 'cliente-temp-1',
        nome: 'Cliente bloqueado',
        mode: 'create',
      }),
    ).rejects.toThrow('RLS denied');

    await expect(adapter.loadSnapshot()).resolves.toMatchObject({
      clientes: [],
    });
  });

  it('mantem exigencia de UUID real para edicao propagando erro do writer', async () => {
    const adapter = createAppV2ClientesWriteDataAdapter({
      basePort: createMemoryAppV2DataAdapter(createAppV2MockSnapshot()),
      userId: 'user-1',
      clientesWriter: vi
        .fn()
        .mockRejectedValue(new Error('Cliente real precisa de UUID valido para edicao.')),
    });

    await expect(
      adapter.saveClient({
        id: 'cliente-local-1',
        nome: 'Cliente local',
        mode: 'edit',
      }),
    ).rejects.toThrow('Cliente real precisa de UUID valido para edicao.');
  });

  it('nao importa Supabase, storage real, recurso comercial, PDF/share ou WhatsApp', () => {
    const source = readFileSync('src/app-v2/data/appV2ClientesWriteDataAdapter.ts', 'utf-8');

    expect(source).not.toContain('core/supabase');
    expect(source).not.toContain('@supabase');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain(['bill', 'ing'].join(''));
    expect(source).not.toContain('pdf');
    expect(source).not.toContain('whatsapp');
  });
});
