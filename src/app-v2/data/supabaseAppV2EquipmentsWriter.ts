import type { Equipamento } from '../domain/types';
import type { SaveEquipmentDraft } from '../equipment/equipmentActions';
import {
  APP_V2_EQUIPAMENTOS_SELECT,
  mapSupabaseEquipamentoRowToAppV2Equipamento,
  type SupabaseEquipamentoRow,
} from './appV2SupabaseEquipmentMappers';

export interface SupabaseEquipamentoWriteResponse {
  data: SupabaseEquipamentoRow | null;
  error: { message?: string } | null;
}

export interface SupabaseAppV2EquipmentsWriteClient {
  from(table: 'equipamentos'): SupabaseEquipamentosWriteQuery;
}

export interface SupabaseEquipamentosWriteQuery {
  insert(row: SupabaseEquipamentoInsertRow): SupabaseEquipamentosSelectQuery;
  update(row: SupabaseEquipamentoUpdateRow): SupabaseEquipamentosFilterQuery;
}

export interface SupabaseEquipamentosSelectQuery {
  select(columns: typeof APP_V2_EQUIPAMENTOS_SELECT): SupabaseEquipamentosSingleQuery;
}

export interface SupabaseEquipamentosFilterQuery {
  eq(column: 'id' | 'user_id', value: string): SupabaseEquipamentosFilterQuery;
  select(columns: typeof APP_V2_EQUIPAMENTOS_SELECT): SupabaseEquipamentosSingleQuery;
}

export interface SupabaseEquipamentosSingleQuery {
  single(): Promise<SupabaseEquipamentoWriteResponse>;
}

export interface SupabaseEquipamentoInsertRow extends SupabaseEquipamentoWritableRow {
  id: string;
  user_id: string;
}

export type SupabaseEquipamentoUpdateRow = SupabaseEquipamentoWritableRow;

interface SupabaseEquipamentoWritableRow {
  cliente_id: string | null;
  nome: string;
  local: string;
  status: string;
  tag: string | null;
  tipo: string | null;
  modelo: string | null;
  fluido: string | null;
  componente: string | null;
  criticidade: string;
  prioridade_operacional: string;
  periodicidade_preventiva_dias: number | null;
  dados_placa: SupabaseEquipamentoDadosPlaca;
}

interface SupabaseEquipamentoDadosPlaca {
  numero_serie?: string;
  capacidade_btu?: string;
}

export async function saveAppV2EquipamentoToSupabase({
  client,
  userId,
  draft,
}: {
  client: SupabaseAppV2EquipmentsWriteClient;
  userId: string;
  draft: SaveEquipmentDraft;
}): Promise<Equipamento> {
  const normalizedUserId = normalizeRequired(userId);

  if (!normalizedUserId) {
    throw new Error('Usuario autenticado obrigatorio para salvar equipamento.');
  }

  const shouldEdit = draft.mode === 'edit';
  const equipmentId = shouldEdit
    ? normalizeRequired(draft.id)
    : resolveCreateEquipmentId(normalizeRequired(draft.id));

  if (shouldEdit && !equipmentId) {
    throw new Error('Nao foi possivel identificar o equipamento.');
  }

  const writableRow = mapEquipmentDraftToWritableRow(draft);
  const response = shouldEdit
    ? await updateEquipamento(client, equipmentId, normalizedUserId, writableRow)
    : await createEquipamento(client, equipmentId, normalizedUserId, writableRow);

  if (response.error) {
    throw new Error(response.error.message ?? 'Nao foi possivel salvar equipamento.');
  }

  const data = response.data;

  if (!data) {
    throw new Error('Equipamento salvo sem dados retornados.');
  }

  const equipamento = mapSupabaseEquipamentoRowToAppV2Equipamento(data);

  if (!equipamento) {
    throw new Error('Equipamento salvo com dados invalidos retornados.');
  }

  return equipamento;
}

async function createEquipamento(
  client: SupabaseAppV2EquipmentsWriteClient,
  equipmentId: string,
  userId: string,
  writableRow: SupabaseEquipamentoWritableRow,
): Promise<SupabaseEquipamentoWriteResponse> {
  return client
    .from('equipamentos')
    .insert({
      id: equipmentId,
      user_id: userId,
      ...writableRow,
    })
    .select(APP_V2_EQUIPAMENTOS_SELECT)
    .single();
}

async function updateEquipamento(
  client: SupabaseAppV2EquipmentsWriteClient,
  equipmentId: string,
  userId: string,
  writableRow: SupabaseEquipamentoWritableRow,
): Promise<SupabaseEquipamentoWriteResponse> {
  return client
    .from('equipamentos')
    .update(writableRow)
    .eq('id', equipmentId)
    .eq('user_id', userId)
    .select(APP_V2_EQUIPAMENTOS_SELECT)
    .single();
}

function mapEquipmentDraftToWritableRow(draft: SaveEquipmentDraft): SupabaseEquipamentoWritableRow {
  const nome = normalizeRequired(draft.nome);
  const local = normalizeRequired(draft.local);
  const clienteId = normalizeOptional(draft.clienteId);

  if (!nome) {
    throw new Error('Informe o nome do equipamento.');
  }

  if (!local) {
    throw new Error('Informe o local do equipamento.');
  }

  if (clienteId && !isUuid(clienteId)) {
    throw new Error('Cliente real precisa de UUID valido para salvar equipamento.');
  }

  return {
    cliente_id: clienteId,
    nome,
    local,
    status: draft.status ?? 'ok',
    tag: normalizeOptional(draft.tag),
    tipo: normalizeOptional(draft.tipo),
    modelo: normalizeOptional(draft.marcaModelo),
    fluido: normalizeOptional(draft.fluidoRefrigerante),
    componente: normalizeOptional(draft.componente),
    criticidade: draft.criticidade ?? 'media',
    prioridade_operacional: draft.prioridadeOperacional ?? 'normal',
    periodicidade_preventiva_dias: normalizePreventiveInterval(draft.periodicidadePreventivaDias),
    dados_placa: mapDadosPlaca(draft),
  };
}

function mapDadosPlaca(draft: SaveEquipmentDraft): SupabaseEquipamentoDadosPlaca {
  const numeroSerie = normalizeOptional(draft.numeroSerie);
  const capacidadeBtu = normalizeOptional(draft.capacidadeBtuh);
  const dadosPlaca = {
    ...(numeroSerie ? { numero_serie: numeroSerie } : {}),
    ...(capacidadeBtu ? { capacidade_btu: capacidadeBtu } : {}),
  };

  return dadosPlaca;
}

function normalizeRequired(value: string | null | undefined): string {
  return String(value ?? '').trim();
}

function normalizeOptional(value: string | null | undefined): string | null {
  const normalized = normalizeRequired(value);
  return normalized ? normalized : null;
}

function resolveCreateEquipmentId(draftId: string): string {
  if (isUuid(draftId)) {
    return draftId;
  }

  const generatedId = globalThis.crypto?.randomUUID?.();

  if (!generatedId) {
    throw new Error('Nao foi possivel gerar UUID para salvar equipamento real.');
  }

  return generatedId;
}

function normalizePreventiveInterval(value: number | string | undefined): number | null {
  if (value === undefined || value === '') {
    return null;
  }

  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? Math.trunc(numericValue) : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
