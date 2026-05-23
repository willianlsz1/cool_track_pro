import type { ReactNode } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowRight,
  faBriefcase,
  faCalendarAlt,
  faChartLine,
  faCheckCircle,
  faClock,
  faDollarSign,
  faExclamationTriangle,
  faMicrochip,
  faStethoscope,
  faTasks,
  faUserCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import type { ServiceRecordStatus } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import { fieldInputClass, fieldTextareaClass } from '../ui/FieldGroup';
import { ActionButton, SectionCard } from '../ui/primitives';
import { getServiceQuickSuggestionTitle, type ServiceDraft } from './serviceFlowViewModel';

interface ServiceStepExecutionProps {
  draft: ServiceDraft;
  onBack: () => void;
  onChangeDraft: (draft: ServiceDraft) => void;
  onContinue: () => void;
}

interface ExecutionFieldProps {
  children: ReactNode;
  icon: IconDefinition;
  label: string;
  htmlFor?: string;
  optional?: boolean;
  className?: string;
}

const statusOptions: Array<{ status: ServiceRecordStatus; label: string }> = [
  { status: 'ok', label: 'Operacional' },
  { status: 'warn', label: 'Atenção' },
  { status: 'danger', label: 'Crítico' },
];

const statusIcons = {
  ok: faCheckCircle,
  warn: faClock,
  danger: faExclamationTriangle,
} satisfies Record<ServiceRecordStatus, IconDefinition>;

const executionInputClass = `${fieldInputClass} tw-rounded-xl tw-border-[#E2E8F0] tw-bg-[#F8FAFD] tw-px-3 tw-py-2 tw-text-sm tw-font-medium`;
const executionTextareaClass = `${fieldTextareaClass} tw-min-h-[4.25rem] tw-rounded-xl tw-border-[#E2E8F0] tw-bg-[#F8FAFD] tw-px-3 tw-py-2 tw-text-sm tw-font-medium md:tw-min-h-[4.25rem]`;
const compactTextareaClass = `${fieldTextareaClass} tw-min-h-[3.75rem] tw-rounded-xl tw-border-[#E2E8F0] tw-bg-[#F8FAFD] tw-px-3 tw-py-2 tw-text-sm tw-font-medium md:tw-min-h-[3.75rem]`;

export function ServiceStepExecution({
  draft,
  onBack,
  onChangeDraft,
  onContinue,
}: ServiceStepExecutionProps) {
  const quickSuggestionTitle = getServiceQuickSuggestionTitle(draft.quickSuggestionId);
  const canContinue =
    draft.technician.trim().length > 0 &&
    draft.diagnosis.trim().length > 0 &&
    draft.actionsDone.trim().length > 0;

  return (
    <SectionCard className="tw-mx-auto tw-w-full tw-max-w-5xl tw-overflow-hidden tw-rounded-2xl tw-border-[#E2E8F0] tw-bg-white tw-p-0 tw-shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="tw-space-y-7 tw-p-6">
        <div className="tw-pb-1">
          <h1 className={`tw-m-0 tw-text-2xl tw-font-bold tw-tracking-tight ${appV2Tone.text}`}>
            Etapa 3 - Execução
          </h1>
          <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
            {quickSuggestionTitle
              ? `Resultado após escolher "${quickSuggestionTitle}". Tudo continua editável.`
              : 'Registre o diagnóstico, as ações executadas e o estado final do equipamento.'}
          </p>
        </div>

        <ExecutionField icon={faUserCheck} label="Técnico responsável" htmlFor="service-technician">
          <input
            id="service-technician"
            type="text"
            name="service-technician"
            value={draft.technician}
            onChange={(event) => onChangeDraft({ ...draft, technician: event.target.value })}
            className={executionInputClass}
            placeholder="Informe o técnico responsável"
            autoComplete="name"
          />
        </ExecutionField>

        <ExecutionField icon={faStethoscope} label="Diagnóstico" htmlFor="service-diagnosis">
          <textarea
            id="service-diagnosis"
            name="service-diagnosis"
            value={draft.diagnosis}
            onChange={(event) => onChangeDraft({ ...draft, diagnosis: event.target.value })}
            rows={2}
            className={executionTextareaClass}
            placeholder="Descreva o que foi encontrado"
          />
        </ExecutionField>

        <ExecutionField icon={faTasks} label="Ações executadas" htmlFor="service-actions-done">
          <textarea
            id="service-actions-done"
            name="service-actions-done"
            value={draft.actionsDone}
            onChange={(event) => onChangeDraft({ ...draft, actionsDone: event.target.value })}
            rows={2}
            className={executionTextareaClass}
            placeholder="Informe o que foi feito"
          />
        </ExecutionField>

        <div className="tw-grid tw-grid-cols-1 tw-gap-5 md:tw-grid-cols-2">
          <ExecutionField
            icon={faMicrochip}
            label="Peças usadas"
            htmlFor="service-parts-used"
            optional
          >
            <textarea
              id="service-parts-used"
              name="service-parts-used"
              value={draft.partsUsed ?? ''}
              onChange={(event) => onChangeDraft({ ...draft, partsUsed: event.target.value })}
              rows={2}
              className={compactTextareaClass}
              placeholder="Informe peças substituídas ou utilizadas"
            />
          </ExecutionField>

          <ExecutionField
            icon={faDollarSign}
            label="Custo de peças"
            htmlFor="service-parts-cost"
            optional
          >
            <input
              id="service-parts-cost"
              type="text"
              name="service-parts-cost"
              value={draft.partsCost ?? ''}
              onChange={(event) => onChangeDraft({ ...draft, partsCost: event.target.value })}
              className={executionInputClass}
              placeholder="R$ 0,00"
              inputMode="decimal"
            />
          </ExecutionField>
        </div>

        <div className="tw-grid tw-grid-cols-1 tw-gap-5 md:tw-grid-cols-2">
          <ExecutionField
            icon={faBriefcase}
            label="Custo de mão de obra"
            htmlFor="service-labor-cost"
            optional
          >
            <input
              id="service-labor-cost"
              type="text"
              name="service-labor-cost"
              value={draft.laborCost ?? ''}
              onChange={(event) => onChangeDraft({ ...draft, laborCost: event.target.value })}
              className={executionInputClass}
              placeholder="R$ 0,00"
              inputMode="decimal"
            />
          </ExecutionField>

          <ExecutionField
            icon={faCalendarAlt}
            label="Próxima manutenção"
            htmlFor="service-next-maintenance"
          >
            <input
              id="service-next-maintenance"
              type="date"
              name="service-next-maintenance"
              value={draft.nextMaintenanceDate ?? ''}
              onChange={(event) =>
                onChangeDraft({ ...draft, nextMaintenanceDate: event.target.value })
              }
              className={executionInputClass}
            />
          </ExecutionField>
        </div>

        <ExecutionField icon={faChartLine} label="Status final">
          <div className="tw-flex tw-flex-wrap tw-gap-2">
            {statusOptions.map((option) => {
              const selected = option.status === draft.finalStatus;

              return (
                <button
                  key={option.status}
                  type="button"
                  onClick={() => onChangeDraft({ ...draft, finalStatus: option.status })}
                  className={`tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded-full tw-border tw-px-3 tw-py-1.5 tw-text-sm tw-font-semibold tw-transition ${appV2Tone.focus} ${
                    selected
                      ? 'tw-border-[#2563EB] tw-bg-[#2563EB] tw-text-white'
                      : 'tw-border-[#E2E8F0] tw-bg-[#F1F5F9] tw-text-[#52677F] hover:tw-border-[#BFDBFE] hover:tw-bg-[#EFF6FF] hover:tw-text-[#1E4F8A]'
                  }`}
                  aria-pressed={selected}
                >
                  <FontAwesomeIcon
                    icon={statusIcons[option.status]}
                    className="tw-h-3 tw-w-3"
                    aria-hidden="true"
                  />
                  {option.label}
                </button>
              );
            })}
          </div>
        </ExecutionField>
      </div>

      <div className="tw-flex tw-flex-wrap tw-justify-end tw-gap-3 tw-border-t tw-border-[#EDF2F7] tw-p-6">
        <ActionButton
          variant="secondary"
          onClick={onBack}
          className="tw-min-h-10 tw-px-5 tw-py-2 tw-text-sm tw-font-medium tw-text-[#52677F]"
        >
          Voltar
        </ActionButton>
        <ActionButton
          onClick={onContinue}
          disabled={!canContinue}
          className="tw-min-h-10 tw-gap-2 tw-rounded-lg tw-px-5 tw-py-2 tw-text-sm tw-font-semibold"
        >
          Revisar
          <FontAwesomeIcon icon={faArrowRight} className="tw-h-3 tw-w-3" aria-hidden="true" />
        </ActionButton>
      </div>
    </SectionCard>
  );
}

function ExecutionField({
  children,
  icon,
  label,
  htmlFor,
  optional = false,
  className = '',
}: ExecutionFieldProps) {
  const labelContent = (
    <>
      <FontAwesomeIcon icon={icon} className="tw-h-3 tw-w-3 tw-text-[#2563EB]" aria-hidden="true" />
      <span>{label}</span>
      {optional ? (
        <span className="tw-font-normal tw-normal-case tw-tracking-normal tw-text-[#8BA0BC]">
          (opcional)
        </span>
      ) : null}
    </>
  );

  return (
    <div className={`tw-min-w-0 ${className}`}>
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          className="tw-mb-5 tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-semibold tw-uppercase tw-leading-4 tw-tracking-normal tw-text-[#1E4F8A]"
        >
          {labelContent}
        </label>
      ) : (
        <div className="tw-mb-5 tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-semibold tw-uppercase tw-leading-4 tw-tracking-normal tw-text-[#1E4F8A]">
          {labelContent}
        </div>
      )}
      {children}
    </div>
  );
}
