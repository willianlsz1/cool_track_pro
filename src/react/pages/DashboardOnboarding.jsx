import { createPortal } from 'react-dom';

import { DASHBOARD_ACTIONS, DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';

const DEFAULT_MODEL = Object.freeze({
  tier: 'free',
  empty: { visible: false, state: null },
  installPrompt: { state: 'hidden' },
  checklist: { visible: false, completed: 0, total: 0, percent: 0, steps: [] },
  overflow: { visible: false, state: { overLimit: false } },
});

const OVERFLOW_STYLES = `
  .dash-overflow-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    margin: 10px 0 14px;
    background: color-mix(in srgb, var(--danger) 8%, var(--surface));
    border: 1px solid color-mix(in srgb, var(--danger) 28%, transparent);
    border-left: 3px solid var(--danger);
    border-radius: 10px;
    font-size: 13px;
    color: var(--text);
  }

  .dash-overflow-banner__icon {
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    color: var(--danger);
  }

  .dash-overflow-banner__text {
    flex: 1 1 auto;
    line-height: 1.4;
  }

  .dash-overflow-banner__text strong {
    color: var(--text);
    font-weight: 700;
  }

  .dash-overflow-banner__cta {
    flex: 0 0 auto;
    border: 1px solid color-mix(in srgb, var(--danger) 45%, transparent);
    background: transparent;
    color: var(--danger);
    font-weight: 700;
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
  }

  .dash-overflow-banner__cta:hover,
  .dash-overflow-banner__cta:focus-visible {
    background: color-mix(in srgb, var(--danger) 10%, transparent);
  }

  @media (max-width: 640px) {
    .dash-overflow-banner {
      flex-wrap: wrap;
      gap: 8px;
    }

    .dash-overflow-banner__text {
      flex-basis: 100%;
      order: 2;
    }

    .dash-overflow-banner__cta {
      order: 3;
      margin-left: auto;
    }
  }
`;

function items(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function dataValue(value) {
  const normalized = text(value);
  return normalized ? normalized : undefined;
}

function EmptyCta({ cta }) {
  if (!cta) return null;

  const toneClass = cta.tone === 'outline' ? 'btn--outline' : 'btn--primary';
  const classes = [
    'btn',
    toneClass,
    cta.size === 'sm' ? 'btn--sm' : '',
    cta.autoWidth ? 'btn--auto' : '',
    cta.centered ? 'btn--centered' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      data-action={dataValue(cta.action)}
      data-hist-action={dataValue(cta.histAction)}
      data-id={dataValue(cta.id)}
      data-nav={dataValue(cta.nav)}
      data-testid={dataValue(cta.testid)}
      type="button"
    >
      {text(cta.label, 'Continuar')}
    </button>
  );
}

function EmptyState({ empty }) {
  if (!empty?.visible) return null;

  const state = empty.state || {};

  return (
    <div className="empty-state">
      <div className="empty-state__icon">{text(state.icon, '-')}</div>
      <div className="empty-state__title">{text(state.title)}</div>
      {state.description ? <div className="empty-state__sub">{text(state.description)}</div> : null}
      {state.cta ? (
        <div className="empty-state__cta">
          <EmptyCta cta={state.cta} />
        </div>
      ) : null}
    </div>
  );
}

function InstallPhoneIcon() {
  return (
    <svg
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="20"
    >
      <rect height="20" rx="2" width="14" x="5" y="2" />
      <line x1="12" x2="12.01" y1="18" y2="18" />
    </svg>
  );
}

function InstallShareIcon() {
  return (
    <svg
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="20"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

function CloseIcon({ size = 14 }) {
  return (
    <svg
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
    >
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

function InstallPrompt({ installPrompt }) {
  const state = installPrompt?.state;
  if (state === 'available') {
    return (
      <article className="install-card" role="region" aria-label="Instalar aplicativo">
        <span className="install-card__icon" aria-hidden="true">
          <InstallPhoneIcon />
        </span>
        <div className="install-card__body">
          <p className="install-card__title">Instale o CoolTrack como app</p>
          <p className="install-card__sub">
            {'Notificações nativas no celular, ícone na tela inicial, abre offline.'}
          </p>
        </div>
        <button
          className="btn btn--primary btn--sm install-card__cta"
          data-action="install-app-prompt"
          type="button"
        >
          Instalar
        </button>
        <button
          aria-label="Dispensar"
          className="install-card__close"
          data-action="install-app-dismiss"
          type="button"
        >
          <CloseIcon />
        </button>
      </article>
    );
  }

  if (state === 'ios') {
    return (
      <article
        className="install-card install-card--ios"
        role="region"
        aria-label="Instalar aplicativo no iPhone"
      >
        <span className="install-card__icon" aria-hidden="true">
          <InstallShareIcon />
        </span>
        <div className="install-card__body">
          <p className="install-card__title">{'Adicione o app à Tela de Início'}</p>
          <p className="install-card__sub">
            No Safari, toque em <strong>Compartilhar</strong> e depois em{' '}
            <strong>{'Adicionar à Tela de Início'}</strong>
            {' — assim as notificações funcionam como app nativo.'}
          </p>
        </div>
        <button
          aria-label="Dispensar"
          className="install-card__close"
          data-action="install-app-dismiss"
          type="button"
        >
          <CloseIcon />
        </button>
      </article>
    );
  }

  return null;
}

function DoneIcon() {
  return (
    <svg
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      width="14"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="onb-step__chev"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="14"
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

function Checklist({ checklist }) {
  if (!checklist?.visible) return null;

  const completed = Number.isFinite(checklist.completed) ? checklist.completed : 0;
  const total = Number.isFinite(checklist.total) ? checklist.total : items(checklist.steps).length;
  const percent = Number.isFinite(checklist.percent) ? checklist.percent : 0;

  return (
    <article className="onb-card" role="region" aria-label="Primeiros passos">
      <header className="onb-card__head">
        <div className="onb-card__head-text">
          <h3 className="onb-card__title">Primeiros passos</h3>
          <p className="onb-card__sub">
            {completed}
            {' de '}
            {total}
            {' concluídos · '}
            {percent}%
          </p>
        </div>
        <button
          aria-label="Dispensar checklist"
          className="onb-card__close"
          data-action={DASHBOARD_ACTIONS.onboardingDismiss}
          type="button"
        >
          <CloseIcon size={16} />
        </button>
      </header>

      <div className="onb-card__progress" aria-hidden="true">
        <div className="onb-card__progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <ol className="onb-card__steps" role="list">
        {items(checklist.steps).map((step, idx) => {
          const done = step?.completed === true;
          const order = Number.isFinite(step?.order) ? step.order : idx + 1;
          return (
            <li
              className={`onb-step${done ? ' is-done' : ''}`}
              data-nav={done ? undefined : dataValue(step?.nav)}
              key={`${text(step?.id, idx)}-${text(step?.label)}`}
              role={done ? 'presentation' : 'button'}
              tabIndex={done ? undefined : 0}
            >
              <span className="onb-step__check" aria-hidden="true">
                {done ? <DoneIcon /> : <span className="onb-step__num">{order}</span>}
              </span>
              <span className="onb-step__body">
                <span className="onb-step__label">{text(step?.label)}</span>
                <span className="onb-step__sub">{text(step?.sub)}</span>
              </span>
              {done ? null : <ChevronIcon />}
            </li>
          );
        })}
      </ol>
    </article>
  );
}

function overflowCopy(state) {
  if (state?.limitType === 'equipamentos') {
    return `Você cadastrou ${text(state.equipCount, 0)} equipamentos — o plano grátis permite ${text(state.equipLimit, 0)}.`;
  }
  if (state?.limitType === 'registros') {
    return `Você registrou ${text(state.reportCount, 0)} serviços este mês — o plano grátis permite ${text(state.reportLimit, 0)}.`;
  }
  return 'Você ultrapassou os limites do plano grátis (equipamentos e registros).';
}

function Overflow({ overflow }) {
  const state = overflow?.state || {};
  if (!overflow?.visible || !state.overLimit) return null;

  return (
    <aside
      aria-live="polite"
      className="dash-overflow-banner"
      data-limit-type={dataValue(state.limitType)}
      role="status"
    >
      <style>{OVERFLOW_STYLES}</style>
      <svg
        aria-hidden="true"
        className="dash-overflow-banner__icon"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M12 3L2 20h20L12 3z" />
        <path d="M12 10v4M12 17.5v.01" />
      </svg>
      <span className="dash-overflow-banner__text">{overflowCopy(state)}</span>
      <button
        className="dash-overflow-banner__cta"
        data-action={DASHBOARD_ACTIONS.openUpgrade}
        data-highlight-plan="plus"
        data-upgrade-source="overflow_banner"
        type="button"
      >
        {'Ver planos →'}
      </button>
    </aside>
  );
}

export function DashboardOnboarding({
  onboarding = DEFAULT_MODEL,
  emptyRoot = null,
  overflowRoot = null,
}) {
  const model = {
    ...DEFAULT_MODEL,
    ...(onboarding || {}),
    empty: { ...DEFAULT_MODEL.empty, ...(onboarding?.empty || {}) },
    installPrompt: {
      ...DEFAULT_MODEL.installPrompt,
      ...(onboarding?.installPrompt || {}),
    },
    checklist: { ...DEFAULT_MODEL.checklist, ...(onboarding?.checklist || {}) },
    overflow: { ...DEFAULT_MODEL.overflow, ...(onboarding?.overflow || {}) },
  };

  return (
    <>
      {emptyRoot ? createPortal(<EmptyState empty={model.empty} />, emptyRoot) : null}
      <InstallPrompt installPrompt={model.installPrompt} />
      <div id={DASHBOARD_PUBLIC_IDS.proDraftRoot} style={{ display: 'contents' }} />
      <Checklist checklist={model.checklist} />
      {overflowRoot ? createPortal(<Overflow overflow={model.overflow} />, overflowRoot) : null}
    </>
  );
}
