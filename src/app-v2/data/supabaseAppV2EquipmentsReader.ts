import type { Equipamento } from '../domain/types';
import {
  APP_V2_EQUIPAMENTOS_SELECT,
  mapSupabaseEquipamentoRowToAppV2Equipamento,
  type SupabaseEquipamentoRow,
} from './appV2SupabaseEquipmentMappers';

interface SupabaseEquipamentosReadResult {
  data: SupabaseEquipamentoRow[] | null;
  error: { message?: string } | null;
}

interface SupabaseEquipamentosClienteQuery {
  eq(column: 'cliente_id', value: string): Promise<SupabaseEquipamentosReadResult>;
}

interface SupabaseEquipamentosUserQuery {
  eq(column: 'user_id', value: string): SupabaseEquipamentosClienteQuery;
}

interface SupabaseEquipamentosSelectQuery {
  select(columns: typeof APP_V2_EQUIPAMENTOS_SELECT): SupabaseEquipamentosUserQuery;
}

export interface AppV2EquipamentosSupabaseClient {
  from(table: 'equipamentos'): SupabaseEquipamentosSelectQuery;
}

export interface LoadAppV2EquipamentosByClienteFromSupabaseInput {
  client: AppV2EquipamentosSupabaseClient;
  userId: string;
  clienteId: string;
}

export async function loadAppV2EquipamentosByClienteFromSupabase({
  client,
  userId,
  clienteId,
}: LoadAppV2EquipamentosByClienteFromSupabaseInput): Promise<Equipamento[]> {
  const normalizedUserId = userId.trim();
  const normalizedClienteId = clienteId.trim();

  if (!normalizedUserId) {
    throw new Error('Usuario autenticado e obrigatorio para ler equipamentos do app-v2.');
  }

  if (!isUuid(normalizedClienteId)) {
    throw new Error('Cliente real precisa de UUID valido para ler equipamentos.');
  }

  const { data, error } = await client
    .from('equipamentos')
    .select(APP_V2_EQUIPAMENTOS_SELECT)
    .eq('user_id', normalizedUserId)
    .eq('cliente_id', normalizedClienteId);

  if (error) {
    throw new Error(
      `Nao foi possivel carregar equipamentos do app-v2: ${error.message || 'erro desconhecido'}`,
    );
  }

  return (data ?? []).map(mapSupabaseEquipamentoRowToAppV2Equipamento).filter(isEquipamento);
}

function isEquipamento(value: Equipamento | null): value is Equipamento {
  return value !== null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
