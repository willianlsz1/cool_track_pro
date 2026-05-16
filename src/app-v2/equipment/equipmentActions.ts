import type { AppV2MockSnapshot } from '../data/appV2MockStore';
import type {
  EquipmentCriticality,
  EquipmentStatus,
  Equipamento,
  OperationalPriority,
} from '../domain/types';

export interface SaveEquipmentDraft {
  id: string;
  nome: string;
  local: string;
  mode?: 'create' | 'edit';
  status?: EquipmentStatus;
  clienteId?: string;
  tag?: string;
  tipo?: string;
  criticidade?: EquipmentCriticality;
  prioridadeOperacional?: OperationalPriority;
  periodicidadePreventivaDias?: number | string;
}

export function saveEquipment(
  snapshot: AppV2MockSnapshot,
  draft: SaveEquipmentDraft,
): AppV2MockSnapshot {
  const equipment = buildEquipmentPayload(draft);
  const currentIndex = snapshot.equipamentos.findIndex((item) => item.id === equipment.id);
  const shouldEdit = draft.mode === 'edit' || currentIndex >= 0;

  if (shouldEdit && currentIndex < 0) {
    throw new Error('Equipamento nao encontrado para edicao.');
  }

  const equipamentos = shouldEdit
    ? snapshot.equipamentos.map((item) =>
        item.id === equipment.id ? { ...item, ...equipment } : item,
      )
    : [...snapshot.equipamentos, equipment];

  return {
    ...snapshot,
    equipamentos,
  };
}

function buildEquipmentPayload(draft: SaveEquipmentDraft): Equipamento {
  const id = draft.id.trim();
  const nome = draft.nome.trim();
  const local = draft.local.trim();

  if (!id) {
    throw new Error('Nao foi possivel identificar o equipamento.');
  }

  if (!nome) {
    throw new Error('Informe o nome do equipamento.');
  }

  if (!local) {
    throw new Error('Informe o local do equipamento.');
  }

  return {
    id,
    nome,
    local,
    status: draft.status ?? 'ok',
    ...(trimOptional(draft.clienteId) ? { clienteId: trimOptional(draft.clienteId) } : {}),
    ...(trimOptional(draft.tag) ? { tag: trimOptional(draft.tag) } : {}),
    ...(trimOptional(draft.tipo) ? { tipo: trimOptional(draft.tipo) } : {}),
    ...(draft.criticidade ? { criticidade: draft.criticidade } : {}),
    ...(draft.prioridadeOperacional ? { prioridadeOperacional: draft.prioridadeOperacional } : {}),
    ...(normalizePreventiveInterval(draft.periodicidadePreventivaDias)
      ? {
          periodicidadePreventivaDias: normalizePreventiveInterval(
            draft.periodicidadePreventivaDias,
          ),
        }
      : {}),
  };
}

function trimOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function normalizePreventiveInterval(value: number | string | undefined): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? Math.trunc(numericValue) : undefined;
}
