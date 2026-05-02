import { navItems } from '../data/landingMockData.js';
import { BrandMark } from './BrandMark.jsx';

/**
 * Header da landing — logo + menu (desktop) + CTA "Comecar agora".
 * Mobile esconde o menu (PR 1 — sem hamburger). Layout simples para
 * permitir ajustes finos na PR de responsividade.
 *
 * Scroll suave (PR 2): clicar num link de ancora `#secao` rola
 * suavemente ate a secao via `scrollIntoView({ behavior: 'smooth' })`.
 * Usuarios com `prefers-reduced-motion` recebem fallback `auto` (jump).
 */
function handleNavClick(href) {
  return (event) => {
    if (typeof href !== 'string' || !href.startsWith('#')) return;
    const targetId = href.slice(1);
    if (!targetId) return;
    const target = typeof document !== 'undefined' ? document.getElementById(targetId) : null;
    if (!target) return;
    event.preventDefault();
    const reduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
}

export function LandingHeader({ onStart }) {
  return (
    <header className="tw-relative tw-z-10 tw-flex tw-items-center tw-justify-between tw-px-6 sm:tw-px-10 lg:tw-px-20 tw-py-5">
      <a
        href="#topo"
        onClick={handleNavClick('#topo')}
        className="tw-flex tw-items-center tw-gap-2.5 tw-text-white visited:tw-text-white tw-font-bold tw-text-lg tw-tracking-tight tw-no-underline"
      >
        <BrandMark size={36} />
        CoolTrack<span className="tw-text-landing-cyan tw-font-semibold">Pro</span>
      </a>

      <nav
        aria-label="Navegação principal da landing"
        className="tw-hidden md:tw-flex tw-gap-8 tw-text-sm tw-text-[#cdd9ee] tw-font-medium"
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={handleNavClick(item.href)}
            className="tw-text-inherit hover:tw-text-white tw-transition-colors tw-no-underline"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <button
        type="button"
        onClick={onStart}
        className="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 sm:tw-px-5 tw-py-3 tw-rounded-xl tw-text-sm tw-font-semibold tw-shadow-[0_8px_22px_rgba(0,109,255,0.45)] hover:tw-shadow-[0_12px_26px_rgba(0,109,255,0.55)] hover:-tw-translate-y-px tw-transition-all tw-cursor-pointer tw-border-0"
        style={{
          background: 'linear-gradient(180deg, #1a82ff 0%, #006DFF 100%)',
          color: '#fff',
        }}
      >
        Começar agora
        <ArrowRightIcon size={14} />
      </button>
    </header>
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

export default LandingHeader;
