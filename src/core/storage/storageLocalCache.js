export function getCacheOwner({ storage, cacheOwnerKey }) {
  return storage.getItem(cacheOwnerKey);
}

export function setCacheOwner({ storage, cacheOwnerKey, userId }) {
  if (!userId) return;
  storage.setItem(cacheOwnerKey, String(userId));
}

export function markDirty({ storage, dirtyKey }) {
  storage.setItem(dirtyKey, '1');
}

export function clearDirty({ storage, dirtyKey }) {
  storage.removeItem(dirtyKey);
}

export function isDirty({ storage, dirtyKey }) {
  return storage.getItem(dirtyKey) === '1';
}

export function parseDeletionQueue({ storage, deletionsKey }) {
  try {
    const raw = storage.getItem(deletionsKey);
    if (!raw) return { equipamentos: [], registros: [], setores: [] };
    const parsed = JSON.parse(raw);
    const equipamentos = Array.isArray(parsed?.equipamentos)
      ? [...new Set(parsed.equipamentos.map(String).filter(Boolean))]
      : [];
    const registros = Array.isArray(parsed?.registros)
      ? [...new Set(parsed.registros.map(String).filter(Boolean))]
      : [];
    const setores = Array.isArray(parsed?.setores)
      ? [...new Set(parsed.setores.map(String).filter(Boolean))]
      : [];
    return { equipamentos, registros, setores };
  } catch (_error) {
    return { equipamentos: [], registros: [], setores: [] };
  }
}

export function saveDeletionQueue({ storage, deletionsKey, queue }) {
  const sanitized = {
    equipamentos: [...new Set((queue?.equipamentos || []).map(String).filter(Boolean))],
    registros: [...new Set((queue?.registros || []).map(String).filter(Boolean))],
    setores: [...new Set((queue?.setores || []).map(String).filter(Boolean))],
  };
  if (!sanitized.equipamentos.length && !sanitized.registros.length && !sanitized.setores.length) {
    storage.removeItem(deletionsKey);
    return sanitized;
  }
  storage.setItem(deletionsKey, JSON.stringify(sanitized));
  return sanitized;
}

export function readLocalSnapshot({
  storage,
  storageKey,
  normalizeEquip,
  normalizeRegistro,
  sanitizePersistedSetor,
  sanitizePersistedCliente,
  onError,
}) {
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const setores = (Array.isArray(parsed.setores) ? parsed.setores : [])
      .map(sanitizePersistedSetor)
      .filter(Boolean);
    const clientes = (Array.isArray(parsed.clientes) ? parsed.clientes : [])
      .map(sanitizePersistedCliente)
      .filter(Boolean);
    const setorIds = new Set(setores.map((s) => s.id));
    const equipamentos = (Array.isArray(parsed.equipamentos) ? parsed.equipamentos : [])
      .map(normalizeEquip)
      .filter(Boolean)
      .map((e) => ({
        ...e,
        setorId: e.setorId && setorIds.has(e.setorId) ? e.setorId : null,
      }));
    const equipIds = new Set(equipamentos.map((e) => e.id));
    const registros = (Array.isArray(parsed.registros) ? parsed.registros : [])
      .map((r) => normalizeRegistro(r, equipIds))
      .filter(Boolean);
    const tecnicos = Array.isArray(parsed.tecnicos)
      ? [
          ...new Set(parsed.tecnicos.filter((t) => typeof t === 'string').map((t) => t.trim())),
        ].filter(Boolean)
      : [];
    return { equipamentos, registros, tecnicos, setores, clientes };
  } catch (error) {
    if (typeof onError === 'function') onError(error);
    return null;
  }
}

export function writeLocalSnapshot({ storage, storageKey, state }) {
  storage.setItem(storageKey, JSON.stringify(state));
}
