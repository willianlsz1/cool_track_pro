import { HISTORICO_ACTIONS } from '../../viewModels/historicoContracts.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function escapeHtml(value) {
  return text(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function searchIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>`;
}

function filtersIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="10" y1="18" x2="14" y2="18"></line></svg>`;
}

function closeIcon() {
  return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>`;
}

function renderPeriodOptions({ filters, periodOptions }) {
  const period = text(filters?.period, 'tudo');
  return asArray(periodOptions)
    .map((option) => {
      const id = text(option?.id);
      const active = period === id || (!period && id === 'tudo');
      return `<button type="button" class="${classNames(
        'hist-quickfilter',
        active && 'is-active',
      )}" data-hist-action="${HISTORICO_ACTIONS.filterPeriod}" data-period="${escapeAttr(
        id,
      )}" aria-pressed="${active ? 'true' : 'false'}">${escapeHtml(option?.label)}</button>`;
    })
    .join('');
}

function renderTipoOptions({ filters, tipoOptions }) {
  const tipo = text(filters?.tipo);
  return asArray(tipoOptions)
    .map((option) => {
      const id = text(option?.id);
      const color = text(option?.color, 'cyan');
      const active = tipo === id;
      return `<button type="button" class="${classNames(
        'hist-quickfilter',
        `hist-quickfilter--${color}`,
        active && 'is-active',
      )}" data-hist-action="${HISTORICO_ACTIONS.filterTipo}" data-tipo-id="${escapeAttr(
        id,
      )}" aria-pressed="${active ? 'true' : 'false'}"><span class="hist-quickfilter__dot" aria-hidden="true"></span>${escapeHtml(
        option?.label,
      )}</button>`;
    })
    .join('');
}

function renderQuickFilters({ filters, filtersCount, periodOptions, tipoOptions }) {
  return `<div class="hist-quickfilters" role="toolbar" aria-label="Filtros rápidos">
    ${renderPeriodOptions({ filters, periodOptions })}
    <button type="button" class="${classNames(
      'hist-quickfilter',
      'hist-filters-trigger',
      'hist-quickfilter--filters',
      filtersCount > 0 && 'is-active',
    )}" id="hist-filters-trigger" data-hist-action="${
      HISTORICO_ACTIONS.openFiltersSheet
    }" aria-label="Abrir filtros avançados">
      ${filtersIcon()}
      Filtros
      <span class="hist-filters-trigger__count" id="hist-filters-count"${
        filtersCount <= 0 ? ' hidden' : ''
      }>${filtersCount || 0}</span>
    </button>
    <div class="hist-quickfilters__sep" aria-hidden="true"></div>
    ${renderTipoOptions({ filters, tipoOptions })}
  </div>`;
}

function renderActiveChips(chips) {
  const rows = asArray(chips);
  if (!rows.length) return '<div id="hist-active-chips-slot"></div>';

  return `<div id="hist-active-chips-slot">
    <div class="hist-active-chips" role="status">
      <span class="hist-active-chips__label">Filtros ativos</span>
      ${rows
        .map((chip) => {
          const key = text(chip?.key);
          const value = text(chip?.value);
          return `<span class="hist-active-chip"><b>${escapeHtml(key)}:</b> ${escapeHtml(
            value,
          )}<button type="button" class="hist-active-chip__x" data-hist-action="${escapeAttr(
            chip?.clearAction,
          )}" aria-label="Remover filtro ${escapeAttr(`${key}: ${value}`)}">${closeIcon()}</button></span>`;
        })
        .join('')}
      <button type="button" class="hist-active-chips__clear" data-hist-action="${
        HISTORICO_ACTIONS.clearAll
      }">Limpar tudo</button>
    </div>
  </div>`;
}

function renderSelectFilter({ id, label, value, options, defaultLabel, hidden = false }) {
  return `<div class="hist-select">
    <select id="${escapeAttr(id)}" aria-label="${escapeAttr(label)}"${
      hidden ? ' style="display: none;"' : ''
    }>
      <option value="">${escapeHtml(defaultLabel)}</option>
      ${asArray(options)
        .map((option) => {
          const optionId = text(option?.id);
          const selected = text(value) === optionId ? ' selected' : '';
          return `<option value="${escapeAttr(optionId)}"${selected}>${escapeHtml(
            option?.label,
          )}</option>`;
        })
        .join('')}
    </select>
  </div>`;
}

function renderHistoricoFiltersHtml(viewModel = {}) {
  const filters = viewModel.filters || {};
  const filtersCount = Number(viewModel.filtersCount) || 0;
  const chronoLabel =
    viewModel.sortLabel && !viewModel.isDefaultSort
      ? `<div class="hist-chrono-label" id="hist-chrono-label">${escapeHtml(
          viewModel.sortLabel,
        )}</div>`
      : '';

  return `<div class="hist-sticky-header" id="hist-sticky-header">
    <div class="hist-sticky-header__row">
      <div class="hist-title">Histórico de Serviços</div>
      <span class="hist-count" id="hist-count" aria-live="polite">${escapeHtml(
        viewModel.countLabel,
      )}</span>
      <div class="hist-sticky-header__spacer"></div>
    </div>
    <div class="hist-sticky-header__row">
      <div class="hist-search-row">
        <label class="hist-input" for="hist-busca">
          <span class="hist-input__icon" aria-hidden="true">${searchIcon()}</span>
          <input id="hist-busca" type="search" placeholder="Buscar equipamento, tipo, técnico..." aria-label="Buscar no histórico" value="${escapeAttr(
            filters.busca,
          )}">
        </label>
        ${renderSelectFilter({
          id: 'hist-setor',
          label: 'Filtrar por setor',
          value: filters.setorId,
          options: viewModel.setorOptions,
          defaultLabel: 'Todos os setores',
          hidden: !viewModel.showSetorSelect,
        })}
        ${renderSelectFilter({
          id: 'hist-equip',
          label: 'Filtrar por equipamento',
          value: filters.equipId,
          options: viewModel.equipamentoOptions,
          defaultLabel: 'Todos os equipamentos',
        })}
      </div>
    </div>
    <div class="hist-sticky-header__row hist-sticky-header__row--quickfilters" id="hist-quickfilters-slot">
      ${renderQuickFilters({
        filters,
        filtersCount,
        periodOptions: viewModel.periodOptions,
        tipoOptions: viewModel.tipoOptions,
      })}
    </div>
  </div>
  ${renderActiveChips(viewModel.activeChips)}
  ${chronoLabel}`;
}

export function mountHistoricoFiltersDom(
  root = document.getElementById('hist-filters-root'),
  props = {},
) {
  if (!root) return null;
  root.innerHTML = renderHistoricoFiltersHtml(props.viewModel || {});
  root.dataset.historicoFiltersMounted = 'true';
  return root;
}

export function unmountHistoricoFiltersDom(root = document.getElementById('hist-filters-root')) {
  if (!root) return;
  root.innerHTML = '';
  delete root.dataset.historicoFiltersMounted;
}
