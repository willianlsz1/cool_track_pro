import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';
import {
  DASHBOARD_PUBLIC_CLASSES,
  DASHBOARD_PUBLIC_IDS,
} from '../ui/viewModels/dashboardContracts.js';
import { Charts } from '../ui/components/charts.js';

const chartInstances = vi.hoisted(() => []);
const mockState = vi.hoisted(() => ({
  current: {
    equipamentos: [],
    registros: [],
  },
}));

vi.mock('chart.js/auto', () => ({
  default: vi.fn(function MockChart(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.destroy = vi.fn();
    chartInstances.push(this);
  }),
}));

vi.mock('../core/state.js', () => ({
  getState: vi.fn(() => mockState.current),
}));

function resetDashboardShell() {
  document.body.innerHTML = `<main>${renderShellViews()}</main>`;
  document.getElementById('view-inicio')?.classList.add('active');
}

function assertNoUnsafeHtml(root) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('img')).toBeNull();
  expect(root.querySelector('[onerror]')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect(root.innerHTML).not.toMatch(/javascript:/i);
}

function chartConfigsByCanvasId() {
  return Object.fromEntries(chartInstances.map((chart) => [chart.canvas?.id, chart.config]));
}

describe('dashboard legacy charts contracts', () => {
  beforeEach(() => {
    chartInstances.length = 0;
    mockState.current = { equipamentos: [], registros: [] };
    document.documentElement.removeAttribute('data-theme');
    resetDashboardShell();
  });

  it('preserva containers/canvas legados dos charts sem exigir ilhas React', () => {
    const analysis = document.querySelector('.dash__analise');

    expect(analysis).not.toBeNull();
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.chartStatusPie)?.tagName).toBe('CANVAS');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.chartTrendLine)?.tagName).toBe('CANVAS');
    expect(document.getElementById(DASHBOARD_PUBLIC_IDS.chartTiposDoughnut)?.tagName).toBe(
      'CANVAS',
    );
    expect(document.getElementById('chart-types-bar')).toBeNull();
    expect(analysis?.querySelectorAll('.dash__accordion-item')).toHaveLength(3);
    expect(DASHBOARD_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'dash__analise',
        'dash__accordion',
        'dash__accordion-item',
        'dash__accordion-summary',
        'dash__accordion-title',
        'dash__accordion-chev',
        'dash__accordion-body',
      ]),
    );
    expect(analysis?.querySelector('[data-react-dashboard-hero-mounted]')).toBeNull();
    expect(analysis?.querySelector('[data-react-dashboard-onboarding-mounted]')).toBeNull();
  });

  it('mantem refresh legado seguro no estado sem dados', () => {
    Charts.refreshAll();

    const byCanvasId = chartConfigsByCanvasId();
    expect(Object.keys(byCanvasId)).toEqual(['chart-trend-line']);
    expect(byCanvasId['chart-trend-line'].type).toBe('line');
    assertNoUnsafeHtml(document.body);
  });

  it('renderiza status, tendencia e tipos usando os ids publicos atuais', () => {
    const malicious = 'Preventiva <img src=x onerror=alert(1)><script>alert(2)</script>';
    mockState.current = {
      equipamentos: [
        { id: 'eq-ok', nome: malicious, status: 'ok' },
        { id: 'eq-warn', nome: 'Evaporadora', status: 'warn' },
        { id: 'eq-danger', nome: 'Condensadora', status: 'danger' },
      ],
      registros: [
        { id: 'reg-1', equipId: 'eq-ok', data: '2026-05-01', tipo: malicious },
        { id: 'reg-2', equipId: 'eq-warn', data: '2026-04-20', tipo: 'Corretiva' },
      ],
    };

    Charts.refreshAll();

    const byCanvasId = chartConfigsByCanvasId();
    expect(byCanvasId['chart-status-pie'].type).toBe('doughnut');
    expect(byCanvasId['chart-trend-line'].type).toBe('line');
    expect(byCanvasId['chart-tipos-doughnut'].type).toBe('bar');
    expect(byCanvasId['chart-tipos-doughnut'].data.labels.join(' ')).toContain('Preventiva');
    assertNoUnsafeHtml(document.body);
  });

  it('mantem charts como fluxo legado isolado de React/createRoot', () => {
    const chartsSource = readFileSync('src/ui/components/charts.js', 'utf8');
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');
    const helperSource = readFileSync('src/ui/views/dashboard/chartsRefresh.js', 'utf8');

    expect(chartsSource).not.toMatch(
      /from ['"]react|react-dom|createRoot|dangerouslySetInnerHTML/i,
    );
    expect(helperSource).not.toMatch(
      /from ['"]react|react-dom|createRoot|dangerouslySetInnerHTML/i,
    );
    expect(dashboardSource).toMatch(/createDashboardChartsRefresher/);
    expect(dashboardSource).toMatch(/import\('\.\.\/components\/charts\.js'\)/);
    expect(helperSource).toMatch(/Charts\.refreshAll\(\)/);
    expect(dashboardSource).not.toMatch(/import\s+\{\s*createRoot\s*\}/);
  });
});
