import { describe, expect, it, vi } from 'vitest';

import { createMemoryAppV2DataAdapter } from './memoryAppV2DataAdapter';
import { createAppV2MockSnapshot } from './appV2MockStore';
import { createAppV2ClientesReadOnlyDataAdapter } from './appV2ClientesReadOnlyDataAdapter';

describe('createAppV2ClientesReadOnlyDataAdapter', () => {
  it('substitui apenas clientes no loadSnapshot quando reader e userId existem', async () => {
    const baseSnapshot = createAppV2MockSnapshot();
    const adapter = createAppV2ClientesReadOnlyDataAdapter({
      basePort: createMemoryAppV2DataAdapter(baseSnapshot),
      userId: 'user-1',
      clientesReader: vi.fn().mockResolvedValue([
        {
          id: 'cliente-real-1',
          nome: 'Cliente real',
          contato: '(31) 99999-0000',
        },
      ]),
    });

    await expect(adapter.loadSnapshot()).resolves.toMatchObject({
      clientes: [
        {
          id: 'cliente-real-1',
          nome: 'Cliente real',
          contato: '(31) 99999-0000',
        },
      ],
      equipamentos: baseSnapshot.equipamentos,
      setores: baseSnapshot.setores,
      registros: baseSnapshot.registros,
    });
  });

  it('mantem snapshot local quando userId, reader ou leitura real nao estiverem disponiveis', async () => {
    const baseSnapshot = createAppV2MockSnapshot();

    await expect(
      createAppV2ClientesReadOnlyDataAdapter({
        basePort: createMemoryAppV2DataAdapter(baseSnapshot),
        userId: '',
        clientesReader: vi.fn().mockResolvedValue([{ id: 'cliente-real-1', nome: 'Cliente real' }]),
      }).loadSnapshot(),
    ).resolves.toMatchObject({
      clientes: baseSnapshot.clientes,
    });

    await expect(
      createAppV2ClientesReadOnlyDataAdapter({
        basePort: createMemoryAppV2DataAdapter(baseSnapshot),
        userId: 'user-1',
        clientesReader: vi.fn().mockRejectedValue(new Error('RLS denied')),
      }).loadSnapshot(),
    ).resolves.toMatchObject({
      clientes: baseSnapshot.clientes,
    });
  });

  it('delega escritas para a porta base sem tentar escrita real', async () => {
    const baseSnapshot = createAppV2MockSnapshot();
    const clientesReader = vi
      .fn()
      .mockResolvedValue([{ id: 'cliente-real-1', nome: 'Cliente real' }]);
    const adapter = createAppV2ClientesReadOnlyDataAdapter({
      basePort: createMemoryAppV2DataAdapter(baseSnapshot),
      userId: 'user-1',
      clientesReader,
    });

    const nextState = await adapter.saveClient({
      id: 'cliente-local-1',
      nome: 'Cliente local',
      mode: 'create',
    });

    expect(nextState.clientes).toContainEqual(
      expect.objectContaining({
        id: 'cliente-local-1',
        nome: 'Cliente local',
      }),
    );
    expect(clientesReader).not.toHaveBeenCalled();
  });
});
