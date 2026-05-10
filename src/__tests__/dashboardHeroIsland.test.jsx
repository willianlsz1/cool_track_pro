import { act } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountDashboardHeroReact,
  unmountDashboardHeroReact,
} from '../react/entrypoints/dashboardHeroIsland.jsx';
import { buildDashboardViewModel } from '../ui/viewModels/dashboardViewModel.js';
import { DASHBOARD_PUBLIC_IDS } from '../ui/viewModels/dashboardContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createHero(overrides = {}) {
  const viewModel = buildDashboardViewModel({
    equipamentos: [],
    registros: [],
    clientes: [],
    setores: [],
    alerts: [],
    planContext: { planCode: 'free', hasPro: false },
    navigationMode: 'rapido',
    userName: 'Ana',
    now: new Date('2026-04-15T12:00:00.000Z'),
  });

  return {
    ...viewModel.hero,
    ...overrides,
    primaryCta: {
      ...viewModel.hero.primaryCta,
      ...overrides.primaryCta,
    },
    secondaryCta: {
      ...viewModel.hero.secondaryCta,
      ...overrides.secondaryCta,
    },
  };
}

function createCompanyHero() {
  const viewModel = buildDashboardViewModel({
    equipamentos: [{ id: 'eq-1', nome: 'Split 01', clienteId: 'cli-1', setorId: 'set-1' }],
    registros: [{ id: 'reg-1', equipId: 'eq-1', data: '2026-04-10T12:00:00.000Z' }],
    clientes: [{ id: 'cli-1', nome: 'Cliente A' }],
    setores: [{ id: 'set-1', nome: 'Sala tecnica' }],
    alerts: [],
    planContext: { planCode: 'pro', hasPro: true },
    navigationMode: 'empresa',
    userName: 'Ana',
    now: new Date('2026-04-15T12:00:00.000Z'),
  });

  return viewModel.hero;
}

function setRoot() {
  document.body.innerHTML = `
    <article class="dash__hero dash__hero--quick" id="${DASHBOARD_PUBLIC_IDS.hero}" data-tone="ok"></article>
  `;
  return document.getElementById(DASHBOARD_PUBLIC_IDS.hero);
}

describe('dashboard hero React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts in the hero container preserving ids, classes, data-tier, data-tone and empty state', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardHeroReact(root, { hero: createHero() });
    });

    expect(root?.dataset.reactDashboardHeroMounted).toBe('true');
    expect(root?.id).toBe(DASHBOARD_PUBLIC_IDS.hero);
    expect(root?.classList.contains('dash__hero')).toBe(true);
    expect(root?.classList.contains('dash__hero--quick')).toBe(true);
    expect(root?.dataset.tier).toBe('free');
    expect(root?.dataset.tone).toBe('ok');
    expect(root?.querySelector('.dash__hero-body')).not.toBeNull();
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroGreeting}`)?.textContent).toBe(
      'Ol\u00e1, Ana',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroSummary}`)?.textContent).toBe(
      '0 equipamentos \u2022 0 servi\u00e7os no m\u00eas',
    );

    const cta = root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroCta}`);
    const secondaryCta = root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroSecondaryCta}`);
    expect(cta?.classList.contains('dash__hero-cta')).toBe(true);
    expect(cta?.dataset.action).toBe('start-service-registration');
    expect(cta?.hasAttribute('data-nav')).toBe(false);
    expect(cta?.hasAttribute('data-id')).toBe(false);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroCtaLabel}`)?.textContent).toBe(
      'Registrar servi\u00e7o',
    );
    expect(secondaryCta?.classList.contains('dash__hero-cta--secondary')).toBe(true);
    expect(secondaryCta?.dataset.action).toBe('open-modal');
    expect(secondaryCta?.dataset.id).toBe('modal-add-eq');
    expect(secondaryCta?.hasAttribute('data-nav')).toBe(false);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroSecondaryCtaLabel}`)?.textContent).toBe(
      'Cadastrar equipamento',
    );
  });

  it('updates an existing root without duplicate React roots or duplicate renders', async () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountDashboardHeroReact(root, { hero: createHero() });
      mountDashboardHeroReact(root, { hero: createCompanyHero() });
    });

    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.heroGreeting}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.heroSummary}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.heroCta}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.heroSecondaryCta}`)).toHaveLength(1);
    expect(root?.dataset.tier).toBe('pro');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroGreeting}`)?.textContent).toBe(
      'Opera\u00e7\u00e3o em andamento',
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
      mountDashboardHeroReact(root, { hero: createHero() });
      unmountDashboardHeroReact(root);
      unmountDashboardHeroReact(root);
    });

    expect(root?.dataset.reactDashboardHeroMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('renders company mode preserving secondary navigation CTA', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardHeroReact(root, { hero: createCompanyHero() });
    });

    const cta = root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroCta}`);
    const secondaryCta = root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroSecondaryCta}`);
    expect(root?.dataset.tier).toBe('pro');
    expect(root?.dataset.tone).toBe('ok');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroGreeting}`)?.textContent).toBe(
      'Opera\u00e7\u00e3o em andamento',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroSummary}`)?.textContent).toBe(
      '1 clientes \u2022 1 equipamentos \u2022 1 servi\u00e7os no m\u00eas',
    );
    expect(cta?.dataset.action).toBe('start-service-registration');
    expect(cta?.hasAttribute('data-nav')).toBe(false);
    expect(secondaryCta?.dataset.nav).toBe('clientes');
    expect(secondaryCta?.hasAttribute('data-action')).toBe(false);
    expect(secondaryCta?.hasAttribute('data-id')).toBe(false);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroSecondaryCtaLabel}`)?.textContent).toBe(
      'Ver clientes',
    );
  });

  it('escapes hero text and does not use unsafe React HTML APIs', async () => {
    const root = setRoot();
    const malicious = '"><img src=x onerror=alert(1)><script>alert(2)</script>';

    await act(async () => {
      mountDashboardHeroReact(root, {
        hero: createHero({
          greeting: malicious,
          summary: malicious,
          primaryCta: {
            action: 'start-service-registration',
            label: malicious,
          },
          secondaryCta: {
            action: 'open-modal',
            id: 'modal-add-eq',
            label: malicious,
          },
        }),
      });
    });

    expect(root?.textContent).toContain(malicious);
    expect(root?.querySelector('script')).toBeNull();
    expect(root?.querySelector('img')).toBeNull();
    expect(root?.querySelector('[onerror]')).toBeNull();
    expect(root?.querySelector('[onclick]')).toBeNull();
    expect(root?.innerHTML.toLowerCase()).not.toContain('<script');

    const componentSource = readFileSync('src/react/pages/DashboardHero.jsx', 'utf8');
    expect(componentSource).not.toMatch(/dangerouslySetInnerHTML|innerHTML|document\.|window\./);
  });

  it('does not require charts, onboarding, header or createRoot in dashboard adapter', () => {
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');

    expect(document.getElementById('chart-status-pie')).toBeNull();
    expect(document.getElementById('dash-onboarding')).toBeNull();
    expect(document.getElementById('app-header')).toBeNull();
    expect(dashboardSource).toContain('../../react/entrypoints/dashboardHeroIsland.jsx');
    expect(dashboardSource).not.toMatch(/react-dom\/client|createRoot/);
  });
});
