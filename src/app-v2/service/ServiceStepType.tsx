import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faCalendarCheck,
  faClipboardList,
  faEllipsisH,
  faExclamationTriangle,
  faTools,
} from '@fortawesome/free-solid-svg-icons';

import type { ServiceRecordKind } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import { ActionButton, SectionCard } from '../ui/primitives';
import type { ServiceTypeViewModel } from './serviceFlowViewModel';

interface ServiceStepTypeProps {
  viewModel: ServiceTypeViewModel;
  onBack: () => void;
  onContinue: () => void;
  onCustomKindChange: (customKind: string) => void;
  onSelectKind: (kind: ServiceRecordKind) => void;
}

const serviceTypeIcons = {
  preventiva: faCalendarCheck,
  corretiva: faExclamationTriangle,
  instalacao: faTools,
  visita: faClipboardList,
  outro: faEllipsisH,
} satisfies Record<ServiceRecordKind, typeof faTools>;

export function ServiceStepType({
  viewModel,
  onBack,
  onContinue,
  onCustomKindChange,
  onSelectKind,
}: ServiceStepTypeProps) {
  return (
    <SectionCard className="tw-overflow-hidden tw-rounded-[20px] tw-border-[#E2E8F0] tw-bg-white tw-p-6 tw-shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <h1 className={`tw-m-0 tw-text-base tw-font-bold ${appV2Tone.text}`}>
        Etapa 2 · {viewModel.title}
      </h1>
      <p className={`tw-m-0 tw-mt-2 tw-text-xs tw-font-medium ${appV2Tone.mutedText}`}>
        Escolha o tipo que melhor descreve o atendimento realizado.
      </p>

      <div className="tw-mt-6 tw-grid tw-gap-4 sm:tw-grid-cols-2">
        {viewModel.options.map((option) => {
          const selected = option.kind === viewModel.selectedKind;
          const typeIcon = serviceTypeIcons[option.kind];

          return (
            <button
              key={option.kind}
              type="button"
              onClick={() => onSelectKind(option.kind)}
              className={`tw-rounded-2xl tw-border tw-p-4 tw-text-left tw-transition hover:tw-border-[#BFDBFE] hover:tw-bg-[#EFF6FF] ${appV2Tone.focus} ${
                option.kind === 'outro' ? 'sm:tw-col-span-2' : ''
              } ${
                selected
                  ? 'tw-border-[#2563EB] tw-bg-[#EFF6FF] tw-text-[#061635] tw-shadow-[0_8px_22px_rgba(37,99,235,0.08)]'
                  : 'tw-border-[#E2E8F0] tw-bg-[#F8FAFE] tw-text-[#061635]'
              }`}
              aria-pressed={selected}
            >
              <span className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-bold">
                <FontAwesomeIcon icon={typeIcon} className="tw-h-3.5 tw-w-3.5" aria-hidden="true" />
                {option.label}
              </span>
              <span className={`tw-mt-2 tw-block tw-text-xs tw-leading-5 ${appV2Tone.mutedText}`}>
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
            Descrição do tipo
          </span>
          <input
            type="text"
            name="service-kind-custom"
            value={viewModel.customKind}
            maxLength={viewModel.customKindMaxLength}
            onChange={(event) => onCustomKindChange(event.target.value)}
            className={`tw-w-full tw-rounded-2xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium tw-leading-6 ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
            placeholder="Ex.: Higienização"
          />
          <span className={`tw-text-xs tw-font-medium ${appV2Tone.mutedText}`}>
            Informe até {viewModel.customKindMaxLength} caracteres para identificar o atendimento.
          </span>
        </label>
      ) : null}

      <div className="tw-mt-6 tw-flex tw-flex-wrap tw-justify-end tw-gap-4 tw-border-t tw-border-[#EDF2F7] tw-pt-5">
        <ActionButton
          variant="secondary"
          onClick={onBack}
          className="tw-min-h-10 tw-px-5 tw-py-2.5 tw-text-xs tw-font-semibold"
        >
          Voltar
        </ActionButton>
        <ActionButton
          onClick={onContinue}
          disabled={!viewModel.canContinue}
          className="tw-min-h-10 tw-gap-2 tw-px-6 tw-py-2.5 tw-text-xs tw-font-semibold"
        >
          Continuar
          <FontAwesomeIcon icon={faArrowRight} className="tw-h-3 tw-w-3" aria-hidden="true" />
        </ActionButton>
      </div>
    </SectionCard>
  );
}
