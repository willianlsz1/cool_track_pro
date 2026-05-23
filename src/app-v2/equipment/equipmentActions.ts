import type { AppV2MockSnapshot } from '../data/appV2MockStore';
import type {
  EquipmentAttachment,
  EquipmentAttachmentKind,
  EquipmentAttachmentSource,
  EquipmentCriticality,
  EquipmentStatus,
  Equipamento,
  OperationalPriority,
  SetorEquipamento,
} from '../domain/types';

export interface SaveEquipmentDraft {
  id: string;
  nome: string;
  local: string;
  mode?: 'create' | 'edit';
  status?: EquipmentStatus;
  clienteId?: string;
  setorId?: string;
  tag?: string;
  tipo?: string;
  componente?: string;
  fluidoRefrigerante?: string;
  marcaModelo?: string;
  numeroSerie?: string;
  capacidadeBtuh?: string;
  criticidade?: EquipmentCriticality;
  prioridadeOperacional?: OperationalPriority;
  periodicidadePreventivaDias?: number | string;
}

export interface SaveEquipmentSectorDraft {
  id: string;
  nome: string;
  mode?: 'create' | 'edit';
  clienteId?: string;
  cor?: string;
  descricao?: string;
  responsavel?: string;
}

export interface SaveEquipmentAttachmentDraft {
  id: string;
  kind: EquipmentAttachmentKind;
  label: string;
  source?: EquipmentAttachmentSource;
  createdAt: string;
  cover?: boolean;
}

export function saveEquipment(
  snapshot: AppV2MockSnapshot,
  draft: SaveEquipmentDraft,
): AppV2MockSnapshot {
  const sectorClientId = trimOptional(draft.setorId)
    ? snapshot.setores.find((setor) => setor.id === trimOptional(draft.setorId))?.clienteId
    : undefined;
  const equipment = buildEquipmentPayload({
    ...draft,
    clienteId: trimOptional(draft.clienteId) ?? trimOptional(sectorClientId),
  });
  const currentIndex = snapshot.equipamentos.findIndex((item) => item.id === equipment.id);
  const shouldEdit = draft.mode === 'edit' || currentIndex >= 0;

  if (shouldEdit && currentIndex < 0) {
    throw new Error('Equipamento não encontrado para edição.');
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

export function saveEquipmentAttachment(
  snapshot: AppV2MockSnapshot,
  equipmentId: string,
  draft: SaveEquipmentAttachmentDraft,
): AppV2MockSnapshot {
  const normalizedEquipmentId = equipmentId.trim();
  const currentEquipment = snapshot.equipamentos.find(
    (equipamento) => equipamento.id === normalizedEquipmentId,
  );

  if (!currentEquipment) {
    throw new Error('Equipamento não encontrado para anexar.');
  }

  const attachment = buildEquipmentAttachmentPayload(draft);
  const currentAttachments = currentEquipment.anexos ?? [];
  const currentIndex = currentAttachments.findIndex((item) => item.id === attachment.id);

  if (currentIndex < 0 && currentAttachments.length >= 3) {
    throw new Error('Limite de 3 anexos por equipamento.');
  }

  const anexos =
    currentIndex >= 0
      ? currentAttachments.map((item) => (item.id === attachment.id ? attachment : item))
      : [...currentAttachments, attachment];

  const normalizedAttachments = attachment.cover
    ? anexos.map((item) => (item.id === attachment.id ? item : { ...item, cover: false }))
    : anexos;

  return {
    ...snapshot,
    equipamentos: snapshot.equipamentos.map((equipamento) =>
      equipamento.id === normalizedEquipmentId
        ? {
            ...equipamento,
            anexos: normalizedAttachments,
          }
        : cloneEquipment(equipamento),
    ),
  };
}

export function saveEquipmentSector(
  snapshot: AppV2MockSnapshot,
  draft: SaveEquipmentSectorDraft,
): AppV2MockSnapshot {
  const sector = buildEquipmentSectorPayload(draft);
  const currentIndex = snapshot.setores.findIndex((item) => item.id === sector.id);
  const shouldEdit = draft.mode === 'edit' || currentIndex >= 0;

  if (shouldEdit && currentIndex < 0) {
    throw new Error('Setor não encontrado para edição.');
  }

  const setores = shouldEdit
    ? snapshot.setores.map((item) => (item.id === sector.id ? { ...item, ...sector } : item))
    : [...snapshot.setores, sector];

  return {
    ...snapshot,
    setores,
  };
}

export function deleteEquipmentSector(
  snapshot: AppV2MockSnapshot,
  sectorId: string,
): AppV2MockSnapshot {
  const normalizedSectorId = sectorId.trim();

  if (normalizedSectorId === '__sem_setor__') {
    throw new Error('Não é possível remover o agrupamento Sem setor.');
  }

  if (!snapshot.setores.some((setor) => setor.id === normalizedSectorId)) {
    throw new Error('Setor não encontrado para remoção.');
  }

  return {
    ...snapshot,
    setores: snapshot.setores.filter((setor) => setor.id !== normalizedSectorId),
    equipamentos: snapshot.equipamentos.map((equipamento) => {
      if (equipamento.setorId !== normalizedSectorId) {
        return { ...equipamento };
      }

      const { setorId: _setorId, ...equipmentWithoutSector } = equipamento;
      return equipmentWithoutSector;
    }),
    registros: snapshot.registros.map((registro) => ({ ...registro })),
    orcamentos: snapshot.orcamentos.map((orcamento) => ({
      ...orcamento,
      itens: orcamento.itens?.map((item) => ({ ...item })),
    })),
  };
}

export function archiveEquipment(
  snapshot: AppV2MockSnapshot,
  equipmentId: string,
  archivedAt: string,
): AppV2MockSnapshot {
  const normalizedEquipmentId = equipmentId.trim();

  if (!snapshot.equipamentos.some((equipamento) => equipamento.id === normalizedEquipmentId)) {
    throw new Error('Equipamento não encontrado para arquivamento.');
  }

  return {
    ...snapshot,
    equipamentos: snapshot.equipamentos.map((equipamento) =>
      equipamento.id === normalizedEquipmentId
        ? {
            ...equipamento,
            archivedAt,
          }
        : { ...equipamento },
    ),
    compromissos: snapshot.compromissos.map((compromisso) =>
      compromisso.equipamentoId === normalizedEquipmentId && compromisso.status === 'agendado'
        ? { ...compromisso, status: 'cancelado' as const }
        : { ...compromisso },
    ),
    registros: snapshot.registros.map((registro) => ({ ...registro })),
    orcamentos: snapshot.orcamentos.map((orcamento) => ({
      ...orcamento,
      itens: orcamento.itens?.map((item) => ({ ...item })),
    })),
  };
}

export function unarchiveEquipment(
  snapshot: AppV2MockSnapshot,
  equipmentId: string,
): AppV2MockSnapshot {
  const normalizedEquipmentId = equipmentId.trim();

  if (!snapshot.equipamentos.some((equipamento) => equipamento.id === normalizedEquipmentId)) {
    throw new Error('Equipamento não encontrado para desarquivamento.');
  }

  return {
    ...snapshot,
    equipamentos: snapshot.equipamentos.map((equipamento) => {
      if (equipamento.id !== normalizedEquipmentId) {
        return { ...equipamento };
      }

      const { archivedAt: _archivedAt, ...activeEquipment } = equipamento;
      return activeEquipment;
    }),
    compromissos: snapshot.compromissos.map((compromisso) => ({ ...compromisso })),
    registros: snapshot.registros.map((registro) => ({ ...registro })),
    orcamentos: snapshot.orcamentos.map((orcamento) => ({
      ...orcamento,
      itens: orcamento.itens?.map((item) => ({ ...item })),
    })),
  };
}

function buildEquipmentPayload(draft: SaveEquipmentDraft): Equipamento {
  const id = draft.id.trim();
  const nome = draft.nome.trim();
  const local = draft.local.trim();

  if (!id) {
    throw new Error('Não foi possível identificar o equipamento.');
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
    ...(trimOptional(draft.setorId) ? { setorId: trimOptional(draft.setorId) } : {}),
    ...(trimOptional(draft.tag) ? { tag: trimOptional(draft.tag) } : {}),
    ...(trimOptional(draft.tipo) ? { tipo: trimOptional(draft.tipo) } : {}),
    ...(trimOptional(draft.componente) ? { componente: trimOptional(draft.componente) } : {}),
    ...(trimOptional(draft.fluidoRefrigerante)
      ? { fluidoRefrigerante: trimOptional(draft.fluidoRefrigerante) }
      : {}),
    ...(trimOptional(draft.marcaModelo) ? { marcaModelo: trimOptional(draft.marcaModelo) } : {}),
    ...(trimOptional(draft.numeroSerie) ? { numeroSerie: trimOptional(draft.numeroSerie) } : {}),
    ...(trimOptional(draft.capacidadeBtuh)
      ? { capacidadeBtuh: trimOptional(draft.capacidadeBtuh) }
      : {}),
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

function cloneEquipment(equipamento: Equipamento): Equipamento {
  return {
    ...equipamento,
    ...(equipamento.anexos ? { anexos: equipamento.anexos.map((anexo) => ({ ...anexo })) } : {}),
  };
}

function buildEquipmentAttachmentPayload(draft: SaveEquipmentAttachmentDraft): EquipmentAttachment {
  const rawDraft = draft as SaveEquipmentAttachmentDraft & Record<string, unknown>;
  const forbiddenKeys = ['file', 'blob', 'url', 'path', 'dataUrl', 'signedUrl', 'bucket', 'userId'];

  if (forbiddenKeys.some((key) => rawDraft[key] !== undefined)) {
    throw new Error('Anexo local não aceita arquivo, URL ou storage real.');
  }

  const id = draft.id.trim();
  const label = draft.label.trim();
  const createdAt = draft.createdAt.trim();
  const source = draft.source ?? 'placeholder';

  if (!id) {
    throw new Error('Não foi possível identificar o anexo.');
  }

  if (!label) {
    throw new Error('Informe o nome do anexo.');
  }

  if (!createdAt) {
    throw new Error('Informe a data local do anexo.');
  }

  if (source !== 'mock' && source !== 'placeholder') {
    throw new Error('Anexo local aceita apenas origem mock ou placeholder.');
  }

  return {
    id,
    kind: draft.kind,
    label,
    source,
    createdAt,
    ...(draft.cover ? { cover: true } : {}),
  };
}

function buildEquipmentSectorPayload(draft: SaveEquipmentSectorDraft): SetorEquipamento {
  const id = draft.id.trim();
  const nome = draft.nome.trim();

  if (!id) {
    throw new Error('Não foi possível identificar o setor.');
  }

  if (!nome) {
    throw new Error('Informe o nome do setor.');
  }

  return {
    id,
    nome,
    ...(trimOptional(draft.clienteId) ? { clienteId: trimOptional(draft.clienteId) } : {}),
    ...(trimOptional(draft.cor) ? { cor: trimOptional(draft.cor) } : {}),
    ...(trimOptional(draft.descricao) ? { descricao: trimOptional(draft.descricao) } : {}),
    ...(trimOptional(draft.responsavel) ? { responsavel: trimOptional(draft.responsavel) } : {}),
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
