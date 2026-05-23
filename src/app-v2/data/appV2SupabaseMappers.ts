import type { Cliente } from '../domain/types';

export interface SupabaseClienteRow {
  id?: string | null;
  nome?: string | null;
  razao_social?: string | null;
  cnpj?: string | null;
  contato?: string | null;
  endereco?: string | null;
  inscricao_estadual?: string | null;
  inscricao_municipal?: string | null;
  url_chamados?: string | null;
  finalidade?: string | null;
  observacoes?: string | null;
}

export const APP_V2_CLIENTES_SELECT =
  'id,nome,razao_social,cnpj,contato,endereco,inscricao_estadual,inscricao_municipal,url_chamados,finalidade,observacoes';

export function mapSupabaseClienteRowToAppV2Cliente(row: SupabaseClienteRow): Cliente | null {
  const id = normalizeText(row.id);
  const nome = normalizeText(row.nome);

  if (!id || !nome) {
    return null;
  }

  return omitUndefined({
    id,
    nome,
    razaoSocial: normalizeText(row.razao_social),
    documento: normalizeText(row.cnpj),
    contato: normalizeText(row.contato),
    endereco: normalizeText(row.endereco),
    inscricaoEstadual: normalizeText(row.inscricao_estadual),
    inscricaoMunicipal: normalizeText(row.inscricao_municipal),
    canalChamados: normalizeText(row.url_chamados),
    finalidadeAmbiente: normalizeText(row.finalidade),
    observacoesInternas: normalizeText(row.observacoes),
  });
}

function normalizeText(value: string | null | undefined): string | undefined {
  const normalized = String(value ?? '').trim();
  return normalized ? normalized : undefined;
}

function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as T;
}
