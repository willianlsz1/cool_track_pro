import type { Cliente, Equipamento, Orcamento, QuoteStatus } from '../domain/types';
import type { ServiceHomeTone } from './servicesHomeViewModel';

export interface BuildServicesQuotesInput {
  clientes: Cliente[];
  equipamentos: Equipamento[];
  orcamentos: Orcamento[];
}

export interface ServicesQuotesKpiViewModel {
  label: string;
  value: number;
  valueLabel?: string;
  tone: ServiceHomeTone;
}

export interface ServicesQuoteListItemViewModel {
  id: string;
  number: string;
  title: string;
  templateId?: string;
  description: string;
  status: QuoteStatus;
  customerLine: string;
  equipmentLine: string;
  statusLabel: string;
  statusTone: ServiceHomeTone;
  totalLabel: string;
  discountValue: number;
  discountLabel: string;
  validityDays?: number;
  paymentTerms: string;
  notes: string;
  itemsLabel: string;
  items: ServicesQuoteItemViewModel[];
  canEdit: boolean;
}

export interface ServicesQuoteItemViewModel {
  description: string;
  quantity: string;
  unitValue: string;
  totalLabel: string;
}

export interface ServicesQuotesViewModel {
  title: 'Orçamentos';
  subtitle: 'Orçamentos locais';
  description: string;
  emptyState: {
    title: string;
    description: string;
  };
  kpis: ServicesQuotesKpiViewModel[];
  items: ServicesQuoteListItemViewModel[];
  totalItems: number;
}

const openStatuses = new Set<QuoteStatus>(['rascunho', 'enviado', 'aguardando_assinatura']);
const openValueStatuses = new Set<QuoteStatus>(['rascunho', 'enviado']);

export function buildServicesQuotesViewModel(
  input: BuildServicesQuotesInput,
): ServicesQuotesViewModel {
  const items = input.orcamentos.map((orcamento) => mapQuoteItem(input, orcamento));

  return {
    title: 'Orçamentos',
    subtitle: 'Orçamentos locais',
    description: 'Orçamentos vinculados a cliente, equipamento ou registro técnico.',
    emptyState: {
      title: 'Nenhum orçamento local',
      description: 'Orçamentos locais aparecerão aqui quando houver um rascunho cadastrado.',
    },
    kpis: buildKpis(input.orcamentos),
    items,
    totalItems: items.length,
  };
}

function mapQuoteItem(
  input: BuildServicesQuotesInput,
  orcamento: Orcamento,
): ServicesQuoteListItemViewModel {
  const cliente = orcamento.clienteId
    ? input.clientes.find((item) => item.id === orcamento.clienteId)
    : undefined;
  const equipamento = orcamento.equipamentoId
    ? input.equipamentos.find((item) => item.id === orcamento.equipamentoId)
    : undefined;
  const statusMeta = getStatusMeta(orcamento.status);

  return {
    id: orcamento.id,
    number: orcamento.numero,
    title: orcamento.titulo.trim() || 'Orçamento sem título',
    templateId: orcamento.modeloId,
    description: orcamento.descricao ?? '',
    status: orcamento.status,
    customerLine: cliente?.nome ?? 'Sem cliente vinculado',
    equipmentLine: equipamento
      ? `${equipamento.nome} - ${equipamento.local}`
      : 'Sem equipamento vinculado',
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
    totalLabel: formatCurrency(orcamento.total),
    discountValue: orcamento.desconto ?? 0,
    discountLabel: formatCurrency(orcamento.desconto ?? 0),
    validityDays: orcamento.validadeDias,
    paymentTerms: orcamento.formaPagamento ?? '',
    notes: orcamento.observacoes ?? '',
    itemsLabel: formatItemsLabel(orcamento.itens?.length ?? 0),
    items:
      orcamento.itens?.map((item) => ({
        description: item.descricao,
        quantity: String(item.quantidade).replace('.', ','),
        unitValue: formatNumberInput(item.valorUnitario),
        totalLabel: formatCurrency(item.total),
      })) ?? [],
    canEdit: orcamento.status === 'rascunho',
  };
}

function buildKpis(orcamentos: Orcamento[]): ServicesQuotesKpiViewModel[] {
  const openValue = orcamentos
    .filter((orcamento) => openValueStatuses.has(orcamento.status))
    .reduce((sum, orcamento) => sum + orcamento.total, 0);

  return [
    {
      label: 'Ativos',
      value: orcamentos.filter((orcamento) => openStatuses.has(orcamento.status)).length,
      tone: 'primary',
    },
    {
      label: 'Aprovados',
      value: orcamentos.filter((orcamento) => orcamento.status === 'aprovado').length,
      tone: 'success',
    },
    {
      label: 'Valor em aberto',
      value: openValue,
      valueLabel: formatCurrency(openValue),
      tone: 'warning',
    },
  ];
}

function getStatusMeta(status: QuoteStatus): { label: string; tone: ServiceHomeTone } {
  if (status === 'aprovado') {
    return { label: 'Aprovado', tone: 'success' };
  }

  if (status === 'recusado') {
    return { label: 'Recusado', tone: 'danger' };
  }

  if (status === 'expirado') {
    return { label: 'Expirado', tone: 'warning' };
  }

  if (status === 'enviado') {
    return { label: 'Enviado', tone: 'primary' };
  }

  if (status === 'aguardando_assinatura') {
    return { label: 'Aguardando assinatura', tone: 'warning' };
  }

  return { label: 'Rascunho', tone: 'muted' };
}

function formatCurrency(value: number): string {
  return value
    .toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    .replace(/\u00a0/g, ' ');
}

function formatItemsLabel(count: number): string {
  if (count === 0) {
    return 'Sem itens locais';
  }

  return `${count} ${count === 1 ? 'item local' : 'itens locais'}`;
}

function formatNumberInput(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
