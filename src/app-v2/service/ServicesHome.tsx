import { appV2Tone } from '../styles/tokens';
import { RecentServiceCard } from './RecentServiceCard';
import { ServiceInProgressCard } from './ServiceInProgressCard';
import type { ServiceDraft } from './serviceFlowViewModel';
import { buildServicesHomeViewModel, type BuildServicesHomeInput } from './servicesHomeViewModel';

interface ServicesHomeProps {
  draft: ServiceDraft | null;
  input: BuildServicesHomeInput;
  onResumeService: () => void;
  onStartService: () => void;
}

export function ServicesHome({ draft, input, onResumeService, onStartService }: ServicesHomeProps) {
  const viewModel = buildServicesHomeViewModel(input, draft);

  return (
    <main className="tw-mx-auto tw-flex tw-min-h-screen tw-w-full tw-max-w-[520px] tw-flex-col tw-px-4 tw-pb-36 tw-pt-5">
      <header className="tw-mb-5">
        <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
          {viewModel.subtitle}
        </p>
        <h1 className={`tw-mt-1 tw-text-3xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
          {viewModel.title}
        </h1>
        <p className={`tw-mt-2 tw-text-sm tw-font-semibold ${appV2Tone.mutedText}`}>
          {viewModel.description}
        </p>
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

      <section className="tw-mt-5" aria-labelledby="recent-services-title">
        <div className="tw-mb-3 tw-flex tw-items-center tw-justify-between tw-gap-3">
          <div>
            <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
              Registros
            </p>
            <h2 id="recent-services-title" className={`tw-text-xl tw-font-black ${appV2Tone.text}`}>
              Recentes
            </h2>
          </div>
          <span
            className={`tw-rounded-md tw-border tw-bg-white tw-px-2.5 tw-py-1 tw-text-xs tw-font-black ${appV2Tone.border} ${appV2Tone.mutedText}`}
          >
            {viewModel.recentServices.length}
          </span>
        </div>

        {viewModel.recentServices.length > 0 ? (
          <div className="tw-grid tw-gap-3">
            {viewModel.recentServices.map((service) => (
              <RecentServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <p
            className={`tw-rounded-lg tw-border tw-bg-white tw-p-4 tw-text-sm tw-font-bold ${appV2Tone.border} ${appV2Tone.mutedText}`}
          >
            Registros recentes aparecerão aqui depois do primeiro atendimento.
          </p>
        )}
      </section>
    </main>
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
    <section className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
      <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
        Sem andamento
      </p>
      <h2 className={`tw-mt-1 tw-text-2xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
        {title}
      </h2>
      <p className={`tw-mt-3 tw-text-sm tw-font-semibold tw-leading-6 ${appV2Tone.mutedText}`}>
        {description}
      </p>
      <button
        type="button"
        onClick={onStartService}
        className={`tw-mt-5 tw-min-h-12 tw-w-full tw-rounded-lg tw-border-0 tw-px-4 tw-py-3 tw-text-base tw-font-extrabold ${appV2Tone.action} ${appV2Tone.focus}`}
      >
        {actionLabel}
      </button>
    </section>
  );
}
