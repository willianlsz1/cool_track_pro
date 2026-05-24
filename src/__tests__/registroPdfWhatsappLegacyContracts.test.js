import { readFileSync } from 'node:fs';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => {
  const handlers = new Map();
  const signatureCanceled = Symbol('signature-canceled');
  const photos = {
    pending: [],
    clear: vi.fn(() => {
      photos.pending = [];
      photos.render();
    }),
    render: vi.fn(() => {
      let root = document.getElementById('registro-photos-root');
      if (!root) {
        const dropZone = document.getElementById('photo-drop-zone');
        root = document.createElement('div');
        root.id = 'registro-photos-root';
        dropZone?.parentNode?.insertBefore(root, dropZone);
      }
      if (root) root.dataset.reactRegistroPhotosMounted = 'true';
      return root;
    }),
  };

  return {
    handlers,
    signatureCanceled,
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
    exportPdfFlow: vi.fn(),
    shareWhatsAppFlow: vi.fn(),
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
    signatureRequest: vi.fn(),
    saveSignatureForRecord: vi.fn(),
  };
});

vi.mock('../core/events.js', () => ({ on: mocks.on }));

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

vi.mock('../features/profile.js', () => ({
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

vi.mock('../core/telemetry.js', () => ({ trackEvent: mocks.trackEvent }));

vi.mock('../ui/components/skeleton.js', () => ({
  withSkeleton: mocks.withSkeleton,
}));

vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPlusOrHigher: mocks.isCachedPlanPlusOrHigher,
  isCachedPlanPro: mocks.isCachedPlanPro,
}));

vi.mock('../ui/controller/handlers/reportExportHandlers.js', () => ({
  exportPdfFlow: mocks.exportPdfFlow,
  shareWhatsAppFlow: mocks.shareWhatsAppFlow,
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

vi.mock('../ui/components/signature.js', () => ({
  SignatureModal: {
    CANCELED: mocks.signatureCanceled,
    request: mocks.signatureRequest,
  },
  saveSignatureForRecord: mocks.saveSignatureForRecord,
}));

const SAFE_PHOTO =
  'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AA/vuUAAA=';
const UNSAFE_PHOTO = 'javascript:alert(1)';
const SAFE_SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
const UNSAFE_SIGNATURE = 'data:text/html,<script>alert(1)</script>';
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
    clientes: [{ id: 'cliente-1', nome: 'Cliente ACME' }],
    setores: [{ id: 'setor-1', nome: 'Recepcao', clienteId: 'cliente-1' }],
    tecnicos: ['Tecnico Padrao'],
    ...overrides,
  };
}

function setupDom() {
  document.body.innerHTML = renderShellViews();
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
  mocks.reconcileEquipmentStatusesAfterRegistroEdit.mockImplementation(
    ({ equipamentos }) => equipamentos,
  );
  mocks.uploadPendingPhotos.mockImplementation(async (photos) => ({
    photos: photos.map((_, index) => `uploaded-photo-${index + 1}`),
    failedCount: 0,
  }));
  mocks.exportPdfFlow.mockResolvedValue(true);
  mocks.shareWhatsAppFlow.mockResolvedValue(true);
  mocks.signatureRequest.mockResolvedValue(null);
  mocks.saveSignatureForRecord.mockResolvedValue(null);

  const registro = await import('../ui/views/registro.js');
  const { bindRegistroHandlers } = await import('../ui/controller/handlers/registroHandlers.js');
  bindRegistroHandlers();
  return registro;
}

async function mountAndFillRegistro(registro, overrides = {}) {
  await act(async () => {
    registro.initRegistro({ equipId: overrides.equipId || 'eq-1' });
    await flushAsyncWork();
  });

  await act(async () => {
    document.getElementById('r-equip').value = overrides.equipId || 'eq-1';
    document.getElementById('r-data').value = overrides.data || '2026-05-01T09:30';
    document.getElementById('r-tipo').value =
      overrides.tipo || findOptionValue('r-tipo', 'Preventiva');
    document.getElementById('r-obs').value =
      overrides.obs || 'Limpeza preventiva completa com medicao e drenagem conferidas.';
    document.getElementById('r-tecnico').value = overrides.tecnico || 'Tecnico Padrao';
    document.getElementById('r-prioridade').value = overrides.prioridade || 'alta';
    document.getElementById('r-status').value = overrides.status || 'ok';
    document.getElementById('r-pecas').value = overrides.pecas || 'Filtro novo';
    document.getElementById('r-proxima').value = overrides.proxima || '2026-06-01';
    document.getElementById('r-custo-pecas').value = overrides.custoPecas || '12.50';
    document.getElementById('r-custo-mao-obra').value = overrides.custoMaoObra || '80';
    document.getElementById('r-cliente-nome').value = overrides.clienteNome || 'Cliente ACME';
    document.getElementById('r-cliente-documento').value =
      overrides.clienteDocumento || '00.000.000/0001-00';
    document.getElementById('r-local-atendimento').value =
      overrides.localAtendimento || 'Sala tecnica';
    document.getElementById('r-cliente-contato').value =
      overrides.clienteContato || '(11) 90000-0000';
    registro.renderChecklist();
    await flushAsyncWork();
  });

  const checklistButton = document.querySelector(
    '#r-checklist-body [data-action="r-checklist-set"][data-item-id="filtros_limpeza"][data-status="ok"]',
  );
  expect(checklistButton).not.toBeNull();

  await act(async () => {
    await mocks.handlers.get('r-checklist-set')(checklistButton);
    await flushAsyncWork();
  });

  expect(document.getElementById('registro-header-root')?.dataset.reactRegistroHeaderMounted).toBe(
    'true',
  );
  expect(document.getElementById('r-checklist-body')?.dataset.reactRegistroChecklistMounted).toBe(
    'true',
  );
  expect(document.getElementById('registro-photos-root')?.dataset.reactRegistroPhotosMounted).toBe(
    'true',
  );
  expect(document.getElementById('registro-signature-hint')?.dataset.registroSignatureMounted).toBe(
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

async function triggerAction(action) {
  const handler = mocks.handlers.get(action);
  const button = document.querySelector(`[data-action="${action}"]`);
  expect(handler).toBeTypeOf('function');
  expect(button).not.toBeNull();

  await act(async () => {
    await handler(button);
    await flushAsyncWork();
  });
}

function getSavedRecord() {
  expect(mocks.setState).toHaveBeenCalled();
  return mocks.stateRef.current.registros.at(-1);
}

function expectNoUnsafeMarkup(root = document.body) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect(root.querySelector('[onerror]')).toBeNull();
  root.querySelectorAll('[href], [src]').forEach((node) => {
    ['href', 'src']
      .map((attr) => node.getAttribute(attr))
      .filter(Boolean)
      .forEach((value) => {
        const lower = value.toLowerCase();
        expect(lower).not.toContain('javascript:');
        expect(lower).not.toContain('data:text/html');
        expect(lower).not.toContain('image/svg+xml');
      });
  });
}

describe('registro legacy PDF/WhatsApp contracts with React islands data', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.handlers.clear();
    mocks.stateRef.current = null;
    mocks.photos.pending = [];
    Element.prototype.scrollIntoView = vi.fn();
    HTMLElement.prototype.focus = vi.fn();
    globalThis.requestAnimationFrame = (callback) => {
      callback();
      return 1;
    };
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('salvar e compartilhar monta payload completo e chama WhatsApp legado mockado', async () => {
    const signatureReference = {
      version: 1,
      provider: 'supabase-storage',
      bucket: 'registro-fotos',
      path: 'user-1/registros/reg-1/assinatura.png',
      mimeType: 'image/png',
    };
    setupDom();
    const registro = await loadRegistro(baseState(), { plus: true });
    mocks.photos.pending = [SAFE_PHOTO, UNSAFE_PHOTO];
    mocks.signatureRequest.mockResolvedValue(SAFE_SIGNATURE);
    mocks.saveSignatureForRecord.mockResolvedValue(signatureReference);

    await mountAndFillRegistro(registro);
    await triggerAction('save-and-share-registro');

    const saved = getSavedRecord();
    expect(saved).toMatchObject({
      equipId: 'eq-1',
      data: '2026-05-01T09:30',
      status: 'ok',
      prioridade: 'alta',
      pecas: 'Filtro novo',
      proxima: '2026-06-01',
      custoPecas: 12.5,
      custoMaoObra: 80,
      clienteNome: 'Cliente ACME',
      localAtendimento: 'Sala tecnica',
      fotos: ['uploaded-photo-1'],
      assinatura: signatureReference,
    });
    expect(saved.obs).toContain('Limpeza preventiva completa');
    expect(saved.tecnico).toBe('Tecnico Padrao');
    expect(saved.checklist?.items.find((item) => item.id === 'filtros_limpeza')?.status).toBe('ok');
    expect(mocks.uploadPendingPhotos).toHaveBeenCalledWith([SAFE_PHOTO], { recordId: saved.id });
    expect(mocks.saveSignatureForRecord).toHaveBeenCalledWith(saved.id, SAFE_SIGNATURE);
    expect(mocks.shareWhatsAppFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: saved.id },
    });
    expect(mocks.exportPdfFlow).not.toHaveBeenCalled();
    expect(document.querySelector('[data-testid="post-save-registro-toast"]')).toBeNull();
    expectNoUnsafeMarkup();
  });

  it('CTA PDF pos-save chama exportacao legada mockada com filtro do registro salvo', async () => {
    setupDom();
    const registro = await loadRegistro(baseState(), { plus: false });

    await mountAndFillRegistro(registro);
    await triggerAction('save-registro');

    const saved = getSavedRecord();
    const toast = document.querySelector('[data-testid="post-save-registro-toast"]');
    const pdfButton = toast?.querySelector('.share-success-toast__action--pdf');

    expect(pdfButton).not.toBeNull();
    expect(pdfButton?.dataset.destination).toBe('pdf');

    await act(async () => {
      pdfButton.click();
      await flushAsyncWork();
    });

    expect(mocks.exportPdfFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: saved.id },
    });
    expect(mocks.shareWhatsAppFlow).not.toHaveBeenCalled();
    expect(mocks.goTo).not.toHaveBeenCalled();
  });

  it('CTA WhatsApp pos-save chama compartilhamento legado mockado e ignora assinatura insegura', async () => {
    setupDom();
    const registro = await loadRegistro(baseState(), { plus: true });
    mocks.signatureRequest.mockResolvedValue(UNSAFE_SIGNATURE);
    mocks.shareWhatsAppFlow.mockResolvedValue(false);

    await mountAndFillRegistro(registro, {
      obs: `${MALICIOUS}\nObservacao segura longa`,
      tecnico: `${MALICIOUS} Tecnico`,
    });
    await triggerAction('save-registro');

    const saved = getSavedRecord();
    const toast = document.querySelector('[data-testid="post-save-registro-toast"]');
    const whatsButton = toast?.querySelector('.share-success-toast__action--whatsapp');

    expect(saved.assinatura).toBe(false);
    expect(mocks.saveSignatureForRecord).not.toHaveBeenCalled();
    expect(whatsButton).not.toBeNull();
    expect(whatsButton?.dataset.destination).toBe('whatsapp');

    await act(async () => {
      whatsButton.click();
      await flushAsyncWork();
    });

    expect(mocks.shareWhatsAppFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: saved.id },
    });
    expect(mocks.exportPdfFlow).not.toHaveBeenCalled();
    expect(mocks.goTo).not.toHaveBeenCalled();
    expectNoUnsafeMarkup();
  });

  it('mantem PDF e WhatsApp legados fora de React/createRoot no adapter', () => {
    const adapterSource = readFileSync('src/ui/views/registro.js', 'utf8');
    const handlersSource = readFileSync('src/ui/controller/handlers/registroHandlers.js', 'utf8');

    expect(handlersSource).toContain('save-and-share-registro');
    expect(adapterSource).toContain('exportPdfFlow');
    expect(adapterSource).toContain('shareWhatsAppFlow');
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
  });
});
