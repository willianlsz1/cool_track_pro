import type { ServiceContextViewModel } from './serviceFlowViewModel';
import { ActionButton } from '../ui/primitives';
import {
  ServiceActions,
  ServiceInfoBlock,
  ServiceStatusBadge,
  ServiceStepCard,
} from './ServiceFlowPrimitives';

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
    <ServiceStepCard
      eyebrow="Etapa 1"
      title={context.title}
      description="Confirme o equipamento, cliente e motivo do atendimento antes de iniciar o registro."
    >
      <div className="tw-grid tw-gap-5 lg:tw-grid-cols-[minmax(0,1fr)_minmax(260px,0.56fr)]">
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] tw-text-[#2563EB]">
            Equipamento
          </p>
          <p className="tw-m-0 tw-mt-2 tw-text-xl tw-font-bold tw-leading-tight tw-text-[#061635]">
            {context.equipmentName}
          </p>
          <p className="tw-m-0 tw-mt-2 tw-text-sm tw-font-medium tw-leading-6 tw-text-[#31476A]">
            {context.equipmentLine}
          </p>
          {onChangeEquipment ? (
            <ActionButton
              variant="secondary"
              className="tw-mt-4 tw-min-h-10 tw-px-4 tw-py-2"
              onClick={onChangeEquipment}
            >
              Alterar equipamento
            </ActionButton>
          ) : null}
        </div>

        <div className="tw-grid tw-gap-4">
          {onServiceDateChange ? (
            <label className="tw-grid tw-gap-2">
              <span className="tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] tw-text-[#7A8AA6]">
                Data do registro
              </span>
              <input
                type="date"
                name="service-date"
                value={serviceDate ?? ''}
                onChange={(event) => onServiceDateChange(event.target.value)}
                className="tw-w-full tw-rounded-2xl tw-border tw-border-[#D7E3F2] tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium tw-leading-6 tw-text-[#061635] focus:tw-border-[#38BDF8] focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-[#BAE6FD]"
              />
            </label>
          ) : null}
          <ServiceInfoBlock label="Cliente/local" value={context.customerLine} />
          <ServiceInfoBlock label="Motivo" value={context.reason} />
          <div>
            <p className="tw-m-0 tw-mb-2 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] tw-text-[#7A8AA6]">
              Status atual
            </p>
            <ServiceStatusBadge tone={context.statusTone}>{context.statusLabel}</ServiceStatusBadge>
          </div>
        </div>
      </div>

      <ServiceActions
        primaryLabel="Continuar"
        onPrimary={onContinue}
        secondaryLabel="Voltar para Serviços"
        onSecondary={onCancel}
      />
    </ServiceStepCard>
  );
}
