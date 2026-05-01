import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  EQUIPAMENTOS_ACTIONS,
  EQUIPAMENTOS_DATA_ATTRIBUTES,
  EQUIPAMENTOS_PUBLIC_CLASSES,
  EQUIPAMENTOS_PUBLIC_IDS,
} from '../ui/viewModels/equipamentosContracts.js';

const stateMocks = vi.hoisted(() => ({
  currentState: {
    equipamentos: [],
    registros: [],
    clientes: [],
    setores: [],
  },
  routeParams: {},
  isPro: false,
  getState: vi.fn(),
  findEquip: vi.fn(),
  findSetor: vi.fn(),
  regsForEquip: vi.fn(),
  setState: vi.fn(),
}));

const listIslandMocks = vi.hoisted(() => ({
  mountEquipamentosListReact: vi.fn((root, { viewModel } = {}) => {
    root.dataset.reactEquipamentosListMounted = 'true';
    root.innerHTML = viewModel?.emptyState
      ? '<div class="empty-state" data-testid="equip-list-react-empty"></div>'
      : '<div data-testid="equip-list-react-mounted"></div>';
    return root;
  }),
  unmountEquipamentosListReact: vi.fn((root) => {
    delete root.dataset.reactEquipamentosListMounted;
    root.innerHTML = '';
  }),
}));

vi.mock('../core/state.js', () => ({
  getState: stateMocks.getState,
  findEquip: stateMocks.findEquip,
  findSetor: stateMocks.findSetor,
  regsForEquip: stateMocks.regsForEquip,
  setState: stateMocks.setState,
}));

vi.mock('../core/router.js', () => ({
  currentRoute: vi.fn(() => 'equipamentos'),
  currentRouteParams: vi.fn(() => stateMocks.routeParams),
  goTo: vi.fn(),
}));

vi.mock('../react/entrypoints/equipamentosListIsland.jsx', () => ({
  mountEquipamentosListReact: listIslandMocks.mountEquipamentosListReact,
  unmountEquipamentosListReact: listIslandMocks.unmountEquipamentosListReact,
}));

vi.mock('../ui/components/skeleton.js', () => ({
  withSkeleton: (_el, _opts, renderFn) => renderFn(),
}));

vi.mock('../ui/components/onboarding.js', () => ({
  OnboardingBanner: { markAction: vi.fn() },
}));

vi.mock('../core/storage.js', () => ({
  Storage: { save: vi.fn(), load: vi.fn() },
}));

vi.mock('../core/toast.js', () => ({
  Toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../features/profile.js', () => ({
  Profile: { get: vi.fn(() => ({})) },
}));

vi.mock('../core/errors.js', () => ({
  ErrorCodes: { NETWORK_ERROR: 'NETWORK_ERROR', VALIDATION_ERROR: 'VALIDATION_ERROR' },
  handleError: vi.fn(),
}));

vi.mock('../core/planLimits.js', () => ({
  checkPlanLimit: vi.fn(() => ({ allowed: true })),
}));

vi.mock('../core/telemetry.js', () => ({
  trackEvent: vi.fn(),
}));

const getPreventivaDueEquipmentIds = vi.fn(() => []);
vi.mock('../domain/alerts.js', () => ({
  Alerts: { getAll: vi.fn(() => []) },
  getPreventivaDueEquipmentIds,
}));

vi.mock('../domain/priorityEngine.js', () => ({
  PRIORITY_LEVEL: { OK: 1, BAIXA: 2, ALTA: 3, URGENTE: 4 },
  evaluateEquipmentPriority: vi.fn((eq) => ({
    priorityLevel: eq?.__priorityLevel ?? 1,
    priorityLabel: 'mock',
  })),
}));

vi.mock('../domain/actionPriority.js', () => ({
  getActionPriorityScore: vi.fn((eq) => ({ actionPriorityScore: eq?.__actionScore ?? 0 })),
}));

vi.mock('../domain/suggestedAction.js', () => ({
  ACTION_CODE: {
    NONE: 'none',
    MONITOR: 'monitor',
    COLLECT_DATA: 'collect_data',
    REGISTER_CORRECTIVE: 'register_corrective',
    REGISTER_CORRECTIVE_IMMEDIATE: 'register_corrective_immediate',
    REGISTER_PREVENTIVE: 'register_preventive',
    SCHEDULE_PREVENTIVE: 'schedule_preventive',
  },
  evaluateEquipmentSuggestedAction: vi.fn((eq) => ({
    actionCode: eq?.__actionCode ?? 'register_preventive',
    actionLabel: eq?.__actionLabel ?? 'Registrar preventiva',
  })),
}));

vi.mock('../domain/maintenance.js', () => ({
  evaluateEquipmentHealth: vi.fn((eq) => ({
    score: eq?.__score ?? 82,
    context: {
      ultimoRegistro: null,
      proximaPreventiva: null,
      periodicidadeDias: eq?.periodicidadePreventivaDias ?? 30,
    },
  })),
  getEquipmentMaintenanceContext: vi.fn((eq) => ({
    ultimoRegistro: null,
    proximaPreventiva: null,
    periodicidadeDias: eq?.periodicidadePreventivaDias ?? 30,
  })),
  evaluateEquipmentRisk: vi.fn((eq) => ({
    score: eq?.__riskScore ?? 35,
    classification: eq?.__riskClassification ?? 'baixo',
    factors: eq?.__riskFactors ?? ['rotina estavel'],
  })),
  evaluateEquipmentRiskTrend: vi.fn(() => ({ trend: 'stable', delta: 0 })),
  getSuggestedPreventiveDays: vi.fn(() => 30),
  normalizePeriodicidadePreventivaDias: vi.fn((value) => value ?? 30),
}));

vi.mock('../domain/dadosPlacaDisplay.js', () => ({
  formatDadosPlacaRows: vi.fn(() => []),
}));

vi.mock('../domain/dadosPlacaValidation.js', () => ({
  DadosPlacaValidationError: class DadosPlacaValidationError extends Error {},
  formatDecimalHint: vi.fn(() => ''),
}));

vi.mock('../core/inputValidation.js', () => ({
  validateEquipamentoPayload: vi.fn((payload) => payload),
}));

vi.mock('../ui/components/equipmentPhotos.js', () => ({
  EquipmentPhotos: { clear: vi.fn() },
}));

vi.mock('../ui/components/nameplateCapture.js', () => ({
  resetCamposExtrasState: vi.fn(),
  setCamposExtrasState: vi.fn(),
}));

vi.mock('../ui/components/photos.js', () => ({
  Photos: {},
}));

vi.mock('../core/photoStorage.js', () => ({
  normalizePhotoList: vi.fn((value) => (Array.isArray(value) ? value : [])),
}));

vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPlusOrHigher: vi.fn(() => stateMocks.isPro),
  isCachedPlanPro: vi.fn(() => stateMocks.isPro),
  setCachedPlan: vi.fn(),
}));

vi.mock('../core/plans/subscriptionPlans.js', () => ({
  getEffectivePlan: vi.fn(() => (stateMocks.isPro ? 'pro' : 'free')),
  hasProAccess: vi.fn(() => stateMocks.isPro),
}));

vi.mock('../ui/views/dashboard.js', () => ({
  calcHealthScore: vi.fn(() => 82),
  getHealthClass: vi.fn(() => 'ok'),
  updateHeader: vi.fn(),
}));

function setupDom() {
  document.body.innerHTML = `
    <section id="view-equipamentos">
      <section id="equip-hero" class="equip-hero" aria-labelledby="equip-hero-title" hidden>
        <h1 class="equip-hero__title" id="equip-hero-title">Atencao agora</h1>
        <p class="equip-hero__sub" id="equip-hero-sub"></p>
        <div class="equip-hero__cta" id="equip-hero-sem-setor-cta" hidden></div>
        <div class="equip-hero__kpis" id="equip-hero-kpis" role="list"></div>
      </section>
      <nav id="equip-filters" class="equip-filters" aria-label="Filtrar equipamentos" hidden></nav>
      <h1 id="equip-page-title"></h1>
      <p id="equip-page-subtitle"></p>
      <div id="equip-toolbar-actions"></div>
      <div id="equip-context-chip"></div>
      <div class="equip-search-row">
        <div class="search-bar" id="equip-search-bar">
          <input class="form-control search-bar__input" id="equip-busca" />
        </div>
        <div class="equip-view-toggle" role="group">
          <button type="button" class="equip-view-toggle__btn" data-action="equip-set-view-mode" data-mode="list">Lista</button>
          <button type="button" class="equip-view-toggle__btn" data-action="equip-set-view-mode" data-mode="grid">Grade</button>
        </div>
      </div>
      <div id="lista-equip" role="list"></div>
    </section>
    <select id="eq-setor"></select>
    <div id="eq-setor-wrapper"></div>
  `;
}

function setState(nextState = {}) {
  stateMocks.currentState = {
    equipamentos: [],
    registros: [],
    clientes: [],
    setores: [],
    ...nextState,
  };
  stateMocks.getState.mockImplementation(() => stateMocks.currentState);
  stateMocks.findEquip.mockImplementation((id) =>
    stateMocks.currentState.equipamentos.find((eq) => eq.id === id),
  );
  stateMocks.findSetor.mockImplementation((id) =>
    stateMocks.currentState.setores.find((setor) => setor.id === id),
  );
  stateMocks.regsForEquip.mockImplementation((id) =>
    stateMocks.currentState.registros.filter((registro) => registro.equipamentoId === id),
  );
}

async function renderEquip(filtro = '', options = {}) {
  const view = await import('../ui/views/equipamentos.js');
  await view.renderEquip(filtro, { __skipPlanRefresh: true, ...options });
  return view;
}

const baseEquipamento = {
  id: 'eq-1',
  nome: 'Split Alpha',
  tipo: 'Split',
  local: 'Sala tecnica',
  tag: 'ALPHA-01',
  fluido: 'R410A',
  status: 'ok',
  criticidade: 'media',
  periodicidadePreventivaDias: 30,
  fotos: [],
};

describe('equipamentos legacy hero, filters and context contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stateMocks.routeParams = {};
    stateMocks.isPro = false;
    getPreventivaDueEquipmentIds.mockReturnValue([]);
    setupDom();
    setState();
  });

  it('centraliza ids, classes, acoes e data-* publicos do recorte legado', () => {
    expect(EQUIPAMENTOS_PUBLIC_IDS).toMatchObject({
      view: 'view-equipamentos',
      list: 'lista-equip',
      hero: 'equip-hero',
      filters: 'equip-filters',
      contextChip: 'equip-context-chip',
      searchBar: 'equip-search-bar',
      searchInput: 'equip-busca',
      toolbarActions: 'equip-toolbar-actions',
    });
    expect(EQUIPAMENTOS_ACTIONS).toMatchObject({
      quickFilter: 'equip-quickfilter',
      clearClienteFilter: 'equip-clear-cliente-filter',
      setViewMode: 'equip-set-view-mode',
      addForCliente: 'eq-add-for-cliente',
      unlockContext: 'equip-unlock-context',
      openModal: 'open-modal',
      openSetor: 'open-setor',
      goRegisterEquip: 'go-register-equip',
    });
    expect(EQUIPAMENTOS_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining([
        'data-action',
        'data-id',
        'data-cliente-id',
        'data-setor-id',
        'data-mode',
        'data-focus-field',
        'data-after-save',
      ]),
    );
    expect(EQUIPAMENTOS_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'equip-hero',
        'equip-hero__kpi',
        'equip-filter',
        'equip-filter__label',
        'equip-filter__count',
        'equip-search-row',
        'equip-view-toggle',
        'equip-view-toggle__btn',
        'equip-breadcrumb',
        'equip-breadcrumb__item',
        'search-bar',
        'search-bar__input',
      ]),
    );
  });

  it('preserva estado vazio sem recriar a lista React nem acionar fluxos criticos', async () => {
    setState({ equipamentos: [], registros: [], clientes: [], setores: [] });

    await renderEquip();

    expect(document.getElementById('view-equipamentos')).not.toBeNull();
    expect(document.getElementById('equip-hero')?.hasAttribute('hidden')).toBe(true);
    expect(document.getElementById('equip-filters')?.hasAttribute('hidden')).toBe(true);
    expect(document.getElementById('equip-search-bar')).not.toBeNull();
    expect(document.getElementById('equip-busca')).not.toBeNull();
    expect(
      document.querySelector(
        '#equip-toolbar-actions [data-action="open-modal"][data-id="modal-add-eq"]',
      ),
    ).not.toBeNull();
    expect(listIslandMocks.mountEquipamentosListReact).toHaveBeenCalledTimes(1);
    expect(document.getElementById('lista-equip')?.dataset.reactEquipamentosListMounted).toBe(
      'true',
    );
  });

  it('preserva hero, filtros rapidos, busca e toolbar com equipamentos', async () => {
    setState({
      equipamentos: [
        { ...baseEquipamento, status: 'danger', __actionScore: 10 },
        { ...baseEquipamento, id: 'eq-2', nome: 'Camara Beta', status: 'ok' },
      ],
      registros: [],
    });

    await renderEquip();

    expect(document.getElementById('equip-hero')?.hasAttribute('hidden')).toBe(false);
    expect(document.getElementById('equip-hero-title')).not.toBeNull();
    expect(
      document.getElementById('equip-hero-kpis')?.querySelector('.equip-hero__kpi'),
    ).not.toBeNull();
    expect(
      document.querySelector('#equip-hero-kpis [data-action="go-register-equip"][data-id="eq-1"]'),
    ).not.toBeNull();
    expect(document.querySelectorAll('#equip-filters .equip-filter')).toHaveLength(5);
    expect(
      document.querySelector(
        '#equip-filters [data-action="equip-quickfilter"][data-id="criticos"]',
      ),
    ).not.toBeNull();
    expect(document.getElementById('equip-busca')?.id).toBe('equip-busca');
    expect(
      document.querySelector(
        '.equip-view-toggle [data-action="equip-set-view-mode"][data-mode="list"]',
      ),
    ).not.toBeNull();
    expect(
      document.querySelector(
        '#equip-toolbar-actions [data-action="open-modal"][data-source="toolbar_primary"]',
      ),
    ).not.toBeNull();
  });

  it('preserva contexto cliente/setor e acao para limpar filtro', async () => {
    stateMocks.isPro = true;
    setState({
      equipamentos: [{ ...baseEquipamento, clienteId: 'cli-1', setorId: 's1' }],
      clientes: [{ id: 'cli-1', nome: 'Cliente Alpha' }],
      setores: [{ id: 's1', nome: 'Casa de Maquinas', clienteId: 'cli-1' }],
    });

    await renderEquip('', {
      equipCtx: { clienteId: 'cli-1', clienteNome: 'Cliente Alpha', sectorId: 's1' },
    });

    const contextChip = document.getElementById('equip-context-chip');
    expect(contextChip?.querySelector('.equip-breadcrumb')).not.toBeNull();
    expect(contextChip?.querySelector('[data-action="equip-clear-cliente-filter"]')).not.toBeNull();
    const addButton = document.querySelector('#equip-toolbar-actions [data-action="open-modal"]');
    expect(addButton?.getAttribute('data-id')).toBe('modal-add-eq');
    expect(addButton?.getAttribute('data-cliente-id')).toBe('cli-1');
    expect(addButton?.getAttribute('data-setor-id')).toBe('s1');
  });

  it('preserva filtro rapido como contrato DOM sem executar setores, fotos, CRUD ou modal', async () => {
    setState({
      equipamentos: [
        { ...baseEquipamento, id: 'eq-danger', status: 'danger' },
        { ...baseEquipamento, id: 'eq-ok', status: 'ok' },
      ],
    });

    await renderEquip('', { equipCtx: { quickFilter: 'criticos' } });

    expect(document.getElementById('equip-page-title')?.textContent).toMatch(/Cr/);
    expect(
      document.querySelector(
        '#equip-toolbar-actions [data-action="equip-quickfilter"][data-id="todos"]',
      ),
    ).not.toBeNull();
    expect(listIslandMocks.mountEquipamentosListReact).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-action="open-setor"]')).toBeNull();
    expect(document.querySelector('[data-action="delete-equip"]')).toBeNull();
  });

  it('mantem nomes maliciosos inertes no hero, contexto e atributos do adapter legado', async () => {
    const malicious = `"><img src=x onerror=alert(1)><script>alert(2)</script>`;
    setState({
      equipamentos: [
        {
          ...baseEquipamento,
          id: 'eq-xss',
          nome: malicious,
          local: malicious,
          status: 'danger',
          clienteId: 'cli-xss',
        },
      ],
      clientes: [{ id: 'cli-xss', nome: malicious }],
      setores: [],
    });

    await renderEquip(malicious, {
      equipCtx: { clienteId: 'cli-xss', clienteNome: malicious },
    });

    const view = document.getElementById('view-equipamentos');
    expect(view?.querySelector('script')).toBeNull();
    expect(view?.querySelector('[onerror]')).toBeNull();
    expect(view?.querySelector('[onclick]')).toBeNull();
    expect(document.getElementById('equip-context-chip')?.textContent).toContain('<script>');
    expect(document.getElementById('equip-hero-kpis')?.textContent).toContain('<script>');
  });

  it('continua sem importar React/createRoot no adapter legado de equipamentos', () => {
    const source = readFileSync('src/ui/views/equipamentos.js', 'utf-8');
    expect(source).not.toMatch(/from ['"]react['"]/);
    expect(source).not.toMatch(/createRoot/);
  });
});
