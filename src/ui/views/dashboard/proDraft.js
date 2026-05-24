import { DASHBOARD_ACTIONS, DASHBOARD_PUBLIC_IDS } from '../../viewModels/dashboardContracts.js';

const EMPTY_PRO_DRAFT = Object.freeze({
  tier: 'free',
  proCards: {
    visible: false,
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

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function dataValue(value) {
  const normalized = text(value);
  return normalized ? normalized : null;
}

function items(value) {
  return Array.isArray(value) ? value : [];
}

function setOptionalDataAttribute(element, name, value) {
  const normalized = dataValue(value);
  if (normalized) {
    element.setAttribute(name, normalized);
    return;
  }
  element.removeAttribute(name);
}

function appendText(parent, tagName, className, value, options = {}) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (options.id) element.id = options.id;
  if (options.ariaHidden) element.setAttribute('aria-hidden', 'true');
  element.textContent = text(value);
  parent.appendChild(element);
  return element;
}

function appendIconSvg(parent, paths, attrs = {}) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('stroke-width', attrs.strokeWidth || '2');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', attrs.width || '14');
  svg.setAttribute('height', attrs.height || '14');
  if (attrs.ariaHidden) svg.setAttribute('aria-hidden', 'true');

  paths.forEach((pathConfig) => {
    const element = document.createElementNS(
      'http://www.w3.org/2000/svg',
      pathConfig.tag || 'path',
    );
    Object.entries(pathConfig.attrs || {}).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
    svg.appendChild(element);
  });

  parent.appendChild(svg);
  return svg;
}

function buildModel(proDraft) {
  return {
    ...EMPTY_PRO_DRAFT,
    ...(proDraft || {}),
    proCards: {
      ...EMPTY_PRO_DRAFT.proCards,
      ...(proDraft?.proCards || {}),
    },
  };
}

function appendProAction(parent, action) {
  const label = text(action?.label);
  if (!label) return null;

  const button = document.createElement('button');
  button.className = 'dash__card-cta';
  button.type = 'button';
  setOptionalDataAttribute(button, 'data-action', action?.action);
  setOptionalDataAttribute(button, 'data-id', action?.id);
  setOptionalDataAttribute(button, 'data-nav', action?.nav);
  button.textContent = label;
  parent.appendChild(button);
  return button;
}

function appendProCard(root, card, ids, fallbacks) {
  const article = document.createElement('article');
  article.className = 'dash__card';
  article.id = ids.card;

  appendText(article, 'div', 'dash__card-label', text(card?.label, fallbacks.label));
  appendText(article, 'div', 'dash__card-title', text(card?.title, fallbacks.title), {
    id: ids.title,
  });
  appendText(article, 'div', 'dash__card-sub', text(card?.subtitle, fallbacks.subtitle), {
    id: ids.subtitle,
  });

  const list = appendText(article, 'div', 'dash__card-desc', '', { id: ids.list });
  items(card?.actions).forEach((action) => appendProAction(list, action));

  root.appendChild(article);
  return article;
}

function appendContinueDraftCard(draftRoot, draft) {
  if (!draft?.visible) return null;

  const card = document.createElement('article');
  card.className = 'dash__continue-card';
  setOptionalDataAttribute(card, 'data-action', DASHBOARD_ACTIONS.continueDraft);
  setOptionalDataAttribute(card, 'data-id', draft.id);

  const icon = appendText(card, 'span', 'dash__continue-card__icon', '', { ariaHidden: true });
  appendIconSvg(icon, [{ attrs: { d: 'M3 12a9 9 0 1 0 3-6.7' } }, { attrs: { d: 'M3 4v5h5' } }], {
    width: '18',
    height: '18',
    strokeWidth: '1.7',
  });

  const body = document.createElement('div');
  body.className = 'dash__continue-card__body';
  appendText(
    body,
    'div',
    'dash__continue-card__title',
    draft.isEdit ? 'Continuar edicao de servico' : 'Voltar ao registro em andamento',
  );

  const subtitle = document.createElement('div');
  subtitle.className = 'dash__continue-card__sub';
  const equipmentName = text(draft.equipmentName);
  if (equipmentName) {
    subtitle.append('Equipamento: ');
    appendText(subtitle, 'strong', '', equipmentName);
  } else {
    subtitle.textContent = 'Voce tem um rascunho aguardando finalizacao.';
  }
  body.appendChild(subtitle);
  card.appendChild(body);

  const continueButton = document.createElement('button');
  continueButton.className = 'dash__continue-card__cta';
  continueButton.type = 'button';
  setOptionalDataAttribute(continueButton, 'data-action', DASHBOARD_ACTIONS.continueDraft);
  setOptionalDataAttribute(continueButton, 'data-id', draft.id);
  continueButton.append('Continuar');
  appendIconSvg(continueButton, [{ tag: 'polyline', attrs: { points: '9 6 15 12 9 18' } }], {
    width: '13',
    height: '13',
    strokeWidth: '2',
    ariaHidden: true,
  });
  card.appendChild(continueButton);

  const closeButton = document.createElement('button');
  closeButton.className = 'dash__continue-card__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Descartar rascunho');
  setOptionalDataAttribute(closeButton, 'data-action', DASHBOARD_ACTIONS.discardDraft);
  appendIconSvg(
    closeButton,
    [
      { tag: 'line', attrs: { x1: '18', x2: '6', y1: '6', y2: '18' } },
      { tag: 'line', attrs: { x1: '6', x2: '18', y1: '6', y2: '18' } },
    ],
    { width: '14', height: '14', strokeWidth: '2', ariaHidden: true },
  );
  card.appendChild(closeButton);

  if (draft.nav) {
    const navContract = document.createElement('span');
    setOptionalDataAttribute(navContract, 'data-nav', draft.nav);
    navContract.hidden = true;
    card.appendChild(navContract);
  }

  draftRoot.appendChild(card);
  return card;
}

export function renderProDraftBlocksDom(root, { proDraft, draftRoot = null } = {}) {
  if (!root) return;

  const model = buildModel(proDraft);
  const cards = model.proCards;
  const resolvedDraftRoot =
    draftRoot || document.getElementById(DASHBOARD_PUBLIC_IDS.proDraftRoot) || null;

  root.hidden = !cards?.visible;
  root.setAttribute('data-tier', text(model.tier, 'free'));
  root.replaceChildren();

  const critical = cards?.critical || EMPTY_PRO_DRAFT.proCards.critical;
  const riskClients = cards?.riskClients || EMPTY_PRO_DRAFT.proCards.riskClients;

  appendProCard(
    root,
    critical,
    {
      card: DASHBOARD_PUBLIC_IDS.criticalAlertsCard,
      title: DASHBOARD_PUBLIC_IDS.criticalAlertsTitle,
      subtitle: DASHBOARD_PUBLIC_IDS.criticalAlertsSubtitle,
      list: DASHBOARD_PUBLIC_IDS.criticalAlertsList,
    },
    EMPTY_PRO_DRAFT.proCards.critical,
  );
  appendProCard(
    root,
    riskClients,
    {
      card: DASHBOARD_PUBLIC_IDS.riskClientsCard,
      title: DASHBOARD_PUBLIC_IDS.riskClientsTitle,
      subtitle: DASHBOARD_PUBLIC_IDS.riskClientsSubtitle,
      list: DASHBOARD_PUBLIC_IDS.riskClientsList,
    },
    EMPTY_PRO_DRAFT.proCards.riskClients,
  );

  if (resolvedDraftRoot) {
    resolvedDraftRoot.replaceChildren();
    appendContinueDraftCard(resolvedDraftRoot, model.draft);
  }
}

export function unmountProDraftBlocksDom(root, draftRoot = null) {
  if (root) {
    root.replaceChildren();
    root.hidden = true;
    root.removeAttribute('data-tier');
  }

  const resolvedDraftRoot =
    draftRoot || document.getElementById(DASHBOARD_PUBLIC_IDS.proDraftRoot) || null;
  if (resolvedDraftRoot) {
    resolvedDraftRoot.replaceChildren();
  }
}
