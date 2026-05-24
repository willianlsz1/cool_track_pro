import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  currentState: {
    equipamentos: [],
    registros: [],
    clientes: [],
    setores: [],
  },
  vals: {},
  getState: vi.fn(),
  findEquip: vi.fn(),
  findSetor: vi.fn(),
  regsForEquip: vi.fn(() => []),
  setState: vi.fn(),
  uid: vi.fn(() => 'eq-new'),
  checkPlanLimit: vi.fn(() => ({ blocked: false })),
  validateEquipamentoPayload: vi.fn((payload) => ({ valid: true, value: payload })),
  collectDadosPlaca: vi.fn(() => ({ tensao: '220' })),
  normalizePhotoList: vi.fn((value) => (Array.isArray(value) ? value : [])),
  modalClose: vi.fn(),
  toastSuccess: vi.fn(),
  toastWarning: vi.fn(),
  renderDashboard: vi.fn(),
  updateGlobalHeader: vi.fn(),
  onboardingRemove: vi.fn(),
  goTo: vi.fn(),
}));

vi.mock('../core/utils.js', () => ({
  Utils: {
    getVal: vi.fn((id) => mocks.vals[id] ?? ''),
    setVal: vi.fn((id, value) => {
      mocks.vals[id] = value;
    }),
    clearVals: vi.fn((...ids) => {
      ids.forEach((id) => {
        mocks.vals[id] = '';
      });
    }),
    getEl: vi.fn((id) => document.getElementById(id)),
    uid: mocks.uid,
    escapeHtml: vi.fn((value) => String(value ?? '')),
    escapeAttr: vi.fn((value) => String(value ?? '')),
    truncate: vi.fn((value) => String(value ?? '')),
    formatDate: vi.fn((value) => String(value ?? '')),
  },
}));

vi.mock('../core/state.js', () => ({
  getState: mocks.getState,
  findEquip: mocks.findEquip,
  findSetor: mocks.findSetor,
  regsForEquip: mocks.regsForEquip,
  setState: mocks.setState,
}));

vi.mock('../core/storage.js', () => ({
  Storage: { save: vi.fn(), load: vi.fn(), markEquipDeleted: vi.fn(), markSetorDeleted: vi.fn() },
}));

vi.mock('../core/toast.js', () => ({
  Toast: {
    success: mocks.toastSuccess,
    warning: mocks.toastWarning,
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../core/modal.js', () => ({
  Modal: { close: mocks.modalClose, open: vi.fn() },
}));

vi.mock('../ui/views/dashboard.js', () => ({
  renderDashboard: mocks.renderDashboard,
  calcHealthScore: vi.fn(() => 90),
  getHealthClass: vi.fn(() => 'ok'),
}));

vi.mock('../ui/composables/header.js', () => ({
  updateGlobalHeader: mocks.updateGlobalHeader,
}));

vi.mock('../ui/components/onboarding.js', () => ({
  OnboardingBanner: { remove: mocks.onboardingRemove, markAction: vi.fn() },
}));

vi.mock('../core/errors.js', () => ({
  ErrorCodes: { NETWORK_ERROR: 'NETWORK_ERROR', VALIDATION_ERROR: 'VALIDATION_ERROR' },
  handleError: vi.fn(),
}));

vi.mock('../core/planLimits.js', () => ({
  checkPlanLimit: mocks.checkPlanLimit,
}));

vi.mock('../core/router.js', () => ({
  currentRoute: vi.fn(() => 'equipamentos'),
  currentRouteParams: vi.fn(() => ({})),
  goTo: mocks.goTo,
}));

vi.mock('../core/telemetry.js', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('../core/inputValidation.js', () => ({
  validateEquipamentoPayload: mocks.validateEquipamentoPayload,
}));

vi.mock('../domain/maintenance.js', () => ({
  getHealthClass: vi.fn(() => 'ok'),
  evaluateEquipmentHealth: vi.fn(() => ({ score: 90, reasons: [], context: {} })),
  evaluateEquipmentRisk: vi.fn(() => ({ score: 10, classification: 'baixo', factors: [] })),
  getSuggestedPreventiveDays: vi.fn(() => 30),
  normalizePeriodicidadePreventivaDias: vi.fn((value) => Number(value || 30)),
}));

vi.mock('../domain/alerts.js', () => ({
  Alerts: { getAll: vi.fn(() => []) },
  getPreventivaDueEquipmentIds: vi.fn(() => []),
}));

vi.mock('../domain/dadosPlacaDisplay.js', () => ({
  formatDadosPlacaRows: vi.fn(() => []),
}));

vi.mock('../domain/dadosPlacaValidation.js', () => ({
  DadosPlacaValidationError: class DadosPlacaValidationError extends Error {},
  formatDecimalHint: vi.fn(() => ''),
}));

vi.mock('../ui/views/equipamentos/placaData.js', () => ({
  DADOS_PLACA_INPUT_IDS: ['dp-tensao'],
  collectDadosPlaca: mocks.collectDadosPlaca,
  resetNameplateMetadata: vi.fn(),
  setNameplateMetadata: vi.fn(),
  restoreDadosPlaca: vi.fn(),
}));

vi.mock('../ui/components/nameplateCapture.js', () => ({
  resetCamposExtrasState: vi.fn(),
  setCamposExtrasState: vi.fn(),
}));

vi.mock('../ui/components/photos.js', () => ({
  Photos: {},
}));

vi.mock('../core/photoStorage.js', () => ({
  normalizePhotoList: mocks.normalizePhotoList,
}));

vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPlusOrHigher: vi.fn(() => false),
  isCachedPlanPro: vi.fn(() => false),
  setCachedPlan: vi.fn(),
}));

vi.mock('../core/plans/subscriptionPlans.js', () => ({
  getEffectivePlan: vi.fn(() => 'free'),
  hasProAccess: vi.fn(() => false),
}));

vi.mock('../core/profile.js', () => ({
  Profile: { get: vi.fn(() => ({})) },
}));

vi.mock('../ui/components/skeleton.js', () => ({
  withSkeleton: (_el, _opts, renderFn) => renderFn(),
}));

vi.mock('../ui/viewModels/equipamentosViewModel.js', () => ({
  buildEquipamentosViewModel: vi.fn(() => ({
    idleItems: [],
    activeItems: [],
    skeletonCount: 0,
  })),
}));

vi.mock('../ui/viewModels/equipamentosHeaderModel.js', () => ({
  buildEquipamentosHeaderViewModel: vi.fn(() => ({})),
}));

vi.mock('../ui/views/equipamentos/utils/viewModels.js', () => ({
  _stripRenderInternalOptions: vi.fn((options) => options || {}),
  buildReactListViewModel: vi.fn((viewModel) => viewModel),
}));

vi.mock('../ui/views/equipamentos/utils/detail.js', () => ({
  _eqDetailSubtitle: vi.fn(),
  _infoRowValueOrEmpty: vi.fn(),
  _riskFactorChipHtml: vi.fn(),
}));

vi.mock('../ui/views/equipamentos/equipmentCards.js', () => ({
  _createEquipRenderEvalContext: vi.fn(() => ({
    getActionPriority: vi.fn(),
    getPriority: vi.fn(),
    getRisk: vi.fn(),
    isFullyIdle: vi.fn(() => false),
  })),
  _resolveIdleClusterCollapsed: vi.fn(() => false),
  equipCardHtml: vi.fn(() => ''),
}));

vi.mock('../ui/views/equipamentos/hero.js', () => ({
  computeEquipKpis: vi.fn(() => ({})),
  renderEquipHero: vi.fn(),
  renderEquipFilters: vi.fn(),
}));

vi.mock('../ui/views/equipamentos/setores.js', () => ({
  setorCardHtml: vi.fn(() => ''),
}));

vi.mock('../ui/views/equipamentos/cardIconFallbacks.js', () => ({
  bindEquipCardImageFallbacks: vi.fn(),
}));

vi.mock('../ui/views/equipamentos/bridges/headerBridge.js', () => ({
  mountEquipamentosHeader: vi.fn(() => Promise.resolve()),
  unmountEquipamentosHeader: vi.fn(),
}));

vi.mock('../ui/views/equipamentos/bridges/listBridge.js', () => ({
  mountEquipamentosList: vi.fn(() => Promise.resolve()),
  unmountEquipamentosList: vi.fn(),
}));

vi.mock('../ui/views/equipamentos/bridges/renderPlan.js', () => ({
  bindRenderEquipPlanInvalidationEvents: vi.fn(),
  configureRenderEquipPlan: vi.fn(),
  refreshRenderEquipPlan: vi.fn(),
}));

vi.mock('../ui/views/equipamentos/state/renderPlanState.js', () => ({
  incrementRenderEquipPlanToken: vi.fn(() => 1),
  getRenderEquipPlanNeedsRefresh: vi.fn(() => false),
}));

vi.mock('../ui/views/equipamentos/contextState.js', () => ({
  configureEquipContextState: vi.fn(),
  getActiveQuickFilter: vi.fn(() => null),
  getRouteEquipCtx: vi.fn(() => ({ sectorId: null, quickFilter: null })),
  navigateEquipCtx: vi.fn(),
  resolveEquipCtx: vi.fn(() => ({
    sectorId: null,
    quickFilter: null,
    clienteId: null,
    clienteNome: '',
  })),
}));

vi.mock('../ui/views/equipamentos/setor/setorUI.js', () => ({
  configureSetorUI: vi.fn(),
  renderSetorGrid: vi.fn(() => undefined),
  renderSetorGridForCliente: vi.fn(() => undefined),
}));

vi.mock('../ui/views/equipamentos/setor/setorNavigation.js', () => ({
  configureSetorNavigation: vi.fn(),
  setActiveSector: vi.fn(),
}));

vi.mock('../ui/views/equipamentos/setor/setorPersist.js', () => ({
  configureSetorPersist: vi.fn(),
  assignEquipToSetor: vi.fn(),
  deleteSetor: vi.fn(),
  ensureProForSetores: vi.fn(),
  moveEquipsToSetor: vi.fn(),
  saveSetor: vi.fn(),
}));

function setupDom() {
  document.body.innerHTML = `
    <input id="eq-nome" />
    <input id="eq-local" />
    <input id="eq-tag" />
    <input id="eq-modelo" />
    <input id="eq-tipo" />
    <input id="eq-criticidade" />
    <input id="eq-prioridade" />
    <input id="eq-periodicidade" />
    <input id="eq-setor" />
    <input id="eq-cliente" />
    <input id="eq-fluido" />
    <input id="eq-componente" />
    <input id="dp-tensao" />
    <div id="equip-page-subtitle"></div>
    <div id="equip-page-title"></div>
    <div id="equip-toolbar-actions"></div>
    <div id="equip-search-bar"></div>
    <div id="equip-hero"></div>
    <div id="equip-filters"></div>
    <div id="equip-context-chip"></div>
    <div id="lista-equip"></div>
    <div id="modal-add-eq-title"></div>
    <button id="eq-save-primary"></button>
    <button id="eq-save-secondary"></button>
    <div id="eq-save-tertiary-row"></div>
    <button id="eq-save-tertiary"></button>
    <div id="eq-action-footer-hint"></div>
    <div id="eq-step-2"></div>
  `;
}

async function importSubject() {
  const equipamentos = await import('../ui/views/equipamentos.js');
  const editingState = await import('../ui/views/equipamentos/state/editingState.js');
  return { ...equipamentos, ...editingState };
}

beforeEach(() => {
  vi.resetModules();
  setupDom();
  mocks.currentState = {
    equipamentos: [],
    registros: [],
    clientes: [],
    setores: [],
  };
  mocks.vals = {
    'eq-nome': 'Split Sala',
    'eq-local': 'Sala',
    'eq-tag': 'TAG-1',
    'eq-modelo': 'Modelo A',
    'eq-tipo': 'Split Hi-Wall',
    'eq-criticidade': 'alta',
    'eq-prioridade': 'alta',
    'eq-periodicidade': '45',
    'eq-setor': 'setor-1',
    'eq-cliente': 'cliente-1',
    'eq-fluido': 'R-32',
    'eq-componente': 'Evaporadora',
  };
  mocks.getState.mockImplementation(() => ({
    equipamentos: [...mocks.currentState.equipamentos],
    registros: [...mocks.currentState.registros],
    clientes: [...mocks.currentState.clientes],
    setores: [...mocks.currentState.setores],
  }));
  mocks.findEquip.mockImplementation((id) =>
    mocks.currentState.equipamentos.find((eq) => eq.id === id),
  );
  mocks.findSetor.mockImplementation((id) =>
    mocks.currentState.setores.find((setor) => setor.id === id),
  );
  mocks.setState.mockImplementation((updater) => {
    const next = updater(mocks.currentState);
    if (next) mocks.currentState = next;
  });
  Object.values(mocks).forEach((value) => {
    if (typeof value?.mockClear === 'function') value.mockClear();
  });
  mocks.uid.mockReturnValue('eq-new');
  mocks.checkPlanLimit.mockReturnValue({ blocked: false });
  mocks.validateEquipamentoPayload.mockImplementation((payload) => ({
    valid: true,
    value: payload,
  }));
  mocks.collectDadosPlaca.mockReturnValue({ tensao: '220' });
  mocks.normalizePhotoList.mockImplementation((value) => (Array.isArray(value) ? value : []));
});

describe('saveEquip legacy behavior', () => {
  it('preserva criação de equipamento com payload, reset de UI e feedback', async () => {
    const { saveEquip } = await importSubject();

    const ok = await saveEquip();

    expect(ok).toBe(true);
    expect(mocks.currentState.equipamentos).toEqual([
      expect.objectContaining({
        id: 'eq-new',
        nome: 'Split Sala',
        local: 'Sala',
        status: 'ok',
        tag: 'TAG-1',
        tipo: 'Split Hi-Wall',
        modelo: 'Modelo A',
        fluido: 'R-32',
        componente: 'Evaporadora',
        criticidade: 'alta',
        prioridadeOperacional: 'alta',
        periodicidadePreventivaDias: 45,
        setorId: 'setor-1',
        clienteId: 'cliente-1',
        fotos: [],
        dadosPlaca: { tensao: '220' },
      }),
    ]);
    expect(mocks.modalClose).toHaveBeenCalledWith('modal-add-eq');
    expect(mocks.renderDashboard).toHaveBeenCalledTimes(1);
    expect(mocks.updateGlobalHeader).toHaveBeenCalledTimes(1);
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Equipamento cadastrado.');
  });

  it('preserva edição de equipamento existente e fotos persistidas', async () => {
    mocks.currentState.equipamentos = [
      {
        id: 'eq-1',
        nome: 'Antigo',
        local: 'Sala antiga',
        status: 'warn',
        tag: 'OLD',
        tipo: 'Split Hi-Wall',
        modelo: 'Old Model',
        fluido: 'R-410A',
        componente: 'Condensadora',
        criticidade: 'media',
        prioridadeOperacional: 'normal',
        periodicidadePreventivaDias: 30,
        setorId: null,
        clienteId: null,
        fotos: [{ id: 'foto-1', url: 'https://example.test/foto.jpg' }],
        dadosPlaca: {},
      },
    ];
    const { saveEquip, setEditingEquipId } = await importSubject();
    setEditingEquipId('eq-1');

    const ok = await saveEquip();

    expect(ok).toBe(true);
    expect(mocks.uid).not.toHaveBeenCalled();
    expect(mocks.normalizePhotoList).toHaveBeenCalledWith([
      { id: 'foto-1', url: 'https://example.test/foto.jpg' },
    ]);
    expect(mocks.currentState.equipamentos).toEqual([
      expect.objectContaining({
        id: 'eq-1',
        nome: 'Split Sala',
        local: 'Sala',
        status: 'warn',
        tag: 'TAG-1',
        tipo: 'Split Hi-Wall',
        modelo: 'Modelo A',
        fotos: [{ id: 'foto-1', url: 'https://example.test/foto.jpg' }],
        dadosPlaca: { tensao: '220' },
      }),
    ]);
    expect(mocks.checkPlanLimit).not.toHaveBeenCalled();
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Equipamento atualizado.');
  });
});
