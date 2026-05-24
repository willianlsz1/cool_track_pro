import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountEquipamentosHeader,
  unmountEquipamentosHeader,
} from '../ui/views/equipamentos/bridges/headerBridge.js';
import {
  EQUIPAMENTOS_ACTIONS,
  EQUIPAMENTOS_PUBLIC_IDS,
} from '../ui/viewModels/equipamentosContracts.js';

function setShell() {
  document.body.innerHTML = `
    <section id="${EQUIPAMENTOS_PUBLIC_IDS.view}">
      <section id="${EQUIPAMENTOS_PUBLIC_IDS.hero}" class="equip-hero" aria-labelledby="equip-hero-title" hidden></section>
      <nav id="${EQUIPAMENTOS_PUBLIC_IDS.filters}" class="equip-filters" aria-label="Filtrar equipamentos" hidden></nav>
      <div id="${EQUIPAMENTOS_PUBLIC_IDS.toolbarActions}">
        <button type="button" data-action="open-modal" data-id="modal-add-eq">+ Novo equipamento</button>
      </div>
      <div id="${EQUIPAMENTOS_PUBLIC_IDS.contextChip}"></div>
      <div class="equip-search-row">
        <div class="search-bar" id="${EQUIPAMENTOS_PUBLIC_IDS.searchBar}">
          <input class="form-control search-bar__input" id="${EQUIPAMENTOS_PUBLIC_IDS.searchInput}" />
        </div>
        <div class="equip-view-toggle" role="group" aria-label="Modo de visualizacao">
          <button type="button" class="equip-view-toggle__btn" data-action="equip-set-view-mode" data-mode="list">Lista</button>
          <button type="button" class="equip-view-toggle__btn" data-action="equip-set-view-mode" data-mode="grid">Grade</button>
        </div>
      </div>
      <div id="${EQUIPAMENTOS_PUBLIC_IDS.list}" role="list" data-equipamentos-list-mounted="true"></div>
    </section>
  `;
  return document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.hero);
}

function createHeaderViewModel(overrides = {}) {
  return {
    hero: {
      visible: true,
      title: 'Atencao agora',
      subtitle: '1 equipamento precisando acao imediata.',
      items: [{ id: 'eq-1', name: 'Split Alpha' }],
      ...overrides.hero,
    },
    filters: {
      visible: true,
      chips: [
        { id: 'todos', label: 'Todos', count: 2, tone: 'neutral', active: true, empty: false },
        {
          id: 'em-atencao',
          label: 'Em atencao',
          count: 1,
          tone: 'warn',
          active: false,
          empty: false,
        },
        {
          id: 'criticos',
          label: 'Criticos',
          count: 1,
          tone: 'danger',
          active: false,
          empty: false,
        },
        {
          id: 'sem-setor',
          label: 'Sem setor',
          count: 0,
          tone: 'neutral',
          active: false,
          empty: true,
        },
        {
          id: 'preventiva-vencida',
          label: 'Preventiva vencida',
          count: 0,
          tone: 'cyan',
          active: false,
          empty: true,
        },
      ],
      ...overrides.filters,
    },
    context: {
      visible: false,
      label: '',
      ...overrides.context,
    },
  };
}

function mountHeader(viewModel = createHeaderViewModel()) {
  return mountEquipamentosHeader({
    root: document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.hero),
    filtersRoot: document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.filters),
    contextRoot: document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.contextChip),
    viewModel,
  });
}

describe('equipamentos header DOM bridge', () => {
  afterEach(() => {
    unmountEquipamentosHeader();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts on #equip-hero and preserves public roots without touching list, toolbar or search', async () => {
    const root = setShell();

    await mountHeader();

    expect(root?.dataset.equipamentosHeaderMounted).toBe('true');
    expect(root?.id).toBe(EQUIPAMENTOS_PUBLIC_IDS.hero);
    expect(root?.classList.contains('equip-hero')).toBe(true);
    expect(root?.hasAttribute('hidden')).toBe(false);
    expect(document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.filters)).not.toBeNull();
    expect(document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.contextChip)).not.toBeNull();
    expect(document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.searchBar)).not.toBeNull();
    expect(document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.searchInput)).not.toBeNull();
    expect(document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.toolbarActions)?.innerHTML).toContain(
      'modal-add-eq',
    );
    expect(
      document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.list)?.dataset.equipamentosListMounted,
    ).toBe('true');
  });

  it('renders empty state as hidden hero and filters without requiring list, sectors, photos or CRUD', async () => {
    const root = setShell();

    await mountHeader(
      createHeaderViewModel({
        hero: { visible: false, subtitle: '', items: [] },
        filters: { visible: false, chips: [] },
      }),
    );

    expect(root?.hasAttribute('hidden')).toBe(true);
    expect(document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.filters)?.hasAttribute('hidden')).toBe(
      true,
    );
    expect(document.querySelector('[data-action="delete-equip"]')).toBeNull();
    expect(document.querySelector('[data-action="open-setor"]')).toBeNull();
    expect(document.querySelector('[data-action="open-eq-photos-editor"]')).toBeNull();
  });

  it('preserves hero and quick filter contracts with equipment data', async () => {
    const root = setShell();

    await mountHeader();

    expect(root?.querySelector('#equip-hero-title')?.textContent).toBe('Atencao agora');
    expect(root?.querySelector('#equip-hero-sub')?.textContent).toContain('1 equipamento');
    expect(root?.querySelectorAll('.equip-hero__kpi')).toHaveLength(1);
    expect(
      root?.querySelector(
        `[data-action="${EQUIPAMENTOS_ACTIONS.goRegisterEquip}"][data-id="eq-1"]`,
      ),
    ).not.toBeNull();

    const filtersRoot = document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.filters);
    expect(filtersRoot?.hasAttribute('hidden')).toBe(false);
    expect(filtersRoot?.querySelectorAll('.equip-filter')).toHaveLength(5);
    expect(
      filtersRoot?.querySelector(
        `[data-action="${EQUIPAMENTOS_ACTIONS.quickFilter}"][data-id="criticos"]`,
      ),
    ).not.toBeNull();
    expect(filtersRoot?.querySelector('[data-id="todos"]')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('renders cliente and setor contexts preserving clear action', async () => {
    setShell();

    await mountHeader(
      createHeaderViewModel({
        context: { visible: true, label: 'Filtrando: Cliente Alpha' },
      }),
    );

    const contextRoot = document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.contextChip);
    expect(contextRoot?.querySelector('.equip-breadcrumb')).not.toBeNull();
    expect(contextRoot?.querySelector('.equip-breadcrumb__item--current')?.textContent).toBe(
      'Filtrando: Cliente Alpha',
    );
    expect(
      contextRoot?.querySelector(`[data-action="${EQUIPAMENTOS_ACTIONS.clearClienteFilter}"]`),
    ).not.toBeNull();

    await mountHeader(
      createHeaderViewModel({
        context: { visible: true, label: 'Filtrando: Setor' },
      }),
    );

    expect(contextRoot?.querySelector('.equip-breadcrumb__item--current')?.textContent).toBe(
      'Filtrando: Setor',
    );
    expect(contextRoot?.querySelectorAll('.equip-breadcrumb')).toHaveLength(1);
  });

  it('updates repeated mounts without duplicate content', async () => {
    const root = setShell();

    await mountHeader();
    await mountHeader(
      createHeaderViewModel({
        hero: {
          subtitle: '2 equipamentos precisando acao imediata.',
          items: [
            { id: 'eq-1', name: 'Split Alpha' },
            { id: 'eq-2', name: 'Camara Beta' },
          ],
        },
        filters: {
          chips: [
            {
              id: 'todos',
              label: 'Todos',
              count: 2,
              tone: 'neutral',
              active: false,
              empty: false,
            },
            {
              id: 'criticos',
              label: 'Criticos',
              count: 2,
              tone: 'danger',
              active: true,
              empty: false,
            },
          ],
        },
      }),
    );

    expect(root?.querySelectorAll('#equip-hero-title')).toHaveLength(1);
    expect(root?.querySelectorAll('.equip-hero__kpi')).toHaveLength(2);
    expect(document.querySelectorAll('#equip-filters .equip-filter')).toHaveLength(2);
  });

  it('unmounts safely and clears contextual content', async () => {
    const root = setShell();

    await mountHeader();
    unmountEquipamentosHeader();
    unmountEquipamentosHeader();

    expect(root?.dataset.equipamentosHeaderMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
    expect(document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.filters)?.innerHTML).toBe('');
    expect(document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.contextChip)?.innerHTML).toBe('');
  });

  it('keeps malicious labels inert and avoids unsafe HTML injection', async () => {
    setShell();
    const malicious = '"><img src=x onerror=alert(1)><script>alert(2)</script>';

    await mountHeader(
      createHeaderViewModel({
        hero: {
          title: malicious,
          subtitle: malicious,
          items: [{ id: 'eq-xss', name: malicious }],
        },
        filters: {
          chips: [
            {
              id: 'todos',
              label: malicious,
              count: 1,
              tone: 'neutral',
              active: true,
              empty: false,
            },
          ],
        },
        context: { visible: true, label: malicious },
      }),
    );

    const view = document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.view);
    expect(view?.textContent).toContain(malicious);
    expect(view?.querySelector('script')).toBeNull();
    expect(view?.querySelector('img')).toBeNull();
    expect(view?.querySelector('[onerror]')).toBeNull();
    expect(view?.querySelector('[onclick]')).toBeNull();

    const bridgeSource = readFileSync('src/ui/views/equipamentos/bridges/headerBridge.js', 'utf8');
    expect(bridgeSource).not.toMatch(/dangerouslySetInnerHTML|innerHTML\s*=/);
  });

  it('keeps the legacy adapter free from React imports', () => {
    const adapterSource = readFileSync('src/ui/views/equipamentos.js', 'utf8');
    const bridgeSource = readFileSync('src/ui/views/equipamentos/bridges/headerBridge.js', 'utf8');

    expect(adapterSource).not.toContain('equipamentosHeaderIsland.jsx');
    expect(bridgeSource).not.toContain('../../../react/entrypoints/equipamentosHeaderIsland.jsx');
    expect(adapterSource).not.toMatch(/react-dom\/client|createRoot/);
  });
});
