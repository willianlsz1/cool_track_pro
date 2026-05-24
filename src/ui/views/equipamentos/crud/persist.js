export function updateSaveEquipInState({ setState, editingId, payload }) {
  setState((prev) => ({
    ...prev,
    equipamentos: prev.equipamentos.map((e) =>
      e.id === editingId
        ? {
            ...e,
            nome: payload.nome,
            local: payload.local,
            tag: payload.tag,
            tipo: payload.tipo,
            modelo: payload.modelo,
            fluido: payload.fluido,
            componente: payload.componente,
            criticidade: payload.criticidade,
            prioridadeOperacional: payload.prioridadeOperacional,
            periodicidadePreventivaDias: payload.periodicidadePreventivaDias,
            setorId: payload.setorId,
            clienteId: payload.clienteId,
            fotos: payload.fotosPayload,
            dadosPlaca: payload.dadosPlaca,
          }
        : e,
    ),
  }));
}

export function createSaveEquipInState({ setState, payload }) {
  setState((prev) => ({
    ...prev,
    equipamentos: [
      ...prev.equipamentos,
      {
        id: payload.equipId,
        nome: payload.nome,
        local: payload.local,
        status: 'ok',
        tag: payload.tag,
        tipo: payload.tipo,
        modelo: payload.modelo,
        fluido: payload.fluido,
        componente: payload.componente,
        criticidade: payload.criticidade,
        prioridadeOperacional: payload.prioridadeOperacional,
        periodicidadePreventivaDias: payload.periodicidadePreventivaDias,
        setorId: payload.setorId,
        clienteId: payload.clienteId,
        fotos: payload.fotosPayload,
        dadosPlaca: payload.dadosPlaca,
      },
    ],
  }));
}

export function applySaveEquipToState({
  setState,
  editingId,
  payload,
  updateMutation = updateSaveEquipInState,
  createMutation = createSaveEquipInState,
}) {
  if (editingId) {
    // ── UPDATE: atualiza equipamento existente ──────────────────────────────
    return updateMutation({ setState, editingId, payload });
  }

  // ── CREATE: novo equipamento ────────────────────────────────────────────
  return createMutation({ setState, payload });
}
