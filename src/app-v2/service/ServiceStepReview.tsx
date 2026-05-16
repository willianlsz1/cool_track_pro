import {
  ServiceActions,
  ServiceInfoBlock,
  ServiceStatusBadge,
  ServiceStepCard,
} from './ServiceFlowPrimitives';
import type { ServiceReviewViewModel } from './serviceFlowViewModel';

interface ServiceStepReviewProps {
  review: ServiceReviewViewModel;
  onBack: () => void;
  onComplete: () => void;
}

export function ServiceStepReview({ review, onBack, onComplete }: ServiceStepReviewProps) {
  return (
    <ServiceStepCard
      eyebrow="Etapa 4"
      title={review.title}
      description="Confira as informacoes antes de concluir o servico."
    >
      <div className="tw-grid tw-gap-5 lg:tw-grid-cols-2">
        <ServiceInfoBlock label="Equipamento" value={review.equipmentName} />
        <ServiceInfoBlock label="Cliente/local" value={review.customerLine} />
        <ServiceInfoBlock label="Tipo" value={review.kindLabel} />
        <ServiceInfoBlock label="Tecnico" value={review.technician} />
        <div>
          <p className="tw-m-0 tw-mb-2 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] tw-text-[#7A8AA6]">
            Status final
          </p>
          <ServiceStatusBadge tone={review.finalStatusTone}>
            {review.finalStatusLabel}
          </ServiceStatusBadge>
        </div>
        <ServiceInfoBlock label="Diagnostico" value={review.diagnosis} />
        <ServiceInfoBlock label="Acoes" value={review.actionsDone} />
        <ServiceInfoBlock label="Pecas usadas" value={review.partsUsed} />
        <ServiceInfoBlock label="Custo de pecas" value={review.partsCost} />
        <ServiceInfoBlock label="Custo de mao de obra" value={review.laborCost} />
      </div>

      <ServiceActions
        primaryLabel="Concluir servico"
        onPrimary={onComplete}
        secondaryLabel="Voltar"
        onSecondary={onBack}
      />
    </ServiceStepCard>
  );
}
