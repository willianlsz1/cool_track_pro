import type {
  Cliente,
  CompromissoServico,
  EquipmentStatus,
  Equipamento,
  ServiceCommitmentKind,
  ServiceRecordKind,
  ServiceRecordStatus,
} from '../domain/types';

export type ServiceFlowStep = 'context' | 'type' | 'execution' | 'review' | 'done';
export type ServiceTone = 'danger' | 'warning' | 'success' | 'primary';

export interface ServiceDraft {
  equipmentId: string;
  commitmentId?: string;
  kind?: ServiceRecordKind;
  technician: string;
  diagnosis: string;
  actionsDone: string;
  finalStatus: ServiceRecordStatus;
}

export interface BuildServiceFlowInput {
  today: string;
  clientes: Cliente[];
  equipamentos: Equipamento[];
  compromissos: CompromissoServico[];
}

export interface ServiceContextViewModel {
  title: 'Registrar serviço';
  equipmentName: string;
  customerLine: string;
  equipmentLine: string;
  reason: string;
  statusLabel: string;
  statusTone: ServiceTone;
}

export interface ServiceTypeOptionViewModel {
  kind: ServiceRecordKind;
  label: string;
  description: string;
}

export interface ServiceTypeViewModel {
  title: 'Tipo de serviço';
  selectedKind?: ServiceRecordKind;
  options: ServiceTypeOptionViewModel[];
}

export interface ServiceReviewViewModel {
  title: 'Revisar serviço';
  equipmentName: string;
  customerLine: string;
  kindLabel: string;
  technician: string;
  diagnosis: string;
  actionsDone: string;
  finalStatusLabel: string;
  finalStatusTone: ServiceTone;
}

export interface ServiceDoneViewModel {
  title: 'Serviço concluído';
  summary: string;
  technicalSummary: string[];
  disabledOutputs: ['Orçamento', 'Próximo compromisso'];
}

const serviceTypeOptions: ServiceTypeOptionViewModel[] = [
  {
    kind: 'preventiva',
    label: 'Preventiva',
    description: 'Manutenção programada, limpeza, inspeção e medições básicas.',
  },
  {
    kind: 'corretiva',
    label: 'Corretiva',
    description: 'Atendimento de falha, ajuste, reparo ou orientação imediata.',
  },
  {
    kind: 'instalacao',
    label: 'Instalação',
    description: 'Instalação, substituição ou comissionamento de equipamento.',
  },
  {
    kind: 'visita',
    label: 'Visita',
    description: 'Avaliação técnica sem fechamento de manutenção completa.',
  },
  {
    kind: 'outro',
    label: 'Outro',
    description: 'Registro técnico fora das categorias principais.',
  },
];

export function createServiceDraft(
  input: BuildServiceFlowInput,
  equipmentId: string,
  commitmentId?: string,
): ServiceDraft {
  const commitment = commitmentId
    ? input.compromissos.find(
        (item) => item.id === commitmentId && item.equipamentoId === equipmentId,
      )
    : getNextCommitment(input, equipmentId);

  return {
    equipmentId,
    commitmentId: commitment?.id,
    kind: commitment?.tipo,
    technician: '',
    diagnosis: '',
    actionsDone: '',
    finalStatus: 'ok',
  };
}

export function buildServiceContextViewModel(
  input: BuildServiceFlowInput,
  draft: ServiceDraft,
): ServiceContextViewModel {
  const { equipamento, cliente } = getServiceEntities(input, draft.equipmentId);
  const commitment = getDraftCommitment(input, draft);
  const reason = commitment
    ? formatCommitmentReason(commitment, input.today)
    : 'Registro iniciado pelo técnico';

  return {
    title: 'Registrar serviço',
    equipmentName: equipamento.nome,
    customerLine: formatCustomerLine(equipamento, cliente),
    equipmentLine: formatEquipmentLine(equipamento),
    reason,
    statusLabel: formatStatusLabel(equipamento.status),
    statusTone: mapStatusTone(equipamento.status),
  };
}

export function buildServiceTypeViewModel(draft: ServiceDraft): ServiceTypeViewModel {
  return {
    title: 'Tipo de serviço',
    selectedKind: draft.kind,
    options: serviceTypeOptions,
  };
}

export function buildServiceReviewViewModel(
  input: BuildServiceFlowInput,
  draft: ServiceDraft,
): ServiceReviewViewModel {
  const { equipamento, cliente } = getServiceEntities(input, draft.equipmentId);

  return {
    title: 'Revisar serviço',
    equipmentName: equipamento.nome,
    customerLine: formatCustomerLine(equipamento, cliente),
    kindLabel: formatRecordKind(draft.kind),
    technician: draft.technician.trim() || 'Técnico não informado',
    diagnosis: draft.diagnosis.trim() || 'Diagnóstico não informado',
    actionsDone: draft.actionsDone.trim() || 'Ações executadas não informadas',
    finalStatusLabel: formatStatusLabel(draft.finalStatus),
    finalStatusTone: mapStatusTone(draft.finalStatus),
  };
}

export function buildServiceDoneViewModel(
  input: BuildServiceFlowInput,
  draft: ServiceDraft,
): ServiceDoneViewModel {
  const review = buildServiceReviewViewModel(input, draft);

  return {
    title: 'Serviço concluído',
    summary: `${review.kindLabel} registrada para ${review.equipmentName}.`,
    technicalSummary: [
      `Cliente/local: ${review.customerLine}`,
      `Tecnico: ${review.technician}`,
      `Diagnóstico: ${review.diagnosis}`,
      `Ações: ${review.actionsDone}`,
      `Status final: ${review.finalStatusLabel}`,
    ],
    disabledOutputs: ['Orçamento', 'Próximo compromisso'],
  };
}

function getServiceEntities(input: BuildServiceFlowInput, equipmentId: string) {
  const equipamento = input.equipamentos.find((item) => item.id === equipmentId);

  if (!equipamento) {
    throw new Error(`Equipamento não encontrado: ${equipmentId}`);
  }

  const cliente = equipamento.clienteId
    ? input.clientes.find((item) => item.id === equipamento.clienteId)
    : undefined;

  return { equipamento, cliente };
}

function getDraftCommitment(
  input: BuildServiceFlowInput,
  draft: ServiceDraft,
): CompromissoServico | undefined {
  if (!draft.commitmentId) {
    return undefined;
  }

  return input.compromissos.find(
    (item) => item.id === draft.commitmentId && item.equipamentoId === draft.equipmentId,
  );
}

function getNextCommitment(
  input: BuildServiceFlowInput,
  equipmentId: string,
): CompromissoServico | undefined {
  return input.compromissos
    .filter((item) => item.equipamentoId === equipmentId && item.status === 'agendado')
    .sort((a, b) => a.dataAlvo.localeCompare(b.dataAlvo))[0];
}

function formatCustomerLine(equipamento: Equipamento, cliente: Cliente | undefined): string {
  return `${cliente?.nome ?? 'Sem cliente vinculado'} - ${equipamento.local}`;
}

function formatEquipmentLine(equipamento: Equipamento): string {
  const parts = [equipamento.tipo, equipamento.tag].filter(Boolean);
  return parts.length > 0 ? parts.join(' - ') : 'Sem tipo definido';
}

function formatCommitmentReason(commitment: CompromissoServico, today: string): string {
  const kind = formatCommitmentKind(commitment.tipo);

  if (commitment.dataAlvo < today) {
    return `${kind} vencida desde ${formatDateLabel(commitment.dataAlvo)}`;
  }

  if (commitment.dataAlvo === today) {
    return `${kind} marcada para hoje`;
  }

  return `${kind} agendada para ${formatDateLabel(commitment.dataAlvo)}`;
}

function formatCommitmentKind(kind: ServiceCommitmentKind): string {
  return kind === 'corretiva' ? 'Corretiva' : 'Preventiva';
}

function formatRecordKind(kind: ServiceRecordKind | undefined): string {
  const labels: Record<ServiceRecordKind, string> = {
    preventiva: 'Preventiva',
    corretiva: 'Corretiva',
    instalacao: 'Instalação',
    visita: 'Visita',
    outro: 'Serviço',
  };

  return kind ? labels[kind] : 'Serviço';
}

function formatStatusLabel(status: EquipmentStatus): string {
  if (status === 'danger') {
    return 'Crítico';
  }

  if (status === 'warn') {
    return 'Atenção';
  }

  return 'Operacional';
}

function mapStatusTone(status: EquipmentStatus): ServiceTone {
  if (status === 'danger') {
    return 'danger';
  }

  if (status === 'warn') {
    return 'warning';
  }

  return 'success';
}

function formatDateLabel(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}
