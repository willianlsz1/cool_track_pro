export function findHistoricoDeletedRegistro(registros, id) {
  return registros.find((r) => r.id === id);
}

export function buildHistoricoRegistrosAfterDelete(registros, id) {
  return registros.filter((r) => r.id !== id);
}

export function findHistoricoLastRegistroForEquipment(registros, equipId) {
  const remainingEqRegs = registros
    .filter((r) => r.equipId === equipId)
    .sort((a, b) => b.data.localeCompare(a.data));
  return remainingEqRegs[0] || null;
}

export function buildHistoricoEquipmentAfterDelete(eq, last, { getOperationalStatus, daysDiff }) {
  const nextStatus = getOperationalStatus({
    status: last?.status || '',
    lastStatus: last?.status || '',
    daysToNext: last?.proxima ? daysDiff(last.proxima.slice(0, 10)) : null,
    ultimoRegistro: last,
  });
  return {
    ...eq,
    status: nextStatus.uiStatus === 'unknown' ? eq.status || 'ok' : nextStatus.uiStatus,
    statusDescricao: nextStatus.label,
  };
}

export function recalculateHistoricoEquipamentosAfterDelete(
  equipamentos,
  registros,
  deletedRegistro,
  deps,
) {
  const last = findHistoricoLastRegistroForEquipment(registros, deletedRegistro.equipId);
  return equipamentos.map((eq) => {
    if (eq.id !== deletedRegistro.equipId) return eq;
    return buildHistoricoEquipmentAfterDelete(eq, last, deps);
  });
}

export function buildHistoricoDeleteStateMutation(prev, id, deps) {
  const reg = findHistoricoDeletedRegistro(prev.registros, id);
  const regs = buildHistoricoRegistrosAfterDelete(prev.registros, id);
  if (!reg) return { ...prev, registros: regs };
  const equips = recalculateHistoricoEquipamentosAfterDelete(prev.equipamentos, regs, reg, deps);
  return { ...prev, registros: regs, equipamentos: equips };
}
