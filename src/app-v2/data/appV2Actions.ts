import type {
  CompromissoServico,
  Equipamento,
  Orcamento,
  OrcamentoItem,
  QuoteStatus,
  RegistroServico,
  ServiceCommitmentKind,
  ServiceRecordStatus,
} from '../domain/types';
import {
  createServiceDraft,
  formatServiceRecordKind,
  type ServiceDraft,
} from '../service/serviceFlowViewModel';
import type { AppV2MockSnapshot } from './appV2MockStore';

export interface AppV2FlowState extends AppV2MockSnapshot {
  serviceDraft: ServiceDraft | null;
}

export interface CompleteServiceInput {
  id: string;
  date: string;
  technician: string;
  diagnosis: string;
  actionsDone: string;
  finalStatus: ServiceRecordStatus;
}

export interface ScheduleNextCommitmentInput {
  id: string;
  equipmentId: string;
  kind: ServiceCommitmentKind;
  targetDate: string;
  origin: CompromissoServico['origem'];
}

export interface CreateQuoteFromServiceRecordInput {
  id: string;
  recordId: string;
}

export interface UpdateQuoteDraftInput {
  id: string;
  title: string;
  total: string;
  status: QuoteStatus;
  items?: UpdateQuoteDraftItemInput[];
}

export interface UpdateQuoteDraftItemInput {
  description: string;
  quantity: string;
  unitValue: string;
}

export function registerEquipment(
  state: AppV2MockSnapshot,
  equipamento: Equipamento,
): AppV2FlowState {
  return {
    ...cloneSnapshot(state),
    equipamentos: [...state.equipamentos.map((item) => ({ ...item })), { ...equipamento }],
    serviceDraft: getExistingDraft(state),
  };
}

export function startServiceFromEquipment(
  state: AppV2MockSnapshot,
  equipmentId: string,
  commitmentId?: string,
): AppV2FlowState {
  const equipamento = state.equipamentos.find((item) => item.id === equipmentId);

  if (equipamento?.archivedAt) {
    throw new Error('Equipamento arquivado nao pode iniciar servico.');
  }

  return {
    ...cloneSnapshot(state),
    serviceDraft: createServiceDraft(state, equipmentId, commitmentId),
  };
}

export function completeService(
  state: AppV2FlowState,
  completion: CompleteServiceInput,
): AppV2FlowState {
  validateServiceCompletion(state, completion);

  const draft = state.serviceDraft!;
  const registro = buildServiceRecord(draft, completion);
  const nextMaintenanceDate = draft.nextMaintenanceDate?.trim();
  const nextCommitment: CompromissoServico | null = nextMaintenanceDate
    ? {
        id: `compromisso-${completion.id}`,
        equipamentoId: draft.equipmentId,
        tipo: 'preventiva',
        status: 'agendado',
        dataAlvo: nextMaintenanceDate,
        origem: 'registro',
      }
    : null;

  return {
    ...cloneSnapshot(state),
    equipamentos: state.equipamentos.map((equipamento) =>
      equipamento.id === draft.equipmentId
        ? { ...equipamento, status: completion.finalStatus }
        : { ...equipamento },
    ),
    compromissos: [
      ...state.compromissos.map((compromisso) =>
        compromisso.id === draft.commitmentId
          ? { ...compromisso, status: 'concluido' as const }
          : { ...compromisso },
      ),
      ...(nextCommitment ? [nextCommitment] : []),
    ],
    registros: [registro, ...state.registros.map((item) => ({ ...item }))],
    tecnicos: appendTechnician(state.tecnicos, completion.technician),
    serviceDraft: null,
  };
}

export function updateServiceRecord(
  state: AppV2FlowState,
  completion: CompleteServiceInput,
): AppV2FlowState {
  validateServiceCompletion(state, completion);

  if (!state.registros.some((registro) => registro.id === completion.id)) {
    throw new Error('Registro nao encontrado para edicao.');
  }

  const draft = state.serviceDraft!;
  const updatedRecord = buildServiceRecord(draft, completion);

  return {
    ...cloneSnapshot(state),
    equipamentos: state.equipamentos.map((equipamento) =>
      equipamento.id === draft.equipmentId
        ? { ...equipamento, status: completion.finalStatus }
        : { ...equipamento },
    ),
    registros: state.registros.map((registro) =>
      registro.id === completion.id ? updatedRecord : { ...registro },
    ),
    tecnicos: appendTechnician(state.tecnicos, completion.technician),
    serviceDraft: null,
  };
}

export function validateServiceCompletion(
  state: AppV2FlowState,
  completion: CompleteServiceInput,
): void {
  if (!state.serviceDraft) {
    throw new Error('Nenhum serviço em andamento para concluir.');
  }

  const draft = state.serviceDraft;

  if (!state.equipamentos.some((equipamento) => equipamento.id === draft.equipmentId)) {
    throw new Error('Equipamento nao encontrado. Escolha um equipamento valido antes de concluir.');
  }

  if (!isValidServiceDate(completion.date)) {
    throw new Error('Informe uma data valida para concluir o servico.');
  }
}

export function scheduleNextCommitment(
  state: AppV2MockSnapshot,
  input: ScheduleNextCommitmentInput,
): AppV2FlowState {
  const compromisso: CompromissoServico = {
    id: input.id,
    equipamentoId: input.equipmentId,
    tipo: input.kind,
    status: 'agendado',
    dataAlvo: input.targetDate,
    origem: input.origin,
  };

  return {
    ...cloneSnapshot(state),
    compromissos: [...state.compromissos.map((item) => ({ ...item })), compromisso],
    serviceDraft: getExistingDraft(state),
  };
}

export function createQuoteFromServiceRecord(
  state: AppV2MockSnapshot,
  input: CreateQuoteFromServiceRecordInput,
): AppV2FlowState {
  const registro = state.registros.find((item) => item.id === input.recordId);

  if (!registro) {
    throw new Error('Registro nao encontrado para gerar orcamento mockado.');
  }

  const existingQuote = state.orcamentos.find((item) => item.registroId === input.recordId);

  if (existingQuote) {
    return {
      ...cloneSnapshot(state),
      serviceDraft: getExistingDraft(state),
    };
  }

  const equipamento = state.equipamentos.find((item) => item.id === registro.equipamentoId);
  const quote: Orcamento = {
    id: input.id,
    numero: createNextQuoteNumber(state),
    status: 'rascunho',
    clienteId: equipamento?.clienteId,
    equipamentoId: registro.equipamentoId,
    registroId: registro.id,
    titulo: `Orcamento mockado - ${equipamento?.nome ?? 'Equipamento nao encontrado'}`,
    total: parseCurrencyValue(registro.custoPecas) + parseCurrencyValue(registro.custoMaoObra),
  };

  return {
    ...cloneSnapshot(state),
    orcamentos: [quote, ...state.orcamentos.map((item) => ({ ...item }))],
    serviceDraft: getExistingDraft(state),
  };
}

export function updateQuoteDraft(
  state: AppV2MockSnapshot,
  input: UpdateQuoteDraftInput,
): AppV2FlowState {
  const currentQuote = state.orcamentos.find((item) => item.id === input.id);

  if (!currentQuote) {
    throw new Error('Orcamento nao encontrado para edicao local.');
  }

  if (currentQuote.status !== 'rascunho') {
    throw new Error('Apenas orcamentos em rascunho podem ser editados nesta etapa.');
  }

  const title = input.title.trim();
  const items = normalizeQuoteItems(input);

  if (!title) {
    throw new Error('Informe um titulo para o orcamento.');
  }

  return {
    ...cloneSnapshot(state),
    orcamentos: state.orcamentos.map((orcamento) =>
      orcamento.id === input.id
        ? {
            ...orcamento,
            titulo: title,
            total: items.length > 0 ? sumQuoteItems(items) : parseCurrencyValue(input.total),
            status: input.status,
            itens: items.length > 0 ? items : undefined,
          }
        : { ...orcamento },
    ),
    serviceDraft: getExistingDraft(state),
  };
}

function getExistingDraft(state: AppV2MockSnapshot): ServiceDraft | null {
  return 'serviceDraft' in state ? (state as AppV2FlowState).serviceDraft : null;
}

function cloneSnapshot(state: AppV2MockSnapshot): AppV2MockSnapshot {
  return {
    today: state.today,
    clientes: state.clientes.map((item) => ({ ...item })),
    equipamentos: state.equipamentos.map((item) => ({ ...item })),
    setores: state.setores.map((item) => ({ ...item })),
    compromissos: state.compromissos.map((item) => ({ ...item })),
    registros: state.registros.map((item) => ({ ...item })),
    tecnicos: [...state.tecnicos],
    orcamentos: state.orcamentos.map((item) => ({
      ...item,
      itens: item.itens?.map((quoteItem) => ({ ...quoteItem })),
    })),
  };
}

function appendTechnician(tecnicos: string[], technician: string): string[] {
  const normalized = technician.trim();

  if (!normalized || tecnicos.includes(normalized)) {
    return [...tecnicos];
  }

  return [...tecnicos, normalized];
}

function createNextQuoteNumber(state: AppV2MockSnapshot): string {
  const year = state.today.slice(0, 4);
  const nextSequence = state.orcamentos.length + 1;
  return `ORC-${year}-${String(nextSequence).padStart(3, '0')}`;
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

function normalizeQuoteItems(input: UpdateQuoteDraftInput): OrcamentoItem[] {
  return (input.items ?? [])
    .map((item, index) => {
      const descricao = item.description.trim();
      const quantidade = parseCurrencyValue(item.quantity);
      const valorUnitario = parseCurrencyValue(item.unitValue);

      if (!descricao && quantidade === 0 && valorUnitario === 0) {
        return null;
      }

      if (!descricao) {
        throw new Error('Informe a descricao do item do orcamento.');
      }

      if (quantidade <= 0) {
        throw new Error('Informe uma quantidade valida para o item do orcamento.');
      }

      if (valorUnitario < 0) {
        throw new Error('Informe um valor valido para o item do orcamento.');
      }

      return {
        id: `item-${input.id}-${index + 1}`,
        descricao,
        quantidade,
        valorUnitario,
        total: quantidade * valorUnitario,
      };
    })
    .filter((item): item is OrcamentoItem => Boolean(item));
}

function sumQuoteItems(items: OrcamentoItem[]): number {
  return items.reduce((sum, item) => sum + item.total, 0);
}

function buildServiceRecord(
  draft: ServiceDraft,
  completion: CompleteServiceInput,
): RegistroServico {
  return {
    id: completion.id,
    equipamentoId: draft.equipmentId,
    data: completion.date,
    tipo: draft.kind ?? 'outro',
    tipoDescricao:
      draft.kind === 'outro' ? formatServiceRecordKind(draft.kind, draft.customKind) : undefined,
    status: completion.finalStatus,
    tecnico: completion.technician,
    diagnostico: completion.diagnosis.trim() || undefined,
    acoesExecutadas: completion.actionsDone.trim() || undefined,
    observacoes: formatServiceObservation(completion.diagnosis, completion.actionsDone),
    pecas: draft.partsUsed?.trim() || undefined,
    custoPecas: draft.partsCost?.trim() || undefined,
    custoMaoObra: draft.laborCost?.trim() || undefined,
    proximaData: draft.nextMaintenanceDate?.trim() || undefined,
  };
}

function formatServiceObservation(diagnosis: string, actionsDone: string): string {
  return [diagnosis.trim(), actionsDone.trim()].filter(Boolean).join(' ');
}

function isValidServiceDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}
