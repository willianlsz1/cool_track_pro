import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  handlers: new Map(),
  routes: new Map(),
  goTo: vi.fn(),
  registerRoute: vi.fn((name, onEnter, onLeave) => {
    mocks.routes.set(name, { onEnter, onLeave });
  }),
  getState: vi.fn(),
  findEquip: vi.fn(),
  setState: vi.fn(),
  markRegistroDeleted: vi.fn(),
  customConfirmShow: vi.fn(),
  handleError: vi.fn(),
  cleanupOrphanSignatures: vi.fn(),
  getSignatureForRecord: vi.fn(),
  openSignatureViewer: vi.fn(),
  openLightbox: vi.fn(),
  toastWarning: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  updateHeader: vi.fn(),
  updateGlobalHeader: vi.fn(),
  getOperationalStatus: vi.fn(),
  buildClientePmocDetails: vi.fn(),
  mountHistoricoFiltersDom: vi.fn((root) => {
    root.dataset.mounted = 'filters';
  }),
  mountHistoricoTimelineDom: vi.fn((root, props = {}) => {
    root.dataset.mounted = 'timeline';
    root.dataset.groupCount = String(props.viewModel?.groups?.length ?? 0);
  }),
  unmountHistoricoFiltersDom: vi.fn(),
  unmountHistoricoTimelineDom: vi.fn(),
  initRegistro: vi.fn(),
  loadRegistroForEdit: vi.fn(),
  clearRegistro: vi.fn(),
  saveRegistro: vi.fn(),
  applyQuickTemplate: vi.fn(),
  setChecklistItemStatus: vi.fn(),
  setChecklistItemObs: vi.fn(),
  setChecklistItemMeasure: vi.fn(),
  captureRegistroSignatureFromHint: vi.fn(),
  openRegistroSignatureFromHint: vi.fn(),
  removeRegistroSignatureFromHint: vi.fn(),
}));

vi.mock('../core/events.js', () => ({
  on: (action, handler) => mocks.handlers.set(action, handler),
}));

vi.mock('../core/router.js', () => ({
  currentRoute: vi.fn(() => 'historico'),
  goTo: mocks.goTo,
  registerRoute: mocks.registerRoute,
}));

vi.mock('../core/state.js', () => ({
  getState: mocks.getState,
  findEquip: mocks.findEquip,
  setState: mocks.setState,
}));

vi.mock('../core/storage.js', () => ({
  Storage: { markRegistroDeleted: mocks.markRegistroDeleted },
}));

vi.mock('../core/modal.js', () => ({
  Modal: { open: vi.fn(), close: vi.fn() },
  CustomConfirm: { show: mocks.customConfirmShow },
}));

vi.mock('../core/errors.js', () => ({
  ErrorCodes: { VALIDATION_ERROR: 'VALIDATION_ERROR' },
  handleError: mocks.handleError,
}));

vi.mock('../core/toast.js', () => ({
  Toast: {
    warning: mocks.toastWarning,
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

vi.mock('../core/telemetry.js', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('../core/equipmentRules.js', () => ({
  getOperationalStatus: mocks.getOperationalStatus,
}));

vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPlusOrHigher: vi.fn(() => true),
  isCachedPlanPro: vi.fn(() => false),
}));

vi.mock('../core/clientePmoc.js', () => ({
  buildClientePmocDetails: mocks.buildClientePmocDetails,
}));

vi.mock('../ui/components/photos.js', () => ({
  Photos: { openLightbox: mocks.openLightbox, closeLightbox: vi.fn() },
}));

vi.mock('../ui/components/signature.js', () => ({
  cleanupOrphanSignatures: mocks.cleanupOrphanSignatures,
  getSignatureForRecord: mocks.getSignatureForRecord,
  SignatureViewerModal: { open: mocks.openSignatureViewer },
}));

vi.mock('../ui/components/skeleton.js', () => ({
  withSkeleton: (_root, _options, render) => render(),
}));

vi.mock('../ui/components/historicoFiltersSheet.js', () => ({
  HistoricoFiltersSheet: { open: vi.fn() },
}));

vi.mock('../ui/components/onboarding.js', () => ({
  SavedHighlight: { applyIfPending: vi.fn(), markForHighlight: vi.fn() },
}));

vi.mock('../ui/components/actionFeedback.js', () => ({
  runAsyncAction: vi.fn((_el, _options, action) => action()),
}));

vi.mock('../ui/components/supportFeedbackModal.js', () => ({
  SupportFeedbackModal: { open: vi.fn() },
}));

vi.mock('../ui/components/tour.js', () => ({
  Tour: { restart: vi.fn() },
}));

vi.mock('../ui/components/nameplateCapture.js', () => ({
  applyNameplateCtaGate: vi.fn(),
  resetNameplateCtaState: vi.fn(),
}));

vi.mock('../ui/components/pushOptInCard.js', () => ({
  PushOptInCard: {},
}));

vi.mock('../ui/components/installAppPrompt.js', () => ({
  InstallAppPrompt: {},
}));

vi.mock('../ui/views/equipamentos.js', () => ({
  populateEquipSelects: vi.fn(),
  renderEquip: vi.fn(),
  unmountEquipamentosHeader: vi.fn(),
  unmountEquipamentosList: vi.fn(),
  clearEditingState: vi.fn(),
  clearForcedEquipContext: vi.fn(),
  clearSetorEditingState: vi.fn(),
  clearEquipPhotosEditingState: vi.fn(),
  lockEquipContext: vi.fn(),
}));

vi.mock('../ui/views/dashboard.js', () => ({
  renderDashboard: vi.fn(),
  updateHeader: mocks.updateHeader,
}));

vi.mock('../ui/composables/header.js', () => ({
  updateGlobalHeader: mocks.updateGlobalHeader,
}));

vi.mock('../ui/views/registro.js', () => ({
  initRegistro: mocks.initRegistro,
  loadRegistroForEdit: mocks.loadRegistroForEdit,
  clearRegistro: mocks.clearRegistro,
  saveRegistro: mocks.saveRegistro,
  applyQuickTemplate: mocks.applyQuickTemplate,
  setChecklistItemStatus: mocks.setChecklistItemStatus,
  setChecklistItemObs: mocks.setChecklistItemObs,
  setChecklistItemMeasure: mocks.setChecklistItemMeasure,
  captureRegistroSignatureFromHint: mocks.captureRegistroSignatureFromHint,
  openRegistroSignatureFromHint: mocks.openRegistroSignatureFromHint,
  removeRegistroSignatureFromHint: mocks.removeRegistroSignatureFromHint,
  unmountRegistroHeader: vi.fn(),
  unmountRegistroChecklist: vi.fn(),
  unmountRegistroPhotos: vi.fn(),
  unmountRegistroSignature: vi.fn(),
}));

vi.mock('../ui/viewModels/registroSignatureModel.js', () => ({
  REGISTRO_SIGNATURE_ACTIONS: {
    capture: 'registro-signature-capture',
    open: 'registro-signature-open',
    remove: 'registro-signature-remove',
  },
}));

vi.mock('../ui/views/historico/filtersRenderer.js', () => ({
  mountHistoricoFiltersDom: mocks.mountHistoricoFiltersDom,
  unmountHistoricoFiltersDom: mocks.unmountHistoricoFiltersDom,
}));

vi.mock('../ui/views/historico/timelineRenderer.js', () => ({
  mountHistoricoTimelineDom: mocks.mountHistoricoTimelineDom,
  unmountHistoricoTimelineDom: mocks.unmountHistoricoTimelineDom,
}));

vi.mock('../ui/views/clientes.js', () => ({
  renderClientes: vi.fn(),
  unmountClientes: vi.fn(),
}));

vi.mock('../core/plans/clientesAccess.js', () => ({
  getClientesAccessSnapshot: vi.fn(() => ({ resolved: true, canAccess: true })),
  resolveClientesAccess: vi.fn(() => Promise.resolve({ resolved: true, canAccess: true })),
}));

vi.mock('../ui/components/onboarding/onboardingChecklist.js', () => ({
  OnboardingChecklist: { markStep: vi.fn() },
}));

function actionElement(dataset = {}) {
  return { dataset };
}

function mountHistoricoDom() {
  document.body.innerHTML = `
    <main id="view-historico">
      <div id="hist-sticky-header"></div>
      <div id="hist-count"></div>
      <input id="hist-busca" value="" />
      <button id="hist-filters-trigger"></button>
      <span id="hist-filters-count"></span>
      <select id="hist-setor"></select>
      <select id="hist-equip"></select>
      <div id="hist-quickfilters-slot"></div>
      <div id="hist-active-chips-slot"></div>
      <div id="hist-chrono-label"></div>
      <section id="historico-filters-root"></section>
      <section id="timeline"></section>
    </main>
  `;
}

function createState() {
  return {
    registros: [
      {
        id: 'reg-delete-target',
        equipId: 'eq-1',
        data: '2026-05-01T08:00:00',
        tipo: 'Preventiva',
        status: 'warn',
      },
      {
        id: 'reg-remaining',
        equipId: 'eq-1',
        data: '2026-04-20T08:00:00',
        tipo: 'Preventiva',
        status: 'ok',
        proxima: '2026-06-01',
      },
    ],
    equipamentos: [{ id: 'eq-1', nome: 'Split Recepcao', status: 'warn' }],
    setores: [],
    clientes: [],
  };
}

async function flushAsyncWork() {
  if (typeof vi.dynamicImportSettled === 'function') {
    await vi.dynamicImportSettled();
  }
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
  }
}

describe('Historico -> Registro edit/delete integration contract', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.handlers.clear();
    mocks.routes.clear();
    document.body.innerHTML = '';
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
    mocks.getOperationalStatus.mockReturnValue({ uiStatus: 'ok', label: 'Em dia' });
    mocks.buildClientePmocDetails.mockReturnValue({ status: 'em_dia', statusLabel: 'Em dia' });
    mocks.getSignatureForRecord.mockReturnValue(null);
  });

  it('edit-reg navega para Registro usando o mesmo data-id como editRegistroId', async () => {
    const { bindNavigationHandlers } =
      await import('../ui/controller/handlers/navigationHandlers.js');
    bindNavigationHandlers();

    const editHandler = mocks.handlers.get('edit-reg');
    expect(editHandler).toBeTypeOf('function');

    editHandler(actionElement({ id: 'reg-edit-1' }));

    expect(mocks.goTo).toHaveBeenCalledWith('registro', { editRegistroId: 'reg-edit-1' });
  });

  it('delete-reg cancelado nao chama deleteReg nem altera storage/state', async () => {
    const currentState = createState();
    mocks.getState.mockReturnValue(currentState);
    mocks.customConfirmShow.mockResolvedValue(false);

    const { bindRegistroHandlers } = await import('../ui/controller/handlers/registroHandlers.js');
    bindRegistroHandlers();

    const deleteHandler = mocks.handlers.get('delete-reg');
    expect(deleteHandler).toBeTypeOf('function');

    await deleteHandler(actionElement({ id: 'reg-delete-target' }));

    expect(mocks.customConfirmShow).toHaveBeenCalledWith(
      'Excluir este registro?',
      'Essa ação não pode ser desfeita.',
      expect.objectContaining({
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger',
      }),
    );
    expect(mocks.markRegistroDeleted).not.toHaveBeenCalled();
    expect(mocks.setState).not.toHaveBeenCalled();
    expect(mocks.toastWarning).not.toHaveBeenCalled();
  });

  it('delete-reg confirmado chama deleteReg com data-id e preserva storage, state, re-render e Toast', async () => {
    let currentState = createState();
    mocks.getState.mockImplementation(() => currentState);
    mocks.findEquip.mockImplementation((id) =>
      currentState.equipamentos.find((equipamento) => equipamento.id === id),
    );
    mocks.setState.mockImplementation((updater) => {
      currentState = updater(currentState);
    });
    mocks.customConfirmShow.mockResolvedValue(true);
    localStorage.setItem('cooltrack-sig-reg-delete-target', 'assinatura');
    mountHistoricoDom();

    const { bindRegistroHandlers } = await import('../ui/controller/handlers/registroHandlers.js');
    bindRegistroHandlers();

    const deleteHandler = mocks.handlers.get('delete-reg');
    await act(async () => {
      await deleteHandler(actionElement({ id: 'reg-delete-target' }));
      await flushAsyncWork();
    });

    expect(mocks.markRegistroDeleted).toHaveBeenCalledWith('reg-delete-target');
    expect(mocks.setState).toHaveBeenCalledTimes(1);
    expect(currentState.registros.map((registro) => registro.id)).toEqual(['reg-remaining']);
    expect(currentState.equipamentos[0]).toEqual(
      expect.objectContaining({ id: 'eq-1', status: 'ok', statusDescricao: 'Em dia' }),
    );
    expect(localStorage.getItem('cooltrack-sig-reg-delete-target')).toBeNull();
    expect(mocks.mountHistoricoTimelineDom).toHaveBeenCalled();
    expect(document.getElementById('timeline')?.dataset.mounted).toBe('timeline');
    expect(mocks.updateGlobalHeader).toHaveBeenCalledTimes(1);
    expect(mocks.toastWarning).toHaveBeenCalledWith('Registro removido do histórico.');
  });

  it('fallbacks de id ausente e registro inexistente nao quebram o fluxo atual', async () => {
    const { bindNavigationHandlers } =
      await import('../ui/controller/handlers/navigationHandlers.js');
    bindNavigationHandlers();

    const editHandler = mocks.handlers.get('edit-reg');
    expect(() => editHandler(actionElement({}))).not.toThrow();
    expect(mocks.goTo).toHaveBeenCalledWith('registro', { editRegistroId: undefined });

    const currentState = createState();
    mocks.getState.mockReturnValue(currentState);
    mocks.customConfirmShow.mockResolvedValue(false);
    const { bindRegistroHandlers } = await import('../ui/controller/handlers/registroHandlers.js');
    bindRegistroHandlers();

    const deleteHandler = mocks.handlers.get('delete-reg');
    await expect(deleteHandler(actionElement({}))).resolves.toBeUndefined();
    expect(mocks.markRegistroDeleted).not.toHaveBeenCalled();
  });
});
