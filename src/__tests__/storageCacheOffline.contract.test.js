import { beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEY } from '../core/utils.js';
import {
  clearDirty,
  getCacheOwner,
  isDirty,
  markDirty,
  parseDeletionQueue,
  saveDeletionQueue,
  setCacheOwner,
} from '../core/storage/storageLocalCache.js';
import { normalizePhotoEntry } from '../core/photoStorage.js';
import {
  enqueuePendingSignature,
  listPendingSignatures,
  normalizeSignatureEntry,
} from '../core/signatureStorage.js';

const DIRTY_KEY = 'cooltrack-sync-dirty-v1';
const DELETIONS_KEY = 'cooltrack-sync-deletions-v1';
const CACHE_OWNER_KEY = 'cooltrack-cache-owner-v1';
const SIGNATURE_QUEUE_KEY = 'cooltrack-sig-pending-upload';

const VALID_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function createSupabaseMock({
  userId = 'user-1',
  failSelect = false,
  failDelete = false,
  selectData = {},
} = {}) {
  const upsert = vi.fn().mockResolvedValue({ data: null, error: null });
  const deleteIn = vi.fn(async () => {
    if (failDelete) return { data: null, error: { message: 'delete failed' } };
    return { data: null, error: null };
  });

  const from = vi.fn((table) => ({
    upsert,
    select: vi.fn(() => ({
      eq: vi.fn(async () => {
        if (failSelect) throw new Error(`select failed: ${table}`);
        return { data: selectData[table] ?? [], error: null };
      }),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        in: deleteIn,
      })),
    })),
  }));

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }),
    },
    from,
    upsert,
    deleteIn,
  };
}

async function loadStorageWithSupabase(options = {}) {
  vi.resetModules();
  const supabaseMock = createSupabaseMock(options);
  const toastMock = {
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  };

  vi.doMock('../core/supabase.js', () => ({ supabase: supabaseMock }));
  vi.doMock('../core/toast.js', () => ({ Toast: toastMock }));

  const { Storage } = await import('../core/storage.js');
  return { Storage, supabaseMock, toastMock };
}

async function loadPlanCache() {
  vi.resetModules();
  const trackEvent = vi.fn();
  vi.doMock('../core/telemetry.js', () => ({ trackEvent }));
  const userStorage = await import('../core/userStorage.js');
  const planCache = await import('../core/plans/planCache.js');
  return { ...planCache, ...userStorage, trackEvent };
}

function sampleState() {
  return {
    equipamentos: [
      {
        id: 'eq-1',
        nome: 'Split',
        local: 'Sala',
        status: 'ok',
        tag: '',
        tipo: 'Outro',
        modelo: '',
        fluido: '',
      },
    ],
    registros: [
      {
        id: 'reg-1',
        equipId: 'eq-1',
        data: '2026-05-09T10:00',
        tipo: 'Preventiva',
        status: 'ok',
        fotos: [],
        assinatura: null,
      },
    ],
    tecnicos: ['Ana'],
    clientes: [],
    setores: [],
  };
}

describe('storage/cache/offline cross-area contract', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('preserva nomes e shape das chaves locais criticas com fallback para JSON invalido', () => {
    expect(STORAGE_KEY).toBe('cooltrack_v3');

    markDirty({ storage: localStorage, dirtyKey: DIRTY_KEY });
    setCacheOwner({ storage: localStorage, cacheOwnerKey: CACHE_OWNER_KEY, userId: 'user-1' });
    saveDeletionQueue({
      storage: localStorage,
      deletionsKey: DELETIONS_KEY,
      queue: {
        equipamentos: ['eq-1', 'eq-1', ''],
        registros: ['reg-1', 12, ''],
        setores: ['setor-1', 'setor-1'],
      },
    });

    expect(localStorage.getItem(DIRTY_KEY)).toBe('1');
    expect(getCacheOwner({ storage: localStorage, cacheOwnerKey: CACHE_OWNER_KEY })).toBe('user-1');
    expect(parseDeletionQueue({ storage: localStorage, deletionsKey: DELETIONS_KEY })).toEqual({
      equipamentos: ['eq-1'],
      registros: ['reg-1', '12'],
      setores: ['setor-1'],
    });

    localStorage.setItem(DELETIONS_KEY, '{invalid-json');
    expect(parseDeletionQueue({ storage: localStorage, deletionsKey: DELETIONS_KEY })).toEqual({
      equipamentos: [],
      registros: [],
      setores: [],
    });

    clearDirty({ storage: localStorage, dirtyKey: DIRTY_KEY });
    expect(isDirty({ storage: localStorage, dirtyKey: DIRTY_KEY })).toBe(false);
  });

  it('mantem snapshot local valido quando o remoto fica indisponivel para o mesmo owner', async () => {
    const localSnapshot = sampleState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localSnapshot));
    localStorage.setItem(CACHE_OWNER_KEY, 'user-1');

    const { Storage } = await loadStorageWithSupabase({ userId: 'user-1', failSelect: true });

    const loaded = await Storage.loadFromSupabase();

    expect(loaded).toMatchObject({
      equipamentos: [expect.objectContaining({ id: 'eq-1', nome: 'Split' })],
      registros: [expect.objectContaining({ id: 'reg-1', equipId: 'eq-1' })],
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).equipamentos[0].id).toBe('eq-1');
    expect(Storage.getSyncStatus()).toMatchObject({ state: 'pending' });
  });

  it('nao vaza cache local de outro owner quando o remoto fica indisponivel', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleState()));
    localStorage.setItem(CACHE_OWNER_KEY, 'user-old');
    localStorage.setItem(DIRTY_KEY, '1');
    localStorage.setItem(
      DELETIONS_KEY,
      JSON.stringify({ equipamentos: ['eq-old'], registros: ['reg-old'], setores: [] }),
    );

    const { Storage } = await loadStorageWithSupabase({ userId: 'user-new', failSelect: true });

    await expect(Storage.loadFromSupabase()).resolves.toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(localStorage.getItem(DIRTY_KEY)).toBeNull();
    expect(localStorage.getItem(DELETIONS_KEY)).toBeNull();
    expect(Storage.getSyncStatus()).toMatchObject({ state: 'pending', pendingOps: 0 });
  });

  it('preserva tombstones e pending sync quando o drain remoto falha', async () => {
    const { Storage } = await loadStorageWithSupabase({ userId: 'user-1', failDelete: true });

    Storage.markRegistroDeleted('reg-1');
    Storage.markEquipDeleted('eq-1', ['reg-2']);
    const synced = await Storage._syncToSupabase(sampleState(), {
      silent: true,
      context: 'storageCacheOffline.contract',
    });

    expect(synced).toBe(false);
    expect(JSON.parse(localStorage.getItem(DELETIONS_KEY))).toEqual({
      equipamentos: ['eq-1'],
      registros: ['reg-1', 'reg-2'],
      setores: [],
    });
    expect(localStorage.getItem(DIRTY_KEY)).toBe('1');
    expect(Storage.hasPendingSync()).toBe(true);
    expect(Storage.getSyncStatus()).toMatchObject({
      state: 'pending',
      errorKind: 'server',
    });
  });

  it('trava shapes de fotos pendentes, assinatura legacy/pendente e cache de plano escopado', async () => {
    expect(
      normalizePhotoEntry({
        pending: true,
        queueKey: 'photo:reg-1:0',
        recordId: 'reg-1',
        index: 0,
      }),
    ).toEqual({
      pending: true,
      queueKey: 'photo:reg-1:0',
      recordId: 'reg-1',
      index: 0,
    });

    expect(normalizeSignatureEntry(VALID_DATA_URL)).toEqual({
      version: 1,
      legacy: true,
      dataUrl: VALID_DATA_URL,
    });
    enqueuePendingSignature('reg-1', VALID_DATA_URL);
    expect(localStorage.getItem(SIGNATURE_QUEUE_KEY)).toContain('reg-1');
    expect(listPendingSignatures()).toEqual([
      expect.objectContaining({
        registroId: 'reg-1',
        dataUrl: VALID_DATA_URL,
      }),
    ]);

    const { setCurrentUser, setCachedPlan, getCachedPlan, hasHydratedPlanInSession, trackEvent } =
      await loadPlanCache();

    setCurrentUser('user-a');
    expect(getCachedPlan()).toBe('free');

    setCachedPlan('pro');

    expect(localStorage.getItem('cooltrack-cached-plan')).toBeNull();
    expect(localStorage.getItem('ct:user-a:cooltrack-cached-plan')).toBeNull();
    expect(getCachedPlan()).toBe('free');
    expect(hasHydratedPlanInSession()).toBe(true);
    expect(trackEvent).not.toHaveBeenCalled();

    setCurrentUser('user-b');
    expect(getCachedPlan()).toBe('free');

    setCachedPlan('plus');
    expect(localStorage.getItem('ct:user-b:cooltrack-cached-plan')).toBeNull();
    expect(getCachedPlan()).toBe('free');

    setCurrentUser('user-a');
    expect(getCachedPlan()).toBe('free');
  });
});
