import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';

const EMPTY_NEXT_ACTION = Object.freeze({
  tone: 'ok',
  title: 'Nenhuma ação urgente',
  subtitle: 'Sem pendências imediatas no momento.',
  cta: {
    nav: 'historico',
    label: 'Ver histórico',
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

export function DashboardNextAction({ nextAction = EMPTY_NEXT_ACTION }) {
  const model = nextAction || EMPTY_NEXT_ACTION;
  const cta = model.cta || EMPTY_NEXT_ACTION.cta;

  return (
    <>
      <div className="dash__card-label">Próxima ação</div>
      <div className="dash__card-title" id={DASHBOARD_PUBLIC_IDS.nextActionTitle}>
        {text(model.title, EMPTY_NEXT_ACTION.title)}
      </div>
      <div className="dash__card-sub" id={DASHBOARD_PUBLIC_IDS.nextActionSubtitle}>
        {text(model.subtitle, EMPTY_NEXT_ACTION.subtitle)}
      </div>
      <button
        className="dash__card-cta"
        id={DASHBOARD_PUBLIC_IDS.nextActionCta}
        type="button"
        data-nav={dataValue(cta.nav)}
        data-action={dataValue(cta.action)}
        data-id={dataValue(cta.id)}
      >
        <span className="dash__card-cta-label" id={DASHBOARD_PUBLIC_IDS.nextActionCtaLabel}>
          {text(cta.label, EMPTY_NEXT_ACTION.cta.label)}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </>
  );
}
