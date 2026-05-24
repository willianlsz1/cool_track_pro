import { normalizePhotoList } from '../photoStorage.js';
import {
  normalizeCriticidade,
  normalizePrioridadeOperacional,
  normalizePeriodicidadePreventivaDias,
} from '../maintenanceNormalization.js';
import { sanitizePersistedEquipamento, sanitizePersistedRegistro } from '../inputValidation.js';

export function normalizeEquip(e) {
  if (!e || typeof e !== 'object') return null;
  if (!e.id) return null;

  const sanitized = sanitizePersistedEquipamento({
    nome: e.nome,
    local: e.local,
    tag: e.tag,
    modelo: e.modelo,
  });
  if (!sanitized) return null;

  const setorIdRaw = e.setorId ?? e.setor_id ?? null;
  const setorId = setorIdRaw ? String(setorIdRaw) : null;
  const clienteIdRaw = e.clienteId ?? e.cliente_id ?? null;
  const clienteId = clienteIdRaw ? String(clienteIdRaw) : null;

  return {
    id: String(e.id),
    nome: sanitized.nome,
    local: sanitized.local,
    status: ['ok', 'warn', 'danger'].includes(e.status) ? e.status : 'ok',
    tag: sanitized.tag,
    tipo: String(e.tipo || 'Outro'),
    componente: e.componente ? String(e.componente) : null,
    modelo: sanitized.modelo,
    fluido: String(e.fluido || ''),
    criticidade: normalizeCriticidade(e.criticidade),
    prioridadeOperacional: normalizePrioridadeOperacional(e.prioridadeOperacional || e.prioridade),
    periodicidadePreventivaDias: normalizePeriodicidadePreventivaDias(
      e.periodicidadePreventivaDias,
      e.tipo,
      e.criticidade,
    ),
    setorId,
    clienteId,
    fotos: normalizePhotoList(e.fotos),
  };
}

export function mapEquipamentoRow(equipamento, userId, { legacy = false } = {}) {
  const row = {
    id: equipamento.id,
    user_id: userId,
    nome: equipamento.nome,
    local: equipamento.local,
    status: equipamento.status,
    tag: equipamento.tag,
    tipo: equipamento.tipo,
    componente: equipamento.componente || null,
    modelo: equipamento.modelo,
    fluido: equipamento.fluido,
    setor_id: equipamento.setorId ?? null,
  };
  if (legacy) return row;
  return {
    ...row,
    criticidade: normalizeCriticidade(equipamento.criticidade),
    prioridade_operacional: normalizePrioridadeOperacional(equipamento.prioridadeOperacional),
    periodicidade_preventiva_dias: normalizePeriodicidadePreventivaDias(
      equipamento.periodicidadePreventivaDias,
      equipamento.tipo,
      equipamento.criticidade,
    ),
    fotos: normalizePhotoList(equipamento.fotos),
    cliente_id: equipamento.clienteId ?? null,
  };
}

export function normalizeRegistro(r, equipamentoIds) {
  if (!r || typeof r !== 'object') return null;
  if (!r.id || !r.equipId || !equipamentoIds.has(String(r.equipId))) return null;

  const sanitized = sanitizePersistedRegistro(
    {
      equipId: String(r.equipId),
      data: r.data,
      tipo: r.tipo,
      obs: r.obs,
      status: r.status,
      pecas: r.pecas,
      proxima: r.proxima,
      tecnico: r.tecnico,
      custoPecas: r.custoPecas,
      custoMaoObra: r.custoMaoObra,
    },
    {
      existingEquipamentos: [{ id: String(r.equipId) }],
    },
  );
  if (!sanitized) return null;

  return {
    id: String(r.id),
    equipId: sanitized.equipId,
    data: sanitized.data,
    tipo: sanitized.tipo,
    componente: sanitized.componente || null,
    obs: sanitized.obs,
    status: sanitized.status,
    pecas: sanitized.pecas,
    proxima: sanitized.proxima,
    fotos: normalizePhotoList(r.fotos),
    tecnico: sanitized.tecnico,
    custoPecas: sanitized.custoPecas,
    custoMaoObra: sanitized.custoMaoObra,
    checklist: r.checklist && typeof r.checklist === 'object' ? r.checklist : null,
  };
}

export function sanitizePersistedCliente(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const id = String(payload.id || '').trim();
  const nome = String(payload.nome || '').trim();
  if (!id || !nome) return null;
  return {
    id,
    nome,
    razaoSocial: payload.razaoSocial ? String(payload.razaoSocial).trim() : '',
    cnpj: payload.cnpj ? String(payload.cnpj).trim() : '',
    inscricaoEstadual: payload.inscricaoEstadual ? String(payload.inscricaoEstadual).trim() : '',
    inscricaoMunicipal: payload.inscricaoMunicipal ? String(payload.inscricaoMunicipal).trim() : '',
    endereco: payload.endereco ? String(payload.endereco).trim() : '',
    contato: payload.contato ? String(payload.contato).trim() : '',
    urlChamados: payload.urlChamados ? String(payload.urlChamados).trim() : '',
    finalidade: payload.finalidade ? String(payload.finalidade).trim() : '',
    observacoes: payload.observacoes ? String(payload.observacoes).trim() : '',
  };
}

export function mapClienteRow(cliente, userId) {
  return {
    id: cliente.id,
    user_id: userId,
    nome: cliente.nome,
    razao_social: cliente.razaoSocial || null,
    cnpj: cliente.cnpj || null,
    inscricao_estadual: cliente.inscricaoEstadual || null,
    inscricao_municipal: cliente.inscricaoMunicipal || null,
    endereco: cliente.endereco || null,
    contato: cliente.contato || null,
    url_chamados: cliente.urlChamados || null,
    finalidade: cliente.finalidade || null,
    observacoes: cliente.observacoes || null,
  };
}
