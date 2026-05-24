import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountClientesDom, unmountClientesDom } from '../ui/views/clientes/pageRenderer.js';
import { CLIENTES_ACTIONS, CLIENTES_PUBLIC_IDS } from '../ui/viewModels/clientesContracts.js';

const PMOC_SUMMARY = {
  activeLabel: 'PMOC 2026 ativo',
  status: 'em_dia',
  statusLabel: 'Cronograma em dia',
  lastUpdateLabel: '10/04/2026',
  nextMaintenanceLabel: '10/05/2026',
  doneCount: 2,
  plannedCount: 4,
  statusHelp: 'Em dia.',
};

function createCliente(overrides = {}) {
  return {
    id: 'c1',
    nome: 'Alpha Mercado',
    razaoSocial: 'Alpha Ltda',
    cnpj: '11222333000181',
    endereco: 'Rua 1, Centro, Campinas, SP',
    contato: 'alpha@example.com',
    ...overrides,
  };
}

function createViewModel(overrides = {}) {
  const cliente = createCliente();
  const indexed = new Map([
    [
      'c1',
      {
        status: 'ativo',
        displayCity: 'Campinas',
        equipsCount: 2,
        servicesCount: 3,
        lastServiceTs: new Date('2026-04-10T12:00:00.000Z').getTime(),
        sinceLast: 3 * 24 * 60 * 60 * 1000,
        pmocSummary: PMOC_SUMMARY,
        pmocOverdueCount: 0,
      },
    ],
  ]);

  return {
    clientes: [cliente],
    equipamentos: [
      { id: 'e1', clienteId: 'c1', criadoEm: '2026-04-01T12:00:00.000Z' },
      { id: 'e2', clienteId: 'c1', criadoEm: '2026-04-02T12:00:00.000Z' },
    ],
    registros: [{ id: 'r1', equipId: 'e1', data: '2026-04-10', tipo: 'preventiva' }],
    indexed,
    filtered: [cliente],
    pageItems: [cliente],
    cities: ['Campinas', 'Santos'],
    filters: {
      searchTerm: 'alpha',
      statusFilter: 'ativo',
      cityFilter: 'Campinas',
      sortBy: 'nome',
      currentPage: 1,
      pageSize: 6,
    },
    pagination: {
      currentPage: 1,
      pageSize: 6,
      totalPages: 1,
      filteredCount: 1,
      from: 1,
      to: 1,
    },
    summaryCollapsed: false,
    isEmpty: false,
    isFilterEmpty: false,
    ...overrides,
  };
}

describe('clientes DOM renderer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts in #clientes-root preserving public ids, classes and action contracts', () => {
    document.body.innerHTML = '<div id="view-clientes"><div id="clientes-root"></div></div>';
    const root = document.getElementById(CLIENTES_PUBLIC_IDS.root);
    mountClientesDom(root, { viewModel: createViewModel() });

    expect(root?.dataset.clientesMounted).toBe('true');
    expect(root?.querySelector('.cli-page')).not.toBeNull();
    expect(root?.querySelector('.cli-card[data-id="c1"]')).not.toBeNull();
    expect(root?.querySelector(`#${CLIENTES_PUBLIC_IDS.searchInput}`)?.value).toBe('alpha');
    expect(root?.querySelector(`#${CLIENTES_PUBLIC_IDS.statusFilter}`)?.value).toBe('ativo');
    expect(root?.querySelector(`#${CLIENTES_PUBLIC_IDS.cityFilter}`)?.value).toBe('Campinas');
    expect(root?.querySelector(`#${CLIENTES_PUBLIC_IDS.sort}`)?.value).toBe('nome');
    expect(root?.querySelector(`#${CLIENTES_PUBLIC_IDS.pageSize}`)?.value).toBe('6');
    expect(
      root?.querySelector(`[data-action="${CLIENTES_ACTIONS.openModal}"][data-mode="create"]`),
    ).not.toBeNull();
    expect(
      root?.querySelector(`[data-cli-action="${CLIENTES_ACTIONS.verEquipamentos}"][data-id="c1"]`),
    ).not.toBeNull();
    expect(
      root
        ?.querySelector(`[data-cli-action="${CLIENTES_ACTIONS.verEquipamentos}"][data-id="c1"]`)
        ?.classList.contains('cli-card__action--primary'),
    ).toBe(true);
    expect(
      root?.querySelector(`[data-cli-action="${CLIENTES_ACTIONS.verServicos}"][data-id="c1"]`),
    ).not.toBeNull();
    expect(
      root
        ?.querySelector(`[data-cli-action="${CLIENTES_ACTIONS.verServicos}"][data-id="c1"]`)
        ?.classList.contains('cli-card__action--secondary'),
    ).toBe(true);
    expect(
      root?.querySelector(`[data-cli-action="${CLIENTES_ACTIONS.openPmocPanel}"][data-id="c1"]`),
    ).not.toBeNull();
    expect(
      root?.querySelector(`[data-cli-action="${CLIENTES_ACTIONS.cardMenu}"][data-id="c1"]`),
    ).not.toBeNull();
    expect(
      root?.querySelector(`[data-cli-action="${CLIENTES_ACTIONS.clearFilters}"]`),
    ).not.toBeNull();
  });

  it('renders empty and filter-empty states with legacy contracts', () => {
    document.body.innerHTML = '<div id="clientes-root"></div>';
    const root = document.getElementById(CLIENTES_PUBLIC_IDS.root);
    mountClientesDom(root, {
      viewModel: createViewModel({
        clientes: [],
        equipamentos: [],
        registros: [],
        indexed: new Map(),
        filtered: [],
        pageItems: [],
        cities: [],
        isEmpty: true,
        isFilterEmpty: false,
        pagination: {
          currentPage: 1,
          pageSize: 6,
          totalPages: 1,
          filteredCount: 0,
          from: 0,
          to: 0,
        },
      }),
    });

    expect(root?.querySelector('.cli-empty')?.textContent).toContain('Nenhum cliente cadastrado');
    expect(
      root?.querySelector(`[data-action="${CLIENTES_ACTIONS.openModal}"][data-mode="create"]`),
    ).not.toBeNull();
    mountClientesDom(root, {
      viewModel: createViewModel({
        pageItems: [],
        filtered: [],
        isEmpty: false,
        isFilterEmpty: true,
        filters: { ...createViewModel().filters, searchTerm: 'sem resultado' },
        pagination: {
          currentPage: 1,
          pageSize: 6,
          totalPages: 1,
          filteredCount: 0,
          from: 0,
          to: 0,
        },
      }),
    });

    expect(root?.querySelector('.cli-empty--filter')?.textContent).toContain(
      'Nenhum cliente encontrado',
    );
    expect(
      root?.querySelector(`[data-cli-action="${CLIENTES_ACTIONS.clearFilters}"]`),
    ).not.toBeNull();
  });

  it('updates an existing root instead of creating multiple roots for repeated calls', () => {
    document.body.innerHTML = '<div id="clientes-root"></div>';
    const root = document.getElementById(CLIENTES_PUBLIC_IDS.root);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mountClientesDom(root, { viewModel: createViewModel() });
    mountClientesDom(root, {
      viewModel: createViewModel({
        pageItems: [createCliente({ id: 'c2', nome: 'Beta Clinica' })],
        filtered: [createCliente({ id: 'c2', nome: 'Beta Clinica' })],
        clientes: [createCliente({ id: 'c2', nome: 'Beta Clinica' })],
        indexed: new Map([
          [
            'c2',
            {
              status: 'precisa_atencao',
              displayCity: 'Santos',
              equipsCount: 0,
              servicesCount: 0,
              lastServiceTs: 0,
              sinceLast: Infinity,
              pmocSummary: null,
              pmocOverdueCount: 0,
            },
          ],
        ]),
      }),
    });

    const cards = root?.querySelectorAll('.cli-card');
    expect(cards).toHaveLength(1);
    expect(cards?.[0].getAttribute('data-id')).toBe('c2');
    expect(cards?.[0].textContent).toContain('Beta Clinica');
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('unmounts safely and tolerates repeated unmount calls', () => {
    document.body.innerHTML = '<div id="clientes-root"></div>';
    const root = document.getElementById(CLIENTES_PUBLIC_IDS.root);
    mountClientesDom(root, { viewModel: createViewModel() });
    unmountClientesDom(root);
    unmountClientesDom(root);

    expect(root?.dataset.clientesMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('keeps legacy delegated handlers actionable through data attributes', () => {
    document.body.innerHTML = '<div id="view-clientes"><div id="clientes-root"></div></div>';
    const view = document.getElementById(CLIENTES_PUBLIC_IDS.view);
    const root = document.getElementById(CLIENTES_PUBLIC_IDS.root);
    const delegatedHandler = vi.fn();
    view?.addEventListener('click', (event) => {
      const target = event.target.closest?.('[data-cli-action], [data-action]');
      delegatedHandler(
        target?.getAttribute('data-cli-action') || target?.getAttribute('data-action'),
      );
    });
    mountClientesDom(root, { viewModel: createViewModel() });

    root
      ?.querySelector(`[data-cli-action="${CLIENTES_ACTIONS.verEquipamentos}"][data-id="c1"]`)
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    root
      ?.querySelector(`[data-action="${CLIENTES_ACTIONS.openModal}"][data-mode="create"]`)
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(delegatedHandler).toHaveBeenCalledWith(CLIENTES_ACTIONS.verEquipamentos);
    expect(delegatedHandler).toHaveBeenCalledWith(CLIENTES_ACTIONS.openModal);
  });

  it('escapes dynamic content and does not use unsafe React HTML APIs', () => {
    document.body.innerHTML = '<div id="clientes-root"></div>';
    const root = document.getElementById(CLIENTES_PUBLIC_IDS.root);
    const malicious = createCliente({
      nome: 'Cliente <img src=x onerror=alert(1)>',
      razaoSocial: 'Razao <script>alert(1)</script>',
      cnpj: '" autofocus onfocus="alert(1)',
      endereco: 'Rua <svg onload=alert(1)>, Campinas, SP',
    });
    mountClientesDom(root, {
      viewModel: createViewModel({
        clientes: [malicious],
        filtered: [malicious],
        pageItems: [malicious],
      }),
    });

    const html = root?.innerHTML || '';
    expect(root?.textContent).toContain('Cliente <img src=x onerror=alert(1)>');
    expect(root?.textContent).toContain('Razao <script>alert(1)</script>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&lt;svg onload=alert(1)&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(root?.querySelector('script')).toBeNull();
    expect(root?.querySelector('img[src="x"]')).toBeNull();
    expect(root?.querySelector('svg[onload]')).toBeNull();

    const pageSource = readFileSync('src/ui/views/clientes/pageRenderer.js', 'utf8');
    expect(pageSource).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
