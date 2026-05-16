import { useMemo, useState } from 'react';

import { appV2Tone } from '../styles/tokens';
import { ActionButton, PageShell, SectionCard } from '../ui/primitives';
import { ServiceReportPreview } from './ServiceReportPreview';
import { ServiceReportsKpis } from './ServiceReportsKpis';
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
              Servicos &gt; Relatorios
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
            Voltar para relatorios
          </ActionButton>
        </SectionCard>

        <ServiceReportPreview report={report} onPrint={onPrintReport} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ServicesSubViewNav activeView={activeView} onSelectView={onSelectView} />

      <header className="tw-grid tw-gap-4 lg:tw-grid-cols-[minmax(0,1fr)_minmax(300px,0.42fr)] lg:tw-items-end">
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
            {viewModel.subtitle}
          </p>
          <h1
            className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-none sm:tw-text-[2rem] ${appV2Tone.text}`}
          >
            {viewModel.title}
          </h1>
          <p className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}>
            {viewModel.description}
          </p>
        </div>
        <label className="tw-block">
          <span className="tw-sr-only">Buscar relatorios</span>
          <input
            aria-label="Buscar relatorios"
            value={viewModel.activeFilters.query}
            onChange={(event) => updateReportFilter('query', event.target.value)}
            placeholder={viewModel.searchPlaceholder}
            className={`tw-box-border tw-h-12 tw-w-full tw-rounded-2xl tw-border tw-bg-white tw-px-4 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
          />
        </label>
      </header>

      <div className="tw-grid tw-gap-3 md:tw-grid-cols-3">
        <FilterSelect
          label="Periodo"
          name="service-report-period-filter"
          value={viewModel.activeFilters.period}
          onChange={(value) =>
            updateReportFilter('period', value as BuildServicesReportsFilters['period'])
          }
          options={[
            { value: 'all', label: 'Todo periodo' },
            { value: 'last_7_days', label: 'Ultimos 7 dias' },
            { value: 'current_month', label: 'Mes atual' },
          ]}
        />
        <FilterSelect
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

      <ServiceReportsKpis kpis={viewModel.kpis} />

      <div data-testid="service-report-summary">
        <SectionCard>
          <p
            className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            Consolidado local
          </p>
          <h2 className={`tw-m-0 tw-mt-1 tw-text-lg tw-font-semibold ${appV2Tone.text}`}>
            {viewModel.summary.title}
          </h2>
          <div className="tw-mt-4 tw-grid tw-gap-3 sm:tw-grid-cols-2 lg:tw-grid-cols-6">
            <SummaryMetric label="Relatorios" value={viewModel.summary.totalReports} />
            <SummaryMetric label="Prontos" value={viewModel.summary.readyReports} />
            <SummaryMetric label="Atencao" value={viewModel.summary.attentionReports} />
            <SummaryMetric label="Pendentes" value={viewModel.summary.pendingReports} />
            <SummaryMetric label="Pecas" value={viewModel.summary.partsCostTotal} />
            <SummaryMetric label="Mao de obra" value={viewModel.summary.laborCostTotal} />
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
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="tw-block">
      <span
        className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
      >
        {label}
      </span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`tw-mt-2 tw-min-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className={`tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-p-3 ${appV2Tone.border}`}>
      <p
        className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.12em] ${appV2Tone.subtleText}`}
      >
        {label}
      </p>
      <p className={`tw-m-0 tw-mt-2 tw-text-base tw-font-bold ${appV2Tone.text}`}>{value}</p>
    </div>
  );
}
