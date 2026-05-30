/**
 * CoolTrack Pro - Storage v5.0
 * localStorage como cache + Supabase como fonte de verdade
 * Offline first: salva local imediatamente, sincroniza com Supabase em background
 */

import { STORAGE_KEY, Utils } from './utils.js';
import { Toast } from './toast.js';
import { supabase } from './supabase.js';
import { ErrorCodes, handleError } from './errors.js';
import { sanitizePersistedSetor } from './inputValidation.js';
import {
  normalizeEquip,
  normalizeRegistro,
  sanitizePersistedCliente,
} from './storage/storageNormalizers.js';
import {
  clearDirty,
  getCacheOwner,
  isDirty,
  markDirty,
  parseDeletionQueue,
  readLocalSnapshot,
  saveDeletionQueue,
  setCacheOwner,
  writeLocalSnapshot,
} from './storage/storageLocalCache.js';
import { createStorageSyncState } from './storage/storageSyncState.js';
import {
  flushPendingDeletionsRemote,
  pullFromSupabase,
  pushClientes,
  pushEquipamentos,
  pushRegistros,
  pushSetores,
  pushTecnicos,
} from './storage/storageRemoteSync.js';
import {
  STORAGE_CACHE_OWNER_KEY,
  STORAGE_SYNC_DELETIONS_KEY,
  STORAGE_SYNC_DIRTY_KEY,
  SYNC_STATUS_EVENT,
} from './storage/constants.js';

const STORAGE_WARN_BYTES = 4 * 1024 * 1024;
const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024;

function _getCacheOwner() {
  return getCacheOwner({ storage: localStorage, cacheOwnerKey: STORAGE_CACHE_OWNER_KEY });
}

function _setCacheOwner(userId) {
  setCacheOwner({ storage: localStorage, cacheOwnerKey: STORAGE_CACHE_OWNER_KEY, userId });
}

function _markDirty() {
  markDirty({ storage: localStorage, dirtyKey: STORAGE_SYNC_DIRTY_KEY });
}

function _clearDirty() {
  clearDirty({ storage: localStorage, dirtyKey: STORAGE_SYNC_DIRTY_KEY });
}

function _isDirty() {
  return isDirty({ storage: localStorage, dirtyKey: STORAGE_SYNC_DIRTY_KEY });
}

function _parseDeletionQueue() {
  return parseDeletionQueue({ storage: localStorage, deletionsKey: STORAGE_SYNC_DELETIONS_KEY });
}

function _saveDeletionQueue(queue) {
  return saveDeletionQueue({
    storage: localStorage,
    deletionsKey: STORAGE_SYNC_DELETIONS_KEY,
    queue,
  });
}

const syncState = createStorageSyncState({
  parseDeletionQueue: _parseDeletionQueue,
  saveDeletionQueue: _saveDeletionQueue,
  markDirty: _markDirty,
  clearDirty: _clearDirty,
  isDirty: _isDirty,
  clearDeletionQueue: () => localStorage.removeItem(STORAGE_SYNC_DELETIONS_KEY),
  syncStatusEvent: SYNC_STATUS_EVENT,
});

async function getUserId() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch (error) {
    handleError(error, {
      code: ErrorCodes.AUTH_FAILED,
      message: 'Não foi possível identificar o usuário logado.',
      context: { action: 'storage.getUserId' },
      showToast: false,
    });
    return null;
  }
}

async function flushPendingDeletions(userId) {
  await flushPendingDeletionsRemote({
    userId,
    parseDeletionQueue: _parseDeletionQueue,
    saveDeletionQueue: _saveDeletionQueue,
  });
}

/* Migracao automatica localStorage -> Supabase */
async function migrateIfNeeded(userId) {
  const MIGRATED_KEY = `cooltrack-migrated-${userId}`;
  if (localStorage.getItem(MIGRATED_KEY)) return;

  const cacheOwner = _getCacheOwner();
  if (cacheOwner && cacheOwner !== userId) {
    localStorage.setItem(MIGRATED_KEY, '1');
    return;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(MIGRATED_KEY, '1');
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.equipamentos?.length) {
      localStorage.setItem(MIGRATED_KEY, '1');
      return;
    }

    Toast.info('Migrando seus dados para a nuvem...');
    await pushClientes(parsed.clientes || [], userId);
    // Setores primeiro para satisfazer FK
    await pushSetores(parsed.setores || [], userId);
    await pushEquipamentos(parsed.equipamentos, userId);
    await pushRegistros(parsed.registros || [], userId);
    await pushTecnicos(parsed.tecnicos || [], userId);
    localStorage.setItem(MIGRATED_KEY, '1');
    Toast.success('Dados migrados com sucesso.');
  } catch (_) {
    // falha silenciosa — tenta na próxima vez
  }
}

/* API publica */
export const Storage = {
  async loadFromSupabase() {
    const userId = await getUserId();
    if (!userId) return null;

    const cacheOwner = _getCacheOwner();
    const sameOwner = !cacheOwner || cacheOwner === userId;
    const localSnapshot = this._loadLocal();

    if (!sameOwner) {
      syncState.clearSyncMetadata();
    }

    if (sameOwner && localSnapshot && this.hasPendingSync()) {
      const synced = await this._syncToSupabase(localSnapshot, {
        silent: true,
        context: 'loadFromSupabase.pendingFlush',
      });
      if (!synced) {
        syncState.updateSyncStatus({
          state: 'pending',
          message: 'Sem conexão com a nuvem. Exibindo dados locais.',
        });
        return localSnapshot;
      }
    }

    try {
      await migrateIfNeeded(userId);
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.SYNC_FAILED,
        message: 'Falha ao preparar migração de dados.',
        context: { action: 'loadFromSupabase.migrate' },
      });
    }

    try {
      const state = await pullFromSupabase(userId);
      // Atualiza cache local
      writeLocalSnapshot({ storage: localStorage, storageKey: STORAGE_KEY, state });
      _setCacheOwner(userId);
      syncState.clearDirty();
      syncState.updateSyncStatus({ state: 'synced', message: 'Dados sincronizados.' });

      return state;
    } catch (err) {
      handleError(err, {
        code: ErrorCodes.SYNC_FAILED,
        severity: 'warning',
        message: 'Sincronização pendente. Seus dados estão salvos localmente.',
        context: { action: 'loadFromSupabase.pull' },
      });
      syncState.updateSyncStatus({
        state: 'pending',
        message: 'Sincronização pendente. Seus dados estão salvos localmente.',
      });
      return sameOwner ? localSnapshot : null;
    }
  },

  load(defaultState) {
    return this._loadLocal() || defaultState;
  },

  _loadLocal() {
    return readLocalSnapshot({
      storage: localStorage,
      storageKey: STORAGE_KEY,
      normalizeEquip,
      normalizeRegistro,
      sanitizePersistedSetor,
      sanitizePersistedCliente,
      onError: (err) => {
        handleError(err, {
          code: ErrorCodes.DATA_CORRUPT,
          message: 'Falha ao carregar dados locais.',
          context: { action: '_loadLocal' },
          showToast: false,
        });
      },
    });
  },

  save(state) {
    // 1. Salva local imediatamente (offline first)
    try {
      const serialized = JSON.stringify(state);
      const byteSize = serialized.length * 2;
      if (byteSize >= STORAGE_LIMIT_BYTES) {
        Toast.error(`Armazenamento cheio. Remova registros antigos com fotos.`);
        return false;
      }
      if (byteSize >= STORAGE_WARN_BYTES) {
        Toast.warning(`Uso de armazenamento elevado: ${Utils.formatBytes(byteSize)} / 5 MB.`);
      }
      writeLocalSnapshot({ storage: localStorage, storageKey: STORAGE_KEY, state });
      syncState.markDirty();
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.STORAGE_QUOTA,
        message: 'Falha ao salvar localmente.',
        context: { action: 'save' },
      });
      return false;
    }

    // 2. Sincroniza com Supabase em background (não bloqueia UI)
    this._scheduleSync(state);
    return true;
  },

  _scheduleSync(state) {
    syncState.setQueuedState(state);
    if (syncState.isSyncRunning()) {
      syncState.updateSyncStatus({ state: 'pending', message: 'Sincronização em fila.' });
      return;
    }
    syncState.setSyncRunning(true);
    syncState.updateSyncStatus({ state: 'syncing', message: 'Sincronizando alterações...' });
    void this._drainSyncQueue();
  },

  async _drainSyncQueue() {
    try {
      while (syncState.getQueuedState()) {
        const snapshot = syncState.getQueuedState();
        syncState.setQueuedState(null);
        const ok = await this._syncToSupabase(snapshot, {
          silent: false,
          context: 'storage._drainSyncQueue',
        });
        if (!ok) break;
      }
    } finally {
      syncState.setSyncRunning(false);
      if (!this.hasPendingSync()) {
        syncState.updateSyncStatus({ state: 'synced', message: 'Dados sincronizados.' });
      }
    }
  },

  async _syncToSupabase(state, { silent = false, context = '_syncToSupabase' } = {}) {
    const userId = await getUserId();
    if (!userId) {
      syncState.updateSyncStatus({
        state: 'pending',
        message: 'Faça login para sincronizar os dados.',
      });
      return false;
    }

    syncState.updateSyncStatus({ state: 'syncing', message: 'Sincronizando alterações...' });

    try {
      await flushPendingDeletions(userId);

      // IMPORTANTE: push setores ANTES de equipamentos para não violar FK.
      // (equipamentos.setor_id referencia setores.id)
      await pushClientes(state.clientes || [], userId);
      await pushSetores(state.setores || [], userId);
      await pushEquipamentos(state.equipamentos, userId);
      await pushRegistros(state.registros, userId);
      await pushTecnicos(state.tecnicos, userId);

      syncState.clearDirty();
      _setCacheOwner(userId);
      syncState.updateSyncStatus({ state: 'synced', message: 'Dados sincronizados.' });
      return true;
    } catch (err) {
      // Diferencia offline (sem rede) vs erro do servidor (rede ok mas
      // Supabase respondeu erro). O message do pill reflete a causa real
      // pra o user nao ficar confuso.
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      const errorMsg = String(err?.message || '').toLowerCase();
      const isNetworkErr =
        isOffline ||
        errorMsg.includes('network') ||
        errorMsg.includes('failed to fetch') ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('connection');

      const userMsg = isNetworkErr
        ? 'Sem conexão. Sincronização será retomada quando a rede voltar.'
        : 'Erro do servidor ao sincronizar. Tentaremos novamente.';

      handleError(err, {
        code: ErrorCodes.SYNC_FAILED,
        severity: 'warning',
        message: userMsg,
        context: { action: context, isOffline, isNetworkErr },
        showToast: !silent,
      });
      syncState.updateSyncStatus({
        state: 'pending',
        message: userMsg,
        // Adiciona errorKind pra UI poder estilizar diferente (icon vermelho
        // pra erro de servidor vs amarelo pra offline)
        errorKind: isNetworkErr ? 'offline' : 'server',
      });
      return false;
    }
  },

  markRegistroDeleted(id) {
    syncState.queueDeletions({ registros: [id] });
    syncState.markDirty();
  },

  markEquipDeleted(equipId, registroIds = []) {
    syncState.queueDeletions({ equipamentos: [equipId], registros: registroIds });
    syncState.markDirty();
  },

  markSetorDeleted(id) {
    syncState.queueDeletions({ setores: [id] });
    syncState.markDirty();
  },

  hasPendingSync() {
    return syncState.hasPendingSync();
  },

  /**
   * Tenta drenar a fila de sync agora. Util quando a conexao volta — o
   * listener de online status chama isso pra empurrar mutations que ficaram
   * pending offline. No-op se nao ha nada pendente OU se ja esta rodando.
   *
   * Retorna true se iniciou um drain, false caso contrario.
   */
  async flushPending() {
    if (syncState.isSyncRunning()) return false;
    if (!this.hasPendingSync()) return false;
    // Garante que ha um snapshot pra empurrar — se a fila estiver vazia,
    // re-enfileira o estado local atual (caso haja dirty mas sem queue).
    if (!syncState.getQueuedState()) {
      const local = this._loadLocal();
      if (local) syncState.setQueuedState(local);
    }
    syncState.setSyncRunning(true);
    syncState.updateSyncStatus({ state: 'syncing', message: 'Sincronizando alteracoes...' });
    void this._drainSyncQueue();
    return true;
  },

  getSyncStatus() {
    return syncState.getSyncStatus();
  },

  usage() {
    const used = Utils.getStorageBytes();
    return {
      used,
      total: STORAGE_LIMIT_BYTES,
      percent: Math.min(100, Math.round((used / STORAGE_LIMIT_BYTES) * 100)),
    };
  },
};
