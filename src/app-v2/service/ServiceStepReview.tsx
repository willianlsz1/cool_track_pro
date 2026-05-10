import type { ServiceReviewViewModel, ServiceTone } from './serviceFlowViewModel';
import { appV2Tone } from '../styles/tokens';

interface ServiceStepReviewProps {
  review: ServiceReviewViewModel;
  onBack: () => void;
  onComplete: () => void;
}

const toneClasses: Record<ServiceTone, string> = {
  danger: appV2Tone.danger,
  warning: appV2Tone.warning,
  success: appV2Tone.success,
  primary: appV2Tone.actionSoft,
};

export function ServiceStepReview({ review, onBack, onComplete }: ServiceStepReviewProps) {
  return (
    <section className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
      <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>Etapa 4</p>
      <h1 className={`tw-mt-1 tw-text-2xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
        {review.title}
      </h1>

      <div className="tw-mt-5 tw-grid tw-gap-4">
        <InfoBlock label="Equipamento" value={review.equipmentName} />
        <InfoBlock label="Cliente/local" value={review.customerLine} />
        <InfoBlock label="Tipo" value={review.kindLabel} />
        <InfoBlock label="Diagnóstico" value={review.diagnosis} />
        <InfoBlock label="Ações" value={review.actionsDone} />
        <div>
          <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
            Status final
          </p>
          <span
            className={`tw-mt-2 tw-inline-flex tw-rounded-md tw-border tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold ${toneClasses[review.finalStatusTone]}`}
          >
            {review.finalStatusLabel}
          </span>
        </div>
      </div>

      <div className="tw-mt-6 tw-flex tw-flex-col tw-gap-3">
        <button
          type="button"
          onClick={onComplete}
          className={`tw-min-h-12 tw-rounded-lg tw-border-0 tw-px-4 tw-py-3 tw-text-base tw-font-extrabold ${appV2Tone.action} ${appV2Tone.focus}`}
        >
          Concluir serviço
        </button>
        <button
          type="button"
          onClick={onBack}
          className={`tw-min-h-11 tw-rounded-lg tw-border tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-extrabold tw-text-[#1D4ED8] ${appV2Tone.border} ${appV2Tone.focus}`}
        >
          Voltar
        </button>
      </div>
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>{label}</p>
      <p className={`tw-mt-1 tw-text-sm tw-font-bold tw-leading-5 ${appV2Tone.text}`}>{value}</p>
    </div>
  );
}
