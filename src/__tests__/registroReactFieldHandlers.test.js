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
      {
        id: 'eq-2',
        nome: 'Chiller Cobertura',
        tag: 'CH-02',
        tipo: 'Chiller',
        local: 'Cobertura',
        clienteId: 'cliente-2',
        setorId: 'setor-2',
        periodicidadePreventivaDias: 45,
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
      {
        id: 'cliente-2',
        nome: 'Cliente Beta',
        documento: '11.111.111/0001-11',
        endereco: 'Rua Dois',
        contato: '(11) 91111-1111',
      },
    ],
    setores: [
      { id: 'setor-1', nome: 'Recepcao', clienteId: 'cliente-1' },
      { id: 'setor-2', nome: 'Cobertura', clienteId: 'cliente-2' },
    ],
    tecnicos: ['Tecnico Padrao', 'Ana'],
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

async function mountRegistroHeader(registro, params = {}) {
  await act(async () => {
    registro.initRegistro(params);
    await flushAsyncWork();
  });

  const root = document.getElementById('registro-header-root');
  expect(root).not.toBeNull();
  expect(root?.dataset.reactRegistroHeaderMounted).toBe('true');
  expect(document.querySelectorAll('[data-react-registro-header-mounted="true"]')).toHaveLength(1);
  return root;
}

async function changeField(id, value, eventName = 'change') {
  const field = document.getElementById(id);
  expect(field).not.toBeNull();
  await act(async () => {
    field.value = value;
    field.dispatchEvent(new Event(eventName, { bubbles: true }));
    await Promise.resolve();
  });
  return field;
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

describe('registro React header fields legacy handlers contract', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.handlers.clear();
    Element.prototype.scrollIntoView = vi.fn();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T09:30:00'));
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
  });

  it('mantem handlers legados de equipamento, contexto e progresso nos campos React', async () => {
    const state = baseState();
    setupDom(state);
    const registro = await loadRegistroView(state);

    await mountRegistroHeader(registro, { equipId: 'eq-1' });

    const equip = document.getElementById('r-equip');
    expect(equip.dataset.registroProgressBound).toBe('1');
    expect(equip.dataset.registroEquipWarningBound).toBe('1');
    expect(equip.dataset.registroChecklistBound).toBe('1');
    expect(document.getElementById('r-tipo')?.dataset.registroTipoBound).toBe('1');
    expect(document.getElementById('r-tecnico')?.dataset.registroProgressBound).toBe('1');
    expect(document.getElementById('r-obs')?.dataset.registroProgressBound).toBe('1');

    await changeField('r-equip', 'eq-2');

    expect(document.getElementById('r-equip')?.value).toBe('eq-2');
    expect(document.getElementById('registro-context-card')?.hidden).toBe(false);
    expect(document.getElementById('registro-context-cliente')?.textContent).toContain(
      'Cliente Beta',
    );
    expect(document.getElementById('registro-context-setor')?.textContent).toContain('Cobertura');
    expect(document.getElementById('registro-context-equip')?.textContent).toContain(
      'Chiller Cobertura',
    );
    expect(document.getElementById('r-checklist-details')?.hidden).toBe(false);

    await changeField('r-data', '2026-05-01T09:30');
    const tipoInspecao = Array.from(document.getElementById('r-tipo')?.options || []).find(
      (option) => option.textContent.includes('Inspe'),
    )?.value;
    expect(tipoInspecao).toBeTruthy();
    await changeField('r-tipo', tipoInspecao);
    await changeField('r-obs', 'Inspecao geral com verificacao completa do sistema.', 'input');
    await changeField('r-tecnico', 'Tecnico Padrao', 'input');

    expect(document.getElementById('form-progress-count')?.textContent).toBe('5');
    expect(document.getElementById('registro-hero-meter')?.getAttribute('aria-valuenow')).toBe('5');
    expect(document.getElementById('registro-hero')?.dataset.state).toBe('complete');
    expectExternalFlowsNotExecuted();
  });

  it('aciona quick-service-template legado a partir do data-action emitido pela ilha React', async () => {
    const state = baseState();
    setupDom(state);
    const registro = await loadRegistroView(state);
    const { bindRegistroHandlers } = await import('../ui/controller/handlers/registroHandlers.js');
    bindRegistroHandlers();

    const root = await mountRegistroHeader(registro, { equipId: 'eq-1' });
    const quickHandler = mocks.handlers.get('quick-service-template');
    expect(quickHandler).toBeTypeOf('function');

    const tipo = document.getElementById('r-tipo');
    await changeField('r-tipo', 'Outro');
    expect(document.getElementById('r-tipo-custom-wrap')?.hidden).toBe(false);
    expect(document.getElementById('r-tipo-custom')?.required).toBe(true);

    const chip = root.querySelector(
      '[data-action="quick-service-template"][data-template="limpeza"]',
    );
    expect(chip).not.toBeNull();
    expect(chip.dataset.action).toBe('quick-service-template');
    expect(chip.dataset.template).toBe('limpeza');
    expect(chip.dataset.color).toBeTruthy();

    await act(async () => {
      quickHandler(chip);
      await Promise.resolve();
    });

    expect(tipo.value).toBe('Limpeza de Filtros');
    expect(document.getElementById('r-tipo-custom-wrap')?.hidden).toBe(true);
    expect(document.getElementById('r-obs')?.value).toContain('Limpeza');
    expect(document.getElementById('r-prioridade')?.value).toBe('media');
    expect(document.getElementById('r-status')?.value).toBe('ok');
    expect(document.getElementById('r-data')?.value).toBeTruthy();
    expect(document.getElementById('r-tecnico')?.value).toBe('Tecnico Padrao');
    expect(chip.classList.contains('is-active')).toBe(true);
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    expect(document.getElementById('form-progress-count')?.textContent).toBe('5');
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
    expectExternalFlowsNotExecuted();
  });

  it('nao injeta HTML ao lidar com campos React e atributos data-* maliciosos', async () => {
    const state = baseState({
      equipamentos: [
        {
          id: 'eq-xss',
          nome: MALICIOUS,
          tag: MALICIOUS,
          tipo: 'Split Hi-Wall',
          local: MALICIOUS,
          clienteId: 'cliente-xss',
          setorId: 'setor-xss',
        },
      ],
      clientes: [
        {
          id: 'cliente-xss',
          nome: MALICIOUS,
          documento: MALICIOUS,
          endereco: MALICIOUS,
          contato: MALICIOUS,
        },
      ],
      setores: [{ id: 'setor-xss', nome: MALICIOUS, clienteId: 'cliente-xss' }],
      tecnicos: [MALICIOUS],
    });
    setupDom(state);
    const registro = await loadRegistroView(state);
    const { bindRegistroHandlers } = await import('../ui/controller/handlers/registroHandlers.js');
    bindRegistroHandlers();

    const root = await mountRegistroHeader(registro, { equipId: 'eq-xss' });
    await changeField('r-obs', MALICIOUS, 'input');
    await changeField('r-tecnico', MALICIOUS, 'input');

    const chip = root.querySelector('[data-action="quick-service-template"]');
    chip.dataset.template = 'javascript:alert(1)';
    await act(async () => {
      mocks.handlers.get('quick-service-template')(chip);
      await Promise.resolve();
    });

    expect(document.getElementById('r-obs')?.value).toBe(MALICIOUS);
    expect(document.getElementById('r-tecnico')?.value).toBe(MALICIOUS);
    expectNoUnsafeMarkup(root);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expectExternalFlowsNotExecuted();
  });

  it('mantem registro.js sem dependencia direta de React/createRoot', () => {
    const source = readFileSync('src/ui/views/registro.js', 'utf8');

    expect(source).not.toMatch(/from ['"]react['"]|react-dom|createRoot/);
  });
});
