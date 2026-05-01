import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

import {
  DASHBOARD_CHART_CANVAS_IDS,
  buildDashboardChartsHash,
  createDashboardChartsRefresher,
} from '../ui/views/dashboard/chartsRefresh.js';

function createCanvasLookup(missingId = '') {
  return (id) => (id === missingId ? null : { id, nodeName: 'CANVAS' });
}

function immediateSchedule(callback) {
  callback();
}

describe('dashboard charts refresh helper', () => {
  it('chama Charts.refreshAll via import dinamico quando dados e canvases existem', async () => {
    const refreshAll = vi.fn();
    const loadCharts = vi.fn(async () => ({ refreshAll }));
    const refreshCharts = createDashboardChartsRefresher({
      getCanvas: createCanvasLookup(),
      loadCharts,
      schedule: immediateSchedule,
    });

    const result = await refreshCharts({
      isActive: true,
      equipamentos: [
        { id: 'eq-1', status: 'ok' },
        { id: 'eq-2', status: 'danger' },
      ],
      registros: [{ id: 'reg-1' }],
    });

    expect(result).toMatchObject({ refreshed: true, reason: 'refreshed' });
    expect(loadCharts).toHaveBeenCalledTimes(1);
    expect(refreshAll).toHaveBeenCalledTimes(1);
  });

  it('falha de forma segura quando modulo, refreshAll ou canvases nao existem', async () => {
    const loadFailure = vi.fn(async () => {
      throw new Error('chunk unavailable');
    });
    const onError = vi.fn();

    await expect(
      createDashboardChartsRefresher({
        getCanvas: createCanvasLookup(),
        loadCharts: loadFailure,
        schedule: immediateSchedule,
        onError,
      })({ isActive: true, equipamentos: [{ status: 'ok' }], registros: [] }),
    ).resolves.toMatchObject({ refreshed: false, reason: 'load-error' });
    expect(onError).toHaveBeenCalledTimes(1);

    await expect(
      createDashboardChartsRefresher({
        getCanvas: createCanvasLookup(),
        loadCharts: async () => ({}),
        schedule: immediateSchedule,
      })({ isActive: true, equipamentos: [{ status: 'ok' }], registros: [] }),
    ).resolves.toMatchObject({ refreshed: false, reason: 'missing-refresh' });

    await expect(
      createDashboardChartsRefresher({
        getCanvas: createCanvasLookup(DASHBOARD_CHART_CANVAS_IDS[0]),
        loadCharts: async () => ({ refreshAll: vi.fn() }),
        schedule: immediateSchedule,
      })({ isActive: true, equipamentos: [{ status: 'ok' }], registros: [] }),
    ).resolves.toMatchObject({ refreshed: false, reason: 'missing-canvas' });
  });

  it('deduplica por hash de dados e preserva o seletor atual do chart de tipos', async () => {
    const refreshAll = vi.fn();
    const refreshCharts = createDashboardChartsRefresher({
      getCanvas: createCanvasLookup(),
      loadCharts: async () => ({ refreshAll }),
      schedule: immediateSchedule,
    });
    const payload = {
      isActive: true,
      equipamentos: [{ status: 'ok' }],
      registros: [{ id: 'reg-1' }],
    };

    expect(buildDashboardChartsHash(payload)).toBe('1:1:ok');
    expect(DASHBOARD_CHART_CANVAS_IDS).toEqual([
      'chart-status-pie',
      'chart-trend-line',
      'chart-tipos-doughnut',
    ]);

    await refreshCharts(payload);
    await refreshCharts(payload);

    expect(refreshAll).toHaveBeenCalledTimes(1);
  });

  it('mantem o helper fora de React e sem o seletor obsoleto', () => {
    const helperSource = readFileSync('src/ui/views/dashboard/chartsRefresh.js', 'utf8');

    expect(helperSource).not.toMatch(
      /from ['"]react|react-dom|createRoot|dangerouslySetInnerHTML/i,
    );
    expect(helperSource).not.toMatch(/chart-types-bar/);
    expect(helperSource).toMatch(/Charts\.refreshAll\(\)/);
  });
});
