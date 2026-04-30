/**
 * /clientes — View completa de clientes (abr/2026 redesign).
 *
 * Layout:
 *   1. Page header (titulo + Novo cliente CTA)
 *   2. KPI row (4 metricas: ativos, equipamentos, serviços no mês, manutenções pendentes)
 *   3. Alert strip (clientes sem manutenção ha mais de 60 dias) — so aparece se houver
 *   4. Filter bar (search + Status + Cidade + Ordenar)
 *   5. Grid de cards (3 colunas em desktop) com:
 *      - Industry icon (heuristica pelo nome)
 *      - Nome + status pill (Ativo / Sem manutenção / Precisa atenção)
 *      - Endereco
 *      - 3 stats (equipamentos / serviços / ultima manutenção)
 *      - 3 ações (Ver equipamentos / Ver serviços / Editar) + kebab
 *   6. Paginacao (6/pagina)
 *
 * Dados: state.clientes + state.equipamentos + state.registros.
 * Status derivado:
 *   - 'ativo'         = tem serviços recentes OU cliente novo (sem histórico)
 *   - 'sem_manutencao' = ultimo serviço entre 60-90 dias atras
 *   - 'precisa_atencao' = ultimo serviço ha mais de 90 dias
 */

import { Utils } from '../../core/utils.js';
import { getState } from '../../core/state.js';
import { loadClientes, deleteCliente } from '../../core/clientes.js';
import { ClienteModal } from '../components/clienteModal.js';
import { Toast } from '../../core/toast.js';
import { CustomConfirm } from '../../core/modal.js';
import { handleError, ErrorCodes } from '../../core/errors.js';
import { goTo } from '../../core/router.js';
import { getClienteAlert, daysUntilAlert } from '../../core/clienteAlerts.js';
import { ClienteAlertModal } from '../components/clienteAlertModal.js';
import { ClientePmocPanel } from '../components/clientePmocPanel.js';
import { ICON_PLUS } from './clientes/constants.js';
import { buildClientesViewModel } from '../viewModels/clientesViewModel.js';
import { CLIENTES_ACTIONS, CLIENTES_PUBLIC_IDS } from '../viewModels/clientesContracts.js';
import {
  renderCard,
  renderEmptyFilter,
  renderEmptyState,
  renderFilters,
  renderPagination,
} from './clientes/renderers.js';
import {
  renderActiveContext,
  renderAlertStrip,
  renderSummary,
} from './clientes/summaryRenderer.js';

/* ─────────────────────── module state ──────────────────────────────── */

let _searchTerm = '';
let _statusFilter = 'todos';
let _cityFilter = 'todas';
let _sortBy = 'mais_ativos';
let _currentPage = 1;
let _pageSize = 6;
let _hydrated = false;
let _bound = false;
let _summaryCollapsed = true;

/* ─────────────────────── derivacao de dados ────────────────────────── */

/* ─────────────────────── render principal ──────────────────────────── */

export async function renderClientes() {
  const root = document.getElementById(CLIENTES_PUBLIC_IDS.root);
  if (!root) return;

  // Hidrata clientes na primeira render
  if (!_hydrated) {
    _hydrated = true;
    try {
      await loadClientes();
    } catch (err) {
      console.warn('[clientes] hydrate falhou:', err?.message);
    }
  }

  const { clientes = [], equipamentos = [], registros = [] } = getState();
<<<<<<< HEAD
  const viewModel = buildClientesViewModel({
    clientes,
    equipamentos,
    registros,
    searchTerm: _searchTerm,
    statusFilter: _statusFilter,
    cityFilter: _cityFilter,
    sortBy: _sortBy,
    currentPage: _currentPage,
    pageSize: _pageSize,
    summaryCollapsed: _summaryCollapsed,
  });
  _searchTerm = viewModel.filters.searchTerm;
  _statusFilter = viewModel.filters.statusFilter;
  _cityFilter = viewModel.filters.cityFilter;
  _sortBy = viewModel.filters.sortBy;
  _currentPage = viewModel.pagination.currentPage;
  _pageSize = viewModel.pagination.pageSize;
=======
  const indexed = buildClienteIndex({ clientes, equipamentos, registros });
  const currentYear = new Date().getFullYear();
  clientes.forEach((cliente) => {
    const current = indexed.get(cliente.id) || {};
    indexed.set(cliente.id, {
      ...current,
      pmocSummary: getPmocSummaryForCliente({
        clienteId: cliente.id,
        year: currentYear,
        equipamentos,
        registros,
      }),
    });
  });
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c

  // Header sempre visível
  const headerHtml = `
    <header class="cli-page__header">
      <div>
        <h1 class="cli-page__title">Meus clientes</h1>
        <p class="cli-page__sub">Cadastre e gerencie seus clientes, organize equipamentos por carteira e gere relatórios PMOC formais.</p>
      </div>
      <button type="button" class="cli-page__cta"
        data-action="${CLIENTES_ACTIONS.openModal}" data-mode="create">
        ${ICON_PLUS}<span>Novo cliente</span>
      </button>
    </header>`;

  // Empty inicial (sem clientes cadastrados)
  if (viewModel.isEmpty) {
    root.innerHTML = `
      <div class="cli-page">
        ${headerHtml}
        ${renderEmptyState()}
      </div>`;
    _bindOnce();
    return;
  }

<<<<<<< HEAD
  const cardsHtml = viewModel.pageItems.length
    ? viewModel.pageItems
        .map((c) =>
          renderCard(c, viewModel.indexed.get(c.id) || {}, { getClienteAlert, daysUntilAlert }),
        )
=======
  const filtered = filterAndSortClientes(clientes, indexed, {
    searchTerm: _searchTerm,
    statusFilter: _statusFilter,
    cityFilter: _cityFilter,
    sortBy: _sortBy,
  });
  // Clamp page se filtragem reduzir o total
  const totalPages = Math.max(1, Math.ceil(filtered.length / _pageSize));
  if (_currentPage > totalPages) _currentPage = totalPages;
  const start = (_currentPage - 1) * _pageSize;
  const pageItems = filtered.slice(start, start + _pageSize);

  const cities = clientes.map((c) => indexed.get(c.id)?.displayCity).filter(Boolean);

  const cardsHtml = pageItems.length
    ? pageItems
        .map((c) => renderCard(c, indexed.get(c.id) || {}, { getClienteAlert, daysUntilAlert }))
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
        .join('')
    : '';

  root.innerHTML = `
      <div class="cli-page">
      ${headerHtml}
<<<<<<< HEAD
      ${renderFilters({ cities: viewModel.cities, searchTerm: viewModel.filters.searchTerm, statusFilter: viewModel.filters.statusFilter, cityFilter: viewModel.filters.cityFilter, sortBy: viewModel.filters.sortBy })}
      ${renderActiveContext({ searchTerm: viewModel.filters.searchTerm, statusFilter: viewModel.filters.statusFilter, cityFilter: viewModel.filters.cityFilter })}
      ${renderAlertStrip({ indexed: viewModel.indexed })}
      ${renderSummary({ clientes: viewModel.clientes, equipamentos: viewModel.equipamentos, registros: viewModel.registros, indexed: viewModel.indexed, summaryCollapsed: viewModel.summaryCollapsed })}
=======
      ${renderFilters({ cities, searchTerm: _searchTerm, statusFilter: _statusFilter, cityFilter: _cityFilter, sortBy: _sortBy })}
      ${renderActiveContext({ searchTerm: _searchTerm, statusFilter: _statusFilter, cityFilter: _cityFilter })}
      ${renderAlertStrip({ indexed })}
      ${renderSummary({ clientes, equipamentos, registros, indexed, summaryCollapsed: _summaryCollapsed })}
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
      ${
        viewModel.pageItems.length
          ? `<div class="cli-grid" role="list">${cardsHtml}</div>`
<<<<<<< HEAD
          : renderEmptyFilter(viewModel.filters.searchTerm)
      }
      ${renderPagination(viewModel.pagination.filteredCount, { currentPage: viewModel.pagination.currentPage, pageSize: viewModel.pagination.pageSize })}
=======
          : renderEmptyFilter(_searchTerm)
      }
      ${renderPagination(filtered.length, { currentPage: _currentPage, pageSize: _pageSize })}
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
    </div>`;

  _bindOnce();
}

/* ─────────────────────── interactions ──────────────────────────────── */

function _bindOnce() {
  if (_bound) return;
  _bound = true;
  _bindGlobalMenuClose();
  const view = document.getElementById(CLIENTES_PUBLIC_IDS.view);
  if (!view) return;

  // Input + select changes (delegated)
  view.addEventListener('input', (event) => {
    const input = event.target.closest?.(`#${CLIENTES_PUBLIC_IDS.searchInput}`);
    if (input) {
      _searchTerm = input.value || '';
      _currentPage = 1;
      // Re-render preservando o foco no input
      const cursorPos = input.selectionStart;
      renderClientes().then(() => {
        const newInput = document.getElementById(CLIENTES_PUBLIC_IDS.searchInput);
        if (newInput) {
          newInput.focus();
          if (cursorPos != null) {
            try {
              newInput.setSelectionRange(cursorPos, cursorPos);
            } catch (_e) {
              /* old browser sem suporte */
            }
          }
        }
      });
    }
  });

  view.addEventListener('change', (event) => {
    const sel = event.target;
    if (sel.id === CLIENTES_PUBLIC_IDS.statusFilter) {
      _statusFilter = sel.value;
      _currentPage = 1;
      renderClientes();
    } else if (sel.id === CLIENTES_PUBLIC_IDS.cityFilter) {
      _cityFilter = sel.value;
      _currentPage = 1;
      renderClientes();
    } else if (sel.id === CLIENTES_PUBLIC_IDS.sort) {
      _sortBy = sel.value;
      renderClientes();
    } else if (sel.id === CLIENTES_PUBLIC_IDS.pageSize) {
      _pageSize = parseInt(sel.value, 10) || 6;
      _currentPage = 1;
      renderClientes();
    }
  });

  view.addEventListener('click', async (event) => {
    const target = event.target.closest?.('[data-cli-action]');
    if (!target || !view.contains(target)) return;
    const action = target.getAttribute('data-cli-action');
    const id = target.getAttribute('data-id');
    switch (action) {
      case CLIENTES_ACTIONS.gotoPage:
        _currentPage = parseInt(target.getAttribute('data-page'), 10) || 1;
        renderClientes();
        break;
      case CLIENTES_ACTIONS.prevPage:
        if (_currentPage > 1) {
          _currentPage--;
          renderClientes();
        }
        break;
      case CLIENTES_ACTIONS.nextPage:
        _currentPage++;
        renderClientes();
        break;
      case CLIENTES_ACTIONS.clearFilters:
        _searchTerm = '';
        _statusFilter = 'todos';
        _cityFilter = 'todas';
        _sortBy = 'mais_ativos';
        _currentPage = 1;
        renderClientes();
        break;
<<<<<<< HEAD
      case CLIENTES_ACTIONS.toggleSummary:
        _summaryCollapsed = !_summaryCollapsed;
        renderClientes();
        break;
      case CLIENTES_ACTIONS.filterPending:
=======
      case 'toggle-summary':
        _summaryCollapsed = !_summaryCollapsed;
        renderClientes();
        break;
      case 'filter-pending':
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
        _statusFilter = 'sem_manutencao';
        _currentPage = 1;
        renderClientes();
        break;
      case CLIENTES_ACTIONS.edit:
        _closeAllMenus();
        openClienteModalForId(id);
        break;
      case CLIENTES_ACTIONS.alert: {
        _closeAllMenus();
        const c = (getState().clientes || []).find((x) => x.id === id);
        if (c) ClienteAlertModal.open(c.id, c.nome, { onSaved: () => renderClientes() });
        break;
      }
      case CLIENTES_ACTIONS.delete:
        _closeAllMenus();
        confirmDeleteCliente(id);
        break;
      case CLIENTES_ACTIONS.cardMenu:
        _toggleCardMenu(id);
        break;
      case CLIENTES_ACTIONS.verEquipamentos:
        _navigateVerEquipamentos(id);
        break;
      case CLIENTES_ACTIONS.verServicos:
        _navigateVerServicos(id);
        break;
<<<<<<< HEAD
      case CLIENTES_ACTIONS.pmocFocus:
      case CLIENTES_ACTIONS.openPmocPanel:
=======
      case 'pmoc-focus':
      case 'open-pmoc-panel':
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
        _openPmocPanel(id);
        break;
      default:
        break;
    }
  });

  view.addEventListener('keydown', (event) => {
    const target = event.target.closest?.(
<<<<<<< HEAD
      `[data-cli-action="${CLIENTES_ACTIONS.pmocFocus}"], [data-cli-action="${CLIENTES_ACTIONS.openPmocPanel}"]`,
=======
      '[data-cli-action="pmoc-focus"], [data-cli-action="open-pmoc-panel"]',
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
    );
    if (!target || !view.contains(target)) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    _openPmocPanel(target.getAttribute('data-id'));
  });
}

let _openMenuId = null;

function _closeAllMenus() {
  if (!_openMenuId) return;
  const menu = document.getElementById(`cli-card-menu-${_openMenuId}`);
  const trigger = document.querySelector(
    `[data-cli-action="${CLIENTES_ACTIONS.cardMenu}"][data-id="${_openMenuId}"]`,
  );
  if (menu) menu.hidden = true;
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  _openMenuId = null;
}

function _toggleCardMenu(id) {
  if (_openMenuId === id) {
    _closeAllMenus();
    return;
  }
  _closeAllMenus();
  const menu = document.getElementById(`cli-card-menu-${id}`);
  const trigger = document.querySelector(
    `[data-cli-action="${CLIENTES_ACTIONS.cardMenu}"][data-id="${id}"]`,
  );
  if (!menu || !trigger) return;
  menu.hidden = false;
  trigger.setAttribute('aria-expanded', 'true');
  _openMenuId = id;
}

// Click fora ou Esc fecha o menu (idempotente via dataset flag)
function _bindGlobalMenuClose() {
  if (typeof document === 'undefined') return;
  if (document.body.dataset.cliMenuBound === '1') return;
  document.body.dataset.cliMenuBound = '1';
  document.addEventListener('click', (e) => {
    if (!_openMenuId) return;
    const insideMenu = e.target.closest('.cli-card__menu');
    const insideTrigger = e.target.closest(`[data-cli-action="${CLIENTES_ACTIONS.cardMenu}"]`);
    if (insideMenu || insideTrigger) return;
    _closeAllMenus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && _openMenuId) _closeAllMenus();
  });
}

function _navigateVerEquipamentos(id) {
  const cliente = (getState().clientes || []).find((c) => c.id === id);
  if (!cliente) return;
  goTo('equipamentos', { equipCtx: { clienteId: id, clienteNome: cliente.nome } });
}

function _navigateVerServicos(id) {
  const cliente = (getState().clientes || []).find((c) => c.id === id);
  if (!cliente) return;
  goTo('historico', { clienteId: id, clienteNome: cliente.nome });
}

function _openPmocPanel(id) {
  const { clientes = [], equipamentos = [], registros = [], setores = [] } = getState();
  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) return;
  ClientePmocPanel.open({ cliente, equipamentos, registros, setores });
}

/* ─────────────────────── search public api ─────────────────────────── */

export function setClientesSearch(term) {
  _searchTerm = String(term || '');
  _currentPage = 1;
  renderClientes();
}

/* ─────────────────────── delete / select ───────────────────────────── */

export async function confirmDeleteCliente(id) {
  const cliente = (getState().clientes || []).find((c) => c.id === id);
  if (!cliente) return;
  const equipsCount = (getState().equipamentos || []).filter((e) => e.clienteId === id).length;

  const message = equipsCount
    ? `${equipsCount} equipamento${equipsCount !== 1 ? 's' : ''} vinculado${equipsCount !== 1 ? 's' : ''} a este cliente ficará${equipsCount !== 1 ? 'ão' : ''} sem cliente (não serão apagados). Continuar?`
    : 'Apagar este cliente? Esta ação não pode ser desfeita.';

  const ok = await CustomConfirm.show('Apagar cliente', message, {
    confirmLabel: 'Apagar',
    cancelLabel: 'Cancelar',
    tone: 'danger',
    focus: 'cancel',
  });
  if (!ok) return;

  try {
    await deleteCliente(id);
    Toast.success('Cliente apagado.');
    renderClientes();
  } catch (error) {
    handleError(error, {
      code: ErrorCodes.SYNC_FAILED,
      message: 'Não foi possível apagar o cliente.',
      context: { action: 'clientes.confirmDeleteCliente', id },
    });
  }
}

/**
 * Popula o select #eq-cliente do modal-add-eq. Esconde o wrapper inteiro
 * quando não há clientes cadastrados.
 */
export async function populateClienteSelect() {
  const wrapper = Utils.getEl('eq-cliente-wrapper');
  const select = Utils.getEl('eq-cliente');
  if (!wrapper || !select) return;

  if (!_hydrated) {
    _hydrated = true;
    try {
      await loadClientes();
    } catch (err) {
      console.warn('[clientes] populateClienteSelect hydrate falhou:', err?.message);
    }
  }

  const { clientes = [] } = getState();
  if (!clientes.length) {
    wrapper.style.display = 'none';
    return;
  }
  wrapper.style.display = '';
  const current = select.value;
  select.innerHTML = `
    <option value="">— Sem cliente vinculado —</option>
    ${clientes
      .map((c) => `<option value="${Utils.escapeAttr(c.id)}">${Utils.escapeHtml(c.nome)}</option>`)
      .join('')}`;
  if (current) select.value = current;
}

/**
 * Abre o ClienteModal em modo edição para um cliente especifico (por id).
 * Usado pelo clienteHandlers (kebab menu, edit action) e pelo card "Editar"
 * dentro da view. Se o cliente não existir mais, mostra Toast e cancela.
 */
export function openClienteModalForId(id) {
  const cliente = (getState().clientes || []).find((c) => c.id === id);
  if (!cliente) {
    Toast.warning('Cliente não encontrado.');
    return;
  }
  ClienteModal.openEdit(cliente, { onSaved: () => renderClientes() });
}
