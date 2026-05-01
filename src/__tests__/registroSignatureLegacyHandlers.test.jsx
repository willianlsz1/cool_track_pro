import { readFileSync } from 'node:fs';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { REGISTRO_SIGNATURE_ACTIONS } from '../ui/viewModels/registroSignatureModel.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => {
  const handlers = new Map();
  const signatureCanceled = Symbol('signature-canceled');
  return {
    handlers,
    signatureCanceled,
    on: vi.fn((action, handler) => handlers.set(action, handler)),
    getState: vi.fn(),
    findEquip: vi.fn(),
    setState: vi.fn(),
    lastRegForEquip: vi.fn(),
    goTo: vi.fn(),
    setRouteGuard: vi.fn(),
    clearRouteGuard: vi.fn(),
    customConfirmShow: vi.fn(),
    photosClear: vi.fn(),
    uploadPendingPhotos: vi.fn(),
    getOperationalStatus: vi.fn(),
    validateOperationalPayload: vi.fn(),
    reconcileEquipmentStatusesAfterRegistroEdit: vi.fn(),
    trackEvent: vi.fn(),
    withSkeleton: vi.fn((_el, _opts, renderFn) => renderFn()),
    isCachedPlanPlusOrHigher: vi.fn(),
    postSaveToastShow: vi.fn(),
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
    signatureViewerOpen: vi.fn(),
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
  Photos: { clear: mocks.photosClear, pending: [] },
}));

vi.mock('../ui/components/onboarding.js', () => ({
  SavedHighlight: { markForHighlight: vi.fn() },
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
}));

vi.mock('../ui/components/postSaveRegistroToast.js', () => ({
  PostSaveRegistroToast: { show: mocks.postSaveToastShow },
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
  SignatureViewerModal: {
    open: mocks.signatureViewerOpen,
  },
}));

const SAFE_SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
const UNSAFE_SIGNATURE = 'data:image/svg+xml,<svg onload="alert(1)"></svg>';
const UNSAFE_CAPTURE_SIGNATURE = 'javascript:alert(1)';
const MALICIOUS = '<img src=x onerror=alert(1)><script>alert(2)</script>';

function setupDom() {
  document.body.innerHTML = `
    <main id="view-registro">
      <select id="r-equip">
        <option value="eq-1" selected>Split Recepcao</option>
      </select>
      <div id="registro-signature-hint" class="registro-sig-hint" hidden></div>
      <button data-action="save-registro"></button>
      <button data-action="save-and-share-registro"></button>
    </main>
  `;
  return document.getElementById('registro-signature-hint');
}

async function setupHandlers() {
  mocks.isCachedPlanPlusOrHigher.mockReturnValue(true);
  mocks.findEquip.mockReturnValue({ id: 'eq-1', nome: 'Split Recepcao' });
  mocks.getState.mockReturnValue({ equipamentos: [], registros: [] });
  mocks.signatureRequest.mockResolvedValue(SAFE_SIGNATURE);

  const { bindRegistroHandlers } = await import('../ui/controller/handlers/registroHandlers.js');
  bindRegistroHandlers();
}

async function mountSignatureRoot(props = {}) {
  const root = setupDom();
  const { mountRegistroSignatureReact } =
    await import('../react/entrypoints/registroSignatureIsland.jsx');
  await act(async () => {
    mountRegistroSignatureReact(root, {
      isPlusOrHigher: true,
      showCaptureAction: true,
      ...props,
    });
  });
  return root;
}

async function callHandler(action, el) {
  const handler = mocks.handlers.get(action);
  expect(handler).toBeTypeOf('function');
  await act(async () => {
    await handler(el);
    await Promise.resolve();
  });
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

function expectExternalFlowsNotExecuted() {
  expect(mocks.setState).not.toHaveBeenCalled();
  expect(mocks.uploadPendingPhotos).not.toHaveBeenCalled();
  expect(mocks.postSaveToastShow).not.toHaveBeenCalled();
  expect(mocks.exportPdfFlow).not.toHaveBeenCalled();
  expect(mocks.shareWhatsAppFlow).not.toHaveBeenCalled();
  expect(mocks.goTo).not.toHaveBeenCalled();
  expect(mocks.customConfirmShow).not.toHaveBeenCalled();
  expect(mocks.deleteReg).not.toHaveBeenCalled();
}

describe('registro signature React block legacy handlers contract', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.handlers.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T09:30:00'));
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
  });

  it('aciona captura legada a partir dos atributos emitidos pela ilha React', async () => {
    await setupHandlers();
    const root = await mountSignatureRoot();
    const capture = root.querySelector('[data-r-action="registro-signature-capture"]');

    expect(root.dataset.reactRegistroSignatureMounted).toBe('true');
    expect(capture?.dataset.rAction).toBe(REGISTRO_SIGNATURE_ACTIONS.capture);
    expect(capture?.dataset.action).toBe(REGISTRO_SIGNATURE_ACTIONS.capture);

    await callHandler(REGISTRO_SIGNATURE_ACTIONS.capture, capture);

    expect(mocks.signatureRequest).toHaveBeenCalledWith('registro-draft', 'Split Recepcao');
    expect(root.querySelector('.registro-sig-hint__preview-img')?.getAttribute('src')).toBe(
      SAFE_SIGNATURE,
    );
    expect(root.querySelector('[data-r-action="registro-signature-open"]')).not.toBeNull();
    expect(root.querySelector('[data-r-action="registro-signature-remove"]')).not.toBeNull();
    expectNoUnsafeMarkup(root);
    expectExternalFlowsNotExecuted();
  });

  it('abre visualizacao legada apenas para assinatura segura', async () => {
    await setupHandlers();
    const root = await mountSignatureRoot({ signatureSrc: SAFE_SIGNATURE });
    const open = root.querySelector('[data-r-action="registro-signature-open"]');

    expect(open?.dataset.rAction).toBe(REGISTRO_SIGNATURE_ACTIONS.open);
    expect(open?.dataset.action).toBe(REGISTRO_SIGNATURE_ACTIONS.open);

    await callHandler(REGISTRO_SIGNATURE_ACTIONS.open, open);

    expect(mocks.signatureViewerOpen).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'registro-draft', assinatura: SAFE_SIGNATURE }),
      expect.objectContaining({ equipNome: 'Split Recepcao' }),
    );

    mocks.signatureViewerOpen.mockClear();
    const { mountRegistroSignatureReact } =
      await import('../react/entrypoints/registroSignatureIsland.jsx');
    await act(async () => {
      mountRegistroSignatureReact(root, {
        isPlusOrHigher: true,
        signatureSrc: UNSAFE_SIGNATURE,
        label: MALICIOUS,
        description: MALICIOUS,
      });
    });

    expect(root.querySelector('[data-r-action="registro-signature-open"]')).toBeNull();
    await callHandler(REGISTRO_SIGNATURE_ACTIONS.open, {
      dataset: { action: REGISTRO_SIGNATURE_ACTIONS.open, signatureSrc: UNSAFE_SIGNATURE },
      closest: () => null,
    });

    expect(mocks.signatureViewerOpen).not.toHaveBeenCalled();
    expect(root.textContent).toContain(MALICIOUS);
    expectNoUnsafeMarkup(root);
    expectExternalFlowsNotExecuted();
  });

  it('ignora assinatura insegura retornada pela captura legada', async () => {
    await setupHandlers();
    mocks.signatureRequest.mockResolvedValue(UNSAFE_CAPTURE_SIGNATURE);
    const root = await mountSignatureRoot();
    const capture = root.querySelector('[data-r-action="registro-signature-capture"]');

    await callHandler(REGISTRO_SIGNATURE_ACTIONS.capture, capture);

    expect(mocks.signatureRequest).toHaveBeenCalledWith('registro-draft', 'Split Recepcao');
    expect(mocks.toastWarning).toHaveBeenCalledWith(
      'Assinatura ignorada por conter dados inválidos.',
    );
    expect(root.querySelector('.registro-sig-hint__preview-img')).toBeNull();
    expect(root.querySelector('[data-r-action="registro-signature-open"]')).toBeNull();
    expect(root.querySelector('[data-r-action="registro-signature-remove"]')).toBeNull();
    expectNoUnsafeMarkup(root);
    expectExternalFlowsNotExecuted();
  });

  it('remove assinatura capturada sem executar storage, salvamento, PDF ou WhatsApp', async () => {
    await setupHandlers();
    const root = await mountSignatureRoot({ signatureSrc: SAFE_SIGNATURE });
    const remove = root.querySelector('[data-r-action="registro-signature-remove"]');

    expect(remove?.dataset.rAction).toBe(REGISTRO_SIGNATURE_ACTIONS.remove);
    expect(remove?.dataset.action).toBe(REGISTRO_SIGNATURE_ACTIONS.remove);
    expect(root.querySelector('.registro-sig-hint__preview-img')).not.toBeNull();

    await callHandler(REGISTRO_SIGNATURE_ACTIONS.remove, remove);

    expect(root.querySelector('.registro-sig-hint__preview-img')).toBeNull();
    expect(root.querySelector('[data-r-action="registro-signature-open"]')).toBeNull();
    expect(root.querySelector('[data-r-action="registro-signature-remove"]')).toBeNull();
    expectNoUnsafeMarkup(root);
    expectExternalFlowsNotExecuted();
  });

  it('mantem handlers legados fora de React/createRoot no adapter', () => {
    const handlersSource = readFileSync('src/ui/controller/handlers/registroHandlers.js', 'utf8');
    const adapterSource = readFileSync('src/ui/views/registro.js', 'utf8');

    expect(handlersSource).toContain('REGISTRO_SIGNATURE_ACTIONS.capture');
    expect(handlersSource).toContain('REGISTRO_SIGNATURE_ACTIONS.open');
    expect(handlersSource).toContain('REGISTRO_SIGNATURE_ACTIONS.remove');
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
  });
});
