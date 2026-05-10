import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';

const DEFAULT_HERO = Object.freeze({
  tier: 'free',
  tone: 'ok',
  greeting: 'Olá, Técnico',
  summary: '0 equipamentos • 0 serviços no mês',
  primaryCta: {
    action: 'start-service-registration',
    label: 'Registrar serviço',
  },
  secondaryCta: {
    action: 'open-modal',
    id: 'modal-add-eq',
    label: 'Cadastrar equipamento',
  },
});

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function dataValue(value) {
  const normalized = text(value);
  return normalized ? normalized : undefined;
}

function ctaModel(cta, fallback) {
  if (!cta) return fallback;
  return {
    ...cta,
    label: text(cta.label, fallback.label),
  };
}

export function DashboardHero({ hero = DEFAULT_HERO }) {
  const model = {
    ...DEFAULT_HERO,
    ...(hero || {}),
  };
  const primaryCta = ctaModel(model.primaryCta, DEFAULT_HERO.primaryCta);
  const secondaryCta = ctaModel(model.secondaryCta, DEFAULT_HERO.secondaryCta);

  return (
    <>
      <div className="dash__hero-body">
        <h1 className="dash__hero-greeting" id={DASHBOARD_PUBLIC_IDS.heroGreeting}>
          {text(model.greeting, DEFAULT_HERO.greeting)}
        </h1>
        <p className="dash__hero-summary" id={DASHBOARD_PUBLIC_IDS.heroSummary}>
          {text(model.summary, DEFAULT_HERO.summary)}
        </p>
      </div>
      <div className="dash__hero-cta-wrap">
        <button
          className="dash__hero-cta"
          id={DASHBOARD_PUBLIC_IDS.heroCta}
          type="button"
          data-nav={dataValue(primaryCta.nav)}
          data-action={dataValue(primaryCta.action)}
          data-id={dataValue(primaryCta.id)}
        >
          <span className="dash__hero-cta-label" id={DASHBOARD_PUBLIC_IDS.heroCtaLabel}>
            {text(primaryCta.label, DEFAULT_HERO.primaryCta.label)}
          </span>
        </button>
        <button
          className="dash__hero-cta dash__hero-cta--secondary"
          id={DASHBOARD_PUBLIC_IDS.heroSecondaryCta}
          type="button"
          data-nav={dataValue(secondaryCta.nav)}
          data-action={dataValue(secondaryCta.action)}
          data-id={dataValue(secondaryCta.id)}
        >
          <span className="dash__hero-cta-label" id={DASHBOARD_PUBLIC_IDS.heroSecondaryCtaLabel}>
            {text(secondaryCta.label, DEFAULT_HERO.secondaryCta.label)}
          </span>
        </button>
      </div>
    </>
  );
}
