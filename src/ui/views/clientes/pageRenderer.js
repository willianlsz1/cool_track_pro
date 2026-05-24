import { Utils } from '../../../core/utils.js';
import { CLIENTES_ACTIONS } from '../../viewModels/clientesContracts.js';
import { renderCard } from './cardRenderer.js';
import { renderActiveContext, renderAlertStrip, renderSummary } from './summaryRenderer.js';
import { renderFilters } from './filtersRenderer.js';
import { renderPagination } from './paginationRenderer.js';
import { ICON_PLUS, ICON_USERS } from './constants.js';

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
