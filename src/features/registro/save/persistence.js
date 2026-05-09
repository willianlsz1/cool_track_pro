export function buildEditedRegistro(registro, persistedPayload, { currentChecklist } = {}) {
  const {
    equipId,
    data,
    tipo,
    tecnico,
    descricaoFinal,
    prioridade,
    status,
    pecas,
    proxima,
    custoPecas,
    custoMaoObra,
    clienteNome,
    clienteDocumento,
    localAtendimento,
    clienteContato,
  } = persistedPayload;

  return {
    ...registro,
    equipId,
    data,
    tipo,
    obs: descricaoFinal,
    tecnico,
    prioridade,
    status,
    pecas,
    proxima,
    custoPecas,
    custoMaoObra,
    clienteNome,
    clienteDocumento,
    localAtendimento,
    clienteContato,
    checklist: currentChecklist || registro.checklist || null,
  };
}

export function buildRegistroEditStateMutation(
  prev,
  editingId,
  persistedPayload,
  { getCurrentChecklist, reconcileEquipmentStatusesAfterRegistroEdit } = {},
) {
  const previousRegistro = prev.registros.find((r) => r.id === editingId) || null;
  const currentChecklist = getCurrentChecklist?.();
  const updatedRegistros = prev.registros.map((r) =>
    r.id === editingId ? buildEditedRegistro(r, persistedPayload, { currentChecklist }) : r,
  );

  const updatedRegistro = updatedRegistros.find((r) => r.id === editingId) || null;
  const updatedEquipamentos = reconcileEquipmentStatusesAfterRegistroEdit({
    equipamentos: prev.equipamentos,
    registros: updatedRegistros,
    previousRegistro,
    updatedRegistro,
  });

  return {
    ...prev,
    registros: updatedRegistros,
    equipamentos: updatedEquipamentos,
  };
}

export function resolveRegistroCreateId({ uid } = {}) {
  return uid();
}

export function buildRegistroCreateRecord({
  registroId,
  persistedPayload,
  photoPayload,
  assinaturaPayload,
  checklist,
}) {
  const {
    equipId,
    data,
    tipo,
    tecnico,
    descricaoFinal,
    prioridade,
    status,
    pecas,
    proxima,
    custoPecas,
    custoMaoObra,
    clienteNome,
    clienteDocumento,
    localAtendimento,
    clienteContato,
  } = persistedPayload;

  return {
    id: registroId,
    equipId,
    data,
    tipo,
    obs: descricaoFinal,
    status,
    pecas,
    proxima,
    ...photoPayload,
    tecnico,
    prioridade,
    custoPecas,
    custoMaoObra,
    clienteNome,
    clienteDocumento,
    localAtendimento,
    clienteContato,
    assinatura: assinaturaPayload,
    checklist,
  };
}

export function buildRegistroCreateStateMutation(
  prev,
  { registro, persistedPayload, operationalStatus },
) {
  const currentTecs = prev.tecnicos || [];
  const updatedTecs =
    persistedPayload.tecnico && !currentTecs.includes(persistedPayload.tecnico)
      ? [...currentTecs, persistedPayload.tecnico]
      : currentTecs;

  return {
    ...prev,
    tecnicos: updatedTecs,
    registros: [...prev.registros, registro],
    equipamentos: prev.equipamentos.map((e) => {
      if (e.id !== persistedPayload.equipId) return e;
      return {
        ...e,
        status:
          operationalStatus.uiStatus === 'unknown' ? e.status || 'ok' : operationalStatus.uiStatus,
        statusDescricao: operationalStatus.label,
      };
    }),
  };
}
