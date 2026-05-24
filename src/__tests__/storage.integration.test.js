import { STORAGE_KEY } from '../core/utils.js';

function createSupabaseMock({
  userId = 'user-1',
  selectData = {},
  failSelectTables = [],
  failDeleteTables = [],
} = {}) {
  const upsertByTable = {
    clientes: vi.fn().mockResolvedValue({ data: null, error: null }),
    setores: vi.fn().mockResolvedValue({ data: null, error: null }),
    equipamentos: vi.fn().mockResolvedValue({ data: null, error: null }),
    registros: vi.fn().mockResolvedValue({ data: null, error: null }),
    tecnicos: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
  const deleteByTable = {
    equipamentos: vi.fn().mockResolvedValue({ data: null, error: null }),
    registros: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  const from = vi.fn((table) => ({
    upsert: upsertByTable[table] ?? vi.fn().mockResolvedValue({ data: null, error: null }),
    select: vi.fn(() => ({
      eq: vi.fn(async () => {
        if (failSelectTables.includes(table)) throw new Error(`select failed: ${table}`);
        return { data: selectData[table] ?? [], error: null };
      }),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        in: vi.fn(async () => {
          if (failDeleteTables.includes(table)) {
            return { data: null, error: { message: `delete failed: ${table}` } };
          }
          const handler = deleteByTable[table];
          if (!handler) return { data: null, error: null };
          return handler();
        }),
      })),
    })),
  }));

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }),
    },
    from,
    upsertByTable,
    deleteByTable,
  };
}

async function loadStorageModule(options = {}) {
  vi.resetModules();

  const supabaseMock = createSupabaseMock(options.supabase);
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

function sampleState() {
  return {
    equipamentos: [
      {
        id: 'eq-1',
        nome: 'Split',
        local: 'UTI',
        status: 'ok',
        tag: '',
        tipo: 'Outro',
        modelo: '',
        fluido: '',
      },
    ],
    registros: [
      {
        id: 'r-1',
        equipId: 'eq-1',
        data: '2026-04-07T10:00',
        tipo: 'Manutenção',
        status: 'ok',
        pecas: '',
        proxima: '2026-04-20',
        fotos: [],
        tecnico: '',
      },
    ],
    tecnicos: ['Ana'],
    clientes: [{ id: 'c-1', nome: 'Cliente 1' }],
    setores: [{ id: 's-1', nome: 'Setor 1', cor: '#00c8e8', clienteId: 'c-1' }],
  };
}

describe('Storage integration (offline-first)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves to localStorage immediately and triggers background sync', async () => {
    const { Storage } = await loadStorageModule();
    const scheduleSpy = vi.spyOn(Storage, '_scheduleSync').mockImplementation(() => {});
    const state = sampleState();

    const ok = Storage.save(state);

    expect(ok).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(state);
    expect(scheduleSpy).toHaveBeenCalledWith(state);
  });

  it('normalizes loaded local data to expected schema', async () => {
    const { Storage } = await loadStorageModule();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        equipamentos: [{ id: 101, nome: 'Chiller', local: 'Bloco A', status: 'invalid' }],
        registros: [
          {
            id: 201,
            equipId: 101,
            data: '2026-04-01T08:00',
            tipo: 'Inspeção',
            status: 'bad',
            fotos: [1, 'ok'],
          },
        ],
        tecnicos: ['Carlos', 10],
      }),
    );

    const loaded = Storage.load(null);

    expect(loaded.equipamentos[0]).toMatchObject({
      id: '101',
      status: 'ok',
      tag: '',
      tipo: 'Outro',
    });
    expect(loaded.registros[0]).toMatchObject({
      id: '201',
      equipId: '101',
      status: 'ok',
      fotos: ['ok'],
    });
    expect(loaded.registros[0]).not.toHaveProperty('assinatura');
    expect(loaded.tecnicos).toEqual(['Carlos']);
  });

  it('drops orphan registros and invalid equipamentos while loading local cache', async () => {
    const { Storage } = await loadStorageModule();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        equipamentos: [
          { id: 'eq-1', nome: 'Split', local: 'UTI', status: 'ok' },
          { id: 'broken-1', nome: 'Sem local' },
        ],
        registros: [
          {
            id: 'r-1',
            equipId: 'eq-1',
            data: '2026-04-01T08:00',
            tipo: 'Preventiva',
            status: 'ok',
          },
          { id: 'r-2', equipId: 'missing-eq', data: '2026-04-01T08:00', tipo: 'Orfa' },
        ],
        tecnicos: ['Ana'],
      }),
    );

    const loaded = Storage._loadLocal();
    expect(loaded.equipamentos).toHaveLength(1);
    expect(loaded.equipamentos[0].id).toBe('eq-1');
    expect(loaded.registros).toHaveLength(1);
    expect(loaded.registros[0].id).toBe('r-1');
  });

  it('returns null when local cache json is corrupted', async () => {
    const { Storage } = await loadStorageModule();
    localStorage.setItem(STORAGE_KEY, '{invalid-json');

    expect(Storage._loadLocal()).toBeNull();
  });

  it('runs migration from local cache to Supabase and sets migrated marker', async () => {
    const { Storage, supabaseMock, toastMock } = await loadStorageModule({
      supabase: {
        userId: 'user-77',
        selectData: { equipamentos: [], registros: [], tecnicos: [] },
      },
    });

    const legacy = sampleState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

    await Storage.loadFromSupabase();

    expect(supabaseMock.upsertByTable.equipamentos).toHaveBeenCalled();
    expect(supabaseMock.upsertByTable.registros).toHaveBeenCalled();
    expect(supabaseMock.upsertByTable.tecnicos).toHaveBeenCalled();
    expect(supabaseMock.upsertByTable.clientes).toHaveBeenCalled();
    expect(localStorage.getItem('cooltrack-migrated-user-77')).toBe('1');
    expect(toastMock.info).toHaveBeenCalled();
    expect(toastMock.success).toHaveBeenCalled();
  });

  it('warns near storage quota and blocks writes at the 5MB limit', async () => {
    const { Storage, toastMock } = await loadStorageModule();
    const scheduleSpy = vi.spyOn(Storage, '_scheduleSync').mockImplementation(() => {});

    const warnState = { ...sampleState(), tecnicos: ['x'.repeat(2_100_000)] };
    expect(Storage.save(warnState)).toBe(true);
    expect(toastMock.warning).toHaveBeenCalled();

    const fullState = { ...sampleState(), tecnicos: ['x'.repeat(2_700_000)] };
    expect(Storage.save(fullState)).toBe(false);
    expect(toastMock.error).toHaveBeenCalled();
    expect(scheduleSpy).toHaveBeenCalledTimes(1);
  });

  it('resolves local/remote conflicts by preferring remote on successful loadFromSupabase', async () => {
    const local = sampleState();
    local.equipamentos[0].nome = 'LOCAL';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));

    const remoteEquip = [
      {
        id: 'eq-1',
        nome: 'REMOTE',
        local: 'UTI',
        status: 'warn',
        tag: '',
        tipo: 'Outro',
        modelo: '',
        fluido: '',
      },
    ];

    const { Storage } = await loadStorageModule({
      supabase: {
        userId: 'user-1',
        selectData: { equipamentos: remoteEquip, registros: [], tecnicos: [] },
      },
    });

    const result = await Storage.loadFromSupabase();

    expect(result.equipamentos[0].nome).toBe('REMOTE');
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(cached.equipamentos[0].nome).toBe('REMOTE');
  });

  it('falls back to local cache when remote read fails', async () => {
    const local = sampleState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));

    const { Storage, toastMock } = await loadStorageModule({
      supabase: {
        userId: 'user-1',
        failSelectTables: ['equipamentos'],
      },
    });

    const result = await Storage.loadFromSupabase();

    expect(result.equipamentos[0].id).toBe('eq-1');
    expect(toastMock.warning).toHaveBeenCalled();
  });

  it('syncs to Supabase in happy path and warns on errors', async () => {
    const { Storage, supabaseMock, toastMock } = await loadStorageModule();
    const state = sampleState();

    await Storage._syncToSupabase(state, { silent: false });
    expect(supabaseMock.upsertByTable.equipamentos).toHaveBeenCalled();
    expect(supabaseMock.upsertByTable.registros).toHaveBeenCalled();
    expect(supabaseMock.upsertByTable.tecnicos).toHaveBeenCalled();
    expect(supabaseMock.upsertByTable.clientes).toHaveBeenCalled();

    supabaseMock.upsertByTable.registros.mockRejectedValueOnce(new Error('sync err'));
    await Storage._syncToSupabase(state, { silent: false });
    expect(toastMock.warning).toHaveBeenCalled();
  });

  it('applies pending deletions before upsert and clears deletion queue on success', async () => {
    const { Storage, supabaseMock } = await loadStorageModule();
    Storage.markRegistroDeleted('reg-1');
    Storage.markEquipDeleted('eq-2', ['reg-2', 'reg-3']);

    const emptyState = { equipamentos: [], registros: [], tecnicos: [] };
    const ok = await Storage._syncToSupabase(emptyState, { silent: true });

    expect(ok).toBe(true);
    expect(supabaseMock.deleteByTable.registros).toHaveBeenCalled();
    expect(supabaseMock.deleteByTable.equipamentos).toHaveBeenCalled();
    expect(localStorage.getItem('cooltrack-sync-deletions-v1')).toBeNull();
  });

  it('ignores local dirty queue when cache owner is from another user account', async () => {
    const local = sampleState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
    localStorage.setItem('cooltrack-cache-owner-v1', 'old-user');
    localStorage.setItem('cooltrack-sync-dirty-v1', '1');
    localStorage.setItem(
      'cooltrack-sync-deletions-v1',
      JSON.stringify({ equipamentos: ['eq-old'], registros: ['reg-old'] }),
    );

    const remoteEquip = [
      {
        id: 'eq-r',
        nome: 'REMOTE',
        local: 'Nuvem',
        status: 'ok',
        tag: '',
        tipo: 'Outro',
        modelo: '',
        fluido: '',
      },
    ];

    const { Storage, supabaseMock } = await loadStorageModule({
      supabase: {
        userId: 'new-user',
        selectData: { equipamentos: remoteEquip, registros: [], tecnicos: [] },
      },
    });

    const result = await Storage.loadFromSupabase();

    expect(result.equipamentos[0].id).toBe('eq-r');
    expect(supabaseMock.upsertByTable.equipamentos).not.toHaveBeenCalled();
    expect(supabaseMock.upsertByTable.clientes).not.toHaveBeenCalled();
    expect(localStorage.getItem('cooltrack-sync-dirty-v1')).toBeNull();
    expect(localStorage.getItem('cooltrack-sync-deletions-v1')).toBeNull();
  });

  it('preserves offline temp IDs across cliente->setor->equipamento->registro sync chain', async () => {
    const { Storage, supabaseMock } = await loadStorageModule();

    const offlineState = {
      clientes: [{ id: 'tmp-c1', nome: 'Cliente Offline' }],
      setores: [{ id: 'tmp-s1', nome: 'Setor Offline', cor: '#00c8e8', clienteId: 'tmp-c1' }],
      equipamentos: [
        {
          id: 'tmp-e1',
          nome: 'Split 18k',
          local: 'Sala 1',
          status: 'ok',
          tag: 'EQ-001',
          tipo: 'Split',
          modelo: '',
          fluido: '',
          clienteId: 'tmp-c1',
          setorId: 'tmp-s1',
        },
      ],
      registros: [
        {
          id: 'tmp-r1',
          equipId: 'tmp-e1',
          data: '2026-04-28T08:00',
          tipo: 'Preventiva',
          status: 'ok',
          pecas: '',
          proxima: '2026-05-28',
          fotos: [],
          tecnico: 'Ana',
        },
      ],
      tecnicos: ['Ana'],
    };

    const ok = await Storage._syncToSupabase(offlineState, { silent: true });
    expect(ok).toBe(true);

    const clientesRows = supabaseMock.upsertByTable.clientes.mock.calls[0][0];
    const setoresRows = supabaseMock.upsertByTable.setores.mock.calls[0][0];
    const equipsRows = supabaseMock.upsertByTable.equipamentos.mock.calls[0][0];
    const regsRows = supabaseMock.upsertByTable.registros.mock.calls[0][0];

    expect(clientesRows[0].id).toBe('tmp-c1');
    expect(setoresRows[0]).toMatchObject({ id: 'tmp-s1', cliente_id: 'tmp-c1' });
    expect(equipsRows[0]).toMatchObject({ id: 'tmp-e1', cliente_id: 'tmp-c1', setor_id: 'tmp-s1' });
    expect(regsRows[0]).toMatchObject({ id: 'tmp-r1', equip_id: 'tmp-e1' });
  });
});
