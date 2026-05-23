import { describe, expect, it, vi } from 'vitest';

import { createAppV2MockSnapshot } from './appV2MockStore';
import { createAppV2EquipamentosByClienteReadOnlyDataAdapter } from './appV2EquipamentosByClienteReadOnlyDataAdapter';
import { createMemoryAppV2DataAdapter } from './memoryAppV2DataAdapter';

describe('createAppV2EquipamentosByClienteReadOnlyDataAdapter', () => {
  it('substitui apenas equipamentos do cliente real informado no loadSnapshot', async () => {
    const baseSnapshot = createAppV2MockSnapshot({
      equipamentos: [
        {
          id: 'eq-local-real-client',
          nome: 'Local antigo',
          local: 'Recepcao',
          status: 'ok',
          clienteId: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
        },
        {
          id: 'eq-local-other-client',
          nome: 'Outro cliente',
          local: 'Estoque',
          status: 'warn',
          clienteId: 'cliente-1',
        },
      ],
    });
    const equipamentosReader = vi.fn().mockResolvedValue([
      {
        id: 'eq-real-1',
        nome: 'Split real',
        local: 'Recepcao',
        status: 'warn',
        clienteId: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
      },
    ]);
    const adapter = createAppV2EquipamentosByClienteReadOnlyDataAdapter({
      basePort: createMemoryAppV2DataAdapter(baseSnapshot),
      userId: ' user-1 ',
      clienteId: ' 8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0 ',
      equipamentosReader,
    });

    const state = await adapter.loadSnapshot();

    expect(equipamentosReader).toHaveBeenCalledWith({
      userId: 'user-1',
      clienteId: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
    });
    expect(state.equipamentos).toEqual([
      {
        id: 'eq-local-other-client',
        nome: 'Outro cliente',
        local: 'Estoque',
        status: 'warn',
        clienteId: 'cliente-1',
      },
      {
        id: 'eq-real-1',
        nome: 'Split real',
        local: 'Recepcao',
        status: 'warn',
        clienteId: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
      },
    ]);
  });

  it('mantem snapshot local quando userId, clienteId, reader ou leitura real falham', async () => {
    const baseSnapshot = createAppV2MockSnapshot();

    await expect(
      createAppV2EquipamentosByClienteReadOnlyDataAdapter({
        basePort: createMemoryAppV2DataAdapter(baseSnapshot),
        userId: '',
        clienteId: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
        equipamentosReader: vi.fn().mockResolvedValue([]),
      }).loadSnapshot(),
    ).resolves.toMatchObject({
      equipamentos: baseSnapshot.equipamentos,
    });

    await expect(
      createAppV2EquipamentosByClienteReadOnlyDataAdapter({
        basePort: createMemoryAppV2DataAdapter(baseSnapshot),
        userId: 'user-1',
        clienteId: 'cliente-1',
        equipamentosReader: vi.fn().mockResolvedValue([]),
      }).loadSnapshot(),
    ).resolves.toMatchObject({
      equipamentos: baseSnapshot.equipamentos,
    });

    await expect(
      createAppV2EquipamentosByClienteReadOnlyDataAdapter({
        basePort: createMemoryAppV2DataAdapter(baseSnapshot),
        userId: 'user-1',
        clienteId: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
        equipamentosReader: vi.fn().mockRejectedValue(new Error('RLS denied')),
      }).loadSnapshot(),
    ).resolves.toMatchObject({
      equipamentos: baseSnapshot.equipamentos,
    });
  });

  it('delega escritas para a porta base sem tentar escrita real', async () => {
    const equipamentosReader = vi.fn().mockResolvedValue([]);
    const adapter = createAppV2EquipamentosByClienteReadOnlyDataAdapter({
      basePort: createMemoryAppV2DataAdapter(createAppV2MockSnapshot({ clientes: [] })),
      userId: 'user-1',
      clienteId: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
      equipamentosReader,
    });

    const state = await adapter.saveEquipment({
      id: 'eq-local-1',
      nome: 'Local',
      local: 'Sala',
      status: 'ok',
      clienteId: 'cliente-1',
    });

    expect(equipamentosReader).not.toHaveBeenCalled();
    expect(state.equipamentos).toContainEqual(
      expect.objectContaining({
        id: 'eq-local-1',
        nome: 'Local',
      }),
    );
  });
});
