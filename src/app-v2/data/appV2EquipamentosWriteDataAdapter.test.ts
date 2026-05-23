import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { createAppV2MockSnapshot } from './appV2MockStore';
import { createAppV2EquipamentosWriteDataAdapter } from './appV2EquipamentosWriteDataAdapter';
import { createMemoryAppV2DataAdapter } from './memoryAppV2DataAdapter';

describe('createAppV2EquipamentosWriteDataAdapter', () => {
  it('delega saveEquipment para a porta local quando writer ou userId nao existem', async () => {
    const adapter = createAppV2EquipamentosWriteDataAdapter({
      basePort: createMemoryAppV2DataAdapter(createAppV2MockSnapshot({ equipamentos: [] })),
      userId: '',
      equipamentosWriter: vi.fn().mockRejectedValue(new Error('nao deveria chamar')),
    });

    const state = await adapter.saveEquipment({
      id: 'equip-local-1',
      nome: 'Equipamento local',
      local: 'Sala',
      mode: 'create',
    });

    expect(state.equipamentos).toContainEqual({
      id: 'equip-local-1',
      nome: 'Equipamento local',
      local: 'Sala',
      status: 'ok',
    });
  });

  it('usa writer real opcional e retorna snapshot com equipamento retornado pelo banco', async () => {
    const equipamentosWriter = vi.fn().mockResolvedValue({
      id: 'equip-real-1',
      nome: 'Equipamento real',
      local: 'Sala tecnica',
      status: 'warn',
      clienteId: '11111111-1111-4111-8111-111111111111',
    });
    const adapter = createAppV2EquipamentosWriteDataAdapter({
      basePort: createMemoryAppV2DataAdapter(createAppV2MockSnapshot({ equipamentos: [] })),
      userId: ' user-1 ',
      equipamentosWriter,
    });

    const state = await adapter.saveEquipment({
      id: 'equip-real-1',
      nome: ' Equipamento real ',
      local: ' Sala tecnica ',
      mode: 'create',
    });

    expect(equipamentosWriter).toHaveBeenCalledWith({
      userId: 'user-1',
      draft: {
        id: 'equip-real-1',
        nome: ' Equipamento real ',
        local: ' Sala tecnica ',
        mode: 'create',
      },
    });
    expect(state.equipamentos).toEqual([
      {
        id: 'equip-real-1',
        nome: 'Equipamento real',
        local: 'Sala tecnica',
        status: 'warn',
        clienteId: '11111111-1111-4111-8111-111111111111',
      },
    ]);
  });

  it('atualiza equipamento existente no snapshot sem duplicar', async () => {
    const equipamentosWriter = vi.fn().mockResolvedValue({
      id: 'equip-real-1',
      nome: 'Equipamento editado',
      local: 'Sala editada',
      status: 'danger',
    });
    const adapter = createAppV2EquipamentosWriteDataAdapter({
      basePort: createMemoryAppV2DataAdapter(
        createAppV2MockSnapshot({
          equipamentos: [
            {
              id: 'equip-real-1',
              nome: 'Equipamento antigo',
              local: 'Sala',
              status: 'ok',
            },
          ],
        }),
      ),
      userId: 'user-1',
      equipamentosWriter,
    });

    const state = await adapter.saveEquipment({
      id: 'equip-real-1',
      nome: 'Equipamento editado',
      local: 'Sala editada',
      mode: 'edit',
    });

    expect(state.equipamentos).toEqual([
      {
        id: 'equip-real-1',
        nome: 'Equipamento editado',
        local: 'Sala editada',
        status: 'danger',
      },
    ]);
  });

  it('propaga erro de writer real sem fallback silencioso para escrita local', async () => {
    const adapter = createAppV2EquipamentosWriteDataAdapter({
      basePort: createMemoryAppV2DataAdapter(createAppV2MockSnapshot({ equipamentos: [] })),
      userId: 'user-1',
      equipamentosWriter: vi.fn().mockRejectedValue(new Error('RLS denied')),
    });

    await expect(
      adapter.saveEquipment({
        id: 'equip-real-1',
        nome: 'Equipamento bloqueado',
        local: 'Sala',
        mode: 'create',
      }),
    ).rejects.toThrow('RLS denied');

    await expect(adapter.loadSnapshot()).resolves.toMatchObject({
      equipamentos: [],
    });
  });

  it('nao importa Supabase, storage real, billing, PDF/share ou WhatsApp', () => {
    const source = readFileSync('src/app-v2/data/appV2EquipamentosWriteDataAdapter.ts', 'utf-8');

    expect(source).not.toContain('core/supabase');
    expect(source).not.toContain('@supabase');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('billing');
    expect(source).not.toContain('pdf');
    expect(source).not.toContain('whatsapp');
  });
});
