import type { RegistroServico } from '../domain/types';
import {
  APP_V2_REGISTROS_SELECT,
  mapSupabaseRegistroRowToAppV2Registro,
  type SupabaseRegistroRow,
} from './appV2SupabaseRegistroMappers';

interface SupabaseRegistrosReadResult {
  data: SupabaseRegistroRow[] | null;
  error: { message?: string } | null;
}

interface SupabaseRegistrosEqQuery {
  eq(column: 'user_id', value: string): Promise<SupabaseRegistrosReadResult>;
}

interface SupabaseRegistrosSelectQuery {
  select(columns: typeof APP_V2_REGISTROS_SELECT): SupabaseRegistrosEqQuery;
}

export interface AppV2RegistrosSupabaseClient {
  from(table: 'registros'): SupabaseRegistrosSelectQuery;
}

export interface LoadAppV2RegistrosFromSupabaseInput {
  client: AppV2RegistrosSupabaseClient;
  userId: string;
}

export async function loadAppV2RegistrosFromSupabase({
  client,
  userId,
}: LoadAppV2RegistrosFromSupabaseInput): Promise<RegistroServico[]> {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new Error('Usuario autenticado e obrigatorio para ler registros do app-v2.');
  }

  const { data, error } = await client
    .from('registros')
    .select(APP_V2_REGISTROS_SELECT)
    .eq('user_id', normalizedUserId);

  if (error) {
    throw new Error(
      `Nao foi possivel carregar registros do app-v2: ${error.message || 'erro desconhecido'}`,
    );
  }

  return (data ?? []).map(mapSupabaseRegistroRowToAppV2Registro).filter(isRegistro);
}

function isRegistro(value: RegistroServico | null): value is RegistroServico {
  return value !== null;
}
