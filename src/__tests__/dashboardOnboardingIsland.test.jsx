import { readFileSync } from 'node:fs';

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DASHBOARD_ACTIONS,
  DASHBOARD_DATA_ATTRIBUTES,
  DASHBOARD_PUBLIC_CLASSES,
  DASHBOARD_PUBLIC_IDS,
} from '../ui/viewModels/dashboardContracts.js';
import {
  mountDashboardOnboardingReact,
  unmountDashboardOnboardingReact,
} from '../react/entrypoints/dashboardOnboardingIsland.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function buildDom() {
  document.body.innerHTML = `
    <section id="dash" data-tier="free">
      <div id="dash-empty" class="dash__empty" hidden></div>
      <div id="dash-onboarding">
        <div id="dash-pro-draft-root" style="display: contents;"></div>
      </div>
      <div id="dash-overflow-banner"></div>
    </section>
  `;

  return {
    empty: document.getElementById(DASHBOARD_PUBLIC_IDS.empty),
    onboarding: document.getElementById(DASHBOARD_PUBLIC_IDS.onboarding),
    overflow: document.getElementById(DASHBOARD_PUBLIC_IDS.overflowBanner),
  };
}

function step(overrides = {}) {
  return {
    id: 'equipamento',
    label: 'Cadastre seu primeiro equipamento',
    sub: 'A foto da etiqueta preenche os dados',
    nav: 'equipamentos',
    completed: false,
    ...overrides,
  };
}

function islandModel(overrides = {}) {
  return {
    tier: 'free',
    empty: {
      visible: false,
      state: {
        icon: '-',
        title: 'Nenhum equipamento cadastrado',
        description: 'Cadastre um equipamento para liberar o painel.',
        cta: {
          label: 'Cadastrar equipamento',
          action: DASHBOARD_ACTIONS.openModal,
          id: 'modal-add-eq',
        },
      },
    },
    installPrompt: { state: 'hidden' },
    checklist: {
      visible: false,
      completed: 0,
      total: 3,
      percent: 0,
      steps: [],
    },
    overflow: {
      visible: false,
      state: { overLimit: false },
    },
    ...overrides,
  };
}

function mount(root, props) {
  act(() => {
    mountDashboardOnboardingReact(root.onboarding, {
      onboarding: props,
      emptyRoot: root.empty,
      overflowRoot: root.overflow,
    });
  });
}

function assertNoInjectedHtml(root) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('img')).toBeNull();
  expect(root.querySelector('[onerror]')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect(root.querySelector('[href^="javascript:"]')).toBeNull();
}

describe('Dashboard onboarding/empty/overflow React island', () => {
  let roots;

  beforeEach(() => {
    roots = buildDom();
  });

  afterEach(() => {
    act(() => {
      unmountDashboardOnboardingReact(roots?.onboarding);
    });
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts empty state and onboarding checklist while preserving public contracts', () => {
    mount(
      roots,
      islandModel({
        empty: {
          visible: true,
          state: {
            icon: '+',
            title: 'Comece cadastrando um equipamento',
            description: 'O dashboard aparece depois do primeiro cadastro.',
            cta: {
              label: 'Cadastrar equipamento',
              action: DASHBOARD_ACTIONS.openModal,
              id: 'modal-add-eq',
            },
          },
        },
        checklist: {
          visible: true,
          completed: 1,
          total: 3,
          percent: 33,
          steps: [
            step({ id: 'equipamento', completed: true }),
            step({ id: 'servico', label: 'Registre seu primeiro servico', nav: 'registro' }),
            step({ id: 'relatorio', label: 'Abra o relatorio', nav: 'relatorio' }),
          ],
        },
      }),
    );

    const emptyCta = roots.empty.querySelector('.empty-state__cta .btn');
    const close = roots.onboarding.querySelector('.onb-card__close');

    expect(roots.onboarding.dataset.reactDashboardOnboardingMounted).toBe('true');
    expect(roots.onboarding.getAttribute('data-tier')).toBe('free');
    expect(roots.empty.hidden).toBe(false);
    expect(roots.empty.classList.contains('dash__empty')).toBe(true);
    expect(roots.empty.querySelector('.empty-state')).not.toBeNull();
    expect(emptyCta?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.openModal);
    expect(emptyCta?.getAttribute('data-id')).toBe('modal-add-eq');

    expect(roots.onboarding.querySelector('.onb-card')).not.toBeNull();
    expect(close?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.onboardingDismiss);
    expect(roots.onboarding.querySelector('.onb-step.is-done')).not.toBeNull();
    expect(roots.onboarding.querySelector('.onb-step[data-nav="registro"]')).not.toBeNull();
    expect(roots.onboarding.querySelector('.onb-step[data-nav="relatorio"]')).not.toBeNull();
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.proDraftRoot)).not.toBeNull();
  });

  it('updates through repeated mounts without duplicate roots or duplicate cards', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const model = islandModel({
      checklist: {
        visible: true,
        completed: 0,
        total: 1,
        percent: 0,
        steps: [step({ nav: 'equipamentos' })],
      },
      overflow: {
        visible: true,
        state: {
          overLimit: true,
          limitType: 'equipamentos',
          equipCount: 4,
          equipLimit: 3,
          reportCount: 0,
          reportLimit: Number.POSITIVE_INFINITY,
        },
      },
    });

    mount(roots, model);
    mount(roots, model);

    expect(roots.onboarding.querySelectorAll('.onb-card')).toHaveLength(1);
    expect(roots.overflow.querySelectorAll('.dash-overflow-banner')).toHaveLength(1);
    expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(/createRoot/i);
  });

  it('unmounts safely and clears portal roots', () => {
    mount(
      roots,
      islandModel({
        empty: {
          visible: true,
          state: {
            title: 'Sem dados',
            description: 'Sem equipamentos.',
          },
        },
        overflow: {
          visible: true,
          state: {
            overLimit: true,
            limitType: 'both',
            equipCount: 4,
            equipLimit: 3,
            reportCount: 20,
            reportLimit: 10,
          },
        },
      }),
    );

    act(() => {
      unmountDashboardOnboardingReact(roots.onboarding);
      unmountDashboardOnboardingReact(roots.onboarding);
    });

    expect(roots.onboarding.dataset.reactDashboardOnboardingMounted).toBeUndefined();
    expect(roots.onboarding.getAttribute('data-tier')).toBeNull();
    expect(roots.empty.hidden).toBe(true);
    expect(roots.empty.innerHTML).toBe('');
    expect(roots.overflow.innerHTML).toBe('');
  });

  it('renders install and overflow contracts as DOM only', () => {
    mount(
      roots,
      islandModel({
        installPrompt: { state: 'available' },
        overflow: {
          visible: true,
          state: {
            overLimit: true,
            limitType: 'registros',
            equipCount: 1,
            equipLimit: 3,
            reportCount: 12,
            reportLimit: 10,
          },
        },
      }),
    );

    const install = roots.onboarding.querySelector('.install-card');
    const overflow = roots.overflow.querySelector('.dash-overflow-banner');
    const overflowCta = roots.overflow.querySelector('.dash-overflow-banner__cta');

    expect(install).not.toBeNull();
    expect(install?.querySelector('[data-action="install-app-prompt"]')).not.toBeNull();
    expect(install?.querySelector('[data-action="install-app-dismiss"]')).not.toBeNull();
    expect(overflow?.getAttribute('role')).toBe('status');
    expect(overflow?.getAttribute('data-limit-type')).toBe('registros');
    expect(overflowCta?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.openUpgrade);
    expect(overflowCta?.getAttribute('data-upgrade-source')).toBe('overflow_banner');
    expect(overflowCta?.getAttribute('data-highlight-plan')).toBe('plus');
  });

  it('escapes dynamic text and keeps malicious data attributes inert', () => {
    const malicious = '<img src=x onerror=alert(1)><script>alert(2)</script>';

    mount(
      roots,
      islandModel({
        empty: {
          visible: true,
          state: {
            icon: malicious,
            title: malicious,
            description: malicious,
            cta: {
              label: malicious,
              action: DASHBOARD_ACTIONS.openModal,
              id: 'modal-add-eq',
              nav: 'javascript:alert(1)',
            },
          },
        },
        checklist: {
          visible: true,
          completed: 0,
          total: 1,
          percent: 0,
          steps: [step({ label: malicious, sub: malicious, nav: 'javascript:alert(2)' })],
        },
      }),
    );

    expect(roots.empty.textContent).toContain(malicious);
    expect(roots.onboarding.textContent).toContain(malicious);
    expect(roots.empty.querySelector('.empty-state__cta .btn')?.getAttribute('data-nav')).toBe(
      'javascript:alert(1)',
    );
    expect(roots.onboarding.querySelector('.onb-step')?.getAttribute('data-nav')).toBe(
      'javascript:alert(2)',
    );
    assertNoInjectedHtml(roots.empty);
    assertNoInjectedHtml(roots.onboarding);
  });

  it('keeps island scope pure and dashboard adapter away from createRoot', () => {
    const componentSource = readFileSync('src/react/pages/DashboardOnboarding.jsx', 'utf8');
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');

    expect(DASHBOARD_PUBLIC_IDS).toMatchObject({
      empty: 'dash-empty',
      onboarding: 'dash-onboarding',
      overflowBanner: 'dash-overflow-banner',
    });
    expect(DASHBOARD_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'dash__empty',
        'empty-state',
        'empty-state__cta',
        'onb-card',
        'onb-card__close',
        'onb-step',
        'dash-overflow-banner',
        'dash-overflow-banner__cta',
      ]),
    );
    expect(DASHBOARD_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining([
        'data-action',
        'data-id',
        'data-nav',
        'data-tier',
        'data-upgrade-source',
        'data-highlight-plan',
        'data-limit-type',
      ]),
    );
    expect(componentSource).not.toMatch(/dangerouslySetInnerHTML|\.innerHTML|document\.|window\./);
    expect(componentSource).not.toMatch(/localStorage|sessionStorage|Chart|Header/);
    expect(dashboardSource).toContain('dashboardOnboardingIsland.jsx');
    expect(dashboardSource).not.toMatch(/react-dom\/client|createRoot/);
  });
});
