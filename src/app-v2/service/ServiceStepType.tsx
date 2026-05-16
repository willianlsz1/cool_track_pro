import type { ServiceRecordKind } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import { ServiceActions, ServiceStepCard } from './ServiceFlowPrimitives';
import type { ServiceTypeViewModel } from './serviceFlowViewModel';

interface ServiceStepTypeProps {
  viewModel: ServiceTypeViewModel;
  onBack: () => void;
  onContinue: () => void;
  onCustomKindChange: (customKind: string) => void;
  onSelectKind: (kind: ServiceRecordKind) => void;
}

export function ServiceStepType({
  viewModel,
  onBack,
  onContinue,
  onCustomKindChange,
  onSelectKind,
}: ServiceStepTypeProps) {
  return (
    <ServiceStepCard
      eyebrow="Etapa 2"
      title={viewModel.title}
      description="Escolha o tipo que melhor descreve o atendimento realizado."
    >
      <div className="tw-grid tw-gap-3 sm:tw-grid-cols-2">
        {viewModel.options.map((option) => {
          const selected = option.kind === viewModel.selectedKind;

          return (
            <button
              key={option.kind}
              type="button"
              onClick={() => onSelectKind(option.kind)}
              className={`tw-rounded-2xl tw-border tw-p-4 tw-text-left tw-transition hover:tw-bg-[#F8FAFC] ${appV2Tone.focus} ${
                selected
                  ? 'tw-border-[#2563EB] tw-bg-[#EFF6FF] tw-text-[#061635]'
                  : `${appV2Tone.border} tw-bg-white tw-text-[#061635]`
              }`}
              aria-pressed={selected}
            >
              <span className="tw-block tw-text-base tw-font-semibold">{option.label}</span>
              <span
                className={`tw-mt-2 tw-block tw-text-sm tw-font-normal tw-leading-6 ${appV2Tone.mutedText}`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      {viewModel.selectedKind === 'outro' ? (
        <label className="tw-mt-5 tw-grid tw-gap-2">
          <span
            className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            Descricao do tipo
          </span>
          <input
            type="text"
            name="service-kind-custom"
            value={viewModel.customKind}
            maxLength={viewModel.customKindMaxLength}
            onChange={(event) => onCustomKindChange(event.target.value)}
            className={`tw-w-full tw-rounded-2xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium tw-leading-6 ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
            placeholder="Ex.: Higienizacao"
          />
          <span className={`tw-text-xs tw-font-medium ${appV2Tone.mutedText}`}>
            Informe ate {viewModel.customKindMaxLength} caracteres para identificar o atendimento.
          </span>
        </label>
      ) : null}

      <ServiceActions
        primaryLabel="Continuar"
        onPrimary={onContinue}
        primaryDisabled={!viewModel.canContinue}
        secondaryLabel="Voltar"
        onSecondary={onBack}
      />
    </ServiceStepCard>
  );
}
