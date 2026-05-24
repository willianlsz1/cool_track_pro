import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  getState: vi.fn(),
  findEquip: vi.fn(),
  setState: vi.fn(),
  lastRegForEquip: vi.fn(),
  goTo: vi.fn(),
  setRouteGuard: vi.fn(),
  clearRouteGuard: vi.fn(),
  customConfirmShow: vi.fn(),
  photosClear: vi.fn(),
  photosRender: vi.fn(),
  photosUnmount: vi.fn(),
  uploadPendingPhotos: vi.fn(),
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
  profileGet: vi.fn(() => ({})),
  profileSave: vi.fn(),
  profileSaveLastTecnico: vi.fn(),
  handleError: vi.fn(),
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

vi.mock('../ui/components/photos.js', () => ({
  Photos: {
    pending: [],
    clear: mocks.photosClear,
    render: mocks.photosRender,
    unmount: mocks.photosUnmount,
  },
}));

vi.mock('../ui/components/onboarding.js', () => ({
  SavedHighlight: { markForHighlight: vi.fn() },
}));

vi.mock('../core/profile.js', () => ({
  Profile: {
    getDefaultTecnico: mocks.profileDefaultTecnico,
    get: mocks.profileGet,
    save: mocks.profileSave,
    saveLastTecnico: mocks.profileSaveLastTecnico,
  },
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
  isCachedPlanPro: mocks.isCachedPlanPro,
}));

vi.mock('../ui/components/postSaveRegistroToast.js', () => ({
  PostSaveRegistroToast: { show: mocks.postSaveToastShow },
}));

vi.mock('../core/phoneMask.js', () => ({
  bindSmartContactMaskInput: mocks.bindSmartContactMaskInput,
}));

const CHECKLIST = {
  tipo_template: 'split_hi_wall',
  version: 1,
  items: [{ id: 'filtros_limpeza', status: 'ok', obs: 'Filtros limpos.' }],
};

function baseState(overrides = {}) {
  return {
    equipamentos: [
      {
        id: 'eq-1',
        nome: 'Split Recepcao',
        tipo: 'Split Hi-Wall',
        local: 'Recepcao',
        clienteId: 'cliente-1',
        setorId: 'setor-1',
      },
      {
        id: 'eq-2',
        nome: 'Chiller Cobertura',
        tipo: 'Chiller',
        local: 'Cobertura',
      },
    ],
    registros: [
      {
        id: 'reg-1',
        equipId: 'eq-1',
        data: '2026-04-30T09:00',
        tipo: 'Manutenção Preventiva',
        obs: 'Limpeza preventiva realizada com testes finais.',
        tecnico: 'Ana',
        status: 'ok',
        prioridade: 'alta',
        clienteNome: 'Cliente ACME',
        clienteDocumento: '00.000.000/0001-00',
        localAtendimento: 'Rua Um',
        clienteContato: '(11) 90000-0000',
        fotos: [{ url: 'foto-1.jpg' }],
        assinatura: true,
        checklist: CHECKLIST,
      },
    ],
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

async function flushAsyncWork() {
  if (typeof vi.dynamicImportSettled === 'function') {
    await vi.dynamicImportSettled();
  }
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
  }
}

async function loadRegistro(state = baseState()) {
  mocks.getState.mockReturnValue(state);
  mocks.findEquip.mockImplementation(
    (id) => state.equipamentos?.find((equipamento) => equipamento.id === id) || null,
  );
  mocks.lastRegForEquip.mockReturnValue(null);
  mocks.isCachedPlanPlusOrHigher.mockReturnValue(true);
  mocks.isCachedPlanPro.mockReturnValue(true);
  mocks.profileDefaultTecnico.mockReturnValue('Tecnico Padrao');
  mocks.getOperationalStatus.mockReturnValue({ uiStatus: 'ok', label: 'Em dia' });
  mocks.validateOperationalPayload.mockReturnValue({ valid: true, errors: [], value: {} });
  mocks.uploadPendingPhotos.mockResolvedValue({ photos: [], failedCount: 0 });
  return import('../ui/views/registro.js');
}

async function init(registro, params = {}) {
  await act(async () => {
    registro.initRegistro(params);
    await flushAsyncWork();
  });
}

describe('registro lifecycle contract', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T09:30:00'));
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
  });

  it('initRegistro aceita root ausente e inicializa roots, defaults e actions publicas quando a view existe', async () => {
    const state = baseState({ registros: [] });
    const registro = await loadRegistro(state);

    expect(() => registro.initRegistro({ equipId: 'eq-1' })).not.toThrow();

    setupDom(state);
    await init(registro, { equipId: 'eq-1' });

    expect(document.getElementById('view-registro')).not.toBeNull();
    expect(document.getElementById('registro-header-root')?.dataset.registroHeaderMounted).toBe(
      'true',
    );
    expect(
      document.getElementById('registro-signature-hint')?.dataset.registroSignatureMounted,
    ).toBe('true');
    expect(document.getElementById('r-equip')?.value).toBe('eq-1');
    expect(document.getElementById('r-data')?.value).toBe('2026-05-01T09:30');
    expect(document.getElementById('r-tecnico')?.value).toBe('Tecnico Padrao');
    expect(document.querySelector('[data-action="clear-registro"]')).not.toBeNull();
    expect(document.querySelector('[data-action="save-registro"]')).not.toBeNull();
    expect(mocks.photosRender).toHaveBeenCalledTimes(1);
  });

  it('clearRegistro preserva equipamento opcionalmente, limpa modo edicao e reseta fotos assinatura e Checklist PMOC', async () => {
    const state = baseState();
    setupDom(state);
    const registro = await loadRegistro(state);

    await init(registro, { editRegistroId: 'reg-1' });
    registro.loadRegistroForEdit('reg-1');

    expect(sessionStorage.getItem('cooltrack-editing-id')).toBe('reg-1');
    expect(document.getElementById('view-registro')?.dataset.editMode).toBe('1');
    expect(registro.getCurrentChecklist()).toEqual(
      expect.objectContaining({ tipo_template: 'split_hi_wall' }),
    );

    await act(async () => {
      registro.clearRegistro(true);
      await flushAsyncWork();
    });

    expect(document.getElementById('r-equip')?.value).toBe('eq-1');
    expect(document.getElementById('r-obs')?.value).toBe('');
    expect(document.getElementById('r-data')?.value).toBe('2026-05-01T09:30');
    expect(sessionStorage.getItem('cooltrack-editing-id')).toBeNull();
    expect(document.getElementById('view-registro')?.dataset.editMode).toBe('0');
    expect(mocks.clearRouteGuard).toHaveBeenCalled();
    expect(mocks.photosClear).toHaveBeenCalledTimes(1);
    expect(
      document.getElementById('registro-signature-hint')?.dataset.registroSignatureMounted,
    ).toBe('true');
    expect(registro.getCurrentChecklist()).toBeNull();
  });

  it('loadRegistroForEdit preenche campos principais, ativa modo edicao e restaura Checklist PMOC', async () => {
    const state = baseState();
    setupDom(state);
    const registro = await loadRegistro(state);

    await init(registro);
    registro.loadRegistroForEdit('reg-1');

    expect(document.getElementById('view-registro')?.dataset.editMode).toBe('1');
    expect(sessionStorage.getItem('cooltrack-editing-id')).toBe('reg-1');
    expect(mocks.setRouteGuard).toHaveBeenCalledTimes(1);
    expect(document.getElementById('r-equip')?.value).toBe('eq-1');
    expect(document.getElementById('r-data')?.value).toBe('2026-04-30T09:00');
    expect(document.getElementById('r-tipo')?.value).toBe('Manutenção Preventiva');
    expect(document.getElementById('r-obs')?.value).toBe(
      'Limpeza preventiva realizada com testes finais.',
    );
    expect(document.getElementById('r-tecnico')?.value).toBe('Ana');
    expect(document.getElementById('r-status')?.value).toBe('ok');
    expect(document.getElementById('r-prioridade')?.value).toBe('alta');
    expect(registro.getCurrentChecklist()).toEqual(
      expect.objectContaining({ items: CHECKLIST.items }),
    );
    expect(
      document.querySelector('[data-action="save-registro"]')?.classList.contains('btn--editing'),
    ).toBe(true);
  });

  it('loadRegistroForEdit falha silenciosamente para id ausente sem corromper sequencia init -> clear -> load', async () => {
    const state = baseState();
    setupDom(state);
    const registro = await loadRegistro(state);

    await init(registro, { equipId: 'eq-2' });
    await act(async () => {
      registro.clearRegistro(true);
      await flushAsyncWork();
    });

    const beforeMissingLoad = {
      equip: document.getElementById('r-equip')?.value,
      editMode: document.getElementById('view-registro')?.dataset.editMode,
      editingId: sessionStorage.getItem('cooltrack-editing-id'),
    };

    expect(() => registro.loadRegistroForEdit('missing-reg')).not.toThrow();

    expect(document.getElementById('r-equip')?.value).toBe(beforeMissingLoad.equip);
    expect(document.getElementById('view-registro')?.dataset.editMode).toBe(
      beforeMissingLoad.editMode,
    );
    expect(sessionStorage.getItem('cooltrack-editing-id')).toBe(beforeMissingLoad.editingId);
    expect(document.getElementById('registro-header-root')).not.toBeNull();
    expect(document.getElementById('r-checklist-body')).not.toBeNull();
    expect(document.getElementById('photo-preview')).not.toBeNull();
    expect(document.getElementById('registro-signature-hint')).not.toBeNull();
  });
});
