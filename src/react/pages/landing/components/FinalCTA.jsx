import coolingTechAsset from '../assets/cooling-tech.png';

/**
 * CTA final — gradiente azul, foto dos equipamentos a esquerda e
 * unico botao "Comecar agora" a direita.
 *
 * O asset `cooling-tech.png` foi importado em
 * `src/react/pages/landing/assets/` e e processado pelo Vite (hash no
 * nome final, otimizacao automatica). Mostra condensadora + camara
 * fria + split hi-wall conforme referencia visual aprovada.
 */
export function FinalCTA({ onStart }) {
  return (
    <div id="relatorios" className="tw-py-16 sm:tw-py-20 tw-bg-white">
      <div className="tw-max-w-[1280px] tw-mx-auto tw-px-6">
        <div
          className="tw-relative tw-overflow-hidden tw-rounded-[28px] tw-text-white tw-px-8 sm:tw-px-12 lg:tw-px-16 tw-py-12 sm:tw-py-14 tw-grid tw-grid-cols-1 lg:tw-grid-cols-[320px_1fr] tw-gap-8 lg:tw-gap-10 tw-items-center tw-shadow-[0_30px_80px_-30px_rgba(0,109,255,0.55)]"
          style={{
            background:
              'radial-gradient(700px 280px at 100% 100%, rgba(64,196,255,0.55) 0%, transparent 60%), linear-gradient(120deg, #0050d6 0%, #006DFF 45%, #159BFF 100%)',
          }}
        >
          {/* Ondas decorativas no fundo do CTA — refletem o estilo do
              hero, dando coesao visual a toda a landing. */}
          <svg
            className="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-pointer-events-none tw-opacity-30"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 280 C 200 220, 400 340, 600 280 S 1000 220, 1200 280"
              stroke="#fff"
              strokeOpacity="0.4"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M0 320 C 220 260, 440 380, 640 320 S 1040 260, 1200 320"
              stroke="#40C4FF"
              strokeOpacity="0.35"
              strokeWidth="1"
              fill="none"
            />
          </svg>

          <div
            className="tw-relative tw-hidden lg:tw-flex tw-items-center tw-justify-center"
            aria-hidden="true"
          >
            <img
              src={coolingTechAsset}
              alt=""
              className="tw-relative tw-w-full tw-max-w-[320px] tw-h-auto tw-object-contain tw-drop-shadow-[0_18px_30px_rgba(2,11,45,0.45)]"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div>
            <h2 className="tw-text-2xl sm:tw-text-3xl lg:tw-text-[32px] tw-leading-[1.2] tw-font-bold tw-tracking-[-0.015em] tw-max-w-[720px]">
              Organize sua operação antes que seus atendimentos virem só áudio, foto perdida e
              anotação no bloco de notas.
            </h2>
            <p className="tw-text-base tw-text-[rgba(255,255,255,0.85)] tw-my-3.5 tw-max-w-[680px]">
              Mais organização, mais profissionalismo e mais tempo para o que importa.
            </p>
            <div className="tw-mt-6">
              <button
                type="button"
                onClick={onStart}
                className="tw-inline-flex tw-items-center tw-gap-2 tw-px-5 tw-py-3.5 tw-rounded-xl tw-text-[15px] tw-font-bold tw-text-landing-blue tw-bg-white tw-shadow-[0_4px_14px_rgba(3,27,78,0.08)] hover:-tw-translate-y-px tw-transition-all tw-cursor-pointer tw-border-0"
              >
                Começar agora
                <ArrowRightIcon size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRightIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default FinalCTA;
