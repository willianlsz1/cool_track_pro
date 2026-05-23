import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import { ActionButton, SectionCard, SectionEyebrow } from '../ui/primitives';
import type { ServiceInProgressViewModel } from './servicesHomeViewModel';

interface ServiceInProgressCardProps {
  service: ServiceInProgressViewModel;
  onResumeService: () => void;
}

export function ServiceInProgressCard({ service, onResumeService }: ServiceInProgressCardProps) {
  return (
    <SectionCard className="tw-relative tw-overflow-hidden tw-border-l-4 tw-border-l-[#2563EB] sm:tw-p-6">
      <div className="tw-grid tw-gap-5 lg:tw-grid-cols-[minmax(0,1fr)_minmax(220px,0.28fr)] lg:tw-items-end">
        <div className="tw-min-w-0">
          <SectionEyebrow>Em andamento</SectionEyebrow>
          <h2
            className={`tw-m-0 tw-mt-2 tw-text-xl tw-font-bold tw-leading-tight ${appV2Tone.text}`}
          >
            {service.equipmentName}
          </h2>
          <p className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
            {service.customerLine}
          </p>
        </div>

        <ActionButton onClick={onResumeService} className="tw-min-h-10 tw-w-full tw-px-5 tw-py-2">
          <FontAwesomeIcon icon={faPlay} aria-hidden="true" />
          <span className="tw-ml-2">{service.actionLabel}</span>
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
