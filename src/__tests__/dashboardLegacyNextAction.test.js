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

async function setupDashboardModule({ state = emptyState(), alerts = [] } = {}) {
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

describe('dashboard legacy next action render adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = buildDashboardDom();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders empty next action state preserving public ids and classes', async () => {
    const { renderDashboard } = await setupDashboardModule();

    await renderDashboard();
    await flushDashboardRender();

    const card = byId(DASHBOARD_PUBLIC_IDS.nextActionCard);
    const cta = byId(DASHBOARD_PUBLIC_IDS.nextActionCta);

    expect(card).not.toBeNull();
    expect(card?.classList.contains('dash__card')).toBe(true);
    expect(card?.classList.contains('dash__card--next-action')).toBe(true);
    expect(card?.dataset.tone).toBe('ok');
    expect(byId(DASHBOARD_PUBLIC_IDS.nextActionTitle)?.textContent).toBe(
      'Cadastre seu primeiro equipamento',
    );
    expect(byId(DASHBOARD_PUBLIC_IDS.nextActionSubtitle)?.textContent).toBe(
      'Sem pend\u00eancias imediatas no momento.',
    );
    expect(cta?.classList.contains('dash__card-cta')).toBe(true);
    expect(cta?.dataset.nav).toBe('historico');
    expect(cta?.hasAttribute('data-action')).toBe(false);
    expect(cta?.hasAttribute('data-id')).toBe(false);
    expect(byId(DASHBOARD_PUBLIC_IDS.nextActionCtaLabel)?.textContent).toBe('Ver hist\u00f3rico');
  });

  it('renders critical next action preserving CTA action and id', async () => {
    const equipamento = { id: 'eq-critical', nome: 'Split 01', status: 'danger', __score: 45 };
    const { renderDashboard } = await setupDashboardModule({
      state: emptyState({ equipamentos: [equipamento] }),
      alerts: [
        {
          kind: 'critical',
          severity: 'danger',
          title: 'Falha cr\u00edtica',
          subtitle: 'Compressor parado',
          eq: equipamento,
        },
      ],
    });

    await renderDashboard();
    await flushDashboardRender();

    const card = byId(DASHBOARD_PUBLIC_IDS.nextActionCard);
    const cta = byId(DASHBOARD_PUBLIC_IDS.nextActionCta);

    expect(card?.dataset.tone).toBe('danger');
    expect(byId(DASHBOARD_PUBLIC_IDS.nextActionTitle)?.textContent).toBe('Falha cr\u00edtica');
    expect(byId(DASHBOARD_PUBLIC_IDS.nextActionSubtitle)?.textContent).toContain('Split 01');
    expect(byId(DASHBOARD_PUBLIC_IDS.nextActionSubtitle)?.textContent).toContain(
      'Compressor parado',
    );
    expect(cta?.dataset.action).toBe('go-register-equip');
    expect(cta?.dataset.id).toBe('eq-critical');
    expect(cta?.hasAttribute('data-nav')).toBe(false);
    expect(byId(DASHBOARD_PUBLIC_IDS.nextActionCtaLabel)?.textContent).toBe('Resolver agora');
  });

  it('keeps next action text safe from HTML injection', async () => {
    const malicious = '<img src=x onerror=alert(1)><script>alert(1)</script>';
    const equipamento = {
      id: 'eq-xss"><img src=x onerror=alert(1)>',
      nome: malicious,
      status: 'danger',
      __score: 20,
    };
    const { renderDashboard } = await setupDashboardModule({
      state: emptyState({ equipamentos: [equipamento] }),
      alerts: [
        {
          kind: 'critical',
          severity: 'danger',
          title: malicious,
          subtitle: malicious,
          eq: equipamento,
        },
      ],
    });

    await renderDashboard();
    await flushDashboardRender();

    const card = byId(DASHBOARD_PUBLIC_IDS.nextActionCard);
    const cta = byId(DASHBOARD_PUBLIC_IDS.nextActionCta);

    expect(byId(DASHBOARD_PUBLIC_IDS.nextActionTitle)?.textContent).toBe(malicious);
    expect(card?.querySelector('script')).toBeNull();
    expect(card?.querySelector('img')).toBeNull();
    expect(card?.querySelector('[onerror]')).toBeNull();
    expect(cta?.dataset.action).toBe('go-register-equip');
    expect(cta?.dataset.id).toBe(equipamento.id);
  });

  it('keeps next action contracts legacy-only and view model pure', () => {
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');
    const viewModelSource = readFileSync('src/ui/viewModels/dashboardViewModel.js', 'utf8');

    expect(DASHBOARD_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining(['dash__card', 'dash__card--next-action', 'dash__card-cta']),
    );
    expect(DASHBOARD_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-action', 'data-id', 'data-nav']),
    );
    expect(dashboardSource).not.toContain(
      '../../react/entrypoints/dashboard' + 'NextActionIsland.jsx',
    );
    expect(dashboardSource).not.toMatch(/react-dom\/client|createRoot|mountDashboardReact/);
    expect(viewModelSource).not.toMatch(/document\.|window\.|react-dom|createRoot|innerHTML/);
    expect(document.getElementById('chart-status-pie')).toBeNull();
    expect(document.getElementById('dash-onboarding')).not.toBeNull();
  });
});
