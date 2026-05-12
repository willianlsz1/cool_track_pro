import type {
  CompromissoServico,
  Equipamento,
  RegistroServico,
  ServiceCommitmentKind,
  ServiceRecordStatus,
} from '../domain/types';
import { createServiceDraft, type ServiceDraft } from '../service/serviceFlowViewModel';
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
  if (!state.serviceDraft) {
    throw new Error('Nenhum serviço em andamento para concluir.');
  }

  const draft = state.serviceDraft;
  const registro: RegistroServico = {
    id: completion.id,
    equipamentoId: draft.equipmentId,
    data: completion.date,
    tipo: draft.kind ?? 'outro',
    status: completion.finalStatus,
    tecnico: completion.technician,
    observacoes: formatServiceObservation(completion.diagnosis, completion.actionsDone),
  };

  return {
    ...cloneSnapshot(state),
    equipamentos: state.equipamentos.map((equipamento) =>
      equipamento.id === draft.equipmentId
        ? { ...equipamento, status: completion.finalStatus }
        : { ...equipamento },
    ),
    compromissos: state.compromissos.map((compromisso) =>
      compromisso.id === draft.commitmentId
        ? { ...compromisso, status: 'concluido' }
        : { ...compromisso },
    ),
    registros: [registro, ...state.registros.map((item) => ({ ...item }))],
    serviceDraft: null,
  };
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
