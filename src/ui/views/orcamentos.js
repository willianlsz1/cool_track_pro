/**
 * CoolTrack Pro - View Orcamentos (Fase de instalacao, abr/2026)
 *
 * Renderer legado de orcamentos. Regras de lista, status, filtros, KPIs e
 * acoes ficam no view model puro.
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
import {
  buildOrcamentosViewModel,
  ORCAMENTO_STATUS_META,
} from '../viewModels/orcamentosViewModel.js';
import { OrcamentoModal } from '../components/orcamentoModal.js';

let _statusFilter = 'todos';
let _busca = '';
let renderGeneration = 0;
let buscaTimer = null;

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

function appendTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text || '';
  parent.append(element);
  return element;
}

function createButton({ className, action, text, mode, id, title, ariaLabel, dataset = {} }) {
  const button = document.createElement('button');
  button.type = 'button';
  if (className) button.className = className;
  if (action) button.dataset.action = action;
  if (mode) button.dataset.mode = mode;
  if (id) button.dataset.id = id;
  if (title) button.title = title;
  if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
  Object.entries(dataset).forEach(([key, value]) => {
    if (value !== undefined && value !== null) button.dataset[key] = String(value);
  });
  button.textContent = text || '';
  return button;
}

function renderHeader(page, kpis = {}) {
  const header = document.createElement('div');
  header.className = 'orc-header';

  const titleRow = document.createElement('div');
  titleRow.className = 'orc-header__title-row';
  appendTextElement(titleRow, 'h1', 'orc-header__title', 'Orcamentos');
  titleRow.append(
    createButton({
      className: 'btn btn--primary btn--sm',
      action: 'open-orcamento-modal',
      mode: 'create',
      text: '+ Novo orcamento',
    }),
  );
  header.append(titleRow);

  const kpisRoot = document.createElement('div');
  kpisRoot.className = 'orc-kpis';
  [
    { value: kpis.totalAtivos || 0, label: 'Em aberto' },
    { value: kpis.totalAprovados || 0, label: 'Aprovados', color: '#10b981' },
    { value: kpis.valorPipelineLabel || 'R$ 0,00', label: 'Pipeline', color: '#22d3ee' },
  ].forEach((item) => {
    const kpi = document.createElement('div');
    kpi.className = 'orc-kpi';
    const value = appendTextElement(kpi, 'div', 'orc-kpi__value', item.value);
    if (item.color) value.style.color = item.color;
    appendTextElement(kpi, 'div', 'orc-kpi__label', item.label);
    kpisRoot.append(kpi);
  });
  header.append(kpisRoot);
  page.append(header);
}

function renderFilters(page, viewModel) {
  const toolbar = document.createElement('div');
  toolbar.className = 'orc-toolbar';

  const search = document.createElement('div');
  search.className = 'orc-search';
  appendTextElement(search, 'span', '', 'Buscar');
  const input = document.createElement('input');
  input.type = 'search';
  input.id = 'orc-busca';
  input.className = 'orc-search__input';
  input.placeholder = 'Buscar por cliente, numero ou titulo...';
  input.value = viewModel.filters?.busca || '';
  input.addEventListener('input', (event) => handleSearchInput(event.currentTarget.value));
  search.append(input);
  toolbar.append(search);

  const chips = document.createElement('div');
  chips.className = 'orc-filter-chips';
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', 'Filtrar por status');
  (Array.isArray(viewModel.statusFilters) ? viewModel.statusFilters : []).forEach((status) => {
    chips.append(
      createButton({
        className: ['orc-chip', status.isActive ? 'is-active' : ''].filter(Boolean).join(' '),
        action: 'orc-set-status-filter',
        text: status.label,
        dataset: { status: status.id },
      }),
    );
  });
  toolbar.append(chips);
  page.append(toolbar);
}

function renderEmptyState(page, emptyState) {
  const action = emptyState?.action || 'open-orcamento-modal';
  const mode = emptyState?.mode || 'create';
  const empty = document.createElement('div');
  empty.className = 'orc-empty';
  appendTextElement(empty, 'div', 'orc-empty__art', 'Documento').setAttribute(
    'aria-hidden',
    'true',
  );
  appendTextElement(empty, 'h2', 'orc-empty__title', 'Nenhum orcamento ainda');
  appendTextElement(
    empty,
    'p',
    'orc-empty__sub',
    'Crie orcamentos profissionais de instalacao e envie pelo WhatsApp em segundos.',
  );
  empty.append(
    createButton({
      className: 'btn btn--primary orc-empty__cta',
      action,
      mode,
      text: '+ Novo orcamento',
    }),
  );
  page.append(empty);
}

function appendStatusPill(parent, card) {
  const meta = card.statusMeta || ORCAMENTO_STATUS_META.rascunho;
  const pill = appendTextElement(parent, 'span', 'orc-status-pill', meta.label);
  pill.dataset.status = card.status || 'rascunho';
  pill.style.color = meta.color;
  pill.style.background = meta.bg;
  pill.style.border = `1px solid ${meta.color}33`;
}

function appendSignedInfo(parent, signed) {
  if (!signed) return;
  const info = document.createElement('div');
  info.className = 'orc-card__signed';
  appendTextElement(info, 'span', '', 'Assinado digitalmente por ');
  appendTextElement(info, 'strong', '', signed.nome);
  appendTextElement(info, 'span', '', ` em ${signed.dateLabel}`);
  parent.append(info);
}

function renderCardAction(parent, action) {
  const id = action.id || '';
  const common = { action: action.action, id, text: action.label, title: action.title };

  if (action.kind === 'delete') {
    parent.append(
      createButton({
        ...common,
        className: 'orc-card__kebab',
        ariaLabel: action.ariaLabel,
        text: 'Apagar',
      }),
    );
    return;
  }

  if (action.kind === 'sendSignature') {
    parent.append(createButton({ ...common, className: 'btn btn--primary btn--sm' }));
    return;
  }

  const classByKind = {
    edit: 'btn btn--ghost btn--sm',
    share: 'btn btn--outline btn--sm',
    download: 'btn btn--outline btn--sm orc-card__download',
    markApproved: 'btn btn--outline btn--sm',
    createService: 'btn btn--primary btn--sm',
  };

  parent.append(
    createButton({
      ...common,
      className: classByKind[action.kind] || 'btn btn--outline btn--sm',
      mode: action.mode,
      dataset: {
        clienteId: action.clienteId,
        equipamentoId: action.equipamentoId,
      },
    }),
  );
}

function renderOrcamentoCard(cardsRoot, card) {
  const article = document.createElement('article');
  article.className = 'orc-card';
  article.dataset.id = card.id || '';

  const header = document.createElement('header');
  header.className = 'orc-card__head';
  const headMeta = document.createElement('div');
  appendTextElement(headMeta, 'span', 'orc-card__numero', card.numero);
  appendStatusPill(headMeta, card);
  header.append(headMeta);
  appendTextElement(header, 'div', 'orc-card__total', card.totalLabel);
  article.append(header);

  const body = document.createElement('div');
  body.className = 'orc-card__body';
  appendTextElement(body, 'h3', 'orc-card__title', card.titleLabel);
  appendTextElement(body, 'div', 'orc-card__cliente', card.clienteLine);

  const linkMeta = document.createElement('div');
  linkMeta.className = 'orc-card__meta';
  appendTextElement(linkMeta, 'span', '', card.clienteVinculoLabel);
  appendTextElement(linkMeta, 'span', '', card.equipamentoVinculoLabel);
  appendTextElement(linkMeta, 'span', '', `Status: ${card.statusLabel}`);
  body.append(linkMeta);

  const dateMeta = document.createElement('div');
  dateMeta.className = 'orc-card__meta';
  appendTextElement(dateMeta, 'span', '', card.createdLabel);
  if (card.validityLabel) {
    appendTextElement(dateMeta, 'span', 'orc-card__validity', card.validityLabel);
  }
  body.append(dateMeta);
  appendSignedInfo(body, card.signed);
  article.append(body);

  const footer = document.createElement('footer');
  footer.className = 'orc-card__actions';
  (Array.isArray(card.actions) ? card.actions : []).forEach((action) =>
    renderCardAction(footer, action),
  );
  article.append(footer);
  cardsRoot.append(article);
}

function renderOrcamentosDom(container, viewModel, generation) {
  if (generation !== renderGeneration) return null;
  const safeViewModel = viewModel || {};
  const cards = Array.isArray(safeViewModel.cards) ? safeViewModel.cards : [];

  const page = document.createElement('div');
  page.className = 'tw-w-full orc-page';
  renderHeader(page, safeViewModel.kpis);

  if (safeViewModel.isEmpty) {
    renderEmptyState(page, safeViewModel.emptyState);
  } else {
    renderFilters(page, safeViewModel);
    const cardsRoot = document.createElement('div');
    cardsRoot.className = 'orc-cards';
    if (safeViewModel.isFilterEmpty) {
      appendTextElement(cardsRoot, 'div', 'orc-empty-filter', safeViewModel.filterEmptyMessage);
    } else {
      cards.forEach((card) => renderOrcamentoCard(cardsRoot, card));
    }
    page.append(cardsRoot);
  }

  container.replaceChildren(page);
  return container;
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

  return renderOrcamentosDom(container, viewModel, generation);
}

export function unmountOrcamentos() {
  renderGeneration += 1;
  clearTimeout(buscaTimer);
  buscaTimer = null;

  const container = document.getElementById('view-orcamentos');
  container?.replaceChildren();
  return null;
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

export async function loadAndRenderOrcamentos(params = {}) {
  const generation = ++renderGeneration;
  await loadOrcamentos();
  if (generation !== renderGeneration) return null;
  const rendered = await renderOrcamentos();
  const clienteId = String(params?.clienteId || '').trim();
  if (!clienteId) return rendered;

  const cliente = (getState().clientes || []).find((item) => String(item?.id || '') === clienteId);
  if (!cliente) return rendered;

  OrcamentoModal.openCreate({
    clienteId: cliente.id,
    clienteNome: cliente.nome || '',
    clienteTelefone: cliente.contato || '',
    clienteEndereco: cliente.endereco || '',
  });
  return rendered;
}
