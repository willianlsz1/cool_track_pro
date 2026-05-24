import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellHeader } from '../ui/shell/templates/header.js';
import {
  HEADER_ACTIONS,
  HEADER_DATA_ATTRIBUTES,
  HEADER_NAV_TARGETS,
  HEADER_PUBLIC_CLASSES,
  HEADER_PUBLIC_IDS,
} from '../ui/shell/headerContracts.js';

function mountHeader() {
  document.body.innerHTML = renderShellHeader();
}

function assertNoUnsafeHtml(root) {
  expect(root.querySelector('script')).toBeNull();
  const images = Array.from(root.querySelectorAll('img'));
  images.forEach((img) => {
    expect(img.getAttribute('src')).toBe('/brand/favicon.svg');
    expect(img.classList.contains('app-logo__mark')).toBe(true);
  });
  expect(root.querySelector('[onerror]')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect(root.innerHTML).not.toMatch(/javascript:/i);
}

function expectAction(action) {
  expect(document.querySelector(`[data-action="${action}"]`)).not.toBeNull();
}

async function setupDashboardHeaderModule({
  profileName = 'Tecnico',
  userMetadata = {},
  email = 'tecnico@example.com',
  syncStatus = { state: 'idle', pendingOps: 0 },
  preventivas7dCount = 0,
} = {}) {
  vi.resetModules();

  const state = {
    equipamentos: [
      { id: 'eq-1', nome: 'Split', status: 'ok' },
      { id: 'eq-2', nome: 'Cassete', status: 'danger' },
    ],
    registros: [{ id: 'reg-1', equipId: 'eq-1', data: new Date().toISOString() }],
    clientes: [],
    setores: [],
  };

  vi.doMock('../core/state.js', () => ({
    getState: vi.fn(() => state),
    findEquip: vi.fn((id) => state.equipamentos.find((equipamento) => equipamento.id === id)),
    findSetor: vi.fn(() => null),
    regsForEquip: vi.fn((id) => state.registros.filter((registro) => registro.equipId === id)),
  }));

  vi.doMock('../core/storage.js', () => ({
    Storage: {
      getSyncStatus: vi.fn(() => syncStatus),
    },
  }));

  vi.doMock('../core/auth.js', () => ({
    Auth: {
      getUser: vi.fn(async () => ({
        id: 'user-1',
        email,
        user_metadata: userMetadata,
      })),
    },
  }));

  vi.doMock('../domain/alerts.js', () => ({
    Alerts: {
      getAll: vi.fn(() => [{ id: 'alert-1' }]),
      countPreventivas7Dias: vi.fn(() => preventivas7dCount),
    },
  }));

  vi.doMock('../core/plans/operationalPlan.js', () => ({
    fetchOperationalProfile: vi.fn(async () => ({ profile: { plan: 'pro' } })),
    fetchOperationalProfileCached: vi.fn(async () => ({ profile: { plan: 'pro' } })),
    getCachedOperationalProfileSnapshot: vi.fn(() => ({ profile: { plan: 'pro' } })),
  }));

  vi.doMock('../core/plans/subscriptionPlans.js', () => ({
    PLAN_CODE_FREE: 'free',
    PLAN_CODE_PLUS: 'plus',
    PLAN_CODE_PRO: 'pro',
    normalizePlanCode: vi.fn((planCode) => {
      if (planCode === 'plus' || planCode === 'pro') return planCode;
      return 'free';
    }),
    getEffectivePlan: vi.fn(() => 'pro'),
    hasProAccess: vi.fn(() => true),
  }));

  vi.doMock('../ui/shell/navigationMode.js', () => ({
    NAV_MODE_EMPRESA: 'empresa',
    getNavigationMode: vi.fn(() => 'empresa'),
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

  vi.doMock('../ui/components/skeleton.js', () => ({
    withSkeleton: (_el, _options, renderFn) => renderFn(),
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
  vi.doMock('../react/entrypoints/dashboardLastServiceIsland.jsx', () => ({
    mountDashboardLastServiceReact: vi.fn(),
    unmountDashboardLastServiceReact: vi.fn(),
  }));
  vi.doMock('../react/entrypoints/dashboardMonthSummaryIsland.jsx', () => ({
    mountDashboardMonthSummaryReact: vi.fn(),
    unmountDashboardMonthSummaryReact: vi.fn(),
  }));
  vi.doMock('../react/entrypoints/dashboardReadOnlyBlocksIsland.jsx', () => ({
    mountDashboardReadOnlyBlocksReact: vi.fn(),
    unmountDashboardReadOnlyBlocksReact: vi.fn(),
  }));
  vi.doMock('../react/entrypoints/dashboardProDraftIsland.jsx', () => ({
    mountDashboardProDraftReact: vi.fn(),
    unmountDashboardProDraftReact: vi.fn(),
  }));
  vi.doMock('../react/entrypoints/dashboardOnboardingIsland.jsx', () => ({
    mountDashboardOnboardingReact: vi.fn(),
    unmountDashboardOnboardingReact: vi.fn(),
  }));

  return import('../ui/views/dashboard.js');
}

describe('global header legacy contracts', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    [
      '../core/state.js',
      '../core/storage.js',
      '../core/auth.js',
      '../domain/alerts.js',
      '../core/plans/operationalPlan.js',
      '../core/plans/subscriptionPlans.js',
      '../ui/shell/navigationMode.js',
      '../ui/components/onboarding.js',
      '../ui/components/onboarding/onboardingChecklist.js',
      '../ui/components/installAppPrompt.js',
      '../ui/components/skeleton.js',
      '../ui/components/upgradeNudge.js',
      '../ui/components/overflowBanner.js',
    ].forEach((modulePath) => vi.doUnmock(modulePath));
    document.body.innerHTML = '';
    localStorage.clear();
    sessionStorage.clear();
  });

  it('preserva shell padrao, ids, classes e acoes publicas do header global', () => {
    mountHeader();

    const header = document.getElementById(HEADER_PUBLIC_IDS.root);
    expect(header).not.toBeNull();
    expect(header?.classList.contains('app-header')).toBe(true);
    expect(header?.dataset.tier).toBe('free');

    Object.values(HEADER_PUBLIC_IDS).forEach((id) => {
      expect(document.getElementById(id), id).not.toBeNull();
    });
    expect(HEADER_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'app-header',
        'app-logo',
        'app-header__actions',
        'header-sync',
        'header-icon-btn',
        'header-alert-btn',
        'header-help-menu',
        'header-avatar',
        'header-stats-bar',
        'status-indicator',
      ]),
    );
    expect(HEADER_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-action', 'data-nav', 'data-tier', 'data-plan']),
    );

    [
      HEADER_ACTIONS.goAlertas,
      HEADER_ACTIONS.goOrcamentos,
      HEADER_ACTIONS.openPmocModal,
      HEADER_ACTIONS.openPmocInfo,
      HEADER_ACTIONS.openProfile,
      HEADER_ACTIONS.helpOpenTutorial,
      HEADER_ACTIONS.helpScoreInfo,
      HEADER_ACTIONS.helpSupport,
      HEADER_ACTIONS.helpFeedback,
    ].forEach(expectAction);

    expect(document.querySelector(`[data-nav="${HEADER_NAV_TARGETS.registro}"]`)).not.toBeNull();
    expect(document.querySelector(`[data-nav="${HEADER_NAV_TARGETS.clientes}"]`)).not.toBeNull();
    expect(document.querySelector('#header-help-btn[data-nav="configuracoes"]')).not.toBeNull();

    const helpMenu = document.getElementById(HEADER_PUBLIC_IDS.helpMenu);
    expect(helpMenu?.hasAttribute('hidden')).toBe(true);
    expect(helpMenu?.getAttribute('aria-hidden')).toBe('true');
    expect(helpMenu?.hasAttribute('inert')).toBe(true);
    expect(helpMenu?.dataset.plan).toBe('free');
    assertNoUnsafeHtml(header);
  });

  it('mantem indicadores de plano e sync como contratos legados sem executar navegacao', async () => {
    mountHeader();
    const { updateHeader } = await setupDashboardHeaderModule({
      preventivas7dCount: 2,
      syncStatus: {
        state: 'pending',
        pendingOps: 2,
        errorKind: 'offline',
        message: '<img src=x onerror=alert(1)>javascript:alert(1)',
      },
    });

    updateHeader();

    const header = document.getElementById(HEADER_PUBLIC_IDS.root);
    const sync = document.getElementById(HEADER_PUBLIC_IDS.syncStatus);
    const syncText = document.getElementById(HEADER_PUBLIC_IDS.syncStatusText);
    const alertPill = document.getElementById(HEADER_PUBLIC_IDS.alertPill);
    const alertTooltip = document.getElementById(HEADER_PUBLIC_IDS.alertTooltip);

    expect(sync?.hidden).toBe(false);
    expect(sync?.classList.contains('status-indicator--warn')).toBe(true);
    expect(syncText?.textContent).toContain('(2)');
    expect(alertPill?.hidden).toBe(false);
    expect(alertPill?.textContent).toBe('2');
    expect(alertTooltip?.textContent).toContain('2');
    expect(document.getElementById(HEADER_PUBLIC_IDS.helpAlertBadge)?.textContent).toBe('2');
    expect(document.getElementById(HEADER_PUBLIC_IDS.helpButton)?.dataset.hasAlerts).toBe('1');
    expect(document.getElementById(HEADER_PUBLIC_IDS.statsTotal)?.textContent).toBe('1/2');
    expect(document.getElementById(HEADER_PUBLIC_IDS.statsAlert)?.textContent).toBe('1');
    assertNoUnsafeHtml(header);
  });

  it('renderiza identidade autenticada/plano sem HTML injection e sem depender de React no header', async () => {
    document.body.innerHTML = `<div id="app"></div>`;
    const { initAppShell } = await import('../ui/shell.js');
    initAppShell();
    document.getElementById('view-inicio')?.classList.add('active');

    const malicious = '<img src=x onerror=alert(1)> <script>alert(2)</script>';
    const { renderDashboard } = await setupDashboardHeaderModule({
      profileName: malicious,
      userMetadata: { name: '<b>metadata</b>' },
    });

    await renderDashboard();

    const header = document.getElementById(HEADER_PUBLIC_IDS.root);
    const avatar = document.getElementById(HEADER_PUBLIC_IDS.avatar);
    const initials = document.getElementById(HEADER_PUBLIC_IDS.avatarInitials);
    const logoPill = document.getElementById(HEADER_PUBLIC_IDS.logoPill);

    expect(header?.dataset.tier).toBe('pro');
    expect(avatar?.dataset.tier).toBe('pro');
    expect(logoPill?.hidden).toBe(false);
    expect(logoPill?.dataset.tier).toBe('pro');
    expect(initials?.textContent).toBe('IS');
    expect(header?.querySelector('[data-react-root], [data-reactroot]')).toBeNull();
    assertNoUnsafeHtml(header);
  });

  it('documenta que o header segue legado e fora de createRoot', () => {
    const headerSource = readFileSync('src/ui/shell/templates/header.js', 'utf8');
    const contractsSource = readFileSync('src/ui/shell/headerContracts.js', 'utf8');

    expect(headerSource).not.toMatch(
      /from ['"]react|react-dom|createRoot|dangerouslySetInnerHTML/i,
    );
    expect(contractsSource).not.toMatch(
      /from ['"]react|react-dom|createRoot|dangerouslySetInnerHTML/i,
    );
    expect(headerSource).toContain(`id="${HEADER_PUBLIC_IDS.root}"`);
    expect(headerSource).toContain(`id="${HEADER_PUBLIC_IDS.helpMenu}"`);
    expect(headerSource).toContain(`id="${HEADER_PUBLIC_IDS.helpButton}"`);
    expect(headerSource).toContain(`data-nav="configuracoes"`);
    expect(headerSource).toContain(`aria-label="Configurações e ajuda"`);
    expect(headerSource).toContain(`title="Configurações e ajuda"`);
    expect(headerSource).toContain(`id="${HEADER_PUBLIC_IDS.helpMenu}"`);
    expect(headerSource).toContain(`aria-hidden="true"`);
    expect(headerSource).toContain(`inert`);
    expect(headerSource).toContain(`data-nav="${HEADER_NAV_TARGETS.registro}"`);
  });
});
