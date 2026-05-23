import { saveClient } from '../equipment/clientActions';
import type { SaveClientDraft } from '../equipment/clientActions';
import {
  archiveEquipment,
  deleteEquipmentSector,
  saveEquipment,
  saveEquipmentAttachment,
  saveEquipmentSector,
  unarchiveEquipment,
} from '../equipment/equipmentActions';
import type {
  SaveEquipmentAttachmentDraft,
  SaveEquipmentDraft,
  SaveEquipmentSectorDraft,
} from '../equipment/equipmentActions';
import {
  completeService,
  createPreServiceQuoteDraft,
  createQuoteFromServiceRecord,
  scheduleNextCommitment,
  startServiceFromEquipment,
  updateQuoteDraft,
  updateServiceRecord,
} from './appV2Actions';
import type {
  AppV2FlowState,
  CompleteServiceInput,
  CreatePreServiceQuoteDraftInput,
  CreateQuoteFromServiceRecordInput,
  ScheduleNextCommitmentInput,
  UpdateQuoteDraftInput,
} from './appV2Actions';
import type { AppV2MockSnapshot } from './appV2MockStore';
import type { AppV2DataPort } from './appV2DataPort';

export function createMemoryAppV2DataAdapter(initialSnapshot: AppV2MockSnapshot): AppV2DataPort {
  return new MemoryAppV2DataAdapter(initialSnapshot);
}

class MemoryAppV2DataAdapter implements AppV2DataPort {
  private state: AppV2FlowState;

  constructor(initialSnapshot: AppV2MockSnapshot) {
    this.state = normalizeFlowState(initialSnapshot);
  }

  async loadSnapshot(): Promise<AppV2FlowState> {
    return cloneFlowState(this.state);
  }

  async saveEquipment(draft: SaveEquipmentDraft): Promise<AppV2FlowState> {
    this.state = preserveDraft(this.state, saveEquipment(this.state, draft));
    return this.loadSnapshot();
  }

  async saveClient(draft: SaveClientDraft): Promise<AppV2FlowState> {
    this.state = preserveDraft(this.state, saveClient(this.state, draft));
    return this.loadSnapshot();
  }

  async saveSector(draft: SaveEquipmentSectorDraft): Promise<AppV2FlowState> {
    this.state = preserveDraft(this.state, saveEquipmentSector(this.state, draft));
    return this.loadSnapshot();
  }

  async deleteSector(sectorId: string): Promise<AppV2FlowState> {
    this.state = preserveDraft(this.state, deleteEquipmentSector(this.state, sectorId));
    return this.loadSnapshot();
  }

  async archiveEquipment(equipmentId: string, archivedAt: string): Promise<AppV2FlowState> {
    this.state = preserveDraft(this.state, archiveEquipment(this.state, equipmentId, archivedAt));
    return this.loadSnapshot();
  }

  async unarchiveEquipment(equipmentId: string): Promise<AppV2FlowState> {
    this.state = preserveDraft(this.state, unarchiveEquipment(this.state, equipmentId));
    return this.loadSnapshot();
  }

  async saveEquipmentAttachment(
    equipmentId: string,
    attachment: SaveEquipmentAttachmentDraft,
  ): Promise<AppV2FlowState> {
    this.state = preserveDraft(
      this.state,
      saveEquipmentAttachment(this.state, equipmentId, attachment),
    );
    return this.loadSnapshot();
  }

  async scheduleCommitment(input: ScheduleNextCommitmentInput): Promise<AppV2FlowState> {
    this.state = scheduleNextCommitment(this.state, input);
    return this.loadSnapshot();
  }

  async startServiceFromEquipment(
    equipmentId: string,
    commitmentId?: string,
  ): Promise<AppV2FlowState> {
    this.state = startServiceFromEquipment(this.state, equipmentId, commitmentId);
    return this.loadSnapshot();
  }

  async completeService(input: CompleteServiceInput): Promise<AppV2FlowState> {
    this.state = completeService(this.state, input);
    return this.loadSnapshot();
  }

  async updateServiceRecord(input: CompleteServiceInput): Promise<AppV2FlowState> {
    this.state = updateServiceRecord(this.state, input);
    return this.loadSnapshot();
  }

  async createQuoteFromServiceRecord(
    input: CreateQuoteFromServiceRecordInput,
  ): Promise<AppV2FlowState> {
    this.state = createQuoteFromServiceRecord(this.state, input);
    return this.loadSnapshot();
  }

  async createPreServiceQuote(input: CreatePreServiceQuoteDraftInput): Promise<AppV2FlowState> {
    this.state = createPreServiceQuoteDraft(this.state, input);
    return this.loadSnapshot();
  }

  async updateQuoteDraft(input: UpdateQuoteDraftInput): Promise<AppV2FlowState> {
    this.state = updateQuoteDraft(this.state, input);
    return this.loadSnapshot();
  }
}

function normalizeFlowState(snapshot: AppV2MockSnapshot): AppV2FlowState {
  return {
    ...cloneSnapshot(snapshot),
    serviceDraft: 'serviceDraft' in snapshot ? (snapshot as AppV2FlowState).serviceDraft : null,
  };
}

function preserveDraft(current: AppV2FlowState, nextSnapshot: AppV2MockSnapshot): AppV2FlowState {
  return {
    ...cloneSnapshot(nextSnapshot),
    serviceDraft:
      'serviceDraft' in nextSnapshot
        ? (nextSnapshot as AppV2FlowState).serviceDraft
        : current.serviceDraft,
  };
}

function cloneFlowState(state: AppV2FlowState): AppV2FlowState {
  return {
    ...cloneSnapshot(state),
    serviceDraft: state.serviceDraft ? { ...state.serviceDraft } : null,
  };
}

function cloneSnapshot(snapshot: AppV2MockSnapshot): AppV2MockSnapshot {
  return {
    today: snapshot.today,
    clientes: snapshot.clientes.map((item) => ({ ...item })),
    setores: snapshot.setores.map((item) => ({ ...item })),
    equipamentos: snapshot.equipamentos.map((item) => ({
      ...item,
      anexos: item.anexos?.map((attachment) => ({ ...attachment })),
    })),
    compromissos: snapshot.compromissos.map((item) => ({ ...item })),
    registros: snapshot.registros.map((item) => ({ ...item })),
    tecnicos: [...snapshot.tecnicos],
    orcamentos: snapshot.orcamentos.map((item) => ({
      ...item,
      itens: item.itens?.map((quoteItem) => ({ ...quoteItem })),
    })),
  };
}
