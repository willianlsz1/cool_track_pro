import { problems } from '../data/landingMockData.js';
import { SectionHead } from './SegmentSection.jsx';

/**
 * Secao "Os problemas que travam a operacao" — fundo escuro com
 * gradient. Grid 3 colunas, glass-effect cards.
 */
export function ProblemsSection() {
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
          description="Sinais comuns no dia a dia de quem atende climatização e refrigeração — e que o CoolTrackPro resolve."
        />
        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4 sm:tw-gap-5">
          {problems.map((p) => (
            <article
              key={p.id}
              className="tw-bg-[rgba(255,255,255,0.04)] tw-border tw-border-[rgba(120,170,230,0.18)] tw-rounded-2xl tw-p-5 tw-backdrop-blur-sm tw-transition-all tw-duration-200 hover:-tw-translate-y-0.5 hover:tw-bg-[rgba(255,255,255,0.07)]"
            >
              <div
                className="tw-w-[46px] tw-h-[46px] tw-rounded-xl tw-text-landing-cyan tw-grid tw-place-items-center tw-mb-4"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(21,155,255,0.18) 0%, rgba(64,196,255,0.10) 100%)',
                  border: '1px solid rgba(64,196,255,0.3)',
                }}
              >
                <DotMark />
              </div>
              <h3 className="tw-text-base tw-font-bold tw-mb-1.5 tw-text-white">{p.title}</h3>
              <p className="tw-text-sm tw-text-[#a8bcd9] tw-leading-[1.5]">{p.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DotMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

export default ProblemsSection;
