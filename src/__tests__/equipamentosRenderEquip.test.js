import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureRenderEquip, renderEquip } from '../ui/views/equipamentos/ui/renderEquip.js';

function configureRenderEquipTestDeps(overrides = {}) {
  const calls = [];
  const elements = {
    'equip-page-subtitle': { textContent: '' },
    'equip-search-bar': { style: { display: 'none' } },
  };
  const deps = {
    Utils: {
      getEl: vi.fn((id) => elements[id] || null),
      truncate: vi.fn((value) => value),
      escapeAttr: vi.fn((value) => `escaped:${value}`),
    },
    resolveEquipCtx: vi.fn(() => {
      calls.push('resolveCtx');
      return {
        sectorId: null,
        quickFilter: '',
        clienteId: '',
        clienteNome: '',
      };
    }),
    stripRenderInternalOptions: vi.fn((options) => {
      calls.push('stripOptions');
      return { ...options, __skipPlanRefresh: undefined };
    }),
    isCachedPlanPro: vi.fn(() => {
      calls.push('isPro');
      return false;
    }),
    bindRenderEquipPlanInvalidationEvents: vi.fn(() => calls.push('bindPlanEvents')),
    incrementRenderEquipPlanToken: vi.fn(() => {
      calls.push('incrementToken');
      return 7;
    }),
    getRenderEquipPlanNeedsRefresh: vi.fn(() => {
      calls.push('needsRefresh');
      return false;
    }),
    refreshRenderEquipPlan: vi.fn(() => calls.push('refreshPlan')),
    populateSetorSelect: vi.fn(() => calls.push('populateSetorSelect')),
    getState: vi.fn(() => {
      calls.push('getState');
      return { equipamentos: [], registros: [], setores: [] };
    }),
    getPreventivaDueEquipmentIds: vi.fn(() => {
      calls.push('preventivaDueIds');
      return [];
    }),
    buildEquipamentosHeaderViewModel: vi.fn(() => {
      calls.push('buildHeaderVm');
      return { title: 'Header' };
    }),
    computeEquipKpis: vi.fn(() => {
      calls.push('computeKpis');
      return {};
    }),
    mountEquipamentosHeader: vi.fn(() => {
      calls.push('mountHeader');
      return Promise.resolve('header');
    }),
    setToolbar: vi.fn(() => calls.push('setToolbar')),
    renderFlatList: vi.fn(() => {
      calls.push('renderFlatList');
      return Promise.resolve('flat-list');
    }),
    renderSetorGrid: vi.fn(() => {
      calls.push('renderSetorGrid');
      return 'setor-grid';
    }),
    renderSetorGridForCliente: vi.fn(() => {
      calls.push('renderSetorGridForCliente');
      return 'setor-grid-cliente';
    }),
    findSetor: vi.fn(() => {
      calls.push('findSetor');
      return { nome: 'Casa de maquinas' };
    }),
    ...overrides,
  };
  configureRenderEquip(deps);
  return { calls, deps, elements };
}

describe('renderEquip orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('preserva a ordem do fluxo de lista final', async () => {
    const { calls, deps } = configureRenderEquipTestDeps();

    await expect(renderEquip('split', { __skipPlanRefresh: true })).resolves.toBe('flat-list');

    expect(deps.renderFlatList).toHaveBeenCalledWith(
      'split',
      { __skipPlanRefresh: undefined },
      null,
    );
    expect(calls).toEqual([
      'bindPlanEvents',
      'incrementToken',
      'stripOptions',
      'resolveCtx',
      'isPro',
      'populateSetorSelect',
      'getState',
      'preventivaDueIds',
      'computeKpis',
      'buildHeaderVm',
      'mountHeader',
      'setToolbar',
      'renderFlatList',
    ]);
  });

  it('mantem quick filter como early return com renderFlatList', async () => {
    const { deps } = configureRenderEquipTestDeps({
      resolveEquipCtx: vi.fn(() => ({
        sectorId: null,
        quickFilter: 'criticos',
        clienteId: 'cli-1',
        clienteNome: 'Cliente A',
      })),
    });

    await expect(renderEquip('', { origem: 'teste' })).resolves.toBe('flat-list');

    expect(deps.setToolbar).toHaveBeenCalledWith({
      title: 'Críticos',
      extraBtn:
        '<button class="btn btn--outline btn--sm" data-action="equip-quickfilter" data-id="todos">← Todos</button>',
    });
    expect(deps.renderFlatList).toHaveBeenCalledWith(
      '',
      {
        origem: 'teste',
        __skipPlanRefresh: undefined,
        clienteId: 'cli-1',
        clienteNome: 'Cliente A',
        statusFilter: 'criticos',
      },
      null,
    );
    expect(deps.renderSetorGrid).not.toHaveBeenCalled();
  });

  it('mantem branch de setores antes da lista final', async () => {
    const { deps } = configureRenderEquipTestDeps({
      isCachedPlanPro: vi.fn(() => true),
      getState: vi.fn(() => ({
        equipamentos: [],
        registros: [],
        setores: [{ id: 'setor-1', nome: 'Sala tecnica' }],
      })),
    });

    await expect(renderEquip()).resolves.toBe('setor-grid');

    expect(deps.renderSetorGrid).toHaveBeenCalledTimes(1);
    expect(deps.renderFlatList).not.toHaveBeenCalled();
  });

  it('mantem branch de setores filtrada por cliente', async () => {
    const { deps } = configureRenderEquipTestDeps({
      isCachedPlanPro: vi.fn(() => true),
      getState: vi.fn(() => ({
        equipamentos: [{ id: 'eq-1', clienteId: 'cli-1', setorId: 'setor-1' }],
        registros: [],
        setores: [{ id: 'setor-1', clienteId: 'cli-1', nome: 'Sala tecnica' }],
      })),
      resolveEquipCtx: vi.fn(() => ({
        sectorId: null,
        quickFilter: '',
        clienteId: 'cli-1',
        clienteNome: 'Cliente A',
      })),
    });

    await expect(renderEquip()).resolves.toBe('setor-grid-cliente');

    expect(deps.renderSetorGridForCliente).toHaveBeenCalledWith('cli-1', 'Cliente A');
    expect(deps.renderFlatList).not.toHaveBeenCalled();
  });

  it('renderiza lista direta para cliente sem setores', async () => {
    const { deps } = configureRenderEquipTestDeps({
      isCachedPlanPro: vi.fn(() => true),
      getState: vi.fn(() => ({
        equipamentos: [{ id: 'eq-1', clienteId: 'cli-1', setorId: null }],
        registros: [],
        setores: [],
      })),
      resolveEquipCtx: vi.fn(() => ({
        sectorId: null,
        quickFilter: '',
        clienteId: 'cli-1',
        clienteNome: 'Cliente A',
      })),
    });

    await expect(renderEquip()).resolves.toBe('flat-list');

    expect(deps.renderSetorGridForCliente).not.toHaveBeenCalled();
    expect(deps.renderFlatList).toHaveBeenCalledWith(
      '',
      {
        __skipPlanRefresh: undefined,
        clienteId: 'cli-1',
        clienteNome: 'Cliente A',
      },
      null,
    );
    expect(deps.setToolbar).toHaveBeenCalledWith({
      title: 'Equipamentos de Cliente A',
      extraBtn:
        '<button class="btn btn--outline btn--sm" data-action="open-setor-modal" data-cliente-id="escaped:cli-1">+ Novo setor</button><button class="btn btn--ghost btn--sm" data-action="equip-clear-cliente-filter" title="Voltar para todos os equipamentos">x Limpar cliente</button>',
    });
  });

  it('mantem toolbar de setor ativo e escapa atributos', async () => {
    const { deps } = configureRenderEquipTestDeps({
      resolveEquipCtx: vi.fn(() => ({
        sectorId: 'setor-1',
        quickFilter: '',
        clienteId: 'cli-1',
        clienteNome: 'Cliente A',
      })),
    });

    await renderEquip();

    expect(deps.findSetor).toHaveBeenCalledWith('setor-1');
    expect(deps.setToolbar).toHaveBeenCalledWith({
      title: 'Casa de maquinas - Cliente A',
      extraBtn:
        '<button class="btn btn--primary btn--sm"\n' +
        '              data-action="open-modal" data-id="modal-add-eq"\n' +
        '              data-setor-id="escaped:setor-1"\n' +
        '              data-cliente-id="escaped:cli-1"\n' +
        '              data-source="setor_drill">+ Novo equipamento</button><button class="btn btn--outline btn--sm" data-action="back-to-setores"><- Setores do cliente</button>',
      hideDefaultCta: true,
    });
    expect(deps.renderFlatList).toHaveBeenCalledWith(
      '',
      {
        __skipPlanRefresh: undefined,
        clienteId: 'cli-1',
        clienteNome: 'Cliente A',
      },
      'setor-1',
    );
  });

  it('nao importa adapter obsoleto', () => {
    const source = readFileSync(resolve('src/ui/views/equipamentos/ui/renderEquip.js'), 'utf8');

    expect(source).not.toContain('ui/views/equipamentos');
    expect(source).not.toContain('views/equipamentos.js');
  });
});
