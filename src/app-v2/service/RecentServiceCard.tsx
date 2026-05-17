import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faMicrophoneAlt } from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import { ServiceOutputPill } from './ServiceOutputPill';
import type { RecentServiceViewModel } from './servicesHomeViewModel';

interface RecentServiceCardProps {
  service: RecentServiceViewModel;
  onEditService?: (serviceId: string) => void;
}

export function RecentServiceCard({ service, onEditService }: RecentServiceCardProps) {
  return (
    <article
      className={`tw-rounded-[18px] tw-border tw-border-[#EDF2F7] tw-bg-white tw-p-4 ${appV2Tone.text}`}
    >
      <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
        <div className="tw-min-w-0">
          <p
            className={`tw-m-0 tw-inline-flex tw-rounded-full tw-bg-[#EFF6FF] tw-px-2.5 tw-py-1 tw-text-[0.7rem] tw-font-bold tw-uppercase ${appV2Tone.actionSoft}`}
          >
            {service.kindLabel} &middot; {service.dateLabel}
          </p>
        </div>
        <span className="tw-shrink-0 tw-text-xs tw-font-medium tw-text-[#52677F]">
          {service.relativeDateLabel}
        </span>
      </div>

      <h3 className={`tw-m-0 tw-mt-3 tw-text-base tw-font-bold tw-leading-tight ${appV2Tone.text}`}>
        {service.equipmentName}
      </h3>
      <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-medium ${appV2Tone.mutedText}`}>
        {service.customerLine}
      </p>
      <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-semibold ${appV2Tone.subtleText}`}>
        Técnico: {service.technician}
      </p>

      <p
        className={`tw-m-0 tw-mt-3 tw-rounded-xl tw-bg-[#F8FAFE] tw-p-3 tw-text-xs tw-font-medium tw-leading-5 ${appV2Tone.text}`}
      >
        <FontAwesomeIcon icon={faMicrophoneAlt} className="tw-mr-2 tw-text-[#8BA0BC]" />
        {service.summary}
      </p>

      {service.partsUsed ||
      service.partsCost ||
      service.laborCost ||
      service.nextMaintenanceLabel ? (
        <div
          className={`tw-mt-3 tw-grid tw-gap-1 tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-p-3 tw-text-xs tw-font-semibold ${appV2Tone.border} ${appV2Tone.mutedText}`}
        >
          {service.partsUsed ? <span>Peças usadas: {service.partsUsed}</span> : null}
          {service.partsCost ? <span>Custo de peças: {service.partsCost}</span> : null}
          {service.laborCost ? <span>Custo de mão de obra: {service.laborCost}</span> : null}
          {service.nextMaintenanceLabel ? (
            <span>Próxima manutenção: {service.nextMaintenanceLabel}</span>
          ) : null}
        </div>
      ) : null}

      <div className="tw-mt-4 tw-flex tw-flex-wrap tw-gap-3">
        <ServiceOutputPill status={service.outputStatus} />
        {onEditService ? (
          <button
            type="button"
            className="tw-inline-flex tw-min-h-8 tw-items-center tw-gap-1.5 tw-rounded-lg tw-border tw-border-[#CBD5E1] tw-bg-white tw-px-3 tw-text-[0.65rem] tw-font-semibold tw-text-[#1E4F8A]"
            onClick={() => onEditService(service.id)}
          >
            <FontAwesomeIcon icon={faEdit} aria-hidden="true" />
            Editar
          </button>
        ) : null}
      </div>
    </article>
  );
}
