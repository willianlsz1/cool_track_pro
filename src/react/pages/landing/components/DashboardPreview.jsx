import { useState } from 'react';
import {
  dashboardTabs,
  dashboardSidebarStaticItems,
  dashboardDefaultTabId,
  dashboardTabContent,
  dashboardKpis,
  dashboardAlerts,
  dashboardChartBars,
  dashboardOsRows,
  dashboardEquipStrip,
} from '../data/landingMockData.js';
import { AnimatedCounter } from './AnimatedCounter.jsx';

const APP_FRAME_CLASS =
  'tw-relative tw-overflow-hidden tw-rounded-[28px] tw-border tw-border-white/10 tw-bg-[#050b1c] tw-p-2 tw-text-[#0a1530] tw-shadow-[0_34px_90px_-32px_rgba(2,11,45,0.9),0_24px_60px_-36px_rgba(34,211,238,0.55)]';

const LIGHT_PANEL_CLASS =
  'tw-min-h-[620px] tw-bg-[radial-gradient(circle_at_18%_0%,rgba(47,123,255,0.08),transparent_34%),linear-gradient(180deg,#f5f7fb_0%,#eef2f9_100%)]';

const CARD_CLASS =
  'tw-border tw-border-[#e3e8f1] tw-bg-white/95 tw-shadow-[0_14px_32px_-26px_rgba(10,21,48,0.45)]';

const TABLE_HEADER_CLASS =
  'tw-grid tw-gap-2 sm:tw-gap-3 tw-border-b tw-border-[#e6ebf3] tw-bg-[#f8fafd] tw-px-3 tw-py-2.5 tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-[0.11em] tw-text-[#7e8ca8]';

const TABLE_ROW_CLASS =
  'tw-grid tw-items-center tw-gap-2 sm:tw-gap-3 tw-px-3 tw-py-3 tw-text-[11.5px] tw-transition-colors hover:tw-bg-[#f5f9ff]';

const STATUS_PILL_CLASS =
  'tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded-full tw-border tw-px-2 tw-py-1 tw-text-[10px] tw-font-bold';

const PILL_TONE = {
  green: 'tw-border-[#bdebd0] tw-bg-[#ecfdf3] tw-text-[#15803d]',
  orange: 'tw-border-[#f8d9a3] tw-bg-[#fff7ed] tw-text-[#b45309]',
  blue: 'tw-border-[#bfdbfe] tw-bg-[#eff6ff] tw-text-[#1d4ed8]',
  red: 'tw-border-[#fecaca] tw-bg-[#fef2f2] tw-text-[#b91c1c]',
};

const DOT_TONE = {
  green: 'tw-bg-[#16a34a]',
  orange: 'tw-bg-[#d97706]',
  blue: 'tw-bg-[#2f7bff]',
  red: 'tw-bg-[#dc2626]',
};

const KPI_ACCENT = [
  'tw-text-[#2f7bff] tw-bg-[#eff6ff] tw-border-[#dbeafe]',
  'tw-text-[#0891b2] tw-bg-[#ecfeff] tw-border-[#cffafe]',
  'tw-text-[#16a34a] tw-bg-[#ecfdf3] tw-border-[#bbf7d0]',
  'tw-text-[#d97706] tw-bg-[#fff7ed] tw-border-[#fed7aa]',
];

export function DashboardPreview() {
  const [activeTabId, setActiveTabId] = useState(dashboardDefaultTabId);
  const activeTab = dashboardTabContent[activeTabId] || dashboardTabContent.dashboard;

  return (
    <div id="dashboard-preview" className={APP_FRAME_CLASS}>
      <div
        className="tw-pointer-events-none tw-absolute tw-inset-0 tw-opacity-70"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle at 24% 0%, rgba(34,211,238,0.2), transparent 32%), radial-gradient(circle at 85% 12%, rgba(47,123,255,0.2), transparent 30%)',
        }}
      />
      <div
        className="tw-pointer-events-none tw-absolute tw-inset-0 tw-opacity-[0.12]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="tw-relative tw-grid tw-overflow-hidden tw-rounded-[22px] tw-border tw-border-white/10 tw-bg-[#050b1c] lg:tw-grid-cols-[218px_1fr]">
        <DashboardSidebar activeTabId={activeTabId} onSelectTab={setActiveTabId} />
        <DashboardMain activeTabId={activeTabId} activeTab={activeTab} />
      </div>
    </div>
  );
}

function DashboardSidebar({ activeTabId, onSelectTab }) {
  return (
    <aside
      className="tw-flex tw-min-w-0 tw-flex-col tw-border-b tw-border-white/10 tw-p-3 tw-text-[#cdd9ee] lg:tw-border-b-0 lg:tw-border-r lg:tw-px-3.5 lg:tw-py-4"
      style={{
        background:
          'radial-gradient(circle at 28% 0%, rgba(34,211,238,0.14), transparent 34%), linear-gradient(180deg, #0f1d3e 0%, #081530 100%)',
      }}
    >
      <div className="tw-flex tw-items-center tw-gap-2 tw-px-1.5 tw-text-sm tw-font-bold tw-text-white lg:tw-mb-6">
        <span className="tw-grid tw-h-7 tw-w-7 tw-place-items-center tw-rounded-[9px] tw-bg-white/10 tw-ring-1 tw-ring-white/15">
          <img src="/brand/favicon.svg" alt="" className="tw-h-4 tw-w-4" aria-hidden="true" />
        </span>
        <span>CoolTrack</span>
      </div>

      <div
        role="tablist"
        aria-label="Navegação do dashboard"
        className="tw-mt-3 tw-flex tw-gap-1 tw-overflow-x-auto tw-pb-1 lg:tw-mt-0 lg:tw-flex-col lg:tw-overflow-visible lg:tw-pb-0"
      >
        {dashboardTabs.map((item) => {
          const isActive = item.id === activeTabId;
          return (
            <button
              key={item.id}
              id={`dashboard-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectTab(item.id)}
              className={`tw-relative tw-flex tw-shrink-0 tw-items-center tw-gap-2.5 tw-rounded-xl tw-border tw-px-3 tw-py-2.5 tw-text-left tw-text-[12.5px] tw-transition-all focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[#67e8f9] motion-safe:hover:tw--translate-y-0.5 lg:tw-w-full ${
                isActive
                  ? 'tw-border-[#38bdf8]/40 tw-bg-[linear-gradient(90deg,#2f7bff_0%,rgba(34,211,238,0.72)_100%)] tw-text-white tw-shadow-[0_14px_28px_-18px_rgba(34,211,238,0.9)]'
                  : 'tw-border-transparent tw-bg-white/[0.03] tw-text-[#9fb3d4] hover:tw-border-white/10 hover:tw-bg-white/[0.07] hover:tw-text-white'
              }`}
            >
              {isActive ? (
                <span
                  className="tw-absolute tw-left-0 tw-top-1/2 tw-hidden tw-h-7 tw-w-1 tw--translate-y-1/2 tw-rounded-r-full tw-bg-[#67e8f9] lg:tw-block"
                  aria-hidden="true"
                />
              ) : null}
              <span className="tw-h-3.5 tw-w-3.5 tw-flex-none" aria-hidden="true">
                <DotIcon active={isActive} />
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="tw-mt-1 tw-hidden tw-flex-col tw-gap-0.5 lg:tw-flex" aria-hidden="true">
        {dashboardSidebarStaticItems.map((item) => (
          <div
            key={item.id}
            className="tw-flex tw-items-center tw-gap-2.5 tw-rounded-xl tw-px-3 tw-py-2 tw-text-[12.5px] tw-text-[#9fb3d4] tw-opacity-65"
          >
            <span className="tw-h-3.5 tw-w-3.5 tw-flex-none">
              <DotIcon active={false} />
            </span>
            {item.label}
          </div>
        ))}
      </div>

      <div className="tw-mt-3 tw-hidden tw-items-center tw-gap-2.5 tw-rounded-2xl tw-border tw-border-white/10 tw-bg-white/[0.055] tw-px-3 tw-py-3 tw-text-[12px] tw-font-medium tw-text-white tw-shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:tw-mt-auto lg:tw-flex">
        <span
          className="tw-grid tw-h-8 tw-w-8 tw-place-items-center tw-rounded-full tw-text-[11px] tw-font-bold tw-text-white tw-ring-2 tw-ring-white/10"
          style={{ background: 'linear-gradient(135deg, #2f7bff 0%, #22d3ee 100%)' }}
        >
          TC
        </span>
        <div>
          Carlos M.
          <div className="tw-text-[10px] tw-font-normal tw-text-[#d9a441]">Plus</div>
        </div>
      </div>
    </aside>
  );
}

function DashboardMain({ activeTabId, activeTab }) {
  return (
    <div
      role="tabpanel"
      aria-labelledby={`dashboard-tab-${activeTabId}`}
      className={`${LIGHT_PANEL_CLASS} tw-flex tw-min-w-0 tw-flex-col tw-gap-4 tw-px-3 tw-py-3 sm:tw-px-4 sm:tw-py-4 lg:tw-px-5 lg:tw-py-5`}
    >
      <div className="tw-flex tw-flex-col tw-gap-3 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between">
        <div>
          <p className="tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-[0.14em] tw-text-[#2f7bff]">
            Hoje em CoolTrack
          </p>
          <h3 className="tw-mt-1 tw-text-lg tw-font-extrabold tw-tracking-[-0.02em] tw-text-[#0a1530]">
            {activeTab.title}
          </h3>
          {activeTab.subtitle ? (
            <p className="tw-mt-0.5 tw-text-[11.5px] tw-font-medium tw-text-[#5a6b8c]">
              {activeTab.subtitle}
            </p>
          ) : null}
        </div>
        <div className="tw-flex tw-items-center tw-gap-2">
          <span className="tw-hidden tw-rounded-xl tw-border tw-border-[#e6ebf3] tw-bg-white tw-px-3 tw-py-2 tw-text-xs tw-font-semibold tw-text-[#5a6b8c] tw-shadow-[0_10px_22px_-20px_rgba(10,21,48,0.5)] sm:tw-inline-flex">
            Buscar atendimento, cliente ou equipamento
          </span>
          <span className="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-xl tw-border tw-border-[#dbeafe] tw-bg-white tw-px-3 tw-py-2 tw-text-xs tw-font-bold tw-text-[#2a3656] tw-shadow-[0_10px_22px_-20px_rgba(10,21,48,0.5)]">
            <span className="tw-h-2 tw-w-2 tw-rounded-full tw-bg-[#22d3ee]" aria-hidden="true" />
            Maio · 2026
          </span>
        </div>
      </div>

      {activeTab.layout === 'overview' ? (
        <OverviewLayout />
      ) : (
        <KpisListLayout activeTab={activeTab} />
      )}
    </div>
  );
}

function OverviewLayout() {
  return (
    <>
      <div className="tw-grid tw-grid-cols-2 tw-gap-2.5 sm:tw-grid-cols-4">
        {dashboardKpis.map((kpi, index) => (
          <KpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            index={index}
          />
        ))}
      </div>

      <div className="tw-grid tw-grid-cols-1 tw-gap-3 lg:tw-grid-cols-[1fr_1.3fr]">
        <DashboardAlertsPanel />
        <DashboardChartPanel />
      </div>

      <DashboardOsPanel />
      <DashboardEquipStrip />
    </>
  );
}

function KpisListLayout({ activeTab }) {
  return (
    <>
      <div className="tw-grid tw-grid-cols-2 tw-gap-2.5 sm:tw-grid-cols-4">
        {(activeTab.kpis || []).map((kpi, index) => (
          <KpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            index={index}
          />
        ))}
      </div>
      {activeTab.list ? <SimpleListPanel list={activeTab.list} /> : null}
    </>
  );
}

function KpiCard({ label, value, delta, index = 0 }) {
  const accent = KPI_ACCENT[index % KPI_ACCENT.length];
  return (
    <div
      className={`${CARD_CLASS} tw-group tw-relative tw-flex tw-min-w-0 tw-flex-col tw-gap-2 tw-overflow-hidden tw-rounded-2xl tw-p-3 tw-transition-all motion-safe:hover:tw--translate-y-0.5 motion-safe:hover:tw-shadow-[0_18px_38px_-28px_rgba(47,123,255,0.65)]`}
    >
      <div className="tw-flex tw-items-start tw-justify-between tw-gap-2">
        <span className="tw-text-[9.5px] tw-font-extrabold tw-uppercase tw-leading-snug tw-tracking-[0.09em] tw-text-[#7e8ca8]">
          {label}
        </span>
        <span
          className={`tw-grid tw-h-7 tw-w-7 tw-flex-none tw-place-items-center tw-rounded-xl tw-border ${accent}`}
          aria-hidden="true"
        >
          <span className="tw-h-2 tw-w-2 tw-rounded-full tw-bg-current" />
        </span>
      </div>
      {typeof value === 'string' && /[^0-9]/.test(value) ? (
        <span className="tw-text-[24px] tw-font-black tw-tracking-[-0.03em] tw-text-[#0a1530]">
          {value}
        </span>
      ) : (
        <AnimatedCounter
          end={Number(value) || 0}
          className="tw-text-[24px] tw-font-black tw-tracking-[-0.03em] tw-text-[#0a1530]"
        />
      )}
      <span className="tw-text-[10.5px] tw-font-bold tw-text-[#2f7bff] group-hover:tw-text-[#0ea5e9]">
        {delta || 'Ver detalhes →'}
      </span>
    </div>
  );
}

function SimpleListPanel({ list }) {
  return (
    <div className={`${CARD_CLASS} tw-overflow-hidden tw-rounded-2xl`}>
      <PanelHeader title={list.title} action="Ver tudo" />
      <MobileSummaryList rows={list.rows} />
      <div className="tw-hidden sm:tw-block">
        <div>
          <TableHeader columns={list.headers} template="tw-grid-cols-[1.5fr_1.5fr_1fr_104px]" />
          {list.rows.map((row, i, arr) => (
            <div
              key={i}
              className={`${TABLE_ROW_CLASS} tw-grid-cols-[1.5fr_1.5fr_1fr_104px] ${
                i < arr.length - 1 ? 'tw-border-b tw-border-[#eef1f7]' : ''
              }`}
            >
              <span
                className={
                  row.col1?.startsWith?.('#')
                    ? 'tw-font-mono tw-font-bold tw-text-[#2f7bff]'
                    : 'tw-font-bold tw-text-[#0a1530]'
                }
              >
                {row.col1}
              </span>
              <span className="tw-text-[#5a6b8c]">{row.col2}</span>
              <span className="tw-text-[#5a6b8c]">{row.col3}</span>
              <span>
                <StatusPill tone={row.tone}>{row.status}</StatusPill>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileSummaryList({ rows }) {
  return (
    <div className="tw-flex tw-flex-col tw-gap-2 tw-p-3 sm:tw-hidden">
      {rows.map((row, index) => (
        <div
          key={`${row.col1}-${index}`}
          className="tw-rounded-xl tw-border tw-border-[#eef1f7] tw-bg-[#f8fafd] tw-p-3"
        >
          <div className="tw-flex tw-items-start tw-justify-between tw-gap-2">
            <span
              className={
                row.col1?.startsWith?.('#')
                  ? 'tw-font-mono tw-text-[11px] tw-font-bold tw-text-[#2f7bff]'
                  : 'tw-text-[12px] tw-font-extrabold tw-text-[#0a1530]'
              }
            >
              {row.col1}
            </span>
            <StatusPill tone={row.tone}>{row.status}</StatusPill>
          </div>
          <div className="tw-mt-2 tw-text-[11px] tw-font-semibold tw-text-[#5a6b8c]">
            {row.col2}
          </div>
          <div className="tw-mt-1 tw-text-[10.5px] tw-text-[#7e8ca8]">{row.col3}</div>
        </div>
      ))}
    </div>
  );
}

function TableHeader({ columns, template }) {
  return (
    <div className={`${TABLE_HEADER_CLASS} ${template}`}>
      {columns.map((h, i) => (
        <span key={i}>{h}</span>
      ))}
    </div>
  );
}

function StatusPill({ tone = 'blue', children }) {
  return (
    <span className={`${STATUS_PILL_CLASS} ${PILL_TONE[tone] || PILL_TONE.blue}`}>
      <span className={`tw-h-1.5 tw-w-1.5 tw-rounded-full ${DOT_TONE[tone] || DOT_TONE.blue}`} />
      {children}
    </span>
  );
}

function PanelHeader({ title, action, subtitle }) {
  return (
    <div className="tw-flex tw-items-start tw-justify-between tw-gap-3 tw-border-b tw-border-[#eef1f7] tw-px-3 tw-py-3">
      <div>
        <h4 className="tw-inline-flex tw-items-center tw-gap-2 tw-text-[13px] tw-font-extrabold tw-text-[#0a1530]">
          <span className="tw-h-2 tw-w-2 tw-rounded-full tw-bg-[#22d3ee]" aria-hidden="true" />
          {title}
        </h4>
        {subtitle ? (
          <p className="tw-mt-0.5 tw-text-[10.5px] tw-text-[#7e8ca8]">{subtitle}</p>
        ) : null}
      </div>
      {action ? (
        <span className="tw-text-[10.5px] tw-font-bold tw-text-[#2f7bff]">{action}</span>
      ) : null}
    </div>
  );
}

function DashboardAlertsPanel() {
  const toneClass = {
    red: 'tw-bg-[#dc2626]',
    orange: 'tw-bg-[#d97706]',
    blue: 'tw-bg-[#2f7bff]',
    green: 'tw-bg-[#16a34a]',
  };
  return (
    <div className={`${CARD_CLASS} tw-overflow-hidden tw-rounded-2xl`}>
      <PanelHeader title="Alertas de manutenção" action="Ver todos" />
      <div className="tw-flex tw-flex-col tw-gap-2 tw-p-3">
        {dashboardAlerts.map((alert) => (
          <div
            key={alert.id}
            className="tw-flex tw-gap-2.5 tw-rounded-xl tw-border tw-border-[#eef1f7] tw-bg-[#f8fafd] tw-p-2.5 tw-text-[11px] tw-transition-colors hover:tw-bg-[#f5f9ff]"
          >
            <span
              className={`tw-mt-0.5 tw-h-8 tw-w-1.5 tw-flex-none tw-rounded-full ${toneClass[alert.tone] || ''}`}
              aria-hidden="true"
            />
            <div>
              <div className="tw-text-[11.5px] tw-font-bold tw-text-[#0a1530]">{alert.title}</div>
              <div className="tw-mt-px tw-text-[10.5px] tw-text-[#5a6b8c]">{alert.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardChartPanel() {
  return (
    <div className={`${CARD_CLASS} tw-overflow-hidden tw-rounded-2xl`}>
      <PanelHeader title="Atendimentos (últimos 30 dias)" action="+18% vs mês anterior" />
      <div className="tw-flex tw-h-[142px] tw-items-end tw-gap-[4px] tw-border-b tw-border-dashed tw-border-[#dbe4f0] tw-px-3 tw-pb-2 tw-pt-4">
        {dashboardChartBars.map((h, i) => (
          <span
            key={i}
            className="tw-flex-1 tw-rounded-t-[5px] tw-opacity-90 tw-shadow-[0_7px_14px_-12px_rgba(47,123,255,0.9)]"
            style={{
              height: `${h}%`,
              background: 'linear-gradient(180deg, #22d3ee 0%, #2f7bff 100%)',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="tw-flex tw-justify-between tw-px-3 tw-py-2 tw-text-[9.5px] tw-font-semibold tw-text-[#7e8ca8]">
        <span>01/04</span>
        <span>08/04</span>
        <span>15/04</span>
        <span>22/04</span>
        <span>30/04</span>
      </div>
    </div>
  );
}

function DashboardOsPanel() {
  return (
    <div className={`${CARD_CLASS} tw-overflow-hidden tw-rounded-2xl`}>
      <PanelHeader title="Atendimentos recentes" action="Ver todos" />
      <MobileOsList rows={dashboardOsRows} />
      <div className="tw-hidden sm:tw-block">
        <div>
          <TableHeader
            columns={['#', 'Cliente / Equipamento', 'Tipo', 'Status']}
            template="tw-grid-cols-[80px_1fr_90px_104px]"
          />
          {dashboardOsRows.map((row, i, arr) => (
            <div
              key={row.id}
              className={`${TABLE_ROW_CLASS} tw-grid-cols-[80px_1fr_90px_104px] ${
                i < arr.length - 1 ? 'tw-border-b tw-border-[#eef1f7]' : ''
              }`}
            >
              <span className="tw-font-mono tw-text-[10.5px] tw-font-bold tw-text-[#2f7bff]">
                {row.id}
              </span>
              <span className="tw-text-[#5a6b8c]">
                <strong className="tw-font-bold tw-text-[#0a1530]">{row.customer}</strong> ·{' '}
                {row.equipment}
              </span>
              <span className="tw-text-[#5a6b8c]">{row.type}</span>
              <span>
                <StatusPill tone={row.status.tone}>{row.status.label}</StatusPill>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileOsList({ rows }) {
  return (
    <div className="tw-flex tw-flex-col tw-gap-2 tw-p-3 sm:tw-hidden">
      {rows.map((row) => (
        <div
          key={row.id}
          className="tw-rounded-xl tw-border tw-border-[#eef1f7] tw-bg-[#f8fafd] tw-p-3"
        >
          <div className="tw-flex tw-items-start tw-justify-between tw-gap-2">
            <span className="tw-font-mono tw-text-[11px] tw-font-bold tw-text-[#2f7bff]">
              {row.id}
            </span>
            <StatusPill tone={row.status.tone}>{row.status.label}</StatusPill>
          </div>
          <div className="tw-mt-2 tw-text-[12px] tw-font-extrabold tw-text-[#0a1530]">
            {row.customer}
          </div>
          <div className="tw-mt-1 tw-text-[10.5px] tw-font-semibold tw-text-[#5a6b8c]">
            {row.equipment} · {row.type}
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardEquipStrip() {
  return (
    <div className="tw-grid tw-grid-cols-3 tw-gap-2 tw-border-t tw-border-[#dfe7f2] tw-pt-3 sm:tw-grid-cols-6">
      {dashboardEquipStrip.map((item) => (
        <div
          key={item.id}
          className="tw-flex tw-flex-col tw-items-center tw-gap-1 tw-rounded-2xl tw-border tw-border-[#e6ebf3] tw-bg-white/90 tw-px-1 tw-py-2 tw-shadow-[0_12px_26px_-24px_rgba(10,21,48,0.5)]"
        >
          <span
            className="tw-grid tw-h-7 tw-w-7 tw-place-items-center tw-rounded-xl tw-text-[10px] tw-font-bold tw-text-white"
            style={{ background: 'linear-gradient(135deg, #2f7bff 0%, #22d3ee 100%)' }}
          >
            {item.label.charAt(0)}
          </span>
          <span className="tw-text-center tw-text-[10px] tw-font-semibold tw-text-[#5a6b8c]">
            {item.label}
          </span>
          <span className="tw-text-sm tw-font-black tw-text-[#0a1530]">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function DotIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill={active ? '#ffffff' : '#7d97c0'} />
    </svg>
  );
}

export default DashboardPreview;
