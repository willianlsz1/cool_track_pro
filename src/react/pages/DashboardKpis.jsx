import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';

const KPI_LABELS = Object.freeze({
  ativos: 'Ativos',
  eficiencia: 'Eficiência',
  anomalias: 'Anomalias',
  mes: 'Serviços / mês',
});

const EMPTY_KPIS = Object.freeze({
  ativos: {
    valueLabel: '—',
    subLabel: 'sem cadastro',
    tone: 'ok',
  },
  eficiencia: {
    value: null,
    valueLabel: '—',
    subLabel: 'sem dados',
    tone: 'muted',
    sparkData: [],
  },
  anomalias: {
    valueLabel: '0',
    subLabel: 'sem alerta',
    tone: 'ok',
  },
  mes: {
    valueLabel: '0',
    subLabel: 'Sem dados anteriores',
    tone: 'muted',
    sparkData: [],
  },
});

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function numbers(value) {
  return Array.isArray(value)
    ? value.map((item) => Number(item)).filter((item) => Number.isFinite(item))
    : [];
}

function Sparkline({ data }) {
  const values = numbers(data);
  if (!values.length) return null;

  const width = 100;
  const height = 20;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - 2 - (value / max) * (height - 4);
    return [x, y];
  });
  const line = points.map(([x, y], index) => (index === 0 ? 'M' : 'L') + x + ',' + y).join(' ');
  const area = line + ' L' + width + ',' + height + ' L0,' + height + ' Z';

  return (
    <svg
      width="100%"
      height="20"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dsh-spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--dsh-accent,currentColor)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--dsh-accent,currentColor)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#dsh-spark)" />
      <path
        d={line}
        fill="none"
        stroke="var(--dsh-accent,currentColor)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([x, y], index) => {
        const last = index === points.length - 1;
        const radius = last ? 2.2 : values[index] > 0 ? 1.8 : 1;
        return (
          <circle
            key={`${x}:${y}:${index}`}
            cx={x.toFixed(2)}
            cy={y.toFixed(2)}
            r={radius}
            fill="var(--dsh-accent,currentColor)"
            opacity={last ? 1 : 0.6}
          />
        );
      })}
    </svg>
  );
}

function KpiCard({
  label,
  valueId,
  valueLabel,
  valueTone,
  subId,
  subLabel,
  subTone,
  sparkId,
  sparkData,
}) {
  return (
    <article className="dash__kpi">
      <div className="dash__kpi-label">{label}</div>
      <div className="dash__kpi-value" id={valueId} data-tone={valueTone || undefined}>
        {valueLabel}
      </div>
      {sparkId ? (
        <div className="dash__kpi-spark" id={sparkId} aria-hidden="true">
          <Sparkline data={sparkData} />
        </div>
      ) : null}
      <div className="dash__kpi-sub" id={subId} data-tone={subTone || undefined}>
        {subLabel}
      </div>
    </article>
  );
}

export function DashboardKpis({ kpis = EMPTY_KPIS }) {
  const ativos = kpis?.ativos || EMPTY_KPIS.ativos;
  const eficiencia = kpis?.eficiencia || EMPTY_KPIS.eficiencia;
  const anomalias = kpis?.anomalias || EMPTY_KPIS.anomalias;
  const mes = kpis?.mes || EMPTY_KPIS.mes;

  return (
    <>
      <KpiCard
        label={KPI_LABELS.ativos}
        valueId={DASHBOARD_PUBLIC_IDS.kpiAtivos}
        valueLabel={text(ativos.valueLabel, '—')}
        subId={DASHBOARD_PUBLIC_IDS.kpiAtivosSub}
        subLabel={text(ativos.subLabel, 'sem cadastro')}
        subTone={ativos.tone || 'ok'}
      />
      <KpiCard
        label={KPI_LABELS.eficiencia}
        valueId={DASHBOARD_PUBLIC_IDS.kpiEficiencia}
        valueLabel={text(eficiencia.valueLabel, '—')}
        valueTone={eficiencia.tone || 'muted'}
        subId={DASHBOARD_PUBLIC_IDS.kpiEficienciaSub}
        subLabel={text(eficiencia.subLabel, 'sem dados')}
        subTone={eficiencia.tone || 'muted'}
        sparkId={DASHBOARD_PUBLIC_IDS.kpiEficienciaSpark}
        sparkData={eficiencia.value === null ? [] : eficiencia.sparkData}
      />
      <KpiCard
        label={KPI_LABELS.anomalias}
        valueId={DASHBOARD_PUBLIC_IDS.kpiAnomalias}
        valueLabel={text(anomalias.valueLabel, '0')}
        valueTone={anomalias.tone || 'ok'}
        subId={DASHBOARD_PUBLIC_IDS.kpiAnomaliasSub}
        subLabel={text(anomalias.subLabel, 'sem alerta')}
        subTone={anomalias.tone || 'ok'}
      />
      <KpiCard
        label={KPI_LABELS.mes}
        valueId={DASHBOARD_PUBLIC_IDS.kpiMes}
        valueLabel={text(mes.valueLabel, '0')}
        subId={DASHBOARD_PUBLIC_IDS.kpiMesSub}
        subLabel={text(mes.subLabel, 'Sem dados anteriores')}
        subTone={mes.tone || 'muted'}
        sparkId={DASHBOARD_PUBLIC_IDS.kpiMesSpark}
        sparkData={mes.sparkData}
      />
    </>
  );
}
