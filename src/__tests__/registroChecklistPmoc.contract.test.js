import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  REGISTRO_ACTIONS,
  REGISTRO_DATA_ATTRIBUTES,
  REGISTRO_PUBLIC_CLASSES,
  REGISTRO_PUBLIC_IDS,
  REGISTRO_REACT_ROOTS,
} from '../ui/viewModels/registroContracts.js';
import { renderRegistroChecklistHtml } from '../ui/views/registro/checklistRenderer.js';
import { buildEmptyChecklist, validateChecklist } from '../domain/pmoc/checklistTemplates.js';
import {
  buildEditedRegistro,
  buildRegistroCreateRecord,
} from '../features/registro/save/persistence.js';
import { renderShellViews } from '../ui/shell/templates/views.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const autoTableMock = vi.hoisted(() =>
  vi.fn((doc, options) => {
    doc.__autoTableCalls.push(options);
    doc.lastAutoTable = { finalY: (options.startY || 0) + 10 };
  }),
);

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
  };
});

vi.mock('jspdf-autotable', () => ({
  default: autoTableMock,
}));

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

const persistedPayload = {
  equipId: 'eq-1',
  data: '2026-05-01T09:30',
  tipo: 'Preventiva',
  tecnico: 'Tecnico Padrao',
  descricaoFinal: 'Preventiva realizada com checklist PMOC em andamento.',
  prioridade: 'media',
  status: 'ok',
  pecas: '',
  proxima: '',
  custoPecas: '',
  custoMaoObra: '',
  clienteNome: 'Cliente ACME',
  clienteDocumento: '00.000.000/0001-00',
  localAtendimento: 'Recepcao',
  clienteContato: '(11) 90000-0000',
};

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

function createMarkedChecklist() {
  const checklist = buildEmptyChecklist('Split Hi-Wall');
  checklist.items.find((item) => item.id === 'filtros_limpeza').status = 'ok';
  checklist.items.find((item) => item.id === 'filtros_limpeza').obs = 'Filtro limpo.';
  checklist.items.find((item) => item.id === 'tensao_alimentacao').measure = {
    value: 220,
    unit: 'V',
  };
  return checklist;
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

function findOptionValue(selectId, labelPart) {
  const option = Array.from(document.getElementById(selectId)?.options || []).find((candidate) =>
    candidate.textContent.includes(labelPart),
  );
  expect(option).toBeTruthy();
  return option.value;
}

async function flushAsyncWork() {
  if (typeof vi.dynamicImportSettled === 'function') {
    await vi.dynamicImportSettled();
  }
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
  }
}

async function loadRegistro(state = baseState()) {
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
  mocks.isCachedPlanPlusOrHigher.mockReturnValue(false);
  mocks.isCachedPlanPro.mockReturnValue(true);
  mocks.profileDefaultTecnico.mockReturnValue('Tecnico Padrao');
  mocks.getOperationalStatus.mockReturnValue({
    uiStatus: 'ok',
    label: 'Operando normalmente',
  });
  mocks.validateOperationalPayload.mockReturnValue({ valid: true, errors: [], value: {} });
  mocks.uploadPendingPhotos.mockResolvedValue({ photos: [], failedCount: 0 });
  mocks.postSaveToastShow.mockReturnValue(true);
  mocks.shareWhatsAppFlow.mockResolvedValue(true);

  const registro = await import('../ui/views/registro.js');
  const { bindRegistroHandlers } = await import('../ui/controller/handlers/registroHandlers.js');
  bindRegistroHandlers();
  return registro;
}

async function preparePreventivaForm(registro) {
  await act(async () => {
    registro.initRegistro({ equipId: 'eq-1' });
    await flushAsyncWork();
  });

  await act(async () => {
    document.getElementById('r-equip').value = 'eq-1';
    document.getElementById('r-data').value = '2026-05-01T09:30';
    document.getElementById('r-tipo').value = findOptionValue('r-tipo', 'Preventiva');
    document.getElementById('r-obs').value =
      'Preventiva realizada com checklist PMOC em andamento.';
    document.getElementById('r-tecnico').value = 'Tecnico Padrao';
    document.getElementById('r-prioridade').value = 'media';
    document.getElementById('r-status').value = 'ok';
    registro.renderChecklist();
    await flushAsyncWork();
  });
}

async function triggerSaveRegistro() {
  const handler = mocks.handlers.get('save-registro');
  const button = document.querySelector('[data-action="save-registro"]');
  expect(handler).toBeTypeOf('function');
  expect(button).not.toBeNull();

  await act(async () => {
    await handler(button);
    await flushAsyncWork();
  });
}

function createDocMock() {
  return {
    __autoTableCalls: [],
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    line: vi.fn(),
    addPage: vi.fn(),
    lastAutoTable: null,
  };
}

describe('registro Checklist/PMOC contract', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.handlers.clear();
    mocks.stateRef.current = null;
    mocks.photos.pending = [];
    autoTableMock.mockClear();
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

  it('trava selectors, actions, atributos e classes publicas do Checklist/PMOC', () => {
    expect(REGISTRO_PUBLIC_IDS.checklistBody).toBe('r-checklist-body');
    expect(REGISTRO_REACT_ROOTS.checklist).toBe('r-checklist-body');
    expect(REGISTRO_ACTIONS.checklistSet).toBe('r-checklist-set');
    expect(REGISTRO_ACTIONS.checklistObs).toBe('r-checklist-obs');
    expect(REGISTRO_ACTIONS.checklistMeasure).toBe('r-checklist-measure');
    expect(REGISTRO_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-item-id', 'data-status', 'data-unit']),
    );
    expect(REGISTRO_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'r-checklist__body',
        'r-checklist__row',
        'r-checklist__status',
        'r-checklist__measure-input',
        'r-checklist__obs',
      ]),
    );

    const html = renderRegistroChecklistHtml({
      checklist: {
        label: 'Split Hi-Wall (NBR 13971)',
        groups: [
          {
            label: 'Mecanico',
            items: [
              {
                id: 'filtros_limpeza',
                label: 'Limpeza dos filtros de ar',
                mandatory: true,
                status: 'ok',
                obs: 'Filtro limpo.',
              },
              {
                id: 'tensao_alimentacao',
                label: 'Tensao de alimentacao',
                mandatory: true,
                status: null,
                obs: '',
                measurable: true,
                unit: 'V',
                measureValue: 220,
              },
            ],
          },
        ],
      },
      actions: {
        checklistSet: { action: REGISTRO_ACTIONS.checklistSet },
        checklistObs: { action: REGISTRO_ACTIONS.checklistObs },
        checklistMeasure: { action: REGISTRO_ACTIONS.checklistMeasure },
      },
    });

    expect(html).toContain('class="r-checklist__row');
    expect(html).toContain('data-action="r-checklist-set"');
    expect(html).toContain('data-action="r-checklist-obs"');
    expect(html).toContain('data-action="r-checklist-measure"');
    expect(html).toContain('data-item-id="filtros_limpeza"');
    expect(html).toContain('data-status="ok"');
    expect(html).toContain('class="r-checklist__measure-input"');
    expect(html).toContain('class="r-checklist__obs"');
  });

  it('trava validateChecklist como soft-required e preserva checklist na persistence CP-K', () => {
    const incompleteChecklist = createMarkedChecklist();
    const validation = validateChecklist(incompleteChecklist);

    expect(validation.complete).toBe(false);
    expect(validation.missing.length).toBeGreaterThan(0);
    expect(validation.missing[0]).toContain('Limpeza da serpentina');

    const created = buildRegistroCreateRecord({
      registroId: 'reg-1',
      persistedPayload,
      photoPayload: { fotos: [], fotos_pendentes: [] },
      assinaturaPayload: false,
      checklist: incompleteChecklist,
    });
    expect(created.checklist).toBe(incompleteChecklist);
    expect(created.checklist).toMatchObject({
      tipo_template: 'split_hi_wall',
      items: expect.arrayContaining([
        expect.objectContaining({ id: 'filtros_limpeza', status: 'ok' }),
      ]),
    });

    const edited = buildEditedRegistro(
      { id: 'reg-1', checklist: { tipo_template: 'old', items: [] } },
      persistedPayload,
      { currentChecklist: incompleteChecklist },
    );
    expect(edited.checklist).toBe(incompleteChecklist);
  });

  it('mantem warning soft-required como nao bloqueante no saveRegistro', async () => {
    const state = baseState();
    setupDom(state);
    const registro = await loadRegistro(state);
    await preparePreventivaForm(registro);

    const checklistButton = document.querySelector(
      '#r-checklist-body [data-action="r-checklist-set"][data-item-id="filtros_limpeza"][data-status="ok"]',
    );
    expect(checklistButton).not.toBeNull();

    await act(async () => {
      await mocks.handlers.get('r-checklist-set')(checklistButton);
      await Promise.resolve();
    });

    await triggerSaveRegistro();

    expect(mocks.toastWarning).toHaveBeenCalledWith(
      expect.stringContaining('itens obrigatórios pendentes'),
    );
    expect(mocks.setState).toHaveBeenCalled();
    const saved = mocks.stateRef.current.registros.at(-1);
    expect(saved).toMatchObject({
      equipId: 'eq-1',
      tipo: 'Manutenção Preventiva',
      checklist: expect.objectContaining({
        tipo_template: 'split_hi_wall',
        items: expect.arrayContaining([
          expect.objectContaining({ id: 'filtros_limpeza', status: 'ok' }),
        ]),
      }),
    });
    expect(mocks.postSaveToastShow).toHaveBeenCalledWith(
      expect.objectContaining({ equipId: 'eq-1', registroId: saved.id }),
    );
  });

  it('mantem warning soft-required como nao bloqueante quando preventiva nao tem checklist marcado', async () => {
    const state = baseState();
    setupDom(state);
    const registro = await loadRegistro(state);
    await preparePreventivaForm(registro);

    await triggerSaveRegistro();

    expect(mocks.toastWarning).toHaveBeenCalledWith(expect.stringContaining('Sem checklist NBR'));
    expect(mocks.setState).toHaveBeenCalled();
    const saved = mocks.stateRef.current.registros.at(-1);
    expect(saved).toMatchObject({
      equipId: 'eq-1',
      tipo: 'Manutenção Preventiva',
      checklist: null,
    });
    expect(mocks.postSaveToastShow).toHaveBeenCalledWith(
      expect.objectContaining({ equipId: 'eq-1', registroId: saved.id }),
    );
  });

  it('trava consumo PDF/relatorio de registro.checklist usando tipo_template e items marcados', async () => {
    const { drawChecklist } = await import('../domain/pdf/sections/checklist.js');
    const checklist = createMarkedChecklist();
    const doc = createDocMock();

    const nextY = drawChecklist(
      doc,
      210,
      297,
      12,
      40,
      [
        {
          id: 'reg-1',
          equipId: 'eq-1',
          data: '2026-05-01T09:30:00.000Z',
          checklist,
        },
      ],
      [{ id: 'eq-1', nome: 'Split Recepcao' }],
    );

    expect(nextY).toBeGreaterThan(40);
    expect(doc.text).toHaveBeenCalledWith(
      'CHECKLIST NBR 13971',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object),
    );
    expect(doc.text).toHaveBeenCalledWith(
      expect.stringContaining('Split Recepcao'),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object),
    );
    expect(autoTableMock).toHaveBeenCalled();
    expect(doc.__autoTableCalls[0].body).toEqual([
      ['Limpeza dos filtros de ar', 'Conforme', '', 'Filtro limpo.'],
    ]);
    expect(JSON.stringify(doc.__autoTableCalls)).not.toContain('Tensao de alimentacao');
  });
});
