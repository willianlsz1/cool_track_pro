import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DASHBOARD_PUBLIC_CLASSES,
  DASHBOARD_PUBLIC_IDS,
} from '../ui/viewModels/dashboardContracts.js';

function buildDashboardDom() {
  return `
    <div id="view-inicio" class="view active">
      <section class="dash dash--quick" id="dash" data-tier="free" data-tone="ok">
        <article class="dash__hero dash__hero--quick" id="dash-hero" data-tone="ok">
          <h1 class="dash__hero-greeting" id="dash-hero-greeting"></h1>
          <p class="dash__hero-summary" id="dash-hero-summary"></p>
          <button class="dash__hero-cta" id="dash-hero-cta" type="button">
            <span class="dash__hero-cta-label" id="dash-hero-cta-label"></span>
          </button>
          <button class="dash__hero-cta dash__hero-cta--secondary" id="dash-hero-cta-secondary" type="button">
            <span class="dash__hero-cta-label" id="dash-hero-cta-secondary-label"></span>
          </button>
        </article>
        <div id="dash-empty" class="dash__empty" hidden></div>
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

function dateInMonth(monthOffset = 0, day = 12) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + monthOffset, day, 12).toISOString();
}

function primaryKpiGrid() {
  return document.querySelector('.dash__kpi-grid[aria-label="Indicadores principais"]');
}

function textById(id) {
  return document.getElementById(id)?.textContent;
}

async function flushDashboardRender() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function setupDashboardModule({ state = emptyState(), alerts = [] } = {}) {
  vi.resetModules();

  const currentState = emptyState(state);

  vi.doMock('../core/state.js', () => ({
    getState: vi.fn(() => currentState),
    findEquip: vi.fn((id) =>
      currentState.equipamentos.find((equipamento) => equipamento.id === id),
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
    fetchOperationalProfile: vi.fn(async () => ({ profile: { plan: 'free' } })),
  }));

  vi.doMock('../core/plans/subscriptionPlans.js', () => ({
    PLAN_CODE_FREE: 'free',
    PLAN_CODE_PLUS: 'plus',
    PLAN_CODE_PRO: 'pro',
    getEffectivePlan: vi.fn(() => 'free'),
    hasProAccess: vi.fn(() => false),
  }));

  vi.doMock('../ui/shell/navigationMode.js', () => ({
    NAV_MODE_EMPRESA: 'empresa',
    getNavigationMode: vi.fn(() => 'rapido'),
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

describe('dashboard legacy KPI render adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = buildDashboardDom();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders empty KPI state preserving public ids and classes', async () => {
    const { renderDashboard } = await setupDashboardModule();

    await renderDashboard();
    await flushDashboardRender();

    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.view)).not.toBeNull();
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.root)).not.toBeNull();
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiAtivos)).not.toBeNull();
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiEficiencia)).not.toBeNull();
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiAnomalias)).not.toBeNull();
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiMes)).not.toBeNull();

    const grid = primaryKpiGrid();
    expect(grid).not.toBeNull();
    expect(grid?.classList.contains('dash__kpi-grid')).toBe(true);
    expect(grid?.querySelectorAll('.dash__kpi')).toHaveLength(4);
    expect(grid?.querySelectorAll('.dash__kpi-label')).toHaveLength(4);
    expect(grid?.querySelectorAll('.dash__kpi-value')).toHaveLength(4);
    expect(grid?.querySelectorAll('.dash__kpi-sub')).toHaveLength(4);

    expect(textById(DASHBOARD_PUBLIC_IDS.kpiAtivos)).toBe('\u2014');
    expect(textById(DASHBOARD_PUBLIC_IDS.kpiAtivosSub)).toBe('sem cadastro');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiAtivosSub)?.dataset.tone).toBe('ok');

    expect(textById(DASHBOARD_PUBLIC_IDS.kpiEficiencia)).toBe('\u2014');
    expect(textById(DASHBOARD_PUBLIC_IDS.kpiEficienciaSub)).toBe('sem dados');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiEficiencia)?.dataset.tone).toBe('muted');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiEficienciaSub)?.dataset.tone).toBe(
      'muted',
    );

    expect(textById(DASHBOARD_PUBLIC_IDS.kpiAnomalias)).toBe('0');
    expect(textById(DASHBOARD_PUBLIC_IDS.kpiAnomaliasSub)).toBe('sem alerta');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiAnomalias)?.dataset.tone).toBe('ok');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiAnomaliasSub)?.dataset.tone).toBe('ok');

    expect(textById(DASHBOARD_PUBLIC_IDS.kpiMes)).toBe('0');
    expect(textById(DASHBOARD_PUBLIC_IDS.kpiMesSub)).toBe('Sem dados anteriores');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiMesSub)?.dataset.tone).toBe('muted');
    expect(grid?.querySelector('[data-action]')).toBeNull();
  });

  it('renders KPI values and tones from dashboardViewModel data', async () => {
    const state = emptyState({
      equipamentos: [
        { id: 'eq-ok', nome: 'Split 01', status: 'ok', __score: 90 },
        { id: 'eq-danger', nome: 'Condensadora', status: 'danger', __score: 50 },
      ],
      clientes: [{ id: 'cli-1', nome: 'Cliente Alpha' }],
      registros: [
        { id: 'reg-1', equipId: 'eq-ok', data: dateInMonth(0, 5), tipo: 'Preventiva' },
        { id: 'reg-2', equipId: 'eq-danger', data: dateInMonth(0, 12), tipo: 'Corretiva' },
        { id: 'reg-3', equipId: 'eq-ok', data: dateInMonth(-1, 12), tipo: 'Preventiva' },
      ],
    });
    const alerts = [
      {
        kind: 'critical',
        severity: 'danger',
        title: 'Falha cr\u00edtica',
        subtitle: 'Aten\u00e7\u00e3o imediata',
        eq: state.equipamentos[1],
      },
    ];
    const { renderDashboard } = await setupDashboardModule({ state, alerts });

    await renderDashboard();
    await flushDashboardRender();

    expect(textById(DASHBOARD_PUBLIC_IDS.kpiAtivos)).toBe('1/2');
    expect(textById(DASHBOARD_PUBLIC_IDS.kpiAtivosSub)).toBe('1 fora');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiAtivosSub)?.dataset.tone).toBe('danger');

    expect(textById(DASHBOARD_PUBLIC_IDS.kpiEficiencia)).toBe('70%');
    expect(textById(DASHBOARD_PUBLIC_IDS.kpiEficienciaSub)).toBe('aten\u00e7\u00e3o');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiEficiencia)?.dataset.tone).toBe('warn');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiEficienciaSub)?.dataset.tone).toBe(
      'warn',
    );
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiEficienciaSpark)?.innerHTML).toContain(
      '<svg',
    );

    expect(textById(DASHBOARD_PUBLIC_IDS.kpiAnomalias)).toBe('1');
    expect(textById(DASHBOARD_PUBLIC_IDS.kpiAnomaliasSub)).toBe('1 alerta ativo');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiAnomalias)?.dataset.tone).toBe('danger');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiAnomaliasSub)?.dataset.tone).toBe(
      'danger',
    );

    expect(textById(DASHBOARD_PUBLIC_IDS.kpiMes)).toBe('2');
    expect(textById(DASHBOARD_PUBLIC_IDS.kpiMesSub)).toBe('+1 vs m\u00eas passado');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiMesSub)?.dataset.tone).toBe('ok');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.kpiMesSpark)?.innerHTML).toContain('<svg');
  });

  it('keeps KPI text safe from HTML injection', async () => {
    const malicious = '<img src=x onerror=alert(1)><script>alert(1)</script>';
    const state = emptyState({
      equipamentos: [{ id: 'eq-xss', nome: malicious, status: 'ok', __score: 100 }],
      clientes: [{ id: 'cli-xss', nome: malicious }],
      setores: [{ id: 'setor-xss', nome: malicious }],
      registros: [{ id: 'reg-xss', equipId: 'eq-xss', data: dateInMonth(0, 8), tipo: malicious }],
    });
    const { renderDashboard } = await setupDashboardModule({ state });

    await renderDashboard();
    await flushDashboardRender();

    const gridHtml = primaryKpiGrid()?.innerHTML.toLowerCase() || '';
    const gridText = primaryKpiGrid()?.textContent || '';

    expect(gridText).not.toContain(malicious);
    expect(gridHtml).not.toContain('<script');
    expect(gridHtml).not.toContain('onerror');
    expect(textById(DASHBOARD_PUBLIC_IDS.kpiAtivos)).toBe('1/1');
    expect(textById(DASHBOARD_PUBLIC_IDS.kpiEficiencia)).toBe('100%');
    expect(textById(DASHBOARD_PUBLIC_IDS.kpiMes)).toBe('1');
  });

  it('keeps dashboard KPI contracts legacy-only and view model pure', () => {
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');
    const viewModelSource = readFileSync('src/ui/viewModels/dashboardViewModel.js', 'utf8');

    expect(DASHBOARD_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'dash__kpi-grid',
        'dash__kpi',
        'dash__kpi-label',
        'dash__kpi-value',
        'dash__kpi-sub',
      ]),
    );
    expect(dashboardSource).not.toMatch(/react-dom\/client|createRoot|mountDashboardReact/);
    expect(viewModelSource).not.toMatch(/document\.|window\.|react-dom|createRoot|innerHTML/);
  });
});
