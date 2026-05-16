import type { Cliente, Equipamento, RegistroServico } from '../domain/types';
import { formatServiceRecordKind } from './serviceFlowViewModel';
import type { BuildServicesHomeInput, ServiceHomeTone } from './servicesHomeViewModel';

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
  items: ServicesReportListItemViewModel[];
  totalItems: number;
}

export function buildServicesReportsViewModel(
  input: BuildServicesHomeInput,
  query = '',
): ServicesReportsViewModel {
  const allItems = input.registros
    .slice()
    .sort((a, b) => b.data.localeCompare(a.data))
    .map((registro) => mapReportItem(input, registro));
  const normalizedQuery = normalizeSearch(query);
  const items = normalizedQuery
    ? allItems.filter((item) => item.searchText.includes(normalizedQuery))
    : allItems;

  return {
    title: 'Relatorios',
    subtitle: 'Documentos tecnicos',
    description: 'Relatorios simples gerados a partir dos registros concluidos.',
    searchPlaceholder: 'Buscar atendimento, cliente ou equipamento',
    emptyState: {
      title: normalizedQuery ? 'Nenhum relatorio encontrado' : 'Nenhum relatorio gerado',
      description: normalizedQuery
        ? 'Ajuste a busca para localizar outro atendimento.'
        : 'Conclua um registro de servico para gerar o primeiro relatorio.',
    },
    kpis: buildKpis(input.today, allItems),
    items,
    totalItems: allItems.length,
  };
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
