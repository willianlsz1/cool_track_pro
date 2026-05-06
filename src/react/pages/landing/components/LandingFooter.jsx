import {
  footerProductLinks,
  footerCompanyLinks,
  footerLegalLinks,
} from '../data/landingMockData.js';
import { BrandMark } from './BrandMark.jsx';

/**
 * Footer da landing — fundo navy escuro com 4 colunas (desktop) e 1
 * coluna empilhada (mobile). Sem socials reais neste PR — apenas
 * placeholder de links.
 */
export function LandingFooter() {
  return (
    <footer
      id="contato"
      className="tw-text-[#9fb3d4] tw-pt-16 tw-pb-7"
      style={{ background: 'linear-gradient(180deg, #020B2D 0%, #01081f 100%)' }}
    >
      <div className="tw-max-w-[1280px] tw-mx-auto tw-px-6">
        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-[1.4fr_1fr_1fr_1.2fr] tw-gap-10">
          <div>
            <a
              href="#topo"
              className="tw-flex tw-items-center tw-gap-2.5 tw-text-white visited:tw-text-white tw-font-bold tw-text-lg tw-tracking-tight tw-no-underline"
            >
              <BrandMark size={36} />
              CoolTrack
            </a>
            <p className="tw-text-[13.5px] tw-leading-[1.6] tw-mt-3.5 tw-max-w-[300px]">
              Ferramenta pra técnico autônomo de climatização e refrigeração registrar serviços,
              gerar PDF profissional e mandar pro cliente — tudo do celular.
            </p>
          </div>

          <FooterColumn title="Produto" links={footerProductLinks} />
          <FooterColumn title="Empresa" links={footerCompanyLinks} />

          <div>
            <h5 className="tw-text-white tw-text-sm tw-font-bold tw-mb-4 tw-tracking-[-0.005em]">
              Contato
            </h5>
            <ul className="tw-list-none tw-flex tw-flex-col tw-gap-2.5 tw-text-sm tw-p-0 tw-m-0">
              <li className="tw-flex tw-items-center tw-gap-2.5">
                <MailIcon size={14} />
                cooltracksuporte@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="tw-mt-12 tw-pt-5 tw-border-t tw-border-[rgba(255,255,255,0.08)] tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-gap-3 tw-text-[13px] tw-text-[#7d8fae]">
          <span>© 2026 CoolTrack. Todos os direitos reservados.</span>
          <nav
            aria-label="Documentos legais"
            className="tw-flex tw-flex-wrap tw-gap-x-5 tw-gap-y-1.5"
          >
            {footerLegalLinks.map((link) => (
              // Links internos do produto (paginas em `public/legal/`).
              // Abrem na mesma aba — sem `target="_blank"` (e portanto
              // sem `rel="noopener noreferrer"`, que so faz sentido em
              // links externos novos-aba).
              <a
                key={link.href}
                href={link.href}
                className="tw-text-inherit hover:tw-text-white focus-visible:tw-text-white tw-no-underline tw-transition-colors tw-rounded-sm"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h5 className="tw-text-white tw-text-sm tw-font-bold tw-mb-4 tw-tracking-[-0.005em]">
        {title}
      </h5>
      <ul className="tw-list-none tw-flex tw-flex-col tw-gap-2.5 tw-text-sm tw-p-0 tw-m-0">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <a
              href={link.href}
              className="tw-text-inherit hover:tw-text-white tw-no-underline tw-transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MailIcon({ size = 14 }) {
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
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export default LandingFooter;
