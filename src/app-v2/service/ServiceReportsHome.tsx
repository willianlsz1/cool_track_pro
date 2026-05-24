import { useMemo, useState } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faCalendarAlt,
  faChartLine,
  faChartSimple,
  faChevronDown,
  faEye,
  faFileAlt,
  faMicrochip,
  faSlidersH,
} from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import { ActionButton, PageShell, SectionCard, SectionEyebrow } from '../ui/primitives';
import { ServiceReportPreview } from './ServiceReportPreview';
import { ServiceReportsList } from './ServiceReportsList';
import { buildServiceReportViewModelFromRecord } from './serviceReportViewModel';
import {
  buildServicesReportsViewModel,
  type BuildServicesReportsFilters,
  type ServicesReportListItemViewModel,
} from './servicesReportsViewModel';
import type { BuildServicesHomeInput } from './servicesHomeViewModel';
import { ServicesSubViewNav, type ServicesSubView } from './ServicesSubViewNav';

interface ServiceReportsHomeProps {
  activeView: ServicesSubView;
  input: BuildServicesHomeInput;
  onPrintReport: () => void;
  onSelectView: (view: ServicesSubView) => void;
}

export function ServiceReportsHome({
  activeView,
  input,
  onPrintReport,
  onSelectView,
}: ServiceReportsHomeProps) {
  const [reportFilters, setReportFilters] = useState<BuildServicesReportsFilters>({});
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [previewRecordId, setPreviewRecordId] = useState<string | null>(null);
  const viewModel = useMemo(
    () => buildServicesReportsViewModel(input, reportFilters),
    [input, reportFilters],
  );
  const selectedRecord = selectedRecordId
    ? input.registros.find((registro) => registro.id === selectedRecordId)
    : undefined;
  const report = selectedRecord
    ? buildServiceReportViewModelFromRecord(input, selectedRecord)
    : undefined;
  const previewItem =
    viewModel.items.find((item) => item.id === previewRecordId) ?? viewModel.items[0] ?? null;

  function updateReportFilter<Key extends keyof BuildServicesReportsFilters>(
    key: Key,
    value: BuildServicesReportsFilters[Key],
  ) {
    setPreviewRecordId(null);
    setReportFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  if (report) {
    return (
      <PageShell>
        <div data-app-v2-print-hidden="true">
          <ServicesSubViewNav activeView={activeView} onSelectView={onSelectView} />
        </div>

        <SectionCard
          padding="sm"
          className="tw-flex tw-flex-col tw-gap-4 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between"
        >
          <div className="tw-min-w-0">
            <SectionEyebrow>Serviços &gt; Relatórios</SectionEyebrow>
            <h1 className={`tw-m-0 tw-mt-1 tw-text-2xl tw-font-bold ${appV2Tone.text}`}>
              {report.reportId}
            </h1>
          </div>
          <ActionButton
            variant="secondary"
            className="tw-w-full sm:tw-w-auto"
            onClick={() => setSelectedRecordId(null)}
          >
            Voltar para relatórios
          </ActionButton>
        </SectionCard>

        <ServiceReportPreview report={report} onPrint={onPrintReport} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ServicesSubViewNav activeView={activeView} onSelectView={onSelectView} />

      <header className="tw-min-w-0">
        <SectionEyebrow className="tw-items-center tw-gap-2">
          <FontAwesomeIcon icon={faFileAlt} aria-hidden="true" />
          {viewModel.subtitle}
        </SectionEyebrow>
        <h1
          className={`tw-m-0 tw-mt-3 tw-text-[1.8rem] tw-font-extrabold tw-leading-tight tw-tracking-[-0.02em] ${appV2Tone.text}`}
        >
          {viewModel.title}
        </h1>
        <p className={`tw-m-0 tw-mt-1.5 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
          Consulte registros concluídos, gere leitura operacional e reabra o relatório local de cada
          atendimento.
        </p>
        <label className="tw-sr-only">
          <span className="tw-sr-only">Buscar relatórios</span>
          <input
            aria-label="Buscar relatórios"
            value={viewModel.activeFilters.query}
            onChange={(event) => updateReportFilter('query', event.target.value)}
            placeholder={viewModel.searchPlaceholder}
            className="tw-sr-only"
          />
        </label>
      </header>

      <div data-testid="service-report-summary">
        <SectionCard className="tw-p-5">
          <div className="tw-flex tw-flex-wrap tw-items-end tw-gap-4">
            <div className="tw-sr-only">
              {viewModel.summary.title}
              {' · '}
              {viewModel.kpis.map((kpi) => `${kpi.label} ${kpi.value}`).join(' · ')}
            </div>
            <FilterSelect
              icon={faCalendarAlt}
              label="Período"
              name="service-report-period-filter"
              value={viewModel.activeFilters.period}
              onChange={(value) =>
                updateReportFilter('period', value as BuildServicesReportsFilters['period'])
              }
              options={[
                { value: 'all', label: 'Todo período' },
                { value: 'last_7_days', label: 'Últimos 7 dias' },
                { value: 'current_month', label: 'Mês atual' },
              ]}
            />
            <FilterSelect
              icon={faBuilding}
              label="Cliente"
              name="service-report-client-filter"
              value={viewModel.activeFilters.clientId}
              onChange={(value) => updateReportFilter('clientId', value)}
              options={[
                { value: 'all', label: 'Todos clientes' },
                ...viewModel.filterOptions.clients.map((client) => ({
                  value: client.id,
                  label: client.label,
                })),
              ]}
            />
            <FilterSelect
              icon={faMicrochip}
              label="Equipamento"
              name="service-report-equipment-filter"
              value={viewModel.activeFilters.equipmentId}
              onChange={(value) => updateReportFilter('equipmentId', value)}
              options={[
                { value: 'all', label: 'Todos equipamentos' },
                ...viewModel.filterOptions.equipments.map((equipment) => ({
                  value: equipment.id,
                  label: equipment.label,
                })),
              ]}
            />
            <FilterSelect
              icon={faChartSimple}
              label="Status"
              name="service-report-status-filter"
              value={viewModel.activeFilters.status}
              onChange={(value) =>
                updateReportFilter('status', value as BuildServicesReportsFilters['status'])
              }
              options={[
                { value: 'all', label: 'Todos os status' },
                { value: 'pronto', label: 'Pronto' },
                { value: 'atencao', label: 'Atenção' },
                { value: 'pendente', label: 'Pendente' },
              ]}
            />
            <button
              type="button"
              className={`tw-inline-flex tw-h-10 tw-items-center tw-gap-2 tw-rounded-xl tw-border-0 tw-bg-[#2563EB] tw-px-4 tw-text-sm tw-font-bold tw-text-white ${appV2Tone.focus}`}
            >
              <FontAwesomeIcon icon={faSlidersH} aria-hidden="true" />
              Aplicar filtros
            </button>
          </div>
        </SectionCard>
      </div>

      <div className="tw-grid tw-gap-6 lg:tw-grid-cols-[260px_minmax(0,1fr)] 2xl:tw-grid-cols-[260px_minmax(0,1fr)_340px]">
        <aside className="tw-grid tw-h-fit tw-gap-4">
          <ReportsSummaryCard viewModel={viewModel} />
          <IndicatorsCard viewModel={viewModel} />
        </aside>

        <div>
          {viewModel.items.length > 0 ? (
            <ServiceReportsList
              items={viewModel.items}
              selectedReportId={previewItem?.id ?? null}
              onOpenReport={setSelectedRecordId}
              onSelectReport={setPreviewRecordId}
            />
          ) : (
            <SectionCard>
              <h2 className={`tw-m-0 tw-text-xl tw-font-bold ${appV2Tone.text}`}>
                {viewModel.emptyState.title}
              </h2>
              <p className={`tw-m-0 tw-mt-2 tw-text-sm tw-leading-6 ${appV2Tone.mutedText}`}>
                {viewModel.emptyState.description}
              </p>
            </SectionCard>
          )}
        </div>

        {previewItem ? (
          <ReportPreviewAside item={previewItem} onOpenReport={setSelectedRecordId} />
        ) : null}
      </div>
    </PageShell>
  );
}

function FilterSelect({
  icon,
  label,
  name,
  value,
  onChange,
  options,
}: {
  icon: IconDefinition;
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="tw-flex tw-min-w-[140px] tw-flex-1 tw-flex-col tw-gap-1">
      <span className="tw-text-[0.65rem] tw-font-bold tw-uppercase tw-tracking-[0.04em] tw-text-[#1E4F8A]">
        {label}
      </span>
      <span className="tw-relative tw-inline-flex tw-w-full tw-items-center">
        <FontAwesomeIcon
          icon={icon}
          className="tw-pointer-events-none tw-absolute tw-left-3 tw-z-10 tw-text-[0.7rem] tw-text-[#8BA0BC]"
          aria-hidden="true"
        />
        <select
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`tw-h-10 tw-w-full tw-appearance-none tw-rounded-xl tw-border tw-bg-[#F8FAFD] tw-py-2 tw-pl-9 tw-pr-9 tw-text-sm tw-font-medium tw-text-[#071A33] ${appV2Tone.border} ${appV2Tone.focus}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FontAwesomeIcon
          icon={faChevronDown}
          className="tw-pointer-events-none tw-absolute tw-right-3 tw-text-[0.62rem] tw-text-[#52677F]"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}

function ReportsSummaryCard({
  viewModel,
}: {
  viewModel: ReturnType<typeof buildServicesReportsViewModel>;
}) {
  return (
    <SectionCard padding="sm">
      <h2 className="tw-m-0 tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-bold tw-uppercase tw-text-[#1E4F8A]">
        <FontAwesomeIcon icon={faChartSimple} aria-hidden="true" />
        Resumo local
      </h2>
      <div className="tw-mt-3 tw-grid tw-gap-2">
        <SummaryRow label="Relatórios" value={viewModel.summary.totalReports} />
        <SummaryRow
          label="Prontos"
          value={viewModel.summary.readyReports}
          className="tw-text-[#16A34A]"
        />
        <SummaryRow
          label="Atenção"
          value={viewModel.summary.attentionReports}
          className="tw-text-[#D97706]"
        />
        <SummaryRow
          label="Pendentes"
          value={viewModel.summary.pendingReports}
          className="tw-text-[#DC2626]"
        />
      </div>
    </SectionCard>
  );
}

function IndicatorsCard({
  viewModel,
}: {
  viewModel: ReturnType<typeof buildServicesReportsViewModel>;
}) {
  const totalCompleted = viewModel.summary.totalReports;
  const readyRatio =
    totalCompleted > 0 ? Math.round((viewModel.summary.readyReports / totalCompleted) * 100) : 0;

  return (
    <SectionCard padding="sm">
      <h2 className="tw-m-0 tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-bold tw-uppercase tw-text-[#1E4F8A]">
        <FontAwesomeIcon icon={faChartLine} aria-hidden="true" />
        Indicadores
      </h2>
      <div className="tw-mt-3 tw-grid tw-gap-3">
        <div className="tw-rounded-xl tw-bg-[#EFF6FF] tw-p-3 tw-text-center">
          <p className={`tw-m-0 tw-text-2xl tw-font-extrabold ${appV2Tone.text}`}>
            {totalCompleted}
          </p>
          <p className={`tw-m-0 tw-text-xs tw-font-medium ${appV2Tone.mutedText}`}>
            registros concluídos
          </p>
        </div>
        <div className="tw-rounded-xl tw-bg-[#F0FDF4] tw-p-3 tw-text-center">
          <p className="tw-m-0 tw-text-2xl tw-font-extrabold tw-text-[#16A34A]">{readyRatio}%</p>
          <p className={`tw-m-0 tw-text-xs tw-font-medium ${appV2Tone.mutedText}`}>
            prontos para consulta
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

function SummaryRow({
  label,
  value,
  className = '',
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div className="tw-flex tw-items-center tw-justify-between tw-border-b tw-border-[#EDF2F7] tw-pb-2 last:tw-border-b-0 last:tw-pb-0">
      <span className={`tw-text-sm ${appV2Tone.mutedText}`}>{label}</span>
      <span className={`tw-text-lg tw-font-bold ${className || appV2Tone.text}`}>{value}</span>
    </div>
  );
}

function ReportPreviewAside({
  item,
  onOpenReport,
}: {
  item: ServicesReportListItemViewModel;
  onOpenReport: (reportId: string) => void;
}) {
  return (
    <aside className="tw-h-fit 2xl:tw-sticky 2xl:tw-top-6">
      <SectionCard className="tw-p-5">
        <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
          <h2 className="tw-m-0 tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-bold tw-uppercase tw-text-[#1E4F8A]">
            <FontAwesomeIcon icon={faEye} aria-hidden="true" />
            Preview
          </h2>
          <span className={`tw-text-xs ${appV2Tone.subtleText}`}>{item.reportId}</span>
        </div>
        <h3 className={`tw-m-0 tw-mt-4 tw-text-base tw-font-bold ${appV2Tone.text}`}>
          {item.equipmentName}
        </h3>
        <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-leading-5 ${appV2Tone.mutedText}`}>
          {item.customerName} · {item.kindLabel} · {item.dateLabel}
        </p>
        <div className="tw-mt-4 tw-grid tw-gap-2 tw-rounded-xl tw-bg-[#F8FAFE] tw-p-3 tw-text-sm tw-leading-5">
          <PreviewLine label="Diagnóstico" value={item.diagnosisText} />
          <PreviewLine label="Ações" value={item.actionsText} />
          <PreviewLine label="Peças usadas" value={item.partsUsed ?? 'Sem peças informadas'} />
          <PreviewLine label="Status final" value={item.statusLabel} />
        </div>
        <div className="tw-mt-4 tw-grid tw-gap-2 sm:tw-grid-cols-2 2xl:tw-grid-cols-1">
          <button
            type="button"
            className={`tw-inline-flex tw-min-h-10 tw-items-center tw-justify-center tw-gap-2 tw-rounded-xl tw-border tw-border-[#CBD5E1] tw-bg-white tw-px-4 tw-text-sm tw-font-bold tw-text-[#1E4F8A] ${appV2Tone.focus}`}
            onClick={() => onOpenReport(item.id)}
          >
            <FontAwesomeIcon icon={faEye} aria-hidden="true" />
            Visualizar local
          </button>
          <button
            type="button"
            disabled
            className="tw-inline-flex tw-min-h-10 tw-cursor-not-allowed tw-items-center tw-justify-center tw-gap-2 tw-rounded-xl tw-border tw-border-[#CBD5E1] tw-bg-[#F8FAFD] tw-px-4 tw-text-sm tw-font-bold tw-text-[#8BA0BC]"
          >
            <FontAwesomeIcon icon={faFileAlt} aria-hidden="true" />
            Exportação em etapa própria
          </button>
        </div>
      </SectionCard>
    </aside>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="tw-m-0">
      <span className="tw-font-bold">{label}:</span> {value}
    </p>
  );
}
