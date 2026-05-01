import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DASHBOARD_ACTIONS,
  DASHBOARD_DATA_ATTRIBUTES,
  DASHBOARD_PUBLIC_CLASSES,
  DASHBOARD_PUBLIC_IDS,
} from '../ui/viewModels/dashboardContracts.js';

function buildDashboardDom() {
  return `
    <div id="view-inicio" class="view active">
      <section class="dash dash--quick" id="dash" data-tier="free" data-tone="ok">
        <article class="dash__hero dash__hero--quick" id="dash-hero" data-tone="ok">
          <div class="dash__hero-body">
            <h1 class="dash__hero-greeting" id="dash-hero-greeting"></h1>
            <p class="dash__hero-summary" id="dash-hero-summary"></p>
          </div>
          <div class="dash__hero-cta-wrap">
            <button class="dash__hero-cta" id="dash-hero-cta" type="button">
              <span class="dash__hero-cta-label" id="dash-hero-cta-label"></span>
            </button>
            <button class="dash__hero-cta dash__hero-cta--secondary" id="dash-hero-cta-secondary" type="button">
              <span class="dash__hero-cta-label" id="dash-hero-cta-secondary-label"></span>
            </button>
          </div>
        </article>
        <div id="dash-empty" class="dash__empty" hidden></div>
        <div id="dash-onboarding"></div>
        <div id="dash-overflow-banner"></div>
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

function currentMonthDate(day = 12) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day, 12).toISOString();
}

function byId(id) {
  return document.getElementById(id);
}

async function setupDashboardModule({
  state = emptyState(),
  alerts = [],
  planCode = 'free',
  hasPro = false,
  navigationMode = 'rapido',
  profileName = 'Ana',
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

  vi.doMock('../core/plans/monetization.js', () => ({
    fetchMyProfileBilling: vi.fn(async () => ({ profile: { plan: planCode } })),
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
      label: status === 'danger' ? 'Critico' : 'Operacional',
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
    Profile: { get: vi.fn(() => ({ nome: profileName })) },
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

describe('dashboard legacy hero render adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = buildDashboardDom();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders the empty dashboard hero preserving ids, classes and CTA contracts', async () => {
    const { renderDashboard } = await setupDashboardModule();

    await renderDashboard();

    const hero = byId(DASHBOARD_PUBLIC_IDS.hero);
    const cta = byId(DASHBOARD_PUBLIC_IDS.heroCta);
    const secondaryCta = byId(DASHBOARD_PUBLIC_IDS.heroSecondaryCta);

    expect(byId(DASHBOARD_PUBLIC_IDS.view)).not.toBeNull();
    expect(byId(DASHBOARD_PUBLIC_IDS.root)).not.toBeNull();
    expect(hero).not.toBeNull();
    expect(hero?.classList.contains('dash__hero')).toBe(true);
    expect(hero?.classList.contains('dash__hero--quick')).toBe(true);
    expect(hero?.dataset.tone).toBe('ok');
    expect(byId(DASHBOARD_PUBLIC_IDS.heroGreeting)?.textContent).toBe('Ol\u00e1, Ana');
    expect(byId(DASHBOARD_PUBLIC_IDS.heroSummary)?.textContent).toBe(
      '0 equipamentos \u2022 0 servi\u00e7os no m\u00eas',
    );
    expect(cta?.classList.contains('dash__hero-cta')).toBe(true);
    expect(cta?.dataset.nav).toBe('registro');
    expect(cta?.hasAttribute('data-action')).toBe(false);
    expect(cta?.hasAttribute('data-id')).toBe(false);
    expect(byId(DASHBOARD_PUBLIC_IDS.heroCtaLabel)?.textContent).toBe('Registrar servi\u00e7o');
    expect(secondaryCta?.dataset.action).toBe(DASHBOARD_ACTIONS.openModal);
    expect(secondaryCta?.dataset.id).toBe('modal-add-eq');
    expect(secondaryCta?.hasAttribute('data-nav')).toBe(false);
    expect(byId(DASHBOARD_PUBLIC_IDS.heroSecondaryCtaLabel)?.textContent).toBe(
      'Cadastrar equipamento',
    );
  });

  it('renders the company hero with data preserving primary and secondary CTAs', async () => {
    const state = emptyState({
      equipamentos: [{ id: 'eq-1', nome: 'Split 01', clienteId: 'cli-1', setorId: 'set-1' }],
      registros: [{ id: 'reg-1', equipId: 'eq-1', data: currentMonthDate(), tipo: 'Preventiva' }],
      clientes: [{ id: 'cli-1', nome: 'Cliente A' }],
      setores: [{ id: 'set-1', nome: 'Sala tecnica' }],
    });
    const { renderDashboard } = await setupDashboardModule({
      state,
      planCode: 'pro',
      hasPro: true,
      navigationMode: 'empresa',
    });

    await renderDashboard();

    const dash = byId(DASHBOARD_PUBLIC_IDS.root);
    const hero = byId(DASHBOARD_PUBLIC_IDS.hero);
    const cta = byId(DASHBOARD_PUBLIC_IDS.heroCta);
    const secondaryCta = byId(DASHBOARD_PUBLIC_IDS.heroSecondaryCta);

    expect(dash?.dataset.tier).toBe('pro');
    expect(hero?.dataset.tone).toBe('ok');
    expect(byId(DASHBOARD_PUBLIC_IDS.heroGreeting)?.textContent).toBe(
      'Opera\u00e7\u00e3o em andamento',
    );
    expect(byId(DASHBOARD_PUBLIC_IDS.heroSummary)?.textContent).toBe(
      '1 clientes \u2022 1 equipamentos \u2022 1 servi\u00e7os no m\u00eas',
    );
    expect(cta?.dataset.nav).toBe('registro');
    expect(byId(DASHBOARD_PUBLIC_IDS.heroCtaLabel)?.textContent).toBe('Registrar servi\u00e7o');
    expect(secondaryCta?.dataset.nav).toBe('clientes');
    expect(secondaryCta?.hasAttribute('data-action')).toBe(false);
    expect(secondaryCta?.hasAttribute('data-id')).toBe(false);
    expect(byId(DASHBOARD_PUBLIC_IDS.heroSecondaryCtaLabel)?.textContent).toBe('Ver clientes');
  });

  it('keeps dynamic hero text safe from HTML injection', async () => {
    const malicious = '<img src=x onerror=alert(1)><script>alert(1)</script>';
    const { renderDashboard } = await setupDashboardModule({ profileName: malicious });

    await renderDashboard();

    const hero = byId(DASHBOARD_PUBLIC_IDS.hero);

    expect(byId(DASHBOARD_PUBLIC_IDS.heroGreeting)?.textContent).toBe(`Ol\u00e1, ${malicious}`);
    expect(hero?.querySelector('script')).toBeNull();
    expect(hero?.querySelector('img')).toBeNull();
    expect(hero?.querySelector('[onerror]')).toBeNull();
    expect(hero?.querySelector('[onclick]')).toBeNull();
    expect(hero?.innerHTML).not.toMatch(/javascript:/i);
    expect(byId(DASHBOARD_PUBLIC_IDS.heroCta)?.dataset.nav).toBe('registro');
  });

  it('keeps the hero legacy-only and documents public contracts for a future island', () => {
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');

    expect(DASHBOARD_PUBLIC_IDS).toMatchObject({
      view: 'view-inicio',
      root: 'dash',
      hero: 'dash-hero',
      heroGreeting: 'dash-hero-greeting',
      heroSummary: 'dash-hero-summary',
      heroCta: 'dash-hero-cta',
      heroSecondaryCta: 'dash-hero-cta-secondary',
    });
    expect(DASHBOARD_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'dash__hero',
        'dash__hero--quick',
        'dash__hero-body',
        'dash__hero-greeting',
        'dash__hero-summary',
        'dash__hero-cta-wrap',
        'dash__hero-cta',
        'dash__hero-cta--secondary',
        'dash__hero-cta-label',
      ]),
    );
    expect(DASHBOARD_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-action', 'data-id', 'data-nav', 'data-tier', 'data-tone']),
    );
    expect(dashboardSource).toContain('function _renderHero');
    expect(dashboardSource).toContain("getElementById('dash-hero-greeting')");
    expect(dashboardSource).not.toMatch(/dashboardHeroIsland|mountDashboardHeroReact/);
    expect(dashboardSource).not.toMatch(/react-dom\/client|createRoot/);
    expect(document.getElementById('chart-status-pie')).toBeNull();
    expect(document.querySelector('.app-header')).toBeNull();
  });
});
