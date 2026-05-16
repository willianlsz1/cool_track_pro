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
  const canContinue =
    draft.technician.trim().length > 0 &&
    draft.diagnosis.trim().length > 0 &&
    draft.actionsDone.trim().length > 0;

  return (
    <ServiceStepCard
      eyebrow="Etapa 3"
      title="Execução"
      description="Registre o diagnóstico, as ações executadas e o estado final do equipamento."
    >
      <div className="tw-grid tw-gap-5">
        <label className="tw-grid tw-gap-5">
          <span
            className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            Técnico responsável
          </span>
          <input
            type="text"
            name="service-technician"
            value={draft.technician}
            onChange={(event) => onChangeDraft({ ...draft, technician: event.target.value })}
            className={`tw-w-full tw-rounded-2xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium tw-leading-6 ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
            placeholder="Informe o técnico responsável"
            autoComplete="name"
          />
        </label>

        <label className="tw-grid tw-gap-5">
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

        <label className="tw-grid tw-gap-5">
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

        <label className="tw-grid tw-gap-5">
          <span
            className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            Pecas usadas
          </span>
          <textarea
            name="service-parts-used"
            value={draft.partsUsed ?? ''}
            onChange={(event) => onChangeDraft({ ...draft, partsUsed: event.target.value })}
            rows={3}
            className={`tw-w-full tw-resize-none tw-rounded-2xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium tw-leading-6 ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
            placeholder="Opcional: informe pecas substituidas ou utilizadas"
          />
        </label>

        <div className="tw-grid tw-gap-x-3 tw-gap-y-5 sm:tw-grid-cols-2">
          <label className="tw-grid tw-gap-5">
            <span
              className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
            >
              Custo de pecas
            </span>
            <input
              type="text"
              name="service-parts-cost"
              value={draft.partsCost ?? ''}
              onChange={(event) => onChangeDraft({ ...draft, partsCost: event.target.value })}
              className={`tw-w-full tw-rounded-2xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium tw-leading-6 ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
              placeholder="Opcional"
              inputMode="decimal"
            />
          </label>

          <label className="tw-grid tw-gap-5">
            <span
              className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
            >
              Custo de mao de obra
            </span>
            <input
              type="text"
              name="service-labor-cost"
              value={draft.laborCost ?? ''}
              onChange={(event) => onChangeDraft({ ...draft, laborCost: event.target.value })}
              className={`tw-w-full tw-rounded-2xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium tw-leading-6 ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
              placeholder="Opcional"
              inputMode="decimal"
            />
          </label>
        </div>

        <label className="tw-grid tw-gap-5">
          <span
            className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            Proxima manutencao
          </span>
          <input
            type="date"
            name="service-next-maintenance"
            value={draft.nextMaintenanceDate ?? ''}
            onChange={(event) =>
              onChangeDraft({ ...draft, nextMaintenanceDate: event.target.value })
            }
            className={`tw-w-full tw-rounded-2xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium tw-leading-6 ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
          />
        </label>

        <div>
          <p
            className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            Status final
          </p>
          <div className="tw-mt-5 tw-grid tw-grid-cols-1 tw-gap-2 sm:tw-grid-cols-3">
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
