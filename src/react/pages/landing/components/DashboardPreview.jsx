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

/**
 * Dashboard preview interativo (PR 2). Sidebar tem 7 abas clicaveis +
 * 3 itens visuais-only ao final. State local controla qual aba esta
 * ativa; ao trocar, o body central renderiza:
 *  - layout `overview` para Dashboard (KPIs animados + alerts + chart
 *    + tabela OS + strip de equipamentos);
 *  - layout `kpis-list` para as demais abas (4 KPIs animados + lista
 *    tabular).
 *
 * Acessibilidade: cada aba e um `<button>` com `aria-pressed` e
 * `aria-current="page"` quando ativa. Foco visivel via `focus-visible`
 * outline default do projeto.
 */
export function DashboardPreview() {
  const [activeTabId, setActiveTabId] = useState(dashboardDefaultTabId);
  const activeTab = dashboardTabContent[activeTabId] || dashboardTabContent.dashboard;

  return (
    <div
      id="dashboard-preview"
      className="tw-relative tw-rounded-[22px] tw-bg-white tw-shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45),0_8px_24px_rgba(0,0,0,0.2)] tw-overflow-hidden tw-text-landing-ink"
    >
      <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-[200px_1fr]">
        <DashboardSidebar activeTabId={activeTabId} onSelectTab={setActiveTabId} />
        <DashboardMain activeTabId={activeTabId} activeTab={activeTab} />
      </div>
    </div>
  );
}

function DashboardSidebar({ activeTabId, onSelectTab }) {
  return (
    <aside
      className="tw-hidden lg:tw-flex tw-flex-col tw-text-[#cdd9ee] tw-px-3.5 tw-py-4"
      style={{ background: 'linear-gradient(180deg, #031B4E 0%, #020B2D 100%)' }}
    >
      <div className="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-bold tw-text-sm tw-mb-6 tw-px-1.5">
        <span
          className="tw-w-6 tw-h-6 tw-rounded-md tw-grid tw-place-items-center"
          style={{ background: 'linear-gradient(135deg, #006DFF 0%, #40C4FF 100%)' }}
        />
        CoolTrack<span className="tw-text-landing-cyan tw-font-semibold tw-text-[11px]">Pro</span>
      </div>

      <ul
        role="tablist"
        aria-label="Navegação do dashboard"
        className="tw-list-none tw-flex tw-flex-col tw-gap-0.5 tw-p-0 tw-m-0"
      >
        {dashboardTabs.map((item) => {
          const isActive = item.id === activeTabId;
          return (
            <li key={item.id} className="tw-p-0 tw-m-0">
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelectTab(item.id)}
                className={`tw-w-full tw-flex tw-items-center tw-gap-2.5 tw-px-2.5 tw-py-2 tw-rounded-lg tw-text-[12.5px] tw-text-left tw-cursor-pointer tw-border-0 tw-transition-colors ${
                  isActive
                    ? 'tw-text-white tw-font-semibold'
                    : 'tw-text-[#9fb3d4] hover:tw-text-white'
                }`}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(90deg, #006DFF 0%, rgba(0,109,255,0) 110%)',
                        boxShadow: 'inset 3px 0 0 #40C4FF',
                      }
                    : { background: 'transparent' }
                }
              >
                <span className="tw-w-3.5 tw-h-3.5 tw-flex-none" aria-hidden="true">
                  <DotIcon active={isActive} />
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
        {dashboardSidebarStaticItems.map((item) => (
          <li
            key={item.id}
            aria-disabled="true"
            className="tw-flex tw-items-center tw-gap-2.5 tw-px-2.5 tw-py-2 tw-rounded-lg tw-text-[12.5px] tw-text-[#9fb3d4] tw-opacity-70 tw-cursor-default"
          >
            <span className="tw-w-3.5 tw-h-3.5 tw-flex-none" aria-hidden="true">
              <DotIcon active={false} />
            </span>
            {item.label}
          </li>
        ))}
      </ul>

      <div
        className="tw-mt-auto tw-flex tw-items-center tw-gap-2.5 tw-px-2.5 tw-py-2.5 tw-rounded-xl tw-text-white tw-font-medium tw-text-[12px]"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <span
          className="tw-w-7 tw-h-7 tw-rounded-full tw-grid tw-place-items-center tw-text-[11px] tw-font-bold tw-text-white"
          style={{ background: 'linear-gradient(135deg, #40C4FF 0%, #006DFF 100%)' }}
        >
          TC
        </span>
        <div>
          Técnico Carlos
          <div className="tw-text-[#9fb3d4] tw-text-[10px] tw-font-normal">Plano Pro</div>
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
      className="tw-flex tw-flex-col tw-gap-3.5 tw-px-4 tw-py-4 tw-bg-white"
    >
      <div className="tw-flex tw-items-center tw-justify-between">
        <div>
          <h3 className="tw-text-base tw-font-bold">{activeTab.title}</h3>
          {activeTab.subtitle ? (
            <p className="tw-text-[11px] tw-text-landing-ink-2 tw-mt-0.5 tw-font-medium">
              {activeTab.subtitle}
            </p>
          ) : null}
        </div>
        <span className="tw-inline-flex tw-items-center tw-gap-2 tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-border tw-border-landing-line tw-text-landing-ink-2 tw-text-xs tw-font-medium">
          01/05/2024 - 31/05/2024
        </span>
      </div>

      {activeTab.layout === 'overview' ? (
        <OverviewLayout />
      ) : (
        <KpisListLayout activeTab={activeTab} />
      )}
    </div>
  );
}

/**
 * Layout do tab `dashboard` — herda o visual do PR 1 (KPIs animaveis,
 * alerts, chart, OS table, equip strip). Reutiliza dados ja existentes
 * em `dashboardKpis`, `dashboardAlerts`, etc.
 */
function OverviewLayout() {
  return (
    <>
      <div className="tw-grid tw-grid-cols-2 sm:tw-grid-cols-4 tw-gap-2.5">
        {dashboardKpis.map((kpi) => (
          <KpiCard key={kpi.id} label={kpi.label} value={Number.parseInt(kpi.value, 10) || 0} />
        ))}
      </div>

      <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-[1fr_1.3fr] tw-gap-2.5">
        <DashboardAlertsPanel />
        <DashboardChartPanel />
      </div>

      <DashboardOsPanel />
      <DashboardEquipStrip />
    </>
  );
}

/**
 * Layout `kpis-list` — usado por todas as outras abas. 4 KPIs animados
 * + 1 lista tabular curta.
 */
function KpisListLayout({ activeTab }) {
  return (
    <>
      <div className="tw-grid tw-grid-cols-2 sm:tw-grid-cols-4 tw-gap-2.5">
        {(activeTab.kpis || []).map((kpi) => (
          <KpiCard key={kpi.id} label={kpi.label} value={kpi.value} />
        ))}
      </div>
      {activeTab.list ? <SimpleListPanel list={activeTab.list} /> : null}
    </>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="tw-bg-white tw-border tw-border-landing-line tw-rounded-xl tw-p-3 tw-flex tw-flex-col tw-gap-1">
      <span className="tw-text-[11px] tw-text-landing-ink-2 tw-font-medium">{label}</span>
      <AnimatedCounter
        end={Number(value) || 0}
        className="tw-text-[22px] tw-font-bold tw-tracking-[-0.01em] tw-text-landing-ink"
      />
      <span className="tw-text-[10.5px] tw-text-landing-blue tw-font-semibold">Ver detalhes →</span>
    </div>
  );
}

const PILL_TONE = {
  green: 'tw-bg-[rgba(24,184,132,0.12)] tw-text-[#0e7d59]',
  orange: 'tw-bg-[rgba(245,158,11,0.14)] tw-text-[#a16207]',
  blue: 'tw-bg-[rgba(0,109,255,0.12)] tw-text-landing-blue',
  red: 'tw-bg-[rgba(239,68,68,0.12)] tw-text-[#b91c1c]',
};

function SimpleListPanel({ list }) {
  return (
    <div className="tw-border tw-border-landing-line tw-rounded-xl tw-p-2.5 tw-bg-white">
      <div className="tw-flex tw-items-center tw-justify-between tw-text-[12.5px] tw-font-bold tw-mb-1">
        <span>{list.title}</span>
        <span className="tw-text-[10.5px] tw-text-landing-blue tw-font-semibold">Ver tudo</span>
      </div>
      <div className="tw-flex tw-flex-col">
        <div className="tw-grid tw-grid-cols-[1.5fr_1.5fr_1fr_90px] tw-gap-1.5 tw-py-1.5 tw-px-1 tw-border-b tw-border-landing-line tw-text-[9.5px] tw-text-landing-ink-2 tw-uppercase tw-font-semibold tw-tracking-[0.04em]">
          {list.headers.map((h, i) => (
            <span key={i}>{h}</span>
          ))}
        </div>
        {list.rows.map((row, i, arr) => (
          <div
            key={i}
            className={`tw-grid tw-grid-cols-[1.5fr_1.5fr_1fr_90px] tw-gap-1.5 tw-py-1.5 tw-px-1 tw-text-[11px] tw-items-center ${
              i < arr.length - 1 ? 'tw-border-b tw-border-landing-line' : ''
            }`}
          >
            <span className="tw-font-semibold tw-text-landing-ink">{row.col1}</span>
            <span className="tw-text-landing-ink-2">{row.col2}</span>
            <span className="tw-text-landing-ink-2">{row.col3}</span>
            <span>
              <span
                className={`tw-inline-block tw-px-2 tw-py-0.5 tw-rounded-full tw-text-[10px] tw-font-semibold tw-text-center ${PILL_TONE[row.tone] || ''}`}
              >
                {row.status}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardAlertsPanel() {
  const toneClass = {
    red: 'tw-bg-landing-red',
    orange: 'tw-bg-landing-orange',
    blue: 'tw-bg-landing-blue',
    green: 'tw-bg-landing-green',
  };
  return (
    <div className="tw-border tw-border-landing-line tw-rounded-xl tw-p-3 tw-bg-white">
      <div className="tw-flex tw-items-center tw-justify-between tw-text-[12.5px] tw-font-bold tw-mb-2.5">
        <span>Alertas de manutenção</span>
        <span className="tw-text-[10.5px] tw-text-landing-blue tw-font-semibold">Ver todos</span>
      </div>
      <div className="tw-flex tw-flex-col tw-gap-2">
        {dashboardAlerts.map((alert) => (
          <div
            key={alert.id}
            className="tw-flex tw-gap-2 tw-p-2 tw-rounded-lg tw-bg-landing-off tw-text-[11px]"
          >
            <span
              className={`tw-w-1.5 tw-rounded-md tw-flex-none ${toneClass[alert.tone] || ''}`}
              aria-hidden="true"
            />
            <div>
              <div className="tw-font-semibold tw-text-landing-ink tw-text-[11.5px]">
                {alert.title}
              </div>
              <div className="tw-text-landing-ink-2 tw-mt-px tw-text-[10.5px]">
                {alert.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardChartPanel() {
  return (
    <div className="tw-border tw-border-landing-line tw-rounded-xl tw-p-3 tw-bg-white">
      <div className="tw-flex tw-items-center tw-justify-between tw-text-[12.5px] tw-font-bold tw-mb-2.5">
        <span>Atendimentos (últimos 30 dias)</span>
        <span className="tw-text-[10.5px] tw-text-landing-ink-2 tw-font-medium">
          +18% vs mês anterior
        </span>
      </div>
      <div className="tw-h-[130px] tw-flex tw-items-end tw-gap-[3px] tw-px-1 tw-pt-1.5 tw-pb-1 tw-border-b tw-border-dashed tw-border-landing-line">
        {dashboardChartBars.map((h, i) => (
          <span
            key={i}
            className="tw-flex-1 tw-rounded-t-[3px] tw-opacity-90"
            style={{
              height: `${h}%`,
              background: 'linear-gradient(180deg, #159BFF 0%, #006DFF 100%)',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="tw-flex tw-justify-between tw-text-[9.5px] tw-text-landing-ink-2 tw-pt-1.5 tw-px-1">
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
    <div className="tw-border tw-border-landing-line tw-rounded-xl tw-p-2.5 tw-bg-white">
      <div className="tw-flex tw-items-center tw-justify-between tw-text-[12.5px] tw-font-bold tw-mb-1">
        <span>OS recentes</span>
        <span className="tw-text-[10.5px] tw-text-landing-blue tw-font-semibold">Ver todas</span>
      </div>
      <div className="tw-flex tw-flex-col">
        <div className="tw-grid tw-grid-cols-[60px_1fr_80px_70px] tw-gap-1.5 tw-py-1.5 tw-px-1 tw-border-b tw-border-landing-line tw-text-[9.5px] tw-text-landing-ink-2 tw-uppercase tw-font-semibold tw-tracking-[0.04em]">
          <span>OS</span>
          <span>Cliente / Equipamento</span>
          <span>Tipo</span>
          <span>Status</span>
        </div>
        {dashboardOsRows.map((row, i, arr) => (
          <div
            key={row.id}
            className={`tw-grid tw-grid-cols-[60px_1fr_80px_70px] tw-gap-1.5 tw-py-1.5 tw-px-1 tw-text-[11px] tw-items-center ${
              i < arr.length - 1 ? 'tw-border-b tw-border-landing-line' : ''
            }`}
          >
            <span className="tw-text-landing-blue tw-font-semibold tw-font-mono tw-text-[10.5px]">
              #{row.id}
            </span>
            <span>
              <strong className="tw-font-semibold">{row.customer}</strong> · {row.equipment}
            </span>
            <span>{row.type}</span>
            <span>
              <span
                className={`tw-inline-block tw-px-2 tw-py-0.5 tw-rounded-full tw-text-[10px] tw-font-semibold tw-text-center ${PILL_TONE[row.status.tone] || ''}`}
              >
                {row.status.label}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardEquipStrip() {
  return (
    <div className="tw-grid tw-grid-cols-3 sm:tw-grid-cols-6 tw-gap-2 tw-border-t tw-border-landing-line tw-pt-3">
      {dashboardEquipStrip.map((item) => (
        <div
          key={item.id}
          className="tw-flex tw-flex-col tw-items-center tw-gap-1 tw-py-2 tw-px-1 tw-rounded-xl tw-bg-landing-off"
        >
          <span
            className="tw-w-6 tw-h-6 tw-rounded-md tw-text-white tw-grid tw-place-items-center tw-text-[10px] tw-font-bold"
            style={{ background: 'linear-gradient(135deg, #006DFF 0%, #159BFF 100%)' }}
          >
            {item.label.charAt(0)}
          </span>
          <span className="tw-text-[10px] tw-text-landing-ink-2 tw-font-medium tw-text-center">
            {item.label}
          </span>
          <span className="tw-text-sm tw-font-bold tw-text-landing-ink">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function DotIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill={active ? '#40C4FF' : '#7d97c0'} />
    </svg>
  );
}

export default DashboardPreview;
