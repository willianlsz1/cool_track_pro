let deps = {
  getRouteEquipCtx: null,
  navigateEquipCtx: null,
};

export function configureSetorNavigation(nextDeps = {}) {
  deps = { ...deps, ...nextDeps };
}

/**
 * Navega para dentro de um setor (ou volta ao grid se id === null).
 * Preserva clienteId quando a navegação parte do contexto de cliente.
 */
export function setActiveSector(id) {
  const currentCtx = deps.getRouteEquipCtx();
  deps.navigateEquipCtx({
    sectorId: id ?? null,
    quickFilter: null,
    // Preserva contexto de cliente se houver. Quando id é null (back to grid),
    // mantemos clienteId pra voltar pra grade do cliente, não a global.
    clienteId: currentCtx.clienteId || null,
    clienteNome: currentCtx.clienteNome || null,
  });
}
