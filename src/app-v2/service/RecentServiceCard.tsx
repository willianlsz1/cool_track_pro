import { appV2Tone } from '../styles/tokens';
import { ServiceOutputPill } from './ServiceOutputPill';
import type { RecentServiceViewModel, ServiceHomeTone } from './servicesHomeViewModel';

interface RecentServiceCardProps {
  service: RecentServiceViewModel;
}

const statusClasses: Record<ServiceHomeTone, string> = {
  danger: appV2Tone.danger,
  warning: appV2Tone.warning,
  success: appV2Tone.success,
  primary: appV2Tone.actionSoft,
  muted: `tw-bg-[#F8FAFC] tw-text-[#64748B] ${appV2Tone.border}`,
};

export function RecentServiceCard({ service }: RecentServiceCardProps) {
  return (
    <article className={`tw-rounded-lg tw-border tw-bg-white tw-p-4 ${appV2Tone.border}`}>
      <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
        <div className="tw-min-w-0">
          <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
            {service.kindLabel} - {service.dateLabel}
          </p>
          <h3 className={`tw-mt-1 tw-text-lg tw-font-black tw-leading-tight ${appV2Tone.text}`}>
            {service.equipmentName}
          </h3>
          <p className={`tw-mt-1 tw-text-sm tw-font-bold ${appV2Tone.mutedText}`}>
            {service.customerLine}
          </p>
        </div>
        <span
          className={`tw-shrink-0 tw-rounded-md tw-border tw-px-2 tw-py-1 tw-text-xs tw-font-black ${statusClasses[service.statusTone]}`}
        >
          {service.statusLabel}
        </span>
      </div>

      <p className={`tw-mt-3 tw-text-sm tw-font-semibold tw-leading-6 ${appV2Tone.text}`}>
        {service.summary}
      </p>

      <div className="tw-mt-4">
        <ServiceOutputPill status={service.outputStatus} />
      </div>
    </article>
  );
}
