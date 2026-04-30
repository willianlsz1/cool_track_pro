import { describe, expect, it } from 'vitest';
import {
  EQUIPAMENTOS_ACTIONS,
  EQUIPAMENTOS_PUBLIC_CLASSES,
  EQUIPAMENTOS_PUBLIC_IDS,
  EQUIPAMENTOS_QUICK_FILTERS,
} from '../ui/viewModels/equipamentosContracts.js';
import { buildEquipamentosViewModel } from '../ui/viewModels/equipamentosViewModel.js';

function buildState() {
  return {
    equipamentos: [
      {
        id: 'eq-ok',
        nome: 'Split Recepcao',
        local: 'Recepcao',
        tag: 'SP-01',
        tipo: 'Split Hi-Wall',
        fluido: 'R410A',
        status: 'ok',
        criticidade: 'media',
        setorId: 'setor-1',
        clienteId: 'cliente-1',
      },
      {
        id: 'eq-warn',
        nome: 'Cassete Cozinha',
        local: 'Cozinha',
        tag: 'CZ-02',
        tipo: 'Split Cassette',
        status: 'warn',
        criticidade: 'alta',
        setorId: '',
        clienteId: 'cliente-1',
      },
      {
        id: 'eq-danger',
        nome: 'Chiller Central',
        local: 'Casa de maquinas',
        tag: 'CH-01',
        tipo: 'Chiller',
        status: 'danger',
        criticidade: 'urgente',
        setorId: 'setor-2',
        clienteId: 'cliente-2',
      },
    ],
    clientes: [
      { id: 'cliente-1', nome: 'Alpha Mercado' },
      { id: 'cliente-2', nome: 'Beta Hospital' },
    ],
    setores: [
      { id: 'setor-1', nome: 'Area tecnica', clienteId: 'cliente-1' },
      { id: 'setor-2', nome: 'Central', clienteId: 'cliente-2' },
      { id: 'setor-orfao', nome: 'Legado' },
    ],
  };
}

const evaluators = {
  getActionPriority: (eq) => ({
    actionPriorityScore: eq.id === 'eq-danger' ? 90 : eq.id === 'eq-warn' ? 40 : 10,
  }),
  getPriority: (eq) => ({
    priorityLevel: eq.id === 'eq-warn' || eq.id === 'eq-danger' ? 3 : 1,
  }),
  getRisk: (eq) => ({ score: eq.id === 'eq-danger' ? 95 : eq.id === 'eq-warn' ? 70 : 15 }),
  isFullyIdle: (eq) => eq.id === 'eq-ok',
};

describe('equipamentos view model', () => {
  it('representa estado vazio sem depender de DOM ou infraestrutura', () => {
    const vm = buildEquipamentosViewModel({ equipamentos: [], clientes: [], setores: [] });

    expect(vm.isEmpty).toBe(true);
    expect(vm.isFilterEmpty).toBe(false);
    expect(vm.items).toEqual([]);
    expect(vm.sortedItems).toEqual([]);
    expect(vm.emptyState).toMatchObject({
      title: 'Nenhum equipamento ainda',
      cta: { action: 'open-modal', id: 'modal-add-eq' },
    });
    expect(vm.skeletonCount).toBe(3);
  });

  it('filtra e ordena a lista por prioridade de acao mantendo equipamentos como dados', () => {
    const state = buildState();
    const vm = buildEquipamentosViewModel({
      ...state,
      ...evaluators,
    });

    expect(vm.isEmpty).toBe(false);
    expect(vm.sortedItems.map((eq) => eq.id)).toEqual(['eq-danger', 'eq-warn', 'eq-ok']);
    expect(vm.idleItems.map((eq) => eq.id)).toEqual(['eq-ok']);
    expect(vm.activeItems.map((eq) => eq.id)).toEqual(['eq-danger', 'eq-warn']);
    expect(vm.shouldUseIdleCluster).toBe(false);
  });

  it('aplica busca por equipamento, cliente, setor e tag', () => {
    const state = buildState();

    expect(
      buildEquipamentosViewModel({ ...state, filtro: 'alpha', ...evaluators }).sortedItems.map(
        (eq) => eq.id,
      ),
    ).toEqual(['eq-warn', 'eq-ok']);
    expect(
      buildEquipamentosViewModel({ ...state, filtro: 'central', ...evaluators }).sortedItems.map(
        (eq) => eq.id,
      ),
    ).toEqual(['eq-danger']);
    expect(
      buildEquipamentosViewModel({ ...state, filtro: 'sp-01', ...evaluators }).sortedItems.map(
        (eq) => eq.id,
      ),
    ).toEqual(['eq-ok']);
  });

  it('aplica filtros principais de setor, cliente, status e preventiva', () => {
    const state = buildState();

    expect(
      buildEquipamentosViewModel({
        ...state,
        setorId: '__sem_setor__',
        ...evaluators,
      }).sortedItems.map((eq) => eq.id),
    ).toEqual(['eq-warn']);
    expect(
      buildEquipamentosViewModel({
        ...state,
        clienteId: 'cliente-2',
        ...evaluators,
      }).sortedItems.map((eq) => eq.id),
    ).toEqual(['eq-danger']);
    expect(
      buildEquipamentosViewModel({
        ...state,
        statusFilter: 'em-atencao',
        ...evaluators,
      }).sortedItems.map((eq) => eq.id),
    ).toEqual(['eq-warn']);
    expect(
      buildEquipamentosViewModel({
        ...state,
        statusFilter: 'criticos',
        ...evaluators,
      }).sortedItems.map((eq) => eq.id),
    ).toEqual(['eq-danger']);
    expect(
      buildEquipamentosViewModel({
        ...state,
        statusFilter: 'preventiva-vencida',
        preventivaVencidaIds: ['eq-ok'],
        ...evaluators,
      }).sortedItems.map((eq) => eq.id),
    ).toEqual(['eq-ok']);
  });

  it('monta empty states contextuais e metadados de quick move sem HTML', () => {
    const state = buildState();

    const clienteEmpty = buildEquipamentosViewModel({
      ...state,
      clienteId: 'cliente-sem-equip',
      clienteNome: 'Cliente Sem Equip',
      ...evaluators,
    });
    expect(clienteEmpty.emptyState).toMatchObject({
      title: 'Cliente Sem Equip ainda não tem equipamentos',
      cta: {
        label: 'Adicionar primeiro equipamento',
        action: 'eq-add-for-cliente',
        id: 'cliente-sem-equip',
      },
    });

    const quickMove = buildEquipamentosViewModel({
      ...state,
      clienteId: 'cliente-1',
      setorId: '__sem_setor__',
      ...evaluators,
    });
    expect(quickMove.quickMove).toMatchObject({
      equipIds: ['eq-warn'],
      setoresDoCliente: [{ id: 'setor-1', nome: 'Area tecnica', clienteId: 'cliente-1' }],
      setoresOrfaos: [{ id: 'setor-orfao', nome: 'Legado' }],
    });
  });

  it('normaliza dados ausentes ou invalidos sem quebrar a futura renderizacao', () => {
    const vm = buildEquipamentosViewModel({
      equipamentos: [
        {
          id: 'bad',
          nome: null,
          local: undefined,
          tag: '<img src=x onerror=alert(1)>',
          status: 'invalido',
        },
      ],
      clientes: 'invalid',
      setores: null,
      filtro: '<img',
      getActionPriority: () => ({ actionPriorityScore: Number.NaN }),
      getPriority: () => ({ priorityLevel: Number.NaN }),
      getRisk: () => ({ score: Number.NaN }),
    });

    expect(vm.sortedItems.map((eq) => eq.id)).toEqual(['bad']);
    expect(vm.sortedItems[0].tag).toBe('<img src=x onerror=alert(1)>');
    expect(vm.emptyState).toBeNull();
    expect(Object.keys(vm)).not.toContain('html');
  });

  it('centraliza contratos publicos que a futura ilha React deve preservar', () => {
    expect(EQUIPAMENTOS_PUBLIC_IDS).toMatchObject({
      view: 'view-equipamentos',
      list: 'lista-equip',
      hero: 'equip-hero',
      filters: 'equip-filters',
      searchInput: 'equip-busca',
      addModal: 'modal-add-eq',
    });
    expect(EQUIPAMENTOS_ACTIONS).toMatchObject({
      viewEquip: 'view-equip',
      editEquip: 'edit-equip',
      deleteEquip: 'delete-equip',
      goRegisterEquip: 'go-register-equip',
      openModal: 'open-modal',
      openSetor: 'open-setor',
      openSetorModal: 'open-setor-modal',
      quickFilter: 'equip-quickfilter',
      quickMoveEquipBatch: 'quick-move-equip-batch',
      openPhotosEditor: 'open-eq-photos-editor',
    });
    expect(EQUIPAMENTOS_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining(['equip-card', 'equip-hero', 'equip-filter', 'setor-card']),
    );
    expect(EQUIPAMENTOS_QUICK_FILTERS.map((filter) => filter.id)).toEqual([
      'todos',
      'em-atencao',
      'criticos',
      'sem-setor',
      'preventiva-vencida',
    ]);
  });
});
