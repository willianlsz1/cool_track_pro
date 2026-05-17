import type {
  Cliente,
  Equipamento,
  Orcamento,
  RegistroServico,
  ServiceRecordKind,
  ServiceRecordStatus,
} from '../domain/types';
import { formatServiceRecordKind, type ServiceDraft } from './serviceFlowViewModel';

export type ServiceOutputStatus =
  | 'relatorio_pendente'
  | 'orcamento_sugerido'
  | 'proximo_compromisso_sugerido'
  | 'sem_pendencia';

export type ServiceHomeTone = 'danger' | 'warning' | 'success' | 'primary' | 'muted';

export interface BuildServicesHomeInput {
  today: string;
  clientes: Cliente[];
  equipamentos: Equipamento[];
  registros: RegistroServico[];
  orcamentos: Orcamento[];
}

export type ServicePeriodFilter = 'all' | 'last_7_days' | 'current_month';

export interface BuildServicesHomeFilters {
  query?: string;
  period?: ServicePeriodFilter;
  clientId?: string;
  equipmentId?: string;
  kind?: ServiceRecordKind | 'all';
  status?: ServiceRecordStatus | 'all';
}

export interface ServicesHomeViewModel {
  title: 'Serviços';
  subtitle: 'Trabalho técnico';
  description: string;
  emptyState: ServicesEmptyStateViewModel;
  inProgress: ServiceInProgressViewModel | null;
  activeFilters: Required<BuildServicesHomeFilters>;
  filterOptions: ServicesHomeFilterOptions;
  recentServices: RecentServiceViewModel[];
}

export interface ServicesHomeFilterOptions {
  clients: Array<{ id: string; label: string }>;
  equipments: Array<{ id: string; label: string }>;
}

export interface ServicesEmptyStateViewModel {
  title: 'Nenhum serviço em andamento';
  description: string;
  actionLabel: 'Iniciar registro';
}

export interface ServiceInProgressViewModel {
  equipmentName: string;
  customerLine: string;
  kindLabel: string;
  progressLabel: string;
  actionLabel: 'Retomar registro';
}

export interface RecentServiceViewModel {
  id: string;
  equipmentName: string;
  customerLine: string;
  kindLabel: string;
  technician: string;
  dateLabel: string;
  relativeDateLabel: string;
  statusLabel: string;
  statusTone: ServiceHomeTone;
  summary: string;
  partsUsed?: string;
  partsCost?: string;
  laborCost?: string;
  nextMaintenanceLabel?: string;
  outputStatus: ServiceOutputStatus;
  searchText: string;
}

export function buildServicesHomeViewModel(
  input: BuildServicesHomeInput,
  draft: ServiceDraft | null,
  filtersOrQuery: BuildServicesHomeFilters | string = {},
): ServicesHomeViewModel {
  const activeFilters = normalizeFilters(filtersOrQuery);
  const allRecentServices = input.registros
    .slice()
    .sort((a, b) => b.data.localeCompare(a.data))
    .filter((registro) => matchesRecordFilters(input, registro, activeFilters))
    .map((registro) => mapRecentService(input, registro));
  const normalizedQuery = normalizeSearch(activeFilters.query);
  const recentServices = normalizedQuery
    ? allRecentServices.filter((service) => service.searchText.includes(normalizedQuery))
    : allRecentServices;

  return {
    title: 'Serviços',
    subtitle: 'Trabalho técnico',
    description: 'Registros recentes e saídas técnicas planejadas.',
    emptyState: {
      title: 'Nenhum serviço em andamento',
      description: 'Comece por um equipamento para registrar o primeiro atendimento.',
      actionLabel: 'Iniciar registro',
    },
    inProgress: draft ? buildInProgress(input, draft) : null,
    activeFilters,
    filterOptions: {
      clients: input.clientes.map((cliente) => ({ id: cliente.id, label: cliente.nome })),
      equipments: input.equipamentos.map((equipamento) => ({
        id: equipamento.id,
        label: equipamento.nome,
      })),
    },
    recentServices,
  };
}

function normalizeFilters(filtersOrQuery: BuildServicesHomeFilters | string) {
  const filters = typeof filtersOrQuery === 'string' ? { query: filtersOrQuery } : filtersOrQuery;

  return {
    query: filters.query ?? '',
    period: filters.period ?? 'all',
    clientId: filters.clientId ?? 'all',
    equipmentId: filters.equipmentId ?? 'all',
    kind: filters.kind ?? 'all',
    status: filters.status ?? 'all',
  };
}

function matchesRecordFilters(
  input: BuildServicesHomeInput,
  registro: RegistroServico,
  filters: Required<BuildServicesHomeFilters>,
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

  if (filters.kind !== 'all' && registro.tipo !== filters.kind) {
    return false;
  }

  if (filters.status !== 'all' && registro.status !== filters.status) {
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

function buildInProgress(
  input: BuildServicesHomeInput,
  draft: ServiceDraft,
): ServiceInProgressViewModel {
  const { equipamento, cliente } = getServiceEntities(input, draft.equipmentId);

  return {
    equipmentName: equipamento.nome,
    customerLine: formatCustomerLine(equipamento, cliente),
    kindLabel: formatServiceRecordKind(draft.kind, draft.customKind),
    progressLabel: formatProgressLabel(draft),
    actionLabel: 'Retomar registro',
  };
}

function mapRecentService(
  input: BuildServicesHomeInput,
  registro: RegistroServico,
): RecentServiceViewModel {
  const { equipamento, cliente } = getServiceEntities(input, registro.equipamentoId);

  return {
    id: registro.id,
    equipmentName: equipamento.nome,
    customerLine: formatCustomerLine(equipamento, cliente),
    kindLabel: registro.tipoDescricao ?? formatServiceRecordKind(registro.tipo),
    technician: registro.tecnico.trim() || 'Técnico não informado',
    dateLabel: formatDateLabel(registro.data),
    relativeDateLabel: formatRelativeDateLabel(input.today, registro.data),
    statusLabel: formatStatusLabel(registro.status),
    statusTone: mapStatusTone(registro.status),
    summary: registro.observacoes?.trim() || 'Sem resumo técnico informado.',
    partsUsed: registro.pecas?.trim() || undefined,
    partsCost: registro.custoPecas?.trim() || undefined,
    laborCost: registro.custoMaoObra?.trim() || undefined,
    nextMaintenanceLabel: registro.proximaData ? formatDateLabel(registro.proximaData) : undefined,
    outputStatus: getOutputStatus(registro),
    searchText: normalizeSearch(
      [
        registro.id,
        equipamento.nome,
        cliente?.nome,
        equipamento.local,
        registro.tipoDescricao ?? formatServiceRecordKind(registro.tipo),
        registro.tecnico,
        registro.diagnostico,
        registro.acoesExecutadas,
        registro.observacoes,
        registro.pecas,
        registro.custoPecas,
        registro.custoMaoObra,
      ].join(' '),
    ),
  };
}

function getServiceEntities(input: BuildServicesHomeInput, equipmentId: string) {
  const equipamento = input.equipamentos.find((item) => item.id === equipmentId);

  if (!equipamento) {
    throw new Error(`Equipamento não encontrado: ${equipmentId}`);
  }

  const cliente = equipamento.clienteId
    ? input.clientes.find((item) => item.id === equipamento.clienteId)
    : undefined;

  return { equipamento, cliente };
}

function formatCustomerLine(equipamento: Equipamento, cliente: Cliente | undefined): string {
  return `${cliente?.nome ?? 'Sem cliente vinculado'} - ${equipamento.local}`;
}

function formatProgressLabel(draft: ServiceDraft): string {
  if (draft.diagnosis.trim() && draft.actionsDone.trim()) {
    return 'Pronto para revisão';
  }

  if (draft.diagnosis.trim()) {
    return 'Diagnóstico preenchido';
  }

  if (draft.kind) {
    return 'Tipo selecionado';
  }

  return 'Contexto iniciado';
}

function formatStatusLabel(status: ServiceRecordStatus): string {
  if (status === 'danger') {
    return 'Crítico';
  }

  if (status === 'warn') {
    return 'Atenção';
  }

  return 'Operacional';
}

function mapStatusTone(status: ServiceRecordStatus): ServiceHomeTone {
  if (status === 'danger') {
    return 'danger';
  }

  if (status === 'warn') {
    return 'warning';
  }

  return 'success';
}

function getOutputStatus(registro: RegistroServico): ServiceOutputStatus {
  if (registro.proximaData) {
    return 'proximo_compromisso_sugerido';
  }

  if (registro.status === 'warn' || registro.status === 'danger') {
    return 'orcamento_sugerido';
  }

  if (registro.tipo === 'visita' || registro.tipo === 'outro') {
    return 'relatorio_pendente';
  }

  return 'sem_pendencia';
}

function formatDateLabel(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

function formatRelativeDateLabel(today: string, date: string): string {
  const todayValue = new Date(`${today}T00:00:00`);
  const dateValue = new Date(`${date}T00:00:00`);
  const diffDays = Math.round((todayValue.getTime() - dateValue.getTime()) / (1000 * 60 * 60 * 24));

  if (!Number.isFinite(diffDays)) {
    return '';
  }

  if (diffDays <= 0) {
    return 'hoje';
  }

  if (diffDays === 1) {
    return 'há 1 dia';
  }

  return `há ${diffDays} dias`;
}

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
