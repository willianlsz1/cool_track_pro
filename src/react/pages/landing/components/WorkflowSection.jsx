import { useState } from 'react';
import { workflowSteps, workflowDefaultStepId } from '../data/landingMockData.js';
import { SectionHead } from './SegmentSection.jsx';

/**
 * Secao "Fluxo conectado" — interativa.
 *
 * Cada etapa e um `<button>` clicavel. State local (`activeStepId`)
 * determina qual etapa fica destacada visualmente e qual descricao
 * aparece no card de detalhe abaixo da timeline.
 *
 * A11y: `role="tablist"` no container, `role="tab"` em cada etapa,
 * `aria-selected` no estado ativo. Navegavel por teclado (Tab + Enter).
 */
export function WorkflowSection() {
  const [activeStepId, setActiveStepId] = useState(workflowDefaultStepId);
  const activeStep = workflowSteps.find((step) => step.id === activeStepId) ?? workflowSteps[0];

  return (
    <section
      id="fluxo"
      className="tw-relative tw-py-16 sm:tw-py-20 lg:tw-py-24 tw-text-white tw-overflow-hidden"
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
          description="Um fluxo simples, completo e conectado para sua operação. Clique em uma etapa para ver os detalhes."
        />

        {/* Desktop horizontal */}
        <div
          role="tablist"
          aria-label="Etapas do fluxo CoolTrackPro"
          className="tw-hidden lg:tw-grid tw-grid-cols-7 tw-gap-0 tw-relative tw-pt-5"
        >
          <div
            className="tw-absolute tw-top-9 tw-left-[5%] tw-right-[5%] tw-border-t-2 tw-border-dashed tw-border-[rgba(120,170,230,0.4)]"
            aria-hidden="true"
          />
          {workflowSteps.map((step) => (
            <WorkflowStepButton
              key={step.id}
              step={step}
              isActive={step.id === activeStepId}
              onSelect={setActiveStepId}
              orientation="horizontal"
            />
          ))}
        </div>

        {/* Mobile/tablet vertical — div + buttons diretos (sem <ol>/<li>):
            screen readers/axe esperam o contrato tablist→tab sem
            elemento intermediario. */}
        <div
          role="tablist"
          aria-label="Etapas do fluxo CoolTrackPro"
          className="tw-flex tw-flex-col tw-gap-3 lg:tw-hidden tw-pl-1"
        >
          {workflowSteps.map((step) => (
            <WorkflowStepButton
              key={step.id}
              step={step}
              isActive={step.id === activeStepId}
              onSelect={setActiveStepId}
              orientation="vertical"
            />
          ))}
        </div>

        {/* Card de detalhe da etapa ativa */}
        <div
          role="tabpanel"
          aria-live="polite"
          className="tw-mt-10 tw-mx-auto tw-max-w-[640px] tw-rounded-2xl tw-px-6 tw-py-5"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(120,170,230,0.22)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-3 tw-mb-2">
            <span
              className="tw-text-[11px] tw-font-bold tw-tracking-[0.08em] tw-uppercase tw-px-2 tw-py-1 tw-rounded-md"
              style={{
                background: 'rgba(64,196,255,0.15)',
                color: '#bfe6ff',
                border: '1px solid rgba(64,196,255,0.3)',
              }}
            >
              Etapa {activeStep.id} de {workflowSteps.length}
            </span>
            <h3 className="tw-text-base sm:tw-text-lg tw-font-bold tw-text-white">
              {activeStep.title}
            </h3>
          </div>
          <p className="tw-text-sm sm:tw-text-[15px] tw-leading-[1.6] tw-text-[#a8bcd9]">
            {activeStep.description}
          </p>
        </div>
      </div>
    </section>
  );
}

function WorkflowStepButton({ step, isActive, onSelect, orientation }) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onSelect(step.id)}
      className={
        isHorizontal
          ? 'tw-relative tw-z-10 tw-flex tw-flex-col tw-items-center tw-gap-3.5 tw-px-1.5 tw-text-center tw-bg-transparent tw-border-0 tw-cursor-pointer tw-transition-all hover:-tw-translate-y-0.5'
          : 'tw-w-full tw-flex tw-items-start tw-gap-4 tw-bg-transparent tw-border-0 tw-cursor-pointer tw-transition-all tw-text-left'
      }
    >
      <StepNumber id={step.id} active={isActive} />
      <h4
        className={
          isHorizontal
            ? `tw-text-[13.5px] tw-font-semibold tw-leading-[1.35] tw-max-w-[130px] ${isActive ? 'tw-text-white' : 'tw-text-[#cdd9ee]'}`
            : `tw-text-base tw-font-semibold tw-leading-[1.4] tw-pt-2.5 ${isActive ? 'tw-text-white' : 'tw-text-[#cdd9ee]'}`
        }
      >
        {step.title}
      </h4>
    </button>
  );
}

function StepNumber({ id, active }) {
  return (
    <div
      className="tw-w-12 tw-h-12 tw-rounded-full tw-grid tw-place-items-center tw-text-white tw-font-bold tw-text-lg tw-border-[3px] tw-border-[#02143b] tw-flex-none tw-transition-all"
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
      aria-hidden="true"
    >
      {id}
    </div>
  );
}

export default WorkflowSection;
