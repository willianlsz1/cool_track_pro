import { readFileSync } from 'node:fs';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => {
  const handlers = new Map();
  const signatureCanceled = Symbol('signature-canceled');
  const photos = { pending: [], clear: vi.fn(() => (photos.pending = [])) };

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

const SAFE_SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
const SAFE_PHOTO =
  'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AA/vuUAAA=';
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
  mocks.uploadPendingPhotos.mockResolvedValue({ photos: [], failedCount: 0 });
  mocks.exportPdfFlow.mockResolvedValue(false);
  mocks.shareWhatsAppFlow.mockResolvedValue(true);
  mocks.signatureRequest.mockResolvedValue(null);
  mocks.saveSignatureForRecord.mockResolvedValue(null);

  const registro = await import('../ui/views/registro.js');
  const { bindRegistroHandlers } = await import('../ui/controller/handlers/registroHandlers.js');
  bindRegistroHandlers();
  return registro;
}

async function mountRegistro(registro, params = { equipId: 'eq-1' }) {
  await act(async () => {
    registro.initRegistro(params);
    await flushAsyncWork();
  });
}

async function fillMainFields(registro, overrides = {}) {
  await act(async () => {
    document.getElementById('r-equip').value = overrides.equipId || 'eq-1';
    document.getElementById('r-data').value = overrides.data || '2026-05-01T09:30';
    document.getElementById('r-tipo').value =
      overrides.tipo || findOptionValue('r-tipo', 'Preventiva');
    document.getElementById('r-obs').value =
      overrides.obs || 'Limpeza preventiva completa com pressao e drenagem conferidas.';
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
}

async function setChecklistOk() {
  const checklistButton = document.querySelector(
    '#r-checklist-body [data-action="r-checklist-set"][data-item-id="filtros_limpeza"][data-status="ok"]',
  );
  expect(checklistButton).not.toBeNull();

  await act(async () => {
    await mocks.handlers.get('r-checklist-set')(checklistButton);
    await Promise.resolve();
  });
}

async function prepareNewRegistro(registro, overrides = {}) {
  await mountRegistro(registro, { equipId: overrides.equipId || 'eq-1' });
  await fillMainFields(registro, overrides);
  await setChecklistOk();
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

describe('registro legacy post-save flow with DOM fields and checklist', () => {
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

  it('mostra toast pos-save com CTAs usando payload completo do Registro', async () => {
    const signatureReference = {
      version: 1,
      provider: 'supabase-storage',
      bucket: 'registro-fotos',
      path: 'user-1/registros/reg-1/assinatura.png',
      mimeType: 'image/png',
    };
    const state = baseState();
    setupDom();
    const registro = await loadRegistro(state, { plus: true });
    mocks.photos.pending = [SAFE_PHOTO];
    mocks.uploadPendingPhotos.mockResolvedValue({
      photos: ['uploaded-photo-ref'],
      failedCount: 0,
    });
    mocks.signatureRequest.mockResolvedValue(SAFE_SIGNATURE);
    mocks.saveSignatureForRecord.mockResolvedValue(signatureReference);
    mocks.exportPdfFlow.mockResolvedValue(false);
    mocks.shareWhatsAppFlow.mockResolvedValue(true);

    await prepareNewRegistro(registro);
    await triggerAction('save-registro');

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
      clienteDocumento: '00.000.000/0001-00',
      localAtendimento: 'Sala tecnica',
      clienteContato: '(11) 90000-0000',
      fotos: ['uploaded-photo-ref'],
      assinatura: signatureReference,
    });
    expect(saved.obs).toContain('Limpeza preventiva completa');
    expect(saved.tecnico).toBe('Tecnico Padrao');
    expect(saved.checklist?.items.find((item) => item.id === 'filtros_limpeza')?.status).toBe('ok');
    expect(mocks.uploadPendingPhotos).toHaveBeenCalledWith([SAFE_PHOTO], { recordId: saved.id });
    expect(mocks.saveSignatureForRecord).toHaveBeenCalledWith(saved.id, SAFE_SIGNATURE);

    const toast = document.querySelector('[data-testid="post-save-registro-toast"]');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toContain('Split Recepcao');

    const pdfButton = toast.querySelector('.share-success-toast__action--pdf');
    const whatsButton = toast.querySelector('.share-success-toast__action--whatsapp');
    expect(pdfButton).not.toBeNull();
    expect(whatsButton).not.toBeNull();

    await act(async () => {
      pdfButton.click();
      await flushAsyncWork();
    });
    expect(mocks.exportPdfFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: saved.id },
    });
    expect(mocks.shareWhatsAppFlow).not.toHaveBeenCalled();

    await act(async () => {
      whatsButton.click();
      await flushAsyncWork();
    });
    expect(mocks.shareWhatsAppFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: saved.id },
    });
    expect(mocks.goTo).not.toHaveBeenCalled();
  });

  it('aciona navegacao fallback do toast quando CTA pos-save falha', async () => {
    const state = baseState();
    setupDom();
    const registro = await loadRegistro(state, { plus: false });
    mocks.exportPdfFlow.mockRejectedValue(new Error('pdf unavailable'));

    await prepareNewRegistro(registro);
    await triggerAction('save-registro');

    const saved = getSavedRecord();
    const pdfButton = document.querySelector('.share-success-toast__action--pdf');
    expect(pdfButton).not.toBeNull();

    await act(async () => {
      pdfButton.click();
      await flushAsyncWork();
    });

    expect(mocks.goTo).toHaveBeenCalledWith('relatorio', {
      equipId: 'eq-1',
      intent: 'pdf',
      registroId: saved.id,
    });
  });

  it('salvar e compartilhar usa WhatsApp legado mockado e navega no fallback atual', async () => {
    const state = baseState();
    setupDom();
    const registro = await loadRegistro(state, { plus: false });
    mocks.shareWhatsAppFlow.mockResolvedValue(false);

    await prepareNewRegistro(registro);
    await triggerAction('save-and-share-registro');

    const saved = getSavedRecord();
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Serviço salvo. Abrindo WhatsApp...');
    expect(mocks.shareWhatsAppFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: saved.id },
    });
    expect(mocks.exportPdfFlow).not.toHaveBeenCalled();
    expect(mocks.goTo).toHaveBeenCalledWith('relatorio', {
      equipId: 'eq-1',
      intent: 'whatsapp',
      registroId: saved.id,
    });
    expect(document.querySelector('[data-testid="post-save-registro-toast"]')).toBeNull();
  });

  it('edicao preserva id e dados existentes sem abrir PDF, WhatsApp ou assinatura', async () => {
    const state = baseState({
      registros: [
        {
          id: 'reg-existing',
          equipId: 'eq-1',
          data: '2026-04-20T08:00',
          tipo: 'Corretiva',
          obs: 'Observacao anterior',
          tecnico: 'Tecnico antigo',
          status: 'warn',
          fotos: ['existing-photo-ref'],
          assinatura: { provider: 'supabase-storage', path: 'existing-signature.png' },
          checklist: {
            templateId: 'split',
            items: [{ id: 'filtros_limpeza', status: 'nok', obs: 'Antes' }],
          },
        },
      ],
    });
    setupDom();
    const registro = await loadRegistro(state, { plus: true });

    await mountRegistro(registro, { editRegistroId: 'reg-existing' });
    await act(async () => {
      registro.loadRegistroForEdit('reg-existing');
      await flushAsyncWork();
    });
    await fillMainFields(registro, {
      obs: 'Registro editado com observacao completa',
      tecnico: 'Tecnico novo',
      status: 'danger',
      prioridade: 'baixa',
    });
    await triggerAction('save-registro');

    expect(mocks.stateRef.current.registros).toHaveLength(1);
    const updated = mocks.stateRef.current.registros[0];
    expect(updated.id).toBe('reg-existing');
    expect(updated.obs).toContain('Registro editado');
    expect(updated.tecnico).toBe('Tecnico novo');
    expect(updated.status).toBe('danger');
    expect(updated.fotos).toEqual(['existing-photo-ref']);
    expect(updated.assinatura).toEqual({
      provider: 'supabase-storage',
      path: 'existing-signature.png',
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Registro atualizado.');
    expect(mocks.goTo).toHaveBeenCalledWith('historico');
    expect(mocks.signatureRequest).not.toHaveBeenCalled();
    expect(mocks.exportPdfFlow).not.toHaveBeenCalled();
    expect(mocks.shareWhatsAppFlow).not.toHaveBeenCalled();
  });

  it('clear-registro limpa campos do formulario sem executar salvamento', async () => {
    const state = baseState();
    setupDom();
    const registro = await loadRegistro(state, { plus: false });
    mocks.photos.pending = [SAFE_PHOTO];

    await prepareNewRegistro(registro);
    expect(document.getElementById('r-proxima').value).toBe('2026-06-01');

    await triggerAction('clear-registro');

    expect(mocks.setState).not.toHaveBeenCalled();
    expect(document.getElementById('r-obs').value).toBe('');
    expect(document.getElementById('r-proxima').value).toBe('');
    expect(document.getElementById('r-prioridade').value).toBe('media');
    expect(document.getElementById('r-status').value).toBe('ok');
    expect(mocks.photos.clear).toHaveBeenCalled();
    expect(mocks.exportPdfFlow).not.toHaveBeenCalled();
    expect(mocks.shareWhatsAppFlow).not.toHaveBeenCalled();
  });

  it('mantem payload malicioso inerte no pos-save e sem React direto no adapter', async () => {
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
    setupDom();
    const registro = await loadRegistro(state, { plus: true });
    mocks.signatureRequest.mockResolvedValue('javascript:alert(1)');
    mocks.photos.pending = ['javascript:alert(2)'];
    mocks.uploadPendingPhotos.mockResolvedValue({
      photos: ['javascript:alert(2)'],
      failedCount: 0,
    });

    await prepareNewRegistro(registro, {
      obs: `${MALICIOUS}\nObservacao segura longa`,
      tecnico: `${MALICIOUS} Tecnico`,
    });
    await triggerAction('save-registro');

    const saved = getSavedRecord();
    expect(saved.assinatura).toBe(false);
    expect(mocks.saveSignatureForRecord).not.toHaveBeenCalled();
    expectNoUnsafeMarkup();
    expect(mocks.exportPdfFlow).not.toHaveBeenCalled();
    expect(mocks.shareWhatsAppFlow).not.toHaveBeenCalled();

    const source = readFileSync('src/ui/views/registro.js', 'utf8');
    expect(source).not.toMatch(/from ['"]react['"]|react-dom|createRoot/);
  });
});
