import type { Cliente } from '../domain/types';
import {
  APP_V2_CLIENTES_SELECT,
  mapSupabaseClienteRowToAppV2Cliente,
  type SupabaseClienteRow,
} from './appV2SupabaseMappers';

interface SupabaseClientesReadResult {
  data: SupabaseClienteRow[] | null;
  error: { message?: string } | null;
}

interface SupabaseClientesEqQuery {
  eq(column: 'user_id', value: string): Promise<SupabaseClientesReadResult>;
}

interface SupabaseClientesSelectQuery {
  select(columns: typeof APP_V2_CLIENTES_SELECT): SupabaseClientesEqQuery;
}

export interface AppV2ClientesSupabaseClient {
  from(table: 'clientes'): SupabaseClientesSelectQuery;
}

export interface LoadAppV2ClientesFromSupabaseInput {
  client: AppV2ClientesSupabaseClient;
  userId: string;
}

export async function loadAppV2ClientesFromSupabase({
  client,
  userId,
}: LoadAppV2ClientesFromSupabaseInput): Promise<Cliente[]> {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new Error('Usuario autenticado e obrigatorio para ler clientes do app-v2.');
  }

  const { data, error } = await client
    .from('clientes')
    .select(APP_V2_CLIENTES_SELECT)
    .eq('user_id', normalizedUserId);

  if (error) {
    throw new Error(
      `Nao foi possivel carregar clientes do app-v2: ${error.message || 'erro desconhecido'}`,
    );
  }

  return (data ?? []).map(mapSupabaseClienteRowToAppV2Cliente).filter(isCliente);
}

function isCliente(value: Cliente | null): value is Cliente {
  return value !== null;
}
