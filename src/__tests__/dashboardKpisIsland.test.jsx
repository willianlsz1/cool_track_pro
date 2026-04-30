import { act } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountDashboardKpisReact,
  unmountDashboardKpisReact,
} from '../react/entrypoints/dashboardKpisIsland.jsx';
import { buildDashboardViewModel } from '../ui/viewModels/dashboardViewModel.js';
import { DASHBOARD_PUBLIC_IDS } from '../ui/viewModels/dashboardContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createKpis(overrides = {}) {
  const viewModel = buildDashboardViewModel({
    equipamentos: [],
    registros: [],
    alerts: [],
    now: new Date('2026-04-15T12:00:00.000Z'),
  });

  return {
    ...viewModel.kpis,
    ...overrides,
  };
}

function createFilledKpis() {
  const viewModel = buildDashboardViewModel({
    equipamentos: [
      { id: 'eq-ok', status: 'ok' },
      { id: 'eq-danger', status: 'danger' },
    ],
    registros: [
      { id: 'reg-1', equipId: 'eq-ok', data: '2026-04-02T12:00:00.000Z' },
      { id: 'reg-2', equipId: 'eq-danger', data: '2026-04-10T12:00:00.000Z' },
      { id: 'reg-3', equipId: 'eq-ok', data: '2026-03-10T12:00:00.000Z' },
    ],
    alerts: [{ kind: 'critical', severity: 'danger', title: 'Falha critica' }],
    now: new Date('2026-04-15T12:00:00.000Z'),
    getHealthScore: (equipamento) => (equipamento?.id === 'eq-danger' ? 50 : 90),
    getHealthClass: (score) => {
      if (score >= 80) return 'ok';
      if (score >= 55) return 'warn';
      return 'danger';
    },
  });

  return viewModel.kpis;
}

function setRoot() {
  document.body.innerHTML = `
    <section id="${DASHBOARD_PUBLIC_IDS.kpiRoot}" class="dash__kpi-grid" aria-label="Indicadores principais"></section>
  `;
  return document.getElementById(DASHBOARD_PUBLIC_IDS.kpiRoot);
}

describe('dashboard KPIs React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts in the KPI container preserving ids, classes and empty state', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardKpisReact(root, { kpis: createKpis() });
    });

    expect(root?.dataset.reactDashboardKpisMounted).toBe('true');
    expect(root?.classList.contains('dash__kpi-grid')).toBe(true);
    expect(root?.querySelectorAll('.dash__kpi')).toHaveLength(4);
    expect(root?.querySelectorAll('.dash__kpi-label')).toHaveLength(4);
    expect(root?.querySelectorAll('.dash__kpi-value')).toHaveLength(4);
    expect(root?.querySelectorAll('.dash__kpi-sub')).toHaveLength(4);

    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiAtivos}`)?.textContent).toBe('\u2014');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiAtivosSub}`)?.textContent).toBe(
      'sem cadastro',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiAtivosSub}`)?.dataset.tone).toBe('ok');

    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiEficiencia}`)?.textContent).toBe(
      '\u2014',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiEficiencia}`)?.dataset.tone).toBe(
      'muted',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiEficienciaSub}`)?.textContent).toBe(
      'sem dados',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiEficienciaSub}`)?.dataset.tone).toBe(
      'muted',
    );

    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiAnomalias}`)?.textContent).toBe('0');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiAnomalias}`)?.dataset.tone).toBe('ok');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiAnomaliasSub}`)?.textContent).toBe(
      'sem alerta',
    );

    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiMes}`)?.textContent).toBe('0');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiMesSub}`)?.textContent).toBe(
      'Sem dados anteriores',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiMesSub}`)?.dataset.tone).toBe('muted');
  });

  it('updates an existing root without duplicate React roots or duplicate renders', async () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountDashboardKpisReact(root, { kpis: createKpis() });
      mountDashboardKpisReact(root, { kpis: createFilledKpis() });
    });

    expect(root?.querySelectorAll('.dash__kpi')).toHaveLength(4);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiAtivos}`)?.textContent).toBe('1/2');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiEficiencia}`)?.textContent).toBe('70%');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiAnomalias}`)?.textContent).toBe('1');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiMes}`)?.textContent).toBe('2');
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('unmounts safely and tolerates repeated calls', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardKpisReact(root, { kpis: createFilledKpis() });
      unmountDashboardKpisReact(root);
      unmountDashboardKpisReact(root);
    });

    expect(root?.dataset.reactDashboardKpisMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('renders filled KPI state with preserved data-tone and spark containers', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardKpisReact(root, { kpis: createFilledKpis() });
    });

    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiAtivosSub}`)?.dataset.tone).toBe(
      'danger',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiEficiencia}`)?.dataset.tone).toBe(
      'warn',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiEficienciaSub}`)?.dataset.tone).toBe(
      'warn',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiAnomalias}`)?.dataset.tone).toBe(
      'danger',
    );
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiMesSub}`)?.dataset.tone).toBe('ok');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiEficienciaSpark} svg`)).not.toBeNull();
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.kpiMesSpark} svg`)).not.toBeNull();
  });

  it('escapes KPI labels and does not use unsafe React HTML APIs', async () => {
    const root = setRoot();
    const malicious = '"><img src=x onerror=alert(1)><script>alert(2)</script>';

    await act(async () => {
      mountDashboardKpisReact(root, {
        kpis: createKpis({
          ativos: {
            active: 0,
            total: 0,
            faults: 0,
            valueLabel: malicious,
            subLabel: malicious,
            tone: 'ok',
          },
        }),
      });
    });

    expect(root?.textContent).toContain(malicious);
    expect(root?.querySelector('script')).toBeNull();
    expect(root?.querySelector('img')).toBeNull();
    expect(root?.querySelector('[onerror]')).toBeNull();
    expect(root?.innerHTML.toLowerCase()).not.toContain('<script');

    const componentSource = readFileSync('src/react/pages/DashboardKpis.jsx', 'utf8');
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
