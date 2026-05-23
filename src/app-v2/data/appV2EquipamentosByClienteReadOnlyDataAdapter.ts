import type { Equipamento } from '../domain/types';
import type { AppV2FlowState } from './appV2Actions';
import type { AppV2DataPort } from './appV2DataPort';

export type AppV2EquipamentosByClienteReader = (input: {
  userId: string;
  clienteId: string;
}) => Promise<Equipamento[]>;

export interface CreateAppV2EquipamentosByClienteReadOnlyDataAdapterInput {
  basePort: AppV2DataPort;
  userId?: string | null;
  clienteId?: string | null;
  equipamentosReader?: AppV2EquipamentosByClienteReader;
}

export function createAppV2EquipamentosByClienteReadOnlyDataAdapter({
  basePort,
  userId,
  clienteId,
  equipamentosReader,
}: CreateAppV2EquipamentosByClienteReadOnlyDataAdapterInput): AppV2DataPort {
  const loadSnapshot: AppV2DataPort['loadSnapshot'] = async () => {
    const localSnapshot = await basePort.loadSnapshot();
    const normalizedUserId = String(userId ?? '').trim();
    const normalizedClienteId = String(clienteId ?? '').trim();

    if (!normalizedUserId || !isUuid(normalizedClienteId) || !equipamentosReader) {
      return localSnapshot;
    }

    try {
      const equipamentos = await equipamentosReader({
        userId: normalizedUserId,
        clienteId: normalizedClienteId,
      });

      return preserveFlowState({
        ...localSnapshot,
        equipamentos: [
          ...localSnapshot.equipamentos.filter((item) => item.clienteId !== normalizedClienteId),
          ...equipamentos.map((item) => ({ ...item })),
        ],
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
