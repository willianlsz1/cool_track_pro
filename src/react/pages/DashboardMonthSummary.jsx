import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';

const EMPTY_MONTH = Object.freeze({
  label: 'Seu m\u00eas em campo',
  servicesCount: 0,
  equipmentsCount: 0,
  pendingCount: 0,
  trendLabel: 'Sem dados anteriores',
});

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function MonthKpi({ label, valueId, value, subId }) {
  return (
    <article className="dash__kpi">
      <div className="dash__kpi-label">{label}</div>
      {subId ? (
        <div className="dash__kpi-sub" id={subId}>
          {value}
        </div>
      ) : (
        <div className="dash__kpi-value" id={valueId}>
          {value}
        </div>
      )}
    </article>
  );
}

export function DashboardMonthSummary({ month = EMPTY_MONTH }) {
  const model = month || EMPTY_MONTH;

  return (
    <>
      <header className="dash__section-header">
        <span className="dash__section-label" id={DASHBOARD_PUBLIC_IDS.monthLabel}>
          {text(model.label, EMPTY_MONTH.label)}
        </span>
      </header>
      <div className="dash__kpi-grid">
        <MonthKpi
          label="Servi\u00e7os no m\u00eas"
          valueId={DASHBOARD_PUBLIC_IDS.monthServices}
          value={text(model.servicesCount, '0')}
        />
        <MonthKpi
          label="Equipamentos atendidos"
          valueId={DASHBOARD_PUBLIC_IDS.monthEquipments}
          value={text(model.equipmentsCount, '0')}
        />
        <MonthKpi
          label="Pend\u00eancias"
          valueId={DASHBOARD_PUBLIC_IDS.monthPending}
          value={text(model.pendingCount, '0')}
        />
        <MonthKpi
          label="Varia\u00e7\u00e3o"
          subId={DASHBOARD_PUBLIC_IDS.monthTrend}
          value={text(model.trendLabel, EMPTY_MONTH.trendLabel)}
        />
      </div>
    </>
  );
}
