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
        <article class="dash__hero dash__hero--quick" id="dash-hero" data-tone="ok"></article>
        <div id="dash-empty" class="dash__empty" hidden></div>
        <div id="dash-onboarding">
          <div id="dash-pro-draft-root" style="display: contents;"></div>
        </div>
        <div id="dash-overflow-banner"></div>
        <section class="dash__kpi-grid" id="dash-kpis-root"></section>
        <article class="dash__card dash__card--next-action" id="dash-next-action-card"></article>
        <article class="dash__card dash__card--last-service" id="dash-last-service" hidden></article>
        <section class="dash__section" id="dash-month-section"></section>
        <section class="dash__pair" id="dash-pro-ops-row" hidden></section>
        <div id="dash-readonly-blocks-root" style="display: contents;"></div>
      </section>
    </div>
    <div id="lista-equip"></div>
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

function maliciousText(label = 'xss') {
  return `${label} <img src=x onerror=alert(1)><script>alert(2)</script>`;
}

function assertNoUnsafeHtml(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('img')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.innerHTML).not.toMatch(/javascript:/i);
}

function buildOverflowFixtures() {
  const malicious = maliciousText('Equipamento limite');
  return {
    equipamentos: Array.from({ length: 4 }, (_, index) => ({
      id: `eq-over-${index}`,
      nome: `${malicious} ${index}`,
      status: 'ok',
      tipo: malicious,
    })),
    registros: [],
    clientes: [{ id: 'cli-over', nome: malicious }],
  };
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
  const installRender = vi.fn(() => false);
  const installGetRenderState = vi.fn(() => 'hidden');
  const overflowMaybeShowFirstTimeModal = vi.fn();

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
    PLAN_CATALOG: {
      free: { limits: { equipamentos: 3, registros: Number.POSITIVE_INFINITY } },
      plus: { limits: { equipamentos: 15, registros: Number.POSITIVE_INFINITY } },
      pro: {
        limits: { equipamentos: Number.POSITIVE_INFINITY, registros: Number.POSITIVE_INFINITY },
      },
    },
    getEffectivePlan: vi.fn(() => planCode),
    hasProAccess: vi.fn(() => hasPro),
  }));

  vi.doMock('../core/plans/planCache.js', () => ({
    isCachedPlanPro: vi.fn(() => hasPro),
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
    calculateHealthScore: vi.fn(() => 80),
    evaluateEquipmentRisk: vi.fn((equipamento) => ({
      score: equipamento?.__riskScore ?? 72,
      classification: equipamento?.__riskClass ?? 'medio',
      factors: [],
    })),
    evaluateEquipmentRiskTrend: vi.fn(() => ({ trend: 'stable', delta: 0 })),
    getEquipmentMaintenanceContext: vi.fn(() => ({
      ultimoRegistro: null,
      proximaPreventiva: null,
      periodicidadeDias: 30,
    })),
    getHealthClass: vi.fn(() => 'ok'),
  }));

  vi.doMock('../domain/priorityEngine.js', () => ({
    evaluateEquipmentPriority: vi.fn((equipamento) => ({
      priorityLevel: equipamento?.__priorityLevel ?? 1,
      priorityLabel: equipamento?.__priorityLabel ?? 'Baixa',
    })),
  }));

  vi.doMock('../domain/actionPriority.js', () => ({
    getActionPriorityScore: vi.fn((equipamento) => ({
      actionPriorityScore: equipamento?.__actionPriorityScore ?? 0,
      group: equipamento?.__actionGroup ?? 'ok',
      reasons: equipamento?.__reasons ?? [],
      suggestedAction: {
        actionCode: equipamento?.__actionCode ?? 'none',
        actionLabel: equipamento?.__actionLabel ?? 'Monitorar',
      },
    })),
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
    evaluateEquipmentSuggestedAction: vi.fn((equipamento) => ({
      actionCode: equipamento?.__actionCode ?? 'register_corrective',
      actionLabel: equipamento?.__actionLabel ?? 'Registrar corretiva',
    })),
  }));

  vi.doMock('../core/equipmentRules.js', () => ({
    getOperationalStatus: vi.fn(({ status }) => ({
      code: status === 'danger' ? 'danger' : 'ok',
      label: status === 'danger' ? 'Critico' : 'Operacional',
    })),
  }));

  vi.doMock('../ui/components/equipmentVisual.js', () => ({
    getEquipmentVisualMeta: vi.fn((equipamento) => ({
      icon: 'HVAC',
      label: 'Equipamento',
      initials: equipamento?.nome?.slice(0, 2) || 'EQ',
      tone: 'ok',
      photoUrl: '',
    })),
  }));

  vi.doMock('../core/clientePmoc.js', () => ({
    buildClientePmocDetails: vi.fn(({ cliente }) => ({
      hasPmoc: true,
      status: cliente?.__pmocStatus ?? 'ok',
      statusLabel: cliente?.__pmocStatusLabel ?? 'Em dia',
    })),
  }));

  vi.doMock('../ui/components/skeleton.js', () => ({
    withSkeleton: (_el, _options, renderFn) => renderFn(),
  }));

  vi.doMock('../core/profile.js', () => ({
    Profile: { get: vi.fn(() => ({ nome: 'Ana' })) },
  }));

  vi.doMock('../core/telemetry.js', () => ({
    trackEvent: vi.fn(),
  }));

  vi.doMock('../core/modal.js', () => ({
    attachDialogA11y: vi.fn(() => () => {}),
  }));

  vi.doMock('../ui/components/installAppPrompt.js', () => ({
    InstallAppPrompt: { getRenderState: installGetRenderState, render: installRender },
  }));

  vi.doMock('../ui/components/overflowBanner.js', async () => {
    const actual = await vi.importActual('../ui/components/overflowBanner.js');
    return {
      OverflowBanner: {
        ...actual.OverflowBanner,
        maybeShowFirstTimeModal: overflowMaybeShowFirstTimeModal,
      },
    };
  });

  const dashboardModule = await import('../ui/views/dashboard.js');
  return {
    ...dashboardModule,
    installGetRenderState,
    installRender,
    overflowMaybeShowFirstTimeModal,
  };
}

describe('dashboard legacy onboarding, empty state and overflow contracts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = buildDashboardDom();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders the empty state and onboarding contracts without executing navigation', async () => {
    const { renderDashboard, installGetRenderState } = await setupDashboardModule();

    await renderDashboard();

    const empty = byId(DASHBOARD_PUBLIC_IDS.empty);
    const onboarding = byId(DASHBOARD_PUBLIC_IDS.onboarding);
    const emptyCta = empty?.querySelector('.empty-state__cta .btn');
    const onboardingBannerCta = document.querySelector('#onboarding-banner [data-action]');

    expect(byId(DASHBOARD_PUBLIC_IDS.view)).not.toBeNull();
    expect(empty?.hidden).toBe(false);
    expect(empty?.classList.contains('dash__empty')).toBe(true);
    expect(empty?.querySelector('.empty-state')).not.toBeNull();
    expect(emptyCta?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.openModal);
    expect(emptyCta?.getAttribute('data-id')).toBe('modal-add-eq');

    expect(onboarding).not.toBeNull();
    expect(onboarding?.querySelector('.onb-card')).not.toBeNull();
    expect(onboarding?.querySelector('.onb-card__close')?.getAttribute('data-action')).toBe(
      DASHBOARD_ACTIONS.onboardingDismiss,
    );
    expect(onboarding?.querySelector('.onb-step[data-nav="equipamentos"]')).not.toBeNull();
    expect(onboarding?.querySelector('.onb-step[data-nav="registro"]')).not.toBeNull();

    expect(document.getElementById('onboarding-banner')).not.toBeNull();
    expect(onboardingBannerCta?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.openModal);
    expect(onboardingBannerCta?.getAttribute('data-id')).toBe('modal-add-eq');
    expect(installGetRenderState).toHaveBeenCalled();

    assertNoUnsafeHtml(empty);
    assertNoUnsafeHtml(onboarding);
    assertNoUnsafeHtml(document.getElementById('onboarding-banner'));
  });

  it('renders the overflow banner contract for Free usage above limits without opening the real modal', async () => {
    const { renderDashboard, overflowMaybeShowFirstTimeModal } = await setupDashboardModule({
      state: emptyState(buildOverflowFixtures()),
    });

    await renderDashboard();

    const overflowHost = byId(DASHBOARD_PUBLIC_IDS.overflowBanner);
    const overflowBanner = overflowHost?.querySelector('.dash-overflow-banner');
    const cta = overflowBanner?.querySelector('.dash-overflow-banner__cta');

    expect(byId(DASHBOARD_PUBLIC_IDS.empty)?.hidden).toBe(true);
    expect(byId(DASHBOARD_PUBLIC_IDS.empty)?.innerHTML).toBe('');
    expect(overflowBanner).not.toBeNull();
    expect(overflowBanner?.getAttribute('role')).toBe('status');
    expect(overflowBanner?.getAttribute('data-limit-type')).toBe('equipamentos');
    expect(cta).toBeNull();
    expect(overflowMaybeShowFirstTimeModal).toHaveBeenCalledTimes(1);
    expect(document.getElementById('dash-overflow-modal')).toBeNull();

    assertNoUnsafeHtml(overflowHost);
    expect(overflowHost?.textContent).not.toContain('<script>');
    expect(overflowHost?.textContent).not.toContain('onerror');
  });

  it('keeps current adapter contracts delegated to the DOM renderer and away from createRoot', () => {
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');

    expect(DASHBOARD_PUBLIC_IDS).toMatchObject({
      empty: 'dash-empty',
      onboarding: 'dash-onboarding',
      overflowBanner: 'dash-overflow-banner',
    });
    expect(DASHBOARD_ACTIONS).toMatchObject({
      openModal: 'open-modal',
      onboardingDismiss: 'onboarding-dismiss',
    });
    expect(DASHBOARD_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'dash__empty',
        'empty-state',
        'empty-state__cta',
        'onb-card',
        'onb-card__close',
        'onb-step',
        'onboarding-banner',
        'dash-overflow-banner',
      ]),
    );
    expect(DASHBOARD_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-action', 'data-id', 'data-nav', 'data-tier']),
    );
    expect(dashboardSource).toContain('./dashboard/onboarding.js');
    expect(dashboardSource).toContain('renderOnboardingBlocksDom');
    expect(dashboardSource).toContain('_buildOnboardingBlocksModel');
    expect(dashboardSource).toContain('InstallAppPrompt.getRenderState');
    expect(dashboardSource).toContain('OnboardingChecklist.getRenderModel');
    expect(dashboardSource).toContain('OnboardingBanner.render');
    expect(dashboardSource).toContain('OverflowBanner.computeState');
    expect(dashboardSource).not.toContain('dashboardOnboardingIsland.jsx');
    expect(dashboardSource).not.toContain('mountDashboardOnboardingReact');
    expect(dashboardSource).not.toContain('emptyStateHtml(');
    expect(dashboardSource).not.toContain("InstallAppPrompt.render('dash-onboarding')");
    expect(dashboardSource).not.toContain("OnboardingChecklist.render('dash-onboarding')");
    expect(dashboardSource).not.toContain('OverflowBanner.render');
    expect(dashboardSource).not.toMatch(/react-dom\/client|createRoot/);
  });
});
