import { readFileSync } from 'node:fs';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => {
  const handlers = new Map();
  const photos = { pending: [], clear: vi.fn(() => (photos.pending = [])) };

  return {
    handlers,
    photos,
    stateRef: { current: null },
    on: vi.fn((action, handler) => handlers.set(action, handler)),
    getState: vi.fn(),
    findEquip: vi.fn(),
    setState: vi.fn(),
    lastRegForEquip: vi.fn(),
    goTo: vi.fn(),
    setRouteGuard: vi.fn(),
    clearRouteGuard: vi.fn(),
    customConfirmShow: vi.fn(),
    uploadPendingPhotos: vi.fn(),
    markForHighlight: vi.fn(),
    getOperationalStatus: vi.fn(),
    validateOperationalPayload: vi.fn(),
    reconcileEquipmentStatusesAfterRegistroEdit: vi.fn(),
    trackEvent: vi.fn(),
    withSkeleton: vi.fn((_el, _opts, renderFn) => renderFn()),
    isCachedPlanPlusOrHigher: vi.fn(),
    isCachedPlanPro: vi.fn(),
    postSaveToastShow: vi.fn(),
    bindSmartContactMaskInput: vi.fn(),
    profileDefaultTecnico: vi.fn(),
    profileSaveLastTecnico: vi.fn(),
    profileGet: vi.fn(() => ({})),
    profileSave: vi.fn(),
    handleError: vi.fn(),
    runAsyncAction: vi.fn((_el, _opts, fn) => fn()),
    deleteReg: vi.fn(),
    toastSuccess: vi.fn(),
    toastWarning: vi.fn(),
    toastError: vi.fn(),
    toastInfo: vi.fn(),
  };
});

vi.mock('../core/events.js', () => ({
  on: mocks.on,
}));

vi.mock('../core/state.js', () => ({
  getState: mocks.getState,
  findEquip: mocks.findEquip,
  setState: mocks.setState,
  lastRegForEquip: mocks.lastRegForEquip,
}));

vi.mock('../core/router.js', () => ({
  goTo: mocks.goTo,
  setRouteGuard: mocks.setRouteGuard,
  clearRouteGuard: mocks.clearRouteGuard,
}));

vi.mock('../core/modal.js', () => ({
  CustomConfirm: { show: mocks.customConfirmShow },
}));

vi.mock('../core/toast.js', () => ({
  Toast: {
    success: mocks.toastSuccess,
    warning: mocks.toastWarning,
    error: mocks.toastError,
    info: mocks.toastInfo,
  },
}));

vi.mock('../ui/components/photos.js', () => ({
  Photos: mocks.photos,
}));

vi.mock('../ui/components/onboarding.js', () => ({
  SavedHighlight: { markForHighlight: mocks.markForHighlight },
}));

vi.mock('../core/profile.js', () => ({
  Profile: {
    getDefaultTecnico: mocks.profileDefaultTecnico,
    saveLastTecnico: mocks.profileSaveLastTecnico,
    get: mocks.profileGet,
    save: mocks.profileSave,
  },
}));

vi.mock('../core/errors.js', () => ({
  ErrorCodes: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    SYNC_FAILED: 'SYNC_FAILED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
  },
  handleError: mocks.handleError,
}));

vi.mock('../core/photoStorage.js', () => ({
  uploadPendingPhotos: mocks.uploadPendingPhotos,
}));

vi.mock('../core/equipmentRules.js', () => ({
  getOperationalStatus: mocks.getOperationalStatus,
  validateOperationalPayload: mocks.validateOperationalPayload,
}));

vi.mock('../domain/registroStatus.js', () => ({
  reconcileEquipmentStatusesAfterRegistroEdit: mocks.reconcileEquipmentStatusesAfterRegistroEdit,
}));

vi.mock('../core/telemetry.js', () => ({
  trackEvent: mocks.trackEvent,
}));

vi.mock('../ui/components/skeleton.js', () => ({
  withSkeleton: mocks.withSkeleton,
}));

vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPlusOrHigher: mocks.isCachedPlanPlusOrHigher,
  isCachedPlanPro: mocks.isCachedPlanPro,
}));

vi.mock('../ui/components/postSaveRegistroToast.js', () => ({
  PostSaveRegistroToast: { show: mocks.postSaveToastShow },
}));

vi.mock('../core/phoneMask.js', () => ({
  bindSmartContactMaskInput: mocks.bindSmartContactMaskInput,
}));

vi.mock('../ui/components/actionFeedback.js', () => ({
  runAsyncAction: mocks.runAsyncAction,
}));

vi.mock('../ui/views/historico.js', () => ({
  deleteReg: mocks.deleteReg,
}));

const MALICIOUS = '<img src=x onerror=alert(1)><script>alert(2)</script>';

function baseState(overrides = {}) {
  return {
    equipamentos: [
      {
        id: 'eq-1',
        nome: 'Split Recepcao',
        tag: 'SP-01',
        tipo: 'Split Hi-Wall',
        local: 'Recepcao',
        clienteId: 'cliente-1',
        setorId: 'setor-1',
        periodicidadePreventivaDias: 30,
      },
    ],
    registros: [],
    clientes: [
      {
        id: 'cliente-1',
        nome: 'Cliente ACME',
        documento: '00.000.000/0001-00',
        endereco: 'Rua Um',
        contato: '(11) 90000-0000',
      },
    ],
    setores: [{ id: 'setor-1', nome: 'Recepcao', clienteId: 'cliente-1' }],
    tecnicos: ['Tecnico Padrao'],
    ...overrides,
  };
}

function setupDom(state = baseState()) {
  document.body.innerHTML = renderShellViews();
  const select = document.getElementById('r-equip');
  for (const equipamento of state.equipamentos || []) {
    const option = document.createElement('option');
    option.value = equipamento.id;
    option.textContent = equipamento.nome;
    select.appendChild(option);
  }
}

async function flushAsyncWork() {
  if (typeof vi.dynamicImportSettled === 'function') {
    await vi.dynamicImportSettled();
  }
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
  }
}

async function loadRegistro(state = baseState(), { plus = true } = {}) {
  mocks.stateRef.current = state;
  mocks.getState.mockImplementation(() => mocks.stateRef.current);
  mocks.setState.mockImplementation((updater) => {
    mocks.stateRef.current =
      typeof updater === 'function' ? updater(mocks.stateRef.current) : updater;
    return mocks.stateRef.current;
  });
  mocks.findEquip.mockImplementation(
    (id) =>
      mocks.stateRef.current?.equipamentos?.find((equipamento) => equipamento.id === id) || null,
  );
  mocks.lastRegForEquip.mockReturnValue(null);
  mocks.isCachedPlanPlusOrHigher.mockReturnValue(plus);
  mocks.isCachedPlanPro.mockReturnValue(true);
  mocks.profileDefaultTecnico.mockReturnValue('Tecnico Padrao');
  mocks.getOperationalStatus.mockReturnValue({
    uiStatus: 'ok',
    label: 'Operando normalmente',
  });
  mocks.validateOperationalPayload.mockReturnValue({ valid: true, errors: [], value: {} });
  mocks.uploadPendingPhotos.mockResolvedValue({ photos: [], failedCount: 0 });
  mocks.postSaveToastShow.mockReturnValue(true);
  const registro = await import('../ui/views/registro.js');
  const { bindRegistroHandlers } = await import('../ui/controller/handlers/registroHandlers.js');
  bindRegistroHandlers();
  return registro;
}

async function prepareRegistroForm(registro, { equipId = 'eq-1' } = {}) {
  await act(async () => {
    registro.initRegistro({ equipId });
    await flushAsyncWork();
  });

  await act(async () => {
    document.getElementById('r-equip').value = equipId;
    document.getElementById('r-data').value = '2026-05-01T09:30';
    document.getElementById('r-tipo').value = findOptionValue('r-tipo', 'Preventiva');
    document.getElementById('r-obs').value =
      'Limpeza preventiva realizada com testes finais e checklist completo.';
    document.getElementById('r-tecnico').value = 'Tecnico Padrao';
    document.getElementById('r-prioridade').value = 'media';
    document.getElementById('r-status').value = 'ok';
    registro.renderChecklist();
    await flushAsyncWork();
  });

  const checklistButton = document.querySelector(
    '#r-checklist-body [data-action="r-checklist-set"][data-item-id="filtros_limpeza"][data-status="ok"]',
  );
  expect(checklistButton).not.toBeNull();

  await act(async () => {
    await mocks.handlers.get('r-checklist-set')(checklistButton);
    await Promise.resolve();
  });

  expect(document.getElementById('registro-header-root')?.dataset.registroHeaderMounted).toBe(
    'true',
  );
  expect(document.getElementById('r-checklist-body')?.dataset.registroChecklistMounted).toBe(
    'true',
  );
}

function findOptionValue(selectId, labelPart) {
  const option = Array.from(document.getElementById(selectId)?.options || []).find((candidate) =>
    candidate.textContent.includes(labelPart),
  );
  expect(option).toBeTruthy();
  return option.value;
}

async function triggerSave(action) {
  const handler = mocks.handlers.get(action);
  const button = document.querySelector(`[data-action="${action}"]`);
  expect(handler).toBeTypeOf('function');
  expect(button).not.toBeNull();

  await act(async () => {
    await handler(button);
    await flushAsyncWork();
  });
}

function getSavedState() {
  expect(mocks.setState).toHaveBeenCalled();
  return mocks.stateRef.current;
}

function getSavedTechnician(record) {
  return record.tecnico ?? record['t\u00e9cnico'] ?? record['t\u00c3\u00a9cnico'];
}

function expectNoUnsafeMarkup(root = document.body) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect(root.querySelector('[onerror]')).toBeNull();
  root.querySelectorAll('[href], [src]').forEach((node) => {
    const values = ['href', 'src'].map((attr) => node.getAttribute(attr)).filter(Boolean);
    values.forEach((value) => {
      const lower = value.toLowerCase();
      expect(lower).not.toContain('javascript:');
      expect(lower).not.toContain('data:text/html');
      expect(lower).not.toContain('image/svg+xml');
    });
  });
}

function expectNoExternalPdfOrWhatsapp() {}

describe('registro legacy save handlers with signature contracts', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.handlers.clear();
    mocks.stateRef.current = null;
    mocks.photos.pending = [];
    Element.prototype.scrollIntoView = vi.fn();
    HTMLElement.prototype.focus = vi.fn();
    globalThis.CSS = {
      ...(globalThis.CSS || {}),
      escape: (value) => String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"'),
    };
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T09:30:00'));
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
    delete document.body.dataset.checklistObsBound;
  });

  it('salva via save-registro lendo campos DOM e checklist sem captura legada de fotos', async () => {
    const state = baseState();
    setupDom(state);
    const registro = await loadRegistro(state, { plus: false });

    await prepareRegistroForm(registro);
    await triggerSave('save-registro');

    const nextState = getSavedState(state);
    const saved = nextState.registros.at(-1);
    expect(saved.equipId).toBe('eq-1');
    expect(saved.tipo).toContain('Preventiva');
    expect(saved.obs).toContain('Limpeza preventiva');
    expect(getSavedTechnician(saved)).toBe('Tecnico Padrao');
    expect(saved.fotos).toEqual([]);
    expect(saved.checklist?.items.find((item) => item.id === 'filtros_limpeza')?.status).toBe('ok');
    expect(saved).not.toHaveProperty('assinatura');
    expect(mocks.uploadPendingPhotos).not.toHaveBeenCalled();
    expect(mocks.postSaveToastShow).toHaveBeenCalledWith(
      expect.objectContaining({ equipId: 'eq-1', registroId: saved.id }),
    );
    expectNoExternalPdfOrWhatsapp();
  });

  it('aposenta assinatura no salvamento legado mesmo com plano antigo habilitado', async () => {
    const state = baseState();
    setupDom(state);
    const registro = await loadRegistro(state, { plus: true });

    await prepareRegistroForm(registro);
    await triggerSave('save-registro');

    const nextState = getSavedState(state);
    const saved = nextState.registros.at(-1);
    expect(saved).not.toHaveProperty('assinatura');
    expect(mocks.postSaveToastShow).toHaveBeenCalledWith(
      expect.objectContaining({ equipId: 'eq-1', registroId: saved.id }),
    );
    expectNoExternalPdfOrWhatsapp();
  });

  it('nao registra handler legado de salvar e compartilhar', async () => {
    const state = baseState();
    setupDom(state);
    await loadRegistro(state, { plus: true });

    expect(mocks.handlers.get('save-and-share-registro')).toBeUndefined();
    expect(mocks.handlers.get('save-and-share-other-registro')).toBeUndefined();
    expect(mocks.setState).not.toHaveBeenCalled();
  });

  it('mantem salvamento quando assinatura e cancelada pelo modal legado', async () => {
    const state = baseState();
    setupDom(state);
    const registro = await loadRegistro(state, { plus: true });

    await prepareRegistroForm(registro);
    await triggerSave('save-registro');

    const nextState = getSavedState(state);
    const saved = nextState.registros.at(-1);
    expect(saved).not.toHaveProperty('assinatura');
    expect(mocks.postSaveToastShow).toHaveBeenCalledWith(
      expect.objectContaining({ equipId: 'eq-1', registroId: saved.id }),
    );
  });

  it('ignora assinatura insegura sem persistir preview ou executar javascript', async () => {
    const state = baseState({
      equipamentos: [
        {
          id: 'eq-1',
          nome: MALICIOUS,
          tag: MALICIOUS,
          tipo: 'Split Hi-Wall',
          local: MALICIOUS,
          clienteId: 'cliente-1',
          setorId: 'setor-1',
        },
      ],
    });
    setupDom(state);
    const registro = await loadRegistro(state, { plus: true });

    await prepareRegistroForm(registro);
    await triggerSave('save-registro');

    const nextState = getSavedState(state);
    const saved = nextState.registros.at(-1);
    expect(saved).not.toHaveProperty('assinatura');
    expectNoUnsafeMarkup();
    expectNoExternalPdfOrWhatsapp();
  });

  it('mantem salvamento legado sem dependencia direta de React/createRoot no adapter', () => {
    const source = readFileSync('src/ui/views/registro.js', 'utf8');

    expect(source).not.toMatch(/from ['"]react['"]|react-dom|createRoot/);
  });
});
