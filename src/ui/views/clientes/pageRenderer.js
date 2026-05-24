import { Utils } from '../../../core/utils.js';
import {
  CLIENTES_ACTIONS,
  CLIENTES_PAGE_SIZE_OPTIONS,
  CLIENTES_PUBLIC_IDS,
  CLIENTES_SORT_OPTIONS,
  CLIENTES_STATUS_OPTIONS,
} from '../../viewModels/clientesContracts.js';
import { renderCard } from './cardRenderer.js';
import { ICON_CHEV_L, ICON_CHEV_R, ICON_PLUS, ICON_SEARCH, ICON_USERS } from './constants.js';
import { renderActiveContext, renderAlertStrip, renderSummary } from './summaryRenderer.js';

function renderHeader() {
  return `
    <header class="cli-page__header">
      <div>
        <h1 class="cli-page__title">Meus clientes</h1>
        <p class="cli-page__sub">
          Cadastre clientes, acompanhe equipamentos vinculados e mantenha o histórico organizado.
        </p>
      </div>
      <button type="button" class="cli-page__cta"
        data-action="${CLIENTES_ACTIONS.openModal}" data-mode="create">
        ${ICON_PLUS}<span>Novo cliente</span>
      </button>
    </header>`;
}

function renderGrid(viewModel, clienteHelpers) {
  if (viewModel.isEmpty) return renderEmptyState();
  if (viewModel.isFilterEmpty) return renderEmptyFilter(viewModel.filters.searchTerm);

  return `
    <div class="cli-grid" role="list">
      ${viewModel.pageItems
        .map((cliente) => renderCard(cliente, viewModel.indexed.get(cliente.id), clienteHelpers))
        .join('')}
    </div>`;
}

function renderEmptyState() {
  return `
    <section class="cli-empty" aria-label="Nenhum cliente">
      <div class="cli-empty__art" aria-hidden="true">${ICON_USERS}</div>
      <h3 class="cli-empty__title">Nenhum cliente cadastrado</h3>
      <p class="cli-empty__sub">
        Cadastre o primeiro cliente para vincular equipamentos, registrar serviços
        e manter o histórico organizado.
      </p>
      <button type="button" class="cli-empty__cta"
        data-action="${CLIENTES_ACTIONS.openModal}" data-mode="create">
        ${ICON_PLUS}<span>Cadastrar primeiro cliente</span>
      </button>
    </section>`;
}

function renderEmptyFilter(searchTerm) {
  const term = Utils.escapeHtml(searchTerm || '');
  const hint = term ? `para "${term}"` : 'com os filtros atuais';
  return `
    <div class="cli-empty cli-empty--filter">
      <p class="cli-empty__sub">Nenhum cliente encontrado ${hint}.</p>
      <button type="button" class="cli-empty__cta cli-empty__cta--ghost"
        data-cli-action="${CLIENTES_ACTIONS.clearFilters}">Limpar filtros</button>
    </div>`;
}

function renderFilters({ cities, searchTerm, statusFilter, cityFilter, sortBy }) {
  const cityOptions = ['todas', ...Array.from(new Set(cities)).filter(Boolean).sort()];
  return `
    <div class="cli-filters">
      <label class="cli-search">
        <span class="cli-search__icon" aria-hidden="true">${ICON_SEARCH}</span>
        <input type="search" class="cli-search__input" id="${CLIENTES_PUBLIC_IDS.searchInput}"
          placeholder="Buscar por nome, CNPJ, endereço..."
          aria-label="Buscar cliente"
          value="${Utils.escapeAttr(searchTerm)}" />
      </label>
      <label class="cli-select">
        <span class="cli-select__label">Status</span>
        <select id="${CLIENTES_PUBLIC_IDS.statusFilter}" class="cli-select__input" aria-label="Filtrar por status">
          ${CLIENTES_STATUS_OPTIONS.map(
            (option) =>
              `<option value="${Utils.escapeAttr(option.id)}" ${statusFilter === option.id ? 'selected' : ''}>${Utils.escapeHtml(option.label)}</option>`,
          ).join('')}
        </select>
      </label>
      <label class="cli-select">
        <span class="cli-select__label">Cidade</span>
        <select id="${CLIENTES_PUBLIC_IDS.cityFilter}" class="cli-select__input" aria-label="Filtrar por cidade">
          ${cityOptions
            .map((c) => {
              const label = c === 'todas' ? 'Todas' : c;
              return `<option value="${Utils.escapeAttr(c)}" ${cityFilter === c ? 'selected' : ''}>${Utils.escapeHtml(label)}</option>`;
            })
            .join('')}
        </select>
      </label>
      <label class="cli-select">
        <span class="cli-select__label">Ordenar por</span>
        <select id="${CLIENTES_PUBLIC_IDS.sort}" class="cli-select__input" aria-label="Ordenar lista">
          ${CLIENTES_SORT_OPTIONS.map(
            (option) =>
              `<option value="${Utils.escapeAttr(option.id)}" ${sortBy === option.id ? 'selected' : ''}>${Utils.escapeHtml(option.label)}</option>`,
          ).join('')}
        </select>
      </label>
    </div>`;
}

function renderPagination(filteredCount, { currentPage, pageSize }) {
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  if (filteredCount === 0) return '';
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(filteredCount, currentPage * pageSize);

  const pageBtns = [];
  for (let p = 1; p <= totalPages; p++) {
    const active = p === currentPage ? ' is-active' : '';
    pageBtns.push(
      `<button type="button" class="cli-pag__page${active}" data-cli-action="${CLIENTES_ACTIONS.gotoPage}" data-page="${p}" aria-label="Página ${p}" aria-current="${p === currentPage ? 'page' : 'false'}">${p}</button>`,
    );
  }

  const prevDisabled = currentPage <= 1 ? 'disabled' : '';
  const nextDisabled = currentPage >= totalPages ? 'disabled' : '';

  return `
    <div class="cli-pag" role="navigation" aria-label="Paginação">
      <div class="cli-pag__info">Mostrando ${from}-${to} de ${filteredCount}</div>
      <div class="cli-pag__controls">
        <button type="button" class="cli-pag__btn" data-cli-action="${CLIENTES_ACTIONS.prevPage}"
          aria-label="Página anterior" ${prevDisabled}>${ICON_CHEV_L}</button>
        <div class="cli-pag__pages">${pageBtns.join('')}</div>
        <button type="button" class="cli-pag__btn" data-cli-action="${CLIENTES_ACTIONS.nextPage}"
          aria-label="Próxima página" ${nextDisabled}>${ICON_CHEV_R}</button>
      </div>
      <label class="cli-select cli-pag__size">
        <span class="cli-select__label">Por página</span>
        <select id="${CLIENTES_PUBLIC_IDS.pageSize}" class="cli-select__input" aria-label="Itens por página">
          ${CLIENTES_PAGE_SIZE_OPTIONS.map(
            (option) =>
              `<option value="${option}" ${pageSize === option ? 'selected' : ''}>${option}</option>`,
          ).join('')}
        </select>
      </label>
    </div>`;
}

function buildClienteHelpers(clienteAlerts = {}) {
  return {
    getClienteAlert: (id) => clienteAlerts[id] || null,
    daysUntilAlert: (id) => clienteAlerts[id]?.daysRemaining ?? null,
  };
}

export function renderClientesPage({ viewModel, clienteAlerts = {}, isSummaryCollapsed = false }) {
  const clienteHelpers = buildClienteHelpers(clienteAlerts);
  const filters = viewModel.filters;
  return `
    <div class="tw-w-full cli-page" data-clientes-page="true">
      ${renderHeader()}
      ${renderSummary({
        clientes: viewModel.clientes,
        equipamentos: viewModel.equipamentos,
        registros: viewModel.registros,
        indexed: viewModel.indexed,
        summaryCollapsed: isSummaryCollapsed,
      })}
      ${renderActiveContext(filters)}
      ${renderAlertStrip({ indexed: viewModel.indexed })}
      ${renderFilters({
        cities: viewModel.cities,
        searchTerm: filters.searchTerm,
        statusFilter: filters.statusFilter,
        cityFilter: filters.cityFilter,
        sortBy: filters.sortBy,
      })}
      ${renderGrid(viewModel, clienteHelpers)}
      ${renderPagination(viewModel.pagination.filteredCount, viewModel.pagination)}
    </div>`;
}

export function mountClientesDom(root, props = {}) {
  if (!root) return null;
  root.innerHTML = renderClientesPage(props);
  root.dataset.clientesMounted = 'true';
  return root;
}

export function unmountClientesDom(root) {
  if (!root) return;
  root.innerHTML = '';
  delete root.dataset.clientesMounted;
}
