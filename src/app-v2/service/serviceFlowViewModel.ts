import type {
  Cliente,
  CompromissoServico,
  EquipmentStatus,
  Equipamento,
  RegistroServico,
  ServiceCommitmentKind,
  ServiceRecordKind,
  ServiceRecordStatus,
} from '../domain/types';

export type ServiceFlowStep = 'context' | 'type' | 'execution' | 'review' | 'done';
export type ServiceTone = 'danger' | 'warning' | 'success' | 'primary';
export type ServiceQuickSuggestionId =
  | 'limpeza-preventiva'
  | 'recarga-gas'
  | 'troca-filtro'
  | 'inspecao-tecnica'
  | 'instalacao'
  | 'outro-atendimento';

export interface ServiceDraft {
  equipmentId: string;
  serviceDate?: string;
  commitmentId?: string;
  kind?: ServiceRecordKind;
  customKind: string;
  quickSuggestionId?: ServiceQuickSuggestionId;
  technician: string;
  diagnosis: string;
  actionsDone: string;
  partsUsed?: string;
  partsCost?: string;
  laborCost?: string;
  nextMaintenanceDate?: string;
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

export interface ServiceQuickSuggestionViewModel {
  id: ServiceQuickSuggestionId;
  title: string;
  kind: ServiceRecordKind;
  kindLabel: string;
  tone: ServiceTone;
  summary: string;
  suggestedActions: string;
  selected: boolean;
}

export interface ServiceTypeViewModel {
  title: 'Tipo de serviço';
  selectedKind?: ServiceRecordKind;
  customKind: string;
  customKindMaxLength: 40;
  quickSuggestions: ServiceQuickSuggestionViewModel[];
  canContinue: boolean;
  options: ServiceTypeOptionViewModel[];
}

export interface ServiceReviewViewModel {
  title: 'Revisar serviço';
  equipmentName: string;
  customerLine: string;
  serviceDateLabel: string;
  kindLabel: string;
  technician: string;
  diagnosis: string;
  actionsDone: string;
  partsUsed: string;
  partsCost: string;
  laborCost: string;
  nextMaintenanceLabel: string;
  finalStatusLabel: string;
  finalStatusTone: ServiceTone;
}

export interface ServiceDoneViewModel {
  title: 'Serviço concluído';
  summary: string;
  technicalSummary: string[];
  disabledOutputs: ['Próximo compromisso'];
  postDiagnosticQuote: {
    label: 'Criar orçamento pós-diagnóstico';
    detail: string;
  } | null;
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

export const serviceCustomKindMaxLength = 40;

const serviceQuickSuggestions = [
  {
    id: 'limpeza-preventiva',
    title: 'Limpeza preventiva',
    kind: 'preventiva',
    tone: 'success',
    summary: 'Preventiva - filtros, inspeção visual e teste funcional.',
    diagnosis:
      'Acúmulo de sujeira nos filtros e necessidade de limpeza preventiva para manter o fluxo de ar adequado.',
    actionsDone:
      'Limpeza dos filtros de ar, inspeção visual do equipamento e teste funcional após o atendimento.',
    suggestedActions: 'Limpeza de filtros, inspeção visual e teste funcional.',
  },
  {
    id: 'recarga-gas',
    title: 'Recarga de gás',
    kind: 'corretiva',
    tone: 'danger',
    summary: 'Corretiva - baixo rendimento e verificação de pressão.',
    diagnosis:
      'Baixo rendimento do equipamento, com suspeita de carga insuficiente de fluido refrigerante.',
    actionsDone:
      'Verificação de pressão, correção da carga de fluido conforme necessidade e teste de funcionamento.',
    suggestedActions: 'Verificação de pressão, recarga e teste de estanqueidade.',
  },
  {
    id: 'troca-filtro',
    title: 'Troca de filtro',
    kind: 'preventiva',
    tone: 'success',
    summary: 'Preventiva - filtro saturado ou com acúmulo de impurezas.',
    diagnosis: 'Filtro saturado ou com acúmulo de impurezas, reduzindo o fluxo de ar.',
    actionsDone: 'Substituição ou limpeza do filtro e teste de fluxo de ar após o atendimento.',
    suggestedActions: 'Substituição ou limpeza do filtro e teste de fluxo.',
  },
  {
    id: 'inspecao-tecnica',
    title: 'Inspeção técnica',
    kind: 'visita',
    tone: 'warning',
    summary: 'Visita - avaliação técnica sem manutenção completa.',
    diagnosis: 'Avaliação técnica solicitada para verificar a condição operacional do equipamento.',
    actionsDone: 'Inspeção visual, checagens básicas e orientação técnica ao cliente.',
    suggestedActions: 'Inspeção visual, medições e orientação técnica.',
  },
  {
    id: 'instalacao',
    title: 'Instalação',
    kind: 'instalacao',
    tone: 'primary',
    summary: 'Instalação ou substituição de equipamento.',
    diagnosis:
      'Equipamento preparado para instalação ou substituição conforme necessidade do cliente.',
    actionsDone: 'Montagem, conexão, verificações iniciais e teste final de funcionamento.',
    suggestedActions: 'Montagem, conexão, carga e teste final.',
  },
  {
    id: 'outro-atendimento',
    title: 'Outro atendimento',
    kind: 'outro',
    tone: 'primary',
    summary: 'Manual - use quando nenhuma sugestão rápida descrever o serviço.',
    diagnosis: '',
    actionsDone: '',
    suggestedActions: 'Não preenche diagnóstico nem ações.',
  },
] satisfies Array<{
  id: ServiceQuickSuggestionId;
  title: string;
  kind: ServiceRecordKind;
  tone: ServiceTone;
  summary: string;
  diagnosis: string;
  actionsDone: string;
  suggestedActions: string;
}>;

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
    serviceDate: input.today,
    commitmentId: commitment?.id,
    kind: commitment?.tipo,
    customKind: '',
    quickSuggestionId: undefined,
    technician: '',
    diagnosis: '',
    actionsDone: '',
    partsUsed: '',
    partsCost: '',
    laborCost: '',
    nextMaintenanceDate: '',
    finalStatus: 'ok',
  };
}

export function createServiceDraftFromRecord(registro: RegistroServico): ServiceDraft {
  return {
    equipmentId: registro.equipamentoId,
    serviceDate: registro.data,
    kind: registro.tipo,
    customKind: normalizeCustomRecordKind(registro),
    quickSuggestionId: undefined,
    technician: registro.tecnico,
    diagnosis: registro.diagnostico ?? registro.observacoes ?? '',
    actionsDone: registro.acoesExecutadas ?? registro.observacoes ?? '',
    partsUsed: registro.pecas ?? '',
    partsCost: registro.custoPecas ?? '',
    laborCost: registro.custoMaoObra ?? '',
    nextMaintenanceDate: registro.proximaData ?? '',
    finalStatus: registro.status,
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
    customKind: draft.customKind,
    customKindMaxLength: serviceCustomKindMaxLength,
    quickSuggestions: serviceQuickSuggestions.map((suggestion) => ({
      id: suggestion.id,
      title: suggestion.title,
      kind: suggestion.kind,
      kindLabel: formatRecordKind(suggestion.kind, ''),
      tone: suggestion.tone,
      summary: suggestion.summary,
      suggestedActions: suggestion.suggestedActions,
      selected: draft.quickSuggestionId === suggestion.id,
    })),
    canContinue: canContinueServiceType(draft),
    options: serviceTypeOptions,
  };
}

export function applyServiceQuickSuggestion(
  draft: ServiceDraft,
  suggestionId: ServiceQuickSuggestionId,
): ServiceDraft {
  const suggestion = serviceQuickSuggestions.find((item) => item.id === suggestionId);

  if (!suggestion) {
    return draft;
  }

  let customKind = '';

  if (suggestion.kind === 'outro' && suggestion.id !== 'outro-atendimento') {
    customKind = draft.customKind;
  }

  return {
    ...draft,
    kind: suggestion.kind,
    customKind,
    quickSuggestionId: suggestion.id,
    diagnosis: suggestion.diagnosis,
    actionsDone: suggestion.actionsDone,
  };
}

export function getServiceQuickSuggestionTitle(
  suggestionId: ServiceQuickSuggestionId | undefined,
): string | undefined {
  return serviceQuickSuggestions.find((item) => item.id === suggestionId)?.title;
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
    serviceDateLabel: formatOptionalFullDateLabel(draft.serviceDate),
    kindLabel: formatRecordKind(draft.kind, draft.customKind),
    technician: draft.technician.trim() || 'Técnico não informado',
    diagnosis: draft.diagnosis.trim() || 'Diagnóstico não informado',
    actionsDone: draft.actionsDone.trim() || 'Ações executadas não informadas',
    partsUsed: draft.partsUsed?.trim() || 'Sem peças informadas',
    partsCost: draft.partsCost?.trim() || 'Não informado',
    laborCost: draft.laborCost?.trim() || 'Não informado',
    nextMaintenanceLabel: formatOptionalFullDateLabel(draft.nextMaintenanceDate),
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
      `Técnico: ${review.technician}`,
      `Diagnóstico: ${review.diagnosis}`,
      `Ações: ${review.actionsDone}`,
      `Peças usadas: ${review.partsUsed}`,
      `Custo de peças: ${review.partsCost}`,
      `Custo de mão de obra: ${review.laborCost}`,
      `Próxima manutenção: ${review.nextMaintenanceLabel}`,
      `Status final: ${review.finalStatusLabel}`,
    ],
    disabledOutputs: ['Próximo compromisso'],
    postDiagnosticQuote:
      draft.finalStatus === 'warn' || draft.finalStatus === 'danger'
        ? {
            label: 'Criar orçamento pós-diagnóstico',
            detail: 'Use quando o atendimento indicar peça, retorno ou reparo a aprovar.',
          }
        : null,
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

export function formatServiceRecordKind(
  kind: ServiceRecordKind | undefined,
  customKind?: string,
): string {
  return formatRecordKind(kind, customKind);
}

function canContinueServiceType(draft: ServiceDraft): boolean {
  if (!draft.kind) {
    return false;
  }

  if (draft.kind !== 'outro') {
    return true;
  }

  const customKind = draft.customKind.trim();
  return customKind.length > 0 && customKind.length <= serviceCustomKindMaxLength;
}

function formatRecordKind(kind: ServiceRecordKind | undefined, customKind?: string): string {
  if (kind === 'outro') {
    const normalizedCustomKind = customKind?.trim();
    return normalizedCustomKind ? `Outro · ${normalizedCustomKind}` : 'Serviço';
  }

  const labels: Record<ServiceRecordKind, string> = {
    preventiva: 'Preventiva',
    corretiva: 'Corretiva',
    instalacao: 'Instalação',
    visita: 'Visita',
    outro: 'Serviço',
  };

  return kind ? labels[kind] : 'Serviço';
}

function normalizeCustomRecordKind(registro: RegistroServico): string {
  if (registro.tipo !== 'outro') {
    return '';
  }

  const description = registro.tipoDescricao?.trim();

  if (!description) {
    return '';
  }

  const [, customKind] = description.split('·');
  return customKind?.trim() ?? '';
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

function formatOptionalFullDateLabel(date: string | undefined): string {
  const normalizedDate = date?.trim();

  if (!normalizedDate) {
    return 'Não informada';
  }

  const [year, month, day] = normalizedDate.split('-');

  if (!year || !month || !day) {
    return normalizedDate;
  }

  return `${day}/${month}/${year}`;
}
