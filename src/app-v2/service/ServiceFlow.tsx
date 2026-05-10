import { useState } from 'react';

import type { ServiceRecordKind } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
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

interface ServiceFlowProps {
  input: BuildServiceFlowInput;
  initialDraft: ServiceDraft;
  onBackToServices: () => void;
  onDraftChange: (draft: ServiceDraft) => void;
  onOpenEquipment: (equipmentId: string) => void;
}

const stepOrder: ServiceFlowStep[] = ['context', 'type', 'execution', 'review', 'done'];

export function ServiceFlow({
  input,
  initialDraft,
  onBackToServices,
  onDraftChange,
  onOpenEquipment,
}: ServiceFlowProps) {
  const [step, setStep] = useState<ServiceFlowStep>('context');
  const [draft, setDraft] = useState<ServiceDraft>(initialDraft);

  function updateDraft(nextDraft: ServiceDraft) {
    setDraft(nextDraft);
    onDraftChange(nextDraft);
  }

  function selectKind(kind: ServiceRecordKind) {
    updateDraft({ ...draft, kind });
  }

  function previousStep() {
    const currentIndex = stepOrder.indexOf(step);
    setStep(stepOrder[Math.max(0, currentIndex - 1)]);
  }

  function nextStep() {
    const currentIndex = stepOrder.indexOf(step);
    setStep(stepOrder[Math.min(stepOrder.length - 1, currentIndex + 1)]);
  }

  return (
    <main className="tw-mx-auto tw-flex tw-min-h-screen tw-w-full tw-max-w-[520px] tw-flex-col tw-px-4 tw-pb-36 tw-pt-5">
      <header className="tw-mb-4">
        <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
          Registro de serviço
        </p>
        <Progress currentStep={step} />
      </header>

      {step === 'context' ? (
        <ServiceStepContext
          context={buildServiceContextViewModel(input, draft)}
          onCancel={onBackToServices}
          onContinue={nextStep}
        />
      ) : null}

      {step === 'type' ? (
        <ServiceStepType
          viewModel={buildServiceTypeViewModel(draft)}
          onBack={previousStep}
          onContinue={nextStep}
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
          onBack={previousStep}
          onComplete={nextStep}
        />
      ) : null}

      {step === 'done' ? (
        <ServiceDone
          done={buildServiceDoneViewModel(input, draft)}
          onBackToServices={onBackToServices}
          onOpenEquipment={() => onOpenEquipment(draft.equipmentId)}
        />
      ) : null}
    </main>
  );
}

function Progress({ currentStep }: { currentStep: ServiceFlowStep }) {
  const activeIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="tw-mt-3 tw-grid tw-grid-cols-5 tw-gap-2" aria-label="Progresso do registro">
      {stepOrder.map((step, index) => (
        <span
          key={step}
          className={`tw-h-2 tw-rounded-full ${
            index <= activeIndex ? 'tw-bg-[#1E5BFF]' : 'tw-bg-[#D7E3F2]'
          }`}
        />
      ))}
    </div>
  );
}
