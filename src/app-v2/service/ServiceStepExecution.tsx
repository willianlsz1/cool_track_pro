import type { ServiceRecordStatus } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import { ServiceActions, ServiceStepCard } from './ServiceFlowPrimitives';
import type { ServiceDraft, ServiceTone } from './serviceFlowViewModel';

interface ServiceStepExecutionProps {
  draft: ServiceDraft;
  onBack: () => void;
  onChangeDraft: (draft: ServiceDraft) => void;
  onContinue: () => void;
}

const statusOptions: Array<{ status: ServiceRecordStatus; label: string; tone: ServiceTone }> = [
  { status: 'ok', label: 'Operacional', tone: 'success' },
  { status: 'warn', label: 'Atenção', tone: 'warning' },
  { status: 'danger', label: 'Crítico', tone: 'danger' },
];

const selectedToneClasses: Record<ServiceTone, string> = {
  danger: 'tw-border-[#DC2626] tw-bg-[#FEF2F2] tw-text-[#DC2626]',
  warning: 'tw-border-[#D97706] tw-bg-[#FFF7ED] tw-text-[#D97706]',
  success: 'tw-border-[#16A34A] tw-bg-[#F0FDF4] tw-text-[#16A34A]',
  primary: 'tw-border-[#2563EB] tw-bg-[#EFF6FF] tw-text-[#2563EB]',
};

export function ServiceStepExecution({
  draft,
  onBack,
  onChangeDraft,
  onContinue,
}: ServiceStepExecutionProps) {
  const canContinue = draft.diagnosis.trim().length > 0 && draft.actionsDone.trim().length > 0;

  return (
    <ServiceStepCard
      eyebrow="Etapa 3"
      title="Execução"
      description="Registre o diagnóstico, as ações executadas e o estado final do equipamento."
    >
      <div className="tw-grid tw-gap-5">
        <label className="tw-grid tw-gap-2">
          <span
            className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            Diagnóstico
          </span>
          <textarea
            value={draft.diagnosis}
            onChange={(event) => onChangeDraft({ ...draft, diagnosis: event.target.value })}
            rows={5}
            className={`tw-w-full tw-resize-none tw-rounded-2xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium tw-leading-6 ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
            placeholder="Descreva o que foi encontrado"
          />
        </label>

        <label className="tw-grid tw-gap-2">
          <span
            className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            Ações executadas
          </span>
          <textarea
            value={draft.actionsDone}
            onChange={(event) => onChangeDraft({ ...draft, actionsDone: event.target.value })}
            rows={5}
            className={`tw-w-full tw-resize-none tw-rounded-2xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium tw-leading-6 ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
            placeholder="Informe o que foi feito"
          />
        </label>

        <div>
          <p
            className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            Status final
          </p>
          <div className="tw-mt-3 tw-grid tw-grid-cols-1 tw-gap-2 sm:tw-grid-cols-3">
            {statusOptions.map((option) => {
              const selected = option.status === draft.finalStatus;

              return (
                <button
                  key={option.status}
                  type="button"
                  onClick={() => onChangeDraft({ ...draft, finalStatus: option.status })}
                  className={`tw-min-h-12 tw-rounded-xl tw-border tw-px-3 tw-text-sm tw-font-semibold ${appV2Tone.focus} ${
                    selected
                      ? selectedToneClasses[option.tone]
                      : `${appV2Tone.border} tw-bg-white ${appV2Tone.mutedText}`
                  }`}
                  aria-pressed={selected}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ServiceActions
        primaryLabel="Revisar"
        onPrimary={onContinue}
        primaryDisabled={!canContinue}
        secondaryLabel="Voltar"
        onSecondary={onBack}
      />
    </ServiceStepCard>
  );
}
