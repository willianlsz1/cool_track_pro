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
import { buildClientesViewModel } from '../viewModels/clientesViewModel.js';
import { CLIENTES_ACTIONS, CLIENTES_PUBLIC_IDS } from '../viewModels/clientesContracts.js';
import { mountClientesDom, unmountClientesDom } from './clientes/pageRenderer.js';

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
let renderGeneration = 0;

function buildClienteAlerts(pageItems = []) {
  return pageItems.reduce((alerts, cliente) => {
    const alert = getClienteAlert(cliente.id);
    if (!alert) return alerts;

    alerts[cliente.id] = {
      daysRemaining: daysUntilAlert(cliente.id),
    };
    return alerts;
  }, {});
}

function shouldCollapseSummary() {
  const mobileCollapsed =
    typeof window !== 'undefined' && window.matchMedia?.('(max-width: 720px)').matches === true;
  return Boolean(mobileCollapsed && _summaryCollapsed);
}

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

  const generation = ++renderGeneration;
  const clienteAlerts = buildClienteAlerts(viewModel.pageItems);
  if (generation !== renderGeneration) return null;

  const mounted = mountClientesDom(root, {
    viewModel,
    clienteAlerts,
    isSummaryCollapsed: shouldCollapseSummary(),
  });
  _bindOnce();
  return mounted;
}

export function unmountClientes() {
  renderGeneration += 1;
  const root = document.getElementById(CLIENTES_PUBLIC_IDS.root);
  if (!root?.dataset.clientesMounted) return null;
  unmountClientesDom(root);
  return null;
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
      case CLIENTES_ACTIONS.toggleSummary:
        _summaryCollapsed = !_summaryCollapsed;
        renderClientes();
        break;
      case CLIENTES_ACTIONS.filterPending:
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
      case CLIENTES_ACTIONS.novoServico:
        _navigateNovoServico(id);
        break;
      default:
        break;
    }
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

function _navigateNovoServico(id) {
  const cliente = (getState().clientes || []).find((c) => c.id === id);
  if (!cliente) return;
  goTo('registro', {
    clienteId: id,
    clienteNome: cliente.nome || '',
  });
}

/* ─────────────────────── search public api ─────────────────────────── */

export function setClientesSearch(term) {
  _searchTerm = String(term || '');
  _currentPage = 1;
  return renderClientes();
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
 * Usado pelos fluxos legados de cliente e pelo card "Editar"
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
