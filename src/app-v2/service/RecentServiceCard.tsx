import { appV2Tone } from '../styles/tokens';
import { StatusBadge } from '../ui/primitives';
import { ServiceOutputPill } from './ServiceOutputPill';
import type { RecentServiceViewModel, ServiceHomeTone } from './servicesHomeViewModel';

interface RecentServiceCardProps {
  service: RecentServiceViewModel;
}

const accentClasses: Record<ServiceHomeTone, string> = {
  danger: 'tw-bg-[#DC2626]',
  warning: 'tw-bg-[#D97706]',
  success: 'tw-bg-[#16A34A]',
  primary: 'tw-bg-[#2563EB]',
  muted: 'tw-bg-[#94A3B8]',
};

export function RecentServiceCard({ service }: RecentServiceCardProps) {
  return (
    <article
      className={`tw-relative tw-overflow-hidden tw-rounded-xl tw-border tw-bg-white tw-p-4 tw-shadow-[0_18px_44px_-38px_rgba(15,23,42,0.45)] ${appV2Tone.border}`}
    >
      <span
        className={`tw-absolute tw-inset-y-0 tw-left-0 tw-w-1 ${accentClasses[service.statusTone]}`}
        aria-hidden="true"
      />
      <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
        <div className="tw-min-w-0">
          <p
            className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            {service.kindLabel} - {service.dateLabel}
          </p>
          <h3
            className={`tw-m-0 tw-mt-1 tw-truncate tw-text-base tw-font-bold tw-leading-tight ${appV2Tone.text}`}
          >
            {service.equipmentName}
          </h3>
          <p
            className={`tw-m-0 tw-mt-1 tw-truncate tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}
          >
            {service.customerLine}
          </p>
          <p
            className={`tw-m-0 tw-mt-1 tw-truncate tw-text-xs tw-font-semibold ${appV2Tone.subtleText}`}
          >
            Tecnico: {service.technician}
          </p>
        </div>
        <StatusBadge tone={service.statusTone} className="tw-shrink-0 tw-border">
          {service.statusLabel}
        </StatusBadge>
      </div>

      <p className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-normal tw-leading-6 ${appV2Tone.text}`}>
        {service.summary}
      </p>

      {service.partsUsed ||
      service.partsCost ||
      service.laborCost ||
      service.nextMaintenanceLabel ? (
        <div
          className={`tw-mt-3 tw-grid tw-gap-1 tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-p-3 tw-text-xs tw-font-semibold ${appV2Tone.border} ${appV2Tone.mutedText}`}
        >
          {service.partsUsed ? <span>Pecas usadas: {service.partsUsed}</span> : null}
          {service.partsCost ? <span>Custo de pecas: {service.partsCost}</span> : null}
          {service.laborCost ? <span>Custo de mao de obra: {service.laborCost}</span> : null}
          {service.nextMaintenanceLabel ? (
            <span>Proxima manutencao: {service.nextMaintenanceLabel}</span>
          ) : null}
        </div>
      ) : null}

      <div className="tw-mt-4">
        <ServiceOutputPill status={service.outputStatus} />
      </div>
    </article>
  );
}
