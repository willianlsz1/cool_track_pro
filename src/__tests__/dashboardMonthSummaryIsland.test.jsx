import { act } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountDashboardMonthSummaryReact,
  unmountDashboardMonthSummaryReact,
} from '../react/entrypoints/dashboardMonthSummaryIsland.jsx';
import { buildDashboardViewModel } from '../ui/viewModels/dashboardViewModel.js';
import { DASHBOARD_PUBLIC_IDS } from '../ui/viewModels/dashboardContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createMonth(overrides = {}) {
  const viewModel = buildDashboardViewModel({
    equipamentos: [],
    registros: [],
    alerts: [],
    now: new Date('2026-04-15T12:00:00.000Z'),
  });

  return {
    ...viewModel.month,
    ...overrides,
  };
}

function createFilledMonth() {
  const viewModel = buildDashboardViewModel({
    equipamentos: [
      { id: 'eq-1', nome: 'Split 01', status: 'ok' },
      { id: 'eq-2', nome: 'Chiller', status: 'ok' },
    ],
    registros: [
      { id: 'reg-1', equipId: 'eq-1', data: '2026-04-02T12:00:00.000Z' },
      { id: 'reg-2', equipId: 'eq-2', data: '2026-04-10T12:00:00.000Z' },
      { id: 'reg-prev', equipId: 'eq-1', data: '2026-03-10T12:00:00.000Z' },
    ],
    alerts: [
      { kind: 'critical', severity: 'danger', title: 'Falha critica' },
      { kind: 'info', severity: 'info', title: 'Aviso' },
    ],
    planContext: { planCode: 'pro', hasPro: true },
    navigationMode: 'empresa',
    now: new Date('2026-04-15T12:00:00.000Z'),
  });

  return viewModel.month;
}

function setRoot() {
  document.body.innerHTML = `
    <section class="dash__section" id="${DASHBOARD_PUBLIC_IDS.monthSection}"></section>
  `;
  return document.getElementById(DASHBOARD_PUBLIC_IDS.monthSection);
}

describe('dashboard month summary React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts in the month container preserving ids, classes and empty state', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardMonthSummaryReact(root, { month: createMonth() });
    });

    expect(root?.dataset.reactDashboardMonthSummaryMounted).toBe('true');
    expect(root?.id).toBe(DASHBOARD_PUBLIC_IDS.monthSection);
    expect(root?.classList.contains('dash__section')).toBe(true);
    expect(root?.querySelector('.dash__section-header')).not.toBeNull();
    expect(root?.querySelector('.dash__section-label')).not.toBeNull();
    expect(root?.querySelector('.dash__kpi-grid')).not.toBeNull();
    expect(root?.querySelectorAll('.dash__kpi')).toHaveLength(4);
    expect(root?.querySelectorAll('.dash__kpi-label')).toHaveLength(4);
    expect(root?.querySelectorAll('.dash__kpi-value')).toHaveLength(3);
    expect(root?.querySelectorAll('.dash__kpi-sub')).toHaveLength(1);

    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.monthLabel}`)?.textContent).toBe(
      'Seu m\u00eas em campo',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.monthServices}`)?.textContent).toBe('0');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.monthEquipments}`)?.textContent).toBe('0');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.monthPending}`)?.textContent).toBe('0');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.monthTrend}`)?.textContent).toBe(
      'Sem dados anteriores',
    );
  });

  it('updates an existing root without duplicate React roots or duplicate renders', async () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountDashboardMonthSummaryReact(root, { month: createMonth() });
      mountDashboardMonthSummaryReact(root, { month: createFilledMonth() });
    });

    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.monthLabel}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.monthServices}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.monthEquipments}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.monthPending}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.monthTrend}`)).toHaveLength(1);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.monthLabel}`)?.textContent).toBe(
      'Vis\u00e3o da opera\u00e7\u00e3o',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.monthServices}`)?.textContent).toBe('2');
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('unmounts safely and tolerates repeated calls', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardMonthSummaryReact(root, { month: createFilledMonth() });
      unmountDashboardMonthSummaryReact(root);
      unmountDashboardMonthSummaryReact(root);
    });

    expect(root?.dataset.reactDashboardMonthSummaryMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('renders filled month state preserving values and public contracts', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardMonthSummaryReact(root, { month: createFilledMonth() });
    });

    expect(root?.classList.contains('dash__section')).toBe(true);
    expect(root?.querySelector('.dash__kpi-grid')).not.toBeNull();
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.monthLabel}`)?.textContent).toBe(
      'Vis\u00e3o da opera\u00e7\u00e3o',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.monthServices}`)?.textContent).toBe('2');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.monthEquipments}`)?.textContent).toBe('2');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.monthPending}`)?.textContent).toBe('1');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.monthTrend}`)?.textContent).toBe(
      '+1 vs m\u00eas passado',
    );
    expect(root?.querySelector('[data-action],[data-id],[data-nav]')).toBeNull();
  });

  it('escapes month summary text and does not use unsafe React HTML APIs', async () => {
    const root = setRoot();
    const malicious = '"><img src=x onerror=alert(1)><script>alert(2)</script>';

    await act(async () => {
      mountDashboardMonthSummaryReact(root, {
        month: createMonth({
          label: malicious,
          servicesCount: malicious,
          equipmentsCount: malicious,
          pendingCount: malicious,
          trendLabel: malicious,
        }),
      });
    });

    expect(root?.textContent).toContain(malicious);
    expect(root?.querySelector('script')).toBeNull();
    expect(root?.querySelector('img')).toBeNull();
    expect(root?.querySelector('[onerror]')).toBeNull();
    expect(root?.innerHTML.toLowerCase()).not.toContain('<script');

    const componentSource = readFileSync('src/react/pages/DashboardMonthSummary.jsx', 'utf8');
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
