export function createStorageSyncState({
  parseDeletionQueue,
  saveDeletionQueue,
  markDirty,
  clearDirty,
  isDirty,
  clearDeletionQueue,
  syncStatusEvent,
}) {
  let syncRunning = false;
  let queuedState = null;
  let syncStatus = {
    state: 'idle',
    message: '',
    pendingOps: 0,
    updatedAt: new Date().toISOString(),
  };

  function getPendingOpsCount() {
    const queue = parseDeletionQueue();
    let count = queue.equipamentos.length + queue.registros.length + queue.setores.length;
    if (isDirty()) count += 1;
    if (queuedState) count += 1;
    return count;
  }

  function emitSyncStatus() {
    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
    window.dispatchEvent(new CustomEvent(syncStatusEvent, { detail: { ...syncStatus } }));
  }

  function updateSyncStatus(patch = {}) {
    syncStatus = {
      ...syncStatus,
      ...patch,
      pendingOps: getPendingOpsCount(),
      updatedAt: new Date().toISOString(),
    };
    emitSyncStatus();
  }

  function queueDeletions({ equipamentos = [], registros = [], setores = [] } = {}) {
    const current = parseDeletionQueue();
    const next = {
      equipamentos: [...current.equipamentos, ...equipamentos.map(String).filter(Boolean)],
      registros: [...current.registros, ...registros.map(String).filter(Boolean)],
      setores: [...current.setores, ...setores.map(String).filter(Boolean)],
    };
    const saved = saveDeletionQueue(next);
    updateSyncStatus();
    return saved;
  }

  function clearSyncMetadata() {
    clearDirty();
    clearDeletionQueue();
    queuedState = null;
    updateSyncStatus({ state: 'idle', message: '' });
  }

  function hasPendingSync() {
    const queue = parseDeletionQueue();
    return Boolean(
      isDirty() ||
      queuedState ||
      queue.equipamentos.length ||
      queue.registros.length ||
      queue.setores.length ||
      syncRunning,
    );
  }

  function getSyncStatus() {
    return { ...syncStatus, pendingOps: getPendingOpsCount() };
  }

  return {
    clearDirty,
    clearSyncMetadata,
    getPendingOpsCount,
    getQueuedState: () => queuedState,
    getSyncStatus,
    hasPendingSync,
    isDirty,
    isSyncRunning: () => syncRunning,
    markDirty,
    parseDeletionQueue,
    queueDeletions,
    saveDeletionQueue,
    setQueuedState: (state) => {
      queuedState = state;
    },
    setSyncRunning: (running) => {
      syncRunning = Boolean(running);
    },
    updateSyncStatus,
  };
}
