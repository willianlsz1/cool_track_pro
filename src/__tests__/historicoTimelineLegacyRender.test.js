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
  HistoricoFiltersSheet: { open: vi.fn() },
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

function mountHistoricoDom({ busca = '' } = {}) {
  document.body.innerHTML = `
    <main id="view-historico">
      <div id="hist-sticky-header"></div>
      <div id="hist-count"></div>
      <input id="hist-busca" value="${busca}" />
      <button id="hist-filters-trigger"></button>
      <span id="hist-filters-count"></span>
      <select id="hist-setor"></select>
      <select id="hist-equip"></select>
      <div id="hist-quickfilters-slot"></div>
      <div id="hist-active-chips-slot"></div>
      <div id="hist-chrono-label"></div>
      <section id="timeline"></section>
    </main>
  `;
}

function baseState(overrides = {}) {
  return {
    registros: [],
    equipamentos: [],
    setores: [],
    clientes: [],
    ...overrides,
  };
}

async function renderTimeline(state, domOptions = {}) {
  mountHistoricoDom(domOptions);
  mocks.getState.mockReturnValue(state);
  mocks.findEquip.mockImplementation((id) =>
    (state.equipamentos || []).find((equipamento) => equipamento.id === id),
  );

  const { renderHist } = await import('../ui/views/historico.js');
  await renderHist();
  await Promise.resolve();

  return document.getElementById('timeline');
}

describe('historico legacy #timeline render', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-30T12:00:00'));
    window.history.replaceState(null, '', '/');
    sessionStorage.clear();
    mocks.applySavedHighlight.mockReturnValue(false);
    mocks.getOperationalStatus.mockReturnValue({ uiStatus: 'ok', label: 'Em dia' });
    mocks.isCachedPlanPro.mockReturnValue(false);
  });

  it('preserva #timeline e empty state quando nao ha registros validos', async () => {
    const timeline = await renderTimeline(
      baseState({
        registros: null,
        equipamentos: null,
        setores: null,
        clientes: null,
      }),
    );

    expect(document.getElementById('view-historico')).not.toBeNull();
    expect(timeline).not.toBeNull();
    expect(timeline.querySelector('.empty-state, .engaging-empty-state')).not.toBeNull();
    expect(timeline.textContent).toContain('Nenhum');
    expect(timeline.querySelector('[data-nav="registro"]')).not.toBeNull();
    expect(mocks.openLightbox).not.toHaveBeenCalled();
    expect(mocks.markRegistroDeleted).not.toHaveBeenCalled();
    expect(mocks.goTo).not.toHaveBeenCalled();
  });

  it('preserva grupos, itens, classes, acoes e atributos publicos da lista', async () => {
    const state = baseState({
      registros: [
        {
          id: 'reg-1',
          equipId: 'eq-1',
          data: '2026-04-30T09:30:00',
          tipo: 'Preventiva mensal',
          obs: 'Troca de filtros',
          tecnico: 'Ana',
          pecas: 'Filtro G4',
          fotos: ['https://cdn.example/foto-1.jpg', { url: 'https://cdn.example/foto-2.jpg' }],
          assinatura: true,
          clienteNome: 'Alpha Mercado',
          status: 'warn',
        },
        {
          id: 'reg-2',
          equipId: 'eq-2',
          data: '2026-04-29T10:00:00',
          tipo: 'Corretiva',
          obs: 'Compressor',
          status: 'ok',
        },
      ],
      equipamentos: [
        {
          id: 'eq-1',
          nome: 'Split Recepcao',
          tag: 'SP-01',
          setorId: 'setor-1',
          clienteId: 'cliente-1',
          status: 'warn',
        },
        {
          id: 'eq-2',
          nome: 'Chiller Central',
          setorId: 'setor-2',
          clienteId: 'cliente-2',
          status: 'ok',
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
    });
    const timeline = await renderTimeline(state);
    const items = [...timeline.querySelectorAll('.timeline__item')];
    const firstItem = items[0];

    expect(timeline.querySelector('.timeline')).not.toBeNull();
    expect(timeline.querySelectorAll('.hist-day-group').length).toBeGreaterThanOrEqual(2);
    expect(items).toHaveLength(2);
    expect(firstItem.classList.contains('timeline__item--latest')).toBe(true);
    expect(firstItem.getAttribute('data-reg-id')).toBe('reg-1');
    expect(firstItem.querySelector('.timeline__dot')).not.toBeNull();
    expect(firstItem.querySelector('.timeline__item__service')?.textContent).toContain(
      'Preventiva mensal',
    );
    expect(firstItem.querySelector('.timeline__item__equipment')?.textContent).toContain(
      'Split Recepcao',
    );
    expect(firstItem.querySelector('.timeline__item__photos')).not.toBeNull();

    expect(timeline.querySelector('[data-action="edit-reg"][data-id="reg-1"]')).not.toBeNull();
    expect(timeline.querySelector('[data-action="delete-reg"][data-id="reg-1"]')).not.toBeNull();
    expect(
      timeline.querySelector('[data-hist-action="toggle-card-menu"][data-id="reg-1"]'),
    ).not.toBeNull();
    expect(
      timeline.querySelector(
        '.timeline__item__photos-thumb img[src="https://cdn.example/foto-1.jpg"]',
      ),
    ).not.toBeNull();
    expect(
      timeline.querySelector('[data-hist-action="hist-view-signature"][data-id="reg-1"]'),
    ).toBeNull();
    expect(
      timeline.querySelector('[data-hist-action="hist-filter-equip"][data-equip-id="eq-1"]'),
    ).not.toBeNull();
  });

  it('escapa conteudo dinamico e bloqueia URLs perigosas em fotos sem renderizar assinatura', async () => {
    const maliciousText = '<img src=x onerror=alert(1)><script>alert(1)</script>';
    const state = baseState({
      registros: [
        {
          id: 'reg-xss',
          equipId: 'eq-xss',
          data: '2026-04-30T09:00:00',
          tipo: maliciousText,
          obs: maliciousText,
          tecnico: maliciousText,
          pecas: maliciousText,
          fotos: ['javascript:alert(1)', { url: 'JaVaScRiPt:alert(2)' }],
          assinatura: true,
          clienteNome: maliciousText,
          status: 'ok',
        },
      ],
      equipamentos: [
        {
          id: 'eq-xss',
          nome: maliciousText,
          tag: maliciousText,
          setorId: 'setor-xss',
          status: 'ok',
        },
      ],
      setores: [{ id: 'setor-xss', nome: maliciousText }],
      clientes: [],
    });
    const timeline = await renderTimeline(state);
    const html = timeline.innerHTML.toLowerCase();

    expect(timeline.querySelector('script')).toBeNull();
    expect(timeline.querySelector('[onclick]')).toBeNull();
    expect([...timeline.querySelectorAll('img')].some((img) => img.hasAttribute('onerror'))).toBe(
      false,
    );
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('<img src=x');
    expect(timeline.querySelector('[data-hist-action="hist-open-photo"]')).toBeNull();
    expect(timeline.querySelector('[data-hist-action="hist-view-signature"]')).toBeNull();
    expect(mocks.openLightbox).not.toHaveBeenCalled();
    expect(mocks.markRegistroDeleted).not.toHaveBeenCalled();
  });

  it('mantem o render legado sem React/createRoot', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const source = fs.readFileSync(path.resolve('./src/ui/views/historico.js'), 'utf-8');

    expect(source).not.toMatch(/createRoot|from ['"]react|from ['"]react-dom/i);
  });
});
