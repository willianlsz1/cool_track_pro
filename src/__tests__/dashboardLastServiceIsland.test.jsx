import { act } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountDashboardLastServiceReact,
  unmountDashboardLastServiceReact,
} from '../react/entrypoints/dashboardLastServiceIsland.jsx';
import { buildDashboardViewModel } from '../ui/viewModels/dashboardViewModel.js';
import { DASHBOARD_PUBLIC_IDS } from '../ui/viewModels/dashboardContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createLastService(overrides = {}) {
  const viewModel = buildDashboardViewModel({
    equipamentos: [],
    registros: [],
    alerts: [],
    now: new Date('2026-04-15T12:00:00.000Z'),
  });

  return {
    ...viewModel.lastService,
    ...overrides,
  };
}

function createFilledLastService() {
  const viewModel = buildDashboardViewModel({
    equipamentos: [
      {
        id: 'eq-last',
        nome: 'Split 01',
        clienteId: 'cli-1',
        setorId: 'setor-1',
        status: 'ok',
      },
    ],
    clientes: [{ id: 'cli-1', nome: 'Cliente Alpha' }],
    setores: [{ id: 'setor-1', nome: 'Produ\u00e7\u00e3o' }],
    registros: [
      {
        id: 'reg-old',
        equipId: 'eq-last',
        tipo: 'Corretiva',
        data: '2026-04-01T12:00:00.000Z',
      },
      {
        id: 'reg-last',
        equipId: 'eq-last',
        tipo: 'Preventiva',
        data: '2026-04-15T12:00:00.000Z',
      },
    ],
    planContext: { planCode: 'pro', hasPro: true },
    navigationMode: 'empresa',
    now: new Date('2026-04-15T12:00:00.000Z'),
  });

  return viewModel.lastService;
}

function setRoot() {
  document.body.innerHTML = `
    <article class="dash__card dash__card--last-service" id="${DASHBOARD_PUBLIC_IDS.lastServiceCard}" hidden></article>
  `;
  return document.getElementById(DASHBOARD_PUBLIC_IDS.lastServiceCard);
}

describe('dashboard last service React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts in the last service container preserving ids, classes and empty state', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardLastServiceReact(root, { lastService: createLastService() });
    });

    expect(root?.dataset.reactDashboardLastServiceMounted).toBe('true');
    expect(root?.hidden).toBe(true);
    expect(root?.id).toBe(DASHBOARD_PUBLIC_IDS.lastServiceCard);
    expect(root?.classList.contains('dash__card')).toBe(true);
    expect(root?.classList.contains('dash__card--last-service')).toBe(true);
    expect(root?.querySelector('.dash__card-label')?.textContent).toBe('\u00daltimo servi\u00e7o');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.lastServiceTitle}`)?.textContent).toBe(
      '\u2014',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.lastServiceSubtitle}`)?.textContent).toBe(
      '\u2014',
    );
    expect(root?.querySelector('#dash-last-desc')?.textContent).toBe('');
  });

  it('updates an existing root without duplicate React roots or duplicate renders', async () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountDashboardLastServiceReact(root, { lastService: createLastService() });
      mountDashboardLastServiceReact(root, { lastService: createFilledLastService() });
    });

    expect(root?.hidden).toBe(false);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.lastServiceTitle}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.lastServiceSubtitle}`)).toHaveLength(1);
    expect(root?.querySelectorAll('#dash-last-desc')).toHaveLength(1);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.lastServiceTitle}`)?.textContent).toBe(
      'Preventiva \u2022 Split 01',
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
      mountDashboardLastServiceReact(root, { lastService: createFilledLastService() });
      unmountDashboardLastServiceReact(root);
      unmountDashboardLastServiceReact(root);
    });

    expect(root?.dataset.reactDashboardLastServiceMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('renders filled state preserving last service title, subtitle and description contract', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardLastServiceReact(root, { lastService: createFilledLastService() });
    });

    expect(root?.hidden).toBe(false);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.lastServiceTitle}`)?.textContent).toBe(
      'Preventiva \u2022 Split 01',
    );
    expect(
      root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.lastServiceSubtitle}`)?.textContent,
    ).toContain('Cliente Alpha');
    expect(
      root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.lastServiceSubtitle}`)?.textContent,
    ).toContain('Produ\u00e7\u00e3o');
    expect(root?.querySelector('#dash-last-desc')).not.toBeNull();
    expect(root?.querySelector('.dash__card-cta')).toBeNull();
    expect(root?.querySelector('[data-action],[data-id],[data-nav]')).toBeNull();
  });

  it('escapes last service text and does not use unsafe React HTML APIs', async () => {
    const root = setRoot();
    const malicious = '"><img src=x onerror=alert(1)><script>alert(2)</script>';

    await act(async () => {
      mountDashboardLastServiceReact(root, {
        lastService: createLastService({
          hidden: false,
          title: malicious,
          subtitle: malicious,
          description: malicious,
        }),
      });
    });

    expect(root?.textContent).toContain(malicious);
    expect(root?.querySelector('script')).toBeNull();
    expect(root?.querySelector('img')).toBeNull();
    expect(root?.querySelector('[onerror]')).toBeNull();
    expect(root?.innerHTML.toLowerCase()).not.toContain('<script');

    const componentSource = readFileSync('src/react/pages/DashboardLastService.jsx', 'utf8');
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
