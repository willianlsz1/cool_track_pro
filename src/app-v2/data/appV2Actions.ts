import type {
  CompromissoServico,
  Equipamento,
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
  const registro: RegistroServico = {
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

function getExistingDraft(state: AppV2MockSnapshot): ServiceDraft | null {
  return 'serviceDraft' in state ? (state as AppV2FlowState).serviceDraft : null;
}

function cloneSnapshot(state: AppV2MockSnapshot): AppV2MockSnapshot {
  return {
    today: state.today,
    clientes: state.clientes.map((item) => ({ ...item })),
    equipamentos: state.equipamentos.map((item) => ({ ...item })),
    compromissos: state.compromissos.map((item) => ({ ...item })),
    registros: state.registros.map((item) => ({ ...item })),
    orcamentos: state.orcamentos.map((item) => ({ ...item })),
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
