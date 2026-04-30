import { act } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountDashboardNextActionReact,
  unmountDashboardNextActionReact,
} from '../react/entrypoints/dashboardNextActionIsland.jsx';
import { buildDashboardViewModel } from '../ui/viewModels/dashboardViewModel.js';
import { DASHBOARD_PUBLIC_IDS } from '../ui/viewModels/dashboardContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createNextAction(overrides = {}) {
  const viewModel = buildDashboardViewModel({
    equipamentos: [],
    registros: [],
    alerts: [],
    now: new Date('2026-04-15T12:00:00.000Z'),
  });

  return {
    ...viewModel.nextAction,
    ...overrides,
    cta: {
      ...viewModel.nextAction.cta,
      ...overrides.cta,
    },
  };
}

function createCriticalNextAction() {
  const equipamento = { id: 'eq-critical', nome: 'Split 01', status: 'danger' };
  const viewModel = buildDashboardViewModel({
    equipamentos: [equipamento],
    registros: [],
    alerts: [
      {
        kind: 'critical',
        severity: 'danger',
        title: 'Falha critica',
        subtitle: 'Compressor parado',
        eq: equipamento,
      },
    ],
    now: new Date('2026-04-15T12:00:00.000Z'),
  });

  return viewModel.nextAction;
}

function setRoot() {
  document.body.innerHTML = `
    <article class="dash__card dash__card--next-action" id="${DASHBOARD_PUBLIC_IDS.nextActionCard}" data-tone="ok"></article>
  `;
  return document.getElementById(DASHBOARD_PUBLIC_IDS.nextActionCard);
}

describe('dashboard next action React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts in the next action container preserving ids, classes, data-tone and empty state', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardNextActionReact(root, { nextAction: createNextAction() });
    });

    expect(root?.dataset.reactDashboardNextActionMounted).toBe('true');
    expect(root?.id).toBe(DASHBOARD_PUBLIC_IDS.nextActionCard);
    expect(root?.classList.contains('dash__card')).toBe(true);
    expect(root?.classList.contains('dash__card--next-action')).toBe(true);
    expect(root?.dataset.tone).toBe('ok');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.nextActionTitle}`)?.textContent).toBe(
      'Cadastre seu primeiro equipamento',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.nextActionSubtitle}`)?.textContent).toBe(
      'Sem pend\u00eancias imediatas no momento.',
    );

    const cta = root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.nextActionCta}`);
    expect(cta?.classList.contains('dash__card-cta')).toBe(true);
    expect(cta?.dataset.nav).toBe('historico');
    expect(cta?.hasAttribute('data-action')).toBe(false);
    expect(cta?.hasAttribute('data-id')).toBe(false);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.nextActionCtaLabel}`)?.textContent).toBe(
      'Ver hist\u00f3rico',
    );
  });

  it('updates an existing root without duplicate React roots or duplicate renders', async () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountDashboardNextActionReact(root, { nextAction: createNextAction() });
      mountDashboardNextActionReact(root, { nextAction: createCriticalNextAction() });
    });

    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.nextActionTitle}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.nextActionCta}`)).toHaveLength(1);
    expect(root?.dataset.tone).toBe('danger');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.nextActionTitle}`)?.textContent).toBe(
      'Falha critica',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.nextActionCta}`)?.dataset.action).toBe(
      'go-register-equip',
    );
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('unmounts safely and tolerates repeated calls', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardNextActionReact(root, { nextAction: createCriticalNextAction() });
      unmountDashboardNextActionReact(root);
      unmountDashboardNextActionReact(root);
    });

    expect(root?.dataset.reactDashboardNextActionMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('renders actionable state preserving data-action and data-id', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardNextActionReact(root, { nextAction: createCriticalNextAction() });
    });

    const cta = root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.nextActionCta}`);
    expect(root?.dataset.tone).toBe('danger');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.nextActionTitle}`)?.textContent).toBe(
      'Falha critica',
    );
    expect(
      root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.nextActionSubtitle}`)?.textContent,
    ).toContain('Split 01');
    expect(cta?.dataset.action).toBe('go-register-equip');
    expect(cta?.dataset.id).toBe('eq-critical');
    expect(cta?.hasAttribute('data-nav')).toBe(false);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.nextActionCtaLabel}`)?.textContent).toBe(
      'Resolver agora',
    );
  });

  it('escapes next action text and does not use unsafe React HTML APIs', async () => {
    const root = setRoot();
    const malicious = '"><img src=x onerror=alert(1)><script>alert(2)</script>';

    await act(async () => {
      mountDashboardNextActionReact(root, {
        nextAction: createNextAction({
          title: malicious,
          subtitle: malicious,
          cta: {
            action: 'go-register-equip',
            id: 'eq-xss"><img src=x onerror=alert(1)>',
            label: malicious,
          },
        }),
      });
    });

    expect(root?.textContent).toContain(malicious);
    expect(root?.querySelector('script')).toBeNull();
    expect(root?.querySelector('img')).toBeNull();
    expect(root?.querySelector('[onerror]')).toBeNull();
    expect(root?.innerHTML.toLowerCase()).not.toContain('<script');

    const componentSource = readFileSync('src/react/pages/DashboardNextAction.jsx', 'utf8');
    expect(componentSource).not.toMatch(/dangerouslySetInnerHTML|innerHTML|document\.|window\./);
  });

  it('does not require charts, onboarding, header or createRoot in dashboard adapter', () => {
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');

    expect(document.getElementById('chart-status-pie')).toBeNull();
    expect(document.getElementById('dash-onboarding')).toBeNull();
    expect(document.getElementById('app-header')).toBeNull();
    expect(dashboardSource).not.toMatch(/react-dom\/client|createRoot/);
  });
});
