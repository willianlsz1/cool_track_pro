import { beforeEach, describe, expect, it, vi } from 'vitest';

const blobMem = new Map();

const mocks = vi.hoisted(() => ({
  getState: vi.fn(() => ({
    registros: [],
    equipamentos: [{ id: 'eq-1', status: 'ok' }],
    tecnicos: [],
  })),
  setState: vi.fn(),
  uploadPendingPhotos: vi.fn(),
  supabaseStorageUpload: vi.fn(),
  supabaseSignedUrl: vi.fn(),
  supabaseGetUser: vi.fn(),
  supabaseSelect: vi.fn(),
  supabaseUpdate: vi.fn(),
}));

vi.mock('../../core/blobQueue.js', () => ({
  enqueueBlob: vi.fn(async (key, blob, metadata = {}) => {
    blobMem.set(key, { key, blob, metadata });
  }),
  getBlobEntry: vi.fn(async (key) => blobMem.get(key) || null),
  removeBlob: vi.fn(async (key) => {
    blobMem.delete(key);
  }),
  listBlobs: vi.fn(async () => Array.from(blobMem.values())),
}));

vi.mock('../../core/photoStorage.js', async () => {
  const actual = await vi.importActual('../../core/photoStorage.js');
  return { ...actual, uploadPendingPhotos: mocks.uploadPendingPhotos };
});

vi.mock('../../core/supabase.js', () => ({
  supabase: {
    auth: { getUser: (...args) => mocks.supabaseGetUser(...args) },
    storage: {
      from: () => ({
        upload: (...args) => mocks.supabaseStorageUpload(...args),
        createSignedUrl: (...args) => mocks.supabaseSignedUrl(...args),
      }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: (...args) => mocks.supabaseSelect(...args) }) }),
      update: (patch) => ({ eq: (...args) => mocks.supabaseUpdate(patch, ...args) }),
    }),
  },
}));

vi.mock('../../core/utils.js', () => ({
  Utils: {
    getVal: vi.fn((id) => document.getElementById(id)?.value || ''),
    setVal: vi.fn(),
    clearVals: vi.fn(),
    nowDatetime: vi.fn(() => '2026-05-05T00:00'),
    getEl: vi.fn((id) => document.getElementById(id)),
    uid: vi.fn(() => 'reg-new'),
    escapeHtml: vi.fn((v) => String(v || '')),
  },
}));
vi.mock('../../core/state.js', () => ({
  getState: mocks.getState,
  setState: mocks.setState,
  findEquip: vi.fn(() => null),
  lastRegForEquip: vi.fn(() => null),
}));
vi.mock('../../core/router.js', () => ({
  goTo: vi.fn(),
  setRouteGuard: vi.fn(),
  clearRouteGuard: vi.fn(),
}));
vi.mock('../../core/toast.js', () => ({
  Toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('../../core/modal.js', () => ({ CustomConfirm: { show: vi.fn(async () => true) } }));
vi.mock('../../ui/components/photos.js', () => ({
  Photos: { pending: ['data:image/jpeg;base64,AAA', 'data:image/jpeg;base64,BBB'], clear: vi.fn() },
}));
vi.mock('../../features/profile.js', () => ({
  Profile: {
    getDefaultTecnico: vi.fn(() => ''),
    saveLastTecnico: vi.fn(),
    get: vi.fn(() => ({})),
    save: vi.fn(),
  },
}));
vi.mock('../../core/errors.js', () => ({ ErrorCodes: {}, handleError: vi.fn() }));
vi.mock('../../core/equipmentRules.js', () => ({
  getOperationalStatus: vi.fn(() => ({ uiStatus: 'ok', label: 'ok' })),
  validateOperationalPayload: vi.fn(() => ({ valid: true })),
}));
vi.mock('../../domain/registroStatus.js', () => ({
  reconcileEquipmentStatusesAfterRegistroEdit: vi.fn(({ equipamentos }) => equipamentos),
}));
vi.mock('../../core/telemetry.js', () => ({ trackEvent: vi.fn() }));
vi.mock('../../ui/components/skeleton.js', () => ({
  withSkeleton: vi.fn(async (_id, fn) => fn()),
}));
vi.mock('../../core/inputValidation.js', () => ({
  validateRegistroPayload: vi.fn(() => ({
    valid: true,
    value: {
      equipId: 'eq-1',
      data: '2026-05-05',
      tipo: 'Inspeção Geral',
      tecnico: 'Tec',
      obs: 'observação longa o suficiente',
      pecas: '',
      proxima: '',
      status: 'ok',
      custoPecas: 0,
      custoMaoObra: 0,
      clienteNome: '',
      clienteDocumento: '',
      localAtendimento: '',
      clienteContato: '',
    },
  })),
}));
vi.mock('../../core/plans/planCache.js', () => ({
  isCachedPlanPlusOrHigher: vi.fn(() => false),
  isCachedPlanPro: vi.fn(() => false),
}));
vi.mock('../../ui/components/postSaveRegistroToast.js', () => ({
  PostSaveRegistroToast: { show: vi.fn(() => false) },
}));
vi.mock('../../ui/controller/handlers/reportExportHandlers.js', () => ({
  exportPdfFlow: vi.fn(),
  shareWhatsAppFlow: vi.fn(),
}));
vi.mock('../../core/phoneMask.js', () => ({ bindSmartContactMaskInput: vi.fn() }));
vi.mock('../../ui/composables/registroContext.js', () => ({
  resolveRegistroContext: vi.fn(() => ({})),
}));
vi.mock('../../ui/helpers/registroPure.js', () => ({
  asArray: vi.fn((v) => (Array.isArray(v) ? v : [])),
  isPreventivaTipo: vi.fn(() => false),
}));
vi.mock('../../ui/viewModels/registroViewModel.js', () => ({
  buildRegistroViewModel: vi.fn(() => ({})),
}));
vi.mock('../../ui/viewModels/registroPhotosModel.js', () => ({
  isSafeRegistroPhotoSrc: vi.fn(() => true),
}));
vi.mock('../../ui/viewModels/registroSignatureModel.js', () => ({
  REGISTRO_SIGNATURE_ROOT_ID: 'registro-signature-root',
  isSafeRegistroSignatureSrc: vi.fn(() => true),
}));
vi.mock('../../domain/pmoc/checklistTemplates.js', () => ({
  getChecklistTemplate: vi.fn(() => null),
  buildEmptyChecklist: vi.fn(() => null),
  validateChecklist: vi.fn(() => ({ complete: true, missing: [] })),
  summarizeChecklist: vi.fn(() => ''),
}));

beforeEach(() => {
  vi.resetModules();
  blobMem.clear();
  localStorage.clear();
  document.body.innerHTML = `<div id="view-registro"><input id="r-equip" value="eq-1" /><input id="r-data" value="2026-05-05" /><input id="r-tipo" value="Inspeção Geral" /><input id="r-tipo-custom" value="" /><input id="r-obs" value="observação longa o suficiente" /><input id="r-tecnico" value="Tec" /><input id="r-status" value="ok" /><input id="r-prioridade" value="media" /><input id="r-pecas" value="" /><input id="r-proxima" value="" /><input id="r-custo-pecas" value="0" /><input id="r-custo-mao-obra" value="0" /><input id="r-cliente-nome" value="" /><input id="r-cliente-documento" value="" /><input id="r-local-atendimento" value="" /><input id="r-cliente-contato" value="" /><button data-action="save-registro"><span>Salvar serviço</span></button></div>`;
});

describe('regression: photo failure path', () => {
  it('cenário 1 — não persiste base64 no payload inteiro', async () => {
    let finalState;
    mocks.uploadPendingPhotos.mockResolvedValue({
      photos: [
        { pending: true, queueKey: 'photo-reg-new-0', recordId: 'reg-new', index: 0 },
        { pending: true, queueKey: 'photo-reg-new-1', recordId: 'reg-new', index: 1 },
      ],
      uploadedCount: 0,
      failedCount: 2,
    });
    mocks.setState.mockImplementation(
      (updater) =>
        (finalState = updater({
          registros: [],
          equipamentos: [{ id: 'eq-1', status: 'ok' }],
          tecnicos: [],
        })),
    );
    const { saveRegistro } = await import('../../ui/views/registro.js');
    await saveRegistro();
    expect(JSON.stringify(finalState.registros[0]).match(/data:image/)).toBeNull();
  });

  it('cenário 2 — queue contém entries após falha', async () => {
    const actualPhotoStorage = await vi.importActual('../../core/photoStorage.js');
    await actualPhotoStorage.enqueuePhotoForRetry(
      new Blob(['a'], { type: 'image/jpeg' }),
      'reg-new',
      0,
      { userId: 'user-1' },
    );
    await actualPhotoStorage.enqueuePhotoForRetry(
      new Blob(['b'], { type: 'image/jpeg' }),
      'reg-new',
      1,
      { userId: 'user-1' },
    );
    const pending = actualPhotoStorage.listPendingPhotos();
    expect(pending).toEqual([
      expect.objectContaining({
        queueKey: 'photo-user-1-reg-new-0',
        userId: 'user-1',
        recordId: 'reg-new',
        index: 0,
      }),
      expect.objectContaining({
        queueKey: 'photo-user-1-reg-new-1',
        userId: 'user-1',
        recordId: 'reg-new',
        index: 1,
      }),
    ]);
  });

  it('cenário 3 — payload contém fotos_pendentes e markers em fotos', async () => {
    let finalState;
    const markers = [
      { pending: true, queueKey: 'photo-reg-new-0', recordId: 'reg-new', index: 0 },
      { pending: true, queueKey: 'photo-reg-new-1', recordId: 'reg-new', index: 1 },
    ];
    mocks.uploadPendingPhotos.mockResolvedValue({
      photos: markers,
      uploadedCount: 0,
      failedCount: 2,
    });
    mocks.setState.mockImplementation(
      (updater) =>
        (finalState = updater({
          registros: [],
          equipamentos: [{ id: 'eq-1', status: 'ok' }],
          tecnicos: [],
        })),
    );
    const { saveRegistro } = await import('../../ui/views/registro.js');
    await saveRegistro();
    const saved = finalState.registros[0];
    expect(Array.isArray(saved.fotos_pendentes)).toBe(true);
    expect(saved.fotos_pendentes).toEqual(['photo-reg-new-0', 'photo-reg-new-1']);
    expect(saved.fotos).toEqual(markers);
  });

  it('cenário 4 — flush com sucesso reconcilia registro', async () => {
    const actualPhotoStorage = await vi.importActual('../../core/photoStorage.js');
    const marker = await actualPhotoStorage.enqueuePhotoForRetry(
      new Blob(['abc'], { type: 'image/jpeg' }),
      'reg-1',
      0,
      { userId: 'user-1' },
    );
    mocks.supabaseGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.supabaseStorageUpload.mockResolvedValue({ error: null });
    mocks.supabaseSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://cdn/ref-1' },
      error: null,
    });
    mocks.supabaseSelect.mockResolvedValue({
      data: { fotos: [marker], fotos_pendentes: [marker.queueKey] },
    });
    mocks.supabaseUpdate.mockResolvedValue({ error: null });

    await actualPhotoStorage.flushPendingPhotos();

    const patch = mocks.supabaseUpdate.mock.calls.at(-1)[0];
    expect(patch.fotos[0].pending).toBeUndefined();
    expect(patch.fotos[0].url).toBe('https://cdn/ref-1');
    expect(patch.fotos_pendentes).toBeNull();
  });

  it('cenário 5 — flush parcial não perde fotos pendentes', async () => {
    const actualPhotoStorage = await vi.importActual('../../core/photoStorage.js');
    const m1 = await actualPhotoStorage.enqueuePhotoForRetry(
      new Blob(['1'], { type: 'image/jpeg' }),
      'reg-9',
      0,
      { userId: 'user-1' },
    );
    const m2 = await actualPhotoStorage.enqueuePhotoForRetry(
      new Blob(['2'], { type: 'image/jpeg' }),
      'reg-9',
      1,
      { userId: 'user-1' },
    );
    const m3 = await actualPhotoStorage.enqueuePhotoForRetry(
      new Blob(['3'], { type: 'image/jpeg' }),
      'reg-9',
      2,
      { userId: 'user-1' },
    );

    mocks.supabaseGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.supabaseStorageUpload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'fail-2' } })
      .mockResolvedValueOnce({ error: { message: 'fail-3' } })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'fail-3-again' } });
    mocks.supabaseSignedUrl
      .mockResolvedValueOnce({ data: { signedUrl: 'https://cdn/ref-1' }, error: null })
      .mockResolvedValueOnce({ data: { signedUrl: 'https://cdn/ref-2' }, error: null });

    mocks.supabaseSelect
      .mockResolvedValueOnce({
        data: { fotos: [m1, m2, m3], fotos_pendentes: [m1.queueKey, m2.queueKey, m3.queueKey] },
      })
      .mockResolvedValueOnce({
        data: {
          fotos: [{ url: 'https://cdn/ref-1' }, m2, m3],
          fotos_pendentes: [m2.queueKey, m3.queueKey],
        },
      });
    mocks.supabaseUpdate.mockResolvedValue({ error: null });

    await actualPhotoStorage.flushPendingPhotos();
    const patch1 = mocks.supabaseUpdate.mock.calls.at(-1)[0];
    expect(patch1.fotos[0].url).toBe('https://cdn/ref-1');
    expect(patch1.fotos[1]).toMatchObject({ pending: true, queueKey: m2.queueKey });
    expect(patch1.fotos[2]).toMatchObject({ pending: true, queueKey: m3.queueKey });
    expect(patch1.fotos_pendentes).toEqual([m2.queueKey, m3.queueKey]);

    await actualPhotoStorage.flushPendingPhotos();
    const patch2 = mocks.supabaseUpdate.mock.calls.at(-1)[0];
    expect(patch2.fotos[0].url).toBe('https://cdn/ref-1');
    expect(patch2.fotos[1].url).toBe('https://cdn/ref-2');
    expect(patch2.fotos[2]).toMatchObject({ pending: true, queueKey: m3.queueKey });
    expect(patch2.fotos_pendentes).toEqual([m3.queueKey]);
  });
});
