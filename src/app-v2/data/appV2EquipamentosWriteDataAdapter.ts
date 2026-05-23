import type { Equipamento } from '../domain/types';
import type { SaveEquipmentDraft } from '../equipment/equipmentActions';
import type { AppV2FlowState } from './appV2Actions';
import type { AppV2DataPort } from './appV2DataPort';

export type AppV2EquipamentosWriter = (input: {
  userId: string;
  draft: SaveEquipmentDraft;
}) => Promise<Equipamento>;

export interface CreateAppV2EquipamentosWriteDataAdapterInput {
  basePort: AppV2DataPort;
  userId?: string | null;
  equipamentosWriter?: AppV2EquipamentosWriter;
}

export function createAppV2EquipamentosWriteDataAdapter({
  basePort,
  userId,
  equipamentosWriter,
}: CreateAppV2EquipamentosWriteDataAdapterInput): AppV2DataPort {
  const saveEquipment: AppV2DataPort['saveEquipment'] = async (draft) => {
    const normalizedUserId = String(userId ?? '').trim();

    if (!normalizedUserId || !equipamentosWriter) {
      return basePort.saveEquipment(draft);
    }

    const equipamento = await equipamentosWriter({
      userId: normalizedUserId,
      draft,
    });
    const currentState = await basePort.loadSnapshot();

    return upsertEquipamento(currentState, equipamento);
  };

  return {
    loadSnapshot: basePort.loadSnapshot.bind(basePort),
    saveEquipment,
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

function upsertEquipamento(state: AppV2FlowState, equipamento: Equipamento): AppV2FlowState {
  const currentIndex = state.equipamentos.findIndex((item) => item.id === equipamento.id);
  const equipamentos =
    currentIndex >= 0
      ? state.equipamentos.map((item) =>
          item.id === equipamento.id ? { ...item, ...equipamento } : cloneEquipamento(item),
        )
      : [...state.equipamentos.map(cloneEquipamento), cloneEquipamento(equipamento)];

  return {
    ...state,
    equipamentos,
    serviceDraft: state.serviceDraft ? { ...state.serviceDraft } : null,
  };
}

function cloneEquipamento(equipamento: Equipamento): Equipamento {
  return {
    ...equipamento,
    anexos: equipamento.anexos?.map((anexo) => ({ ...anexo })),
  };
}
