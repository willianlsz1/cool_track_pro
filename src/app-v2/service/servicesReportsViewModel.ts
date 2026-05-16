import type { Cliente, Equipamento, RegistroServico } from '../domain/types';
import { formatServiceRecordKind } from './serviceFlowViewModel';
import type {
  BuildServicesHomeInput,
  ServiceHomeTone,
  ServicePeriodFilter,
} from './servicesHomeViewModel';

export type ServiceReportListStatus = 'pronto' | 'pendente' | 'atencao';

export interface ServicesReportsKpiViewModel {
  label: string;
  value: number;
  tone: ServiceHomeTone;
}

export interface ServicesReportListItemViewModel {
  id: string;
  reportId: string;
  customerName: string;
  equipmentName: string;
  kindLabel: string;
  date: string;
  dateLabel: string;
  status: ServiceReportListStatus;
  statusLabel: 'Pronto' | 'Pendente de revisao' | 'Atencao';
  statusTone: ServiceHomeTone;
  partsUsed?: string;
  partsCost?: string;
  laborCost?: string;
  searchText: string;
}

export interface BuildServicesReportsFilters {
  query?: string;
  period?: ServicePeriodFilter;
  clientId?: string;
  equipmentId?: string;
}

export interface ServicesReportsFilterOptions {
  clients: Array<{ id: string; label: string }>;
  equipments: Array<{ id: string; label: string }>;
}

export interface ServicesReportsSummaryViewModel {
  title: 'Resumo consolidado';
  totalReports: number;
  readyReports: number;
  attentionReports: number;
  pendingReports: number;
  partsCostTotal: string;
  laborCostTotal: string;
}

export interface ServicesReportsViewModel {
  title: 'Relatorios';
  subtitle: 'Documentos tecnicos';
  description: string;
  searchPlaceholder: string;
  emptyState: {
    title: string;
    description: string;
  };
  kpis: ServicesReportsKpiViewModel[];
  activeFilters: Required<BuildServicesReportsFilters>;
  filterOptions: ServicesReportsFilterOptions;
  summary: ServicesReportsSummaryViewModel;
  items: ServicesReportListItemViewModel[];
  totalItems: number;
}

export function buildServicesReportsViewModel(
  input: BuildServicesHomeInput,
  filtersOrQuery: BuildServicesReportsFilters | string = {},
): ServicesReportsViewModel {
  const activeFilters = normalizeFilters(filtersOrQuery);
  const allItems = input.registros
    .slice()
    .sort((a, b) => b.data.localeCompare(a.data))
    .filter((registro) => matchesReportFilters(input, registro, activeFilters))
    .map((registro) => mapReportItem(input, registro));
  const normalizedQuery = normalizeSearch(activeFilters.query);
  const items = normalizedQuery
    ? allItems.filter((item) => item.searchText.includes(normalizedQuery))
    : allItems;
  const hasActiveFilters = isActiveFilters(activeFilters);

  return {
    title: 'Relatorios',
    subtitle: 'Documentos tecnicos',
    description: 'Relatorios simples gerados a partir dos registros concluidos.',
    searchPlaceholder: 'Buscar atendimento, cliente ou equipamento',
    emptyState: {
      title: hasActiveFilters ? 'Nenhum relatorio encontrado' : 'Nenhum relatorio gerado',
      description: hasActiveFilters
        ? 'Ajuste os filtros para localizar outro atendimento.'
        : 'Conclua um registro de servico para gerar o primeiro relatorio.',
    },
    kpis: buildKpis(input.today, items),
    activeFilters,
    filterOptions: {
      clients: input.clientes.map((cliente) => ({ id: cliente.id, label: cliente.nome })),
      equipments: input.equipamentos.map((equipamento) => ({
        id: equipamento.id,
        label: equipamento.nome,
      })),
    },
    summary: buildSummary(items),
    items,
    totalItems: input.registros.length,
  };
}

function normalizeFilters(filtersOrQuery: BuildServicesReportsFilters | string) {
  const filters = typeof filtersOrQuery === 'string' ? { query: filtersOrQuery } : filtersOrQuery;

  return {
    query: filters.query ?? '',
    period: filters.period ?? 'all',
    clientId: filters.clientId ?? 'all',
    equipmentId: filters.equipmentId ?? 'all',
  };
}

function isActiveFilters(filters: Required<BuildServicesReportsFilters>): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.period !== 'all' ||
    filters.clientId !== 'all' ||
    filters.equipmentId !== 'all'
  );
}

function matchesReportFilters(
  input: BuildServicesHomeInput,
  registro: RegistroServico,
  filters: Required<BuildServicesReportsFilters>,
): boolean {
  const equipamento = input.equipamentos.find((item) => item.id === registro.equipamentoId);

  if (filters.period !== 'all' && !matchesPeriod(registro.data, input.today, filters.period)) {
    return false;
  }

  if (filters.clientId !== 'all' && equipamento?.clienteId !== filters.clientId) {
    return false;
  }

  if (filters.equipmentId !== 'all' && registro.equipamentoId !== filters.equipmentId) {
    return false;
  }

  return true;
}

function matchesPeriod(date: string, today: string, period: ServicePeriodFilter): boolean {
  if (period === 'current_month') {
    return date.slice(0, 7) === today.slice(0, 7);
  }

  const dateValue = new Date(`${date}T00:00:00`);
  const todayValue = new Date(`${today}T00:00:00`);
  const diffMs = todayValue.getTime() - dateValue.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

function mapReportItem(
  input: BuildServicesHomeInput,
  registro: RegistroServico,
): ServicesReportListItemViewModel {
  const { equipamento, cliente } = getReportEntities(input, registro.equipamentoId);
  const kindLabel = registro.tipoDescricao ?? formatServiceRecordKind(registro.tipo);
  const status = mapReportStatus(registro);
  const statusMeta = getStatusMeta(status);
  const customerName = cliente?.nome ?? 'Sem cliente vinculado';
  const equipmentName = equipamento?.nome ?? 'Equipamento nao encontrado';
  const reportId = `REL-${registro.id.toUpperCase()}`;

  return {
    id: registro.id,
    reportId,
    customerName,
    equipmentName,
    kindLabel,
    date: registro.data,
    dateLabel: formatDateLabel(registro.data),
    status,
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
    partsUsed: registro.pecas?.trim() || undefined,
    partsCost: registro.custoPecas?.trim() || undefined,
    laborCost: registro.custoMaoObra?.trim() || undefined,
    searchText: normalizeSearch(
      [
        registro.id,
        reportId,
        customerName,
        equipmentName,
        kindLabel,
        registro.pecas,
        registro.custoPecas,
        registro.custoMaoObra,
      ].join(' '),
    ),
  };
}

function getReportEntities(input: BuildServicesHomeInput, equipmentId: string) {
  const equipamento = input.equipamentos.find((item) => item.id === equipmentId);
  const cliente =
    equipamento && equipamento.clienteId
      ? input.clientes.find((item) => item.id === equipamento.clienteId)
      : undefined;

  return { equipamento, cliente };
}

function mapReportStatus(registro: RegistroServico): ServiceReportListStatus {
  if (registro.status === 'warn' || registro.status === 'danger') {
    return 'atencao';
  }

  if (!registro.observacoes?.trim()) {
    return 'pendente';
  }

  return 'pronto';
}

function getStatusMeta(status: ServiceReportListStatus): {
  label: ServicesReportListItemViewModel['statusLabel'];
  tone: ServiceHomeTone;
} {
  if (status === 'atencao') {
    return { label: 'Atencao', tone: 'warning' };
  }

  if (status === 'pendente') {
    return { label: 'Pendente de revisao', tone: 'muted' };
  }

  return { label: 'Pronto', tone: 'success' };
}

function buildKpis(
  today: string,
  items: ServicesReportListItemViewModel[],
): ServicesReportsKpiViewModel[] {
  const currentMonth = today.slice(0, 7);

  return [
    {
      label: 'Relatorios prontos',
      value: items.filter((item) => item.status === 'pronto').length,
      tone: 'success',
    },
    {
      label: 'Com atencao',
      value: items.filter((item) => item.status === 'atencao').length,
      tone: 'warning',
    },
    {
      label: 'Pendentes',
      value: items.filter((item) => item.status === 'pendente').length,
      tone: 'muted',
    },
    {
      label: 'Este mes',
      value: items.filter((item) => item.date.startsWith(currentMonth)).length,
      tone: 'primary',
    },
  ];
}

function buildSummary(items: ServicesReportListItemViewModel[]): ServicesReportsSummaryViewModel {
  return {
    title: 'Resumo consolidado',
    totalReports: items.length,
    readyReports: items.filter((item) => item.status === 'pronto').length,
    attentionReports: items.filter((item) => item.status === 'atencao').length,
    pendingReports: items.filter((item) => item.status === 'pendente').length,
    partsCostTotal: formatCurrencyTotal(items.map((item) => item.partsCost)),
    laborCostTotal: formatCurrencyTotal(items.map((item) => item.laborCost)),
  };
}

function formatCurrencyTotal(values: Array<string | undefined>): string {
  const total = values.reduce((sum, value) => sum + parseCurrencyValue(value), 0);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
    .format(total)
    .replace(/\u00A0/g, ' ');
}

function parseCurrencyValue(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const normalized = value
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDateLabel(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
