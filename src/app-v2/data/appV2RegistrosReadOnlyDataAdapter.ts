import type { RegistroServico } from '../domain/types';
import type { AppV2DataPort } from './appV2DataPort';
import type { AppV2FlowState } from './appV2Actions';

export type AppV2RegistrosReader = (userId: string) => Promise<RegistroServico[]>;

export interface CreateAppV2RegistrosReadOnlyDataAdapterInput {
  basePort: AppV2DataPort;
  userId?: string | null;
  registrosReader?: AppV2RegistrosReader;
}

export function createAppV2RegistrosReadOnlyDataAdapter({
  basePort,
  userId,
  registrosReader,
}: CreateAppV2RegistrosReadOnlyDataAdapterInput): AppV2DataPort {
  const loadSnapshot: AppV2DataPort['loadSnapshot'] = async () => {
    const localSnapshot = await basePort.loadSnapshot();
    const normalizedUserId = String(userId ?? '').trim();

    if (!normalizedUserId || !registrosReader) {
      return localSnapshot;
    }

    try {
      const registros = await registrosReader(normalizedUserId);
      return preserveFlowState({
        ...localSnapshot,
        registros: registros.map((item) => ({ ...item })),
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
