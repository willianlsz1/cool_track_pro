import { createPortal } from 'react-dom';

import { DASHBOARD_ACTIONS, DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';

const EMPTY_PRO_DRAFT = Object.freeze({
  tier: 'free',
  proCards: {
    visible: false,
    upgradeCta: null,
    critical: {
      label: 'Alertas criticos',
      title: 'Tudo sob controle',
      subtitle: 'Sem alertas criticos agora.',
      actions: [],
    },
    riskClients: {
      label: 'Clientes em risco',
      title: 'Clientes em dia',
      subtitle: 'Nenhum cliente exige atencao agora.',
      actions: [],
    },
  },
  draft: null,
});

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

function ProAction({ action }) {
  const label = text(action?.label);
  if (!label) return null;

  return (
    <button
      className="dash__card-cta"
      data-action={dataValue(action.action)}
      data-id={dataValue(action.id)}
      data-nav={dataValue(action.nav)}
      type="button"
    >
      {label}
    </button>
  );
}

function UpgradeContract({ cta }) {
  if (!cta) return null;

  return (
    <button className="dash__card-cta" data-nav={dataValue(cta.nav)} hidden type="button">
      {text(cta.label, 'Conhecer Pro')}
    </button>
  );
}

function ProCards({ proCards }) {
  const critical = proCards?.critical || EMPTY_PRO_DRAFT.proCards.critical;
  const riskClients = proCards?.riskClients || EMPTY_PRO_DRAFT.proCards.riskClients;

  return (
    <>
      <article className="dash__card" id={DASHBOARD_PUBLIC_IDS.criticalAlertsCard}>
        <div className="dash__card-label">{text(critical.label, 'Alertas criticos')}</div>
        <div className="dash__card-title" id={DASHBOARD_PUBLIC_IDS.criticalAlertsTitle}>
          {text(critical.title, 'Tudo sob controle')}
        </div>
        <div className="dash__card-sub" id={DASHBOARD_PUBLIC_IDS.criticalAlertsSubtitle}>
          {text(critical.subtitle, 'Sem alertas criticos agora.')}
        </div>
        <div className="dash__card-desc" id={DASHBOARD_PUBLIC_IDS.criticalAlertsList}>
          {items(critical.actions).map((action, index) => (
            <ProAction action={action} key={`${text(action?.id, index)}-${text(action?.label)}`} />
          ))}
        </div>
      </article>

      <article className="dash__card" id={DASHBOARD_PUBLIC_IDS.riskClientsCard}>
        <div className="dash__card-label">{text(riskClients.label, 'Clientes em risco')}</div>
        <div className="dash__card-title" id={DASHBOARD_PUBLIC_IDS.riskClientsTitle}>
          {text(riskClients.title, 'Clientes em dia')}
        </div>
        <div className="dash__card-sub" id={DASHBOARD_PUBLIC_IDS.riskClientsSubtitle}>
          {text(riskClients.subtitle, 'Nenhum cliente exige atencao agora.')}
        </div>
        <div className="dash__card-desc" id={DASHBOARD_PUBLIC_IDS.riskClientsList}>
          {items(riskClients.actions).map((action, index) => (
            <ProAction action={action} key={`${text(action?.nav, index)}-${text(action?.label)}`} />
          ))}
        </div>
      </article>

      <UpgradeContract cta={proCards?.upgradeCta} />
    </>
  );
}

function ContinueDraftCard({ draft }) {
  if (!draft?.visible) return null;

  const id = dataValue(draft.id);
  const title = draft.isEdit ? 'Continuar edicao de servico' : 'Voltar ao registro em andamento';
  const equipmentName = text(draft.equipmentName);

  return (
    <article
      className="dash__continue-card"
      data-action={DASHBOARD_ACTIONS.continueDraft}
      data-id={id}
    >
      <span className="dash__continue-card__icon" aria-hidden="true">
        <svg
          fill="none"
          height="18"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
          viewBox="0 0 24 24"
          width="18"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
      </span>
      <div className="dash__continue-card__body">
        <div className="dash__continue-card__title">{title}</div>
        <div className="dash__continue-card__sub">
          {equipmentName ? (
            <>
              Equipamento: <strong>{equipmentName}</strong>
            </>
          ) : (
            'Voce tem um rascunho aguardando finalizacao.'
          )}
        </div>
      </div>
      <button
        className="dash__continue-card__cta"
        data-action={DASHBOARD_ACTIONS.continueDraft}
        data-id={id}
        type="button"
      >
        Continuar
        <svg
          aria-hidden="true"
          fill="none"
          height="13"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="13"
        >
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>
      <button
        aria-label="Descartar rascunho"
        className="dash__continue-card__close"
        data-action={DASHBOARD_ACTIONS.discardDraft}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="14"
        >
          <line x1="18" x2="6" y1="6" y2="18" />
          <line x1="6" x2="18" y1="6" y2="18" />
        </svg>
      </button>
      {draft.nav ? <span data-nav={dataValue(draft.nav)} hidden /> : null}
    </article>
  );
}

export function DashboardProDraft({ proDraft = EMPTY_PRO_DRAFT, draftRoot = null }) {
  const model = {
    ...EMPTY_PRO_DRAFT,
    ...(proDraft || {}),
    proCards: {
      ...EMPTY_PRO_DRAFT.proCards,
      ...(proDraft?.proCards || {}),
    },
  };
  const draftCard = <ContinueDraftCard draft={model.draft} />;

  return (
    <>
      <ProCards proCards={model.proCards} />
      {draftRoot ? createPortal(draftCard, draftRoot) : null}
    </>
  );
}
