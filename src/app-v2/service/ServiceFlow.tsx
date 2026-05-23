import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckCircle, faTools } from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import { PageShell } from '../ui/primitives';
import { ServiceDone } from './ServiceDone';
import { ServiceStepContext } from './ServiceStepContext';
import { ServiceStepExecution } from './ServiceStepExecution';
import { ServiceStepReview } from './ServiceStepReview';
import { ServiceStepType } from './ServiceStepType';
import {
  applyServiceQuickSuggestion,
  buildServiceContextViewModel,
  buildServiceDoneViewModel,
  buildServiceReviewViewModel,
  buildServiceTypeViewModel,
  type BuildServiceFlowInput,
  type ServiceDraft,
  type ServiceFlowStep,
  type ServiceQuickSuggestionId,
} from './serviceFlowViewModel';
import { buildServiceReportViewModel } from './serviceReportViewModel';

interface ServiceFlowProps {
  input: BuildServiceFlowInput;
  initialDraft: ServiceDraft;
  onBackToServices: () => void;
  onDraftChange: (draft: ServiceDraft) => void;
  onCompleteService: (draft: ServiceDraft) => string | null | Promise<string | null>;
  onCreateQuoteFromCompletedService: (draft: ServiceDraft) => void;
  onValidateService?: (draft: ServiceDraft) => string | null;
  onChangeEquipment?: () => void;
  onOpenEquipment: (equipmentId: string) => void;
}

const stepOrder: ServiceFlowStep[] = ['context', 'type', 'execution', 'review', 'done'];

export function ServiceFlow({
  input,
  initialDraft,
  onBackToServices,
  onDraftChange,
  onCompleteService,
  onCreateQuoteFromCompletedService,
  onValidateService,
  onChangeEquipment,
  onOpenEquipment,
}: ServiceFlowProps) {
  const [step, setStep] = useState<ServiceFlowStep>('context');
  const [draft, setDraft] = useState<ServiceDraft>(initialDraft);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const context = buildServiceContextViewModel(input, draft);

  function updateDraft(nextDraft: ServiceDraft) {
    setCompletionError(null);
    setDraft(nextDraft);
    onDraftChange(nextDraft);
  }

  function selectQuickSuggestion(suggestionId: ServiceQuickSuggestionId) {
    updateDraft(applyServiceQuickSuggestion(draft, suggestionId));
  }

  function updateCustomKind(customKind: string) {
    updateDraft({ ...draft, customKind });
  }

  function previousStep() {
    const currentIndex = stepOrder.indexOf(step);
    setStep(stepOrder[Math.max(0, currentIndex - 1)]);
  }

  function nextStep() {
    const currentIndex = stepOrder.indexOf(step);
    setStep(stepOrder[Math.min(stepOrder.length - 1, currentIndex + 1)]);
  }

  function completeReviewStep() {
    const errorMessage = onValidateService?.(draft) ?? null;

    if (errorMessage) {
      setCompletionError(errorMessage);
      return;
    }

    setCompletionError(null);
    nextStep();
  }

  async function finishAndBackToServices() {
    const errorMessage = await resolveServiceCompletionResult(onCompleteService(draft));

    if (errorMessage) {
      setCompletionError(errorMessage);
      return;
    }

    setCompletionError(null);
    onBackToServices();
  }

  async function finishAndOpenEquipment() {
    const errorMessage = await resolveServiceCompletionResult(onCompleteService(draft));

    if (errorMessage) {
      setCompletionError(errorMessage);
      return;
    }

    setCompletionError(null);
    onOpenEquipment(draft.equipmentId);
  }

  function finishAndCreateQuote() {
    onCreateQuoteFromCompletedService(draft);
  }

  const isDone = step === 'done';
  const headerIcon = isDone ? faCheckCircle : faTools;
  const headerLabel = isDone ? 'Atendimento concluído' : 'Atendimento em andamento';

  return (
    <PageShell className="tw-max-w-none tw-gap-6 lg:tw-gap-7">
      <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-3 tw-rounded-2xl tw-border tw-border-[#E2E8F0] tw-bg-white tw-px-5 tw-py-3 tw-shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <span className="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-full tw-bg-[#EFF6FF] tw-px-3 tw-py-1 tw-text-xs tw-font-bold tw-text-[#1E4F8A]">
          <FontAwesomeIcon icon={headerIcon} className="tw-h-3 tw-w-3" aria-hidden="true" />
          {headerLabel}
        </span>
        <span className={`tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
          {context.equipmentName} - {context.customerLine}
        </span>
      </div>

      <Progress currentStep={step} />

      {step === 'context' ? (
        <ServiceStepContext
          context={context}
          serviceDate={draft.serviceDate}
          onCancel={onBackToServices}
          onChangeEquipment={onChangeEquipment}
          onContinue={nextStep}
          onServiceDateChange={
            onChangeEquipment ? (serviceDate) => updateDraft({ ...draft, serviceDate }) : undefined
          }
        />
      ) : null}

      {step === 'type' ? (
        <ServiceStepType
          viewModel={buildServiceTypeViewModel(draft)}
          onBack={previousStep}
          onContinue={nextStep}
          onCustomKindChange={updateCustomKind}
          onSelectQuickSuggestion={selectQuickSuggestion}
        />
      ) : null}

      {step === 'execution' ? (
        <ServiceStepExecution
          draft={draft}
          onBack={previousStep}
          onChangeDraft={updateDraft}
          onContinue={nextStep}
        />
      ) : null}

      {step === 'review' ? (
        <ServiceStepReview
          review={buildServiceReviewViewModel(input, draft)}
          errorMessage={completionError}
          onBack={previousStep}
          onComplete={completeReviewStep}
        />
      ) : null}

      {step === 'done' ? (
        <ServiceDone
          done={buildServiceDoneViewModel(input, draft)}
          report={buildServiceReportViewModel(input, draft)}
          errorMessage={completionError}
          onBackToServices={finishAndBackToServices}
          onCreateQuote={finishAndCreateQuote}
          onOpenEquipment={finishAndOpenEquipment}
        />
      ) : null}
    </PageShell>
  );
}

async function resolveServiceCompletionResult(
  result: string | null | Promise<string | null>,
): Promise<string | null> {
  try {
    return await result;
  } catch (error) {
    return error instanceof Error ? error.message : 'Não foi possível concluir o serviço.';
  }
}

function Progress({ currentStep }: { currentStep: ServiceFlowStep }) {
  const activeIndex = stepOrder.indexOf(currentStep);
  const labels: Record<ServiceFlowStep, string> = {
    context: 'Contexto',
    type: 'Tipo',
    execution: 'Execução',
    review: 'Revisão',
    done: 'Finalizado',
  };

  return (
    <div
      className="tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-3 tw-rounded-[20px] tw-border tw-border-[#E2E8F0] tw-bg-white tw-px-6 tw-py-3 tw-shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
      aria-label="Progresso do registro"
    >
      {stepOrder.map((step, index) => {
        const isCompleted = currentStep === 'done' ? index <= activeIndex : index < activeIndex;
        const isActive = step === currentStep && currentStep !== 'done';

        return (
          <div
            key={step}
            className="tw-flex tw-min-w-[92px] tw-flex-1 tw-flex-col tw-items-center tw-text-center"
          >
            <span
              className={`tw-flex tw-h-8 tw-w-8 tw-items-center tw-justify-center tw-rounded-full tw-text-xs tw-font-bold ${
                isCompleted
                  ? 'tw-bg-[#16A34A] tw-text-white'
                  : isActive
                    ? 'tw-bg-[#2563EB] tw-text-white tw-shadow-[0_2px_6px_rgba(37,99,235,0.2)]'
                    : 'tw-bg-[#F1F5F9] tw-text-[#52677F]'
              }`}
            >
              {isCompleted ? (
                <FontAwesomeIcon icon={faCheck} className="tw-h-3 tw-w-3" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={`tw-mt-1.5 tw-text-[0.7rem] tw-font-bold tw-uppercase ${
                isCompleted
                  ? 'tw-text-[#16A34A]'
                  : isActive
                    ? 'tw-text-[#2563EB]'
                    : 'tw-text-[#52677F]'
              }`}
            >
              {labels[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
