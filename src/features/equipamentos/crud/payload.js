export function buildSaveEquipPayload({
  formValues,
  payloadValidation,
  dadosPlaca,
  editingId,
  createId,
  findEquip,
  normalizePhotoList,
  getValue,
  tiposComComponente,
}) {
  // ── Fotos do equipamento ─────────────────────────────────────────────────
  // V4: upload de fotos saiu desse fluxo. Criação/edição de dados só lida
  // com os campos textuais; fotos são gerenciadas via detail view →
  // modal-eq-photos. Em edit mode, preservamos as fotos já persistidas
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
    fluido: getValue('eq-fluido'),
    componente: tiposComComponente.has(formValues.tipo) ? getValue('eq-componente') || null : null,
    dadosPlaca,
  };
}
