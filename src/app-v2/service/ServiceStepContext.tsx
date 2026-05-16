import type { ServiceContextViewModel } from './serviceFlowViewModel';
import {
  ServiceActions,
  ServiceInfoBlock,
  ServiceStatusBadge,
  ServiceStepCard,
} from './ServiceFlowPrimitives';

interface ServiceStepContextProps {
  context: ServiceContextViewModel;
  onCancel: () => void;
  onContinue: () => void;
}

export function ServiceStepContext({ context, onCancel, onContinue }: ServiceStepContextProps) {
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
        </div>

        <div className="tw-grid tw-gap-4">
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
