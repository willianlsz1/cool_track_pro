/**
 * CoolTrack Pro - Orçamentos (Fase de instalação, abr/2026)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Módulo dedicado pra CRUD de orçamentos de instalação. Espelha o padrão
 * de `clientes.js` (sem replicar a infra completa do storage.js).
 *
 * Decisões de design:
 *   1. Cliente AVULSO inline (nome + telefone + endereço) — não força FK
 *      pra `clientes` (Pro). Maior parte das instalações é PF one-off.
 *   2. Numeração customizável via `profile.orcamento_numero_format`.
 *      Default: ORC-2026-0001. Sequencial é por user/ano.
 *   3. Itens em jsonb pra flexibilidade (text-livre, sem catálogo).
 *
 * Estado: state.orcamentos. Hidratado on-demand quando user entra na rota.
 */

import { supabase } from './supabase.js';
import { setState, getState } from './state.js';
import { handleError, ErrorCodes, AppError } from './errors.js';

const TABLE = 'orcamentos';

/**
 * Normaliza row do Supabase pra shape do app.
 */
function normalizeOrcamentoRow(row) {
  if (!row || typeof row !== 'object') return null;
  if (!row.id || !row.numero || !row.cliente_nome) return null;
  return {
    id: String(row.id),
    numero: String(row.numero),
    clienteId: row.cliente_id || null,
    clienteNome: String(row.cliente_nome || '').trim(),
    clienteTelefone: row.cliente_telefone ? String(row.cliente_telefone).trim() : '',
    clienteEndereco: row.cliente_endereco ? String(row.cliente_endereco).trim() : '',
    titulo: String(row.titulo || '').trim(),
    descricao: row.descricao ? String(row.descricao).trim() : '',
    itens: Array.isArray(row.itens) ? row.itens : [],
    subtotal: Number(row.subtotal || 0),
    desconto: Number(row.desconto || 0),
    total: Number(row.total || 0),
    validadeDias: Number(row.validade_dias || 7),
    formaPagamento: row.forma_pagamento ? String(row.forma_pagamento).trim() : '',
    observacoes: row.observacoes ? String(row.observacoes).trim() : '',
    status: row.status || 'rascunho',
    enviadoEm: row.enviado_em || null,
    aprovadoEm: row.aprovado_em || null,
    registroId: row.registro_id || null,
    equipamentoId: row.equipamento_id || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    visualizadoEm: row.visualizado_em || null,
  };
}

/**
 * Inverso: shape do app → row do banco.
 */
function denormalizeOrcamento(orcamento, userId) {
  return {
    id: orcamento.id, // undefined em insert (Supabase gera default uuid)
    user_id: userId,
    numero: String(orcamento.numero || '').trim(),
    cliente_id: orcamento.clienteId || null,
    cliente_nome: String(orcamento.clienteNome || '').trim(),
    cliente_telefone: orcamento.clienteTelefone?.trim() || null,
    cliente_endereco: orcamento.clienteEndereco?.trim() || null,
    titulo: String(orcamento.titulo || '').trim(),
    descricao: orcamento.descricao?.trim() || null,
    itens: Array.isArray(orcamento.itens) ? orcamento.itens : [],
    subtotal: Number(orcamento.subtotal || 0),
    desconto: Number(orcamento.desconto || 0),
    total: Number(orcamento.total || 0),
    validade_dias: Number(orcamento.validadeDias || 7),
    forma_pagamento: orcamento.formaPagamento?.trim() || null,
    observacoes: orcamento.observacoes?.trim() || null,
    status: orcamento.status || 'rascunho',
    enviado_em: orcamento.enviadoEm || null,
    aprovado_em: orcamento.aprovadoEm || null,
    registro_id: orcamento.registroId || null,
    equipamento_id: orcamento.equipamentoId || null,
  };
}

/**
 * Gera o próximo número de orçamento conforme o formato do profile.
 * Formato default: ORC-{YYYY}-{NNNN}. Tokens suportados:
 *   {YYYY} = ano atual
 *   {YY}   = 2 digitos do ano
 *   {NNNN} = sequencial 4 digitos zero-padded
 *   {NN}   = sequencial 2 digitos zero-padded
 *   {N}    = sequencial sem padding
 *
 * Calcula o próximo seq baseado no maior número existente do user no ano.
 */
export function generateOrcamentoNumero(existingOrcamentos, ano, format) {
  const f = format || 'ORC-{YYYY}-{NNNN}';
  const anoStr = String(ano);
  const anoStr2 = anoStr.slice(-2);

  // Encontra maior sequencial existente do ano (qualquer formato)
  let maxSeq = 0;
  const yearMatch = new RegExp(`(?:${anoStr}|${anoStr2})`);
  (existingOrcamentos || []).forEach((o) => {
    if (!o?.numero) return;
    if (!yearMatch.test(o.numero)) return;
    // Extrai o último número do código (sequencial)
    const match = String(o.numero).match(/(\d+)\s*$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxSeq) maxSeq = n;
    }
  });

  const nextSeq = maxSeq + 1;
  return f
    .replace(/\{YYYY\}/g, anoStr)
    .replace(/\{YY\}/g, anoStr2)
    .replace(/\{NNNN\}/g, String(nextSeq).padStart(4, '0'))
    .replace(/\{NN\}/g, String(nextSeq).padStart(2, '0'))
    .replace(/\{N\}/g, String(nextSeq));
}

/**
 * Busca todos os orçamentos do user logado. Atualiza state.orcamentos.
 * Tolerante: se a tabela ainda não existe (migration pendente), retorna [].
 */
export async function loadOrcamentos() {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user?.id) {
      setState((prev) => ({ ...prev, orcamentos: [] }));
      return [];
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      // Tabela não existe ainda? migration pendente.
      if (
        error.code === '42P01' ||
        String(error.message || '')
          .toLowerCase()
          .includes('does not exist')
      ) {
        console.warn('[orcamentos] tabela ainda não existe — rode supabase db push');
        setState((prev) => ({ ...prev, orcamentos: [] }));
        return [];
      }
      throw error;
    }

    const orcamentos = (data || []).map(normalizeOrcamentoRow).filter(Boolean);
    setState((prev) => ({ ...prev, orcamentos }));
    return orcamentos;
  } catch (error) {
    handleError(error, {
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Não foi possível carregar a lista de orçamentos.',
      context: { action: 'orcamentos.loadOrcamentos' },
    });
    setState((prev) => ({ ...prev, orcamentos: prev.orcamentos || [] }));
    return getState().orcamentos || [];
  }
}

/**
 * Insere ou atualiza orçamento. Se orcamento.id existe, faz upsert por id.
 * Se não tem numero, gera automaticamente (formato do profile).
 *
 * @returns o orcamento persistido (com id e timestamps preenchidos)
 */
export async function upsertOrcamento(orcamento, opts = {}) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user?.id) {
    throw new AppError('Faça login para salvar orçamentos.', ErrorCodes.UNAUTHORIZED, 'error');
  }

  // Auto-gera número se não tiver (insert novo)
  let payload = { ...orcamento };
  if (!payload.numero && !payload.id) {
    const ano = new Date().getFullYear();
    const profile = opts.profile || {};
    const format = profile.orcamento_numero_format || 'ORC-{YYYY}-{NNNN}';
    const existing = getState().orcamentos || [];
    payload.numero = generateOrcamentoNumero(existing, ano, format);
  }

  const row = denormalizeOrcamento(payload, user.id);
  if (!row.numero) {
    throw new AppError(
      'Número do orçamento é obrigatório.',
      ErrorCodes.VALIDATION_ERROR,
      'warning',
    );
  }
  if (!row.cliente_nome) {
    throw new AppError('Nome do cliente é obrigatório.', ErrorCodes.VALIDATION_ERROR, 'warning');
  }
  if (!row.titulo) {
    throw new AppError(
      'Título do orçamento é obrigatório.',
      ErrorCodes.VALIDATION_ERROR,
      'warning',
    );
  }

  // Insert: omite id pra Supabase usar default. Update: passa id.
  const finalPayload = row.id
    ? row
    : (() => {
        const { id: _omit, ...rest } = row;
        return rest;
      })();

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(finalPayload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    throw new AppError('Falha ao salvar orçamento.', ErrorCodes.SYNC_FAILED, 'error', {
      action: 'upsertOrcamento',
      cause: error.message,
    });
  }

  const normalized = normalizeOrcamentoRow(data);

  // Atualiza state local
  setState((prev) => {
    const list = prev.orcamentos || [];
    const idx = list.findIndex((o) => o.id === normalized.id);
    const next = [...list];
    if (idx >= 0) next[idx] = normalized;
    else next.unshift(normalized); // novo orçamento aparece no topo
    return { ...prev, orcamentos: next };
  });

  return normalized;
}

/**
 * Apaga orçamento por id.
 */
export async function deleteOrcamento(id) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user?.id) {
    throw new AppError('Faça login para apagar orçamentos.', ErrorCodes.UNAUTHORIZED, 'error');
  }

  const { error } = await supabase.from(TABLE).delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    throw new AppError('Falha ao apagar orçamento.', ErrorCodes.SYNC_FAILED, 'error', {
      action: 'deleteOrcamento',
      id,
      cause: error.message,
    });
  }

  setState((prev) => ({
    ...prev,
    orcamentos: (prev.orcamentos || []).filter((o) => o.id !== id),
  }));
}

/**
 * Helper: encontra orçamento no state.
 */
export function findOrcamento(id) {
  return (getState().orcamentos || []).find((o) => o.id === id) || null;
}

/**
 * Conta orçamentos criados no mês corrente — usado pra plan gating Free
 * (limite de 1/mês como porta de entrada).
 */
export function countOrcamentosThisMonth() {
  const now = new Date();
  const ymPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return (getState().orcamentos || []).filter((o) => {
    return o.createdAt && String(o.createdAt).startsWith(ymPrefix);
  }).length;
}

/**
 * Marca orçamento como expirado se a validade já passou. Helper local
 * (não chama Supabase — só recalcula no state). Chamar em loadOrcamentos
 * pra refletir status no UI sem precisar de cron job no servidor.
 */
export function markExpiredLocally(orcamentos) {
  const now = Date.now();
  return (orcamentos || []).map((o) => {
    if (o.status !== 'enviado' && o.status !== 'rascunho') return o;
    if (!o.enviadoEm) return o;
    const sentAt = new Date(o.enviadoEm).getTime();
    const validUntil = sentAt + o.validadeDias * 24 * 60 * 60 * 1000;
    if (now > validUntil) return { ...o, status: 'expirado' };
    return o;
  });
}

/**
 * Template padrão de itens de instalação de split residencial.
 */
export const TEMPLATE_INSTALACAO_SPLIT = [
  { descricao: 'Equipamento Split (especificar marca/BTU)', qty: 1, valorUnitario: 0 },
  { descricao: 'Tubulação de cobre (1/4" + 3/8") por metro', qty: 5, valorUnitario: 0 },
  { descricao: 'Cabo PP 4mm² para alimentação', qty: 5, valorUnitario: 0 },
  { descricao: 'Suporte para condensadora', qty: 1, valorUnitario: 0 },
  { descricao: 'Isolamento térmico para tubulação', qty: 5, valorUnitario: 0 },
  { descricao: 'Mão de obra (instalação completa)', qty: 1, valorUnitario: 0 },
];
