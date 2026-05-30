import type { RegistroServico } from '../domain/types';
import {
  APP_V2_REGISTROS_SELECT,
  mapAppV2RegistroToWritableRow,
  mapSupabaseRegistroRowToAppV2Registro,
  type SupabaseRegistroRow,
  type SupabaseRegistroWritableRow,
} from './appV2SupabaseRegistroMappers';

export interface SupabaseRegistroWriteResponse {
  data: SupabaseRegistroRow | null;
  error: { message?: string } | null;
}

export interface SupabaseRegistroInsertRow extends SupabaseRegistroWritableRow {
  id: string;
  user_id: string;
}

interface SupabaseRegistrosUpsertSelectQuery {
  single(): Promise<SupabaseRegistroWriteResponse>;
}

interface SupabaseRegistrosUpsertQuery {
  select(columns: typeof APP_V2_REGISTROS_SELECT): SupabaseRegistrosUpsertSelectQuery;
}

interface SupabaseRegistrosWriteQuery {
  upsert(row: SupabaseRegistroInsertRow): SupabaseRegistrosUpsertQuery;
}

export interface SupabaseAppV2RegistrosWriteClient {
  from(table: 'registros'): SupabaseRegistrosWriteQuery;
}

export async function saveAppV2RegistroToSupabase({
  client,
  userId,
  registro,
}: {
  client: SupabaseAppV2RegistrosWriteClient;
  userId: string;
  registro: RegistroServico;
}): Promise<RegistroServico> {
  const normalizedUserId = String(userId ?? '').trim();

  if (!normalizedUserId) {
    throw new Error('Usuario autenticado obrigatorio para salvar registro.');
  }

  const id = String(registro.id ?? '').trim();

  if (!id) {
    throw new Error('Registro precisa de id para salvar.');
  }

  const writableRow = mapAppV2RegistroToWritableRow(registro);
  const { data, error } = await client
    .from('registros')
    .upsert({ id, user_id: normalizedUserId, ...writableRow })
    .select(APP_V2_REGISTROS_SELECT)
    .single();

  if (error) {
    throw new Error(error.message ?? 'Nao foi possivel salvar registro.');
  }

  if (!data) {
    throw new Error('Registro salvo sem dados retornados.');
  }

  const saved = mapSupabaseRegistroRowToAppV2Registro(data);

  if (!saved) {
    throw new Error('Registro salvo com dados invalidos retornados.');
  }

  return saved;
}
