import { describe, expect, it } from 'vitest';

import { mountClientesDom } from '../ui/views/clientes/pageRenderer.js';
import { CLIENTES_PUBLIC_IDS } from '../ui/viewModels/clientesContracts.js';

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
  return {
    clientes: [cliente],
    equipamentos: [{ id: 'e1', clienteId: 'c1' }],
    registros: [{ id: 'r1', equipId: 'e1', data: '2026-04-10', tipo: 'preventiva' }],
    indexed: new Map([
      [
        'c1',
        {
          status: 'ativo',
          displayCity: 'Campinas',
          equipsCount: 1,
          servicesCount: 1,
          lastServiceTs: new Date('2026-04-10T12:00:00.000Z').getTime(),
          sinceLast: 3 * 24 * 60 * 60 * 1000,
          pmocSummary: null,
          pmocOverdueCount: 0,
        },
      ],
    ]),
    filtered: [cliente],
    pageItems: [cliente],
    cities: ['Campinas'],
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
  it('mounts in #clientes-root preserving public classes and actions without React', () => {
    document.body.innerHTML = '<div id="view-clientes"><div id="clientes-root"></div></div>';
    const root = document.getElementById(CLIENTES_PUBLIC_IDS.root);

    mountClientesDom(root, { viewModel: createViewModel() });

    expect(root?.dataset.clientesMounted).toBe('true');
    expect(root?.querySelector('.cli-page')).not.toBeNull();
    expect(root?.querySelector('.cli-card[data-id="c1"]')).not.toBeNull();
    expect(root?.querySelector(`#${CLIENTES_PUBLIC_IDS.searchInput}`)?.value).toBe('alpha');
    expect(
      root?.querySelector('[data-cli-action="ver-equipamentos"][data-id="c1"]'),
    ).not.toBeNull();
  });
});
