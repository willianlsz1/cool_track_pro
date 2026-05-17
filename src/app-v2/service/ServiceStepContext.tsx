import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import type { ReactNode } from 'react';

import type { ServiceContextViewModel } from './serviceFlowViewModel';
import { ActionButton, SectionCard } from '../ui/primitives';
import { appV2Tone } from '../styles/tokens';
import { ServiceStatusBadge } from './ServiceFlowPrimitives';

interface ServiceStepContextProps {
  context: ServiceContextViewModel;
  serviceDate?: string;
  onCancel: () => void;
  onChangeEquipment?: () => void;
  onServiceDateChange?: (serviceDate: string) => void;
  onContinue: () => void;
}

export function ServiceStepContext({
  context,
  serviceDate,
  onCancel,
  onChangeEquipment,
  onServiceDateChange,
  onContinue,
}: ServiceStepContextProps) {
  return (
    <SectionCard className="tw-rounded-[20px] tw-p-6">
      <h1 className={`tw-m-0 tw-text-base tw-font-bold ${appV2Tone.text}`}>
        Etapa 1 · {context.title}
      </h1>
      <p className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
        Confirme o equipamento, cliente e motivo do atendimento antes de iniciar o registro.
      </p>

      <div className="tw-mt-5 tw-grid tw-gap-5 lg:tw-grid-cols-2">
        <InfoField
          label="Equipamento"
          value={
            <>
              <span className="tw-block tw-font-bold">{context.equipmentName}</span>
              <span className={`tw-mt-1 tw-block tw-text-xs ${appV2Tone.subtleText}`}>
                {context.equipmentLine}
              </span>
              {onChangeEquipment ? (
                <button
                  type="button"
                  onClick={onChangeEquipment}
                  className="tw-mt-3 tw-inline-flex tw-rounded-lg tw-border tw-border-[#CBD5E1] tw-bg-transparent tw-px-3 tw-py-2 tw-text-xs tw-font-bold tw-text-[#1E4F8A]"
                >
                  Alterar equipamento
                </button>
              ) : null}
            </>
          }
        />

        <InfoField label="Cliente / Local" value={context.customerLine} />
        <InfoField label="Motivo" value={context.reason} />

        <div className="tw-flex tw-flex-col tw-gap-2">
          <span className="tw-text-[0.7rem] tw-font-bold tw-uppercase tw-text-[#1E4F8A]">
            Status atual
          </span>
          <div>
            <ServiceStatusBadge tone={context.statusTone}>{context.statusLabel}</ServiceStatusBadge>
          </div>
        </div>

        {onServiceDateChange ? (
          <label className="tw-flex tw-flex-col tw-gap-2">
            <span className="tw-text-[0.7rem] tw-font-bold tw-uppercase tw-text-[#1E4F8A]">
              Data do registro
            </span>
            <input
              type="date"
              name="service-date"
              value={serviceDate ?? ''}
              onChange={(event) => onServiceDateChange(event.target.value)}
              className="tw-w-full tw-rounded-xl tw-border tw-border-[#EDF2F7] tw-bg-[#F8FAFE] tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-[#071A33] focus:tw-border-[#38BDF8] focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-[#BAE6FD]"
            />
          </label>
        ) : null}
      </div>

      <div className="tw-mt-6 tw-flex tw-flex-col tw-justify-end tw-gap-3 tw-border-t tw-border-[#EDF2F7] tw-pt-5 sm:tw-flex-row">
        <ActionButton
          variant="secondary"
          onClick={onCancel}
          className="tw-min-h-10 tw-rounded-[10px] tw-px-5 tw-py-2 tw-text-xs"
        >
          Voltar para Serviços
        </ActionButton>
        <ActionButton
          onClick={onContinue}
          className="tw-min-h-10 tw-rounded-[10px] tw-px-6 tw-py-2 tw-text-xs"
        >
          <FontAwesomeIcon icon={faArrowRight} className="tw-h-3 tw-w-3" aria-hidden="true" />
          Continuar
        </ActionButton>
      </div>
    </SectionCard>
  );
}

function InfoField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="tw-flex tw-flex-col tw-gap-2">
      <span className="tw-text-[0.7rem] tw-font-bold tw-uppercase tw-text-[#1E4F8A]">{label}</span>
      <div className="tw-rounded-xl tw-border tw-border-[#EDF2F7] tw-bg-[#F8FAFE] tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-[#071A33]">
        {value}
      </div>
    </div>
  );
}
