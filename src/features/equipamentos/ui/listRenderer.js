import { EQUIPAMENTOS_ACTIONS } from '../../../ui/viewModels/equipamentosContracts.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function labelAttr(value) {
  return escapeAttr(String(value ?? '').replace(/[<>]/g, ''));
}

function cssToken(value, fallback = '') {
  const token = String(value || fallback);
  return /^[a-z0-9_-]+$/i.test(token) ? token : fallback;
}

function cameraIconHtml() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"></path>
    <circle cx="12" cy="13" r="3.5"></circle>
  </svg>`;
}

function boxIconHtml() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
  </svg>`;
}

function arrowIconHtml() {
  return `<svg class="equip-card__primary-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"></path></svg>`;
}

function renderEmptyState(emptyState) {
  if (!emptyState) return '';

  const cta = emptyState.cta;
  const ctaClassName = cta
    ? classNames(
        'btn',
        cta.tone === 'outline' ? 'btn--outline' : 'btn--primary',
        cta.size === 'sm' && 'btn--sm',
        cta.autoWidth && 'btn--auto',
        cta.centered && 'btn--centered',
      )
    : '';

  return `<div class="empty-state">
    <div class="empty-state__icon">${escapeHtml(emptyState.icon || '-')}</div>
    <div class="empty-state__title">${escapeHtml(emptyState.title)}</div>
    ${
      emptyState.description
        ? `<div class="empty-state__sub">${escapeHtml(emptyState.description)}</div>`
        : ''
    }
    ${
      cta
        ? `<div class="empty-state__cta">
            <button type="button" class="${escapeAttr(ctaClassName)}"
              ${cta.action ? `data-action="${escapeAttr(cta.action)}"` : ''}
              ${cta.id ? `data-id="${escapeAttr(cta.id)}"` : ''}
              ${cta.nav ? `data-nav="${escapeAttr(cta.nav)}"` : ''}
              ${cta.testid ? `data-testid="${escapeAttr(cta.testid)}"` : ''}>
              ${escapeHtml(cta.label || 'Continuar')}
            </button>
          </div>`
        : ''
    }
  </div>
  ${
    emptyState.proHint
      ? `<p class="empty-state__hint">Use Clientes quando quiser organizar por empresa e setor.</p>
        <button type="button" class="btn btn--outline btn--sm" data-nav="clientes">Cadastrar cliente primeiro</button>`
      : ''
  }`;
}

function renderQuickMoveBanner(quickMove, total) {
  if (!quickMove) return '';

  const setoresDoCliente = asArray(quickMove.setoresDoCliente);
  const setoresOrfaos = asArray(quickMove.setoresOrfaos);
  const equipIds = asArray(quickMove.equipIds).join(',');
  const count = Number(total) || asArray(quickMove.equipIds).length;

  if (!equipIds || (!setoresDoCliente.length && !setoresOrfaos.length)) return '';

  const optGroupHtml = [
    setoresDoCliente.length
      ? `<optgroup label="Setores deste cliente">
          ${setoresDoCliente
            .map(
              (setor) =>
                `<option value="${escapeAttr(setor.id)}">${escapeHtml(setor.nome)}</option>`,
            )
            .join('')}
        </optgroup>`
      : '',
    setoresOrfaos.length
      ? `<optgroup label="Setores sem cliente (sera vinculado)">
          ${setoresOrfaos
            .map(
              (setor) =>
                `<option value="${escapeAttr(setor.id)}">${escapeHtml(setor.nome)} (sem cliente - sera vinculado)</option>`,
            )
            .join('')}
        </optgroup>`
      : '',
  ].join('');

  return `<div class="quick-move-banner" data-equip-ids="${escapeAttr(equipIds)}">
    <div class="quick-move-banner__icon" aria-hidden="true">${boxIconHtml()}</div>
    <div class="quick-move-banner__body">
      <strong>Organizar ${count} equipamento${count !== 1 ? 's' : ''} sem setor</strong>
      <p>Escolha um setor para mover todos de uma vez. Ou edite cada equipamento individualmente.</p>
    </div>
    <div class="quick-move-banner__action">
      <select class="quick-move-banner__select" id="quick-move-target-setor" aria-label="Setor de destino">
        <option value="">Selecione um setor...</option>
        ${optGroupHtml}
      </select>
      <button type="button" class="quick-move-banner__btn" data-action="${EQUIPAMENTOS_ACTIONS.quickMoveEquipBatch}">Mover todos</button>
    </div>
  </div>`;
}

function renderComponentPill(pill) {
  if (!pill) return '';
  return `<span class="equip-card__componente-pill equip-card__componente-pill--${cssToken(pill.tint, 'neutral')}">${escapeHtml(pill.label)}</span>`;
}

function renderEquipmentIcon(card) {
  const visual = card.visual || {};
  const toneClass = `equip-card__type-icon--fallback-t${cssToken(visual.tone, '1')}`;
  const fallback = `<span class="equip-card__fallback-initials">${escapeHtml(visual.initials || 'EQ')}</span>`;

  if (visual.photoUrl) {
    return `<div class="equip-card__type-icon equip-card__type-icon--lg equip-card__type-icon--photo ${toneClass}" aria-hidden="true">
      <img src="${escapeAttr(visual.photoUrl)}" alt="" loading="lazy">
      ${fallback}
    </div>`;
  }

  return `<div class="equip-card__type-icon equip-card__type-icon--lg equip-card__type-icon--fallback equip-card__type-icon--empty ${toneClass}"
    role="button" tabindex="0" data-action="${EQUIPAMENTOS_ACTIONS.openPhotosEditor}" data-id="${escapeAttr(card.id)}"
    aria-label="Adicionar foto ao equipamento ${labelAttr(card.name || '')}">
    ${fallback}
    <span class="equip-card__type-icon-overlay" aria-hidden="true">${cameraIconHtml()}</span>
  </div>`;
}

function renderHeaderRight(card) {
  if (card.isIdle) {
    return `<span class="equip-card__tone-pill equip-card__tone-pill--${cssToken(card.statusClass, 'ok')}">
      <span class="equip-card__tone-pill-dot" aria-hidden="true"></span>
      ${escapeHtml(card.statusLabel || 'Estavel')}
    </span>`;
  }

  return `<div class="equip-card__score-block">
    <span class="equip-card__score-value equip-card__score-value--${cssToken(card.healthClass, 'ok')}">${Number(card.score) || 0}%</span>
    <span class="equip-card__score-label">Eficiencia</span>
  </div>`;
}

function renderCardHeader(card) {
  const tagParts = asArray(card.tagParts)
    .map((part, index) => `${index > 0 ? ' · ' : ''}${escapeHtml(part)}`)
    .join('');

  return `<div class="equip-card__header">
    ${renderEquipmentIcon(card)}
    <div class="equip-card__meta">
      <div class="equip-card__name ${escapeAttr(card.nameClass || '')}">${escapeHtml(card.name)}</div>
      <div class="equip-card__tag">${tagParts}${renderComponentPill(card.componentPill)}</div>
      <div class="equip-card__subtitle">${escapeHtml(card.subtitle || 'Local nao informado')}</div>
    </div>
    ${renderHeaderRight(card)}
  </div>`;
}

function renderIdleCardBody(card) {
  return `<div class="equip-card__onboard">
    <div class="equip-card__onboard-text">
      <div class="equip-card__onboard-label">PRIMEIRO SERVICO</div>
      <div class="equip-card__onboard-title">Crie a linha de base</div>
      <div class="equip-card__onboard-sub">O primeiro registro define o historico</div>
    </div>
    <button type="button" class="equip-card__onboard-cta" data-action="${EQUIPAMENTOS_ACTIONS.goRegisterEquip}" data-id="${escapeAttr(card.id)}">
      ${escapeHtml(card.ctaLabel || 'Comecar')} <span aria-hidden="true">→</span>
    </button>
  </div>`;
}

function renderRiskChips(card) {
  const risk = card.risk || {};
  const factors = asArray(risk.factors)
    .slice(0, 3)
    .map((factor) => {
      const label = typeof factor === 'string' ? factor : factor.label;
      const tone = typeof factor === 'string' ? 'neutral' : factor.tone || 'neutral';
      return `<span class="equip-card__chip-ctx equip-card__chip-ctx--${cssToken(tone, 'neutral')}">${escapeHtml(label)}</span>`;
    })
    .join('');

  const trends = asArray(card.riskTrends)
    .map(
      (trend) =>
        `<span class="equip-card__risk-trend ${escapeAttr(trend.className || '')}"
          ${trend.title ? `title="${labelAttr(trend.title)}"` : ''}
          ${trend.ariaLabel ? `aria-label="${labelAttr(trend.ariaLabel)}"` : ''}>
          ${escapeHtml(trend.label)}${
            trend.word
              ? `<span class="equip-card__risk-trend-word">${escapeHtml(trend.word)}</span>`
              : ''
          }
        </span>`,
    )
    .join('');

  const timeline = card.timeline
    ? `<span class="equip-card__timeline-inline">
        Ult. <b>${escapeHtml(card.timeline.lastLabel || '-')}</b>
        <span class="equip-card__timeline-sep" aria-hidden="true"></span>
        Prox. <b class="equip-card__timeline-inline-next--${cssToken(card.timeline.nextTone, 'neutral')}">${escapeHtml(card.timeline.nextLabel || 'sem agenda')}</b>
      </span>`
    : '';

  return `<div class="equip-card__chips">
    <span class="equip-card__risk-chip equip-card__risk-chip--${cssToken(risk.classification, 'baixo')}">${escapeHtml(risk.label || 'Baixo')} · ${Number(risk.score) || 0}</span>
    ${trends}
    ${factors}
    ${timeline}
  </div>`;
}

function renderActiveCardBody(card) {
  const score = Math.max(0, Math.min(100, Number(card.score) || 0));

  return `<div class="equip-card__health-bar-full">
    <div class="equip-card__health-fill equip-card__health-fill--${cssToken(card.healthClass, 'ok')}" style="width:${score}%"></div>
  </div>
  ${renderRiskChips(card)}
  <div class="equip-card__primary">
    <div class="equip-card__primary-text">
      <div class="equip-card__primary-label">${escapeHtml(card.primaryLabel || 'PROXIMA ACAO')}</div>
      <div class="equip-card__primary-title">${escapeHtml(card.primaryTitle || card.ctaLabel)}</div>
      ${card.primaryMeta ? `<div class="equip-card__primary-meta">${escapeHtml(card.primaryMeta)}</div>` : ''}
    </div>
    <button type="button" class="equip-card__primary-cta" data-action="${EQUIPAMENTOS_ACTIONS.goRegisterEquip}" data-id="${escapeAttr(card.id)}" aria-label="${escapeAttr(card.ctaLabel || 'Registrar servico')}">
      ${arrowIconHtml()}
    </button>
  </div>`;
}

function renderEquipmentCard(card) {
  const statusClass = cssToken(card.statusClass, 'ok');
  const className = classNames(
    'equip-card',
    `equip-card--${statusClass}`,
    card.isIdle && 'equip-card--idle',
  );

  return `<div class="${escapeAttr(className)}" data-action="${EQUIPAMENTOS_ACTIONS.viewEquip}" data-id="${escapeAttr(card.id)}" data-testid="${escapeAttr(card.testId || `equip-card-${card.id}`)}" role="listitem" tabindex="0" aria-label="${labelAttr(card.ariaLabel || card.name)}">
    ${renderCardHeader(card)}
    ${card.isIdle ? renderIdleCardBody(card) : renderActiveCardBody(card)}
  </div>`;
}

function renderIdleCluster(cards) {
  const count = cards.length;
  if (!count) return '';

  const label = `${count} equipamento${count === 1 ? '' : 's'} novo${count === 1 ? '' : 's'} aguardando linha de base`;
  return `<div class="equip-idle-cluster" data-expanded="false" role="group" aria-label="${escapeAttr(label)}">
    <button type="button" class="equip-idle-cluster__summary" data-action="${EQUIPAMENTOS_ACTIONS.toggleIdleCluster}" aria-expanded="false">
      <div class="equip-idle-cluster__icon" aria-hidden="true">+</div>
      <div class="equip-idle-cluster__text">
        <div class="equip-idle-cluster__title"><b>${count}</b> equipamento${count === 1 ? '' : 's'} novo${count === 1 ? '' : 's'}</div>
        <div class="equip-idle-cluster__sub">aguardando linha de base</div>
      </div>
      <span class="equip-idle-cluster__cta">
        <span class="equip-idle-cluster__cta-text">Ver todos</span>
        <span class="equip-idle-cluster__cta-caret" aria-hidden="true">▾</span>
      </span>
    </button>
    <div class="equip-idle-cluster__cards" role="list">
      ${cards.map(renderEquipmentCard).join('')}
    </div>
  </div>`;
}

function renderListHtml(viewModel = {}) {
  const cards = asArray(viewModel.cards);
  const idleCards = asArray(viewModel.idleCards);
  const activeCards = asArray(viewModel.activeCards);
  const renderedCards = viewModel.clusterActive ? activeCards : cards;

  if (!cards.length) {
    return `<div class="equip-list-react" data-testid="equipamentos-list">${renderEmptyState(viewModel.emptyState)}</div>`;
  }

  return `<div class="equip-list-react" data-testid="equipamentos-list">
    <h2 class="section-title" style="margin:8px 0 10px">${escapeHtml(viewModel.listTitle || 'Todos os equipamentos')}</h2>
    ${renderQuickMoveBanner(viewModel.quickMove, cards.length)}
    ${viewModel.clusterActive ? renderIdleCluster(idleCards) : ''}
    ${renderedCards.map(renderEquipmentCard).join('')}
  </div>`;
}

export function mountEquipamentosListDom(
  root = document.getElementById('lista-equip'),
  props = {},
) {
  if (!root) return null;
  root.innerHTML = renderListHtml(props.viewModel || {});
  root.dataset.equipamentosListMounted = 'true';
  return root;
}

export function unmountEquipamentosListDom(root = document.getElementById('lista-equip')) {
  if (!root) return;
  root.innerHTML = '';
  delete root.dataset.equipamentosListMounted;
}
