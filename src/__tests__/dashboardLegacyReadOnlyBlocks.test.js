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
        <div id="dash-onboarding"></div>
        <div id="dash-overflow-banner"></div>

        <section class="dash__kpi-grid" id="dash-kpis-root"></section>
        <article class="dash__card dash__card--next-action" id="dash-next-action-card"></article>
        <article class="dash__card dash__card--last-service" id="dash-last-service" hidden></article>
        <section class="dash__section" id="dash-month-section"></section>

        <section class="dash__pair" id="dash-pro-ops-row" hidden>
          <article class="dash__card" id="dash-critical-alerts-card">
            <div class="dash__card-title" id="dash-critical-alerts-title">Tudo sob controle</div>
            <div class="dash__card-sub" id="dash-critical-alerts-sub">Sem alertas críticos agora.</div>
            <div class="dash__card-desc" id="dash-critical-alerts-list"></div>
          </article>
          <article class="dash__card" id="dash-risk-clients-card">
            <div class="dash__card-title" id="dash-risk-clients-title">Clientes em dia</div>
            <div class="dash__card-sub" id="dash-risk-clients-sub">Nenhum cliente exige atenção agora.</div>
            <div class="dash__card-desc" id="dash-risk-clients-list"></div>
          </article>
        </section>

        <div id="dash-readonly-blocks-root" style="display: contents;">
          <section class="dash__section" id="dash-critical-section" hidden>
            <header class="dash__section-header">
              <span class="dash__section-label">A FAZER AGORA</span>
              <span class="dash__section-count" id="dash-critical-now-count">0</span>
            </header>
            <div id="dash-critical-now"></div>
          </section>

          <section class="dash__section" id="dash-alerts-section" hidden>
            <header class="dash__section-header">
              <span class="dash__section-label">Alertas ativos</span>
            </header>
            <div id="dash-alertas-mini"></div>
          </section>

          <section class="dash__section" id="dash-criticos-section" hidden>
            <header class="dash__section-header">
              <span class="dash__section-label">Equipamentos com ocorrência</span>
            </header>
            <div id="dash-criticos"></div>
          </section>

          <section class="dash__section" id="dash-recentes-section" hidden>
            <header class="dash__section-header">
              <span class="dash__section-label">Últimos serviços</span>
            </header>
            <div id="dash-recentes"></div>
          </section>
        </div>
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
    calculateHealthScore: vi.fn(() => 55),
    evaluateEquipmentRisk: vi.fn((equipamento) => ({
      score: equipamento?.__riskScore ?? 70,
      classification: equipamento?.__riskClass ?? 'medio',
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
      label: status === 'danger' ? 'Crítico' : 'Operacional',
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

  vi.doMock('../ui/components/overflowBanner.js', () => ({
    OverflowBanner: {
      computeState: vi.fn(() => ({ overLimit: false })),
      render: vi.fn(() => ''),
      maybeShowFirstTimeModal: vi.fn(),
    },
  }));

  return import('../ui/views/dashboard.js');
}

function assertNoUnsafeHtml(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('img')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.innerHTML).not.toMatch(/javascript:/i);
}

describe('dashboard legacy read-only blocks render adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = buildDashboardDom();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('keeps mini alerts, critical and recent sections hidden in empty state', async () => {
    const { renderDashboard } = await setupDashboardModule();

    await renderDashboard();

    expect(byId(DASHBOARD_PUBLIC_IDS.view)).not.toBeNull();
    expect(byId(DASHBOARD_PUBLIC_IDS.criticalSection)?.hidden).toBe(true);
    expect(byId(DASHBOARD_PUBLIC_IDS.alertsSection)?.hidden).toBe(true);
    expect(byId(DASHBOARD_PUBLIC_IDS.criticosSection)?.hidden).toBe(true);
    expect(byId(DASHBOARD_PUBLIC_IDS.recentesSection)?.hidden).toBe(true);
    expect(byId(DASHBOARD_PUBLIC_IDS.criticalNow)?.children).toHaveLength(0);
    expect(byId(DASHBOARD_PUBLIC_IDS.alertsMini)?.children).toHaveLength(0);
    expect(byId(DASHBOARD_PUBLIC_IDS.criticos)?.children).toHaveLength(0);
    expect(byId(DASHBOARD_PUBLIC_IDS.recentes)?.children).toHaveLength(0);
  });

  it('renders mini alerts, critical now, critical equipments, recent records and pro read-only cards with public contracts', async () => {
    const malicious = maliciousText('Contrato');
    const equipamento = {
      id: 'eq-critical',
      nome: malicious,
      status: 'danger',
      tipo: malicious,
      tag: malicious,
      criticidade: 'alta',
      clienteId: 'cli-risk',
      setorId: 'set-risk',
      __priorityLevel: 3,
      __priorityLabel: 'Alta',
      __actionPriorityScore: 90,
      __actionGroup: 'critico',
      __actionCode: 'register_corrective',
      __actionLabel: malicious,
      __reasons: [malicious],
    };
    const { renderDashboard } = await setupDashboardModule({
      planCode: 'pro',
      hasPro: true,
      navigationMode: 'empresa',
      state: emptyState({
        equipamentos: [equipamento],
        clientes: [
          {
            id: 'cli-risk',
            nome: malicious,
            __pmocStatus: 'atencao',
            __pmocStatusLabel: malicious,
          },
        ],
        setores: [{ id: 'set-risk', nome: malicious }],
        registros: [
          {
            id: 'reg-new',
            equipId: 'eq-critical',
            data: '2026-04-30T10:00:00.000Z',
            tipo: 'Preventiva',
            obs: 'Registro mais novo',
          },
          {
            id: 'reg-old',
            equipId: 'eq-critical',
            data: '2026-04-29T10:00:00.000Z',
            tipo: malicious,
            obs: malicious,
          },
        ],
      }),
      alerts: [
        {
          kind: 'critical',
          severity: 'danger',
          recommendedAction: 'register-now',
          title: malicious,
          subtitle: malicious,
          eq: equipamento,
        },
      ],
    });

    await renderDashboard();

    const alertsSection = byId(DASHBOARD_PUBLIC_IDS.alertsSection);
    const criticalSection = byId(DASHBOARD_PUBLIC_IDS.criticalSection);
    const criticosSection = byId(DASHBOARD_PUBLIC_IDS.criticosSection);
    const recentesSection = byId(DASHBOARD_PUBLIC_IDS.recentesSection);
    const proRow = byId(DASHBOARD_PUBLIC_IDS.proOpsRow);

    expect(alertsSection?.hidden).toBe(false);
    expect(criticalSection?.hidden).toBe(false);
    expect(criticosSection?.hidden).toBe(false);
    expect(recentesSection?.hidden).toBe(false);
    expect(proRow?.hidden).toBe(false);

    expect(alertsSection?.classList.contains('dash__section')).toBe(true);
    expect(alertsSection?.querySelector('.dash__section-header')).not.toBeNull();
    expect(alertsSection?.querySelector('.dash__section-label')?.textContent).toContain(
      'Alertas ativos',
    );
    expect(byId(DASHBOARD_PUBLIC_IDS.alertsMini)?.querySelector('.dash-alertas-list')).not.toBe(
      null,
    );

    const alertCard = byId(DASHBOARD_PUBLIC_IDS.alertsMini)?.querySelector('.alert-card');
    expect(alertCard).not.toBeNull();
    expect(alertCard?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.goRegisterEquip);
    expect(alertCard?.getAttribute('data-id')).toBe('eq-critical');

    expect(criticalSection?.querySelector('.dash__section-count')?.textContent).toBe('1');
    const criticalItem = byId(DASHBOARD_PUBLIC_IDS.criticalNow)?.querySelector(
      '.critical-now-item',
    );
    expect(criticalItem).not.toBeNull();
    expect(criticalItem?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.goRegisterEquip);
    expect(criticalItem?.getAttribute('data-id')).toBe('eq-critical');

    const criticalEquipment = byId(DASHBOARD_PUBLIC_IDS.criticos)?.querySelector('.equip-card');
    expect(criticalEquipment).not.toBeNull();
    expect(criticalEquipment?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.viewEquip);
    expect(criticalEquipment?.getAttribute('data-id')).toBe('eq-critical');

    const recentCard = byId(DASHBOARD_PUBLIC_IDS.recentes)?.querySelector('.recent-card');
    expect(recentCard).not.toBeNull();
    expect(recentCard?.getAttribute('data-nav')).toBe('historico');

    expect(byId(DASHBOARD_PUBLIC_IDS.criticalAlertsTitle)?.textContent).toBe('Alertas críticos');
    expect(
      byId(DASHBOARD_PUBLIC_IDS.criticalAlertsList)?.querySelector(
        '[data-action="go-register-equip"]',
      ),
    ).not.toBeNull();
    expect(byId(DASHBOARD_PUBLIC_IDS.riskClientsTitle)?.textContent).toBe('Clientes em risco');
    expect(
      byId(DASHBOARD_PUBLIC_IDS.riskClientsList)?.querySelector('[data-nav="clientes"]'),
    ).not.toBeNull();

    assertNoUnsafeHtml(alertsSection);
    assertNoUnsafeHtml(criticalSection);
    assertNoUnsafeHtml(criticosSection);
    assertNoUnsafeHtml(recentesSection);
    assertNoUnsafeHtml(proRow);
  });

  it('renders read-only dashboard blocks in the legacy adapter and documents public contracts', () => {
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');

    expect(DASHBOARD_PUBLIC_IDS).toMatchObject({
      readOnlyBlocksRoot: 'dash-readonly-blocks-root',
      criticalSection: 'dash-critical-section',
      criticalNow: 'dash-critical-now',
      criticalNowCount: 'dash-critical-now-count',
      alertsSection: 'dash-alerts-section',
      alertsMini: 'dash-alertas-mini',
      criticosSection: 'dash-criticos-section',
      criticos: 'dash-criticos',
      recentesSection: 'dash-recentes-section',
      recentes: 'dash-recentes',
      criticalAlertsTitle: 'dash-critical-alerts-title',
      criticalAlertsList: 'dash-critical-alerts-list',
      riskClientsTitle: 'dash-risk-clients-title',
      riskClientsList: 'dash-risk-clients-list',
    });
    expect(DASHBOARD_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'dash__section',
        'dash__section-header',
        'dash__section-label',
        'dash__section-count',
        'alert-card',
        'critical-now-item',
        'recent-card',
        'dash__continue-card',
      ]),
    );
    expect(DASHBOARD_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-action', 'data-id', 'data-nav']),
    );
    expect(dashboardSource).not.toContain(
      '../../react/entrypoints/dashboardReadOnlyBlocksIsland.jsx',
    );
    expect(dashboardSource).not.toContain('mountDashboardReadOnlyBlocksReact');
    expect(dashboardSource).not.toContain('function _renderAlertsMiniSection');
    expect(dashboardSource).not.toContain('function _renderCriticalNowSection');
    expect(dashboardSource).not.toContain('function _renderCriticosSection');
    expect(dashboardSource).not.toContain('function _renderRecentesSection');
    expect(dashboardSource).not.toMatch(/react-dom\/client|createRoot/);
    expect(document.getElementById('chart-status-pie')).toBeNull();
    expect(document.querySelector('.app-header')).toBeNull();
  });
});
