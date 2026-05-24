import { act } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountDashboardProDraftReact,
  unmountDashboardProDraftReact,
} from '../react/entrypoints/dashboardProDraftIsland.jsx';
import { DASHBOARD_ACTIONS, DASHBOARD_PUBLIC_IDS } from '../ui/viewModels/dashboardContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setRoots() {
  document.body.innerHTML = `
    <div id="${DASHBOARD_PUBLIC_IDS.onboarding}">
      <div id="${DASHBOARD_PUBLIC_IDS.proDraftRoot}" style="display: contents;"></div>
    </div>
    <section class="dash__pair" id="${DASHBOARD_PUBLIC_IDS.proOpsRow}" hidden></section>
  `;

  return {
    root: document.getElementById(DASHBOARD_PUBLIC_IDS.proOpsRow),
    draftRoot: document.getElementById(DASHBOARD_PUBLIC_IDS.proDraftRoot),
  };
}

function emptyModel(overrides = {}) {
  return {
    tier: 'free',
    proCards: {
      visible: false,
      upgradeCta: null,
      critical: {
        label: 'Alertas criticos',
        title: 'Tudo sob controle',
        subtitle: 'Sem alertas criticos agora.',
        actions: [],
      },
      riskClients: {
        label: 'Clientes em risco',
        title: 'Clientes em dia',
        subtitle: 'Nenhum cliente exige atencao agora.',
        actions: [],
      },
    },
    draft: null,
    ...overrides,
  };
}

function filledModel(overrides = {}) {
  const malicious = overrides.malicious || 'Split <img src=x onerror=alert(1)>';
  return emptyModel({
    tier: 'pro',
    proCards: {
      visible: true,
      upgradeCta: null,
      critical: {
        label: 'Alertas criticos',
        title: 'Alertas criticos',
        subtitle: '1 itens exigem acao',
        actions: [
          {
            label: `${malicious} - Resolver`,
            action: DASHBOARD_ACTIONS.goRegisterEquip,
            id: 'eq-1',
          },
        ],
      },
      riskClients: {
        label: 'Clientes em risco',
        title: 'Clientes em risco',
        subtitle: '1 clientes exigem atencao',
        actions: [
          {
            label: `${malicious} - Ver cliente`,
            nav: 'clientes',
          },
        ],
      },
    },
    draft: {
      visible: true,
      id: 'reg-1',
      isEdit: true,
      equipmentName: malicious,
      nav: 'registro',
    },
    ...overrides,
  });
}

function assertNoUnsafeHtml(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('img')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.innerHTML).not.toMatch(/\s(?:href|src)=["']?javascript:/i);
}

describe('dashboard Pro cards and draft React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts in #dash-pro-ops-row and preserves hidden Free/Plus contracts', async () => {
    const { root, draftRoot } = setRoots();

    await act(async () => {
      mountDashboardProDraftReact(root, {
        proDraft: emptyModel({ tier: 'plus' }),
        draftRoot,
      });
    });

    expect(root?.dataset.reactDashboardProDraftMounted).toBe('true');
    expect(root?.hidden).toBe(true);
    expect(root?.getAttribute('data-tier')).toBe('plus');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.criticalAlertsCard}`)).not.toBeNull();
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.riskClientsCard}`)).not.toBeNull();
    expect(root?.querySelector(['[data-nav="', 'pric', 'ing', '"]'].join(''))).toBeNull();
    expect(draftRoot?.querySelector('.dash__continue-card')).toBeNull();
  });

  it('updates an existing root without duplicate React roots', async () => {
    const { root, draftRoot } = setRoots();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountDashboardProDraftReact(root, { proDraft: emptyModel(), draftRoot });
      mountDashboardProDraftReact(root, { proDraft: filledModel(), draftRoot });
    });

    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.criticalAlertsCard}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.riskClientsCard}`)).toHaveLength(1);
    expect(draftRoot?.querySelectorAll('.dash__continue-card')).toHaveLength(1);
    expect(root?.hidden).toBe(false);
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('unmounts safely and tolerates repeated calls', async () => {
    const { root, draftRoot } = setRoots();

    await act(async () => {
      mountDashboardProDraftReact(root, { proDraft: filledModel(), draftRoot });
      unmountDashboardProDraftReact(root);
      unmountDashboardProDraftReact(root);
    });

    expect(root?.dataset.reactDashboardProDraftMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
    expect(draftRoot?.innerHTML).toBe('');
  });

  it('renders Pro cards and draft preserving actions, navigation and public classes', async () => {
    const { root, draftRoot } = setRoots();

    await act(async () => {
      mountDashboardProDraftReact(root, { proDraft: filledModel(), draftRoot });
    });

    const criticalAction = root?.querySelector(
      `#${DASHBOARD_PUBLIC_IDS.criticalAlertsList} button`,
    );
    const clientAction = root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.riskClientsList} button`);
    const draftCard = draftRoot?.querySelector('.dash__continue-card');
    const continueCta = draftCard?.querySelector('.dash__continue-card__cta');
    const discardCta = draftCard?.querySelector('.dash__continue-card__close');

    expect(root?.classList.contains('dash__pair')).toBe(true);
    expect(root?.querySelectorAll('.dash__card')).toHaveLength(2);
    expect(criticalAction?.classList.contains('dash__card-cta')).toBe(true);
    expect(criticalAction?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.goRegisterEquip);
    expect(criticalAction?.getAttribute('data-id')).toBe('eq-1');
    expect(clientAction?.getAttribute('data-nav')).toBe('clientes');
    expect(draftCard?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.continueDraft);
    expect(draftCard?.getAttribute('data-id')).toBe('reg-1');
    expect(continueCta?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.continueDraft);
    expect(continueCta?.getAttribute('data-id')).toBe('reg-1');
    expect(discardCta?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.discardDraft);
    expect(draftCard?.querySelector('[data-nav="registro"]')).not.toBeNull();
  });

  it('escapes dynamic text and does not depend on charts, onboarding, header or commercial flow', async () => {
    const { root, draftRoot } = setRoots();
    const malicious =
      '"><script>alert(1)</script><img src=x onerror=alert(2)> onclick="alert(3)" javascript:alert(4)';

    await act(async () => {
      mountDashboardProDraftReact(root, {
        proDraft: filledModel({ malicious }),
        draftRoot,
      });
    });

    expect(root?.textContent).toContain(malicious);
    expect(draftRoot?.textContent).toContain(malicious);
    assertNoUnsafeHtml(root);
    assertNoUnsafeHtml(draftRoot);

    const componentSource = readFileSync('src/react/pages/DashboardProDraft.jsx', 'utf8');
    const islandSource = readFileSync('src/react/entrypoints/dashboardProDraftIsland.jsx', 'utf8');
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');
    expect(componentSource).not.toMatch(/dangerouslySetInnerHTML|innerHTML|document\.|window\./);
    expect(islandSource).not.toMatch(
      new RegExp([['check', 'out'].join(''), 'Chart', 'Onboarding', 'Header'].join('|')),
    );
    expect(dashboardSource).toContain('../../react/entrypoints/dashboardProDraftIsland.jsx');
    expect(dashboardSource).not.toMatch(/react-dom\/client|createRoot/);
  });
});
