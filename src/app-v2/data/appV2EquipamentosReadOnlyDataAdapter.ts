import type { Equipamento } from '../domain/types';
import type { AppV2DataPort } from './appV2DataPort';
import type { AppV2FlowState } from './appV2Actions';

export type AppV2EquipamentosReader = (userId: string) => Promise<Equipamento[]>;

export interface CreateAppV2EquipamentosReadOnlyDataAdapterInput {
  basePort: AppV2DataPort;
  userId?: string | null;
  equipamentosReader?: AppV2EquipamentosReader;
}

export function createAppV2EquipamentosReadOnlyDataAdapter({
  basePort,
  userId,
  equipamentosReader,
}: CreateAppV2EquipamentosReadOnlyDataAdapterInput): AppV2DataPort {
  const loadSnapshot: AppV2DataPort['loadSnapshot'] = async () => {
    const localSnapshot = await basePort.loadSnapshot();
    const normalizedUserId = String(userId ?? '').trim();

    if (!normalizedUserId || !equipamentosReader) {
      return localSnapshot;
    }

    try {
      const equipamentos = await equipamentosReader(normalizedUserId);
      return preserveFlowState({
        ...localSnapshot,
        equipamentos: equipamentos.map((item) => ({ ...item })),
      });
    } catch {
      return localSnapshot;
    }
  };

  return {
    loadSnapshot,
    saveEquipment: basePort.saveEquipment.bind(basePort),
    saveClient: basePort.saveClient.bind(basePort),
    saveSector: basePort.saveSector.bind(basePort),
    deleteSector: basePort.deleteSector.bind(basePort),
    archiveEquipment: basePort.archiveEquipment.bind(basePort),
    unarchiveEquipment: basePort.unarchiveEquipment.bind(basePort),
    saveEquipmentAttachment: basePort.saveEquipmentAttachment.bind(basePort),
    scheduleCommitment: basePort.scheduleCommitment.bind(basePort),
    startServiceFromEquipment: basePort.startServiceFromEquipment.bind(basePort),
    completeService: basePort.completeService.bind(basePort),
    updateServiceRecord: basePort.updateServiceRecord.bind(basePort),
    createQuoteFromServiceRecord: basePort.createQuoteFromServiceRecord.bind(basePort),
    createPreServiceQuote: basePort.createPreServiceQuote.bind(basePort),
    updateQuoteDraft: basePort.updateQuoteDraft.bind(basePort),
  };
}

function preserveFlowState(state: AppV2FlowState): AppV2FlowState {
  return {
    ...state,
    serviceDraft: state.serviceDraft ? { ...state.serviceDraft } : null,
  };
}
