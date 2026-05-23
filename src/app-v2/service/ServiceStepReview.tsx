import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import { ActionButton, SectionCard } from '../ui/primitives';
import type { ServiceReviewViewModel } from './serviceFlowViewModel';

interface ServiceStepReviewProps {
  review: ServiceReviewViewModel;
  errorMessage?: string | null;
  onBack: () => void;
  onComplete: () => void;
}

export function ServiceStepReview({
  review,
  errorMessage,
  onBack,
  onComplete,
}: ServiceStepReviewProps) {
  return (
    <SectionCard className="tw-rounded-[20px] tw-border-[#E2E8F0] tw-bg-white tw-p-6 tw-shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <h1 className="tw-m-0 tw-text-base tw-font-bold tw-leading-tight tw-text-[#071A33]">
        Etapa 4 · {review.title}
      </h1>
      <p className="tw-m-0 tw-mt-2 tw-text-xs tw-font-normal tw-leading-5 tw-text-[#52677F]">
        Confira as informações antes de concluir o serviço.
      </p>

      <div className="tw-mt-6 tw-grid tw-gap-4 lg:tw-grid-cols-2 lg:tw-gap-x-6">
        <ReviewItem label="Equipamento" value={review.equipmentName} />
        <ReviewItem label="Data" value={review.serviceDateLabel} />
        <ReviewItem label="Técnico" value={review.technician} />
        <ReviewItem label="Cliente/local" value={review.customerLine} />
        <ReviewItem label="Tipo" value={review.kindLabel} />
        <ReviewItem label="Status final" value={review.finalStatusLabel} />
        <ReviewItem label="Diagnóstico" value={review.diagnosis} fullWidth />
        <ReviewItem label="Ações" value={review.actionsDone} fullWidth />
        <ReviewItem label="Peças usadas" value={review.partsUsed} />
        <ReviewItem label="Custo de peças" value={review.partsCost} />
        <ReviewItem label="Custo de mão de obra" value={review.laborCost} />
        <ReviewItem label="Próxima manutenção" value={review.nextMaintenanceLabel} />
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="tw-m-0 tw-mt-5 tw-rounded-xl tw-border tw-border-[#FCA5A5] tw-bg-[#FEF2F2] tw-px-4 tw-py-3 tw-text-sm tw-font-semibold tw-leading-6 tw-text-[#B91C1C]"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="tw-mt-6 tw-flex tw-flex-wrap tw-justify-end tw-gap-4 tw-border-t tw-border-[#EDF2F7] tw-pt-5">
        <ActionButton variant="secondary" onClick={onBack}>
          Voltar
        </ActionButton>
        <ActionButton onClick={onComplete}>
          Concluir serviço
          <FontAwesomeIcon icon={faCheck} className="tw-h-3 tw-w-3" aria-hidden="true" />
        </ActionButton>
      </div>
    </SectionCard>
  );
}

function ReviewItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  const empty = isEmptyReviewValue(value);

  return (
    <div
      className={`tw-flex tw-flex-col tw-gap-1 tw-rounded-[14px] tw-border tw-border-[#EDF2F7] tw-bg-[#F8FAFE] tw-px-4 tw-py-3 ${
        fullWidth ? 'lg:tw-col-span-2' : ''
      }`}
    >
      <span className="tw-text-[0.65rem] tw-font-bold tw-uppercase tw-text-[#1E4F8A]">{label}</span>
      <span
        className={`tw-break-words tw-text-sm tw-font-semibold tw-leading-5 ${
          empty ? 'tw-italic tw-text-[#8BA0BC]' : 'tw-text-[#071A33]'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function isEmptyReviewValue(value: string): boolean {
  return [
    'Técnico não informado',
    'Diagnóstico não informado',
    'Ações executadas não informadas',
    'Sem peças informadas',
    'Não informado',
    'Não informada',
  ].includes(value);
}
