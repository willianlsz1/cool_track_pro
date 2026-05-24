import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildEquipamentosViewModel } from '../ui/viewModels/equipamentosViewModel.js';

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

vi.mock('../ui/viewModels/equipamentosViewModel.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    buildEquipamentosViewModel: vi.fn(actual.buildEquipamentosViewModel),
  };
});

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

vi.mock('../core/modal.js', () => ({
  Modal: { open: vi.fn(), close: vi.fn() },
}));

vi.mock('../core/profile.js', () => ({
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

vi.mock('../domain/alerts.js', () => ({
  Alerts: { getAll: vi.fn(() => []) },
  getPreventivaDueEquipmentIds: vi.fn(() => []),
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
  calculateHealthScore: vi.fn(() => 82),
  getHealthClass: vi.fn(() => 'ok'),
  evaluateEquipmentHealth: vi.fn((eq) => ({
    score: eq?.__score ?? 82,
    reasons: ['rotina estável'],
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
    factors: eq?.__riskFactors ?? ['rotina estável'],
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
vi.mock('../ui/composables/header.js', () => ({
  updateGlobalHeader: vi.fn(),
}));

function setupDom() {
  document.body.innerHTML = `
    <section id="view-equipamentos">
      <section id="equip-hero" class="equip-hero" hidden>
        <p id="equip-hero-sub"></p>
        <div id="equip-hero-sem-setor-cta" hidden></div>
        <div id="equip-hero-kpis"></div>
      </section>
      <nav id="equip-filters" hidden></nav>
      <h1 id="equip-page-title"></h1>
      <p id="equip-page-subtitle"></p>
      <div id="equip-toolbar-actions"></div>
      <div id="equip-context-chip"></div>
      <div id="equip-search-bar" class="equip-search-row">
        <input id="equip-busca" />
      </div>
      <div class="equip-view-toggle">
        <button type="button" data-action="equip-set-view-mode" data-mode="list">Lista</button>
        <button type="button" data-action="equip-set-view-mode" data-mode="grid">Grade</button>
      </div>
      <div id="lista-equip"></div>
    </section>
    <select id="eq-setor"></select>
    <div id="eq-setor-wrapper"></div>
    <div id="eq-det-corpo"></div>
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

const activeEquip = {
  id: 'eq-1',
  nome: 'Split Alpha',
  tipo: 'Split Hi-Wall',
  local: 'Sala técnica',
  tag: 'ALPHA-01',
  fluido: 'R410A',
  status: 'warn',
  criticidade: 'alta',
  periodicidadePreventivaDias: 30,
  fotos: [],
  __priorityLevel: 3,
  __riskClassification: 'medio',
  __riskFactors: ['preventiva sem agenda'],
};

describe('equipamentos legacy render adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stateMocks.routeParams = {};
    stateMocks.isPro = false;
    setupDom();
    setState();
  });

  it('renderiza empty state legado em #lista-equip sem exigir lista válida', async () => {
    setState({ equipamentos: undefined, clientes: undefined, setores: undefined });

    await renderEquip();

    expect(document.getElementById('view-equipamentos')).not.toBeNull();
    expect(document.getElementById('lista-equip')).not.toBeNull();
    expect(document.querySelector('#lista-equip .empty-state')).not.toBeNull();
    expect(document.querySelector('#lista-equip [data-action="open-modal"]')?.dataset.id).toBe(
      'modal-add-eq',
    );
    expect(document.getElementById('equip-hero')?.hasAttribute('hidden')).toBe(true);
    expect(buildEquipamentosViewModel).toHaveBeenCalledWith(
      expect.objectContaining({
        equipamentos: undefined,
        clientes: undefined,
        setores: undefined,
      }),
    );
  });

  it('renderiza cards da lista flat preservando classes, data-id e ações principais', async () => {
    setState({
      equipamentos: [
        activeEquip,
        {
          ...activeEquip,
          id: 'eq-2',
          nome: 'Câmara Beta',
          local: 'Depósito',
          tag: 'BETA-02',
          status: 'ok',
          __actionScore: 1,
        },
      ],
    });

    await renderEquip();

    const cards = document.querySelectorAll('#lista-equip .equip-card');
    expect(cards).toHaveLength(2);
    const card = document.querySelector('#lista-equip .equip-card[data-id="eq-1"]');
    expect(card?.getAttribute('data-action')).toBe('view-equip');
    expect(card?.querySelector('.equip-card__type-icon')).not.toBeNull();
    expect(
      card?.querySelector('.equip-card__primary-cta[data-action="go-register-equip"]'),
    ).not.toBeNull();
    expect(document.querySelector('[data-action="open-eq-photos-editor"]')).toBeNull();
    expect(
      document.querySelector('#equip-toolbar-actions [data-action="open-modal"]')?.dataset.id,
    ).toBe('modal-add-eq');
    expect(
      document.querySelector('#equip-filters .equip-filter[data-action="equip-quickfilter"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('.equip-view-toggle [data-action="equip-set-view-mode"]')?.dataset
        .mode,
    ).toBe('list');
  });

  it('aplica busca e contexto cliente/setor do view model no render legado', async () => {
    setState({
      equipamentos: [
        {
          ...activeEquip,
          id: 'eq-alpha',
          nome: 'Alpha filtrado',
          clienteId: 'cli-1',
          setorId: 's1',
        },
        { ...activeEquip, id: 'eq-beta', nome: 'Beta oculto', clienteId: 'cli-1', setorId: 's1' },
      ],
      clientes: [{ id: 'cli-1', nome: 'Cliente Alpha' }],
      setores: [{ id: 's1', nome: 'Casa de Máquinas', clienteId: 'cli-1' }],
    });

    await renderEquip('filtrado', {
      equipCtx: { clienteId: 'cli-1', clienteNome: 'Cliente Alpha', sectorId: 's1' },
    });

    expect(buildEquipamentosViewModel).toHaveBeenCalledWith(
      expect.objectContaining({
        filtro: 'filtrado',
        clienteId: 'cli-1',
        setorId: 's1',
      }),
    );
    expect(document.querySelectorAll('#lista-equip .equip-card')).toHaveLength(1);
    expect(document.querySelector('#lista-equip .equip-card')?.dataset.id).toBe('eq-alpha');
    expect(document.getElementById('equip-context-chip')?.textContent).toContain('Setor');
    const addButton = document.querySelector('#equip-toolbar-actions [data-action="open-modal"]');
    expect(addButton?.getAttribute('data-setor-id')).toBe('s1');
    expect(addButton?.getAttribute('data-cliente-id')).toBe('cli-1');
  });

  it('renderiza lista direta para cliente sem setores preservando ações essenciais', async () => {
    stateMocks.isPro = true;
    setState({
      equipamentos: [{ ...activeEquip, id: 'eq-sem-setor', clienteId: 'cli-1', setorId: null }],
      clientes: [{ id: 'cli-1', nome: 'Cliente Alpha' }],
      setores: [],
    });

    await renderEquip('', {
      equipCtx: { clienteId: 'cli-1', clienteNome: 'Cliente Alpha', sectorId: null },
    });

    expect(document.querySelector('#lista-equip .setor-cliente-empty')).toBeNull();
    expect(document.querySelectorAll('#lista-equip .equip-card')).toHaveLength(1);
    expect(document.querySelector('#lista-equip .equip-card')?.dataset.id).toBe('eq-sem-setor');
    expect(document.getElementById('equip-page-title')?.textContent).toContain('Cliente Alpha');
    expect(
      document.querySelector('[data-action="open-setor-modal"][data-cliente-id="cli-1"]'),
    ).not.toBeNull();
    expect(document.querySelector('[data-testid="equipamentos-add-equipment"]')).not.toBeNull();
    expect(document.getElementById('equip-search-bar')?.style.display).toBe('');
    expect(document.querySelector('[data-action="equip-clear-cliente-filter"]')).not.toBeNull();
  });

  it('renderiza grade de setores por cliente preservando cards e tile sem setor', async () => {
    stateMocks.isPro = true;
    setState({
      equipamentos: [
        { ...activeEquip, id: 'eq-setor', clienteId: 'cli-1', setorId: 's1' },
        { ...activeEquip, id: 'eq-legacy', clienteId: '', setorId: 's1' },
        { ...activeEquip, id: 'eq-sem-setor', clienteId: 'cli-1', setorId: '' },
      ],
      clientes: [{ id: 'cli-1', nome: 'Cliente Alpha' }],
      setores: [{ id: 's1', nome: 'Sala Técnica', clienteId: 'cli-1', cor: '#00c853' }],
    });

    await renderEquip('', {
      equipCtx: { clienteId: 'cli-1', clienteNome: 'Cliente Alpha', sectorId: null },
    });

    expect(document.querySelector('#lista-equip .setor-grid')).not.toBeNull();
    expect(
      document.querySelector('.setor-card[data-action="open-setor"][data-id="s1"]'),
    ).not.toBeNull();
    expect(document.querySelector('[data-action="edit-setor"][data-id="s1"]')).not.toBeNull();
    expect(
      document.querySelector('[data-action="toggle-setor-menu"][data-id="s1"]'),
    ).not.toBeNull();
    expect(document.querySelector('[data-action="delete-setor"][data-id="s1"]')).not.toBeNull();
    expect(
      document.querySelector(
        '.setor-card--sem-setor[data-action="open-setor"][data-id="__sem_setor__"]',
      ),
    ).not.toBeNull();
    expect(document.querySelector('.setor-card__sub')?.textContent).toContain(
      '1 equipamento sem setor vinculado',
    );
    expect(document.querySelector('[data-action="open-setor-modal"]')?.dataset.clienteId).toBe(
      'cli-1',
    );
  });

  it('preserva quick move no contexto cliente sem setor', async () => {
    setState({
      equipamentos: [
        { ...activeEquip, id: 'eq-1', clienteId: 'cli-1', setorId: '' },
        { ...activeEquip, id: 'eq-2', clienteId: 'cli-1', setorId: null },
      ],
      clientes: [{ id: 'cli-1', nome: 'Cliente Alpha' }],
      setores: [
        { id: 's1', nome: 'Sala Técnica', clienteId: 'cli-1' },
        { id: 's2', nome: 'Setor órfão' },
      ],
    });

    await renderEquip('', {
      equipCtx: { clienteId: 'cli-1', clienteNome: 'Cliente Alpha', sectorId: '__sem_setor__' },
    });

    const banner = document.querySelector('#lista-equip .quick-move-banner');
    expect(banner).not.toBeNull();
    expect(banner?.getAttribute('data-equip-ids')).toBe('eq-1,eq-2');
    expect(document.getElementById('quick-move-target-setor')).not.toBeNull();
    expect(document.querySelector('[data-action="quick-move-equip-batch"]')).not.toBeNull();
  });

  it('mantém escape de HTML malicioso no HTML legado', async () => {
    const malicious = `"><img src=x onerror=alert(1)><script>alert(2)</script>`;
    setState({
      equipamentos: [
        {
          ...activeEquip,
          id: 'eq-xss',
          nome: malicious,
          local: malicious,
          tag: malicious,
          fluido: malicious,
        },
      ],
      clientes: [{ id: 'cli-xss', nome: malicious }],
      setores: [{ id: 's-xss', nome: malicious }],
    });

    await renderEquip(malicious);

    const html = document.getElementById('lista-equip')?.innerHTML || '';
    expect(document.querySelector('#lista-equip script')).toBeNull();
    expect(document.querySelector('#lista-equip [onerror]')).toBeNull();
    expect(document.querySelector('#lista-equip [onclick]')).toBeNull();
    expect(html).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
    expect(document.querySelector('.equip-card__name')?.textContent).toContain('<script>');
  });

  it('preserva ações de detalhe edit/delete sem depender de React', async () => {
    setState({
      equipamentos: [activeEquip],
      setores: [{ id: 's1', nome: 'Casa de Máquinas' }],
    });

    const { viewEquip } = await renderEquip();
    await viewEquip('eq-1');

    expect(
      document.querySelector('#eq-det-corpo [data-action="edit-equip"][data-id="eq-1"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('#eq-det-corpo [data-action="delete-equip"][data-id="eq-1"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('#eq-det-corpo [data-action="go-register-equip"][data-id="eq-1"]'),
    ).not.toBeNull();
    expect(document.querySelector('[data-reactroot]')).toBeNull();
  });

  it('preserva contratos completos dos cards de setor sem acionar CRUD real', async () => {
    const { setorCardHtml } = await import('../ui/views/equipamentos.js');
    const malicious = `"><img src=x onerror=alert(1)><script>alert(2)</script>`;
    const html = `
      ${setorCardHtml(
        {
          id: 's-empty',
          nome: malicious,
          descricao: malicious,
          responsavel: malicious,
          cor: '#00c8e8',
        },
        [],
      )}
      ${setorCardHtml({ id: 's1', nome: 'Casa de Máquinas', cor: '#00c853' }, [
        { ...activeEquip, nome: malicious, setorId: 's1' },
      ])}
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="setor-grid">${html}</div>`;
    const grid = wrapper.querySelector('.setor-grid');
    const emptyCard = wrapper.querySelector('.setor-card[data-id="s-empty"]');
    const activeCard = wrapper.querySelector('.setor-card[data-id="s1"]');

    expect(grid).not.toBeNull();
    expect(emptyCard?.getAttribute('data-action')).toBe('open-setor');
    expect(emptyCard?.classList.contains('setor-card--empty')).toBe(true);
    expect(emptyCard?.querySelector('.setor-card__empty')).not.toBeNull();
    expect(emptyCard?.querySelector('.setor-card__footer')).not.toBeNull();
    expect(
      emptyCard?.querySelector('[data-action="edit-setor"][data-id="s-empty"]'),
    ).not.toBeNull();
    expect(
      emptyCard?.querySelector('[data-action="toggle-setor-menu"][data-id="s-empty"]'),
    ).not.toBeNull();
    expect(
      emptyCard?.querySelector('[data-action="delete-setor"][data-id="s-empty"]'),
    ).not.toBeNull();
    expect(
      emptyCard?.querySelector('[data-action="open-setor"][data-id="s-empty"]'),
    ).not.toBeNull();
    expect(emptyCard?.querySelector('.setor-card__menu')?.hasAttribute('hidden')).toBe(true);

    expect(activeCard?.querySelector('.setor-card__meta')).not.toBeNull();
    expect(activeCard?.querySelector('.setor-card__equips-preview')).not.toBeNull();
    expect(activeCard?.querySelector('.setor-card__equip-preview-name')?.textContent).toContain(
      '<script>',
    );

    expect(wrapper.querySelector('script')).toBeNull();
    expect(wrapper.querySelector('[onerror]')).toBeNull();
    expect(wrapper.querySelector('[onclick]')).toBeNull();
    expect(grid?.innerHTML).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
  });

  it('bloqueia injeção por cor maliciosa no contrato visual do setor', async () => {
    const { setorCardHtml } = await import('../ui/views/equipamentos.js');

    const html = setorCardHtml(
      {
        id: 's-color',
        nome: 'Setor seguro',
        cor: '#00c8e8;background-image:url(javascript:alert(1))',
      },
      [],
    );

    expect(html).toContain('style="--setor-cor:#00c8e8"');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('background-image');
  });

  it('preserva contratos principais do detalhe/modal sem executar fluxos complexos', async () => {
    const malicious = `"><img src=x onerror=alert(1)><script>alert(2)</script>`;
    stateMocks.isPro = true;
    setState({
      equipamentos: [
        {
          ...activeEquip,
          id: 'eq-detail',
          nome: malicious,
          local: malicious,
          tag: malicious,
          fluido: malicious,
          modelo: malicious,
          setorId: 's1',
          fotos: [],
        },
      ],
      setores: [{ id: 's1', nome: malicious }],
      registros: [
        {
          id: 'r1',
          equipId: 'eq-detail',
          data: '2026-04-30T10:00:00.000Z',
          tipo: malicious,
        },
      ],
    });

    const { viewEquip } = await renderEquip();
    await viewEquip('eq-detail');

    const detailRoot = document.getElementById('eq-det-corpo');
    expect(detailRoot?.querySelector('.eq-detail-view')).not.toBeNull();
    expect(detailRoot?.querySelector('#eq-det-title')?.textContent).toContain('<script>');
    expect(detailRoot?.querySelector('.eq-detail-cover')).not.toBeNull();
    expect(detailRoot?.querySelector('.eq-detail-hero')).not.toBeNull();
    expect(detailRoot?.querySelector('.eq-risk-panel')).not.toBeNull();
    expect(detailRoot?.querySelector('.eq-tech-sheet-wrap')).not.toBeNull();
    expect(detailRoot?.querySelector('.eq-svc-section')).not.toBeNull();
    expect(detailRoot?.querySelector('.eq-modal-footer')).not.toBeNull();
    expect(detailRoot?.querySelector('[data-action="open-eq-photos-editor"]')).toBeNull();
    expect(
      detailRoot?.querySelector('[data-action="go-register-equip"][data-id="eq-detail"]'),
    ).not.toBeNull();
    expect(
      detailRoot?.querySelector('[data-action="edit-equip"][data-id="eq-detail"]'),
    ).not.toBeNull();
    expect(
      detailRoot?.querySelector('[data-action="toggle-eq-detail-menu"][data-id="eq-detail"]'),
    ).not.toBeNull();
    expect(
      detailRoot?.querySelector('[data-action="delete-equip"][data-id="eq-detail"]'),
    ).not.toBeNull();
    expect(detailRoot?.querySelector('.eq-modal-footer__menu')?.hasAttribute('hidden')).toBe(true);

    expect(detailRoot?.querySelector('script')).toBeNull();
    expect(detailRoot?.querySelector('[onerror]')).toBeNull();
    expect(detailRoot?.querySelector('[onclick]')).toBeNull();

    const source = readFileSync('src/ui/views/equipamentos.js', 'utf-8');
    expect(source).not.toMatch(/from ['"]react['"]/);
    expect(source).not.toMatch(/createRoot/);
  });
});
