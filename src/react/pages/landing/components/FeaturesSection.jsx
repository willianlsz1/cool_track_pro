import { features } from '../data/landingMockData.js';
import { SectionHead } from './SegmentSection.jsx';
import {
  ClientesIcon,
  EquipamentosIcon,
  OrdensServicoIcon,
  PreventivasIcon,
  RelatoriosIcon,
  DashboardIcon,
} from '../icons/landingIcons.jsx';

/**
 * Mapeamento id → componente de icone. IDs vem de
 * `landingMockData.features` e correspondem ao sprite
 * `minimalist_app_icon_set_design.png` aprovado.
 */
const FEATURE_ICONS = {
  clientes: ClientesIcon,
  equipamentos: EquipamentosIcon,
  os: OrdensServicoIcon,
  preventivas: PreventivasIcon,
  relatorios: RelatoriosIcon,
  dashboard: DashboardIcon,
};

/**
 * Secao "Recursos" — fundo claro, grid 3 colunas. Cada card recebe seu
 * proprio icone (mapeado por id). Hover lift via Tailwind.
 */
export function FeaturesSection() {
  return (
    <section
      id="recursos"
      className="tw-py-16 sm:tw-py-20 lg:tw-py-24 tw-bg-white tw-text-landing-ink"
    >
      <div className="tw-max-w-[1280px] tw-mx-auto tw-px-6">
        <SectionHead
          eyebrow="Recursos"
          title="O que tem aqui dentro."
          description="Poucas peças, cada uma resolvendo uma dor real do técnico autônomo. Sem feature de empresa que ninguém usa. Sem complicação."
        />
        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-5">
          {features.map((f) => {
            const IconComp = FEATURE_ICONS[f.id];
            return (
              <article
                key={f.id}
                className="tw-bg-white tw-rounded-2xl tw-p-7 tw-shadow-[0_10px_30px_-12px_rgba(3,27,78,0.18),0_2px_6px_rgba(3,27,78,0.06)] tw-border tw-border-landing-line tw-transition-all tw-duration-200 hover:-tw-translate-y-1 hover:tw-shadow-[0_18px_40px_-16px_rgba(3,27,78,0.22)]"
              >
                <div
                  className="tw-w-14 tw-h-14 tw-rounded-2xl tw-grid tw-place-items-center tw-mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #e8f1ff 0%, #dbe9ff 100%)',
                    border: '1px solid #d5e3ff',
                  }}
                >
                  {IconComp ? <IconComp size={32} /> : null}
                </div>
                <h3 className="tw-text-[19px] tw-font-bold tw-mb-2 tw-tracking-[-0.01em]">
                  {f.title}
                </h3>
                <p className="tw-text-sm tw-text-landing-ink-2 tw-leading-[1.55]">
                  {f.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
