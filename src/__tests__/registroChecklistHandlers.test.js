import { readFileSync } from 'node:fs';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => {
  const handlers = new Map();
  return {
    handlers,
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
  Photos: { clear: mocks.photosClear },
}));

vi.mock('../ui/components/onboarding.js', () => ({
  SavedHighlight: { markForHighlight: vi.fn() },
}));

vi.mock('../features/profile.js', () => ({
  Profile: { getDefaultTecnico: mocks.profileDefaultTecnico },
}));

vi.mock('../core/errors.js', () => ({
  ErrorCodes: { VALIDATION_ERROR: 'VALIDATION_ERROR' },
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

async function loadRegistroView(state = baseState()) {
  mocks.getState.mockReturnValue(state);
  mocks.findEquip.mockImplementation(
    (id) => state.equipamentos?.find((equipamento) => equipamento.id === id) || null,
  );
  mocks.lastRegForEquip.mockReturnValue(null);
  mocks.isCachedPlanPlusOrHigher.mockReturnValue(false);
  mocks.profileDefaultTecnico.mockReturnValue('Tecnico Padrao');
  mocks.getOperationalStatus.mockReturnValue({ uiStatus: 'ok', label: 'Em dia' });
  mocks.validateOperationalPayload.mockReturnValue({ valid: true, errors: [], value: {} });

  return import('../ui/views/registro.js');
}

async function flushAsyncWork() {
  if (typeof vi.dynamicImportSettled === 'function') {
    await vi.dynamicImportSettled();
  }
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
  }
}

async function renderRegistroChecklist(state = baseState()) {
  setupDom(state);
  const registro = await loadRegistroView(state);
  const { bindRegistroHandlers } = await import('../ui/controller/handlers/registroHandlers.js');
  bindRegistroHandlers();

  await act(async () => {
    registro.initRegistro({ equipId: 'eq-1' });
    await flushAsyncWork();
    registro.renderChecklist();
    await flushAsyncWork();
  });

  const body = document.getElementById('r-checklist-body');
  expect(document.getElementById('registro-header-root')?.dataset.reactRegistroHeaderMounted).toBe(
    'true',
  );
  expect(body?.dataset.reactRegistroChecklistMounted).toBe('true');

  return {
    registro,
    body,
    summary: document.getElementById('r-checklist-summary'),
    statusHandler: mocks.handlers.get('r-checklist-set'),
    quickTemplateHandler: mocks.handlers.get('quick-service-template'),
  };
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

function expectNoUnsafeMarkup(root) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect(root.querySelector('[onerror]')).toBeNull();
  root.querySelectorAll('[href], [src]').forEach((node) => {
    const values = ['href', 'src'].map((attr) => node.getAttribute(attr)).filter(Boolean);
    values.forEach((value) => expect(value.toLowerCase()).not.toContain('javascript:'));
  });
}

function getChecklistItem(registro, id) {
  return registro.getCurrentChecklist()?.items.find((item) => item.id === id);
}

describe('registro React checklist legacy handlers contract', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.handlers.clear();
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

  it('aciona tri-state legado lendo data-item-id, data-status e atualizando resumo', async () => {
    const { registro, body, summary, statusHandler } = await renderRegistroChecklist();
    expect(statusHandler).toBeTypeOf('function');

    const okButton = body.querySelector('[data-action="r-checklist-set"][data-status="ok"]');
    const failButton = body.querySelector('[data-action="r-checklist-set"][data-status="fail"]');
    expect(okButton.dataset.item).toBe('filtros_limpeza');
    expect(okButton.dataset.itemId).toBe('filtros_limpeza');
    expect(okButton.getAttribute('aria-pressed')).toBe('false');

    delete okButton.dataset.item;
    await act(async () => {
      statusHandler(okButton);
      await Promise.resolve();
    });

    expect(okButton.classList.contains('is-active')).toBe(true);
    expect(okButton.getAttribute('aria-pressed')).toBe('true');
    expect(failButton.getAttribute('aria-pressed')).toBe('false');
    expect(getChecklistItem(registro, 'filtros_limpeza')?.status).toBe('ok');
    expect(summary.textContent).toMatch(/1\/\d+ itens preenchidos/);

    await act(async () => {
      statusHandler(okButton);
      await Promise.resolve();
    });

    expect(okButton.classList.contains('is-active')).toBe(false);
    expect(okButton.getAttribute('aria-pressed')).toBe('false');
    expect(registro.getCurrentChecklist()).toBeNull();
    expectExternalFlowsNotExecuted();
  });

  it('preserva observacao e medicao via handlers legados lendo data-item-id e data-unit', async () => {
    const { registro, body, statusHandler } = await renderRegistroChecklist();
    const failButton = body.querySelector('[data-item="filtros_limpeza"][data-status="fail"]');

    await act(async () => {
      statusHandler(failButton);
      await Promise.resolve();
    });

    const obs = body.querySelector(
      'textarea[data-action="r-checklist-obs"][data-item="filtros_limpeza"]',
    );
    const measure = body.querySelector(
      'input[data-action="r-checklist-measure"][data-item="tensao_alimentacao"]',
    );
    expect(obs.dataset.itemId).toBe('filtros_limpeza');
    expect(measure.dataset.itemId).toBe('tensao_alimentacao');
    expect(measure.dataset.unit).toBe('V');

    delete obs.dataset.item;
    delete measure.dataset.item;
    await act(async () => {
      obs.value = 'Filtro saturado antes da limpeza.';
      obs.dispatchEvent(new Event('input', { bubbles: true }));
      measure.value = '231.5';
      measure.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });

    expect(getChecklistItem(registro, 'filtros_limpeza')?.obs).toBe(
      'Filtro saturado antes da limpeza.',
    );
    expect(getChecklistItem(registro, 'tensao_alimentacao')?.measure).toEqual({
      value: 231.5,
      unit: 'V',
    });
    expectExternalFlowsNotExecuted();
  });

  it('mantem checklist React compativel apos quick-service-template sem salvar registro', async () => {
    const { body, quickTemplateHandler, statusHandler } = await renderRegistroChecklist();
    const chip = document.querySelector(
      '#registro-header-root [data-action="quick-service-template"][data-template="limpeza"]',
    );
    expect(quickTemplateHandler).toBeTypeOf('function');
    expect(chip).not.toBeNull();

    await act(async () => {
      quickTemplateHandler(chip);
      await flushAsyncWork();
    });

    expect(document.getElementById('r-tipo')?.value).toBe('Limpeza de Filtros');
    expect(body.dataset.reactRegistroChecklistMounted).toBe('true');
    expect(body.querySelector('[data-action="r-checklist-set"][data-item-id]')).not.toBeNull();

    await act(async () => {
      statusHandler(body.querySelector('[data-item="filtros_limpeza"][data-status="ok"]'));
      await Promise.resolve();
    });

    expect(document.getElementById('r-checklist-summary')?.textContent).toContain(
      'Limpeza de Filtros',
    );
    expectExternalFlowsNotExecuted();
  });

  it('ignora payloads maliciosos em data-* sem executar fluxos externos ou injetar HTML', async () => {
    const { registro, body, statusHandler } = await renderRegistroChecklist(
      baseState({
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
      }),
    );

    const maliciousButton = body.querySelector('[data-action="r-checklist-set"][data-status="ok"]');
    maliciousButton.dataset.item = 'javascript:alert(1)';
    maliciousButton.dataset.itemId = 'javascript:alert(2)';

    await act(async () => {
      statusHandler(maliciousButton);
      await Promise.resolve();
    });

    const obs = body.querySelector('[data-action="r-checklist-obs"]');
    const measure = body.querySelector('[data-action="r-checklist-measure"]');
    obs.dataset.item = 'javascript:alert(3)';
    obs.dataset.itemId = 'javascript:alert(4)';
    measure.dataset.item = 'javascript:alert(5)';
    measure.dataset.itemId = 'javascript:alert(6)';
    measure.dataset.unit = 'javascript:alert(7)';

    await act(async () => {
      obs.value = MALICIOUS;
      obs.dispatchEvent(new Event('input', { bubbles: true }));
      measure.value = '220';
      measure.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });

    expect(registro.getCurrentChecklist()).toBeNull();
    expectNoUnsafeMarkup(body);
    expectExternalFlowsNotExecuted();
  });

  it('mantem handlers legados e createRoot fora do adapter de Registro', () => {
    const handlersSource = readFileSync('src/ui/controller/handlers/registroHandlers.js', 'utf8');
    const adapterSource = readFileSync('src/ui/views/registro.js', 'utf8');

    expect(handlersSource).toContain("on('r-checklist-set'");
    expect(handlersSource).toContain("data-action='r-checklist-obs'");
    expect(handlersSource).toContain("action === 'r-checklist-measure'");
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
  });
});
