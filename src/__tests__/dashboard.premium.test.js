import { beforeEach, describe, expect, it, vi } from 'vitest';

function flushAsyncRender() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function buildDom() {
  return `
    <div id="view-inicio" class="active">
      <section id="dash" data-tier="free" data-tone="ok">
        <article id="dash-hero" data-tone="ok">
          <h1 id="dash-hero-greeting"></h1>
          <p id="dash-hero-summary"></p>
          <button id="dash-hero-cta"><span id="dash-hero-cta-label"></span></button>
          <button id="dash-hero-cta-secondary"><span id="dash-hero-cta-secondary-label"></span></button>
        </article>
        <div id="dash-empty" hidden></div>
        <div id="dash-onboarding"></div>
        <div id="dash-overflow-banner"></div>
        <div id="dash-kpi-ativos"></div>
        <div id="dash-kpi-ativos-sub"></div>
        <div id="dash-kpi-ef"></div>
        <div id="dash-kpi-ef-sub"></div>
        <div id="dash-kpi-ef-spark"></div>
        <div id="dash-kpi-anom"></div>
        <div id="dash-kpi-anom-sub"></div>
        <div id="dash-kpi-mes"></div>
        <div id="dash-kpi-mes-sub"></div>
        <div id="dash-kpi-mes-spark"></div>
        <article id="dash-next-action-card"><div id="dash-next-title"></div><div id="dash-next-sub"></div><button id="dash-next-cta"><span id="dash-next-cta-label"></span></button></article>
        <article id="dash-last-service" hidden><div id="dash-last-title"></div><div id="dash-last-sub"></div></article>
        <section id="dash-pro-ops-row" hidden>
          <div id="dash-critical-alerts-title"></div>
          <div id="dash-critical-alerts-sub"></div>
          <div id="dash-critical-alerts-list"></div>
          <div id="dash-risk-clients-title"></div>
          <div id="dash-risk-clients-sub"></div>
          <div id="dash-risk-clients-list"></div>
        </section>
        <div id="dash-month-label"></div>
        <div id="dash-month-services"></div>
        <div id="dash-month-equips"></div>
        <div id="dash-month-pending"></div>
        <div id="dash-month-trend"></div>
        <section id="dash-critical-section"></section>
        <div id="dash-critical-now"></div>
        <div id="dash-critical-now-count"></div>
        <section id="dash-alerts-section"></section>
        <div id="dash-alertas-mini"></div>
        <div id="dash-upgrade-inline-hint"></div>
        <section id="dash-criticos-section"></section>
        <div id="dash-criticos"></div>
        <section id="dash-recentes-section"></section>
        <div id="dash-recentes"></div>
      </section>
    </div>
  `;
}

async function setupModule({ planCode = 'free', hasPro = false, state, alerts = [] } = {}) {
  vi.resetModules();
  vi.doMock('../core/state.js', () => ({
    getState: () => state,
    findEquip: (id) => state.equipamentos.find((eq) => eq.id === id),
    findSetor: (id) => state.setores.find((setor) => setor.id === id) || null,
    regsForEquip: (id) => state.registros.filter((r) => r.equipId === id),
  }));
  vi.doMock('../core/plans/monetization.js', () => ({
    fetchMyProfileBilling: vi.fn(async () => ({ profile: { plan: planCode } })),
  }));
  vi.doMock('../core/plans/subscriptionPlans.js', async () => {
    const actual = await vi.importActual('../core/plans/subscriptionPlans.js');
    return {
      ...actual,
      getEffectivePlan: vi.fn(() => planCode),
      hasProAccess: vi.fn(() => hasPro),
    };
  });
  vi.doMock('../domain/alerts.js', () => ({
    Alerts: { getAll: () => alerts, countPreventivas7Dias: () => 0 },
  }));
  vi.doMock('../core/auth.js', () => ({
    Auth: { getUser: vi.fn(async () => ({ id: 'u1', email: 'user@acme.com', user_metadata: {} })) },
  }));
  vi.doMock('../ui/components/skeleton.js', () => ({
    withSkeleton: async (_el, _opts, fn) => fn(),
  }));
  vi.doMock('../ui/components/onboarding.js', () => ({
    OnboardingBanner: { render: vi.fn() },
    Profile: { get: () => ({ nome: 'Ana' }) },
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
  vi.doMock('../core/storage.js', () => ({
    Storage: { getSyncStatus: () => ({ state: 'idle', pendingOps: 0 }) },
  }));
  return import('../ui/views/dashboard.js');
}

describe('dashboard premium split', () => {
  beforeEach(() => {
    document.body.innerHTML = buildDom();
    localStorage.clear();
  });

  it('modo técnico não mostra cards empresariais e mantém CTA secundário de equipamento', async () => {
    localStorage.setItem('cooltrack_nav_mode', 'rapido');
    const state = {
      equipamentos: [],
      registros: [],
      clientes: [],
      setores: [],
      tecnicos: [],
      orcamentos: [],
    };
    const { renderDashboard } = await setupModule({
      planCode: 'free',
      hasPro: false,
      state,
      alerts: [],
    });

    await renderDashboard();
    await flushAsyncRender();

    expect(document.getElementById('dash-hero-greeting')?.textContent).toContain('Olá, Ana');
    expect(document.getElementById('dash-hero-cta-label')?.textContent).toContain(
      'Registrar serviço',
    );
    expect(document.getElementById('dash-hero-cta-secondary-label')?.textContent).toContain(
      'Cadastrar equipamento',
    );
    expect(document.getElementById('dash-pro-ops-row')?.hidden).toBe(true);
  });

  it('modo empresa/pro mostra leitura empresarial e contexto cliente/setor', async () => {
    localStorage.setItem('cooltrack_nav_mode', 'empresa');
    const state = {
      equipamentos: [
        {
          id: 'eq1',
          nome: 'RoofTop 01',
          clienteId: 'c1',
          setorId: 's1',
          status: 'ok',
          criticidade: 'media',
          prioridadeOperacional: 'baixa',
          tipo: 'VRF',
        },
      ],
      registros: [
        { id: 'r1', equipId: 'eq1', data: new Date().toISOString(), tipo: 'Preventiva', obs: '' },
      ],
      clientes: [{ id: 'c1', nome: 'Cliente Alpha' }],
      setores: [{ id: 's1', nome: 'Produção' }],
      tecnicos: [],
      orcamentos: [],
    };
    const alerts = [
      {
        kind: 'overdue',
        severity: 'danger',
        title: 'Preventiva vencida',
        subtitle: 'em atraso',
        eq: state.equipamentos[0],
      },
    ];
    const { renderDashboard } = await setupModule({ planCode: 'pro', hasPro: true, state, alerts });

    await renderDashboard();
    await flushAsyncRender();

    expect(document.getElementById('dash-hero-greeting')?.textContent).toContain(
      'Operação em andamento',
    );
    expect(document.getElementById('dash-hero-cta-secondary-label')?.textContent).toContain(
      'Ver clientes',
    );
    expect(document.getElementById('dash-pro-ops-row')?.hidden).toBe(false);
    expect(document.getElementById('dash-next-sub')?.textContent).toContain('Cliente Alpha');
    expect(document.getElementById('dash-next-sub')?.textContent).toContain('Produção');
  });

  it('prioriza próxima melhor ação na ordem definida', async () => {
    const state = {
      equipamentos: [{ id: 'eq1' }],
      registros: [{ id: 'r1', equipId: 'eq1', data: '2026-04-01' }],
      clientes: [],
      setores: [],
      tecnicos: [],
      orcamentos: [],
    };
    const { selectNextBestAction } = await setupModule({
      planCode: 'pro',
      hasPro: true,
      state,
      alerts: [],
    });

    const withOverdue = selectNextBestAction({
      alerts: [
        { kind: 'upcoming', title: 'Preventiva próxima' },
        { kind: 'overdue', title: 'Preventiva vencida' },
      ],
      equipamentos: state.equipamentos,
      registros: state.registros,
    });
    const withLastService = selectNextBestAction({
      alerts: [],
      equipamentos: state.equipamentos,
      registros: state.registros,
    });

    expect(withOverdue.priority).toBe(3);
    expect(withOverdue.kind).toBe('overdue');
    expect(withLastService.kind).toBe('last-service');
  });
});
