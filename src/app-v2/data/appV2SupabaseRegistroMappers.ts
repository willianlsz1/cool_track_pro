import type { RegistroServico, ServiceRecordKind, ServiceRecordStatus } from '../domain/types';

export interface SupabaseRegistroRow {
  id?: string | null;
  equip_id?: string | null;
  data?: string | null;
  tipo?: string | null;
  tipo_descricao?: string | null;
  status?: string | null;
  tecnico?: string | null;
  diagnostico?: string | null;
  acoes_executadas?: string | null;
  obs?: string | null;
  pecas?: string | null;
  custo_pecas?: number | string | null;
  custo_mao_obra?: number | string | null;
  proxima?: string | null;
  created_at?: string | null;
}

export interface SupabaseRegistroWritableRow {
  equip_id: string;
  data: string;
  tipo: ServiceRecordKind;
  tipo_descricao: string | null;
  status: ServiceRecordStatus;
  tecnico: string;
  diagnostico: string | null;
  acoes_executadas: string | null;
  obs: string;
  pecas: string | null;
  custo_pecas: number;
  custo_mao_obra: number;
  proxima: string;
}

export const APP_V2_REGISTROS_SELECT =
  'id,equip_id,data,tipo,tipo_descricao,status,tecnico,diagnostico,acoes_executadas,obs,pecas,custo_pecas,custo_mao_obra,proxima';

const SERVICE_RECORD_KINDS: readonly ServiceRecordKind[] = [
  'preventiva',
  'corretiva',
  'instalacao',
  'visita',
  'outro',
];

export function mapSupabaseRegistroRowToAppV2Registro(
  row: SupabaseRegistroRow,
): RegistroServico | null {
  const id = normalizeText(row.id);
  const equipamentoId = normalizeText(row.equip_id);
  const data = normalizeText(row.data);

  if (!id || !equipamentoId || !data) {
    return null;
  }

  return omitUndefined({
    id,
    equipamentoId,
    data,
    tipo: normalizeKind(row.tipo),
    tipoDescricao: normalizeText(row.tipo_descricao),
    status: normalizeStatus(row.status),
    tecnico: normalizeText(row.tecnico) ?? '',
    diagnostico: normalizeText(row.diagnostico),
    acoesExecutadas: normalizeText(row.acoes_executadas),
    observacoes: normalizeText(row.obs),
    pecas: normalizeText(row.pecas),
    custoPecas: normalizeNumberText(row.custo_pecas),
    custoMaoObra: normalizeNumberText(row.custo_mao_obra),
    proximaData: normalizeText(row.proxima),
  }) as RegistroServico;
}

export function mapAppV2RegistroToWritableRow(
  registro: RegistroServico,
): SupabaseRegistroWritableRow {
  const equipamentoId = String(registro.equipamentoId ?? '').trim();
  const data = String(registro.data ?? '').trim();

  if (!equipamentoId) {
    throw new Error('Registro precisa de equipamento valido para salvar.');
  }

  if (!data) {
    throw new Error('Registro precisa de data valida para salvar.');
  }

  return {
    equip_id: equipamentoId,
    data,
    tipo: normalizeKind(registro.tipo),
    tipo_descricao: normalizeOptional(registro.tipoDescricao),
    status: normalizeStatus(registro.status),
    tecnico: String(registro.tecnico ?? '').trim(),
    diagnostico: normalizeOptional(registro.diagnostico),
    acoes_executadas: normalizeOptional(registro.acoesExecutadas),
    obs: String(registro.observacoes ?? '').trim(),
    pecas: normalizeOptional(registro.pecas),
    custo_pecas: parseCurrency(registro.custoPecas),
    custo_mao_obra: parseCurrency(registro.custoMaoObra),
    proxima: String(registro.proximaData ?? '').trim(),
  };
}

function normalizeText(value: unknown): string | undefined {
  const normalized = String(value ?? '').trim();
  return normalized ? normalized : undefined;
}

function normalizeOptional(value: string | null | undefined): string | null {
  return normalizeText(value) ?? null;
}

function normalizeNumberText(value: number | string | null | undefined): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : undefined;
}

function normalizeKind(value: string | null | undefined): ServiceRecordKind {
  const normalized = String(value ?? '').trim() as ServiceRecordKind;
  return SERVICE_RECORD_KINDS.includes(normalized) ? normalized : 'outro';
}

function normalizeStatus(value: string | null | undefined): ServiceRecordStatus {
  return value === 'warn' || value === 'danger' ? value : 'ok';
}

function parseCurrency(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const normalized = value
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as T;
}
