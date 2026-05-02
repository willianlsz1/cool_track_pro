/**
 * CoolTrack Pro - View Orcamentos (Fase de instalacao, abr/2026)
 *
 * Bridge legado para a ilha React de orcamentos. Regras de lista, status,
 * filtros, KPIs e acoes ficam no view model puro.
 */

import { getState } from '../../core/state.js';
import { Toast } from '../../core/toast.js';
import {
  loadOrcamentos,
  deleteOrcamento,
  upsertOrcamento,
  markExpiredLocally,
} from '../../core/orcamentos.js';
import { CustomConfirm } from '../../core/modal.js';
import { buildOrcamentosViewModel } from '../viewModels/orcamentosViewModel.js';

let _statusFilter = 'todos';
let _busca = '';
let renderGeneration = 0;
let orcamentosBridgePromise = null;
let buscaTimer = null;

function loadOrcamentosBridge() {
  orcamentosBridgePromise ??= import('../../react/entrypoints/orcamentosIsland.jsx');
  return orcamentosBridgePromise;
}

function buildCurrentViewModel() {
  return buildOrcamentosViewModel({
    orcamentos: markExpiredLocally(getState().orcamentos || []),
    statusFilter: _statusFilter,
    busca: _busca,
  });
}

function handleSearchInput(value) {
  clearTimeout(buscaTimer);
  buscaTimer = setTimeout(() => {
    buscaTimer = null;
    setOrcBusca(value);
  }, 200);
}

/**
 * Renderiza a view inteira de orcamentos no container #view-orcamentos.
 * Idempotente: chamado por loadAndRenderOrcamentos (cold start) e por
 * setters de filtro / handlers que mudam o state.
 */
export function renderOrcamentos() {
  const container = document.getElementById('view-orcamentos');
  if (!container) return null;

  const generation = ++renderGeneration;
  const viewModel = buildCurrentViewModel();

  return loadOrcamentosBridge().then(({ mountOrcamentosReact }) => {
    if (generation !== renderGeneration) return null;
    return mountOrcamentosReact(container, {
      viewModel,
      onSearchInput: handleSearchInput,
    });
  });
}

export function unmountOrcamentos() {
  renderGeneration += 1;
  clearTimeout(buscaTimer);
  buscaTimer = null;

  const container = document.getElementById('view-orcamentos');
  if (!container?.dataset.reactOrcamentosMounted) return null;

  return loadOrcamentosBridge().then(({ unmountOrcamentosReact }) => {
    unmountOrcamentosReact(container);
    return null;
  });
}

export function setOrcStatusFilter(status) {
  _statusFilter = status || 'todos';
  return renderOrcamentos();
}

export function setOrcBusca(value) {
  _busca = String(value || '').trim();
  return renderOrcamentos();
}

export async function deleteOrcamentoFlow(id) {
  const o = (getState().orcamentos || []).find((x) => x.id === id);
  if (!o) return;
  const ok = await CustomConfirm.show(
    `Apagar orçamento ${o.numero}?`,
    `Esta ação não pode ser desfeita. O orçamento de "${o.clienteNome}" será removido permanentemente.`,
    {
      confirmLabel: 'Apagar',
      cancelLabel: 'Cancelar',
      tone: 'danger',
      focus: 'cancel',
    },
  );
  if (!ok) return;
  try {
    await deleteOrcamento(id);
    Toast.success('Orçamento apagado.');
    renderOrcamentos();
  } catch (error) {
    Toast.error(error?.message || 'Falha ao apagar orçamento.');
  }
}

export async function markOrcamentoApproved(id) {
  const o = (getState().orcamentos || []).find((x) => x.id === id);
  if (!o) return;
  try {
    await upsertOrcamento({
      ...o,
      status: 'aprovado',
      aprovadoEm: new Date().toISOString(),
    });
    Toast.success(`Orçamento ${o.numero} marcado como aprovado.`);
    renderOrcamentos();
  } catch (error) {
    Toast.error(error?.message || 'Falha ao atualizar status.');
  }
}

export async function loadAndRenderOrcamentos() {
  const generation = ++renderGeneration;
  await loadOrcamentos();
  if (generation !== renderGeneration) return null;
  return renderOrcamentos();
}
