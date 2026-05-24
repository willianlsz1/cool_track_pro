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
        <section id="dash-kpis-root" class="dash__kpi-grid" aria-label="Indicadores principais">
          <article class="dash__kpi">
            <div class="dash__kpi-label">Ativos</div>
            <div class="dash__kpi-value" id="dash-kpi-ativos"></div>
            <div class="dash__kpi-sub" id="dash-kpi-ativos-sub"></div>
          </article>
          <article class="dash__kpi">
            <div class="dash__kpi-label">Efici\u00eancia</div>
            <div class="dash__kpi-value" id="dash-kpi-ef"></div>
            <div class="dash__kpi-spark" id="dash-kpi-ef-spark" aria-hidden="true"></div>
            <div class="dash__kpi-sub" id="dash-kpi-ef-sub"></div>
          </article>
          <article class="dash__kpi">
            <div class="dash__kpi-label">Anomalias</div>
            <div class="dash__kpi-value" id="dash-kpi-anom"></div>
            <div class="dash__kpi-sub" id="dash-kpi-anom-sub"></div>
          </article>
          <article class="dash__kpi">
            <div class="dash__kpi-label">Servi\u00e7os / m\u00eas</div>
            <div class="dash__kpi-value" id="dash-kpi-mes"></div>
            <div class="dash__kpi-spark" id="dash-kpi-mes-spark" aria-hidden="true"></div>
            <div class="dash__kpi-sub" id="dash-kpi-mes-sub"></div>
          </article>
        </section>
        <article class="dash__card dash__card--next-action" id="dash-next-action-card" data-tone="ok">
          <div id="dash-next-title"></div>
          <div id="dash-next-sub"></div>
          <button id="dash-next-cta" type="button"><span id="dash-next-cta-label"></span></button>
        </article>
        <article class="dash__card dash__card--last-service" id="dash-last-service" hidden>
          <div id="dash-last-title"></div>
          <div id="dash-last-sub"></div>
          <div id="dash-last-desc"></div>
        </article>
        <section id="dash-pro-ops-row" hidden>
          <div id="dash-critical-alerts-title"></div>
          <div id="dash-critical-alerts-sub"></div>
          <div id="dash-critical-alerts-list"></div>
          <div id="dash-risk-clients-title"></div>
          <div id="dash-risk-clients-sub"></div>
          <div id="dash-risk-clients-list"></div>
        </section>
        <section class="dash__section" id="dash-month-section">
          <header class="dash__section-header">
            <span class="dash__section-label" id="dash-month-label">Seu m\u00eas em campo</span>
          </header>
          <div class="dash__kpi-grid">
            <article class="dash__kpi">
              <div class="dash__kpi-label">Servi\u00e7os no m\u00eas</div>
              <div class="dash__kpi-value" id="dash-month-services">0</div>
            </article>
            <article class="dash__kpi">
              <div class="dash__kpi-label">Equipamentos atendidos</div>
              <div class="dash__kpi-value" id="dash-month-equips">0</div>
            </article>
            <article class="dash__kpi">
              <div class="dash__kpi-label">Pend\u00eancias</div>
              <div class="dash__kpi-value" id="dash-month-pending">0</div>
            </article>
            <article class="dash__kpi">
              <div class="dash__kpi-label">Varia\u00e7\u00e3o</div>
              <div class="dash__kpi-sub" id="dash-month-trend">Sem dados anteriores</div>
            </article>
          </div>
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

function dateInMonth(monthOffset = 0, day = 12) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + monthOffset, day, 12).toISOString();
}

function byId(id) {
  return document.getElementById(id);
}

function monthSection() {
  return byId(DASHBOARD_PUBLIC_IDS.monthSection);
}

function monthText(id) {
  return byId(id)?.textContent;
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

describe('dashboard legacy month summary render adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = buildDashboardDom();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders empty month summary state preserving public ids and classes', async () => {
    const { renderDashboard } = await setupDashboardModule();

    await renderDashboard();
    await flushDashboardRender();

    const section = monthSection();

    expect(section).not.toBeNull();
    expect(section?.classList.contains('dash__section')).toBe(true);
    expect(section?.querySelector('.dash__section-header')).not.toBeNull();
    expect(section?.querySelector('.dash__section-label')).not.toBeNull();
    expect(section?.querySelector('.dash__kpi-grid')).not.toBeNull();
    expect(section?.querySelectorAll('.dash__kpi')).toHaveLength(4);
    expect(section?.querySelectorAll('.dash__kpi-label')).toHaveLength(4);
    expect(section?.querySelectorAll('.dash__kpi-value')).toHaveLength(3);
    expect(section?.querySelectorAll('.dash__kpi-sub')).toHaveLength(1);

    expect(monthText(DASHBOARD_PUBLIC_IDS.monthLabel)).toBe('Seu m\u00eas em campo');
    expect(monthText(DASHBOARD_PUBLIC_IDS.monthServices)).toBe('0');
    expect(monthText(DASHBOARD_PUBLIC_IDS.monthEquipments)).toBe('0');
    expect(monthText(DASHBOARD_PUBLIC_IDS.monthPending)).toBe('0');
    expect(monthText(DASHBOARD_PUBLIC_IDS.monthTrend)).toBe('Sem dados anteriores');
    expect(section?.querySelector('[data-action],[data-id],[data-nav]')).toBeNull();
  });

  it('renders month values from dashboardViewModel data in empresa mode', async () => {
    const { renderDashboard } = await setupDashboardModule({
      planCode: 'pro',
      hasPro: true,
      navigationMode: 'empresa',
      state: emptyState({
        equipamentos: [
          { id: 'eq-1', nome: 'Split 01', status: 'ok', clienteId: 'cli-1', setorId: 'setor-1' },
          { id: 'eq-2', nome: 'Chiller', status: 'ok', clienteId: 'cli-1', setorId: 'setor-1' },
        ],
        clientes: [{ id: 'cli-1', nome: 'Cliente Alpha' }],
        setores: [{ id: 'setor-1', nome: 'Produ\u00e7\u00e3o', clienteId: 'cli-1' }],
        registros: [
          { id: 'reg-1', equipId: 'eq-1', data: dateInMonth(0, 5), tipo: 'Preventiva' },
          { id: 'reg-2', equipId: 'eq-2', data: dateInMonth(0, 14), tipo: 'Corretiva' },
          { id: 'reg-prev', equipId: 'eq-1', data: dateInMonth(-1, 10), tipo: 'Preventiva' },
        ],
      }),
      alerts: [
        { kind: 'critical', severity: 'danger', title: 'Falha cr\u00edtica' },
        { kind: 'info', severity: 'info', title: 'Aviso informativo' },
      ],
    });

    await renderDashboard();
    await flushDashboardRender();

    const section = monthSection();

    expect(section?.classList.contains('dash__section')).toBe(true);
    expect(section?.querySelector('.dash__kpi-grid')).not.toBeNull();
    expect(monthText(DASHBOARD_PUBLIC_IDS.monthLabel)).toBe('Vis\u00e3o da opera\u00e7\u00e3o');
    expect(monthText(DASHBOARD_PUBLIC_IDS.monthServices)).toBe('2');
    expect(monthText(DASHBOARD_PUBLIC_IDS.monthEquipments)).toBe('2');
    expect(monthText(DASHBOARD_PUBLIC_IDS.monthPending)).toBe('1');
    expect(monthText(DASHBOARD_PUBLIC_IDS.monthTrend)).toBe('+1 vs m\u00eas passado');
    expect(section?.querySelector('[data-action],[data-id],[data-nav]')).toBeNull();
  });

  it('keeps month summary text safe from HTML injection', async () => {
    const malicious = '<img src=x onerror=alert(1)><script>alert(1)</script>';
    const { renderDashboard } = await setupDashboardModule({
      state: emptyState({
        equipamentos: [{ id: 'eq-xss', nome: malicious, status: 'ok' }],
        clientes: [{ id: 'cli-xss', nome: malicious }],
        setores: [{ id: 'setor-xss', nome: malicious }],
        registros: [{ id: 'reg-xss', equipId: 'eq-xss', data: dateInMonth(0, 8), tipo: malicious }],
      }),
      alerts: [{ kind: malicious, severity: 'danger', title: malicious, subtitle: malicious }],
    });

    await renderDashboard();
    await flushDashboardRender();

    const section = monthSection();
    const sectionHtml = section?.innerHTML.toLowerCase() || '';
    const sectionText = section?.textContent || '';

    expect(sectionText).not.toContain(malicious);
    expect(sectionHtml).not.toContain('<script');
    expect(sectionHtml).not.toContain('<img');
    expect(sectionHtml).not.toContain('onerror');
    expect(monthText(DASHBOARD_PUBLIC_IDS.monthServices)).toBe('1');
    expect(monthText(DASHBOARD_PUBLIC_IDS.monthEquipments)).toBe('1');
    expect(monthText(DASHBOARD_PUBLIC_IDS.monthPending)).toBe('1');
  });

  it('keeps month summary contracts legacy-only and view model pure', () => {
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');
    const viewModelSource = readFileSync('src/ui/viewModels/dashboardViewModel.js', 'utf8');

    expect(DASHBOARD_PUBLIC_IDS).toMatchObject({
      monthSection: 'dash-month-section',
      monthLabel: 'dash-month-label',
      monthServices: 'dash-month-services',
      monthEquipments: 'dash-month-equips',
      monthPending: 'dash-month-pending',
      monthTrend: 'dash-month-trend',
    });
    expect(DASHBOARD_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'dash__section',
        'dash__section-header',
        'dash__section-label',
        'dash__kpi-grid',
        'dash__kpi',
        'dash__kpi-label',
        'dash__kpi-value',
        'dash__kpi-sub',
      ]),
    );
    expect(DASHBOARD_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-action', 'data-id', 'data-nav']),
    );
    expect(dashboardSource).not.toMatch(/from ['"]react|react-dom\/client|createRoot/);
    expect(dashboardSource).not.toContain(
      '../../react/entrypoints/dashboard' + 'MonthSummaryIsland.jsx',
    );
    expect(viewModelSource).not.toMatch(/document\.|window\.|react-dom|createRoot|innerHTML/);
    expect(document.getElementById('chart-status-pie')).toBeNull();
    expect(document.getElementById('dash-onboarding')).not.toBeNull();
    expect(document.getElementById('app-header')).toBeNull();
  });
});
