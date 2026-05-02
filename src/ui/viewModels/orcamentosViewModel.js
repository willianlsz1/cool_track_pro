const DAY_MS = 24 * 60 * 60 * 1000;

export const ORCAMENTO_ACTIONS = Object.freeze({
  openModal: 'open-orcamento-modal',
  setStatusFilter: 'orc-set-status-filter',
  delete: 'orc-delete',
  markApproved: 'orc-mark-approved',
  share: 'orc-share',
  download: 'orc-download',
  sendSignature: 'orc-send-signature',
});

export const ORCAMENTO_STATUS_META = Object.freeze({
  rascunho: Object.freeze({
    label: 'Rascunho',
    color: '#8aaac8',
    bg: 'rgba(255,255,255,0.06)',
  }),
  enviado: Object.freeze({
    label: 'Enviado',
    color: '#51a3ff',
    bg: 'rgba(81,163,255,0.12)',
  }),
  aguardando_assinatura: Object.freeze({
    label: 'Aguardando assinatura',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.14)',
  }),
  aprovado: Object.freeze({
    label: 'Aprovado',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.14)',
  }),
  recusado: Object.freeze({
    label: 'Recusado',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
  }),
  expirado: Object.freeze({
    label: 'Expirado',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
  }),
});

export const ORCAMENTO_STATUS_FILTERS = Object.freeze([
  Object.freeze({ id: 'todos', label: 'Todos' }),
  Object.freeze({ id: 'rascunho', label: 'Rascunho' }),
  Object.freeze({ id: 'enviado', label: 'Enviado' }),
  Object.freeze({ id: 'aprovado', label: 'Aprovado' }),
  Object.freeze({ id: 'recusado', label: 'Recusado' }),
  Object.freeze({ id: 'expirado', label: 'Expirado' }),
]);

const OPEN_STATUSES = new Set(['rascunho', 'enviado']);
const PIPELINE_STATUSES = new Set(['enviado', 'aprovado']);
const SIGNABLE_STATUSES = new Set(['rascunho', 'enviado', 'aguardando_assinatura']);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isRecord(value) {
  return value !== null && typeof value === 'object';
}

function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safeNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

export function formatOrcamentoCurrency(value) {
  return safeNumber(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatOrcamentoDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function buildValidityLabel(orcamento) {
  if (!orcamento.enviadoEm) return '';

  const sentAt = new Date(orcamento.enviadoEm).getTime();
  const validityDays = Number(orcamento.validadeDias);
  if (!Number.isFinite(sentAt) || !Number.isFinite(validityDays)) return '';

  return `Vale até ${formatOrcamentoDate(new Date(sentAt + validityDays * DAY_MS).toISOString())}`;
}

export function buildOrcamentosKpis(orcamentos = []) {
  const items = asArray(orcamentos).filter(isRecord);
  const totalAtivos = items.filter((orcamento) => OPEN_STATUSES.has(orcamento.status)).length;
  const totalAprovados = items.filter((orcamento) => orcamento.status === 'aprovado').length;
  const valorPipeline = items
    .filter((orcamento) => PIPELINE_STATUSES.has(orcamento.status))
    .reduce((sum, orcamento) => sum + safeNumber(orcamento.total), 0);

  return {
    totalAtivos,
    totalAprovados,
    valorPipeline,
    valorPipelineLabel: formatOrcamentoCurrency(valorPipeline),
  };
}

export function filterOrcamentos(orcamentos = [], { statusFilter = 'todos', busca = '' } = {}) {
  const query = safeString(busca).trim().toLowerCase();
  let list = asArray(orcamentos).filter(isRecord);

  if (statusFilter !== 'todos') {
    list = list.filter((orcamento) => orcamento.status === statusFilter);
  }

  if (!query) return list;

  return list.filter(
    (orcamento) =>
      String(orcamento.numero).toLowerCase().includes(query) ||
      String(orcamento.clienteNome).toLowerCase().includes(query) ||
      String(orcamento.titulo).toLowerCase().includes(query),
  );
}

function buildOrcamentoActions(orcamento) {
  const id = safeString(orcamento.id);
  const status = safeString(orcamento.status);
  const isSigned = Boolean(orcamento.assinadoEm);
  const actions = [
    {
      kind: 'edit',
      action: ORCAMENTO_ACTIONS.openModal,
      mode: 'edit',
      id,
      label: 'Ver / editar',
    },
  ];

  if (!isSigned && SIGNABLE_STATUSES.has(status)) {
    actions.push({
      kind: 'sendSignature',
      action: ORCAMENTO_ACTIONS.sendSignature,
      id,
      label: orcamento.shareToken ? '↻ Reenviar assinatura' : '✍️ Enviar p/ assinatura',
      title: 'Gera link único de assinatura e envia pelo WhatsApp',
    });
  }

  if (SIGNABLE_STATUSES.has(status)) {
    actions.push({
      kind: 'share',
      action: ORCAMENTO_ACTIONS.share,
      id,
      label: 'WhatsApp (PDF)',
    });
  }

  actions.push({
    kind: 'download',
    action: ORCAMENTO_ACTIONS.download,
    id,
    label: 'Baixar PDF',
    title: 'Baixar PDF do orçamento',
  });

  if (status === 'enviado' && !isSigned) {
    actions.push({
      kind: 'markApproved',
      action: ORCAMENTO_ACTIONS.markApproved,
      id,
      label: 'Marcar aprovado',
    });
  }

  actions.push({
    kind: 'delete',
    action: ORCAMENTO_ACTIONS.delete,
    id,
    ariaLabel: 'Apagar orçamento',
    title: 'Apagar',
  });

  return actions;
}

export function buildOrcamentoCardModel(orcamento) {
  if (!isRecord(orcamento)) return null;

  const status = safeString(orcamento.status, 'rascunho');
  const statusMeta = ORCAMENTO_STATUS_META[status] || ORCAMENTO_STATUS_META.rascunho;
  const clienteNome = safeString(orcamento.clienteNome);
  const clienteTelefone = safeString(orcamento.clienteTelefone);
  const title = safeString(orcamento.titulo);
  const assinadoEm = safeString(orcamento.assinadoEm);

  return {
    id: safeString(orcamento.id),
    numero: safeString(orcamento.numero),
    status,
    statusLabel: statusMeta.label,
    statusMeta,
    totalLabel: formatOrcamentoCurrency(orcamento.total),
    title,
    titleLabel: title || 'Sem título',
    clienteNome,
    clienteTelefone,
    clienteLine: clienteTelefone ? `${clienteNome} · ${clienteTelefone}` : clienteNome,
    createdLabel: `Criado ${formatOrcamentoDate(orcamento.createdAt)}`,
    validityLabel: buildValidityLabel(orcamento),
    signed: assinadoEm
      ? {
          nome: safeString(orcamento.assinadoNome, 'cliente') || 'cliente',
          dateLabel: formatOrcamentoDate(assinadoEm),
        }
      : null,
    actions: buildOrcamentoActions(orcamento),
  };
}

export function buildOrcamentosViewModel({
  orcamentos = [],
  statusFilter = 'todos',
  busca = '',
} = {}) {
  const all = asArray(orcamentos).filter(isRecord);
  const filters = {
    statusFilter: safeString(statusFilter, 'todos') || 'todos',
    busca: safeString(busca).trim(),
  };
  const filtered = filterOrcamentos(all, filters);
  const isEmpty = all.length === 0;

  return {
    filters,
    statusFilters: ORCAMENTO_STATUS_FILTERS.map((item) => ({
      ...item,
      isActive: filters.statusFilter === item.id,
    })),
    kpis: buildOrcamentosKpis(all),
    isEmpty,
    isFilterEmpty: !isEmpty && filtered.length === 0,
    filterEmptyMessage: 'Nenhum orçamento corresponde ao filtro.',
    emptyState: isEmpty
      ? {
          action: ORCAMENTO_ACTIONS.openModal,
          mode: 'create',
        }
      : null,
    cards: filtered.map(buildOrcamentoCardModel).filter(Boolean),
  };
}
