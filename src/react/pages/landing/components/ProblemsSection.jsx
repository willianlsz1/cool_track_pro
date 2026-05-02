import { useState } from 'react';
import { problems } from '../data/landingMockData.js';
import { SectionHead } from './SegmentSection.jsx';
import {
  OsSemPadraoIcon,
  HistoricoPerdidoIcon,
  RelatoriosImprovisadosIcon,
  PreventivasEsquecidasIcon,
  FotosEspalhadasIcon,
  DadosTecnicosSoltosIcon,
} from '../icons/landingIcons.jsx';

/**
 * Mapeamento id → componente de icone, conforme sprite aprovado
 * `a_set_of_six_minimalistic_vector_icons_highlights.png` (salvo como
 * referencia em `assets/problems-reference.png`).
 */
const PROBLEM_ICONS = {
  os: OsSemPadraoIcon,
  historico: HistoricoPerdidoIcon,
  relatorios: RelatoriosImprovisadosIcon,
  preventivas: PreventivasEsquecidasIcon,
  fotos: FotosEspalhadasIcon,
  dados: DadosTecnicosSoltosIcon,
};

/**
 * Secao "Os problemas que travam a operacao" — interativa.
 *
 * Cada card e um `<button>` clicavel. Ao clicar, o card fica destacado
 * (borda cyan + leve scale) e um painel "Como o CoolTrackPro resolve"
 * aparece abaixo da grade com a `solution` correspondente.
 *
 * Default: nenhum problema ativo (`activeId === null`). Clicar de novo
 * no card ativo desativa (toggle).
 */
export function ProblemsSection() {
  const [activeId, setActiveId] = useState(null);
  const activeProblem = problems.find((p) => p.id === activeId) ?? null;

  return (
    <section
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
          eyebrow="Diagnóstico"
          title="Os problemas que travam a operação"
          description="Sinais comuns no dia a dia de quem atende climatização e refrigeração — clique em um problema para ver como o CoolTrackPro resolve."
        />

        <div
          role="list"
          className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4 sm:tw-gap-5"
        >
          {problems.map((p) => {
            const isActive = p.id === activeId;
            const IconComp = PROBLEM_ICONS[p.id];
            return (
              <button
                key={p.id}
                type="button"
                role="listitem"
                aria-pressed={isActive}
                onClick={() => setActiveId(isActive ? null : p.id)}
                className="tw-text-left tw-p-5 tw-rounded-2xl tw-cursor-pointer tw-transition-all tw-duration-200 tw-w-full hover:-tw-translate-y-0.5"
                style={{
                  background: isActive ? 'rgba(64,196,255,0.10)' : 'rgba(255,255,255,0.04)',
                  border: isActive
                    ? '1px solid rgba(64,196,255,0.55)'
                    : '1px solid rgba(120,170,230,0.18)',
                  boxShadow: isActive
                    ? '0 0 0 3px rgba(64,196,255,0.18), 0 12px 32px rgba(0,109,255,0.35)'
                    : 'none',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div
                  className="tw-w-[52px] tw-h-[52px] tw-rounded-xl tw-grid tw-place-items-center tw-mb-4"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(21,155,255,0.18) 0%, rgba(64,196,255,0.10) 100%)',
                    border: '1px solid rgba(64,196,255,0.3)',
                  }}
                >
                  {IconComp ? <IconComp size={32} /> : null}
                </div>
                <h3 className="tw-text-base tw-font-bold tw-mb-1.5 tw-text-white">{p.title}</h3>
                <p className="tw-text-sm tw-text-[#a8bcd9] tw-leading-[1.5]">{p.description}</p>
              </button>
            );
          })}
        </div>

        {/* Painel "Como o CoolTrackPro resolve" — aparece quando ha
            problema ativo. Centralizado abaixo da grade. */}
        {activeProblem ? (
          <div
            aria-live="polite"
            className="tw-mt-8 tw-mx-auto tw-max-w-[720px] tw-rounded-2xl tw-px-6 tw-py-5 tw-flex tw-flex-col sm:tw-flex-row tw-items-start tw-gap-4"
            style={{
              background: 'rgba(64,196,255,0.08)',
              border: '1px solid rgba(64,196,255,0.35)',
              boxShadow: '0 12px 32px rgba(0,109,255,0.25)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span
              className="tw-flex-none tw-w-8 tw-h-8 tw-rounded-full tw-grid tw-place-items-center"
              style={{ background: 'linear-gradient(135deg, #40C4FF 0%, #159BFF 100%)' }}
              aria-hidden="true"
            >
              <CheckIcon />
            </span>
            <div>
              <div className="tw-text-[11px] tw-font-bold tw-tracking-[0.08em] tw-uppercase tw-text-landing-cyan tw-mb-1">
                Como o CoolTrackPro resolve
              </div>
              <p className="tw-text-sm sm:tw-text-[15px] tw-leading-[1.55] tw-text-white">
                {activeProblem.solution}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12l5 5 9-12" />
    </svg>
  );
}

export default ProblemsSection;
