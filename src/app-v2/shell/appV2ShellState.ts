import {
  completeService,
  updateServiceRecord,
  type AppV2FlowState,
  type CompleteServiceInput,
} from '../data/appV2Actions';
import type { AppV2MockSnapshot } from '../data/appV2MockStore';
import type { ServiceDraft } from '../service/serviceFlowViewModel';

export function createNextEquipmentId(seed: number, snapshot: AppV2MockSnapshot): string {
  return createNextScopedId('eq-shell', seed, (id) =>
    snapshot.equipamentos.some((item) => item.id === id),
  );
}

export function createNextClientId(seed: number, snapshot: AppV2MockSnapshot): string {
  return createNextScopedId('cliente-shell', seed, (id) =>
    snapshot.clientes.some((item) => item.id === id),
  );
}

export function createNextSectorId(seed: number, snapshot: AppV2MockSnapshot): string {
  return createNextScopedId('setor-shell', seed, (id) =>
    snapshot.setores.some((item) => item.id === id),
  );
}

export function completeServiceDraft(
  current: AppV2FlowState,
  draft: ServiceDraft,
  editingServiceId?: string | null,
): { nextState: AppV2FlowState; recordId: string } {
  const recordId = editingServiceId ?? `reg-shell-${current.registros.length + 1}`;
  const completion = buildCompleteServiceInput(current, draft, editingServiceId);
  const stateWithDraft = {
    ...current,
    serviceDraft: draft,
  };

  return {
    recordId,
    nextState: editingServiceId
      ? updateServiceRecord(stateWithDraft, completion)
      : completeService(stateWithDraft, completion),
  };
}

export function buildCompleteServiceInput(
  current: AppV2FlowState,
  draft: ServiceDraft,
  editingServiceId?: string | null,
): CompleteServiceInput {
  return {
    id: editingServiceId ?? `reg-shell-${current.registros.length + 1}`,
    date: draft.serviceDate ?? current.today,
    technician: draft.technician,
    diagnosis: draft.diagnosis,
    actionsDone: draft.actionsDone,
    finalStatus: draft.finalStatus,
  };
}

export function preserveCurrentServiceDraft(
  current: AppV2FlowState,
  nextSnapshot: AppV2MockSnapshot,
): AppV2FlowState {
  return {
    ...nextSnapshot,
    serviceDraft: current.serviceDraft,
  };
}

function createNextScopedId(
  scope: 'eq-shell' | 'cliente-shell' | 'setor-shell',
  seed: number,
  exists: (id: string) => boolean,
): string {
  let nextId = `${scope}-${seed}`;

  while (exists(nextId)) {
    seed += 1;
    nextId = `${scope}-${seed}`;
  }

  return nextId;
}
