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
  isCachedPlanPro: vi.fn(),
  openFiltersSheet: vi.fn(),
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

vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPro: mocks.isCachedPlanPro,
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
        tag: 'SP-01',
        setorId: 'setor-1',
        clienteId: 'cliente-1',
        status: 'ok',
      },
      {
        id: 'eq-2',
        nome: 'Chiller Central',
        tag: 'CH-01',
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

function populateSelect(id, items, labelKey = 'nome') {
  const select = document.getElementById(id);
  select.textContent = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = id === 'hist-setor' ? 'Todos os setores' : 'Todos os equipamentos';
  select.appendChild(defaultOption);

  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item[labelKey];
    select.appendChild(option);
  });
}

async function mountHistoricoShell() {
  const { renderShellViews } = await import('../ui/shell/templates/views.js');
  document.body.innerHTML = renderShellViews();
}

async function renderHistoricoFilters(
  state,
  { busca = '', setor = '', equip = '', period = '', tipo = '', clienteFilter = null } = {},
) {
  await mountHistoricoShell();

  const search = document.getElementById('hist-busca');
  search.value = busca;
  populateSelect('hist-setor', state.setores || []);
  populateSelect('hist-equip', state.equipamentos || []);
  document.getElementById('hist-setor').value = setor;
  document.getElementById('hist-equip').value = equip;
  if (period) sessionStorage.setItem('cooltrack-hist-period', period);
  if (tipo) sessionStorage.setItem('cooltrack-hist-tipo', tipo);

  mocks.getState.mockReturnValue(state);
  mocks.findEquip.mockImplementation((id) =>
    (state.equipamentos || []).find((equipamento) => equipamento.id === id),
  );

  const historico = await import('../ui/views/historico.js');
  if (clienteFilter) historico.setHistClienteFilter(clienteFilter);
  else historico.clearHistClienteFilter();

  await historico.renderHist();
  await Promise.resolve();
  return historico;
}

function expectNoInjectedMarkup(root) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect([...root.querySelectorAll('img')].some((img) => img.hasAttribute('onerror'))).toBe(false);
  root.querySelectorAll('[href], [src], [data-photo-url]').forEach((node) => {
    const values = ['href', 'src', 'data-photo-url']
      .map((attr) => node.getAttribute(attr))
      .filter(Boolean);
    values.forEach((value) => expect(value.toLowerCase()).not.toContain('javascript:'));
  });
}

describe('historico DOM filters/search render adapter', () => {
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
  });

  it('renderiza header, busca, filtros e quick filters com ids/classes publicos', async () => {
    await renderHistoricoFilters(baseState());

    expect(document.querySelector('#view-historico')).not.toBeNull();
    expect(document.querySelector('#hist-sticky-header.hist-sticky-header')).not.toBeNull();
    expect(document.querySelector('.hist-title')?.textContent).toContain('Hist');
    expect(document.querySelector('#hist-count.hist-count')?.textContent).toBe('2 registros');
    expect(document.querySelector('.hist-search-row')).not.toBeNull();
    expect(document.querySelector('label.hist-input[for="hist-busca"]')).not.toBeNull();
    expect(document.querySelector('#hist-busca.hist-input')).toBeNull();
    expect(document.querySelector('#hist-busca')?.getAttribute('type')).toBe('search');
    expect(
      document.querySelector(
        '#hist-filters-trigger.hist-filters-trigger[data-hist-action="open-filters-sheet"]',
      ),
    ).not.toBeNull();
    expect(document.querySelector('#hist-filters-count')).not.toBeNull();
    expect(document.querySelector('.hist-select #hist-setor')).not.toBeNull();
    expect(document.querySelector('.hist-select #hist-equip')).not.toBeNull();
    expect(document.querySelector('#hist-quickfilters-slot .hist-quickfilters')).not.toBeNull();
    expect(
      document.querySelectorAll('[data-hist-action="hist-filter-period"][data-period]'),
    ).toHaveLength(4);
    expect(
      document.querySelectorAll('[data-hist-action="hist-filter-tipo"][data-tipo-id]'),
    ).toHaveLength(5);
    expect(document.querySelector('#hist-active-chips-slot .hist-active-chips')).toBeNull();
    expect(document.querySelector('#hist-chrono-label.hist-chrono-label')).toBeNull();
  });

  it('integra busca textual ao view model e preserva chip/botao de limpar busca', async () => {
    await renderHistoricoFilters(baseState(), { busca: 'troca' });

    expect(document.querySelector('#hist-count')?.textContent).toBe('1 registro');
    const chipsSlot = document.getElementById('hist-active-chips-slot');
    expect(chipsSlot?.querySelector('.hist-active-chips')).not.toBeNull();
    expect(chipsSlot?.querySelector('.hist-active-chip')?.textContent).toContain('Busca');
    expect(chipsSlot?.querySelector('.hist-active-chip')?.textContent).toContain('"troca"');
    expect(chipsSlot?.querySelector('[data-hist-action="hist-clear-busca"]')).not.toBeNull();
    expect(chipsSlot?.querySelector('[data-hist-action="hist-clear-all"]')).not.toBeNull();
    expect(mocks.openLightbox).not.toHaveBeenCalled();
    expect(mocks.markRegistroDeleted).not.toHaveBeenCalled();
  });

  it('preserva filtros de periodo, tipo, setor, equipamento, badge e chips ativos', async () => {
    await renderHistoricoFilters(baseState(), {
      setor: 'setor-1',
      equip: 'eq-1',
      period: '7d',
      tipo: 'preventiva',
    });

    expect(document.querySelector('#hist-count')?.textContent).toBe('1 registro');
    expect(document.querySelector('#hist-setor')?.value).toBe('setor-1');
    expect(document.querySelector('#hist-equip')?.value).toBe('eq-1');
    expect(
      document.querySelector(
        '[data-hist-action="hist-filter-period"][data-period="7d"][aria-pressed="true"]',
      ),
    ).not.toBeNull();
    expect(
      document.querySelector(
        '[data-hist-action="hist-filter-tipo"][data-tipo-id="preventiva"][aria-pressed="true"]',
      ),
    ).not.toBeNull();

    const filtersTrigger = document.getElementById('hist-filters-trigger');
    const filtersCount = document.getElementById('hist-filters-count');
    expect(filtersTrigger?.classList.contains('is-active')).toBe(true);
    expect(filtersCount?.hidden).toBe(false);
    expect(filtersCount?.textContent).toBe('3');

    const chipsSlot = document.getElementById('hist-active-chips-slot');
    expect(chipsSlot?.querySelectorAll('.hist-active-chip')).toHaveLength(4);
    expect(chipsSlot?.textContent).toContain('Setor');
    expect(chipsSlot?.textContent).toContain('Loja');
    expect(chipsSlot?.textContent).toContain('Equipamento');
    expect(chipsSlot?.textContent).toContain('Split Recepcao');
    expect(chipsSlot?.textContent).toContain('Tipo');
    expect(chipsSlot?.textContent).toContain('Preventiva');
    expect(chipsSlot?.textContent).toContain('7 dias');
    expect(chipsSlot?.querySelector('[data-hist-action="hist-clear-setor"]')).not.toBeNull();
    expect(chipsSlot?.querySelector('[data-hist-action="hist-clear-equip"]')).not.toBeNull();
    expect(chipsSlot?.querySelector('[data-hist-action="hist-clear-tipo"]')).not.toBeNull();
    expect(chipsSlot?.querySelector('[data-hist-action="hist-clear-period"]')).not.toBeNull();
  });

  it('abre o sheet mobile com filtros atuais e callbacks do adapter', async () => {
    const state = baseState();
    await renderHistoricoFilters(state, {
      setor: 'setor-1',
      equip: 'eq-1',
      tipo: 'preventiva',
    });
    await Promise.resolve();

    document.getElementById('hist-filters-trigger').click();

    expect(mocks.openFiltersSheet).toHaveBeenCalledTimes(1);
    const sheetOptions = mocks.openFiltersSheet.mock.calls[0][0];
    expect(sheetOptions.setores).toEqual(state.setores);
    expect(sheetOptions.equipamentos).toEqual([
      { id: 'eq-1', nome: 'Split Recepcao', setorId: 'setor-1' },
      { id: 'eq-2', nome: 'Chiller Central', setorId: 'setor-2' },
    ]);
    expect(sheetOptions.tipoOptions.map((option) => option.id)).toEqual([
      'preventiva',
      'corretiva',
      'limpeza',
      'recarga',
      'inspecao',
    ]);
    expect(sheetOptions.initial).toEqual({
      setor: 'setor-1',
      equip: 'eq-1',
      tipo: 'preventiva',
    });
    expect(sheetOptions.onApply).toEqual(expect.any(Function));
    expect(sheetOptions.onReset).toEqual(expect.any(Function));

    sheetOptions.onApply({ setor: 'setor-2', equip: 'eq-2', tipo: 'corretiva' });
    await Promise.resolve();
    expect(sessionStorage.getItem('cooltrack-hist-tipo')).toBe('corretiva');
    expect(document.getElementById('hist-setor')?.value).toBe('setor-2');
    expect(document.getElementById('hist-equip')?.value).toBe('eq-2');

    sheetOptions.onReset();
    await Promise.resolve();
    expect(sessionStorage.getItem('cooltrack-hist-tipo')).toBeNull();
    expect(document.getElementById('hist-setor')?.value).toBe('');
    expect(document.getElementById('hist-equip')?.value).toBe('');
  });

  it('preserva contrato de filtro por cliente e acao clear-cliente-filter', async () => {
    await renderHistoricoFilters(baseState(), {
      clienteFilter: { id: 'cliente-1', nome: 'Alpha Mercado' },
    });

    const chipsSlot = document.getElementById('hist-active-chips-slot');
    expect(document.querySelector('#hist-count')?.textContent).toBe('1 registro');
    expect(chipsSlot?.querySelector('.hist-active-chips')).not.toBeNull();
    expect(chipsSlot?.textContent).toContain('Cliente');
    expect(chipsSlot?.textContent).toContain('Alpha Mercado');
    expect(chipsSlot?.querySelector('[data-hist-action="clear-cliente-filter"]')).not.toBeNull();
  });

  it('preserva busca e filtros ao desmontar e renderizar a ilha novamente', async () => {
    const historico = await renderHistoricoFilters(baseState(), {
      busca: 'troca',
      setor: 'setor-1',
      equip: 'eq-1',
      period: '7d',
      tipo: 'preventiva',
    });

    await historico.unmountHistoricoFilters();
    expect(document.querySelector('#hist-filters-root')?.innerHTML).toBe('');

    await historico.renderHist();
    await Promise.resolve();

    expect(document.querySelector('#hist-busca')?.value).toBe('troca');
    expect(document.querySelector('#hist-setor')?.value).toBe('setor-1');
    expect(document.querySelector('#hist-equip')?.value).toBe('eq-1');
    expect(
      document.querySelector(
        '[data-hist-action="hist-filter-period"][data-period="7d"][aria-pressed="true"]',
      ),
    ).not.toBeNull();
    expect(
      document.querySelector(
        '[data-hist-action="hist-filter-tipo"][data-tipo-id="preventiva"][aria-pressed="true"]',
      ),
    ).not.toBeNull();
  });

  it('escapa valores dinamicos de busca, setores, equipamentos e chips ativos', async () => {
    const malicious = '<img src=x onerror=alert(1)><script>alert(1)</script>javascript:alert(2)';
    await renderHistoricoFilters(
      baseState({
        registros: [
          {
            id: 'reg-xss',
            equipId: 'eq-xss',
            data: '2026-04-30T09:30:00',
            tipo: 'Preventiva',
            obs: malicious,
            tecnico: malicious,
          },
        ],
        equipamentos: [
          {
            id: 'eq-xss',
            nome: malicious,
            setorId: 'setor-xss',
            clienteId: 'cliente-xss',
            status: 'ok',
          },
        ],
        setores: [{ id: 'setor-xss', nome: malicious }],
        clientes: [{ id: 'cliente-xss', nome: malicious }],
      }),
      {
        busca: malicious,
        setor: 'setor-xss',
        equip: 'eq-xss',
        tipo: 'preventiva',
        period: '7d',
      },
    );

    expectNoInjectedMarkup(document.getElementById('hist-sticky-header'));
    expectNoInjectedMarkup(document.getElementById('hist-active-chips-slot'));
    expect(document.querySelector('#hist-active-chips-slot')?.textContent).toContain(
      'javascript:alert(2)',
    );
  });

  it('mantem filtros/busca atuais sem importar React/createRoot no adapter', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const source = fs.readFileSync(path.resolve('./src/ui/views/historico.js'), 'utf-8');

    expect(source).not.toMatch(/createRoot|from ['"]react|from ['"]react-dom/i);
  });
});
