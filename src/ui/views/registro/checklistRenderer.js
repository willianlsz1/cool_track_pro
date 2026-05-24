import { Utils } from '../../../core/utils.js';
import { REGISTRO_ACTIONS } from '../../viewModels/registroContracts.js';

const DEFAULT_ROOT_ID = 'r-checklist-body';
const STATUS_OPTIONS = Object.freeze([
  { status: 'ok', label: '✓', title: 'Conforme' },
  { status: 'fail', label: '×', title: 'Não conforme' },
  { status: 'na', label: '⊘', title: 'Não aplicável' },
]);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function escapeHtml(value) {
  return Utils.escapeHtml(text(value));
}

function escapeAttr(value) {
  return Utils.escapeAttr(text(value));
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function resolveAction(actions, key, fallback) {
  return text(actions?.[key]?.action, fallback);
}

function normalizeStatus(value) {
  return STATUS_OPTIONS.some((option) => option.status === value) ? value : null;
}

function renderChecklistStatusButtons(item, actions) {
  const activeStatus = normalizeStatus(item?.status);
  const itemId = text(item?.id);
  const action = resolveAction(actions, 'checklistSet', REGISTRO_ACTIONS.checklistSet);

  return `<div class="r-checklist__statuses" role="group" aria-label="Status: ${escapeAttr(
    item?.label,
  )}">
    ${STATUS_OPTIONS.map((option) => {
      const isActive = activeStatus === option.status;
      return `<button type="button"
        class="${classNames(
          'r-checklist__status',
          `r-checklist__status--${option.status}`,
          isActive && 'is-active',
        )}"
        data-action="${escapeAttr(action)}"
        data-item="${escapeAttr(itemId)}"
        data-item-id="${escapeAttr(itemId)}"
        data-status="${escapeAttr(option.status)}"
        aria-pressed="${String(isActive)}"
        title="${escapeAttr(option.title)}">${escapeHtml(option.label)}</button>`;
    }).join('')}
  </div>`;
}

function renderChecklistMeasure(item, actions) {
  if (!item?.measurable) return '';

  const unit = text(item?.unit);
  const value =
    item?.measureValue === null || item?.measureValue === undefined ? '' : item.measureValue;
  const action = resolveAction(actions, 'checklistMeasure', REGISTRO_ACTIONS.checklistMeasure);

  return `<label class="r-checklist__measure">
    <input type="number"
      step="any"
      inputmode="decimal"
      class="r-checklist__measure-input"
      data-action="${escapeAttr(action)}"
      data-item="${escapeAttr(item?.id)}"
      data-item-id="${escapeAttr(item?.id)}"
      data-unit="${escapeAttr(unit)}"
      value="${escapeAttr(value)}"
      placeholder="valor"
      aria-label="Medição em ${escapeAttr(unit)}" />
    <span class="r-checklist__measure-unit" aria-hidden="true">${escapeHtml(unit)}</span>
  </label>`;
}

function renderChecklistRow(item, actions) {
  const itemId = text(item?.id);
  const obsAction = resolveAction(actions, 'checklistObs', REGISTRO_ACTIONS.checklistObs);

  return `<div class="${classNames(
    'r-checklist__row',
    item?.measurable && 'r-checklist__row--measurable',
  )}" data-item-id="${escapeAttr(itemId)}">
    <div class="r-checklist__label">
      ${escapeHtml(item?.label)}
      ${
        item?.mandatory
          ? '<span class="r-checklist__req" title="Obrigatório p/ PMOC formal">*</span>'
          : ''
      }
    </div>
    ${renderChecklistStatusButtons(item, actions)}
    ${renderChecklistMeasure(item, actions)}
    <textarea class="r-checklist__obs"
      data-action="${escapeAttr(obsAction)}"
      data-item="${escapeAttr(itemId)}"
      data-item-id="${escapeAttr(itemId)}"
      rows="1"
      maxlength="200"
      placeholder="Observação (opcional)">${escapeHtml(item?.obs)}</textarea>
  </div>`;
}

function renderChecklistGroup(group, actions) {
  return `<div class="r-checklist__group">
    <div class="r-checklist__group-label">${escapeHtml(group?.label)}</div>
    ${asArray(group?.items)
      .map((item) => renderChecklistRow(item, actions))
      .join('')}
  </div>`;
}

export function renderRegistroChecklistHtml({ checklist = {}, actions = {} } = {}) {
  return `<div class="r-checklist__intro">
    <strong>${escapeHtml(checklist?.label)}</strong>
    <span class="r-checklist__legend">
      <span class="r-checklist__legend-item">✓ conforme</span>
      <span class="r-checklist__legend-item">× não-conforme</span>
      <span class="r-checklist__legend-item">⊘ N/A</span>
    </span>
  </div>
  ${asArray(checklist?.groups)
    .map((group) => renderChecklistGroup(group, actions))
    .join('')}`;
}

export function mountRegistroChecklistDom(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  root.innerHTML = renderRegistroChecklistHtml(props);
  root.dataset.registroChecklistMounted = 'true';

  return root;
}

export function unmountRegistroChecklistDom(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  root.innerHTML = '';
  delete root.dataset.registroChecklistMounted;
}
