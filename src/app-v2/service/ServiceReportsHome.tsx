import { useMemo, useState } from 'react';

import { appV2Tone } from '../styles/tokens';
import { ActionButton, PageShell, SectionCard } from '../ui/primitives';
import { ServiceReportPreview } from './ServiceReportPreview';
import { ServiceReportsKpis } from './ServiceReportsKpis';
import { ServiceReportsList } from './ServiceReportsList';
import { buildServiceReportViewModelFromRecord } from './serviceReportViewModel';
import { buildServicesReportsViewModel } from './servicesReportsViewModel';
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
  const [query, setQuery] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const viewModel = useMemo(() => buildServicesReportsViewModel(input, query), [input, query]);
  const selectedRecord = selectedRecordId
    ? input.registros.find((registro) => registro.id === selectedRecordId)
    : undefined;
  const report = selectedRecord
    ? buildServiceReportViewModelFromRecord(input, selectedRecord)
    : undefined;

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
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={viewModel.searchPlaceholder}
            className={`tw-box-border tw-h-12 tw-w-full tw-rounded-2xl tw-border tw-bg-white tw-px-4 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
          />
        </label>
      </header>

      <ServiceReportsKpis kpis={viewModel.kpis} />

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
