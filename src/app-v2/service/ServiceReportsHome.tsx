import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faCalendarAlt,
  faChevronDown,
  faMicrochip,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { appV2Tone } from '../styles/tokens';
import { ActionButton, PageShell, SectionCard } from '../ui/primitives';
import { ServiceReportPreview } from './ServiceReportPreview';
import { ServiceReportsList } from './ServiceReportsList';
import { buildServiceReportViewModelFromRecord } from './serviceReportViewModel';
import {
  buildServicesReportsViewModel,
  type BuildServicesReportsFilters,
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

  function updateReportFilter<Key extends keyof BuildServicesReportsFilters>(
    key: Key,
    value: BuildServicesReportsFilters[Key],
  ) {
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
            <p
              className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
            >
              Serviços &gt; Relatórios
            </p>
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
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-inline-flex tw-rounded-full tw-bg-[#EFF6FF] tw-px-3 tw-py-1 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.04em] tw-text-[#1E4F8A]">
            {viewModel.subtitle}
          </p>
          <h1
            className={`tw-m-0 tw-mt-3 tw-text-[1.8rem] tw-font-bold tw-leading-tight tw-tracking-[-0.01em] ${appV2Tone.text}`}
          >
            {viewModel.title}
          </h1>
          <p className={`tw-m-0 tw-mt-1.5 tw-text-[0.85rem] tw-font-normal ${appV2Tone.mutedText}`}>
            {viewModel.description}
          </p>
        </div>
        <label className="tw-sr-only">
          <span className="tw-sr-only">Buscar relatórios</span>
          <input
            aria-label="Buscar relatórios"
            value={viewModel.activeFilters.query}
            onChange={(event) => updateReportFilter('query', event.target.value)}
            placeholder={viewModel.searchPlaceholder}
            className={`tw-box-border tw-h-12 tw-w-full tw-rounded-2xl tw-border tw-bg-white tw-px-4 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
          />
        </label>
      </header>

      <div data-testid="service-report-summary">
        <SectionCard>
          <div className="tw-flex tw-flex-wrap tw-gap-4">
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
          </div>

          <div className="tw-my-4 tw-h-px tw-bg-[#EDF2F7]" />

          <div>
            <p
              className={`tw-m-0 tw-text-[0.8rem] tw-font-semibold tw-uppercase ${appV2Tone.text}`}
            >
              Consolidado local · {viewModel.summary.title}
            </p>
            <div className="tw-sr-only">
              {viewModel.kpis.map((kpi) => `${kpi.label} ${kpi.value}`).join(' ')}
            </div>
            <div className="tw-mt-3 tw-grid tw-gap-4 sm:tw-grid-cols-2 lg:tw-grid-cols-3 2xl:tw-grid-cols-6">
              <SummaryMetric label="Relatórios" value={viewModel.summary.totalReports} />
              <SummaryMetric label="Prontos" value={viewModel.summary.readyReports} />
              <SummaryMetric label="Atenção" value={viewModel.summary.attentionReports} />
              <SummaryMetric label="Pendentes" value={viewModel.summary.pendingReports} />
              <SummaryMetric label="Peças" value={viewModel.summary.partsCostTotal} />
              <SummaryMetric label="Mão de obra" value={viewModel.summary.laborCostTotal} />
            </div>
          </div>
        </SectionCard>
      </div>

      {viewModel.totalItems > 0 ? (
        <ServiceReportsList items={viewModel.items} onOpenReport={setSelectedRecordId} />
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
    <label className="tw-flex tw-min-w-[140px] tw-flex-col tw-gap-1">
      <span
        className={`tw-text-[0.65rem] tw-font-bold tw-uppercase tw-tracking-[0.04em] tw-text-[#1E4F8A]`}
      >
        {label}
      </span>
      <span className="tw-relative tw-inline-flex tw-w-fit tw-items-center">
        <FontAwesomeIcon
          icon={icon}
          className="tw-pointer-events-none tw-absolute tw-left-3 tw-z-10 tw-text-[0.7rem] tw-text-[#8BA0BC]"
        />
        <select
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`tw-min-h-9 tw-appearance-none tw-rounded-full tw-border tw-bg-[#F8FAFD] tw-py-2 tw-pl-9 tw-pr-9 tw-text-[0.75rem] tw-font-semibold tw-text-[#1E4F8A] ${appV2Tone.border} ${appV2Tone.focus}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FontAwesomeIcon
          icon={faChevronDown}
          className="tw-pointer-events-none tw-absolute tw-right-3 tw-text-[0.62rem] tw-text-[#8BA0BC]"
        />
      </span>
    </label>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="tw-rounded-2xl tw-bg-[#F8FAFE] tw-p-3 tw-text-center">
      <p className={`tw-m-0 tw-text-[1.6rem] tw-font-extrabold tw-leading-tight ${appV2Tone.text}`}>
        {value}
      </p>
      <p
        className={`tw-m-0 tw-mt-1 tw-text-[0.7rem] tw-font-medium tw-uppercase ${appV2Tone.mutedText}`}
      >
        {label}
      </p>
    </div>
  );
}
