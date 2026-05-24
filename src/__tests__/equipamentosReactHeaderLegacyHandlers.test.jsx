import { readFileSync } from 'node:fs';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindEvents } from '../core/events.js';
import { bindEquipmentHandlers } from '../ui/controller/handlers/equipmentHandlers.js';
import { bindNavigationHandlers } from '../ui/controller/handlers/navigationHandlers.js';
import {
  mountEquipamentosHeader,
  unmountEquipamentosHeader,
} from '../features/equipamentos/bridges/headerBridge.js';
import {
  EQUIPAMENTOS_ACTIONS,
  EQUIPAMENTOS_PUBLIC_IDS,
} from '../ui/viewModels/equipamentosContracts.js';

const mocks = vi.hoisted(() => ({
  modalOpen: vi.fn(),
  modalClose: vi.fn(),
  goTo: vi.fn(),
  setActiveSector: vi.fn(),
  setActiveQuickFilter: vi.fn(),
  clearForcedEquipContext: vi.fn(),
  clearEquipEditingState: vi.fn(),
  clearSetorEditingState: vi.fn(),
  clearEquipPhotosEditingState: vi.fn(),
  applyEquipModalExperience: vi.fn(),
  lockEquipContext: vi.fn(),
  syncComponenteVisibility: vi.fn(),
  initEqContextPickers: vi.fn(),
  populateClienteSelect: vi.fn(),
  setVal: vi.fn(),
  storageSave: vi.fn(),
  storageLoad: vi.fn(),
  fetchOperationalProfile: vi.fn(),
  hasPlusAccess: vi.fn(),
  getMonthlyUsageSnapshot: vi.fn(),
  applyNameplateCtaGate: vi.fn(),
  resetNameplateCtaState: vi.fn(),
  isCachedPlanPlusOrHigher: vi.fn(),
  isCachedPlanPro: vi.fn(),
}));

vi.mock('../core/modal.js', () => ({
  Modal: {
    open: mocks.modalOpen,
    close: mocks.modalClose,
  },
  CustomConfirm: {
    show: vi.fn(),
  },
}));

vi.mock('../core/router.js', () => ({
  goTo: mocks.goTo,
}));

vi.mock('../core/utils.js', () => ({
  Utils: {
    getEl: (id) => document.getElementById(id),
    setVal: mocks.setVal,
  },
}));

vi.mock('../core/storage.js', () => ({
  Storage: {
    save: mocks.storageSave,
    load: mocks.storageLoad,
  },
}));

vi.mock('../ui/views/equipamentos.js', () => ({
  saveEquip: vi.fn(),
  viewEquip: vi.fn(),
  deleteEquip: vi.fn(),
  openEditEquip: vi.fn(),
  openEquipPhotosEditor: vi.fn(),
  saveEquipPhotos: vi.fn(),
  saveSetor: vi.fn(),
  deleteSetor: vi.fn(),
  setActiveSector: mocks.setActiveSector,
  setActiveQuickFilter: mocks.setActiveQuickFilter,
  initSetorColorPicker: vi.fn(),
  openEditSetor: vi.fn(),
  clearSetorEditingState: mocks.clearSetorEditingState,
  moveEquipsToSetor: vi.fn(),
  renderEquip: vi.fn(),
  clearForcedEquipContext: mocks.clearForcedEquipContext,
  applyEquipModalExperience: mocks.applyEquipModalExperience,
  clearEditingState: mocks.clearEquipEditingState,
  clearEquipPhotosEditingState: mocks.clearEquipPhotosEditingState,
  lockEquipContext: mocks.lockEquipContext,
  syncComponenteVisibility: mocks.syncComponenteVisibility,
}));

vi.mock('../ui/views/clientes.js', () => ({
  populateClienteSelect: mocks.populateClienteSelect,
}));

vi.mock('../ui/views/equipamentos/contextState.js', () => ({
  getRouteEquipCtx: vi.fn(() => ({
    clienteId: 'cli-route',
    clienteNome: 'Cliente da rota',
    sectorId: 'setor-route',
  })),
}));

vi.mock('../ui/components/eqContextPicker.js', () => ({
  initEqContextPickers: mocks.initEqContextPickers,
}));

vi.mock('../ui/components/actionFeedback.js', () => ({
  runAsyncAction: async (_el, _opts, action) => action(),
}));

vi.mock('../core/errors.js', () => ({
  ErrorCodes: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
  },
  handleError: vi.fn(),
}));

vi.mock('../core/toast.js', () => ({
  Toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../core/telemetry.js', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('../ui/components/photos.js', () => ({
  Photos: {
    closeLightbox: vi.fn(),
  },
}));

vi.mock('../ui/components/supportFeedbackModal.js', () => ({
  SupportFeedbackModal: {
    open: vi.fn(),
  },
}));

vi.mock('../ui/components/tour.js', () => ({
  Tour: {
    restart: vi.fn(),
  },
}));

vi.mock('../ui/components/onboarding/onboardingChecklist.js', () => ({
  OnboardingChecklist: {
    dismiss: vi.fn(),
  },
}));

vi.mock('../ui/components/authscreen.js', () => ({
  AuthScreen: {
    show: vi.fn(),
  },
}));

vi.mock('../ui/components/nameplateCapture.js', () => ({
  applyNameplateCtaGate: mocks.applyNameplateCtaGate,
  resetNameplateCtaState: mocks.resetNameplateCtaState,
}));

vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPlusOrHigher: mocks.isCachedPlanPlusOrHigher,
  isCachedPlanPro: mocks.isCachedPlanPro,
}));

vi.mock('../core/plans/operationalPlan.js', () => ({
  fetchOperationalProfile: mocks.fetchOperationalProfile,
}));

vi.mock('../core/plans/subscriptionPlans.js', () => ({
  hasPlusAccess: mocks.hasPlusAccess,
}));

vi.mock('../core/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } } })),
    },
  },
}));

vi.mock('../core/usageLimits.js', () => ({
  USAGE_RESOURCE_NAMEPLATE_ANALYSIS: 'nameplate_analysis',
  getMonthlyLimitForPlan: vi.fn(() => 1),
  getMonthlyUsageSnapshot: mocks.getMonthlyUsageSnapshot,
}));

vi.mock('../ui/components/pushOptInCard.js', () => ({
  PushOptInCard: {
    enable: vi.fn(),
    disable: vi.fn(),
    render: vi.fn(),
  },
}));

vi.mock('../ui/components/installAppPrompt.js', () => ({
  InstallAppPrompt: {
    prompt: vi.fn(),
    dismiss: vi.fn(),
  },
}));

function setShell() {
  document.body.innerHTML = `
    <section id="${EQUIPAMENTOS_PUBLIC_IDS.view}">
      <section id="${EQUIPAMENTOS_PUBLIC_IDS.hero}" class="equip-hero" hidden></section>
      <nav id="${EQUIPAMENTOS_PUBLIC_IDS.filters}" class="equip-filters" hidden></nav>
      <div id="${EQUIPAMENTOS_PUBLIC_IDS.contextChip}"></div>
      <input id="${EQUIPAMENTOS_PUBLIC_IDS.searchInput}" />
      <div id="${EQUIPAMENTOS_PUBLIC_IDS.toolbarActions}">
        <button type="button"
          data-action="${EQUIPAMENTOS_ACTIONS.openModal}"
          data-id="modal-add-eq"
          data-cliente-id="cli-1"
          data-setor-id="setor-1"
          data-focus-field="nome"
          data-after-save="select-in-eq-modal">Novo</button>
        <button type="button"
          data-action="${EQUIPAMENTOS_ACTIONS.addForCliente}"
          data-id="cli-1">Adicionar para cliente</button>
        <button type="button"
          data-action="${EQUIPAMENTOS_ACTIONS.unlockContext}">Alterar contexto</button>
      </div>
      <div class="equip-view-toggle" role="group">
        <button type="button"
          data-action="${EQUIPAMENTOS_ACTIONS.setViewMode}"
          data-mode="grid">Grade</button>
      </div>
      <article
        data-action="${EQUIPAMENTOS_ACTIONS.openSetor}"
        data-id="setor-1"
        data-setor-id="setor-1">Setor</article>
      <div id="${EQUIPAMENTOS_PUBLIC_IDS.list}" data-react-equipamentos-list-mounted="true"></div>
    </section>
    <select id="eq-tipo"><option value="Split">Split</option></select>
    <select id="eq-setor"><option value="setor-1">Setor 1</option></select>
    <select id="eq-cliente"><option value="cli-1">Cliente 1</option></select>
  `;
}

function createHeaderViewModel(overrides = {}) {
  return {
    hero: {
      visible: true,
      title: 'Atencao agora',
      subtitle: '1 equipamento precisando acao imediata.',
      items: [{ id: 'eq-1', name: 'Split Alpha' }],
      ...overrides.hero,
    },
    filters: {
      visible: true,
      chips: [
        { id: 'todos', label: 'Todos', count: 2, tone: 'neutral', active: true, empty: false },
        {
          id: 'criticos',
          label: 'Criticos',
          count: 1,
          tone: 'danger',
          active: false,
          empty: false,
        },
      ],
      ...overrides.filters,
    },
    context: {
      visible: true,
      label: 'Filtrando: Cliente Alpha',
      ...overrides.context,
    },
  };
}

async function mountHeader(viewModel = createHeaderViewModel()) {
  const root = document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.hero);
  await mountEquipamentosHeader({
    root,
    filtersRoot: document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.filters),
    contextRoot: document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.contextChip),
    viewModel,
  });
  return root;
}

async function click(selector) {
  const el = document.querySelector(selector);
  expect(el).not.toBeNull();
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  await Promise.resolve();
  await Promise.resolve();
  return el;
}

beforeAll(() => {
  bindEvents();
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isCachedPlanPlusOrHigher.mockReturnValue(false);
  mocks.fetchOperationalProfile.mockResolvedValue({ profile: { plan_code: 'free' } });
  mocks.hasPlusAccess.mockReturnValue(false);
  mocks.getMonthlyUsageSnapshot.mockResolvedValue({ nameplate_analysis: 0 });
  window.__setEquipViewMode = vi.fn();
  setShell();
  bindEquipmentHandlers();
  bindNavigationHandlers();
});

afterEach(() => {
  unmountEquipamentosHeader();
  delete window.__setEquipViewMode;
  document.body.innerHTML = '';
});

afterAll(() => {
  delete document.body.dataset.setorKebabBound;
  delete document.body.dataset.helpMenuBound;
});

describe('equipamentos React header with legacy handlers', () => {
  it('keeps quick filters delegated to the legacy filter state while the React list remains mounted', async () => {
    await mountHeader();

    await click(
      `#${EQUIPAMENTOS_PUBLIC_IDS.filters} [data-action="${EQUIPAMENTOS_ACTIONS.quickFilter}"][data-id="criticos"]`,
    );

    expect(mocks.setActiveQuickFilter).toHaveBeenCalledWith('criticos');
    expect(
      document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.list)?.dataset.reactEquipamentosListMounted,
    ).toBe('true');
    expect(document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.hero)?.dataset).toMatchObject({
      equipamentosHeaderMounted: 'true',
    });
  });

  it('keeps context clearing and view mode delegated to legacy handlers', async () => {
    await mountHeader();

    await click(
      `#${EQUIPAMENTOS_PUBLIC_IDS.contextChip} [data-action="${EQUIPAMENTOS_ACTIONS.clearClienteFilter}"]`,
    );
    await vi.waitFor(() => {
      expect(mocks.goTo).toHaveBeenCalledWith('equipamentos');
    });

    await click(`[data-action="${EQUIPAMENTOS_ACTIONS.setViewMode}"][data-mode="grid"]`);

    expect(window.__setEquipViewMode).toHaveBeenCalledWith('grid');
  });

  it('keeps modal, setor and registration actions compatible with legacy handlers', async () => {
    await mountHeader();

    const modalTrigger = await click(
      `#${EQUIPAMENTOS_PUBLIC_IDS.toolbarActions} [data-action="${EQUIPAMENTOS_ACTIONS.openModal}"]`,
    );
    expect(modalTrigger.dataset).toMatchObject({
      id: 'modal-add-eq',
      clienteId: 'cli-1',
      setorId: 'setor-1',
      focusField: 'nome',
      afterSave: 'select-in-eq-modal',
    });
    expect(mocks.clearEquipEditingState).toHaveBeenCalled();
    expect(mocks.clearForcedEquipContext).toHaveBeenCalled();
    expect(mocks.modalOpen).toHaveBeenCalledWith('modal-add-eq');
    await vi.waitFor(() => {
      expect(mocks.applyEquipModalExperience).toHaveBeenCalledWith({ triggerEl: modalTrigger });
    });

    const setorTrigger = await click(`[data-action="${EQUIPAMENTOS_ACTIONS.openSetor}"]`);
    expect(setorTrigger.dataset).toMatchObject({ id: 'setor-1', setorId: 'setor-1' });
    expect(mocks.setActiveSector).toHaveBeenCalledWith('setor-1');

    await click(
      `#${EQUIPAMENTOS_PUBLIC_IDS.hero} [data-action="${EQUIPAMENTOS_ACTIONS.goRegisterEquip}"]`,
    );
    expect(mocks.modalClose).toHaveBeenCalledWith('modal-eq-det');
    expect(mocks.goTo).toHaveBeenCalledWith('registro', { equipId: 'eq-1' });
  });

  it('keeps cliente add and unlock-context actions delegated without executing storage', async () => {
    await mountHeader();

    await click(
      `#${EQUIPAMENTOS_PUBLIC_IDS.toolbarActions} [data-action="${EQUIPAMENTOS_ACTIONS.addForCliente}"]`,
    );
    await vi.waitFor(() => {
      expect(mocks.populateClienteSelect).toHaveBeenCalled();
    });
    expect(mocks.modalOpen).toHaveBeenCalledWith('modal-add-eq');
    expect(mocks.setVal).toHaveBeenCalledWith('eq-cliente', 'cli-1');

    await click(
      `#${EQUIPAMENTOS_PUBLIC_IDS.toolbarActions} [data-action="${EQUIPAMENTOS_ACTIONS.unlockContext}"]`,
    );

    expect(mocks.clearForcedEquipContext).toHaveBeenCalled();
    expect(mocks.applyEquipModalExperience).toHaveBeenCalled();
    expect(mocks.storageSave).not.toHaveBeenCalled();
    expect(mocks.storageLoad).not.toHaveBeenCalled();
  });

  it('keeps malicious data and text inert and avoids direct createRoot in equipamentos.js', async () => {
    const malicious = 'javascript:alert(1)" onclick="alert(2)"><img src=x onerror=alert(3)>';
    await mountHeader(
      createHeaderViewModel({
        hero: {
          title: malicious,
          subtitle: malicious,
          items: [{ id: malicious, name: malicious }],
        },
        filters: {
          chips: [
            {
              id: malicious,
              label: malicious,
              count: 1,
              tone: 'danger',
              active: true,
              empty: false,
            },
          ],
        },
        context: {
          visible: true,
          label: malicious,
        },
      }),
    );

    const view = document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.view);
    expect(view?.textContent).toContain(malicious);
    expect(view?.querySelector('script')).toBeNull();
    expect(view?.querySelector('img')).toBeNull();
    expect(view?.querySelector('[onerror]')).toBeNull();
    expect(view?.querySelector('[onclick]')).toBeNull();

    await click(
      `#${EQUIPAMENTOS_PUBLIC_IDS.hero} [data-action="${EQUIPAMENTOS_ACTIONS.goRegisterEquip}"]`,
    );
    expect(mocks.goTo).toHaveBeenCalledWith('registro', { equipId: malicious });

    const source = readFileSync('src/ui/views/equipamentos.js', 'utf8');
    expect(source).not.toMatch(/react-dom\/client|createRoot/);
  });
});
