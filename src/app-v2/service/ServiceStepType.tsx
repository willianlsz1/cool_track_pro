import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBroom,
  faCalendarCheck,
  faChevronRight,
  faClipboardCheck,
  faClipboardList,
  faExclamationTriangle,
  faFilter,
  faPen,
  faPlusCircle,
  faTag,
  faTools,
  faWind,
} from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import { ActionButton, SectionCard } from '../ui/primitives';
import type {
  ServiceQuickSuggestionId,
  ServiceQuickSuggestionViewModel,
  ServiceTypeViewModel,
} from './serviceFlowViewModel';

interface ServiceStepTypeProps {
  viewModel: ServiceTypeViewModel;
  onBack: () => void;
  onContinue: () => void;
  onCustomKindChange: (customKind: string) => void;
  onSelectQuickSuggestion: (suggestionId: ServiceQuickSuggestionId) => void;
}

const quickSuggestionIcons = {
  'limpeza-preventiva': faBroom,
  'recarga-gas': faWind,
  'troca-filtro': faFilter,
  'inspecao-tecnica': faClipboardCheck,
  instalacao: faTools,
  'outro-atendimento': faPen,
} satisfies Record<ServiceQuickSuggestionId, typeof faTools>;

const quickSuggestionToneClass = {
  success: {
    icon: 'tw-bg-[#F0FDF4] tw-text-[#16A34A]',
    tag: 'tw-bg-[#F0FDF4] tw-text-[#16A34A]',
    tagIcon: faCalendarCheck,
  },
  danger: {
    icon: 'tw-bg-[#FEF2F2] tw-text-[#DC2626]',
    tag: 'tw-bg-[#FEF2F2] tw-text-[#DC2626]',
    tagIcon: faExclamationTriangle,
  },
  warning: {
    icon: 'tw-bg-[#FFFBEB] tw-text-[#D97706]',
    tag: 'tw-bg-[#FFFBEB] tw-text-[#D97706]',
    tagIcon: faClipboardCheck,
  },
  primary: {
    icon: 'tw-bg-[#EFF6FF] tw-text-[#2563EB]',
    tag: 'tw-bg-[#EFF6FF] tw-text-[#2563EB]',
    tagIcon: faPlusCircle,
  },
};

export function ServiceStepType({
  viewModel,
  onBack,
  onContinue,
  onCustomKindChange,
  onSelectQuickSuggestion,
}: ServiceStepTypeProps) {
  return (
    <SectionCard className="tw-overflow-hidden tw-rounded-[20px] tw-border-[#E2E8F0] tw-bg-white tw-p-6 tw-shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <h1 className={`tw-m-0 tw-text-base tw-font-bold ${appV2Tone.text}`}>
        Etapa 2 · {viewModel.title}
      </h1>
      <p className={`tw-m-0 tw-mt-2 tw-text-xs tw-font-medium ${appV2Tone.mutedText}`}>
        Use um atalho para preencher tipo, diagnóstico e ações. Revise tudo na próxima etapa.
      </p>

      <div className="tw-mt-6 tw-grid tw-gap-5 lg:tw-grid-cols-2">
        {viewModel.quickSuggestions.map((suggestion) => (
          <QuickSuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onSelect={onSelectQuickSuggestion}
          />
        ))}
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
            placeholder="Ex.: Higienização especial"
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

function QuickSuggestionCard({
  suggestion,
  onSelect,
}: {
  suggestion: ServiceQuickSuggestionViewModel;
  onSelect: (suggestionId: ServiceQuickSuggestionId) => void;
}) {
  const quickIcon = quickSuggestionIcons[suggestion.id];
  const toneClass = quickSuggestionToneClass[suggestion.tone];

  return (
    <button
      type="button"
      onClick={() => onSelect(suggestion.id)}
      className={`tw-rounded-[20px] tw-border tw-bg-white tw-p-5 tw-text-left tw-transition hover:-tw-translate-y-0.5 hover:tw-border-[#BFDBFE] hover:tw-shadow-[0_14px_28px_-18px_rgba(7,26,51,0.22)] ${appV2Tone.focus} ${
        suggestion.selected
          ? 'tw-border-[#2563EB] tw-bg-[#FBFDFF] tw-shadow-[0_14px_28px_-18px_rgba(7,26,51,0.22)]'
          : 'tw-border-[#E2E8F0]'
      }`}
      aria-pressed={suggestion.selected}
    >
      <span className="tw-flex tw-items-start tw-justify-between tw-gap-4">
        <span className="tw-flex tw-items-center tw-gap-3">
          <span
            className={`tw-flex tw-h-10 tw-w-10 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl ${toneClass.icon}`}
          >
            <FontAwesomeIcon icon={quickIcon} className="tw-h-4 tw-w-4" aria-hidden="true" />
          </span>
          <span>
            <span className="tw-block tw-text-base tw-font-bold tw-tracking-[-0.02em] tw-text-[#071A33]">
              {suggestion.title}
            </span>
            <span
              className={`tw-mt-1 tw-inline-flex tw-items-center tw-gap-1 tw-rounded-full tw-px-2 tw-py-0.5 tw-text-[0.68rem] tw-font-bold ${toneClass.tag}`}
            >
              <FontAwesomeIcon
                icon={toneClass.tagIcon}
                className="tw-h-3 tw-w-3"
                aria-hidden="true"
              />
              {suggestion.kindLabel}
            </span>
          </span>
        </span>
        <FontAwesomeIcon
          icon={faChevronRight}
          className="tw-mt-2 tw-h-3 tw-w-3 tw-text-[#CBD5E1]"
          aria-hidden="true"
        />
      </span>

      <span className={`tw-mt-4 tw-block tw-text-sm tw-leading-5 ${appV2Tone.mutedText}`}>
        {suggestion.summary}
      </span>

      <span className="tw-mt-4 tw-grid tw-gap-2 tw-rounded-xl tw-bg-[#F8FAFE] tw-p-3 tw-text-xs tw-leading-5 tw-text-[#071A33]">
        <span className="tw-flex tw-items-start tw-gap-2">
          <FontAwesomeIcon
            icon={faClipboardList}
            className="tw-mt-1 tw-h-3.5 tw-w-3.5 tw-text-[#1E4F8A]"
            aria-hidden="true"
          />
          <span>
            <strong>Ações sugeridas:</strong> {suggestion.suggestedActions}
          </span>
        </span>
        <span className="tw-flex tw-items-start tw-gap-2">
          <FontAwesomeIcon
            icon={faTag}
            className="tw-mt-1 tw-h-3.5 tw-w-3.5 tw-text-[#1E4F8A]"
            aria-hidden="true"
          />
          <span>
            <strong>Tipo:</strong> {suggestion.kindLabel}
          </span>
        </span>
      </span>
    </button>
  );
}
