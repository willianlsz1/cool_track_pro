import { getState } from '../../core/state.js';

function clampPercent(value, total) {
  if (!total || !Number.isFinite(total)) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

function countReportsThisMonth(registros = []) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return registros.filter((registro) => {
    const date = new Date(registro?.data);
    return !Number.isNaN(date.getTime()) && date >= start && date < end;
  }).length;
}

function getReportBarColor() {
  return 'var(--primary)';
}

function getUsageState(equipmentCount, reportsThisMonth) {
  return {
    equipmentPercent: clampPercent(equipmentCount, Number.POSITIVE_INFINITY),
    reportPercent: clampPercent(reportsThisMonth, Number.POSITIVE_INFINITY),
    equipmentOverLimit: false,
    reportOverLimit: false,
    hasFiniteReportLimit: false,
    hasOverLimit: false,
    hasNearLimit: false,
  };
}

function normalizePlanCode() {
  return 'free';
}

function renderOperationalMeter(equipmentCount, reportsThisMonth) {
  return `
    <section class="usage-meter" aria-label="Uso operacional">
      <style>
        .usage-meter {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          margin: 10px 0 14px;
          display: grid;
          gap: 10px;
        }

        .usage-meter__row {
          display: grid;
          gap: 6px;
        }

        .usage-meter__label {
          font-size: 12px;
          color: var(--text-3);
        }

        .usage-meter__value {
          color: var(--text);
          font-weight: 600;
        }
      </style>

      <div class="usage-meter__row">
        <div class="usage-meter__label">Equipamentos cadastrados: <span class="usage-meter__value">${equipmentCount}</span></div>
      </div>

      <div class="usage-meter__row">
        <div class="usage-meter__label">Relatorios este mes: <span class="usage-meter__value">${reportsThisMonth}</span></div>
      </div>
    </section>
  `;
}

export const UsageMeter = {
  render() {
    const { equipamentos, registros } = getState();
    return renderOperationalMeter(equipamentos.length, countReportsThisMonth(registros));
  },
};

export const UsageMeterInternal = {
  clampPercent,
  countReportsThisMonth,
  getReportBarColor,
  getUsageState,
  normalizePlanCode,
};
