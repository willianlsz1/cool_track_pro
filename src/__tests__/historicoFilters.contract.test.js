import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getState: vi.fn(),
  findEquip: vi.fn(),
  setState: vi.fn(),
  cleanupOrphanSignatures: vi.fn(),
  getSignatureForRecord: vi.fn(),
  openSignatureViewer: vi.fn(),
  openLightbox: vi.fn(),
  applySavedHighlight: vi.fn(),
  markRegistroDeleted: vi.fn(),
  goTo: vi.fn(),
  toastSuccess: vi.fn(),
  toastWarning: vi.fn(),
  updateHeader: vi.fn(),
  getOperationalStatus: vi.fn(),
  isCachedPlanPro: vi.fn(),
  buildClientePmocDetails: vi.fn(),
  openFiltersSheet: vi.fn(),
  mountHistoricoFiltersReact: vi.fn((root, { viewModel } = {}) => {
    const filters = viewModel?.filters || {};
    const filtersCount = Number(viewModel?.filtersCount) || 0;
    const selected = (current, id) =>
      String(current || '') === String(id || '') ? ' selected' : '';
    const pressed = (current, id) =>
      String(current || '') === String(id || '') ? 'true' : 'false';
    const periodOptions = (viewModel?.periodOptions || [])
      .map(
        (option) =>
          `<button type="button" class="hist-quickfilter" data-hist-action="hist-filter-period" data-period="${option.id}" aria-pressed="${pressed(filters.period || 'tudo', option.id)}">${option.label}</button>`,
      )
      .join('');
    const tipoOptions = (viewModel?.tipoOptions || [])
      .map(
        (option) =>
          `<button type="button" class="hist-quickfilter" data-hist-action="hist-filter-tipo" data-tipo-id="${option.id}" aria-pressed="${pressed(filters.tipo, option.id)}">${option.label}</button>`,
      )
      .join('');
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
    const chips = (viewModel?.activeChips || [])
      .map(
        (chip) =>
          `<span class="hist-active-chip"><b>${chip.key}:</b> ${chip.value}<button type="button" data-hist-action="${chip.clearAction}">x</button></span>`,
      )
      .join('');

    root.dataset.reactHistoricoFiltersMounted = 'true';
    root.innerHTML = `
      <div class="hist-sticky-header" id="hist-sticky-header">
        <span class="hist-count" id="hist-count">${viewModel?.countLabel || ''}</span>
        <input id="hist-busca" type="search" value="${filters.busca || ''}" />
        <button type="button" id="hist-filters-trigger" class="hist-filters-trigger${
          filtersCount ? ' is-active' : ''
        }" data-hist-action="open-filters-sheet">
          Filtros
          <span id="hist-filters-count" ${filtersCount ? '' : 'hidden'}>${filtersCount}</span>
        </button>
        <select id="hist-setor"><option value="">Todos os setores</option>${setorOptions}</select>
        <select id="hist-equip"><option value="">Todos os equipamentos</option>${equipOptions}</select>
        <div id="hist-quickfilters-slot">${periodOptions}${tipoOptions}</div>
      </div>
      <div id="hist-active-chips-slot">${chips ? `<div class="hist-active-chips">${chips}<button type="button" data-hist-action="hist-clear-all">Limpar tudo</button></div>` : ''}</div>
    `;
    return root;
  }),
  unmountHistoricoFiltersReact: vi.fn((root) => {
    delete root.dataset.reactHistoricoFiltersMounted;
    root.innerHTML = '';
  }),
  mountHistoricoTimelineReact: vi.fn((root, { viewModel } = {}) => {
    const items = (viewModel?.groups || [])
      .flatMap((group) => group.items || [])
      .map(
        (item) =>
          `<article class="timeline__item" data-reg-id="${item.id}">
            <span class="timeline__item__service">${item.serviceTitle}</span>
            <span class="timeline__item__equipment">${item.equipmentName}</span>
            <button type="button" data-action="export-pdf" data-registro-id="${item.id}">PDF</button>
            <button type="button" data-action="whatsapp-export" data-registro-id="${item.id}">WhatsApp</button>
          </article>`,
      )
      .join('');
    root.dataset.reactHistoricoTimelineMounted = 'true';
    root.innerHTML =
      items ||
      `<div class="empty-state" data-empty-kind="${viewModel?.emptyState?.kind || 'empty'}">${viewModel?.emptyState?.title || 'Sem registros'}</div>`;
    return root;
  }),
  unmountHistoricoTimelineReact: vi.fn((root) => {
    delete root.dataset.reactHistoricoTimelineMounted;
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

vi.mock('../ui/components/signature.js', () => ({
  cleanupOrphanSignatures: mocks.cleanupOrphanSignatures,
  getSignatureForRecord: mocks.getSignatureForRecord,
  SignatureViewerModal: { open: mocks.openSignatureViewer },
}));

vi.mock('../ui/components/photos.js', () => ({
  Photos: { openLightbox: mocks.openLightbox },
}));

vi.mock('../ui/components/skeleton.js', () => ({
  withSkeleton: (_el, _options, render) => render(),
}));

vi.mock('../ui/components/historicoFiltersSheet.js', () => ({
  HistoricoFiltersSheet: { open: mocks.openFiltersSheet },
}));

vi.mock('../ui/views/dashboard.js', () => ({
  updateHeader: mocks.updateHeader,
}));

vi.mock('../ui/composables/header.js', () => ({
  updateGlobalHeader: vi.fn(),
}));

vi.mock('../core/equipmentRules.js', () => ({
  getOperationalStatus: mocks.getOperationalStatus,
}));

vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPro: mocks.isCachedPlanPro,
}));

vi.mock('../core/clientePmoc.js', () => ({
  buildClientePmocDetails: mocks.buildClientePmocDetails,
}));

vi.mock('../react/entrypoints/historicoFiltersIsland.jsx', () => ({
  mountHistoricoFiltersReact: mocks.mountHistoricoFiltersReact,
  unmountHistoricoFiltersReact: mocks.unmountHistoricoFiltersReact,
}));

vi.mock('../react/entrypoints/historicoTimelineIsland.jsx', () => ({
  mountHistoricoTimelineReact: mocks.mountHistoricoTimelineReact,
  unmountHistoricoTimelineReact: mocks.unmountHistoricoTimelineReact,
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
  if (!select) return;
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

async function flushRender() {
  await Promise.resolve();
  await Promise.resolve();
}

async function renderHistorico(state = baseState()) {
  await mountHistoricoShell();
  populateSelect('hist-setor', state.setores || []);
  populateSelect('hist-equip', state.equipamentos || []);
  mocks.getState.mockReturnValue(state);
  mocks.findEquip.mockImplementation((id) =>
    (state.equipamentos || []).find((equipamento) => equipamento.id === id),
  );
  const historico = await import('../ui/views/historico.js');
  await historico.renderHist();
  await flushRender();
  return historico;
}

function latestFiltersViewModel() {
  return mocks.mountHistoricoFiltersReact.mock.calls.at(-1)?.[1]?.viewModel;
}

function latestTimelineViewModel() {
  return mocks.mountHistoricoTimelineReact.mock.calls.at(-1)?.[1]?.viewModel;
}

function latestSheetOptions() {
  return mocks.openFiltersSheet.mock.calls.at(-1)?.[0];
}

describe('historico consolidated filters contract', () => {
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
    mocks.isCachedPlanPro.mockReturnValue(false);
    mocks.buildClientePmocDetails.mockReturnValue({ status: 'em_dia', statusLabel: 'Em dia' });
    mocks.getSignatureForRecord.mockReturnValue(null);
  });

  it('preserva DOM roots, actions publicas e ponte timeline/card com data-registro-id', async () => {
    await renderHistorico();

    expect(document.querySelector('#hist-busca[type="search"]')).not.toBeNull();
    expect(document.querySelector('#hist-equip')).not.toBeNull();
    expect(document.querySelector('#hist-setor')).not.toBeNull();
    expect(
      document.querySelector('#hist-filters-trigger[data-hist-action="open-filters-sheet"]'),
    ).not.toBeNull();
    expect(document.querySelector('#hist-filters-count')).not.toBeNull();
    expect(document.querySelectorAll('[data-hist-action="hist-filter-period"]')).toHaveLength(4);
    expect(document.querySelectorAll('[data-hist-action="hist-filter-tipo"]')).toHaveLength(5);
    expect(
      document.querySelector('[data-action="export-pdf"][data-registro-id="reg-1"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-action="whatsapp-export"][data-registro-id="reg-1"]'),
    ).not.toBeNull();
  });

  it('hidrata URL params em DOM/sessionStorage e filtra VM/timeline sem perder registroId', async () => {
    window.history.replaceState(
      null,
      '',
      '/?q=troca&periodo=7d&tipo=preventiva&setor=setor-1&equip=eq-1',
    );

    await renderHistorico();

    expect(document.getElementById('hist-busca')?.value).toBe('troca');
    expect(document.getElementById('hist-setor')?.value).toBe('setor-1');
    expect(document.getElementById('hist-equip')?.value).toBe('eq-1');
    expect(sessionStorage.getItem('cooltrack-hist-period')).toBe('7d');
    expect(sessionStorage.getItem('cooltrack-hist-tipo')).toBe('preventiva');
    expect(latestFiltersViewModel().filters).toEqual(
      expect.objectContaining({
        busca: 'troca',
        period: '7d',
        tipo: 'preventiva',
        setorId: 'setor-1',
        equipId: 'eq-1',
      }),
    );
    expect(
      latestTimelineViewModel()
        .groups.flatMap((group) => group.items)
        .map((item) => item.id),
    ).toEqual(['reg-1']);
    expect(document.querySelector('[data-action="export-pdf"]')?.dataset.registroId).toBe('reg-1');
    expect(window.location.search).toContain('q=troca');
    expect(window.location.search).toContain('periodo=7d');
    expect(window.location.search).toContain('tipo=preventiva');
  });

  it('preserva cache de filtros no unmount/remount da ilha e suporta sessionStorage indisponivel', async () => {
    const historico = await renderHistorico();
    document.getElementById('hist-busca').value = 'compressor';
    document.getElementById('hist-setor').value = 'setor-2';
    document.getElementById('hist-equip').value = 'eq-2';

    await historico.unmountHistoricoFilters();
    expect(document.getElementById('hist-filters-root')?.innerHTML).toBe('');

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });

    await expect(historico.renderHist()).resolves.not.toThrow();
    await flushRender();

    expect(latestFiltersViewModel().filters).toEqual(
      expect.objectContaining({
        busca: 'compressor',
        setorId: 'setor-2',
        equipId: 'eq-2',
        period: 'tudo',
        tipo: '',
      }),
    );
    expect(
      latestTimelineViewModel()
        .groups.flatMap((group) => group.items)
        .map((item) => item.id),
    ).toEqual(['reg-2']);

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
  });

  it('aplica e limpa setHistClienteFilter sem prender estado invisivel', async () => {
    const historico = await renderHistorico();

    historico.setHistClienteFilter({ id: 'cliente-1', nome: 'Alpha Mercado' });
    await historico.renderHist();
    await flushRender();

    expect(latestFiltersViewModel().activeChips.map((chip) => chip.clearAction)).toContain(
      'clear-cliente-filter',
    );
    expect(
      latestTimelineViewModel()
        .groups.flatMap((group) => group.items)
        .map((item) => item.id),
    ).toEqual(['reg-1']);

    document.querySelector('[data-hist-action="clear-cliente-filter"]').click();
    await flushRender();

    expect(latestFiltersViewModel().activeChips.map((chip) => chip.clearAction)).not.toContain(
      'clear-cliente-filter',
    );
    expect(
      latestTimelineViewModel()
        .groups.flatMap((group) => group.items)
        .map((item) => item.id),
    ).toEqual(['reg-1', 'reg-2']);
  });

  it('aplica/reset sheet e clear-all mantendo estado vazio correto e data-registro-id nos cards', async () => {
    await renderHistorico();

    document.getElementById('hist-filters-trigger').click();
    latestSheetOptions().onApply({ setor: 'setor-2', equip: 'eq-2', tipo: 'preventiva' });
    await flushRender();

    expect(latestFiltersViewModel().filters).toEqual(
      expect.objectContaining({ setorId: 'setor-2', equipId: 'eq-2', tipo: 'preventiva' }),
    );
    expect(latestTimelineViewModel().emptyState).toMatchObject({
      title: 'Nenhum resultado para esse filtro',
    });
    expect(document.querySelector('#timeline [data-action="export-pdf"]')).toBeNull();

    latestSheetOptions().onReset();
    await flushRender();

    expect(latestFiltersViewModel().filters).toEqual(
      expect.objectContaining({ setorId: '', equipId: '', tipo: '' }),
    );
    expect(
      document.querySelector('[data-action="export-pdf"][data-registro-id="reg-1"]'),
    ).not.toBeNull();

    document.getElementById('hist-filters-trigger').click();
    latestSheetOptions().onApply({ setor: 'setor-1', equip: 'eq-1', tipo: 'preventiva' });
    await flushRender();
    document.querySelector('[data-hist-action="hist-clear-all"]').click();
    await flushRender();

    expect(latestFiltersViewModel().filters).toEqual(
      expect.objectContaining({ busca: '', setorId: '', equipId: '', tipo: '', period: 'tudo' }),
    );
    expect(document.querySelector('[data-action="whatsapp-export"]')?.dataset.registroId).toBe(
      'reg-1',
    );
  });
});
