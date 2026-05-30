import type { RegistroServico } from '../domain/types';
import type { AppV2DataPort } from './appV2DataPort';
import type { AppV2FlowState } from './appV2Actions';

export type AppV2RegistrosWriter = (input: {
  userId: string;
  registro: RegistroServico;
}) => Promise<RegistroServico>;

export interface CreateAppV2RegistrosWriteDataAdapterInput {
  basePort: AppV2DataPort;
  userId?: string | null;
  registrosWriter?: AppV2RegistrosWriter;
}

export function createAppV2RegistrosWriteDataAdapter({
  basePort,
  userId,
  registrosWriter,
}: CreateAppV2RegistrosWriteDataAdapterInput): AppV2DataPort {
  const persistRecord = async (
    nextState: AppV2FlowState,
    recordId: string,
  ): Promise<AppV2FlowState> => {
    const normalizedUserId = String(userId ?? '').trim();

    if (!normalizedUserId || !registrosWriter) {
      return nextState;
    }

    const registro = nextState.registros.find((item) => item.id === recordId);

    if (!registro) {
      return nextState;
    }

    const saved = await registrosWriter({ userId: normalizedUserId, registro });

    return {
      ...nextState,
      registros: nextState.registros.map((item) => (item.id === saved.id ? saved : { ...item })),
    };
  };

  const completeService: AppV2DataPort['completeService'] = async (input) => {
    const nextState = await basePort.completeService(input);
    return persistRecord(nextState, input.id);
  };

  const updateServiceRecord: AppV2DataPort['updateServiceRecord'] = async (input) => {
    const nextState = await basePort.updateServiceRecord(input);
    return persistRecord(nextState, input.id);
  };

  return {
    loadSnapshot: basePort.loadSnapshot.bind(basePort),
    saveEquipment: basePort.saveEquipment.bind(basePort),
    saveClient: basePort.saveClient.bind(basePort),
    saveSector: basePort.saveSector.bind(basePort),
    deleteSector: basePort.deleteSector.bind(basePort),
    archiveEquipment: basePort.archiveEquipment.bind(basePort),
    unarchiveEquipment: basePort.unarchiveEquipment.bind(basePort),
    saveEquipmentAttachment: basePort.saveEquipmentAttachment.bind(basePort),
    scheduleCommitment: basePort.scheduleCommitment.bind(basePort),
    startServiceFromEquipment: basePort.startServiceFromEquipment.bind(basePort),
    completeService,
    updateServiceRecord,
    createQuoteFromServiceRecord: basePort.createQuoteFromServiceRecord.bind(basePort),
    createPreServiceQuote: basePort.createPreServiceQuote.bind(basePort),
    updateQuoteDraft: basePort.updateQuoteDraft.bind(basePort),
  };
}
