import type { SaveClientDraft } from '../equipment/clientActions';
import type {
  SaveEquipmentAttachmentDraft,
  SaveEquipmentDraft,
  SaveEquipmentSectorDraft,
} from '../equipment/equipmentActions';
import type {
  AppV2FlowState,
  CompleteServiceInput,
  CreatePreServiceQuoteDraftInput,
  CreateQuoteFromServiceRecordInput,
  ScheduleNextCommitmentInput,
  UpdateQuoteDraftInput,
} from './appV2Actions';

export const APP_V2_DATA_PORT_METHODS = [
  'loadSnapshot',
  'saveEquipment',
  'saveClient',
  'saveSector',
  'deleteSector',
  'archiveEquipment',
  'unarchiveEquipment',
  'saveEquipmentAttachment',
  'scheduleCommitment',
  'startServiceFromEquipment',
  'completeService',
  'updateServiceRecord',
  'createQuoteFromServiceRecord',
  'createPreServiceQuote',
  'updateQuoteDraft',
] as const satisfies ReadonlyArray<keyof AppV2DataPort>;

export interface AppV2DataPort {
  loadSnapshot(): Promise<AppV2FlowState>;
  saveEquipment(draft: SaveEquipmentDraft): Promise<AppV2FlowState>;
  saveClient(draft: SaveClientDraft): Promise<AppV2FlowState>;
  saveSector(draft: SaveEquipmentSectorDraft): Promise<AppV2FlowState>;
  deleteSector(sectorId: string): Promise<AppV2FlowState>;
  archiveEquipment(equipmentId: string, archivedAt: string): Promise<AppV2FlowState>;
  unarchiveEquipment(equipmentId: string): Promise<AppV2FlowState>;
  saveEquipmentAttachment(
    equipmentId: string,
    attachment: SaveEquipmentAttachmentDraft,
  ): Promise<AppV2FlowState>;
  scheduleCommitment(input: ScheduleNextCommitmentInput): Promise<AppV2FlowState>;
  startServiceFromEquipment(equipmentId: string, commitmentId?: string): Promise<AppV2FlowState>;
  completeService(input: CompleteServiceInput): Promise<AppV2FlowState>;
  updateServiceRecord(input: CompleteServiceInput): Promise<AppV2FlowState>;
  createQuoteFromServiceRecord(input: CreateQuoteFromServiceRecordInput): Promise<AppV2FlowState>;
  createPreServiceQuote(input: CreatePreServiceQuoteDraftInput): Promise<AppV2FlowState>;
  updateQuoteDraft(input: UpdateQuoteDraftInput): Promise<AppV2FlowState>;
}
