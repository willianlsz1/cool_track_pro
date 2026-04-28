import { supabase } from '../supabase.js';
import { normalizePhotoList } from '../photoStorage.js';
import { AppError, ErrorCodes } from '../errors.js';
import {
  normalizeCriticidade,
  normalizePeriodicidadePreventivaDias,
  normalizePrioridadeOperacional,
} from '../../domain/maintenance.js';
import { sanitizePersistedSetor } from '../inputValidation.js';
import {
  mapClienteRow,
  mapEquipamentoRow,
  sanitizePersistedCliente,
} from './storageNormalizers.js';

function splitIntoChunks(values, chunkSize = 100) {
  const list = Array.isArray(values) ? values : [];
  const chunks = [];
  for (let i = 0; i < list.length; i += chunkSize) {
    chunks.push(list.slice(i, i + chunkSize));
  }
  return chunks;
}

function isMissingSetorClienteSchemaError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    (message.includes('column') || message.includes('schema cache')) &&
    message.includes('cliente_id') &&
    (message.includes('setor') || message.includes('setores'))
  );
}

function isMissingSetorSchemaError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('setor') || (message.includes('column') && message.includes('setor_id'));
}

function isMissingSetorColumnError(error) {
  const message = String(error?.message || '').toLowerCase();
  const hitsSetores = message.includes('setores') || message.includes('setor');
  const hitsNewColumn = message.includes('descricao') || message.includes('responsavel');
  return hitsSetores && hitsNewColumn;
}

const NULLABLE_EQUIP_COLUMNS = [
  'componente',
  'cliente_id',
  'fotos',
  'criticidade',
  'prioridade_operacional',
  'periodicidade_preventiva_dias',
];

export async function pushEquipamentos(equipamentos, userId) {
  if (!equipamentos.length) return;
  try {
    let rows = equipamentos.map((equipamento) => mapEquipamentoRow(equipamento, userId));
    let { error } = await supabase.from('equipamentos').upsert(rows, { onConflict: 'id' });

    let attempt = 0;
    while (error && attempt < NULLABLE_EQUIP_COLUMNS.length) {
      const msg = String(error?.message || '').toLowerCase();
      if (!/column|schema cache|does not exist/i.test(msg)) break;

      const culprit =
        NULLABLE_EQUIP_COLUMNS.find((col) => msg.includes(col) && col in rows[0]) ||
        NULLABLE_EQUIP_COLUMNS.find((col) => col in rows[0]);
      if (!culprit) break;

      rows = rows.map(({ [culprit]: _omit, ...rest }) => rest);
      ({ error } = await supabase.from('equipamentos').upsert(rows, { onConflict: 'id' }));
      attempt += 1;
    }
    if (error) throw error;
  } catch (error) {
    throw new AppError('Falha ao sincronizar equipamentos.', ErrorCodes.SYNC_FAILED, 'warning', {
      action: 'pushEquipamentos',
      quantidade: equipamentos.length,
      userId,
      cause: error?.message,
    });
  }
}

function isMissingChecklistSchemaError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    (message.includes('column') || message.includes('schema cache')) &&
    message.includes('checklist')
  );
}

export async function pushRegistros(registros, userId) {
  if (!registros.length) return;
  try {
    const rows = registros.map((r) => ({
      id: r.id,
      user_id: userId,
      equip_id: r.equipId,
      data: r.data,
      tipo: r.tipo,
      obs: r.obs,
      status: r.status,
      pecas: r.pecas,
      proxima: r.proxima,
      tecnico: r.tecnico,
      custo_pecas: r.custoPecas,
      custo_mao_obra: r.custoMaoObra,
      assinatura: r.assinatura,
      fotos: normalizePhotoList(r.fotos),
      checklist: r.checklist && typeof r.checklist === 'object' ? r.checklist : null,
    }));
    let { error } = await supabase.from('registros').upsert(rows, { onConflict: 'id' });
    if (error && isMissingChecklistSchemaError(error)) {
      const rowsWithoutChecklist = rows.map(({ checklist: _omit, ...rest }) => rest);
      ({ error } = await supabase
        .from('registros')
        .upsert(rowsWithoutChecklist, { onConflict: 'id' }));
    }
    if (error) throw error;
  } catch (error) {
    throw new AppError('Falha ao sincronizar registros.', ErrorCodes.SYNC_FAILED, 'warning', {
      action: 'pushRegistros',
      quantidade: registros.length,
      userId,
      cause: error?.message,
    });
  }
}

export async function pushTecnicos(tecnicos, userId) {
  if (!tecnicos.length) return;
  try {
    const rows = [...new Set(tecnicos.map(String).filter(Boolean))].map((nome) => ({
      user_id: userId,
      nome,
    }));
    if (!rows.length) return;
    const { error } = await supabase.from('tecnicos').upsert(rows, { onConflict: 'user_id,nome' });
    if (error) throw error;
  } catch (error) {
    throw new AppError('Falha ao sincronizar técnicos.', ErrorCodes.SYNC_FAILED, 'warning', {
      action: 'pushTecnicos',
      quantidade: tecnicos.length,
      userId,
      cause: error?.message,
    });
  }
}

export async function pushSetores(setores, userId) {
  if (!setores?.length) return;
  const sanitized = setores.map((s) => sanitizePersistedSetor(s)).filter(Boolean);
  if (!sanitized.length) return;

  const buildRows = ({ withCliente = true, withDescResp = true } = {}) =>
    sanitized.map((s) => {
      const row = { id: s.id, user_id: userId, nome: s.nome, cor: s.cor };
      if (withDescResp) {
        row.descricao = s.descricao || null;
        row.responsavel = s.responsavel || null;
      }
      if (withCliente && s.clienteId) {
        row.cliente_id = s.clienteId;
      }
      return row;
    });

  try {
    let { error } = await supabase.from('setores').upsert(buildRows(), { onConflict: 'id' });

    if (error && isMissingSetorClienteSchemaError(error)) {
      ({ error } = await supabase
        .from('setores')
        .upsert(buildRows({ withCliente: false }), { onConflict: 'id' }));
    }

    if (error && isMissingSetorColumnError(error)) {
      ({ error } = await supabase
        .from('setores')
        .upsert(buildRows({ withCliente: false, withDescResp: false }), { onConflict: 'id' }));
    }

    if (error) {
      if (isMissingSetorSchemaError(error)) return;
      throw error;
    }
  } catch (error) {
    if (isMissingSetorSchemaError(error)) return;
    throw new AppError('Falha ao sincronizar setores.', ErrorCodes.SYNC_FAILED, 'warning', {
      action: 'pushSetores',
      quantidade: setores.length,
      userId,
      cause: error?.message,
    });
  }
}

export async function pushClientes(clientes, userId) {
  if (!clientes?.length) return;
  const sanitized = clientes.map(sanitizePersistedCliente).filter(Boolean);
  if (!sanitized.length) return;
  try {
    const rows = sanitized.map((cliente) => mapClienteRow(cliente, userId));
    const { error } = await supabase.from('clientes').upsert(rows, { onConflict: 'id' });
    if (error) {
      const msg = String(error?.message || '').toLowerCase();
      if (error.code === '42P01' || msg.includes('does not exist')) return;
      throw error;
    }
  } catch (error) {
    const msg = String(error?.message || '').toLowerCase();
    if (error?.code === '42P01' || msg.includes('does not exist')) return;
    throw new AppError('Falha ao sincronizar clientes.', ErrorCodes.SYNC_FAILED, 'warning', {
      action: 'pushClientes',
      quantidade: clientes.length,
      userId,
      cause: error?.message,
    });
  }
}

async function deleteRemoteRegistros(ids, userId) {
  const uniqueIds = [...new Set((ids || []).map(String).filter(Boolean))];
  if (!uniqueIds.length) return;
  for (const chunk of splitIntoChunks(uniqueIds, 100)) {
    const { error } = await supabase
      .from('registros')
      .delete()
      .eq('user_id', userId)
      .in('id', chunk);
    if (error) throw error;
  }
}

async function deleteRemoteEquipamentos(ids, userId) {
  const uniqueIds = [...new Set((ids || []).map(String).filter(Boolean))];
  if (!uniqueIds.length) return;
  for (const chunk of splitIntoChunks(uniqueIds, 100)) {
    const { error } = await supabase
      .from('equipamentos')
      .delete()
      .eq('user_id', userId)
      .in('id', chunk);
    if (error) throw error;
  }
}

async function deleteRemoteSetores(ids, userId) {
  const uniqueIds = [...new Set((ids || []).map(String).filter(Boolean))];
  if (!uniqueIds.length) return;
  for (const chunk of splitIntoChunks(uniqueIds, 100)) {
    const { error } = await supabase.from('setores').delete().eq('user_id', userId).in('id', chunk);
    if (error) {
      if (isMissingSetorSchemaError(error)) return;
      throw error;
    }
  }
}

export async function flushPendingDeletionsRemote({
  userId,
  parseDeletionQueue,
  saveDeletionQueue,
}) {
  const queue = parseDeletionQueue();
  if (!queue.equipamentos.length && !queue.registros.length && !queue.setores.length) return;

  const remaining = {
    ...queue,
    equipamentos: [...queue.equipamentos],
    registros: [...queue.registros],
    setores: [...queue.setores],
  };

  if (queue.registros.length) {
    await deleteRemoteRegistros(queue.registros, userId);
    remaining.registros = [];
  }
  if (queue.equipamentos.length) {
    await deleteRemoteEquipamentos(queue.equipamentos, userId);
    remaining.equipamentos = [];
  }
  if (queue.setores.length) {
    await deleteRemoteSetores(queue.setores, userId);
    remaining.setores = [];
  }

  saveDeletionQueue(remaining);
}

export async function pullFromSupabase(userId) {
  let eqRes;
  let regRes;
  let tecRes;
  let setRes;
  let cliRes;
  try {
    [eqRes, regRes, tecRes, setRes, cliRes] = await Promise.all([
      supabase.from('equipamentos').select('*').eq('user_id', userId),
      supabase.from('registros').select('*').eq('user_id', userId),
      supabase.from('tecnicos').select('nome').eq('user_id', userId),
      supabase
        .from('setores')
        .select('id, nome, cor, descricao, responsavel, cliente_id')
        .eq('user_id', userId),
      supabase.from('clientes').select('*').eq('user_id', userId),
    ]);
    if (setRes?.error && isMissingSetorColumnError(setRes.error)) {
      setRes = await supabase
        .from('setores')
        .select('id, nome, cor, cliente_id')
        .eq('user_id', userId);
    }
    if (setRes?.error && isMissingSetorClienteSchemaError(setRes.error)) {
      setRes = await supabase.from('setores').select('id, nome, cor').eq('user_id', userId);
    }
    if (eqRes.error || regRes.error || tecRes.error) {
      throw new Error(
        eqRes.error?.message || regRes.error?.message || tecRes.error?.message || 'select failed',
      );
    }
  } catch (error) {
    throw new AppError('Falha ao carregar dados da nuvem.', ErrorCodes.NETWORK_ERROR, 'warning', {
      action: 'pullFromSupabase',
      userId,
      cause: error?.message,
    });
  }

  const equipamentos = (eqRes.data || []).map((e) => ({
    id: e.id,
    nome: e.nome,
    local: e.local,
    status: e.status,
    tag: e.tag || '',
    tipo: e.tipo || 'Outro',
    componente: e.componente || null,
    modelo: e.modelo || '',
    fluido: e.fluido || '',
    criticidade: normalizeCriticidade(e.criticidade),
    prioridadeOperacional: normalizePrioridadeOperacional(
      e.prioridade_operacional || e.prioridadeOperacional,
    ),
    periodicidadePreventivaDias: normalizePeriodicidadePreventivaDias(
      e.periodicidade_preventiva_dias,
      e.tipo,
      e.criticidade,
    ),
    setorId: e.setor_id ? String(e.setor_id) : null,
    clienteId: e.cliente_id ? String(e.cliente_id) : null,
    fotos: normalizePhotoList(e.fotos),
  }));

  const equipIds = new Set(equipamentos.map((e) => e.id));

  const registros = (regRes.data || [])
    .map((r) => ({
      id: r.id,
      equipId: r.equip_id,
      data: r.data,
      tipo: r.tipo,
      obs: r.obs || '',
      status: r.status || 'ok',
      pecas: r.pecas || '',
      proxima: r.proxima || '',
      tecnico: r.tecnico || '',
      custoPecas: parseFloat(r.custo_pecas || 0),
      custoMaoObra: parseFloat(r.custo_mao_obra || 0),
      assinatura: Boolean(r.assinatura),
      fotos: normalizePhotoList(r.fotos),
      checklist: r.checklist && typeof r.checklist === 'object' ? r.checklist : null,
    }))
    .filter((r) => equipIds.has(r.equipId));

  const tecnicos = (tecRes.data || []).map((t) => t.nome);
  const clientes = cliRes?.error
    ? []
    : (cliRes?.data || []).map((row) => sanitizePersistedCliente(row)).filter(Boolean);

  const setores = setRes?.error
    ? []
    : (setRes?.data || []).map((s) => sanitizePersistedSetor(s)).filter(Boolean);

  return { equipamentos, registros, tecnicos, setores, clientes };
}
