import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getState: vi.fn(),
  findEquip: vi.fn(),
  setState: vi.fn(),
  openLightbox: vi.fn(),
  applySavedHighlight: vi.fn(),
  markRegistroDeleted: vi.fn(),
  goTo: vi.fn(),
  toastSuccess: vi.fn(),
  toastWarning: vi.fn(),
  updateHeader: vi.fn(),
  getOperationalStatus: vi.fn(),
  openFiltersSheet: vi.fn(),
  mountHistoricoFiltersDom: vi.fn((root, { viewModel } = {}) => {
    const filters = viewModel?.filters || {};
    const filtersCount = Number(viewModel?.filtersCount) || 0;
    const selected = (current, id) =>
      String(current || '') === String(id || '') ? ' selected' : '';
    const pressed = (current, id) =>
      String(current || '') === String(id || '') ? 'true' : 'false';
    const setorOptions = (viewModel?.setorOptions || [])
      .map(
        (option) =>
          `<option value="${option.id}"${selected(filters.setorId, option.id)}>${option.label}</option>`,
      )
      .join('');
    const equipOptions = (viewModel?.equipamentoOptions || [])
      .map(
        (option) =>
          `<option value="${option.id}"${selected(filters.equipId, option.id)}>${option.label}</option>`,
      )
      .join('');
    const tipoOptions = (viewModel?.tipoOptions || [])
      .map(
        (option) =>
          `<button type="button" data-hist-action="hist-filter-tipo" data-tipo-id="${option.id}" aria-pressed="${pressed(filters.tipo, option.id)}">${option.label}</button>`,
      )
      .join('');
    const chips = (viewModel?.activeChips || [])
      .map(
        (chip) =>
          `<span class="hist-active-chip"><b>${chip.key}:</b> ${chip.value}<button type="button" data-hist-action="${chip.clearAction}">x</button></span>`,
      )
      .join('');

    root.dataset.historicoFiltersMounted = 'true';
    root.innerHTML = `
      <div class="hist-sticky-header" id="hist-sticky-header">
        <span class="hist-count" id="hist-count">${viewModel?.countLabel || ''}</span>
        <input id="hist-busca" value="${filters.busca || ''}" />
        <button type="button" id="hist-filters-trigger" class="hist-filters-trigger${
          filtersCount ? ' is-active' : ''
        }" data-hist-action="open-filters-sheet">
          Filtros
          <span id="hist-filters-count" ${filtersCount ? '' : 'hidden'}>${filtersCount}</span>
        </button>
        <select id="hist-setor"><option value="">Todos os setores</option>${setorOptions}</select>
        <select id="hist-equip"><option value="">Todos os equipamentos</option>${equipOptions}</select>
        <div id="hist-quickfilters-slot">
          <button type="button" data-hist-action="hist-filter-period" data-period="${filters.period || 'tudo'}" aria-pressed="true">Periodo</button>
          ${tipoOptions}
        </div>
      </div>
      <div id="hist-active-chips-slot">${chips ? `<div class="hist-active-chips">${chips}</div>` : ''}</div>
      <div id="hist-chrono-label">Mais recente primeiro</div>
    `;
    return root;
  }),
  unmountHistoricoFiltersDom: vi.fn((root) => {
    delete root.dataset.historicoFiltersMounted;
    root.innerHTML = '';
  }),
  mountHistoricoTimelineDom: vi.fn((root) => {
    root.dataset.historicoTimelineMounted = 'true';
    root.innerHTML = '<div class="timeline" role="list"></div>';
    return root;
  }),
  unmountHistoricoTimelineDom: vi.fn((root) => {
    delete root.dataset.historicoTimelineMounted;
    root.innerHTML = '';
  }),
}));

vi.mock('../core/state.js', () => ({
  getState: mocks.getState,
  findEquip: mocks.findEquip,
  setState: mocks.setState,
}));

vi.mock('../core/storage.js', () => ({
  Storage: { markRegistroDeleted: mocks.markRegistroDeleted },
}));

vi.mock('../core/toast.js', () => ({
  Toast: { success: mocks.toastSuccess, warning: mocks.toastWarning },
}));

vi.mock('../core/router.js', () => ({
  goTo: mocks.goTo,
}));

vi.mock('../ui/components/onboarding.js', () => ({
  SavedHighlight: { applyIfPending: mocks.applySavedHighlight },
}));

vi.mock('../ui/components/skeleton.js', () => ({
  withSkeleton: (_el, _options, render) => render(),
}));

vi.mock('../ui/components/historicoFiltersSheet.js', () => ({
  HistoricoFiltersSheet: { open: mocks.openFiltersSheet },
}));

vi.mock('../ui/composables/header.js', () => ({
  updateGlobalHeader: vi.fn(),
}));

vi.mock('../core/equipmentRules.js', () => ({
  getOperationalStatus: mocks.getOperationalStatus,
}));

vi.mock('../ui/views/historico/filtersRenderer.js', () => ({
  mountHistoricoFiltersDom: mocks.mountHistoricoFiltersDom,
  unmountHistoricoFiltersDom: mocks.unmountHistoricoFiltersDom,
}));

vi.mock('../ui/views/historico/timelineRenderer.js', () => ({
  mountHistoricoTimelineDom: mocks.mountHistoricoTimelineDom,
  unmountHistoricoTimelineDom: mocks.unmountHistoricoTimelineDom,
}));

function baseState(overrides = {}) {
  return {
    registros: [
      {
        id: 'reg-1',
        equipId: 'eq-1',
        data: '2026-04-30T09:30:00',
        tipo: 'Preventiva mensal',
        obs: 'Troca de filtros',
        tecnico: 'Ana',
      },
      {
        id: 'reg-2',
        equipId: 'eq-2',
        data: '2026-04-25T10:00:00',
        tipo: 'Corretiva',
        obs: 'Compressor',
        tecnico: 'Bruno',
      },
    ],
    equipamentos: [
      {
        id: 'eq-1',
        nome: 'Split Recepcao',
        local: 'Loja',
        setorId: 'setor-1',
        clienteId: 'cliente-1',
        status: 'ok',
      },
      {
        id: 'eq-2',
        nome: 'Chiller Central',
        local: 'Cobertura',
        setorId: 'setor-2',
        clienteId: 'cliente-2',
        status: 'warn',
      },
    ],
    setores: [
      { id: 'setor-1', nome: 'Loja' },
      { id: 'setor-2', nome: 'Casa de maquinas' },
    ],
    clientes: [
      { id: 'cliente-1', nome: 'Alpha Mercado' },
      { id: 'cliente-2', nome: 'Beta Hospital' },
    ],
    ...overrides,
  };
}

async function mountHistoricoShell() {
  const { renderShellViews } = await import('../ui/shell/templates/views.js');
  document.body.innerHTML = renderShellViews();
}

function populateSelect(id, items) {
  const select = document.getElementById(id);
  select.textContent = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = id === 'hist-setor' ? 'Todos os setores' : 'Todos os equipamentos';
  select.appendChild(defaultOption);

  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.nome;
    select.appendChild(option);
  });
}

async function flushHistoricoRender() {
  await Promise.resolve();
  await Promise.resolve();
}

async function renderHistorico({ state = baseState(), setor = '', equip = '', tipo = '' } = {}) {
  await mountHistoricoShell();
  populateSelect('hist-setor', state.setores || []);
  populateSelect('hist-equip', state.equipamentos || []);
  document.getElementById('hist-setor').value = setor;
  document.getElementById('hist-equip').value = equip;
  if (tipo) sessionStorage.setItem('cooltrack-hist-tipo', tipo);

  mocks.getState.mockReturnValue(state);
  mocks.findEquip.mockImplementation((id) =>
    (state.equipamentos || []).find((equipamento) => equipamento.id === id),
  );

  const historico = await import('../ui/views/historico.js');
  historico.clearHistClienteFilter();
  await historico.renderHist();
  await flushHistoricoRender();
  return historico;
}

function latestFiltersViewModel() {
  return mocks.mountHistoricoFiltersDom.mock.calls.at(-1)?.[1]?.viewModel;
}

function latestSheetOptions() {
  return mocks.openFiltersSheet.mock.calls.at(-1)?.[0];
}

function expectNoInjectedMarkup(root = document.body) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect([...root.querySelectorAll('img')].some((img) => img.hasAttribute('onerror'))).toBe(false);
  expect(root.innerHTML).not.toMatch(/javascript:/i);
}

describe('historico mobile filters sheet integration handlers', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-30T12:00:00'));
    window.history.replaceState(null, '', '/');
    sessionStorage.clear();
    document.body.innerHTML = '';
    mocks.applySavedHighlight.mockReturnValue(false);
    mocks.getOperationalStatus.mockReturnValue({ uiStatus: 'ok', label: 'Em dia' });
  });

  it('abre o sheet DOM pelo trigger React preservando initial e contratos atuais', async () => {
    const state = baseState();
    await renderHistorico({ state, setor: 'setor-1', equip: 'eq-1', tipo: 'preventiva' });

    const trigger = document.querySelector(
      '#hist-filters-trigger[data-hist-action="open-filters-sheet"]',
    );
    trigger.click();

    expect(mocks.openFiltersSheet).toHaveBeenCalledTimes(1);
    expect(latestSheetOptions()).toEqual(
      expect.objectContaining({
        setores: state.setores,
        equipamentos: [
          { id: 'eq-1', nome: 'Split Recepcao', setorId: 'setor-1' },
          { id: 'eq-2', nome: 'Chiller Central', setorId: 'setor-2' },
        ],
        initial: { setor: 'setor-1', equip: 'eq-1', tipo: 'preventiva' },
        onApply: expect.any(Function),
        onReset: expect.any(Function),
      }),
    );
    expect(latestSheetOptions().tipoOptions.map((option) => option.id)).toEqual([
      'preventiva',
      'corretiva',
      'limpeza',
      'recarga',
      'inspecao',
    ]);
    expect(document.getElementById('timeline')?.dataset.historicoTimelineMounted).toBe('true');
    expect(document.getElementById('hist-filters-root')?.dataset.historicoFiltersMounted).toBe(
      'true',
    );
  });

  it('aplica filtros via onApply e re-renderiza chips, badge e view model sem fluxos externos', async () => {
    await renderHistorico();

    document.getElementById('hist-filters-trigger').click();
    latestSheetOptions().onApply({ setor: 'setor-2', equip: 'eq-2', tipo: 'corretiva' });
    await flushHistoricoRender();

    expect(latestFiltersViewModel().filters).toEqual(
      expect.objectContaining({
        setorId: 'setor-2',
        equipId: 'eq-2',
        tipo: 'corretiva',
      }),
    );
    expect(document.getElementById('hist-setor')?.value).toBe('setor-2');
    expect(document.getElementById('hist-equip')?.value).toBe('eq-2');
    expect(sessionStorage.getItem('cooltrack-hist-tipo')).toBe('corretiva');
    expect(document.getElementById('hist-filters-trigger')?.classList.contains('is-active')).toBe(
      true,
    );
    expect(document.getElementById('hist-filters-count')?.hidden).toBe(false);
    expect(document.getElementById('hist-filters-count')?.textContent).toBe('3');
    expect(document.getElementById('hist-active-chips-slot')?.textContent).toContain('Setor');
    expect(document.getElementById('hist-active-chips-slot')?.textContent).toContain(
      'Casa de maquinas',
    );
    expect(document.getElementById('hist-active-chips-slot')?.textContent).toContain('Equipamento');
    expect(document.getElementById('hist-active-chips-slot')?.textContent).toContain(
      'Chiller Central',
    );
    expect(document.getElementById('hist-active-chips-slot')?.textContent).toContain('Tipo');
    expect(document.getElementById('hist-active-chips-slot')?.textContent).toContain('Corretiva');
    expect(mocks.mountHistoricoTimelineDom).toHaveBeenCalledTimes(2);
    expect(mocks.openLightbox).not.toHaveBeenCalled();
    expect(mocks.markRegistroDeleted).not.toHaveBeenCalled();
    expect(mocks.goTo).not.toHaveBeenCalled();
  });

  it('limpa filtros do sheet via onReset e preserva timeline/filtros React montados', async () => {
    await renderHistorico({ setor: 'setor-1', equip: 'eq-1', tipo: 'preventiva' });

    document.getElementById('hist-filters-trigger').click();
    latestSheetOptions().onReset();
    await flushHistoricoRender();

    expect(latestFiltersViewModel().filters).toEqual(
      expect.objectContaining({
        setorId: '',
        equipId: '',
        tipo: '',
      }),
    );
    expect(document.getElementById('hist-setor')?.value).toBe('');
    expect(document.getElementById('hist-equip')?.value).toBe('');
    expect(sessionStorage.getItem('cooltrack-hist-tipo')).toBeNull();
    expect(document.getElementById('hist-filters-trigger')?.classList.contains('is-active')).toBe(
      false,
    );
    expect(document.getElementById('hist-filters-count')?.hidden).toBe(true);
    expect(document.querySelector('#hist-active-chips-slot .hist-active-chip')).toBeNull();
    expect(document.getElementById('timeline')?.dataset.historicoTimelineMounted).toBe('true');
    expect(document.getElementById('hist-filters-root')?.dataset.historicoFiltersMounted).toBe(
      'true',
    );
  });

  it('mantem payloads maliciosos vindos do sheet inertes no re-render', async () => {
    const malicious = '<img src=x onerror=alert(1)><script>alert(1)</script>javascript:alert(2)';
    await renderHistorico();

    document.getElementById('hist-filters-trigger').click();
    latestSheetOptions().onApply({
      setor: 'setor-xss" onclick="alert(1)',
      equip: 'eq-xss" onclick="alert(1)',
      tipo: malicious,
    });
    await flushHistoricoRender();

    expectNoInjectedMarkup(document.getElementById('hist-filters-root'));
    expectNoInjectedMarkup(document.getElementById('timeline'));
    expect(mocks.openLightbox).not.toHaveBeenCalled();
    expect(mocks.markRegistroDeleted).not.toHaveBeenCalled();
    expect(mocks.goTo).not.toHaveBeenCalled();
  });
});
