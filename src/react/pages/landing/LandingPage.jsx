import { useCallback } from 'react';
import { LandingHeader } from './components/LandingHeader.jsx';
import { LandingHero } from './components/LandingHero.jsx';
import { DashboardPreview } from './components/DashboardPreview.jsx';
import { SegmentSection } from './components/SegmentSection.jsx';
import { ProblemsSection } from './components/ProblemsSection.jsx';
import { FeaturesSection } from './components/FeaturesSection.jsx';
import { WorkflowSection } from './components/WorkflowSection.jsx';
import { FinalCTA } from './components/FinalCTA.jsx';
import { LandingFooter } from './components/LandingFooter.jsx';

/**
 * LandingPage — page raiz da nova landing React+Tailwind.
 *
 * PR 1 (atras de feature-flag `useReactLandingPage`):
 *  - estatica (sem abas no dashboard preview, sem etapa interativa
 *    no workflow);
 *  - CTA unico "Comecar agora" delega ao fluxo legado de auth via
 *    callback `onStart` injetado pelo entrypoint.
 *
 * Layout: hero com fundo escuro + waves SVG decorativas + dashboard
 * preview a direita (desktop) ou abaixo (mobile/tablet). Secoes
 * alternam fundo claro/escuro para guiar a leitura.
 */
export function LandingPage({ onStart }) {
  const handleStart = useCallback(() => {
    if (typeof onStart === 'function') {
      onStart();
    }
  }, [onStart]);

  return (
    <div
      className="tw-min-h-screen tw-bg-landing-off tw-text-landing-ink"
      data-react-landing-page-mounted="true"
      style={{
        fontFamily:
          "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <HeroBackground>
        <LandingHeader onStart={handleStart} />
        <LandingHero onStart={handleStart} dashboardSlot={<DashboardPreview />} />
      </HeroBackground>

      <SegmentSection />
      <ProblemsSection />
      <FeaturesSection />
      <WorkflowSection />
      <FinalCTA onStart={handleStart} />
      <LandingFooter />
    </div>
  );
}

/**
 * Wrapper visual do hero — fundo navy com gradients radiais + decorativo
 * waves SVG. Implementado como container com `style` inline porque
 * radial-gradient com posicoes nao-padrao fica mais limpo em CSS-in-JS
 * do que tentando reproduzir com utilitarios do Tailwind.
 */
function HeroBackground({ children }) {
  return (
    <div
      className="tw-relative tw-text-white tw-overflow-hidden tw-pb-20"
      style={{
        background:
          'radial-gradient(1200px 600px at 80% -10%, #0a3da8 0%, transparent 60%), radial-gradient(900px 500px at 5% 110%, #00417a 0%, transparent 55%), linear-gradient(180deg, #020B2D 0%, #031B4E 65%, #041f5a 100%)',
      }}
    >
      <div
        className="tw-absolute tw-inset-0 tw-pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: [
            'radial-gradient(2px 2px at 12% 22%, rgba(255,255,255,.35), transparent 50%)',
            'radial-gradient(1.5px 1.5px at 78% 12%, rgba(64,196,255,.55), transparent 50%)',
            'radial-gradient(1.5px 1.5px at 33% 70%, rgba(255,255,255,.25), transparent 50%)',
            'radial-gradient(1.5px 1.5px at 88% 60%, rgba(255,255,255,.30), transparent 50%)',
          ].join(','),
        }}
      />
      <svg
        className="tw-absolute tw-left-0 tw-right-0 tw-bottom-0 tw-h-[280px] tw-w-full tw-opacity-[0.35] tw-pointer-events-none"
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 200 C 240 120, 480 280, 720 200 S 1200 120, 1440 200 L1440 280 L0 280 Z"
          fill="url(#landingHeroG1)"
          opacity=".25"
        />
        <path
          d="M0 230 C 260 170, 520 290, 760 220 S 1200 160, 1440 230"
          stroke="url(#landingHeroG2)"
          strokeWidth="1.2"
          fill="none"
          opacity=".55"
        />
        <path
          d="M0 250 C 240 200, 520 320, 780 240 S 1240 190, 1440 250"
          stroke="url(#landingHeroG2)"
          strokeWidth="1"
          fill="none"
          opacity=".35"
        />
        <defs>
          <linearGradient id="landingHeroG1" x1="0" x2="1">
            <stop offset="0" stopColor="#0a3da8" />
            <stop offset="1" stopColor="#159BFF" />
          </linearGradient>
          <linearGradient id="landingHeroG2" x1="0" x2="1">
            <stop offset="0" stopColor="#40C4FF" />
            <stop offset="1" stopColor="#159BFF" />
          </linearGradient>
        </defs>
      </svg>
      {children}
    </div>
  );
}

export default LandingPage;
