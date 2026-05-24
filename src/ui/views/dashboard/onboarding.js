import { DASHBOARD_ACTIONS, DASHBOARD_PUBLIC_IDS } from '../../viewModels/dashboardContracts.js';

const DEFAULT_ONBOARDING_MODEL = Object.freeze({
  tier: 'free',
  empty: { visible: false, state: null },
  installPrompt: { state: 'hidden' },
  contextual: { visible: false, title: '', description: '', actions: {} },
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
  if (attrs.className) svg.setAttribute('class', attrs.className);

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

function normalizedModel(onboarding) {
  return {
    ...DEFAULT_ONBOARDING_MODEL,
    ...(onboarding || {}),
    empty: { ...DEFAULT_ONBOARDING_MODEL.empty, ...(onboarding?.empty || {}) },
    installPrompt: {
      ...DEFAULT_ONBOARDING_MODEL.installPrompt,
      ...(onboarding?.installPrompt || {}),
    },
    contextual: { ...DEFAULT_ONBOARDING_MODEL.contextual, ...(onboarding?.contextual || {}) },
    checklist: { ...DEFAULT_ONBOARDING_MODEL.checklist, ...(onboarding?.checklist || {}) },
    overflow: { ...DEFAULT_ONBOARDING_MODEL.overflow, ...(onboarding?.overflow || {}) },
  };
}

function appendCloseIcon(parent, size = 14) {
  return appendIconSvg(
    parent,
    [
      { tag: 'line', attrs: { x1: '18', x2: '6', y1: '6', y2: '18' } },
      { tag: 'line', attrs: { x1: '6', x2: '18', y1: '6', y2: '18' } },
    ],
    { width: String(size), height: String(size), strokeWidth: '2' },
  );
}

function appendEmptyCta(parent, cta) {
  if (!cta) return null;

  const button = document.createElement('button');
  const toneClass = cta.tone === 'outline' ? 'btn--outline' : 'btn--primary';
  button.className = [
    'btn',
    toneClass,
    cta.size === 'sm' ? 'btn--sm' : '',
    cta.autoWidth ? 'btn--auto' : '',
    cta.centered ? 'btn--centered' : '',
  ]
    .filter(Boolean)
    .join(' ');
  button.type = 'button';
  setOptionalDataAttribute(button, 'data-action', cta.action);
  setOptionalDataAttribute(button, 'data-hist-action', cta.histAction);
  setOptionalDataAttribute(button, 'data-id', cta.id);
  setOptionalDataAttribute(button, 'data-nav', cta.nav);
  setOptionalDataAttribute(button, 'data-testid', cta.testid);
  button.textContent = text(cta.label, 'Continuar');
  parent.appendChild(button);
  return button;
}

function renderEmptyState(emptyRoot, empty) {
  if (!emptyRoot) return;
  emptyRoot.replaceChildren();
  emptyRoot.classList.add('dash__empty');
  emptyRoot.hidden = !empty?.visible;
  if (!empty?.visible) return;

  const state = empty.state || {};
  const wrapper = document.createElement('div');
  wrapper.className = 'empty-state';
  appendText(wrapper, 'div', 'empty-state__icon', text(state.icon, '-'));
  appendText(wrapper, 'div', 'empty-state__title', state.title);
  if (state.description) {
    appendText(wrapper, 'div', 'empty-state__sub', state.description);
  }
  if (state.cta) {
    const ctaWrap = document.createElement('div');
    ctaWrap.className = 'empty-state__cta';
    appendEmptyCta(ctaWrap, state.cta);
    wrapper.appendChild(ctaWrap);
  }
  emptyRoot.appendChild(wrapper);
}

function appendInstallPhoneIcon(parent) {
  return appendIconSvg(
    parent,
    [
      { tag: 'rect', attrs: { height: '20', rx: '2', width: '14', x: '5', y: '2' } },
      { tag: 'line', attrs: { x1: '12', x2: '12.01', y1: '18', y2: '18' } },
    ],
    { width: '20', height: '20', strokeWidth: '1.8' },
  );
}

function appendInstallShareIcon(parent) {
  return appendIconSvg(
    parent,
    [
      { attrs: { d: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' } },
      { tag: 'polyline', attrs: { points: '16 6 12 2 8 6' } },
      { tag: 'line', attrs: { x1: '12', x2: '12', y1: '2', y2: '15' } },
    ],
    { width: '20', height: '20', strokeWidth: '1.8' },
  );
}

function appendInstallPrompt(root, installPrompt) {
  const state = installPrompt?.state;
  if (state !== 'available' && state !== 'ios') return null;

  const card = document.createElement('article');
  card.className = state === 'ios' ? 'install-card install-card--ios' : 'install-card';
  card.setAttribute('role', 'region');
  card.setAttribute(
    'aria-label',
    state === 'ios' ? 'Instalar aplicativo no iPhone' : 'Instalar aplicativo',
  );

  const icon = appendText(card, 'span', 'install-card__icon', '', { ariaHidden: true });
  if (state === 'ios') appendInstallShareIcon(icon);
  else appendInstallPhoneIcon(icon);

  const body = document.createElement('div');
  body.className = 'install-card__body';
  if (state === 'ios') {
    appendText(body, 'p', 'install-card__title', 'Adicione o app a Tela de Inicio');
    const subtitle = document.createElement('p');
    subtitle.className = 'install-card__sub';
    subtitle.append('No Safari, toque em ');
    appendText(subtitle, 'strong', '', 'Compartilhar');
    subtitle.append(' e depois em ');
    appendText(subtitle, 'strong', '', 'Adicionar a Tela de Inicio');
    subtitle.append(' - assim as notificacoes funcionam como app nativo.');
    body.appendChild(subtitle);
  } else {
    appendText(body, 'p', 'install-card__title', 'Instale o CoolTrack como app');
    appendText(
      body,
      'p',
      'install-card__sub',
      'Notificacoes nativas no celular, icone na tela inicial, abre offline.',
    );
  }
  card.appendChild(body);

  if (state === 'available') {
    const cta = document.createElement('button');
    cta.className = 'btn btn--primary btn--sm install-card__cta';
    cta.type = 'button';
    cta.setAttribute('data-action', 'install-app-prompt');
    cta.textContent = 'Instalar';
    card.appendChild(cta);
  }

  const close = document.createElement('button');
  close.className = 'install-card__close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Dispensar');
  close.setAttribute('data-action', 'install-app-dismiss');
  appendCloseIcon(close);
  card.appendChild(close);

  root.appendChild(card);
  return card;
}

function appendDoneIcon(parent) {
  return appendIconSvg(parent, [{ tag: 'polyline', attrs: { points: '20 6 9 17 4 12' } }], {
    width: '14',
    height: '14',
    strokeWidth: '2.5',
  });
}

function appendChevronIcon(parent) {
  return appendIconSvg(parent, [{ tag: 'polyline', attrs: { points: '9 6 15 12 9 18' } }], {
    width: '14',
    height: '14',
    strokeWidth: '2',
    className: 'onb-step__chev',
    ariaHidden: true,
  });
}

function appendChecklist(root, checklist) {
  if (!checklist?.visible) return null;

  const completed = Number.isFinite(checklist.completed) ? checklist.completed : 0;
  const total = Number.isFinite(checklist.total) ? checklist.total : items(checklist.steps).length;
  const rawPercent = Number.isFinite(checklist.percent) ? checklist.percent : 0;
  const percent = Math.max(0, Math.min(100, Math.round(rawPercent)));

  const card = document.createElement('article');
  card.className = 'onb-card';
  card.setAttribute('role', 'region');
  card.setAttribute('aria-label', 'Primeiros passos');

  const header = document.createElement('header');
  header.className = 'onb-card__head';
  const headText = document.createElement('div');
  headText.className = 'onb-card__head-text';
  appendText(headText, 'h3', 'onb-card__title', 'Primeiros passos');
  appendText(headText, 'p', 'onb-card__sub', `${completed} de ${total} concluidos - ${percent}%`);
  header.appendChild(headText);

  const close = document.createElement('button');
  close.className = 'onb-card__close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Dispensar checklist');
  close.setAttribute('data-action', DASHBOARD_ACTIONS.onboardingDismiss);
  appendCloseIcon(close, 16);
  header.appendChild(close);
  card.appendChild(header);

  const progress = document.createElement('div');
  progress.className = 'onb-card__progress';
  progress.setAttribute('aria-hidden', 'true');
  const fill = document.createElement('div');
  fill.className = 'onb-card__progress-fill';
  fill.style.width = `${percent}%`;
  progress.appendChild(fill);
  card.appendChild(progress);

  const list = document.createElement('ol');
  list.className = 'onb-card__steps';
  list.setAttribute('role', 'list');
  items(checklist.steps).forEach((step, index) => {
    const done = step?.completed === true;
    const order = Number.isFinite(step?.order) ? step.order : index + 1;
    const item = document.createElement('li');
    item.className = `onb-step${done ? ' is-done' : ''}`;
    item.setAttribute('role', done ? 'presentation' : 'button');
    if (!done) {
      setOptionalDataAttribute(item, 'data-nav', step?.nav);
      item.tabIndex = 0;
    }

    const check = appendText(item, 'span', 'onb-step__check', '', { ariaHidden: true });
    if (done) appendDoneIcon(check);
    else appendText(check, 'span', 'onb-step__num', order);

    const body = document.createElement('span');
    body.className = 'onb-step__body';
    appendText(body, 'span', 'onb-step__label', step?.label);
    appendText(body, 'span', 'onb-step__sub', step?.sub);
    item.appendChild(body);
    if (!done) appendChevronIcon(item);
    list.appendChild(item);
  });
  card.appendChild(list);

  root.appendChild(card);
  return card;
}

function appendContextualStart(root, contextual) {
  if (!contextual?.visible) return null;

  const registerAction = contextual.actions?.register || {};
  const clientsAction = contextual.actions?.clients || {};
  const skipAction = contextual.actions?.skip || {};

  const card = document.createElement('article');
  card.className = 'onb-card contextual-onboarding';
  card.setAttribute('aria-label', 'Onboarding contextual');
  card.setAttribute('data-contextual-onboarding', 'true');
  card.setAttribute('role', 'region');

  const header = document.createElement('header');
  header.className = 'onb-card__head';
  const headText = document.createElement('div');
  headText.className = 'onb-card__head-text';
  appendText(headText, 'h3', 'onb-card__title', text(contextual.title, 'Como voce quer comecar?'));
  if (contextual.description) {
    appendText(headText, 'p', 'onb-card__sub', contextual.description);
  }
  header.appendChild(headText);

  const close = document.createElement('button');
  close.className = 'onb-card__close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Fechar onboarding');
  setOptionalDataAttribute(close, 'data-action', skipAction.action);
  appendCloseIcon(close, 16);
  header.appendChild(close);
  card.appendChild(header);

  const actions = document.createElement('div');
  actions.className = 'contextual-onboarding__actions';

  const register = document.createElement('button');
  register.className = 'btn btn--primary btn--sm';
  register.type = 'button';
  setOptionalDataAttribute(register, 'data-action', registerAction.action);
  register.textContent = text(registerAction.label, 'Quero registrar um servico');
  actions.appendChild(register);

  const clients = document.createElement('button');
  clients.className = 'btn btn--outline btn--sm';
  clients.type = 'button';
  setOptionalDataAttribute(clients, 'data-action', clientsAction.action);
  clients.textContent = text(clientsAction.label, 'Quero organizar meus clientes');
  actions.appendChild(clients);

  const skip = document.createElement('button');
  skip.className = 'btn btn--ghost btn--sm';
  skip.type = 'button';
  setOptionalDataAttribute(skip, 'data-action', skipAction.action);
  skip.textContent = text(skipAction.label, 'Pular');
  actions.appendChild(skip);

  card.appendChild(actions);
  root.appendChild(card);
  return card;
}

function overflowCopy(state) {
  if (state?.limitType === 'equipamentos') {
    return `Voce cadastrou ${text(state.equipCount, 0)} equipamentos - o plano gratis permite ${text(state.equipLimit, 0)}.`;
  }
  if (state?.limitType === 'registros') {
    return `Voce registrou ${text(state.reportCount, 0)} servicos este mes - o plano gratis permite ${text(state.reportLimit, 0)}.`;
  }
  return 'Voce ultrapassou os limites do plano gratis (equipamentos e registros).';
}

function renderOverflow(overflowRoot, overflow) {
  if (!overflowRoot) return;
  overflowRoot.replaceChildren();
  const state = overflow?.state || {};
  if (!overflow?.visible || !state.overLimit) return;

  const banner = document.createElement('aside');
  banner.className = 'dash-overflow-banner';
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('role', 'status');
  setOptionalDataAttribute(banner, 'data-limit-type', state.limitType);

  const style = document.createElement('style');
  style.textContent = OVERFLOW_STYLES;
  banner.appendChild(style);

  appendIconSvg(
    banner,
    [{ attrs: { d: 'M12 3L2 20h20L12 3z' } }, { attrs: { d: 'M12 10v4M12 17.5v.01' } }],
    { className: 'dash-overflow-banner__icon', strokeWidth: '1.8', ariaHidden: true },
  );
  appendText(banner, 'span', 'dash-overflow-banner__text', overflowCopy(state));
  overflowRoot.appendChild(banner);
}

export function renderOnboardingBlocksDom(
  root,
  { onboarding, emptyRoot = null, overflowRoot = null } = {},
) {
  if (!root) return;

  const model = normalizedModel(onboarding);
  root.replaceChildren();
  root.setAttribute('data-tier', text(model.tier, 'free'));

  renderEmptyState(emptyRoot || document.getElementById(DASHBOARD_PUBLIC_IDS.empty), model.empty);
  appendInstallPrompt(root, model.installPrompt);

  const proDraftRoot = document.createElement('div');
  proDraftRoot.id = DASHBOARD_PUBLIC_IDS.proDraftRoot;
  proDraftRoot.style.display = 'contents';
  root.appendChild(proDraftRoot);

  appendChecklist(root, model.checklist);
  appendContextualStart(root, model.contextual);
  renderOverflow(
    overflowRoot || document.getElementById(DASHBOARD_PUBLIC_IDS.overflowBanner),
    model.overflow,
  );
}

export function unmountOnboardingBlocksDom(root, emptyRoot = null, overflowRoot = null) {
  if (root) {
    root.replaceChildren();
    root.removeAttribute('data-tier');
  }

  const resolvedEmptyRoot = emptyRoot || document.getElementById(DASHBOARD_PUBLIC_IDS.empty);
  if (resolvedEmptyRoot) {
    resolvedEmptyRoot.replaceChildren();
    resolvedEmptyRoot.hidden = true;
  }

  const resolvedOverflowRoot =
    overflowRoot || document.getElementById(DASHBOARD_PUBLIC_IDS.overflowBanner);
  if (resolvedOverflowRoot) {
    resolvedOverflowRoot.replaceChildren();
  }
}
