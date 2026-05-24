function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildLookupById(items) {
  return new Map(asArray(items).map((item) => [item?.id, item]));
}

export function buildHistoricoRenderState(state = {}) {
  return {
    registros: asArray(state.registros),
    equipamentos: asArray(state.equipamentos),
    setores: asArray(state.setores),
    clientes: asArray(state.clientes),
  };
}

export function buildHistoricoRenderViewModel({
  registros,
  equipamentos,
  setores,
  clientes,
  filters,
  clienteFilter,
  isProMode,
  buildHistoricoViewModel,
}) {
  const historicoVm = buildHistoricoViewModel({
    registros,
    equipamentos,
    setores,
    clientes,
    filters: {
      busca: filters.busca,
      equipId: filters.equipId,
      setorId: filters.setorId,
      period: filters.period,
      tipo: filters.tipo,
    },
    clienteFilter,
    isPro: isProMode,
  });

  return { historicoVm, list: historicoVm.list };
}

export function buildHistoricoTimelineRenderContext({
  registros,
  equipamentos,
  setores,
  clientes,
  filters,
  isProMode,
  getTodaySummary,
  getAttentionItems,
}) {
  const setoresById = buildLookupById(setores);
  const clientesById = buildLookupById(clientes);
  const todaySummary = getTodaySummary(registros);
  const attentionItems = getAttentionItems({
    registros,
    equipamentos,
    clientes,
    setores,
    isPro: isProMode,
  });
  const hasFilters = Boolean(
    filters.busca ||
    filters.filtEq ||
    filters.filtSetor ||
    filters.period !== 'tudo' ||
    filters.tipo,
  );

  return { equipamentos, setoresById, clientesById, todaySummary, attentionItems, hasFilters };
}
