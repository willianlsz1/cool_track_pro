export function normalizeHistoricoFilterCache(filters = {}) {
  return {
    busca: filters.busca || '',
    setor: filters.setor || '',
    equip: filters.equip || '',
  };
}

export function mergeHistoricoDomCacheFilters(domValues = {}, cachedValues = {}) {
  return {
    busca: domValues.busca ?? cachedValues.busca ?? '',
    setor: domValues.setor ?? cachedValues.setor ?? '',
    equip: domValues.equip ?? cachedValues.equip ?? '',
  };
}

export function parseHistoricoUrlFilters(searchParams, keys = {}) {
  if (!searchParams || typeof searchParams.get !== 'function') return {};

  try {
    return {
      busca: searchParams.get(keys.busca) || '',
      setor: searchParams.get(keys.setor) || '',
      equip: searchParams.get(keys.equip) || '',
      periodo: searchParams.get(keys.periodo) || '',
      tipo: searchParams.get(keys.tipo) || '',
    };
  } catch (_error) {
    return {};
  }
}

export function buildHistoricoCurrentFiltersFromValues({
  domCacheFilters = {},
  sessionFilters = {},
} = {}) {
  const busca = (domCacheFilters.busca || '').toLowerCase();
  const cacheFilters = normalizeHistoricoFilterCache({ ...domCacheFilters, busca });

  return {
    filters: {
      busca,
      filtEq: domCacheFilters.equip || '',
      filtSetor: domCacheFilters.setor || '',
      period: sessionFilters.period || 'tudo',
      tipo: sessionFilters.tipo || '',
    },
    cacheFilters,
  };
}
