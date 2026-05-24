import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getState: vi.fn(() => ({
    registros: [],
    equipamentos: [{ id: 'eq-1', status: 'ok', nome: 'Equip' }],
    tecnicos: [],
  })),
  setState: vi.fn(),
}));

vi.mock('../../core/utils.js', () => ({
  Utils: {
    getVal: vi.fn((id) => document.getElementById(id)?.value || ''),
    setVal: vi.fn((id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    }),
    clearVals: vi.fn(),
    nowDatetime: vi.fn(() => '2026-05-05T00:00'),
    getEl: vi.fn((id) => document.getElementById(id)),
    uid: vi.fn(() => 'reg-new'),
    escapeHtml: vi.fn((v) => String(v || '')),
  },
}));
vi.mock('../../core/state.js', () => ({
  getState: mocks.getState,
  setState: mocks.setState,
  findEquip: vi.fn(() => ({ nome: 'Equip' })),
  lastRegForEquip: vi.fn(() => null),
}));
vi.mock('../../core/router.js', () => ({
  goTo: vi.fn(),
  setRouteGuard: vi.fn(),
  clearRouteGuard: vi.fn(),
}));
vi.mock('../../core/toast.js', () => ({
  Toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('../../core/modal.js', () => ({ CustomConfirm: { show: vi.fn(async () => true) } }));
vi.mock('../../ui/components/photos.js', () => ({ Photos: { pending: [], clear: vi.fn() } }));
vi.mock('../../core/profile.js', () => ({
  Profile: {
    getDefaultTecnico: vi.fn(() => ''),
    saveLastTecnico: vi.fn(),
    get: vi.fn(() => ({})),
    save: vi.fn(),
  },
}));
vi.mock('../../core/errors.js', () => ({ ErrorCodes: {}, handleError: vi.fn() }));
vi.mock('../../core/equipmentRules.js', () => ({
  getOperationalStatus: vi.fn(() => ({ uiStatus: 'ok', label: 'ok' })),
  validateOperationalPayload: vi.fn(() => ({ valid: true })),
}));
vi.mock('../../domain/registroStatus.js', () => ({
  reconcileEquipmentStatusesAfterRegistroEdit: vi.fn(({ equipamentos }) => equipamentos),
}));
vi.mock('../../core/telemetry.js', () => ({ trackEvent: vi.fn() }));
vi.mock('../../ui/components/skeleton.js', () => ({
  withSkeleton: vi.fn(async (_id, fn) => fn()),
}));
vi.mock('../../core/inputValidation.js', () => ({
  validateRegistroPayload: vi.fn(() => ({
    valid: true,
    value: {
      equipId: 'eq-1',
      data: '2026-05-05',
      tipo: 'Inspeção Geral',
      tecnico: 'Tec',
      obs: 'observação longa o suficiente',
      pecas: '',
      proxima: '',
      status: 'ok',
      custoPecas: 0,
      custoMaoObra: 0,
      clienteNome: '',
      clienteDocumento: '',
      localAtendimento: '',
      clienteContato: '',
    },
  })),
}));
vi.mock('../../core/plans/planCache.js', () => ({
  isCachedPlanPlusOrHigher: vi.fn(() => true),
  isCachedPlanPro: vi.fn(() => true),
}));
vi.mock('../../ui/components/postSaveRegistroToast.js', () => ({
  PostSaveRegistroToast: { show: vi.fn(() => false) },
}));
vi.mock('../../core/phoneMask.js', () => ({ bindSmartContactMaskInput: vi.fn() }));
vi.mock('../../ui/composables/registroContext.js', () => ({
  resolveRegistroContext: vi.fn(() => ({})),
}));
vi.mock('../../ui/viewModels/registroViewModel.js', () => ({
  buildRegistroViewModel: vi.fn(() => ({})),
}));
vi.mock('../../ui/viewModels/registroPhotosModel.js', () => ({
  isSafeRegistroPhotoSrc: vi.fn(() => true),
}));
vi.mock('../../domain/pmoc/checklistTemplates.js', () => ({
  getChecklistTemplate: vi.fn(() => null),
  buildEmptyChecklist: vi.fn(() => null),
  validateChecklist: vi.fn(() => ({ complete: true, missing: [] })),
  summarizeChecklist: vi.fn(() => ''),
}));
beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = `<div id="view-registro"><input id="r-equip" value="eq-1" /><input id="r-data" value="2026-05-05" /><input id="r-tipo" value="Inspeção Geral" /><input id="r-tipo-custom" value="" /><input id="r-obs" value="observação longa o suficiente" /><input id="r-tecnico" value="Tec" /><input id="r-status" value="ok" /><input id="r-prioridade" value="media" /><input id="r-pecas" value="" /><input id="r-proxima" value="" /><input id="r-custo-pecas" value="0" /><input id="r-custo-mao-obra" value="0" /><input id="r-cliente-nome" value="" /><input id="r-cliente-documento" value="" /><input id="r-local-atendimento" value="" /><input id="r-cliente-contato" value="" /><button data-action="save-registro"><span>Salvar serviço</span></button></div>`;
});

describe('exploratory: signature payload contract', () => {
  it('mantem payload sem assinatura apos aposentadoria do fluxo legado', async () => {
    let finalState;
    mocks.setState.mockImplementation((updater) => {
      finalState = updater({
        registros: [],
        equipamentos: [{ id: 'eq-1', status: 'ok', nome: 'Equip' }],
        tecnicos: [],
      });
      return finalState;
    });
    const { saveRegistro } = await import('../../ui/views/registro.js');
    await saveRegistro();
    expect(finalState.registros[0]).not.toHaveProperty('assinatura');
  });
});
