import { validateRegistroPayload } from '../../core/inputValidation.js';
import { summarizeChecklist } from '../../domain/pmoc/checklistTemplates.js';
import { resolveRegistroContext } from '../composables/registroContext.js';
import {
  REGISTRO_ACTIONS,
  REGISTRO_MODES,
  REGISTRO_PROGRESS_FIELD_IDS,
  REGISTRO_PUBLIC_IDS,
} from './registroContracts.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function normalizeId(value) {
  const normalized = safeString(value).trim();
  return normalized || '';
}

function buildLookup(items) {
  return new Map(
    asArray(items)
      .filter((item) => item?.id)
      .map((item) => [safeString(item.id), item]),
  );
}

function normalizeValidationMessage(message) {
  return safeString(message)
    .replaceAll('Ã³', 'o')
    .replaceAll('Ã§', 'c')
    .replaceAll('Ã©', 'e')
    .replaceAll('Ã£', 'a')
    .replaceAll('Ã¡', 'a')
    .replaceAll('Ãª', 'e')
    .replaceAll('Ã­', 'i')
    .replaceAll('Ãº', 'u')
    .replaceAll('Ã‡', 'C');
}

function findById(items, id) {
  const normalized = normalizeId(id);
  if (!normalized) return null;
  return asArray(items).find((item) => normalizeId(item?.id) === normalized) || null;
}

function resolveEquipId({ form, params, registro }) {
  return normalizeId(form?.equipId || params?.equipId || registro?.equipId);
}

function resolveTipo({ tipo, tipoCustom }) {
  const base = safeString(tipo).trim();
  const custom = safeString(tipoCustom).trim();
  if (base === 'Outro' && custom) return `Outro - ${custom}`;
  return base;
}

function buildFormFromRegistro(registro) {
  if (!registro) return {};
  return {
    equipId: registro.equipId,
    data: registro.data,
    tipo: registro.tipo,
    tipoCustom: '',
    obs: registro.obs,
    tecnico: registro.tecnico,
    status: registro.status,
    prioridade: registro.prioridade,
    pecas: registro.pecas,
    proxima: registro.proxima,
    custoPecas: registro.custoPecas,
    custoMaoObra: registro.custoMaoObra,
    clienteNome: registro.clienteNome,
    clienteDocumento: registro.clienteDocumento,
    localAtendimento: registro.localAtendimento,
    clienteContato: registro.clienteContato,
  };
}

function formatEquipamentoLabel(equipamento) {
  if (!equipamento) return '';
  const nome = safeString(equipamento?.nome, 'Equipamento') || 'Equipamento';
  const tag = safeString(equipamento?.tag).trim();
  return tag ? `${nome} - TAG ${tag}` : nome;
}

function formatEquipamentoMeta(equipamento) {
  if (!equipamento) return '';
  return [equipamento?.tipo, equipamento?.local]
    .map((item) => safeString(item).trim())
    .filter(Boolean)
    .join(' · ');
}

function buildSelectedEquipamento(equipamento) {
  if (!equipamento) return null;
  return {
    id: normalizeId(equipamento.id),
    nome: safeString(equipamento.nome),
    tag: safeString(equipamento.tag),
    local: safeString(equipamento.local),
    tipo: safeString(equipamento.tipo),
    label: formatEquipamentoLabel(equipamento),
    meta: formatEquipamentoMeta(equipamento),
    clienteId: normalizeId(equipamento.clienteId ?? equipamento.cliente_id) || null,
    setorId: normalizeId(equipamento.setorId ?? equipamento.setor_id) || null,
  };
}

export function normalizeRegistroForm(form = {}) {
  const normalized = {
    equipId: normalizeId(form.equipId),
    data: safeString(form.data).trim(),
    tipo: safeString(form.tipo).trim(),
    tipoCustom: safeString(form.tipoCustom).trim(),
    obs: safeString(form.obs).trim(),
    tecnico: safeString(form.tecnico).trim(),
    status: safeString(form.status, 'ok').trim() || 'ok',
    prioridade: safeString(form.prioridade, 'media').trim() || 'media',
    pecas: safeString(form.pecas).trim(),
    proxima: safeString(form.proxima).trim(),
    custoPecas: safeString(form.custoPecas).trim(),
    custoMaoObra: safeString(form.custoMaoObra).trim(),
    clienteNome: safeString(form.clienteNome).trim(),
    clienteDocumento: safeString(form.clienteDocumento).trim(),
    localAtendimento: safeString(form.localAtendimento).trim(),
    clienteContato: safeString(form.clienteContato).trim(),
  };

  return {
    ...normalized,
    resolvedTipo: resolveTipo(normalized),
  };
}

export function getRegistroProgress(form = {}) {
  const normalized = normalizeRegistroForm(form);
  const requiredFields = [
    {
      id: REGISTRO_PUBLIC_IDS.equipSelect,
      label: 'Equipamento',
      filled: Boolean(normalized.equipId),
    },
    {
      id: REGISTRO_PUBLIC_IDS.dateInput,
      label: 'Data',
      filled: Boolean(normalized.data),
    },
    {
      id: REGISTRO_PUBLIC_IDS.typeSelect,
      label: 'Tipo',
      filled: Boolean(normalized.resolvedTipo),
    },
    {
      id: REGISTRO_PUBLIC_IDS.technicianInput,
      label: 'Tecnico',
      filled: Boolean(normalized.tecnico),
    },
    {
      id: REGISTRO_PUBLIC_IDS.obs,
      label: 'Observacoes',
      filled: normalized.obs.length >= 10,
    },
  ].filter((field) => REGISTRO_PROGRESS_FIELD_IDS.includes(field.id));

  const total = requiredFields.length;
  const filled = requiredFields.filter((field) => field.filled).length;
  const state = filled === 0 ? 'empty' : filled === total ? 'complete' : 'partial';

  return { total, filled, state, requiredFields };
}

export function validateRegistroFormModel({ form = {}, equipamentos = [] } = {}) {
  const normalized = normalizeRegistroForm(form);
  const errors = [];

  if (normalized.tipo === 'Outro' && !normalized.tipoCustom) {
    errors.push('Descreva o servico no campo Qual servico.');
  }

  const payloadValidation = validateRegistroPayload(
    {
      equipId: normalized.equipId,
      data: normalized.data,
      tipo: normalized.resolvedTipo,
      obs: normalized.obs,
      tecnico: normalized.tecnico,
      status: normalized.status,
      pecas: normalized.pecas,
      proxima: normalized.proxima,
      custoPecas: normalized.custoPecas,
      custoMaoObra: normalized.custoMaoObra,
      clienteNome: normalized.clienteNome,
      clienteDocumento: normalized.clienteDocumento,
      localAtendimento: normalized.localAtendimento,
      clienteContato: normalized.clienteContato,
    },
    { existingEquipamentos: asArray(equipamentos) },
  );

  const allErrors = [
    ...errors,
    ...asArray(payloadValidation.errors).map((error) => normalizeValidationMessage(error)),
  ];

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    value: {
      ...payloadValidation.value,
      tipo: normalized.resolvedTipo,
    },
  };
}

function buildChecklistModel(checklist, form) {
  const summary = summarizeChecklist(checklist);
  const filled = summary.ok + summary.fail + summary.na;
  const tipo = safeString(form?.resolvedTipo || form?.tipo).toLowerCase();
  return {
    available: summary.total > 0,
    total: summary.total,
    filled,
    hasMarks: filled > 0,
    ok: summary.ok,
    fail: summary.fail,
    na: summary.na,
    pending: summary.pending,
    recommended: tipo.includes('preventiva'),
  };
}

function buildActions() {
  return {
    save: { action: REGISTRO_ACTIONS.save },
    saveAndShare: { action: REGISTRO_ACTIONS.saveAndShare },
    clear: { action: REGISTRO_ACTIONS.clear },
    quickTemplate: { action: REGISTRO_ACTIONS.quickTemplate },
    checklistSet: { action: REGISTRO_ACTIONS.checklistSet },
    checklistMeasure: { action: REGISTRO_ACTIONS.checklistMeasure },
    checklistObs: { action: REGISTRO_ACTIONS.checklistObs },
  };
}

export function buildRegistroViewModel({
  state = {},
  params = {},
  form = {},
  editingId = '',
  checklist = null,
  isPlusOrHigher = false,
} = {}) {
  const equipamentos = asArray(state.equipamentos);
  const registros = asArray(state.registros);
  const normalizedEditingId = normalizeId(editingId || params?.editRegistroId);
  const editingRegistro = findById(registros, normalizedEditingId);
  const mergedForm = {
    ...buildFormFromRegistro(editingRegistro),
    ...form,
  };
  const formWithEquip = {
    ...mergedForm,
    equipId: resolveEquipId({ form: mergedForm, params, registro: editingRegistro }),
  };
  const normalizedForm = normalizeRegistroForm(formWithEquip);
  const equipamentosById = buildLookup(equipamentos);
  const selectedEquipamento = buildSelectedEquipamento(
    equipamentosById.get(normalizedForm.equipId),
  );
  const context = resolveRegistroContext(
    {
      ...params,
      equipId: normalizedForm.equipId || params?.equipId || null,
    },
    state,
  );
  const progress = getRegistroProgress(normalizedForm);
  const validation = validateRegistroFormModel({ form: normalizedForm, equipamentos });
  const sourceChecklist = checklist || editingRegistro?.checklist || null;

  return {
    mode: editingRegistro ? REGISTRO_MODES.edit : REGISTRO_MODES.create,
    editingId: editingRegistro ? normalizeId(editingRegistro.id) : '',
    form: normalizedForm,
    selectedEquipamento,
    context,
    progress,
    validation,
    checklist: buildChecklistModel(sourceChecklist, normalizedForm),
    signature: {
      available: Boolean(isPlusOrHigher),
    },
    actions: buildActions(),
  };
}
