import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DASHBOARD_DATA_ATTRIBUTES,
  DASHBOARD_PUBLIC_CLASSES,
  DASHBOARD_PUBLIC_IDS,
} from '../ui/viewModels/dashboardContracts.js';

function buildDashboardDom() {
  return `
    <div id="view-inicio" class="view active">
      <section class="dash dash--quick" id="dash" data-tier="free" data-tone="ok">
        <article class="dash__hero dash__hero--quick" id="dash-hero" data-tone="ok">
          <h1 id="dash-hero-greeting"></h1>
          <p id="dash-hero-summary"></p>
          <button id="dash-hero-cta" type="button"><span id="dash-hero-cta-label"></span></button>
          <button id="dash-hero-cta-secondary" type="button"><span id="dash-hero-cta-secondary-label"></span></button>
        </article>
        <div id="dash-empty" hidden></div>
        <div id="dash-onboarding"></div>
        <div id="dash-overflow-banner"></div>
        <article class="dash__card dash__card--next-action" id="dash-next-action-card" data-tone="ok">
          <div class="dash__card-label">Pr\u00f3xima a\u00e7\u00e3o</div>
          <div class="dash__card-title" id="dash-next-title">Nenhuma a\u00e7\u00e3o urgente</div>
          <div class="dash__card-sub" id="dash-next-sub">\u2014</div>
          <button class="dash__card-cta" id="dash-next-cta" type="button" data-nav="historico" data-action="" data-id="">
            <span class="dash__card-cta-label" id="dash-next-cta-label">Ver hist\u00f3rico</span>
          </button>
        </article>
        <article class="dash__card dash__card--last-service" id="dash-last-service" hidden>
          <div class="dash__card-icon" aria-hidden="true"></div>
          <div class="dash__card-body">
            <div class="dash__card-label">\u00daltimo servi\u00e7o</div>
            <div class="dash__card-title" id="dash-last-title">\u2014</div>
            <div class="dash__card-sub" id="dash-last-sub">\u2014</div>
            <div class="dash__card-desc" id="dash-last-desc"></div>
          </div>
        </article>
        <section id="dash-pro-ops-row" hidden>
          <div id="dash-critical-alerts-title"></div>
          <div id="dash-critical-alerts-sub"></div>
          <div id="dash-critical-alerts-list"></div>
          <div id="dash-risk-clients-title"></div>
          <div id="dash-risk-clients-sub"></div>
          <div id="dash-risk-clients-list"></div>
        </section>
        <section id="dash-month-section">
          <div id="dash-month-label"></div>
          <div id="dash-month-services"></div>
          <div id="dash-month-equips"></div>
          <div id="dash-month-pending"></div>
          <div id="dash-month-trend"></div>
        </section>
        <section id="dash-critical-section" hidden></section>
        <div id="dash-critical-now"></div>
        <div id="dash-critical-now-count"></div>
        <section id="dash-alerts-section" hidden></section>
        <div id="dash-alertas-mini"></div>
        <div id="dash-upgrade-inline-hint"></div>
        <section id="dash-criticos-section" hidden></section>
        <div id="dash-criticos"></div>
        <section id="dash-recentes-section" hidden></section>
        <div id="dash-recentes"></div>
      </section>
    </div>
  `;
}

function emptyState(overrides = {}) {
  return {
    equipamentos: [],
    registros: [],
    clientes: [],
    setores: [],
    tecnicos: [],
    orcamentos: [],
    ...overrides,
  };
}

function byId(id) {
  return document.getElementById(id);
}

async function flushDashboardRender() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function setupDashboardModule({
  state = emptyState(),
  alerts = [],
  planCode = 'free',
  hasPro = false,
  navigationMode = 'rapido',
} = {}) {
  vi.resetModules();
  const currentState = emptyState(state);

  vi.doMock('../core/state.js', () => ({
    getState: vi.fn(() => currentState),
    findEquip: vi.fn(
      (id) => currentState.equipamentos.find((equipamento) => equipamento.id === id) || null,
    ),
    findSetor: vi.fn((id) => currentState.setores.find((setor) => setor.id === id) || null),
    regsForEquip: vi.fn((id) =>
      currentState.registros.filter(
        (registro) => registro.equipId === id || registro.equipamentoId === id,
      ),
    ),
  }));

  vi.doMock('../core/auth.js', () => ({
    Auth: {
      getUser: vi.fn(async () => ({
        id: 'user-1',
        email: 'ana@example.com',
        user_metadata: {},
      })),
    },
  }));

  vi.doMock('../core/storage.js', () => ({
    Storage: {
      getSyncStatus: vi.fn(() => ({ state: 'idle', pendingOps: 0 })),
    },
  }));

  vi.doMock('../core/plans/operationalPlan.js', () => ({
    fetchOperationalProfile: vi.fn(async () => ({ profile: { plan: planCode } })),
  }));

  vi.doMock('../core/plans/subscriptionPlans.js', () => ({
    PLAN_CODE_FREE: 'free',
    PLAN_CODE_PLUS: 'plus',
    PLAN_CODE_PRO: 'pro',
    getEffectivePlan: vi.fn(() => planCode),
    hasProAccess: vi.fn(() => hasPro),
  }));

  vi.doMock('../ui/shell/navigationMode.js', () => ({
    NAV_MODE_EMPRESA: 'empresa',
    getNavigationMode: vi.fn(() => navigationMode),
  }));

  vi.doMock('../domain/alerts.js', () => ({
    Alerts: {
      getAll: vi.fn(() => alerts),
      countPreventivas7Dias: vi.fn(() => 0),
    },
  }));

  vi.doMock('../domain/maintenance.js', () => ({
    calculateHealthScore: vi.fn((equipamento) => equipamento?.__score ?? 100),
    evaluateEquipmentRisk: vi.fn((equipamento) => ({
      score: equipamento?.__riskScore ?? 10,
      classification: 'baixo',
      factors: [],
    })),
    evaluateEquipmentRiskTrend: vi.fn(() => ({ trend: 'stable', delta: 0 })),
    getEquipmentMaintenanceContext: vi.fn(() => ({
      ultimoRegistro: null,
      proximaPreventiva: null,
      periodicidadeDias: 30,
    })),
    getHealthClass: vi.fn((score) => {
      if (score >= 80) return 'ok';
      if (score >= 55) return 'warn';
      return 'danger';
    }),
  }));

  vi.doMock('../domain/priorityEngine.js', () => ({
    evaluateEquipmentPriority: vi.fn(() => ({ priorityLevel: 1, priorityLabel: 'Baixa' })),
  }));

  vi.doMock('../domain/actionPriority.js', () => ({
    getActionPriorityScore: vi.fn(() => ({ actionPriorityScore: 0 })),
  }));

  vi.doMock('../domain/suggestedAction.js', () => ({
    ACTION_CODE: {
      NONE: 'none',
      MONITOR: 'monitor',
      COLLECT_DATA: 'collect_data',
      REGISTER_CORRECTIVE: 'register_corrective',
      REGISTER_CORRECTIVE_IMMEDIATE: 'register_corrective_immediate',
      REGISTER_PREVENTIVE: 'register_preventive',
      SCHEDULE_PREVENTIVE: 'schedule_preventive',
    },
    evaluateEquipmentSuggestedAction: vi.fn(() => ({
      actionCode: 'none',
      actionLabel: 'Monitorar',
    })),
  }));

  vi.doMock('../core/equipmentRules.js', () => ({
    getOperationalStatus: vi.fn(({ status }) => ({
      code: status === 'danger' ? 'danger' : 'ok',
      label: status === 'danger' ? 'Cr\u00edtico' : 'Operacional',
    })),
  }));

  vi.doMock('../ui/components/equipmentVisual.js', () => ({
    getEquipmentVisualMeta: vi.fn(() => ({ icon: 'HVAC', label: 'Equipamento' })),
  }));

  vi.doMock('../core/clientePmoc.js', () => ({
    buildClientePmocDetails: vi.fn(() => ({ hasPmoc: false, status: 'ok' })),
  }));

  vi.doMock('../ui/components/skeleton.js', () => ({
    withSkeleton: (_el, _options, renderFn) => renderFn(),
  }));

  vi.doMock('../ui/components/onboarding.js', () => ({
    OnboardingBanner: { render: vi.fn() },
    Profile: { get: vi.fn(() => ({ nome: 'Ana' })) },
  }));

  vi.doMock('../ui/components/onboarding/onboardingChecklist.js', () => ({
    OnboardingChecklist: { render: vi.fn() },
  }));

  vi.doMock('../ui/components/installAppPrompt.js', () => ({
    InstallAppPrompt: { render: vi.fn() },
  }));

  vi.doMock('../ui/components/upgradeNudge.js', () => ({
    UpgradeNudge: { renderInlineHint: vi.fn(() => '') },
  }));

  vi.doMock('../ui/components/overflowBanner.js', () => ({
    OverflowBanner: {
      computeState: vi.fn(() => ({ overLimit: false })),
      render: vi.fn(() => ''),
      maybeShowFirstTimeModal: vi.fn(),
    },
  }));

  return import('../ui/views/dashboard.js');
}

describe('dashboard legacy last service render adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = buildDashboardDom();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('keeps last service card hidden without registros while preserving public ids and classes', async () => {
    const { renderDashboard } = await setupDashboardModule();

    await renderDashboard();
    await flushDashboardRender();

    const card = byId(DASHBOARD_PUBLIC_IDS.lastServiceCard);

    expect(card).not.toBeNull();
    expect(card?.hidden).toBe(true);
    expect(card?.classList.contains('dash__card')).toBe(true);
    expect(card?.classList.contains('dash__card--last-service')).toBe(true);
    expect(card?.querySelector('.dash__card-label')?.textContent).toBe('\u00daltimo servi\u00e7o');
    expect(byId(DASHBOARD_PUBLIC_IDS.lastServiceTitle)?.textContent).toBe('\u2014');
    expect(byId(DASHBOARD_PUBLIC_IDS.lastServiceSubtitle)?.textContent).toBe('\u2014');
    expect(card?.querySelector('.dash__card-cta')).toBeNull();
    expect(card?.querySelector('[data-action],[data-id],[data-nav]')).toBeNull();
  });

  it('renders last service with equipment, client and sector context in empresa mode', async () => {
    const equipamento = {
      id: 'eq-last',
      nome: 'Split 01',
      clienteId: 'cli-1',
      setorId: 'setor-1',
      status: 'ok',
    };
    const { renderDashboard } = await setupDashboardModule({
      planCode: 'pro',
      hasPro: true,
      navigationMode: 'empresa',
      state: emptyState({
        equipamentos: [equipamento],
        clientes: [{ id: 'cli-1', nome: 'Cliente Alpha' }],
        setores: [{ id: 'setor-1', nome: 'Produ\u00e7\u00e3o' }],
        registros: [
          {
            id: 'reg-old',
            equipId: 'eq-last',
            tipo: 'Corretiva',
            data: '2026-04-01T12:00:00.000Z',
          },
          {
            id: 'reg-last',
            equipId: 'eq-last',
            tipo: 'Preventiva',
            data: new Date().toISOString(),
          },
        ],
      }),
    });

    await renderDashboard();
    await flushDashboardRender();

    const card = byId(DASHBOARD_PUBLIC_IDS.lastServiceCard);

    expect(card?.hidden).toBe(false);
    expect(card?.classList.contains('dash__card')).toBe(true);
    expect(card?.classList.contains('dash__card--last-service')).toBe(true);
    expect(byId(DASHBOARD_PUBLIC_IDS.lastServiceTitle)?.textContent).toBe(
      'Preventiva \u2022 Split 01',
    );
    expect(byId(DASHBOARD_PUBLIC_IDS.lastServiceSubtitle)?.textContent).toContain('Cliente Alpha');
    expect(byId(DASHBOARD_PUBLIC_IDS.lastServiceSubtitle)?.textContent).toContain(
      'Produ\u00e7\u00e3o',
    );
    expect(card?.querySelector('.dash__card-cta')).toBeNull();
    expect(card?.querySelector('[data-action],[data-id],[data-nav]')).toBeNull();
  });

  it('keeps last service text safe from HTML injection', async () => {
    const malicious = '<img src=x onerror=alert(1)><script>alert(1)</script>';
    const { renderDashboard } = await setupDashboardModule({
      planCode: 'pro',
      hasPro: true,
      navigationMode: 'empresa',
      state: emptyState({
        equipamentos: [
          {
            id: 'eq-xss',
            nome: malicious,
            clienteId: 'cli-xss',
            setorId: 'setor-xss',
            status: 'ok',
          },
        ],
        clientes: [{ id: 'cli-xss', nome: malicious }],
        setores: [{ id: 'setor-xss', nome: malicious }],
        registros: [
          {
            id: 'reg-xss',
            equipId: 'eq-xss',
            tipo: malicious,
            data: new Date().toISOString(),
          },
        ],
      }),
    });

    await renderDashboard();
    await flushDashboardRender();

    const card = byId(DASHBOARD_PUBLIC_IDS.lastServiceCard);

    expect(card?.hidden).toBe(false);
    expect(byId(DASHBOARD_PUBLIC_IDS.lastServiceTitle)?.textContent).toContain(malicious);
    expect(byId(DASHBOARD_PUBLIC_IDS.lastServiceSubtitle)?.textContent).toContain(malicious);
    expect(card?.querySelector('script')).toBeNull();
    expect(card?.querySelector('img')).toBeNull();
    expect(card?.querySelector('[onerror]')).toBeNull();
  });

  it('delegates last service rendering to the React island without manual DOM fallback', () => {
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');

    expect(DASHBOARD_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining(['dash__card', 'dash__card--last-service']),
    );
    expect(DASHBOARD_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-action', 'data-id', 'data-nav']),
    );
    expect(dashboardSource).not.toMatch(/react-dom\/client|createRoot|mountDashboardReact/);
    expect(dashboardSource).toContain('../../react/entrypoints/dashboardLastServiceIsland.jsx');
    expect(dashboardSource).not.toMatch(/getElementById\('dash-last-title'\)/);
    expect(dashboardSource).not.toMatch(/getElementById\('dash-last-sub'\)/);
    expect(dashboardSource).not.toMatch(/getElementById\('dash-last-desc'\)/);
    expect(document.getElementById('chart-status-pie')).toBeNull();
    expect(document.getElementById('dash-onboarding')).not.toBeNull();
    expect(document.getElementById('app-header')).toBeNull();
  });
});
