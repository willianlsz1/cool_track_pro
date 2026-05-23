import type {
  EquipmentCriticality,
  EquipmentStatus,
  Equipamento,
  OperationalPriority,
} from '../domain/types';

export interface SupabaseEquipamentoRow {
  id?: string | null;
  cliente_id?: string | null;
  setor_id?: string | null;
  nome?: string | null;
  local?: string | null;
  status?: string | null;
  tag?: string | null;
  tipo?: string | null;
  modelo?: string | null;
  fluido?: string | null;
  componente?: string | null;
  criticidade?: string | null;
  prioridade_operacional?: string | null;
  periodicidade_preventiva_dias?: number | null;
  created_at?: string | null;
  dados_placa?: SupabaseEquipamentoDadosPlaca | null;
  fotos?: unknown;
}

interface SupabaseEquipamentoDadosPlaca {
  numero_serie?: unknown;
  capacidade_btu?: unknown;
}

export const APP_V2_EQUIPAMENTOS_SELECT =
  'id,cliente_id,setor_id,nome,local,status,tag,tipo,modelo,fluido,componente,criticidade,prioridade_operacional,periodicidade_preventiva_dias,created_at,dados_placa';

export function mapSupabaseEquipamentoRowToAppV2Equipamento(
  row: SupabaseEquipamentoRow,
): Equipamento | null {
  const id = normalizeText(row.id);
  const nome = normalizeText(row.nome);
  const local = normalizeText(row.local);

  if (!id || !nome || !local) {
    return null;
  }

  return omitUndefined({
    id,
    nome,
    local,
    status: normalizeStatus(row.status),
    clienteId: normalizeText(row.cliente_id),
    setorId: normalizeText(row.setor_id),
    tag: normalizeText(row.tag),
    tipo: normalizeText(row.tipo),
    componente: normalizeText(row.componente),
    fluidoRefrigerante: normalizeText(row.fluido),
    marcaModelo: normalizeText(row.modelo),
    numeroSerie: normalizeText(row.dados_placa?.numero_serie),
    capacidadeBtuh: normalizeNumberText(row.dados_placa?.capacidade_btu),
    criticidade: normalizeCriticality(row.criticidade),
    prioridadeOperacional: normalizePriority(row.prioridade_operacional),
    periodicidadePreventivaDias: normalizePeriodicity(row.periodicidade_preventiva_dias),
    createdAt: normalizeText(row.created_at),
  });
}

function normalizeText(value: unknown): string | undefined {
  const normalized = String(value ?? '').trim();
  return normalized ? normalized : undefined;
}

function normalizeNumberText(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : undefined;
}

function normalizeStatus(value: string | null | undefined): EquipmentStatus {
  return value === 'warn' || value === 'danger' ? value : 'ok';
}

function normalizeCriticality(value: string | null | undefined): EquipmentCriticality | undefined {
  const normalized = normalizeText(value);

  if (!normalized) {
    return undefined;
  }

  return normalized === 'baixa' || normalized === 'alta' || normalized === 'critica'
    ? normalized
    : 'media';
}

function normalizePriority(value: string | null | undefined): OperationalPriority | undefined {
  const normalized = normalizeText(value);

  if (!normalized) {
    return undefined;
  }

  return normalized === 'baixa' || normalized === 'alta' ? normalized : 'normal';
}

function normalizePeriodicity(value: number | null | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as T;
}
