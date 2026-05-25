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
  photosClear: vi.fn(),
  getOperationalStatus: vi.fn(),
  validateOperationalPayload: vi.fn(),
  reconcileEquipmentStatusesAfterRegistroEdit: vi.fn(),
  trackEvent: vi.fn(),
  withSkeleton: vi.fn((_el, _opts, renderFn) => renderFn()),
  isCachedPlanPro: vi.fn(),
  postSaveToastShow: vi.fn(),
  bindSmartContactMaskInput: vi.fn(),
  profileDefaultTecnico: vi.fn(),
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

vi.mock('../ui/components/onboarding.js', () => ({
  SavedHighlight: { markForHighlight: vi.fn() },
}));

vi.mock('../core/profile.js', () => ({
  Profile: { getDefaultTecnico: mocks.profileDefaultTecnico },
}));

vi.mock('../core/errors.js', () => ({
  ErrorCodes: { VALIDATION_ERROR: 'VALIDATION_ERROR' },
  handleError: mocks.handleError,
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
  isCachedPlanPro: mocks.isCachedPlanPro,
}));

vi.mock('../ui/components/postSaveRegistroToast.js', () => ({
  PostSaveRegistroToast: { show: mocks.postSaveToastShow },
}));

vi.mock('../core/phoneMask.js', () => ({
  bindSmartContactMaskInput: mocks.bindSmartContactMaskInput,
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
    registros: [
      {
        id: 'reg-1',
        equipId: 'eq-1',
        data: '2026-04-30T09:00',
        tipo: 'Manutenção Preventiva',
        obs: 'Limpeza preventiva realizada com testes finais.',
        tecnico: 'Ana',
        status: 'ok',
        clienteNome: 'Cliente ACME',
        clienteDocumento: '00.000.000/0001-00',
        localAtendimento: 'Rua Um',
        clienteContato: '(11) 90000-0000',
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
  mocks.isCachedPlanPro.mockReturnValue(true);
  mocks.profileDefaultTecnico.mockReturnValue('Tecnico Padrao');
  mocks.getOperationalStatus.mockReturnValue({ uiStatus: 'ok', label: 'Em dia' });
  mocks.validateOperationalPayload.mockReturnValue({ valid: true, errors: [], value: {} });

  return import('../ui/views/registro.js');
}

function expectClass(element, className) {
  expect(element?.classList.contains(className)).toBe(true);
}

function expectNoUnsafeMarkup(root) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect(root.querySelector('[onerror]')).toBeNull();
  expect(root.querySelector('img')).toBeNull();
  root.querySelectorAll('[href], [src]').forEach((node) => {
    const values = ['href', 'src'].map((attr) => node.getAttribute(attr)).filter(Boolean);
    values.forEach((value) => expect(value.toLowerCase()).not.toContain('javascript:'));
  });
}

function expectExternalFlowsNotExecuted() {
  expect(mocks.setState).not.toHaveBeenCalled();
  expect(mocks.postSaveToastShow).not.toHaveBeenCalled();
  expect(mocks.goTo).not.toHaveBeenCalled();
  expect(mocks.customConfirmShow).not.toHaveBeenCalled();
}

describe('registro DOM header/hero/main fields render adapter', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T09:30:00'));
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
  });

  it('renderiza estado novo preservando hero, campos principais e botoes como contratos DOM', async () => {
    const state = baseState({ registros: [] });
    setupDom(state);
    const registro = await loadRegistroView(state);

    registro.initRegistro();

    const view = document.querySelector('#view-registro');
    expect(view).not.toBeNull();
    expectClass(view, 'view');

    const hero = view.querySelector('#registro-hero');
    expectClass(hero, 'registro-hero');
    expect(hero.getAttribute('data-state')).toBeTruthy();
    expect(view.querySelector('#registro-hero-meter')).not.toBeNull();
    expect(view.querySelectorAll('#registro-hero-meter .registro-hero__seg')).toHaveLength(5);
    expect(view.querySelector('#form-progress-count')).not.toBeNull();
    expect(view.querySelector('#registro-hero-pill-text')?.textContent).toContain('Novo registro');
    expect(
      view.querySelector('#registro-header-root')?.classList.contains('registro-main-column'),
    ).toBe(true);
    expect(
      view
        .querySelector('#registro-header-root')
        ?.classList.contains('registro-main-column--header'),
    ).toBe(true);
    expect(view.querySelector('#registro-header-root')?.dataset.registroHeaderMounted).toBe('true');
    expect(view.querySelector('.registro-side-column')).not.toBeNull();
    expect(view.querySelector('.registro-side-card__title')?.textContent).toContain('Resumo');
    const evidencias = view.querySelector('#registro-evidencias-details');
    expect(evidencias).toBeNull();
    expect(view.querySelector('#input-fotos')).toBeNull();

    ['r-equip', 'r-data', 'r-tipo', 'r-obs', 'r-tecnico'].forEach((id) => {
      expect(view.querySelector(`#${id}`)).not.toBeNull();
    });
    expectClass(view.querySelector('#r-equip'), 'registro-field__select');
    expectClass(view.querySelector('#r-data'), 'registro-field__input');
    expectClass(view.querySelector('#r-tipo'), 'registro-field__select');
    expectClass(view.querySelector('#r-obs'), 'registro-field__textarea');
    expectClass(view.querySelector('#r-tecnico'), 'registro-field__input');

    expect(view.querySelector('[data-action="save-registro"]')).not.toBeNull();
    expect(view.querySelector('[data-action="save-and-share-registro"]')).toBeNull();
    expect(view.querySelector('[data-action="clear-registro"]')).not.toBeNull();
    expect(view.querySelectorAll('[data-action="quick-service-template"]')).toHaveLength(5);

    expectExternalFlowsNotExecuted();
  });

  it('preenche modo edicao preservando ids, edit mode e contratos publicos', async () => {
    const state = baseState();
    setupDom(state);
    const registro = await loadRegistroView(state);

    registro.initRegistro({ editRegistroId: 'reg-1' });
    registro.loadRegistroForEdit('reg-1');

    const view = document.querySelector('#view-registro');
    expect(view.dataset.editMode).toBe('1');
    expect(document.querySelector('#registro-hero-pill-text')?.textContent).toContain('Editando');
    expect(document.querySelector('#r-equip')?.value).toBe('eq-1');
    expect(document.querySelector('#r-data')?.value).toBe('2026-04-30T09:00');
    expect(document.querySelector('#r-tipo')?.value).toBe('Manutenção Preventiva');
    expect(document.querySelector('#r-obs')?.value).toBe(
      'Limpeza preventiva realizada com testes finais.',
    );
    expect(document.querySelector('#r-tecnico')?.value).toBe('Ana');

    const saveButton = document.querySelector('[data-action="save-registro"]');
    expect(saveButton?.classList.contains('btn--editing')).toBe(true);
    expect(saveButton?.querySelector('span')?.textContent).toContain('Salvar');

    expect(document.querySelector('#registro-context-card')?.hidden).toBe(false);
    expect(document.querySelector('#registro-context-cliente')?.textContent).toContain(
      'Cliente ACME',
    );
    expect(document.querySelector('#registro-context-setor')?.textContent).toContain('Recepcao');
    expect(document.querySelector('#registro-context-equip')?.textContent).toContain(
      'Split Recepcao',
    );
    expect(mocks.setRouteGuard).toHaveBeenCalledTimes(1);
    expectExternalFlowsNotExecuted();
  });

  it('preserva equipamento selecionado e nao quebra quando equipamento da rota nao existe', async () => {
    const state = baseState();
    setupDom(state);
    const registro = await loadRegistroView(state);

    registro.initRegistro({ equipId: 'eq-1' });

    expect(document.querySelector('#r-equip')?.value).toBe('eq-1');
    expect(document.querySelector('#registro-context-card')?.hidden).toBe(false);
    expect(document.querySelector('#registro-context-equip')?.textContent).toContain(
      'Split Recepcao',
    );

    setupDom(state);
    const registroMissing = await loadRegistroView(state);
    registroMissing.initRegistro({ equipId: 'eq-missing' });

    const hint = document.querySelector('#registro-context-hint');
    expect(hint?.hidden).toBe(false);
    expect(hint?.textContent).toContain('Equipamento');
    expect(document.querySelector('#view-registro')).not.toBeNull();
    expectExternalFlowsNotExecuted();
  });

  it('escapa dados maliciosos em equipamento, cliente, observacao e tecnico', async () => {
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
      registros: [
        {
          id: 'reg-xss',
          equipId: 'eq-xss',
          data: '2026-04-30T09:00',
          tipo: 'Manutenção Preventiva',
          obs: MALICIOUS,
          tecnico: MALICIOUS,
          status: 'ok',
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
    });
    setupDom(state);
    const registro = await loadRegistroView(state);

    registro.initRegistro({ editRegistroId: 'reg-xss', equipId: 'eq-xss' });
    registro.loadRegistroForEdit('reg-xss');

    const view = document.querySelector('#view-registro');
    expect(document.querySelector('#registro-context-equip')?.textContent).toContain(MALICIOUS);
    expect(document.querySelector('#r-obs')?.value).toBe(MALICIOUS);
    expect(document.querySelector('#r-tecnico')?.value).toBe(MALICIOUS);
    expect(view.innerHTML).not.toContain('<script>alert(2)</script>');
    expect(view.innerHTML).not.toContain('<img src=x onerror=alert(1)>');
    expectNoUnsafeMarkup(view);
    expectExternalFlowsNotExecuted();
  });

  it('mantem render DOM sem dependencia de React/createRoot', () => {
    const source = readFileSync('src/ui/views/registro.js', 'utf8');

    expect(source).not.toMatch(/from ['"]react['"]|react-dom|createRoot/);
    const removedIslandPath =
      '../../react/entrypoints/' + ['registro', 'Header', 'Island.jsx'].join('');
    expect(source).not.toContain(removedIslandPath);
  });
});
