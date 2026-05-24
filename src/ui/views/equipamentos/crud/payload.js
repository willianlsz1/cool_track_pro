export function collectSaveEquipBaseFormValues({ getValue }) {
  return {
    tipo: getValue('eq-tipo'),
    criticidade: getValue('eq-criticidade') || 'media',
    prioridadeOperacional: getValue('eq-prioridade') || 'normal',
  };
}

export function collectSaveEquipContextFormValues({
  baseFormValues,
  saveWithoutClient,
  getValue,
  getForcedEquipContext,
  normalizePeriodicidadePreventivaDias,
}) {
  const periodicidadePreventivaDias = normalizePeriodicidadePreventivaDias(
    getValue('eq-periodicidade'),
    baseFormValues.tipo,
    baseFormValues.criticidade,
  );
  const setorId = getForcedEquipContext?.()?.setorId || getValue('eq-setor') || null;
  // PMOC Fase 2: vínculo opcional. Vazio → null (equipamento próprio/demo).
  const clienteId = saveWithoutClient
    ? null
    : getForcedEquipContext?.()?.clienteId || getValue('eq-cliente') || null;

  return {
    ...baseFormValues,
    periodicidadePreventivaDias,
    setorId,
    clienteId,
  };
}

export function collectSaveEquipExtraFormValues({ getValue }) {
  return {
    fluido: getValue('eq-fluido'),
    componente: getValue('eq-componente'),
  };
}

export function buildSaveEquipPayload({
  formValues,
  payloadValidation,
  dadosPlaca,
  editingId,
  createId,
  findEquip,
  normalizePhotoList,
  tiposComComponente,
}) {
  // ── Fotos do equipamento ─────────────────────────────────────────────────
  // V4: upload de fotos saiu desse fluxo. Criação/edição de dados só lida
  // com os campos textuais; fotos são gerenciadas via detail view →
  // fluxo dedicado futuro. Em edit mode, preservamos as fotos já persistidas
  // (eq.fotos) pra não perdê-las ao salvar alterações de texto.
  const equipId = editingId || createId();
  const fotosPayload = editingId ? normalizePhotoList(findEquip(editingId)?.fotos || []) : [];

  return {
    equipId,
    fotosPayload,
    ...formValues,
    nome: payloadValidation.value.nome,
    local: payloadValidation.value.local,
    tag: payloadValidation.value.tag,
    modelo: payloadValidation.value.modelo,
    fluido: formValues.fluido,
    componente: tiposComComponente.has(formValues.tipo) ? formValues.componente || null : null,
    dadosPlaca,
  };
}
