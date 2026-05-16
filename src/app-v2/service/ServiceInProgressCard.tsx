import { appV2Tone } from '../styles/tokens';
import { ActionButton, SectionCard } from '../ui/primitives';
import type { ServiceInProgressViewModel } from './servicesHomeViewModel';

interface ServiceInProgressCardProps {
  service: ServiceInProgressViewModel;
  onResumeService: () => void;
}

export function ServiceInProgressCard({ service, onResumeService }: ServiceInProgressCardProps) {
  return (
    <SectionCard className="tw-relative tw-overflow-hidden sm:tw-p-6">
      <span
        className="tw-absolute tw-inset-y-0 tw-left-0 tw-w-1 tw-bg-[#2563EB]"
        aria-hidden="true"
      />
      <div className="tw-grid tw-gap-5 lg:tw-grid-cols-[minmax(0,1fr)_minmax(260px,0.34fr)] lg:tw-items-end">
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] tw-text-[#2563EB]">
            Em andamento
          </p>
          <h2
            className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-tight ${appV2Tone.text}`}
          >
            {service.equipmentName}
          </h2>
          <p className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
            {service.customerLine}
          </p>
        </div>

        <ActionButton onClick={onResumeService} className="tw-w-full">
          {service.actionLabel}
        </ActionButton>
      </div>

      <div
        className={`tw-mt-5 tw-grid tw-gap-3 tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-p-4 sm:tw-grid-cols-2 ${appV2Tone.border}`}
      >
        <Info label="Tipo" value={service.kindLabel} />
        <Info label="Status" value={service.progressLabel} />
      </div>
    </SectionCard>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="tw-min-w-0">
      <p
        className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
      >
        {label}
      </p>
      <p className={`tw-m-0 tw-mt-1 tw-truncate tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
        {value}
      </p>
    </div>
  );
}
