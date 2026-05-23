import type { SaveClientDraft } from '../equipment/clientActions';
import type { Cliente } from '../domain/types';
import {
  APP_V2_CLIENTES_SELECT,
  mapSupabaseClienteRowToAppV2Cliente,
  type SupabaseClienteRow,
} from './appV2SupabaseMappers';

export interface SupabaseClienteWriteResponse {
  data: SupabaseClienteRow | null;
  error: { message?: string } | null;
}

export interface SupabaseAppV2ClientsWriteClient {
  from(table: 'clientes'): SupabaseClientesWriteQuery;
}

export interface SupabaseClientesWriteQuery {
  insert(row: SupabaseClienteInsertRow): SupabaseClientesSelectQuery;
  update(row: SupabaseClienteUpdateRow): SupabaseClientesFilterQuery;
}

export interface SupabaseClientesSelectQuery {
  select(columns: string): SupabaseClientesSingleQuery;
}

export interface SupabaseClientesFilterQuery {
  eq(column: 'id' | 'user_id', value: string): SupabaseClientesFilterQuery;
  select(columns: string): SupabaseClientesSingleQuery;
}

export interface SupabaseClientesSingleQuery {
  single(): Promise<SupabaseClienteWriteResponse>;
}

export interface SupabaseClienteInsertRow extends SupabaseClienteWritableRow {
  user_id: string;
}

export type SupabaseClienteUpdateRow = SupabaseClienteWritableRow;

interface SupabaseClienteWritableRow {
  nome: string;
  razao_social: string | null;
  cnpj: string | null;
  contato: string | null;
  endereco: string | null;
  inscricao_estadual: string | null;
  inscricao_municipal: string | null;
  url_chamados: string | null;
  finalidade: string | null;
  observacoes: string | null;
}

export async function saveAppV2ClienteToSupabase({
  client,
  userId,
  draft,
}: {
  client: SupabaseAppV2ClientsWriteClient;
  userId: string;
  draft: SaveClientDraft;
}): Promise<Cliente> {
  const normalizedUserId = normalizeRequired(userId);

  if (!normalizedUserId) {
    throw new Error('Usuario autenticado obrigatorio para salvar cliente.');
  }

  const writableRow = mapClientDraftToWritableRow(draft);
  const response =
    draft.mode === 'edit'
      ? await updateCliente(client, draft.id, normalizedUserId, writableRow)
      : await createCliente(client, normalizedUserId, writableRow);

  if (response.error) {
    throw new Error(response.error.message ?? 'Nao foi possivel salvar cliente.');
  }

  const data = response.data;

  if (!data) {
    throw new Error('Cliente salvo sem dados retornados.');
  }

  const cliente = mapSupabaseClienteRowToAppV2Cliente(data);

  if (!cliente) {
    throw new Error('Cliente salvo com dados invalidos retornados.');
  }

  return cliente;
}

async function createCliente(
  client: SupabaseAppV2ClientsWriteClient,
  userId: string,
  writableRow: SupabaseClienteWritableRow,
): Promise<SupabaseClienteWriteResponse> {
  return client
    .from('clientes')
    .insert({
      user_id: userId,
      ...writableRow,
    })
    .select(APP_V2_CLIENTES_SELECT)
    .single();
}

async function updateCliente(
  client: SupabaseAppV2ClientsWriteClient,
  clienteId: string,
  userId: string,
  writableRow: SupabaseClienteWritableRow,
): Promise<SupabaseClienteWriteResponse> {
  const normalizedClienteId = normalizeRequired(clienteId);

  if (!isUuid(normalizedClienteId)) {
    throw new Error('Cliente real precisa de UUID valido para edicao.');
  }

  return client
    .from('clientes')
    .update(writableRow)
    .eq('id', normalizedClienteId)
    .eq('user_id', userId)
    .select(APP_V2_CLIENTES_SELECT)
    .single();
}

function mapClientDraftToWritableRow(draft: SaveClientDraft): SupabaseClienteWritableRow {
  const nome = normalizeRequired(draft.nome);

  if (!nome) {
    throw new Error('Informe o nome do cliente.');
  }

  return {
    nome,
    razao_social: normalizeOptional(draft.razaoSocial),
    cnpj: normalizeOptional(draft.documento),
    contato: normalizeOptional(draft.contato),
    endereco: normalizeOptional(draft.endereco),
    inscricao_estadual: normalizeOptional(draft.inscricaoEstadual),
    inscricao_municipal: normalizeOptional(draft.inscricaoMunicipal),
    url_chamados: normalizeOptional(draft.canalChamados),
    finalidade: normalizeOptional(draft.finalidadeAmbiente),
    observacoes: normalizeOptional(draft.observacoesInternas),
  };
}

function normalizeRequired(value: string | null | undefined): string {
  return String(value ?? '').trim();
}

function normalizeOptional(value: string | null | undefined): string | null {
  const normalized = normalizeRequired(value);
  return normalized ? normalized : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
