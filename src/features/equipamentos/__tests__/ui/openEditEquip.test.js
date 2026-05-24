import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureOpenEditEquip, openEditEquip } from '../../ui/openEditEquip.js';

function configureOpenEditEquipTestDeps(overrides = {}) {
  const calls = [];
  const elements = {
    'eq-cliente': {},
    'eq-periodicidade': { dataset: {} },
    'eq-save-tertiary': {},
  };
  const documentRef = {
    getElementById: vi.fn((id) => elements[id] || null),
  };
  const Utils = {
    setVal: vi.fn((id, value) => calls.push(`set:${id}:${value}`)),
    getEl: vi.fn((id) => elements[id] || null),
  };
  const deps = {
    findEquip: vi.fn(() => ({
      id: 'eq-1',
      nome: 'Split',
      local: 'Sala',
      tag: 'TAG-1',
      tipo: 'Split Hi-Wall',
      fluido: 'R-410A',
      componente: 'Evaporadora',
      modelo: 'Modelo A',
      criticidade: 'alta',
      prioridadeOperacional: 'urgente',
      periodicidadePreventivaDias: 45,
      dadosPlaca: { fabricante: 'ACME' },
      setorId: 'setor-1',
      clienteId: 'cli-1',
    })),
    Utils,
    setEditingEquipId: vi.fn(() => calls.push('setEditing')),
    syncComponenteVisibility: vi.fn(() => calls.push('syncComponente')),
    restoreDadosPlaca: vi.fn(() => calls.push('restoreDadosPlaca')),
    setCamposExtrasState: vi.fn(() => calls.push('setCamposExtras')),
    setNameplateMetadata: vi.fn(() => calls.push('setNameplateMetadata')),
    populateSetorSelect: vi.fn(() => calls.push('populateSetorSelect')),
    setEquipActionButtonVisible: vi.fn(() => calls.push('setActionVisible')),
    setEquipActionTrayButtonLabel: vi.fn(() => calls.push('setTrayLabel')),
    setEquipActionFooterHintVisible: vi.fn(() => calls.push('setFooterHint')),
    focusEditField: vi.fn(() => calls.push('focus')),
    handleError: vi.fn(() => calls.push('handleError')),
    ErrorCodes: { NETWORK_ERROR: 'NETWORK_ERROR' },
    loadOperationalGateDeps: vi.fn(async () => {
      calls.push('loadBilling');
      return {
        fetchOperationalProfile: vi.fn(async () => ({ profile: { plan_code: 'pro' } })),
        hasProAccess: vi.fn(() => true),
        hasPlusAccess: vi.fn(() => true),
        applyNameplateCtaGate: vi.fn(() => calls.push('applyGate')),
        getMonthlyUsageSnapshot: vi.fn(),
        USAGE_RESOURCE_NAMEPLATE_ANALYSIS: 'nameplate_analysis',
        getMonthlyLimitForPlan: vi.fn(),
      };
    }),
    loadSupabase: vi.fn(),
    loadNameplateCapture: vi.fn(),
    loadModal: vi.fn(async () => ({
      Modal: {
        close: vi.fn(() => calls.push('modalClose')),
        open: vi.fn(() => calls.push('modalOpen')),
      },
    })),
    documentRef,
    requestAnimationFrameRef: vi.fn((callback) => {
      calls.push('raf');
      callback();
    }),
    ...overrides,
  };
  configureOpenEditEquip(deps);
  return { calls, deps, elements };
}

describe('openEditEquip orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna silenciosamente quando equipamento nao existe', async () => {
    const { deps } = configureOpenEditEquipTestDeps({
      findEquip: vi.fn(() => null),
    });

    await openEditEquip('missing');

    expect(deps.findEquip).toHaveBeenCalledWith('missing');
    expect(deps.setEditingEquipId).not.toHaveBeenCalled();
    expect(deps.loadModal).not.toHaveBeenCalled();
  });

  it('preserva a ordem principal do fluxo de edicao', async () => {
    const { calls, deps } = configureOpenEditEquipTestDeps();

    await openEditEquip('eq-1', { focusField: 'modelo' });

    expect(deps.setEditingEquipId).toHaveBeenCalledWith('eq-1');
    expect(deps.restoreDadosPlaca).toHaveBeenCalledWith({ fabricante: 'ACME' });
    expect(deps.focusEditField).toHaveBeenCalledWith('modelo');
    expect(calls).toEqual([
      'setEditing',
      'set:eq-nome:Split',
      'set:eq-local:Sala',
      'set:eq-tag:TAG-1',
      'set:eq-tipo:Split Hi-Wall',
      'set:eq-fluido:R-410A',
      'syncComponente',
      'set:eq-componente:Evaporadora',
      'set:eq-modelo:Modelo A',
      'set:eq-criticidade:alta',
      'set:eq-prioridade:urgente',
      'set:eq-periodicidade:45',
      'restoreDadosPlaca',
      'setCamposExtras',
      'setNameplateMetadata',
      'loadBilling',
      'populateSetorSelect',
      'applyGate',
      'set:eq-setor:setor-1',
      'raf',
      'set:eq-cliente:cli-1',
      'setActionVisible',
      'setActionVisible',
      'setTrayLabel',
      'setFooterHint',
      'modalClose',
      'modalOpen',
      'focus',
    ]);
  });

  it('chama handleError e nao foca quando modal falha', async () => {
    const { deps } = configureOpenEditEquipTestDeps({
      loadModal: vi.fn(async () => {
        throw new Error('modal fail');
      }),
    });

    await openEditEquip('eq-1', { focusField: 'modelo' });

    expect(deps.handleError).toHaveBeenCalledWith(expect.any(Error), {
      code: 'NETWORK_ERROR',
      message: 'Não foi possível abrir o modal de edição.',
      context: { action: 'equipamentos.openEditEquip', id: 'eq-1' },
    });
    expect(deps.focusEditField).not.toHaveBeenCalled();
  });

  it('nao importa o adapter legado', () => {
    const source = readFileSync(resolve('src/features/equipamentos/ui/openEditEquip.js'), 'utf8');

    expect(source).not.toContain('ui/views/equipamentos');
    expect(source).not.toContain('views/equipamentos.js');
  });
});
