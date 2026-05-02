import { segments } from '../data/landingMockData.js';
import {
  ArSplitIcon,
  ArComercialIcon,
  CamaraFriaIcon,
  FreezerIcon,
  IndustrialIcon,
  PmocIcon,
} from '../icons/landingIcons.jsx';

/**
 * Mapeamento id → componente de icone. IDs vem de
 * `landingMockData.segments` e correspondem ao sprite
 * `refrigeration_and_air_conditioning_icons.png` aprovado.
 */
const SEGMENT_ICONS = {
  split: ArSplitIcon,
  comercial: ArComercialIcon,
  camara: CamaraFriaIcon,
  freezer: FreezerIcon,
  industrial: IndustrialIcon,
  pmoc: PmocIcon,
};

/**
 * Secao "Segmentos atendidos" — fundo claro, grid 3 colunas (desktop),
 * 2 colunas (tablet), 1 coluna (mobile). Hover lift via Tailwind.
 */
export function SegmentSection() {
  return (
    <section id="segmentos" className="tw-py-16 sm:tw-py-20 lg:tw-py-24 tw-bg-landing-off">
      <div className="tw-max-w-[1280px] tw-mx-auto tw-px-6">
        <SectionHead
          eyebrow="Segmentos atendidos"
          title="Feito para quem trabalha com climatização e refrigeração"
          description="Solução especializada para técnicos e empresas que atuam em sistemas de climatização e refrigeração."
        />
        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-5">
          {segments.map((seg) => {
            const IconComp = SEGMENT_ICONS[seg.id];
            return (
              <article
                key={seg.id}
                className="tw-bg-white tw-border tw-border-landing-line tw-rounded-2xl tw-p-6 tw-transition-all tw-duration-200 hover:-tw-translate-y-0.5 hover:tw-shadow-[0_10px_30px_-12px_rgba(3,27,78,0.18),0_2px_6px_rgba(3,27,78,0.06)] hover:tw-border-[#cfe0ff]"
              >
                <div
                  className="tw-w-[54px] tw-h-[54px] tw-rounded-2xl tw-grid tw-place-items-center tw-mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #e8f1ff 0%, #dbe9ff 100%)',
                    border: '1px solid #d5e3ff',
                  }}
                >
                  {IconComp ? <IconComp size={32} /> : null}
                </div>
                <h3 className="tw-text-lg tw-font-bold tw-mb-1.5 tw-tracking-[-0.01em] tw-text-landing-ink">
                  {seg.title}
                </h3>
                <p className="tw-text-sm tw-text-landing-ink-2 tw-leading-[1.5]">
                  {seg.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, description, dark }) {
  return (
    <div className="tw-text-center tw-max-w-[760px] tw-mx-auto tw-mb-14">
      <span
        className={`tw-text-[13px] tw-font-semibold tw-tracking-[0.04em] tw-uppercase ${
          dark ? 'tw-text-landing-cyan' : 'tw-text-landing-blue-vivid'
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`tw-text-3xl sm:tw-text-4xl lg:tw-text-[42px] tw-leading-[1.1] tw-tracking-[-0.02em] tw-font-bold tw-mb-3.5 tw-mt-3.5 ${
          dark ? 'tw-text-white' : 'tw-text-landing-ink'
        }`}
      >
        {title}
      </h2>
      <p
        className={`tw-text-base sm:tw-text-[17px] tw-leading-[1.55] ${
          dark ? 'tw-text-[#9fb3d4]' : 'tw-text-landing-ink-2'
        }`}
      >
        {description}
      </p>
    </div>
  );
}

export default SegmentSection;
