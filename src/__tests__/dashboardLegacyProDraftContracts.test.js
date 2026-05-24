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

        <section class="dash__pair" id="dash-pro-ops-row" hidden>
          <article class="dash__card" id="dash-critical-alerts-card">
            <div class="dash__card-label">Alertas criticos</div>
            <div class="dash__card-title" id="dash-critical-alerts-title">Tudo sob controle</div>
            <div class="dash__card-sub" id="dash-critical-alerts-sub">Sem alertas criticos agora.</div>
            <div class="dash__card-desc" id="dash-critical-alerts-list"></div>
          </article>
          <article class="dash__card" id="dash-risk-clients-card">
            <div class="dash__card-label">Clientes em risco</div>
            <div class="dash__card-title" id="dash-risk-clients-title">Clientes em dia</div>
            <div class="dash__card-sub" id="dash-risk-clients-sub">Nenhum cliente exige atencao agora.</div>
            <div class="dash__card-desc" id="dash-risk-clients-list"></div>
          </article>
        </section>

        <div id="dash-readonly-blocks-root" style="display: contents;"></div>
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

function maliciousText(label = 'xss') {
  return `${label} <img src=x onerror=alert(1)><script>alert(2)</script>`;
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

  vi.doMock('../react/entrypoints/dashboardHeroIsland.jsx', () => ({
    mountDashboardHeroReact: vi.fn(),
    unmountDashboardHeroReact: vi.fn(),
  }));
  vi.doMock('../react/entrypoints/dashboardKpisIsland.jsx', () => ({
    mountDashboardKpisReact: vi.fn(),
    unmountDashboardKpisReact: vi.fn(),
  }));
  vi.doMock('../react/entrypoints/dashboardNextActionIsland.jsx', () => ({
    mountDashboardNextActionReact: vi.fn(),
    unmountDashboardNextActionReact: vi.fn(),
  }));
  vi.doMock('../react/entrypoints/dashboardMonthSummaryIsland.jsx', () => ({
    mountDashboardMonthSummaryReact: vi.fn(),
    unmountDashboardMonthSummaryReact: vi.fn(),
  }));
  vi.doMock('../react/entrypoints/dashboardReadOnlyBlocksIsland.jsx', () => ({
    mountDashboardReadOnlyBlocksReact: vi.fn(),
    unmountDashboardReadOnlyBlocksReact: vi.fn(),
  }));

  return import('../ui/views/dashboard.js');
}

function byId(id) {
  return document.getElementById(id);
}

function assertNoUnsafeHtml(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('img')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.innerHTML).not.toMatch(/javascript:/i);
}

describe('dashboard legacy Pro cards and draft contracts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = buildDashboardDom();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('keeps Pro cards hidden for Free and Plus without requiring React or commercial flow', async () => {
    for (const planCode of ['free', 'plus']) {
      document.body.innerHTML = buildDashboardDom();
      const { renderDashboard } = await setupDashboardModule({
        planCode,
        hasPro: false,
        navigationMode: 'empresa',
        state: emptyState({
          equipamentos: [{ id: 'eq-free', nome: 'Split Free', status: 'ok' }],
        }),
      });

      await renderDashboard();

      expect(byId(DASHBOARD_PUBLIC_IDS.proOpsRow)?.hidden).toBe(true);
      expect(byId(DASHBOARD_PUBLIC_IDS.proOpsRow)?.classList.contains('dash__pair')).toBe(true);
      expect(byId(DASHBOARD_PUBLIC_IDS.criticalAlertsCard)?.classList.contains('dash__card')).toBe(
        true,
      );
      expect(byId(DASHBOARD_PUBLIC_IDS.riskClientsCard)?.classList.contains('dash__card')).toBe(
        true,
      );
      expect(byId(DASHBOARD_PUBLIC_IDS.root)?.getAttribute('data-tier')).toBe(planCode);
      expect(document.querySelector(['[data-nav="', 'pric', 'ing', '"]'].join(''))).toBeNull();
    }
  });

  it('renders Pro operation cards preserving actions, navigation and XSS boundaries', async () => {
    const malicious = maliciousText('Cliente risco');
    const equipamento = {
      id: 'eq-pro',
      nome: malicious,
      status: 'danger',
      tipo: malicious,
      clienteId: 'cli-pro',
      setorId: 'set-pro',
      __actionCode: 'register_corrective',
    };
    const { renderDashboard } = await setupDashboardModule({
      planCode: 'pro',
      hasPro: true,
      navigationMode: 'empresa',
      state: emptyState({
        equipamentos: [equipamento],
        clientes: [
          {
            id: 'cli-pro',
            nome: malicious,
            __pmocStatus: 'atencao',
            __pmocStatusLabel: malicious,
          },
        ],
        setores: [{ id: 'set-pro', nome: malicious }],
        registros: [{ id: 'reg-pro', equipId: 'eq-pro', data: '2026-04-30', tipo: malicious }],
      }),
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

    const row = byId(DASHBOARD_PUBLIC_IDS.proOpsRow);
    const criticalAction = byId(DASHBOARD_PUBLIC_IDS.criticalAlertsList)?.querySelector(
      '.dash__card-cta',
    );
    const clientAction = byId(DASHBOARD_PUBLIC_IDS.riskClientsList)?.querySelector(
      '.dash__card-cta',
    );

    expect(row?.hidden).toBe(false);
    expect(row?.classList.contains('dash__pair')).toBe(true);
    expect(byId(DASHBOARD_PUBLIC_IDS.criticalAlertsTitle)?.textContent).toBe('Alertas críticos');
    expect(byId(DASHBOARD_PUBLIC_IDS.riskClientsTitle)?.textContent).toBe('Clientes em risco');
    expect(criticalAction?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.goRegisterEquip);
    expect(criticalAction?.getAttribute('data-id')).toBe('eq-pro');
    expect(clientAction?.getAttribute('data-nav')).toBe('clientes');
    expect(clientAction?.hasAttribute('data-action')).toBe(false);
    expect(row?.querySelectorAll('.dash__card')).toHaveLength(2);
    expect(row?.querySelectorAll('.dash__card-cta')).toHaveLength(2);
    assertNoUnsafeHtml(row);
  });

  it('keeps continue draft hidden without draft and renders continue/discard contracts with safe text', async () => {
    const malicious = maliciousText('Draft Split');
    const state = emptyState({
      equipamentos: [{ id: 'eq-draft', nome: malicious, status: 'ok' }],
      registros: [{ id: 'reg-draft', equipId: 'eq-draft', data: '2026-04-30' }],
    });
    let { renderDashboard } = await setupDashboardModule({ state });

    await renderDashboard();

    expect(document.querySelector('.dash__continue-card')).toBeNull();

    sessionStorage.setItem('cooltrack-editing-id', 'reg-draft');
    document.body.innerHTML = buildDashboardDom();
    ({ renderDashboard } = await setupDashboardModule({ state }));

    await renderDashboard();

    const card = document.querySelector('.dash__continue-card');
    const continueCta = card?.querySelector('[data-action="continue-draft"]');
    const discardCta = card?.querySelector('[data-action="discard-draft"]');

    expect(card).not.toBeNull();
    expect(card?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.continueDraft);
    expect(card?.getAttribute('data-id')).toBe('reg-draft');
    expect(continueCta?.getAttribute('data-id')).toBe('reg-draft');
    expect(discardCta).not.toBeNull();
    expect(card?.querySelector('.dash__continue-card__cta')).not.toBeNull();
    expect(card?.querySelector('.dash__continue-card__close')).not.toBeNull();
    expect(card?.textContent).toContain('Continuar');
    assertNoUnsafeHtml(card);
  });

  it('documents current adapter contracts with Pro/draft React island mounted outside dashboard.js', () => {
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');

    expect(DASHBOARD_PUBLIC_IDS).toMatchObject({
      proOpsRow: 'dash-pro-ops-row',
      proDraftRoot: 'dash-pro-draft-root',
      criticalAlertsCard: 'dash-critical-alerts-card',
      criticalAlertsTitle: 'dash-critical-alerts-title',
      criticalAlertsSubtitle: 'dash-critical-alerts-sub',
      criticalAlertsList: 'dash-critical-alerts-list',
      riskClientsCard: 'dash-risk-clients-card',
      riskClientsTitle: 'dash-risk-clients-title',
      riskClientsSubtitle: 'dash-risk-clients-sub',
      riskClientsList: 'dash-risk-clients-list',
      onboarding: 'dash-onboarding',
    });
    expect(DASHBOARD_ACTIONS).toMatchObject({
      continueDraft: 'continue-draft',
      discardDraft: 'discard-draft',
      goRegisterEquip: 'go-register-equip',
    });
    expect(DASHBOARD_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'dash__card',
        'dash__card-title',
        'dash__card-sub',
        'dash__card-desc',
        'dash__card-cta',
        'dash__continue-card',
        'dash__continue-card__cta',
        'dash__continue-card__close',
      ]),
    );
    expect(DASHBOARD_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-action', 'data-id', 'data-nav', 'data-tier']),
    );
    expect(dashboardSource).toContain('../../react/entrypoints/dashboardProDraftIsland.jsx');
    expect(dashboardSource).toContain('mountDashboardProDraftReact');
    expect(dashboardSource).not.toContain('function _renderProCards');
    expect(dashboardSource).not.toContain('function _renderContinueDraftCard');
    expect(dashboardSource).not.toContain('criticalList.innerHTML');
    expect(dashboardSource).not.toContain('clientsList.innerHTML');
    expect(dashboardSource).not.toContain('insertAdjacentHTML');
    expect(dashboardSource).not.toMatch(/react-dom\/client|createRoot/);
  });
});
