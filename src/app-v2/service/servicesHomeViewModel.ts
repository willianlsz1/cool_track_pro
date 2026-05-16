import type { Cliente, Equipamento, RegistroServico, ServiceRecordStatus } from '../domain/types';
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
}

export interface ServicesHomeViewModel {
  title: 'Serviços';
  subtitle: 'Trabalho técnico';
  description: string;
  emptyState: ServicesEmptyStateViewModel;
  inProgress: ServiceInProgressViewModel | null;
  recentServices: RecentServiceViewModel[];
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
  statusLabel: string;
  statusTone: ServiceHomeTone;
  summary: string;
  partsUsed?: string;
  partsCost?: string;
  laborCost?: string;
  nextMaintenanceLabel?: string;
  outputStatus: ServiceOutputStatus;
}

export function buildServicesHomeViewModel(
  input: BuildServicesHomeInput,
  draft: ServiceDraft | null,
): ServicesHomeViewModel {
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
    recentServices: input.registros
      .slice()
      .sort((a, b) => b.data.localeCompare(a.data))
      .map((registro) => mapRecentService(input, registro)),
  };
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
    technician: registro.tecnico.trim() || 'TÃ©cnico nÃ£o informado',
    dateLabel: formatDateLabel(registro.data),
    statusLabel: formatStatusLabel(registro.status),
    statusTone: mapStatusTone(registro.status),
    summary: registro.observacoes?.trim() || 'Sem resumo técnico informado.',
    partsUsed: registro.pecas?.trim() || undefined,
    partsCost: registro.custoPecas?.trim() || undefined,
    laborCost: registro.custoMaoObra?.trim() || undefined,
    nextMaintenanceLabel: registro.proximaData ? formatDateLabel(registro.proximaData) : undefined,
    outputStatus: getOutputStatus(registro),
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
