import { pickNextHomeAction, type HomeAction } from '../domain/homePriority';
import type { RegistroServico } from '../domain/types';
import type { BuildEquipmentViewModelInput } from '../equipment/equipmentViewModel';
import type { BuildServicesHomeInput } from '../service/servicesHomeViewModel';
import type { BuildServiceFlowInput, ServiceDraft } from '../service/serviceFlowViewModel';
import type { AppV2FlowState } from './appV2Actions';
import type { AppV2MockSnapshot } from './appV2MockStore';

interface HomeTodayInput {
  today: string;
  clientes: AppV2MockSnapshot['clientes'];
  equipamentos: AppV2MockSnapshot['equipamentos'];
  compromissos: AppV2MockSnapshot['compromissos'];
  registros: AppV2MockSnapshot['registros'];
}

export interface AppV2OperationalState {
  homeInput: HomeTodayInput;
  equipmentInput: BuildEquipmentViewModelInput;
  serviceFlowInput: BuildServiceFlowInput;
  servicesInput: BuildServicesHomeInput;
  serviceDraft: ServiceDraft | null;
  nextAction: HomeAction;
  latestRecord: RegistroServico | null;
}

export function selectHomeTodayInput(state: AppV2MockSnapshot): HomeTodayInput {
  return {
    today: state.today,
    clientes: state.clientes,
    equipamentos: state.equipamentos,
    compromissos: state.compromissos,
    registros: state.registros,
  };
}

export function selectEquipmentInput(state: AppV2MockSnapshot): BuildEquipmentViewModelInput {
  return {
    ...selectHomeTodayInput(state),
    setores: state.setores,
  };
}

export function selectServiceFlowInput(state: AppV2MockSnapshot): BuildServiceFlowInput {
  return {
    today: state.today,
    clientes: state.clientes,
    equipamentos: state.equipamentos.filter((equipamento) => !equipamento.archivedAt),
    compromissos: state.compromissos,
  };
}

export function selectServicesHomeInput(state: AppV2MockSnapshot): BuildServicesHomeInput {
  return {
    today: state.today,
    clientes: state.clientes,
    equipamentos: state.equipamentos,
    registros: state.registros,
    orcamentos: state.orcamentos,
  };
}

export function selectAppV2OperationalState(state: AppV2MockSnapshot): AppV2OperationalState {
  const homeInput = selectHomeTodayInput(state);

  return {
    homeInput,
    equipmentInput: selectEquipmentInput(state),
    serviceFlowInput: selectServiceFlowInput(state),
    servicesInput: selectServicesHomeInput(state),
    serviceDraft: getServiceDraft(state),
    nextAction: pickNextHomeAction(homeInput),
    latestRecord: selectLatestRecord(state.registros),
  };
}

function getServiceDraft(state: AppV2MockSnapshot): ServiceDraft | null {
  return 'serviceDraft' in state ? (state as AppV2FlowState).serviceDraft : null;
}

function selectLatestRecord(registros: RegistroServico[]): RegistroServico | null {
  return registros.slice().sort((a, b) => b.data.localeCompare(a.data))[0] ?? null;
}
