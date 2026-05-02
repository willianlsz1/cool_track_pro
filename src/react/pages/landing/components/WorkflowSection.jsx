import { workflowSteps, workflowActiveStepId } from '../data/landingMockData.js';
import { SectionHead } from './SegmentSection.jsx';

/**
 * Secao "Fluxo conectado" — fundo escuro, timeline de 7 passos.
 * Desktop: horizontal com linha tracejada. Mobile: vertical com numeros
 * a esquerda (responsivo via Tailwind). Etapa ativa estatica neste PR
 * (vem de mockData.workflowActiveStepId).
 */
export function WorkflowSection() {
  return (
    <section
      id="fluxo"
      className="tw-relative tw-py-16 sm:tw-py-20 lg:tw-py-24 tw-text-white tw-overflow-hidden"
      // Inline style garante o fundo navy escuro independente do purge
      // do Tailwind processar a combinacao gradient com cor nomeada.
      style={{ background: 'linear-gradient(180deg, #031B4E 0%, #02143b 100%)' }}
    >
      <div
        className="tw-absolute tw-inset-0 tw-pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(700px 300px at 90% 10%, rgba(64,196,255,0.08), transparent 60%), radial-gradient(600px 280px at 5% 90%, rgba(0,109,255,0.10), transparent 60%)',
        }}
      />
      <div className="tw-relative tw-max-w-[1280px] tw-mx-auto tw-px-6">
        <SectionHead
          dark
          eyebrow="Fluxo conectado"
          title="Do chamado ao relatório final."
          description="Um fluxo simples, completo e conectado para sua operação."
        />

        {/* Desktop horizontal */}
        <div className="tw-hidden lg:tw-grid tw-grid-cols-7 tw-gap-0 tw-relative tw-pt-5">
          <div
            className="tw-absolute tw-top-9 tw-left-[5%] tw-right-[5%] tw-border-t-2 tw-border-dashed tw-border-[rgba(120,170,230,0.4)]"
            aria-hidden="true"
          />
          {workflowSteps.map((step) => (
            <div
              key={step.id}
              className="tw-relative tw-z-10 tw-flex tw-flex-col tw-items-center tw-gap-3.5 tw-px-1.5 tw-text-center"
            >
              <StepNumber id={step.id} active={step.id === workflowActiveStepId} />
              <h4 className="tw-text-[13.5px] tw-font-semibold tw-leading-[1.35] tw-max-w-[130px]">
                {step.title}
              </h4>
            </div>
          ))}
        </div>

        {/* Mobile/tablet vertical */}
        <ol className="tw-flex tw-flex-col tw-gap-4 lg:tw-hidden tw-pl-1">
          {workflowSteps.map((step) => (
            <li key={step.id} className="tw-flex tw-items-start tw-gap-4">
              <StepNumber id={step.id} active={step.id === workflowActiveStepId} />
              <h4 className="tw-text-base tw-font-semibold tw-leading-[1.4] tw-pt-2.5">
                {step.title}
              </h4>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StepNumber({ id, active }) {
  return (
    <div
      className="tw-w-12 tw-h-12 tw-rounded-full tw-grid tw-place-items-center tw-text-white tw-font-bold tw-text-lg tw-border-[3px] tw-border-[#02143b] tw-flex-none"
      style={
        active
          ? {
              background: 'linear-gradient(180deg, #40C4FF 0%, #159BFF 100%)',
              boxShadow: '0 0 0 4px rgba(64,196,255,0.25), 0 10px 24px rgba(64,196,255,0.55)',
            }
          : {
              background: 'linear-gradient(180deg, #159BFF 0%, #006DFF 100%)',
              boxShadow: '0 8px 22px rgba(0,109,255,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
            }
      }
      aria-current={active ? 'step' : undefined}
    >
      {id}
    </div>
  );
}

export default WorkflowSection;
