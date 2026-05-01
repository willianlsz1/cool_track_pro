import { DASHBOARD_PUBLIC_IDS } from '../../viewModels/dashboardContracts.js';

export const DASHBOARD_CHART_CANVAS_IDS = Object.freeze([
  DASHBOARD_PUBLIC_IDS.chartStatusPie,
  DASHBOARD_PUBLIC_IDS.chartTrendLine,
  DASHBOARD_PUBLIC_IDS.chartTiposDoughnut,
]);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function defaultGetCanvas(id) {
  if (typeof document === 'undefined') return null;
  return document.getElementById(id);
}

function frame(callback) {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(callback);
    return;
  }
  queueMicrotask(callback);
}

function defaultSchedule(callback) {
  frame(() => frame(callback));
}

function defaultLoadCharts() {
  return import('../../components/charts.js').then((module) => module.Charts);
}

function hasRequiredCanvases(getCanvas) {
  return DASHBOARD_CHART_CANVAS_IDS.every((id) => Boolean(getCanvas(id)));
}

export function buildDashboardChartsHash({ equipamentos = [], registros = [] } = {}) {
  const safeEquipamentos = asArray(equipamentos);
  const safeRegistros = asArray(registros);
  return `${safeEquipamentos.length}:${safeRegistros.length}:${safeEquipamentos
    .map((equipamento) => equipamento?.status || '')
    .join('')}`;
}

export function createDashboardChartsRefresher({
  getCanvas = defaultGetCanvas,
  loadCharts = defaultLoadCharts,
  schedule = defaultSchedule,
  onError = () => {},
} = {}) {
  let lastHash = null;

  return async function refreshDashboardCharts({
    isActive = true,
    equipamentos = [],
    registros = [],
  } = {}) {
    if (!isActive) return { refreshed: false, reason: 'inactive' };
    if (!hasRequiredCanvases(getCanvas)) return { refreshed: false, reason: 'missing-canvas' };

    const hash = buildDashboardChartsHash({ equipamentos, registros });
    if (hash === lastHash) return { refreshed: false, reason: 'unchanged' };

    let Charts;
    try {
      Charts = await loadCharts();
    } catch (error) {
      onError(error);
      return { refreshed: false, reason: 'load-error', error };
    }

    if (typeof Charts?.refreshAll !== 'function') {
      return { refreshed: false, reason: 'missing-refresh' };
    }

    return new Promise((resolve) => {
      const run = () => {
        try {
          Charts.refreshAll();
          lastHash = hash;
          resolve({ refreshed: true, reason: 'refreshed' });
        } catch (error) {
          onError(error);
          resolve({ refreshed: false, reason: 'refresh-error', error });
        }
      };

      try {
        schedule(run);
      } catch (error) {
        onError(error);
        resolve({ refreshed: false, reason: 'schedule-error', error });
      }
    });
  };
}
