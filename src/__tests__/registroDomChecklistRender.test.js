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
  mocks.isCachedPlanPro.mockReturnValue(true);
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

async function mountRegistroHeader(registro, params = { equipId: 'eq-1' }) {
  await act(async () => {
    registro.initRegistro(params);
    await flushAsyncWork();
  });

  const root = document.getElementById('registro-header-root');
  expect(root).not.toBeNull();
  expect(root?.dataset.registroHeaderMounted).toBe('true');
  return root;
}

async function renderChecklistForState(
  state = baseState(),
  params = { equipId: 'eq-1' },
  { isPro = true } = {},
) {
  setupDom(state);
  const registro = await loadRegistroView(state);
  await mountRegistroHeader(registro, params);
  mocks.isCachedPlanPro.mockReturnValue(isPro);

  await act(async () => {
    registro.renderChecklist();
    await flushAsyncWork();
  });

  return {
    registro,
    wrapper: document.getElementById('r-checklist-details'),
    body: document.getElementById('r-checklist-body'),
    summary: document.getElementById('r-checklist-summary'),
    pri: document.getElementById('r-checklist-pri'),
    upsell: document.getElementById('r-checklist-upsell'),
  };
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
  expect(mocks.postSaveToastShow).not.toHaveBeenCalled();
  expect(mocks.goTo).not.toHaveBeenCalled();
  expect(mocks.customConfirmShow).not.toHaveBeenCalled();
  expect(mocks.deleteReg).not.toHaveBeenCalled();
}

async function bindRegistroHandlers() {
  const handlers = await import('../ui/controller/handlers/registroHandlers.js');
  handlers.bindRegistroHandlers();
  return handlers;
}

describe('registro DOM checklist render adapter', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doUnmock('../domain/pmoc/checklistTemplates.js');
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

  it('bloqueia checklist quando o acesso operacional nao esta disponivel', async () => {
    const {
      wrapper,
      body,
      upsell: unavailable,
      registro,
    } = await renderChecklistForState(baseState(), { equipId: 'eq-1' }, { isPro: false });

    expect(wrapper?.hidden).toBe(true);
    expect(body?.children).toHaveLength(0);
    expect(unavailable?.hidden).toBe(false);
    expect(unavailable?.querySelector('.registro-sig-hint__ic--pro')).not.toBeNull();
    expect(unavailable?.querySelector('.registro-sig-hint__badge--pro')?.textContent).toBe(
      'Indisponivel',
    );
    expect(unavailable?.textContent).toContain('Checklist preventivo preenchivel (NBR 13971)');
    expect(unavailable?.textContent).toContain(
      'Checklist preventivo conforme NBR 13971. Recurso indisponivel nesta etapa.',
    );

    const cta = unavailable?.querySelector(
      '.registro-sig-hint__cta[disabled][aria-disabled="true"]',
    );
    expect(cta?.textContent).toContain('Recurso indisponivel');

    registro.setChecklistItemStatus('filtros_limpeza', 'ok');
    expect(mocks.toastWarning).toHaveBeenCalledWith('Recurso indisponivel nesta etapa.');
    expect(mocks.goTo).not.toHaveBeenCalled();
    expect(registro.getCurrentChecklist()).toBeNull();
  });

  it('renderiza checklist inicial preservando ids, classes e contratos data-action', async () => {
    const { wrapper, body, summary } = await renderChecklistForState();

    expect(wrapper).not.toBeNull();
    expect(wrapper.hidden).toBe(false);
    expect(body).not.toBeNull();
    expect(body.classList.contains('r-checklist__body')).toBe(true);
    expect(body.querySelector('.r-checklist__intro')).not.toBeNull();
    expect(body.querySelector('.r-checklist__legend')).not.toBeNull();
    expect(body.querySelector('.r-checklist__group')).not.toBeNull();
    expect(body.querySelector('.r-checklist__group-label')?.textContent).toBeTruthy();

    const rows = body.querySelectorAll('.r-checklist__row');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].dataset.itemId).toBe('filtros_limpeza');
    expect(rows[0].querySelector('.r-checklist__label')?.textContent).toContain('Limpeza');
    expect(rows[0].querySelectorAll('.r-checklist__status')).toHaveLength(3);
    expect(
      rows[0].querySelector('[data-action="r-checklist-set"][data-status="ok"]'),
    ).not.toBeNull();
    expect(
      rows[0].querySelector('[data-action="r-checklist-set"][data-status="fail"]'),
    ).not.toBeNull();
    expect(
      rows[0].querySelector('[data-action="r-checklist-set"][data-status="na"]'),
    ).not.toBeNull();
    expect(rows[0].querySelector('[data-action="r-checklist-obs"]')).not.toBeNull();
    expect(body.querySelector('[data-action="r-checklist-measure"]')).not.toBeNull();

    body.querySelectorAll('.r-checklist__status').forEach((button) => {
      expect(button.getAttribute('aria-pressed')).toBe('false');
      expect(button.classList.contains('is-active')).toBe(false);
    });
    expect(summary.textContent).toMatch(/0\/\d+ itens preenchidos/);
    expectExternalFlowsNotExecuted();
  });

  it('destaca e abre checklist quando o tipo e preventiva com equipamento selecionado', async () => {
    setupDom();
    const registro = await loadRegistroView();
    await mountRegistroHeader(registro, { equipId: 'eq-1' });
    document.getElementById('r-tipo').value = 'Manutenção Preventiva';

    await act(async () => {
      registro.renderChecklist();
      await flushAsyncWork();
    });

    const wrapper = document.getElementById('r-checklist-details');
    const pri = document.getElementById('r-checklist-pri');

    expect(wrapper?.hidden).toBe(false);
    expect(wrapper?.open).toBe(true);
    expect(wrapper?.dataset.checklistRecommended).toBe('true');
    expect(pri?.hidden).toBe(false);
    expect(pri?.textContent).toContain('Recomendado');
    expect(document.getElementById('r-checklist-summary')?.textContent).toContain('Preventiva');
  });

  it('mantem checklist discreto quando o tipo de servico nao e preventiva', async () => {
    setupDom();
    const registro = await loadRegistroView();
    await mountRegistroHeader(registro, { equipId: 'eq-1' });
    document.getElementById('r-tipo').value = 'Manutenção Corretiva';

    await act(async () => {
      registro.renderChecklist();
      await flushAsyncWork();
    });

    const wrapper = document.getElementById('r-checklist-details');
    const pri = document.getElementById('r-checklist-pri');

    expect(wrapper?.hidden).toBe(false);
    expect(wrapper?.open).toBe(false);
    expect(wrapper?.dataset.checklistRecommended).toBe('false');
    expect(pri?.hidden).toBe(true);
  });

  it('mostra aviso contextual quando preventiva tem equipamento sem acesso', async () => {
    setupDom();
    const registro = await loadRegistroView();
    await mountRegistroHeader(registro, { equipId: 'eq-1' });
    mocks.isCachedPlanPro.mockReturnValue(false);
    document.getElementById('r-tipo').value = 'Manutenção Preventiva';

    await act(async () => {
      registro.renderChecklist();
      await flushAsyncWork();
    });

    const wrapper = document.getElementById('r-checklist-details');
    const unavailable = document.getElementById('r-checklist-upsell');

    expect(wrapper?.hidden).toBe(true);
    expect(unavailable?.hidden).toBe(false);
    expect(unavailable?.dataset.checklistRecommended).toBe('true');
    expect(unavailable?.textContent).toContain('Recomendado para preventiva');
    expect(
      unavailable?.querySelector('.registro-sig-hint__cta[disabled][aria-disabled="true"]'),
    ).not.toBeNull();
    expect(registro.getCurrentChecklist()).toBeNull();
  });

  it('mantem estado ausente ou invalido sem quebrar o checklist DOM', async () => {
    setupDom(baseState());
    const registro = await loadRegistroView(baseState());
    await mountRegistroHeader(registro, {});

    await act(async () => {
      registro.renderChecklist();
      await flushAsyncWork();
    });

    expect(document.getElementById('r-checklist-details')?.hidden).toBe(true);
    expect(document.getElementById('r-checklist-body')?.children).toHaveLength(0);
    expect(document.getElementById('r-checklist-summary')?.textContent).toContain('selecione');
    expect(registro.getCurrentChecklist()).toBeNull();
    expectExternalFlowsNotExecuted();
  });

  it('alterna status atual e atualiza resumo sem executar fluxos criticos', async () => {
    const { registro, body, summary } = await renderChecklistForState();
    await bindRegistroHandlers();

    const statusHandler = mocks.handlers.get('r-checklist-set');
    expect(statusHandler).toBeTypeOf('function');

    const okButton = body.querySelector('[data-item="filtros_limpeza"][data-status="ok"]');
    const failButton = body.querySelector('[data-item="filtros_limpeza"][data-status="fail"]');
    expect(okButton.dataset.action).toBe('r-checklist-set');
    expect(okButton.dataset.item).toBe('filtros_limpeza');
    expect(okButton.dataset.status).toBe('ok');

    await act(async () => {
      statusHandler(okButton);
      await Promise.resolve();
    });

    expect(okButton.classList.contains('is-active')).toBe(true);
    expect(okButton.getAttribute('aria-pressed')).toBe('true');
    expect(failButton.getAttribute('aria-pressed')).toBe('false');
    expect(
      registro.getCurrentChecklist().items.find((item) => item.id === 'filtros_limpeza').status,
    ).toBe('ok');
    expect(summary.textContent).toMatch(/1\/\d+ itens preenchidos/);

    await act(async () => {
      statusHandler(okButton);
      await Promise.resolve();
    });
    expect(okButton.classList.contains('is-active')).toBe(false);
    expect(okButton.getAttribute('aria-pressed')).toBe('false');
    expect(registro.getCurrentChecklist()).toBeNull();

    await act(async () => {
      statusHandler(failButton);
      await Promise.resolve();
    });
    expect(failButton.classList.contains('is-active')).toBe(true);
    expect(
      registro.getCurrentChecklist().items.find((item) => item.id === 'filtros_limpeza').status,
    ).toBe('fail');
    expectExternalFlowsNotExecuted();
  });

  it('preserva observacao e medicao atuais por data-action sem salvar registro', async () => {
    const { registro, body } = await renderChecklistForState();
    await bindRegistroHandlers();

    const failButton = body.querySelector('[data-item="filtros_limpeza"][data-status="fail"]');
    await act(async () => {
      mocks.handlers.get('r-checklist-set')(failButton);
      await Promise.resolve();
    });

    const obs = body.querySelector(
      'textarea[data-action="r-checklist-obs"][data-item="filtros_limpeza"]',
    );
    const measure = body.querySelector(
      'input[data-action="r-checklist-measure"][data-item="tensao_alimentacao"]',
    );
    expect(obs.classList.contains('r-checklist__obs')).toBe(true);
    expect(measure.classList.contains('r-checklist__measure-input')).toBe(true);
    expect(measure.dataset.unit).toBe('V');

    await act(async () => {
      obs.value = 'Filtro saturado antes da limpeza.';
      obs.dispatchEvent(new Event('input', { bubbles: true }));
      measure.value = '220';
      measure.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });

    const checklist = registro.getCurrentChecklist();
    expect(checklist.items.find((item) => item.id === 'filtros_limpeza').obs).toBe(
      'Filtro saturado antes da limpeza.',
    );
    expect(checklist.items.find((item) => item.id === 'tensao_alimentacao').measure).toEqual({
      value: 220,
      unit: 'V',
    });
    expectExternalFlowsNotExecuted();
  });

  it('carrega checklist marcado em edicao preservando classes, aria e valores', async () => {
    const { registro, body, summary } = await renderChecklistForState();

    await act(async () => {
      registro.loadChecklistForEdit({
        tipo_template: 'split_hi_wall',
        version: 1,
        items: [
          { id: 'filtros_limpeza', status: 'ok', obs: 'Filtros limpos.' },
          {
            id: 'tensao_alimentacao',
            status: 'fail',
            obs: 'Tensao baixa.',
            measure: { value: 210, unit: 'V' },
          },
        ],
      });
      await flushAsyncWork();
    });

    const okButton = body.querySelector('[data-item="filtros_limpeza"][data-status="ok"]');
    const failButton = body.querySelector('[data-item="tensao_alimentacao"][data-status="fail"]');
    const obs = body.querySelector('textarea[data-item="filtros_limpeza"]');
    const measure = body.querySelector('input[data-item="tensao_alimentacao"]');

    expect(okButton.classList.contains('is-active')).toBe(true);
    expect(okButton.getAttribute('aria-pressed')).toBe('true');
    expect(failButton.classList.contains('is-active')).toBe(true);
    expect(failButton.getAttribute('aria-pressed')).toBe('true');
    expect(obs.value).toBe('Filtros limpos.');
    expect(measure.value).toBe('210');
    expect(summary.textContent).toMatch(/2\/\d+ itens preenchidos/);
    expectExternalFlowsNotExecuted();
  });

  it('mantem checklist compativel apos quick-service-template sem executar salvamento', async () => {
    const { body, summary } = await renderChecklistForState();
    await bindRegistroHandlers();

    const root = document.getElementById('registro-header-root');
    const chip = root.querySelector(
      '[data-action="quick-service-template"][data-template="limpeza"]',
    );
    expect(chip).not.toBeNull();

    await act(async () => {
      mocks.handlers.get('quick-service-template')(chip);
      await flushAsyncWork();
    });

    expect(document.getElementById('r-tipo')?.value).toBe('Limpeza de Filtros');
    expect(body.querySelectorAll('.r-checklist__row').length).toBeGreaterThan(0);
    expect(
      body.querySelector('[data-action="r-checklist-set"][data-item="filtros_limpeza"]'),
    ).not.toBeNull();
    expect(
      body.querySelector('[data-action="r-checklist-obs"][data-item="filtros_limpeza"]'),
    ).not.toBeNull();

    await act(async () => {
      mocks.handlers.get('r-checklist-set')(
        body.querySelector('[data-item="filtros_limpeza"][data-status="ok"]'),
      );
      await Promise.resolve();
    });
    expect(summary.textContent).toContain('Limpeza de Filtros');
    expectExternalFlowsNotExecuted();
  });

  it('escapa labels e observacoes maliciosas no HTML DOM do checklist', async () => {
    const maliciousTemplate = {
      tipo_template: 'xss_template',
      version: 1,
      label: MALICIOUS,
      items: [
        {
          id: 'xss_item',
          label: MALICIOUS,
          group: MALICIOUS,
          mandatory: true,
        },
        {
          id: 'xss_measure',
          label: 'Medicao maliciosa',
          group: MALICIOUS,
          mandatory: false,
          measurable: true,
          unit: 'V" onclick="alert(1)',
        },
      ],
    };

    vi.doMock('../domain/pmoc/checklistTemplates.js', () => ({
      getChecklistTemplate: vi.fn(() => maliciousTemplate),
      getTemplateByKey: vi.fn(() => maliciousTemplate),
      listTemplates: vi.fn(() => [maliciousTemplate]),
      buildEmptyChecklist: vi.fn(() => ({
        tipo_template: maliciousTemplate.tipo_template,
        version: maliciousTemplate.version,
        items: [
          { id: 'xss_item', status: null, obs: MALICIOUS },
          {
            id: 'xss_measure',
            status: null,
            obs: '',
            measure: { value: '220"><img src=x onerror=alert(1)>', unit: 'V' },
          },
        ],
      })),
      validateChecklist: vi.fn(() => ({ complete: false, missing: [] })),
      summarizeChecklist: vi.fn((checklist) => {
        const items = Array.isArray(checklist?.items) ? checklist.items : [];
        const total = items.length;
        const ok = items.filter((item) => item.status === 'ok').length;
        const fail = items.filter((item) => item.status === 'fail').length;
        const na = items.filter((item) => item.status === 'na').length;
        return { ok, fail, na, pending: total - ok - fail - na, total };
      }),
      formatMeasure: vi.fn(() => ''),
    }));

    const { body } = await renderChecklistForState(
      baseState({
        equipamentos: [
          {
            id: 'eq-1',
            nome: 'Equipamento XSS',
            tipo: MALICIOUS,
            periodicidadePreventivaDias: 30,
          },
        ],
      }),
    );

    expect(body.textContent).toContain(MALICIOUS);
    expect(
      body.querySelector('[data-action="r-checklist-set"][data-item="xss_item"]'),
    ).not.toBeNull();
    expectNoUnsafeMarkup(body);
    expectExternalFlowsNotExecuted();
  });

  it('mantem registro.js sem dependencia direta de React/createRoot para o checklist', () => {
    const source = readFileSync('src/ui/views/registro.js', 'utf8');

    expect(source).not.toMatch(/from ['"]react['"]|react-dom|createRoot/);
  });
});
