import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  configureRenderFlatList,
  renderFlatList,
} from '../ui/views/equipamentos/ui/renderFlatList.js';

const emptyDeps = {
  getState: null,
  Utils: null,
  createEquipRenderEvalContext: null,
  getPreventivaDueEquipmentIds: null,
  buildEquipamentosViewModel: null,
  buildReactListViewModel: null,
  resolveIdleClusterCollapsed: null,
  isCachedPlanPro: null,
  withSkeleton: null,
  mountEquipamentosList: null,
  bindEquipCardImageFallbacks: null,
};

function configureRenderFlatListTestDeps(overrides = {}) {
  const calls = [];
  const root = { id: 'lista-equip' };
  const evalCtx = {
    getActionPriority: vi.fn(),
    getPriority: vi.fn(),
    getRisk: vi.fn(),
    isFullyIdle: vi.fn(),
  };
  const state = {
    equipamentos: [{ id: 'eq-1' }],
    registros: [{ id: 'reg-1', equipId: 'eq-1' }],
    clientes: [{ id: 'cli-1' }],
    setores: [{ id: 'setor-1' }],
  };
  const viewModel = {
    idleItems: [{ id: 'idle-1' }, { id: 'idle-2' }, { id: 'idle-3' }, { id: 'idle-4' }],
    activeItems: [{ id: 'active-1' }],
    skeletonCount: 4,
  };
  const reactViewModel = { cards: [{ id: 'eq-1' }] };
  const deps = {
    getState: vi.fn(() => {
      calls.push('getState');
      return state;
    }),
    Utils: {
      getEl: vi.fn(() => {
        calls.push('getRoot');
        return root;
      }),
    },
    createEquipRenderEvalContext: vi.fn(() => {
      calls.push('evalCtx');
      return evalCtx;
    }),
    getPreventivaDueEquipmentIds: vi.fn(() => {
      calls.push('preventivaIds');
      return ['eq-1'];
    }),
    buildEquipamentosViewModel: vi.fn(() => {
      calls.push('buildViewModel');
      return viewModel;
    }),
    buildReactListViewModel: vi.fn(() => {
      calls.push('buildReactViewModel');
      return reactViewModel;
    }),
    resolveIdleClusterCollapsed: vi.fn(() => {
      calls.push('resolveCluster');
      return true;
    }),
    isCachedPlanPro: vi.fn(() => {
      calls.push('isPro');
      return true;
    }),
    withSkeleton: vi.fn((_root, _options, renderFn) => {
      calls.push('withSkeleton');
      return renderFn();
    }),
    mountEquipamentosList: vi.fn(({ onMounted }) => {
      calls.push('mountList');
      onMounted();
      return 'mounted-list';
    }),
    bindEquipCardImageFallbacks: vi.fn(() => calls.push('fallbacks')),
    ...overrides,
  };

  configureRenderFlatList({ ...emptyDeps, ...deps });
  return { calls, deps, evalCtx, reactViewModel, root, state, viewModel };
}

describe('renderFlatList', () => {
  beforeEach(() => {
    configureRenderFlatList(emptyDeps);
  });

  it('exige dependencias configuradas', () => {
    expect(() => renderFlatList()).toThrow('renderFlatList dependency not configured: getState');
  });

  it('preserva state snapshot, view model, React bridge, skeleton e fallback na ordem', () => {
    const { calls, deps, evalCtx, reactViewModel, root, state, viewModel } =
      configureRenderFlatListTestDeps();

    expect(
      renderFlatList(
        'split',
        { clienteId: 'cli-1', clienteNome: 'Cliente A', statusFilter: 'preventiva-7d' },
        'setor-1',
      ),
    ).toBe('mounted-list');

    expect(deps.buildEquipamentosViewModel).toHaveBeenCalledWith({
      equipamentos: state.equipamentos,
      clientes: state.clientes,
      setores: state.setores,
      filtro: 'split',
      setorId: 'setor-1',
      clienteId: 'cli-1',
      clienteNome: 'Cliente A',
      statusFilter: 'preventiva-7d',
      preventiva7dIds: ['eq-1'],
      preventiva30dIds: [],
      preventivaVencidaIds: [],
      getActionPriority: evalCtx.getActionPriority,
      getPriority: evalCtx.getPriority,
      getRisk: evalCtx.getRisk,
      isFullyIdle: evalCtx.isFullyIdle,
    });
    expect(deps.buildReactListViewModel).toHaveBeenCalledWith(viewModel, {
      evalCtx,
      clusterActive: true,
      filterClienteId: 'cli-1',
      isPro: true,
    });
    expect(deps.withSkeleton).toHaveBeenCalledWith(
      root,
      { enabled: true, variant: 'equipment', count: 4 },
      expect.any(Function),
    );
    expect(deps.mountEquipamentosList).toHaveBeenCalledWith({
      root,
      viewModel: reactViewModel,
      onMounted: expect.any(Function),
    });
    expect(deps.bindEquipCardImageFallbacks).toHaveBeenCalledWith(root);
    expect(calls).toEqual([
      'getState',
      'evalCtx',
      'preventivaIds',
      'buildViewModel',
      'getRoot',
      'resolveCluster',
      'isPro',
      'buildReactViewModel',
      'withSkeleton',
      'mountList',
      'fallbacks',
    ]);
  });

  it('mantem early return silencioso quando #lista-equip nao existe', () => {
    const { calls, deps } = configureRenderFlatListTestDeps({
      Utils: {
        getEl: vi.fn(() => {
          calls.push('getRoot');
          return null;
        }),
      },
    });

    expect(renderFlatList()).toBeUndefined();

    expect(deps.buildEquipamentosViewModel).toHaveBeenCalledTimes(1);
    expect(deps.buildReactListViewModel).not.toHaveBeenCalled();
    expect(deps.mountEquipamentosList).not.toHaveBeenCalled();
    expect(deps.bindEquipCardImageFallbacks).not.toHaveBeenCalled();
    expect(calls).toEqual(['getState', 'evalCtx', 'buildViewModel', 'getRoot']);
  });

  it('preserva regra de quick filter preventiva vencida e setor sem setor', () => {
    const { deps } = configureRenderFlatListTestDeps();

    renderFlatList('', { statusFilter: 'preventiva-vencida' }, '__sem_setor__');

    expect(deps.getPreventivaDueEquipmentIds).toHaveBeenCalledWith(
      [{ id: 'reg-1', equipId: 'eq-1' }],
      0,
    );
    expect(deps.buildEquipamentosViewModel).toHaveBeenCalledWith(
      expect.objectContaining({
        setorId: '__sem_setor__',
        statusFilter: 'preventiva-vencida',
        preventivaVencidaIds: ['eq-1'],
      }),
    );
  });

  it('nao importa o adapter legado', () => {
    const source = readFileSync(resolve('src/ui/views/equipamentos/ui/renderFlatList.js'), 'utf8');

    expect(source).not.toContain('ui/views/equipamentos');
    expect(source).not.toContain('views/equipamentos.js');
  });
});
