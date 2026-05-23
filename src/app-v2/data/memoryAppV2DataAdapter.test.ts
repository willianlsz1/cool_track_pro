import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { saveEquipment } from '../equipment/equipmentActions';
import { createPreServiceQuoteDraft, startServiceFromEquipment } from './appV2Actions';
import { createAppV2MockSnapshot } from './appV2MockStore';
import { createMemoryAppV2DataAdapter } from './memoryAppV2DataAdapter';

describe('createMemoryAppV2DataAdapter', () => {
  it('loads a cloned snapshot so callers cannot mutate adapter state directly', async () => {
    const adapter = createMemoryAppV2DataAdapter(
      createAppV2MockSnapshot({
        equipamentos: [{ id: 'eq-1', nome: 'Split', local: 'Recepcao', status: 'ok' }],
      }),
    );

    const first = await adapter.loadSnapshot();
    first.equipamentos[0].nome = 'Mutado fora do adapter';

    const second = await adapter.loadSnapshot();

    expect(second.equipamentos[0].nome).toBe('Split');
  });

  it('saves equipment using the same pure action behavior as the current app-v2 flow', async () => {
    const state = createAppV2MockSnapshot({ equipamentos: [] });
    const adapter = createMemoryAppV2DataAdapter(state);
    const draft = {
      id: 'eq-local-1',
      nome: 'Camara fria',
      local: 'Estoque',
      status: 'warn' as const,
    };

    const fromAdapter = await adapter.saveEquipment(draft);
    const fromAction = saveEquipment(state, draft);

    expect(fromAdapter.equipamentos).toEqual(fromAction.equipamentos);
  });

  it('creates pre-service quote drafts through the current pure action', async () => {
    const state = createAppV2MockSnapshot();
    const adapter = createMemoryAppV2DataAdapter(state);
    const input = {
      id: 'orcamento-local-test',
      equipmentId: 'eq-1',
      templateId: 'instalacao-split',
    };

    const fromAdapter = await adapter.createPreServiceQuote(input);
    const fromAction = createPreServiceQuoteDraft(state, input);

    expect(fromAdapter.orcamentos[0]).toEqual(fromAction.orcamentos[0]);
  });

  it('starts service registration through the current pure action', async () => {
    const state = createAppV2MockSnapshot();
    const adapter = createMemoryAppV2DataAdapter(state);

    const fromAdapter = await adapter.startServiceFromEquipment('eq-1');
    const fromAction = startServiceFromEquipment(state, 'eq-1');

    expect(fromAdapter.serviceDraft).toEqual(fromAction.serviceDraft);
  });

  it('does not introduce real persistence or billing integration terms', () => {
    const source = readFileSync('src/app-v2/data/memoryAppV2DataAdapter.ts', 'utf-8');

    expect(source).not.toContain('supabase');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('billing');
  });
});
