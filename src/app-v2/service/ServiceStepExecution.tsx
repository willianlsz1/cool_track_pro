import type { ServiceRecordStatus } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
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

const toneClasses: Record<ServiceTone, string> = {
  danger: appV2Tone.danger,
  warning: appV2Tone.warning,
  success: appV2Tone.success,
  primary: appV2Tone.actionSoft,
};

export function ServiceStepExecution({
  draft,
  onBack,
  onChangeDraft,
  onContinue,
}: ServiceStepExecutionProps) {
  const canContinue = draft.diagnosis.trim().length > 0 && draft.actionsDone.trim().length > 0;

  return (
    <section className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
      <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>Etapa 3</p>
      <h1 className={`tw-mt-1 tw-text-2xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
        Execução
      </h1>

      <div className="tw-mt-5 tw-grid tw-gap-4">
        <label className="tw-grid tw-gap-2">
          <span className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
            Diagnóstico
          </span>
          <textarea
            value={draft.diagnosis}
            onChange={(event) => onChangeDraft({ ...draft, diagnosis: event.target.value })}
            rows={4}
            className={`tw-w-full tw-resize-none tw-rounded-lg tw-border tw-bg-white tw-p-3 tw-text-sm tw-font-semibold tw-leading-5 ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
            placeholder="Descreva o que foi encontrado"
          />
        </label>

        <label className="tw-grid tw-gap-2">
          <span className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
            Ações executadas
          </span>
          <textarea
            value={draft.actionsDone}
            onChange={(event) => onChangeDraft({ ...draft, actionsDone: event.target.value })}
            rows={4}
            className={`tw-w-full tw-resize-none tw-rounded-lg tw-border tw-bg-white tw-p-3 tw-text-sm tw-font-semibold tw-leading-5 ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
            placeholder="Informe o que foi feito"
          />
        </label>

        <div>
          <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
            Status final
          </p>
          <div className="tw-mt-2 tw-grid tw-grid-cols-3 tw-gap-2">
            {statusOptions.map((option) => {
              const selected = option.status === draft.finalStatus;

              return (
                <button
                  key={option.status}
                  type="button"
                  onClick={() => onChangeDraft({ ...draft, finalStatus: option.status })}
                  className={`tw-min-h-11 tw-rounded-lg tw-border tw-px-2 tw-text-xs tw-font-black ${appV2Tone.focus} ${
                    selected ? toneClasses[option.tone] : `${appV2Tone.border} tw-bg-white`
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tw-mt-6 tw-flex tw-flex-col tw-gap-3">
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className={`tw-min-h-12 tw-rounded-lg tw-border-0 tw-px-4 tw-py-3 tw-text-base tw-font-extrabold disabled:tw-bg-[#DBEAFE] disabled:tw-text-[#64748B] ${appV2Tone.action} ${appV2Tone.focus}`}
        >
          Revisar
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
