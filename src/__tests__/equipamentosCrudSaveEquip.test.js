import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureSaveEquip, saveEquip } from '../ui/views/equipamentos/crud/saveEquip.js';

function createDeps(overrides = {}) {
  const calls = [];
  const payload = { equipId: 'eq-new', clienteId: 'cli-1' };
  const postActionContext = {
    postAction: '',
    keepOpen: false,
    openRegistro: false,
    saveWithoutClient: false,
  };

  return {
    calls,
    payload,
    getSaveEquipPostActionContext: vi.fn(() => {
      calls.push('getSaveEquipPostActionContext');
      return postActionContext;
    }),
    getState: vi.fn(() => {
      calls.push('getState');
      return { equipamentos: [{ id: 'eq-1' }] };
    }),
    getEditingEquipId: vi.fn(() => null),
    checkSaveEquipPlanLimit: vi.fn(async () => {
      calls.push('checkSaveEquipPlanLimit');
      return true;
    }),
    checkPlanLimit: vi.fn(),
    trackEvent: vi.fn(),
    Toast: { warning: vi.fn(), success: vi.fn() },
    goTo: vi.fn(),
    startServiceRegistration: vi.fn(),
    collectSaveEquipBaseFormValues: vi.fn(() => {
      calls.push('collectSaveEquipBaseFormValues');
      return { tipo: 'Split Hi-Wall' };
    }),
    getValue: vi.fn(),
    validateSaveEquipPayload: vi.fn(() => {
      calls.push('validateSaveEquipPayload');
      return { value: { nome: 'Evap', local: 'Sala', tag: 'TAG', modelo: 'M1' } };
    }),
    validateEquipamentoPayload: vi.fn(),
    collectSaveEquipContextFormValues: vi.fn(() => {
      calls.push('collectSaveEquipContextFormValues');
      return { tipo: 'Split Hi-Wall', clienteId: 'cli-1' };
    }),
    getForcedEquipContext: vi.fn(),
    normalizePeriodicidadePreventivaDias: vi.fn(),
    collectSaveEquipExtraFormValues: vi.fn(() => {
      calls.push('collectSaveEquipExtraFormValues');
      return { fluido: 'R-410A', componente: 'Evaporadora' };
    }),
    collectSaveEquipDadosPlaca: vi.fn(() => {
      calls.push('collectSaveEquipDadosPlaca');
      return { ok: true, dadosPlaca: { marca: 'Cool' } };
    }),
    collectDadosPlaca: vi.fn(),
    DadosPlacaValidationError: class DadosPlacaValidationError extends Error {},
    formatDecimalHint: vi.fn(),
    buildSaveEquipPayload: vi.fn(() => {
      calls.push('buildSaveEquipPayload');
      return payload;
    }),
    createId: vi.fn(() => 'eq-new'),
    findEquip: vi.fn(),
    normalizePhotoList: vi.fn(),
    tiposComComponente: new Set(['Split Hi-Wall']),
    applySaveEquipToState: vi.fn(() => {
      calls.push('applySaveEquipToState');
    }),
    setState: vi.fn(),
    updateSaveEquipInState: vi.fn(),
    createSaveEquipInState: vi.fn(),
    finishSaveEquipSuccess: vi.fn(async ({ wasEditing }) => {
      calls.push(['finishSaveEquipSuccess', wasEditing]);
    }),
    closeSaveEquipModal: vi.fn(),
    resetSaveEquipForm: vi.fn(),
    refreshSaveEquipViews: vi.fn(),
    toastSuccess: vi.fn(),
    runSaveEquipPostActions: vi.fn(() => {
      calls.push('runSaveEquipPostActions');
    }),
    focusNameInput: vi.fn(),
    ...overrides,
  };
}

function configure(overrides = {}) {
  const deps = createDeps(overrides);
  configureSaveEquip(deps);
  return deps;
}

describe('crud/saveEquip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna false quando o limite de plano bloqueia e não valida nem persiste', async () => {
    const deps = configure({
      checkSaveEquipPlanLimit: vi.fn(async () => {
        deps.calls.push('checkSaveEquipPlanLimit');
        return false;
      }),
    });

    const result = await saveEquip();

    expect(result).toBe(false);
    expect(deps.validateSaveEquipPayload).not.toHaveBeenCalled();
    expect(deps.applySaveEquipToState).not.toHaveBeenCalled();
  });

  it('retorna false quando validação falha e não persiste', async () => {
    const deps = configure({
      validateSaveEquipPayload: vi.fn(() => {
        deps.calls.push('validateSaveEquipPayload');
        return null;
      }),
    });

    const result = await saveEquip();

    expect(result).toBe(false);
    expect(deps.collectSaveEquipDadosPlaca).not.toHaveBeenCalled();
    expect(deps.applySaveEquipToState).not.toHaveBeenCalled();
  });

  it('retorna false quando dados de placa falham e não persiste', async () => {
    const deps = configure({
      collectSaveEquipDadosPlaca: vi.fn(() => {
        deps.calls.push('collectSaveEquipDadosPlaca');
        return { ok: false };
      }),
    });

    const result = await saveEquip();

    expect(result).toBe(false);
    expect(deps.buildSaveEquipPayload).not.toHaveBeenCalled();
    expect(deps.applySaveEquipToState).not.toHaveBeenCalled();
  });

  it('em sucesso chama applySaveEquipToState e retorna true', async () => {
    const deps = configure();

    const result = await saveEquip();

    expect(result).toBe(true);
    expect(deps.applySaveEquipToState).toHaveBeenCalledWith({
      setState: deps.setState,
      editingId: null,
      payload: deps.payload,
      updateMutation: deps.updateSaveEquipInState,
      createMutation: deps.createSaveEquipInState,
    });
  });

  it('captura wasEditing antes do finish success', async () => {
    const editingIds = ['eq-1', 'eq-1', 'eq-1', 'eq-1', 'eq-1', null];
    const deps = configure({
      getEditingEquipId: vi.fn(() => editingIds.shift()),
    });

    const result = await saveEquip();

    expect(result).toBe(true);
    expect(deps.calls).toContainEqual(['finishSaveEquipSuccess', true]);
  });

  it('executa finishSaveEquipSuccess antes de runSaveEquipPostActions', async () => {
    const deps = configure();

    const result = await saveEquip();

    expect(result).toBe(true);
    expect(deps.calls.indexOf('applySaveEquipToState')).toBeLessThan(
      deps.calls.findIndex((call) => Array.isArray(call) && call[0] === 'finishSaveEquipSuccess'),
    );
    expect(
      deps.calls.findIndex((call) => Array.isArray(call) && call[0] === 'finishSaveEquipSuccess'),
    ).toBeLessThan(deps.calls.indexOf('runSaveEquipPostActions'));
  });

  it('repassa opções postAction para contexto, success e post-actions', async () => {
    const postActionContext = {
      postAction: 'register',
      keepOpen: false,
      openRegistro: true,
      saveWithoutClient: false,
    };
    const deps = configure({
      getSaveEquipPostActionContext: vi.fn(() => postActionContext),
    });
    const options = { postAction: 'register' };

    const result = await saveEquip(options);

    expect(result).toBe(true);
    expect(deps.getSaveEquipPostActionContext).toHaveBeenCalledWith(options);
    expect(deps.finishSaveEquipSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ keepOpen: false }),
    );
    expect(deps.runSaveEquipPostActions).toHaveBeenCalledWith(
      expect.objectContaining({
        keepOpen: false,
        openRegistro: true,
        payload: deps.payload,
        startServiceRegistration: deps.startServiceRegistration,
      }),
    );
  });

  it('usa dependências injetadas para collectors, validação e montagem de payload', async () => {
    const deps = configure();

    await saveEquip({ postAction: 'save-without-client' });

    expect(deps.collectSaveEquipBaseFormValues).toHaveBeenCalledWith({ getValue: deps.getValue });
    expect(deps.validateSaveEquipPayload).toHaveBeenCalledWith(
      expect.objectContaining({
        equipamentos: [{ id: 'eq-1' }],
        getValue: deps.getValue,
        validateEquipamentoPayload: deps.validateEquipamentoPayload,
        Toast: deps.Toast,
      }),
    );
    expect(deps.buildSaveEquipPayload).toHaveBeenCalledWith(
      expect.objectContaining({
        createId: deps.createId,
        findEquip: deps.findEquip,
        normalizePhotoList: deps.normalizePhotoList,
        tiposComComponente: deps.tiposComComponente,
      }),
    );
  });
});
