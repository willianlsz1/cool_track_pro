import { act } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountHistoricoFiltersReact,
  unmountHistoricoFiltersReact,
} from '../react/entrypoints/historicoFiltersIsland.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setRoot() {
  document.body.innerHTML = `
    <main id="view-historico">
      <div id="hist-filters-root"></div>
      <section id="timeline"></section>
    </main>
  `;
  return document.getElementById('hist-filters-root');
}

function createFiltersViewModel(overrides = {}) {
  return {
    countLabel: '2 registros',
    filters: {
      busca: '',
      setorId: '',
      equipId: '',
      period: 'tudo',
      tipo: '',
    },
    filtersCount: 0,
    setorOptions: [
      { id: 'setor-1', label: 'Loja' },
      { id: 'setor-2', label: 'Casa de maquinas' },
    ],
    equipamentoOptions: [
      { id: 'eq-1', label: 'Split Recepcao - Sala' },
      { id: 'eq-2', label: 'Chiller Central - Cobertura' },
    ],
    periodOptions: [
      { id: 'hoje', label: 'Hoje' },
      { id: '7d', label: 'Ultimos 7 dias' },
      { id: '30d', label: 'Ultimos 30 dias' },
      { id: 'tudo', label: 'Tudo' },
    ],
    tipoOptions: [
      { id: 'preventiva', label: 'Preventiva', color: 'cyan' },
      { id: 'corretiva', label: 'Corretiva', color: 'amber' },
      { id: 'limpeza', label: 'Limpeza', color: 'teal' },
      { id: 'recarga', label: 'Recarga', color: 'violet' },
      { id: 'inspecao', label: 'Inspecao', color: 'teal' },
    ],
    activeChips: [],
    showSetorSelect: true,
    ...overrides,
  };
}

function expectNoInjectedMarkup(root) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect([...root.querySelectorAll('img')].some((img) => img.hasAttribute('onerror'))).toBe(false);
}

describe('historico filters React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts only in the filters root preserving public ids, classes and data attributes', async () => {
    const root = setRoot();

    await act(async () => {
      mountHistoricoFiltersReact(root, { viewModel: createFiltersViewModel() });
    });

    expect(root?.dataset.reactHistoricoFiltersMounted).toBe('true');
    expect(document.getElementById('view-historico')?.dataset.reactHistoricoFiltersMounted).toBe(
      undefined,
    );
    expect(document.querySelector('#hist-sticky-header.hist-sticky-header')).not.toBeNull();
    expect(document.querySelector('.hist-title')?.textContent).toContain('Hist');
    expect(document.querySelector('#hist-count.hist-count')?.textContent).toBe('2 registros');
    expect(document.querySelector('.hist-search-row')).not.toBeNull();
    expect(document.querySelector('label.hist-input[for="hist-busca"]')).not.toBeNull();
    expect(document.querySelector('#hist-busca')?.getAttribute('type')).toBe('search');
    expect(
      document.querySelector(
        '#hist-filters-trigger.hist-filters-trigger[data-hist-action="open-filters-sheet"]',
      ),
    ).not.toBeNull();
    expect(document.querySelector('#hist-filters-count')?.hidden).toBe(true);
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
    expect(document.querySelector('#hist-chrono-label.hist-chrono-label')?.textContent).toContain(
      'Mais recente primeiro',
    );
    expect(document.getElementById('timeline')?.querySelector('#hist-busca')).toBeNull();
  });

  it('updates an existing root without duplicate roots or duplicate renders', async () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountHistoricoFiltersReact(root, { viewModel: createFiltersViewModel() });
      mountHistoricoFiltersReact(root, {
        viewModel: createFiltersViewModel({
          countLabel: '1 registro',
          filters: {
            busca: 'troca',
            setorId: '',
            equipId: '',
            period: 'tudo',
            tipo: '',
          },
          activeChips: [{ key: 'Busca', value: '"troca"', clearAction: 'hist-clear-busca' }],
        }),
      });
    });

    expect(root?.querySelectorAll('#hist-sticky-header')).toHaveLength(1);
    expect(root?.querySelectorAll('#hist-busca')).toHaveLength(1);
    expect(root?.querySelector('#hist-count')?.textContent).toBe('1 registro');
    expect(root?.querySelector('[data-hist-action="hist-clear-busca"]')).not.toBeNull();
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('unmounts safely and tolerates repeated calls', async () => {
    const root = setRoot();

    await act(async () => {
      mountHistoricoFiltersReact(root, { viewModel: createFiltersViewModel() });
      unmountHistoricoFiltersReact(root);
      unmountHistoricoFiltersReact(root);
    });

    expect(root?.dataset.reactHistoricoFiltersMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('renders search, selected filters, active chips, badge and clear actions', async () => {
    const root = setRoot();

    await act(async () => {
      mountHistoricoFiltersReact(root, {
        viewModel: createFiltersViewModel({
          countLabel: '1 registro',
          filters: {
            busca: 'troca',
            setorId: 'setor-1',
            equipId: 'eq-1',
            period: '7d',
            tipo: 'preventiva',
          },
          filtersCount: 3,
          activeChips: [
            { key: 'Cliente', value: 'Alpha Mercado', clearAction: 'clear-cliente-filter' },
            { key: 'Setor', value: 'Loja', clearAction: 'hist-clear-setor' },
            { key: 'Equipamento', value: 'Split Recepcao', clearAction: 'hist-clear-equip' },
            { key: 'Tipo', value: 'Preventiva', clearAction: 'hist-clear-tipo' },
            { key: 'Periodo', value: 'Ultimos 7 dias', clearAction: 'hist-clear-period' },
            { key: 'Busca', value: '"troca"', clearAction: 'hist-clear-busca' },
          ],
        }),
      });
    });

    expect(document.querySelector('#hist-count')?.textContent).toBe('1 registro');
    expect(document.querySelector('#hist-busca')?.defaultValue).toBe('troca');
    expect(document.querySelector('#hist-setor')?.value).toBe('setor-1');
    expect(document.querySelector('#hist-equip')?.value).toBe('eq-1');
    expect(document.querySelector('#hist-filters-trigger')?.classList.contains('is-active')).toBe(
      true,
    );
    expect(document.querySelector('#hist-filters-count')?.hidden).toBe(false);
    expect(document.querySelector('#hist-filters-count')?.textContent).toBe('3');
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
    expect(document.querySelectorAll('#hist-active-chips-slot .hist-active-chip')).toHaveLength(6);
    expect(document.querySelector('[data-hist-action="clear-cliente-filter"]')).not.toBeNull();
    expect(document.querySelector('[data-hist-action="hist-clear-setor"]')).not.toBeNull();
    expect(document.querySelector('[data-hist-action="hist-clear-equip"]')).not.toBeNull();
    expect(document.querySelector('[data-hist-action="hist-clear-tipo"]')).not.toBeNull();
    expect(document.querySelector('[data-hist-action="hist-clear-period"]')).not.toBeNull();
    expect(document.querySelector('[data-hist-action="hist-clear-busca"]')).not.toBeNull();
    expect(document.querySelector('[data-hist-action="hist-clear-all"]')).not.toBeNull();
  });

  it('renders malicious filter values as text without HTML/script injection', async () => {
    const root = setRoot();
    const malicious = '<img src=x onerror=alert(1)><script>alert(1)</script>';

    await act(async () => {
      mountHistoricoFiltersReact(root, {
        viewModel: createFiltersViewModel({
          filters: {
            busca: malicious,
            setorId: 'setor-xss',
            equipId: 'eq-xss',
            period: '7d',
            tipo: 'preventiva',
          },
          filtersCount: 3,
          setorOptions: [{ id: 'setor-xss', label: malicious }],
          equipamentoOptions: [{ id: 'eq-xss', label: malicious }],
          activeChips: [
            { key: 'Setor', value: malicious, clearAction: 'hist-clear-setor' },
            { key: 'Equipamento', value: malicious, clearAction: 'hist-clear-equip' },
            { key: 'Busca', value: `"${malicious}"`, clearAction: 'hist-clear-busca' },
          ],
        }),
      });
    });

    expectNoInjectedMarkup(root);
    expect(root?.textContent).toContain(malicious);
  });

  it('renders without depending on timeline, photos, signatures, PDF or delete flows', async () => {
    const root = setRoot();
    document.getElementById('timeline')?.remove();

    await act(async () => {
      mountHistoricoFiltersReact(root, { viewModel: createFiltersViewModel() });
    });

    expect(root?.querySelector('#hist-sticky-header')).not.toBeNull();
    expect(root?.querySelector('[data-action="delete-reg"]')).toBeNull();
    expect(root?.querySelector('[data-hist-action="hist-open-photo"]')).toBeNull();
    expect(root?.querySelector('[data-hist-action="hist-view-signature"]')).toBeNull();
    expect(root?.querySelector('[data-nav="relatorio"]')).toBeNull();
  });

  it('keeps historico.js free from direct createRoot imports', () => {
    const source = readFileSync('./src/ui/views/historico.js', 'utf-8');

    expect(source).not.toMatch(/createRoot|from ['"]react|from ['"]react-dom/i);
  });
});
