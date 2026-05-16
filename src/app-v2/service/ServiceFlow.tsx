import { useState } from 'react';

import type { ServiceRecordKind } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import { PageShell, SectionCard, StatusBadge } from '../ui/primitives';
import { ServiceDone } from './ServiceDone';
import { ServiceStepContext } from './ServiceStepContext';
import { ServiceStepExecution } from './ServiceStepExecution';
import { ServiceStepReview } from './ServiceStepReview';
import { ServiceStepType } from './ServiceStepType';
import {
  buildServiceContextViewModel,
  buildServiceDoneViewModel,
  buildServiceReviewViewModel,
  buildServiceTypeViewModel,
  type BuildServiceFlowInput,
  type ServiceDraft,
  type ServiceFlowStep,
} from './serviceFlowViewModel';
import { buildServiceReportViewModel } from './serviceReportViewModel';

interface ServiceFlowProps {
  input: BuildServiceFlowInput;
  initialDraft: ServiceDraft;
  onBackToServices: () => void;
  onDraftChange: (draft: ServiceDraft) => void;
  onCompleteService: (draft: ServiceDraft) => void;
  onValidateService?: (draft: ServiceDraft) => string | null;
  onOpenEquipment: (equipmentId: string) => void;
}

const stepOrder: ServiceFlowStep[] = ['context', 'type', 'execution', 'review', 'done'];

export function ServiceFlow({
  input,
  initialDraft,
  onBackToServices,
  onDraftChange,
  onCompleteService,
  onValidateService,
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

  function selectKind(kind: ServiceRecordKind) {
    updateDraft({
      ...draft,
      kind,
      customKind: kind === 'outro' ? draft.customKind : '',
    });
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

  function finishAndBackToServices() {
    onCompleteService(draft);
    onBackToServices();
  }

  function finishAndOpenEquipment() {
    onCompleteService(draft);
    onOpenEquipment(draft.equipmentId);
  }

  return (
    <PageShell className="tw-max-w-none">
      <SectionCard className="sm:tw-p-6">
        <div className="tw-flex tw-flex-col tw-gap-4 sm:tw-flex-row sm:tw-items-start sm:tw-justify-between">
          <div className="tw-min-w-0">
            <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
              Registro de servico
            </p>
            <h1
              className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-tight sm:tw-text-[2rem] ${appV2Tone.text}`}
            >
              Atendimento em andamento
            </h1>
            <p
              className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-normal tw-leading-6 ${appV2Tone.mutedText}`}
            >
              {context.equipmentName} - {context.customerLine}
            </p>
          </div>
          <StatusBadge tone={context.statusTone} className="tw-w-fit tw-shrink-0 tw-border">
            {context.statusLabel}
          </StatusBadge>
        </div>
        <Progress currentStep={step} />
      </SectionCard>

      {step === 'context' ? (
        <ServiceStepContext context={context} onCancel={onBackToServices} onContinue={nextStep} />
      ) : null}

      {step === 'type' ? (
        <ServiceStepType
          viewModel={buildServiceTypeViewModel(draft)}
          onBack={previousStep}
          onContinue={nextStep}
          onCustomKindChange={updateCustomKind}
          onSelectKind={selectKind}
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
          onBackToServices={finishAndBackToServices}
          onOpenEquipment={finishAndOpenEquipment}
        />
      ) : null}
    </PageShell>
  );
}

function Progress({ currentStep }: { currentStep: ServiceFlowStep }) {
  const activeIndex = stepOrder.indexOf(currentStep);
  const labels: Record<ServiceFlowStep, string> = {
    context: 'Contexto',
    type: 'Tipo',
    execution: 'Execucao',
    review: 'Revisao',
    done: 'Finalizado',
  };

  return (
    <div className="tw-mt-5" aria-label="Progresso do registro">
      <div className="tw-grid tw-grid-cols-5 tw-gap-2">
        {stepOrder.map((step, index) => (
          <span
            key={step}
            className={`tw-h-2 tw-rounded-full ${
              index <= activeIndex ? 'tw-bg-[#2563EB]' : 'tw-bg-[#D7E3F2]'
            }`}
          />
        ))}
      </div>
      <div
        className={`tw-mt-3 tw-flex tw-items-center tw-justify-between tw-gap-2 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.12em] ${appV2Tone.subtleText}`}
      >
        {stepOrder.map((step) => (
          <span key={step} className={step === currentStep ? 'tw-text-[#2563EB]' : ''}>
            {labels[step]}
          </span>
        ))}
      </div>
    </div>
  );
}
