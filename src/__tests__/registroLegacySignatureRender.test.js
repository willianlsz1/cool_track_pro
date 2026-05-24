import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';

const mocks = vi.hoisted(() => ({
  getState: vi.fn(),
  findEquip: vi.fn(),
  setState: vi.fn(),
  lastRegForEquip: vi.fn(),
  goTo: vi.fn(),
  setRouteGuard: vi.fn(),
  clearRouteGuard: vi.fn(),
  customConfirmShow: vi.fn(),
  attachDialogA11y: vi.fn(() => vi.fn()),
  photosClear: vi.fn(),
  uploadPendingPhotos: vi.fn(),
  getOperationalStatus: vi.fn(),
  validateOperationalPayload: vi.fn(),
  reconcileEquipmentStatusesAfterRegistroEdit: vi.fn(),
  trackEvent: vi.fn(),
  withSkeleton: vi.fn((_el, _opts, renderFn) => renderFn()),
  isCachedPlanPlusOrHigher: vi.fn(),
  isCachedPlanPro: vi.fn(),
  postSaveToastShow: vi.fn(),
  exportPdfFlow: vi.fn(),
  shareWhatsAppFlow: vi.fn(),
  bindSmartContactMaskInput: vi.fn(),
  profileDefaultTecnico: vi.fn(),
  handleError: vi.fn(),
  resolveSignatureForRecord: vi.fn(),
  createSignatureCanvas: vi.fn(() => ({
    clear: vi.fn(),
    hasSignature: vi.fn(() => false),
    toDataUrl: vi.fn(() => 'data:image/png;base64,aW1hZ2U='),
  })),
  toastWarning: vi.fn(),
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
  attachDialogA11y: mocks.attachDialogA11y,
}));

vi.mock('../core/toast.js', () => ({
  Toast: { warning: mocks.toastWarning, info: vi.fn(), success: vi.fn() },
}));

vi.mock('../ui/components/photos.js', () => ({
  Photos: { clear: mocks.photosClear, pending: [] },
}));

vi.mock('../ui/components/onboarding.js', () => ({
  SavedHighlight: { markForHighlight: vi.fn() },
}));

vi.mock('../core/profile.js', () => ({
  Profile: { getDefaultTecnico: mocks.profileDefaultTecnico },
}));

vi.mock('../core/errors.js', () => ({
  ErrorCodes: { VALIDATION_ERROR: 'VALIDATION_ERROR', NETWORK_ERROR: 'NETWORK_ERROR' },
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

vi.mock('../ui/controller/handlers/reportExportHandlers.js', () => ({
  exportPdfFlow: mocks.exportPdfFlow,
  shareWhatsAppFlow: mocks.shareWhatsAppFlow,
}));

vi.mock('../core/phoneMask.js', () => ({
  bindSmartContactMaskInput: mocks.bindSmartContactMaskInput,
}));

vi.mock('../ui/components/signature/signature-storage.js', () => ({
  resolveSignatureForRecord: mocks.resolveSignatureForRecord,
}));

vi.mock('../ui/components/signature/signature-canvas.js', () => ({
  createSignatureCanvas: mocks.createSignatureCanvas,
}));

const SAFE_SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
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
      },
    ],
    registros: [],
    clientes: [],
    setores: [],
    ...overrides,
  };
}

function setupRegistroDom(state = baseState()) {
  document.body.innerHTML = renderShellViews();
  const select = document.getElementById('r-equip');
  for (const equipamento of state.equipamentos || []) {
    const option = document.createElement('option');
    option.value = equipamento.id;
    option.textContent = equipamento.nome;
    select.appendChild(option);
  }
}

async function loadRegistroView(state = baseState(), { plus = false } = {}) {
  mocks.getState.mockReturnValue(state);
  mocks.findEquip.mockImplementation(
    (id) => state.equipamentos?.find((equipamento) => equipamento.id === id) || null,
  );
  mocks.lastRegForEquip.mockReturnValue(null);
  mocks.isCachedPlanPlusOrHigher.mockReturnValue(plus);
  mocks.profileDefaultTecnico.mockReturnValue('Tecnico Padrao');
  mocks.getOperationalStatus.mockReturnValue({ uiStatus: 'ok', label: 'Em dia' });
  mocks.validateOperationalPayload.mockReturnValue({ valid: true, errors: [], value: {} });

  return import('../ui/views/registro.js');
}

async function flushRegistroRender() {
  if (typeof vi.dynamicImportSettled === 'function') {
    await vi.dynamicImportSettled();
  }
  await Promise.resolve();
  await Promise.resolve();
}

function expectNoUnsafeMarkup(root) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect(root.querySelector('[onerror]')).toBeNull();
  root.querySelectorAll('[href], [src]').forEach((node) => {
    const values = ['href', 'src'].map((attr) => node.getAttribute(attr)).filter(Boolean);
    values.forEach((value) => {
      expect(value.toLowerCase()).not.toContain('javascript:');
      expect(value.toLowerCase()).not.toContain('data:text/html');
      expect(value.toLowerCase()).not.toContain('image/svg+xml');
    });
  });
}

function expectCriticalFlowsNotExecuted() {
  expect(mocks.setState).not.toHaveBeenCalled();
  expect(mocks.uploadPendingPhotos).not.toHaveBeenCalled();
  expect(mocks.postSaveToastShow).not.toHaveBeenCalled();
  expect(mocks.exportPdfFlow).not.toHaveBeenCalled();
  expect(mocks.shareWhatsAppFlow).not.toHaveBeenCalled();
  expect(mocks.customConfirmShow).not.toHaveBeenCalled();
}

describe('registro legacy signature render adapter', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T09:30:00'));
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
  });

  it('preserva estado sem assinatura para plano free com hint, CTA e acoes publicas', async () => {
    const state = baseState();
    setupRegistroDom(state);
    const registro = await loadRegistroView(state, { plus: false });

    registro.initRegistro();
    await flushRegistroRender();

    const view = document.querySelector('#view-registro');
    const hint = view.querySelector('#registro-signature-hint');
    expect(hint.hidden).toBe(false);
    expect(hint.classList.contains('registro-sig-hint')).toBe(true);
    expect(hint.classList.contains('registro-sig-hint--upsell')).toBe(true);
    expect(hint.querySelector('.registro-sig-hint__title')?.textContent).toContain(
      'Assinatura do cliente',
    );
    expect(hint.querySelector('.registro-sig-hint__badge--plus')?.textContent).toBe('Indisponivel');

    const cta = hint.querySelector('[data-action="signature-upsell-cta"]');
    expect(cta?.tagName).toBe('BUTTON');
    expect(cta?.getAttribute('type')).toBe('button');
    expect(cta?.disabled).toBe(true);
    expect(document.querySelector('#tour-signature-anchor')).not.toBeNull();
    expect(document.querySelector('[data-action="save-registro"]')).not.toBeNull();
    expect(document.querySelector('[data-action="save-and-share-registro"]')).not.toBeNull();

    expectNoUnsafeMarkup(hint);
    expectCriticalFlowsNotExecuted();
    expect(mocks.goTo).not.toHaveBeenCalled();
  });

  it('preserva estado Plus com assinatura inclusa sem abrir captura real', async () => {
    const state = baseState();
    setupRegistroDom(state);
    const registro = await loadRegistroView(state, { plus: true });

    registro.initRegistro();
    await flushRegistroRender();

    const hint = document.querySelector('#registro-signature-hint');
    expect(hint.hidden).toBe(false);
    expect(hint.classList.contains('registro-sig-hint')).toBe(true);
    expect(hint.classList.contains('registro-sig-hint--upsell')).toBe(false);
    expect(hint.querySelector('.registro-sig-hint__title')?.textContent).toBe(
      'Assinatura do cliente',
    );
    expect(hint.querySelector('.registro-sig-hint__badge')?.textContent).toBe('Incluso');
    expect(hint.querySelector('[data-action="signature-upsell-cta"]')).toBeNull();
    expect(document.querySelector('#modal-signature-overlay')).toBeNull();

    expectNoUnsafeMarkup(hint);
    expectCriticalFlowsNotExecuted();
  });

  it('preserva contratos DOM da captura de assinatura com canvas mockado', async () => {
    const { SignatureModal } = await import('../ui/components/signature/signature-modal.js');

    const request = SignatureModal.request('reg-1', MALICIOUS);

    const overlay = document.getElementById('modal-signature-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.classList.contains('sig-capture-modal')).toBe(true);
    expect(overlay.dataset.blockingLayer).toBe('signature-capture');
    expect(overlay.getAttribute('role')).toBe('dialog');
    expect(document.getElementById('sig-title')?.textContent).toBe('Assinatura do cliente');
    expect(document.getElementById('sig-canvas')).not.toBeNull();
    expect(document.getElementById('sig-placeholder')?.textContent).toContain('Assine aqui');
    expect(document.getElementById('sig-clear')?.textContent).toContain('Limpar');
    expect(document.querySelector('[data-action="sig-skip"]')?.id).toBe('sig-skip');
    expect(document.querySelector('[data-action="sig-cancel"]')).not.toBeNull();
    expect(document.getElementById('sig-confirm')?.textContent).toContain('Confirmar assinatura');
    expect(mocks.createSignatureCanvas).toHaveBeenCalledTimes(1);

    expectNoUnsafeMarkup(overlay);
    expectCriticalFlowsNotExecuted();

    document.querySelector('[data-action="sig-cancel"]')?.click();
    await expect(request).resolves.toBe(SignatureModal.CANCELED);
  });

  it('renderiza preview seguro de assinatura no viewer legado sem executar modal externo', async () => {
    mocks.resolveSignatureForRecord.mockResolvedValue(SAFE_SIGNATURE);
    const { SignatureViewerModal } =
      await import('../ui/components/signature/signature-viewer-modal.js');

    await SignatureViewerModal.open(
      {
        id: 'reg-safe',
        data: '2026-04-30T09:00',
        clienteNome: MALICIOUS,
        clienteDocumento: MALICIOUS,
        tipo: MALICIOUS,
        assinatura: true,
      },
      { equipNome: MALICIOUS },
    );

    const overlay = document.getElementById('modal-signature-viewer-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.classList.contains('hist-signature-modal')).toBe(true);
    expect(overlay.dataset.blockingLayer).toBe('signature-viewer');
    expect(document.getElementById('sig-viewer-title')?.textContent).toBe('Assinatura do cliente');
    expect(overlay.querySelector('[data-action="close-viewer"]')).not.toBeNull();

    const image = overlay.querySelector('.hist-signature-modal__image');
    expect(image).not.toBeNull();
    expect(image.getAttribute('src')).toContain('data:image/png;base64');
    expect(image.getAttribute('alt')).toContain('Assinatura do cliente');
    expect(overlay.textContent).toContain(MALICIOUS);
    expectNoUnsafeMarkup(overlay);
    expectCriticalFlowsNotExecuted();
  });

  it('bloqueia previews inseguros de assinatura e mantem estado indisponivel', async () => {
    const unsafeSources = [
      'javascript:alert(1)',
      `data:text/html,${MALICIOUS}`,
      'data:image/svg+xml,<svg onload="alert(1)"></svg>',
    ];
    const { SignatureViewerModal } =
      await import('../ui/components/signature/signature-viewer-modal.js');

    for (const source of unsafeSources) {
      mocks.resolveSignatureForRecord.mockResolvedValueOnce(source);

      await SignatureViewerModal.open({ id: `reg-${source.slice(0, 5)}`, assinatura: true });

      const overlay = document.getElementById('modal-signature-viewer-overlay');
      expect(overlay.querySelector('.hist-signature-modal__image')).toBeNull();
      expect(overlay.querySelector('.hist-signature-modal__missing')).not.toBeNull();
      expect(overlay.textContent).not.toContain('alert(1)');
      expectNoUnsafeMarkup(overlay);

      SignatureViewerModal.closeIfOpen();
    }
  });

  it('mantem assinatura legada sem dependencia direta de React/createRoot em registro.js', () => {
    const source = readFileSync('src/ui/views/registro.js', 'utf8');

    expect(source).not.toMatch(/from ['"]react['"]|react-dom|createRoot/);
  });
});
