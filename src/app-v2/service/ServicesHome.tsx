import { useState } from 'react';

import { appV2Tone } from '../styles/tokens';
import { ActionButton, PageShell, SectionCard, StatusBadge } from '../ui/primitives';
import { RecentServiceCard } from './RecentServiceCard';
import { ServiceInProgressCard } from './ServiceInProgressCard';
import { ServiceReportsHome } from './ServiceReportsHome';
import type { ServiceDraft } from './serviceFlowViewModel';
import { buildServicesHomeViewModel, type BuildServicesHomeInput } from './servicesHomeViewModel';
import { ServicesSubViewNav, type ServicesSubView } from './ServicesSubViewNav';

interface ServicesHomeProps {
  draft: ServiceDraft | null;
  input: BuildServicesHomeInput;
  onResumeService: () => void;
  onStartService: () => void;
  onEditService?: (serviceId: string) => void;
}

export function ServicesHome({
  draft,
  input,
  onResumeService,
  onStartService,
  onEditService,
}: ServicesHomeProps) {
  const [activeView, setActiveView] = useState<ServicesSubView>('registros');
  const viewModel = buildServicesHomeViewModel(input, draft);

  if (activeView === 'relatorios') {
    return (
      <ServiceReportsHome
        activeView={activeView}
        input={input}
        onPrintReport={() => window.print()}
        onSelectView={setActiveView}
      />
    );
  }

  return (
    <PageShell>
      <ServicesSubViewNav activeView={activeView} onSelectView={setActiveView} />

      <header className="tw-grid tw-gap-5 lg:tw-grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] lg:tw-items-end">
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
        <SectionCard padding="sm">
          <span className={`tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
            Registros recentes
          </span>
          <span className={`tw-mt-1 tw-block tw-text-2xl tw-font-bold ${appV2Tone.text}`}>
            {viewModel.recentServices.length}
          </span>
        </SectionCard>
      </header>

      {viewModel.inProgress ? (
        <ServiceInProgressCard service={viewModel.inProgress} onResumeService={onResumeService} />
      ) : (
        <EmptyServicesCard
          title={viewModel.emptyState.title}
          description={viewModel.emptyState.description}
          actionLabel={viewModel.emptyState.actionLabel}
          onStartService={onStartService}
        />
      )}

      <SectionCard className="sm:tw-p-5" labelledBy="recent-services-title" padding="sm">
        <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
          <div>
            <p
              className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
            >
              Registros
            </p>
            <h2
              id="recent-services-title"
              className={`tw-m-0 tw-mt-1 tw-text-lg tw-font-semibold ${appV2Tone.text}`}
            >
              Recentes
            </h2>
          </div>
          <StatusBadge>{viewModel.recentServices.length}</StatusBadge>
        </div>

        {viewModel.recentServices.length > 0 ? (
          <div className="tw-mt-4 tw-grid tw-gap-3">
            {viewModel.recentServices.map((service) => (
              <RecentServiceCard key={service.id} service={service} onEditService={onEditService} />
            ))}
          </div>
        ) : (
          <p
            className={`tw-m-0 tw-mt-4 tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium ${appV2Tone.border} ${appV2Tone.mutedText}`}
          >
            Registros recentes aparecerão aqui depois do primeiro atendimento.
          </p>
        )}
      </SectionCard>
    </PageShell>
  );
}

function EmptyServicesCard({
  title,
  description,
  actionLabel,
  onStartService,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onStartService: () => void;
}) {
  return (
    <SectionCard>
      <p
        className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
      >
        Sem andamento
      </p>
      <h2 className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-tight ${appV2Tone.text}`}>
        {title}
      </h2>
      <p className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-normal tw-leading-6 ${appV2Tone.mutedText}`}>
        {description}
      </p>
      <ActionButton onClick={onStartService} className="tw-mt-5 tw-w-full sm:tw-w-auto">
        {actionLabel}
      </ActionButton>
    </SectionCard>
  );
}
