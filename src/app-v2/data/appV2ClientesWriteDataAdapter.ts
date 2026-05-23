import type { Cliente } from '../domain/types';
import type { SaveClientDraft } from '../equipment/clientActions';
import type { AppV2FlowState } from './appV2Actions';
import type { AppV2DataPort } from './appV2DataPort';

export type AppV2ClientesWriter = (input: {
  userId: string;
  draft: SaveClientDraft;
}) => Promise<Cliente>;

export interface CreateAppV2ClientesWriteDataAdapterInput {
  basePort: AppV2DataPort;
  userId?: string | null;
  clientesWriter?: AppV2ClientesWriter;
}

export function createAppV2ClientesWriteDataAdapter({
  basePort,
  userId,
  clientesWriter,
}: CreateAppV2ClientesWriteDataAdapterInput): AppV2DataPort {
  const saveClient: AppV2DataPort['saveClient'] = async (draft) => {
    const normalizedUserId = String(userId ?? '').trim();

    if (!normalizedUserId || !clientesWriter) {
      return basePort.saveClient(draft);
    }

    const cliente = await clientesWriter({
      userId: normalizedUserId,
      draft,
    });
    const currentState = await basePort.loadSnapshot();

    return upsertCliente(currentState, cliente);
  };

  return {
    loadSnapshot: basePort.loadSnapshot.bind(basePort),
    saveEquipment: basePort.saveEquipment.bind(basePort),
    saveClient,
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

function upsertCliente(state: AppV2FlowState, cliente: Cliente): AppV2FlowState {
  const currentIndex = state.clientes.findIndex((item) => item.id === cliente.id);
  const clientes =
    currentIndex >= 0
      ? state.clientes.map((item) => (item.id === cliente.id ? { ...item, ...cliente } : item))
      : [...state.clientes, { ...cliente }];

  return {
    ...state,
    clientes,
    serviceDraft: state.serviceDraft ? { ...state.serviceDraft } : null,
  };
}
