import { heroQuickCards } from '../data/landingMockData.js';

/**
 * Hero — coluna esquerda com badge, titulo, subtitulo e CTAs;
 * coluna direita reservada para o DashboardPreview (renderizado pela
 * page principal). Mobile empilha em coluna unica via grid responsivo.
 */
export function LandingHero({ onStart, dashboardSlot }) {
  return (
    <div
      id="topo"
      className="tw-relative tw-z-[2] tw-grid tw-grid-cols-1 lg:tw-grid-cols-[540px_1fr] tw-gap-8 lg:tw-gap-12 tw-px-6 sm:tw-px-10 lg:tw-px-20 tw-pt-10 tw-pb-6 tw-items-start"
    >
      <div className="tw-text-white">
        <span className="tw-inline-flex tw-items-center tw-gap-2 tw-px-3.5 tw-py-1.5 tw-rounded-full tw-bg-[rgba(64,196,255,0.1)] tw-border tw-border-[rgba(64,196,255,0.3)] tw-text-[#bfe6ff] tw-text-[13px] tw-font-medium">
          <span className="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-landing-cyan tw-shadow-[0_0_12px_currentColor]" />
          Plataforma para climatização e refrigeração
        </span>
        <h1 className="tw-text-4xl sm:tw-text-5xl lg:tw-text-6xl tw-leading-[1.04] tw-tracking-[-0.025em] tw-font-bold tw-mt-5 tw-mb-5">
          Gestão de manutenção para{' '}
          <span
            // Inline style garante o gradient + clip funcionarem mesmo se
            // o purge do Tailwind nao gerar a combinacao especifica de
            // classes. Replica exatamente o estilo do mockup aprovado.
            style={{
              background: 'linear-gradient(90deg, #159BFF 0%, #40C4FF 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            climatização e refrigeração
          </span>
          .
        </h1>
        <p className="tw-text-base sm:tw-text-[17px] tw-leading-[1.6] tw-text-[#bccae0] tw-max-w-[520px]">
          Controle clientes, equipamentos, ordens de serviço, preventivas, alertas e relatórios
          técnicos em uma plataforma feita para técnicos de ar-condicionado, câmaras frias,
          geladeiras comerciais e sistemas de refrigeração.
        </p>

        <div className="tw-mt-7">
          <button
            type="button"
            onClick={onStart}
            className="tw-inline-flex tw-items-center tw-gap-2 tw-px-5 tw-py-3.5 tw-rounded-xl tw-text-[15px] tw-font-semibold tw-text-white tw-shadow-[0_14px_34px_rgba(0,109,255,0.55)] hover:-tw-translate-y-px tw-transition-all tw-cursor-pointer tw-border-0"
            style={{
              background: 'linear-gradient(180deg, #1a82ff 0%, #006DFF 100%)',
              color: '#fff',
            }}
          >
            Começar agora
            <ArrowRightIcon size={14} />
          </button>
        </div>

        <div className="tw-mt-9 tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-2.5 tw-max-w-[520px]">
          {heroQuickCards.map((card) => (
            <div
              key={card.id}
              className="tw-flex tw-items-center tw-gap-2.5 tw-px-3 tw-py-3 tw-rounded-xl tw-bg-[rgba(255,255,255,0.05)] tw-border tw-border-[rgba(255,255,255,0.1)] tw-text-[13px] tw-text-[#dbe6f7] tw-font-medium"
            >
              <span
                className="tw-w-7 tw-h-7 tw-flex-none tw-rounded-lg tw-grid tw-place-items-center tw-text-landing-cyan"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(21,155,255,0.30) 0%, rgba(64,196,255,0.18) 100%)',
                }}
              >
                <CheckIcon size={14} />
              </span>
              {card.label}
            </div>
          ))}
        </div>
      </div>

      <div className="tw-mt-6 lg:tw-mt-0">{dashboardSlot}</div>
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

function CheckIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12l5 5 9-12" />
    </svg>
  );
}

export default LandingHero;
