import type { ServiceRecordKind } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import type { ServiceTypeViewModel } from './serviceFlowViewModel';

interface ServiceStepTypeProps {
  viewModel: ServiceTypeViewModel;
  onBack: () => void;
  onContinue: () => void;
  onSelectKind: (kind: ServiceRecordKind) => void;
}

export function ServiceStepType({
  viewModel,
  onBack,
  onContinue,
  onSelectKind,
}: ServiceStepTypeProps) {
  const canContinue = Boolean(viewModel.selectedKind);

  return (
    <section className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
      <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>Etapa 2</p>
      <h1 className={`tw-mt-1 tw-text-2xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
        {viewModel.title}
      </h1>

      <div className="tw-mt-5 tw-grid tw-gap-3">
        {viewModel.options.map((option) => {
          const selected = option.kind === viewModel.selectedKind;

          return (
            <button
              key={option.kind}
              type="button"
              onClick={() => onSelectKind(option.kind)}
              className={`tw-rounded-lg tw-border tw-p-4 tw-text-left ${appV2Tone.focus} ${
                selected
                  ? 'tw-border-[#1E5BFF] tw-bg-[#E6F0FF] tw-text-[#0A1328]'
                  : `${appV2Tone.border} tw-bg-white tw-text-[#0A1328]`
              }`}
            >
              <span className="tw-block tw-text-base tw-font-black">{option.label}</span>
              <span
                className={`tw-mt-1 tw-block tw-text-sm tw-font-semibold ${appV2Tone.mutedText}`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="tw-mt-6 tw-flex tw-flex-col tw-gap-3">
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className={`tw-min-h-12 tw-rounded-lg tw-border-0 tw-px-4 tw-py-3 tw-text-base tw-font-extrabold disabled:tw-bg-[#DBEAFE] disabled:tw-text-[#64748B] ${appV2Tone.action} ${appV2Tone.focus}`}
        >
          Continuar
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
