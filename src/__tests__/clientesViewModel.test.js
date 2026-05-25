import { describe, expect, it } from 'vitest';
import {
  buildClientesViewModel,
  normalizeClientesFilters,
} from '../ui/viewModels/clientesViewModel.js';
import {
  CLIENTES_ACTIONS,
  CLIENTES_PUBLIC_IDS,
  CLIENTES_STATUS_OPTIONS,
} from '../ui/viewModels/clientesContracts.js';

const NOW_MS = new Date('2026-04-28T12:00:00.000Z').getTime();

function buildBaseState() {
  return {
    clientes: [
      {
        id: 'c1',
        nome: 'Alpha Mercado',
        razaoSocial: 'Alpha Ltda',
        cnpj: '11222333000181',
        endereco: 'Rua 1, Centro, Campinas, SP',
        contato: 'alpha@example.com',
      },
      {
        id: 'c2',
        nome: 'Beta Clinica',
        endereco: 'Rua 2, Santos, SP',
      },
      {
        id: 'c3',
        nome: 'Gamma Hotel',
        endereco: 'Rua 3, Campinas, SP',
      },
    ],
    equipamentos: [
      {
        id: 'e1',
        clienteId: 'c1',
        criadoEm: '2026-04-10T12:00:00.000Z',
        periodicidadePreventivaDias: 30,
      },
      {
        id: 'e2',
        clienteId: 'c2',
        criadoEm: '2026-01-10T12:00:00.000Z',
        periodicidadePreventivaDias: 30,
      },
    ],
    registros: [
      { id: 'r1', equipId: 'e1', data: '2026-04-10', tipo: 'preventiva' },
      { id: 'r2', equipId: 'e2', data: '2025-12-01', tipo: 'preventiva' },
    ],
  };
}

describe('clientes view model', () => {
  it('representa estado vazio sem acessar DOM ou infraestrutura', () => {
    const vm = buildClientesViewModel({
      clientes: [],
      equipamentos: [],
      registros: [],
      nowMs: NOW_MS,
    });

    expect(vm.isEmpty).toBe(true);
    expect(vm.isFilterEmpty).toBe(false);
    expect(vm.pageItems).toEqual([]);
    expect(vm.filtered).toEqual([]);
    expect(vm.cities).toEqual([]);
    expect(vm.pagination).toEqual({
      currentPage: 1,
      pageSize: 6,
      totalPages: 1,
      filteredCount: 0,
      from: 0,
      to: 0,
    });
  });

  it('monta lista paginada com status e cidades', () => {
    const state = buildBaseState();

    const vm = buildClientesViewModel({
      ...state,
      nowMs: NOW_MS,
      currentPage: 1,
      pageSize: 6,
    });

    expect(vm.isEmpty).toBe(false);
    expect(vm.filtered.map((cliente) => cliente.id)).toEqual(['c1', 'c2', 'c3']);
    expect(vm.pageItems.map((cliente) => cliente.id)).toEqual(['c1', 'c2', 'c3']);
    expect(vm.cities).toEqual(['Campinas', 'Santos']);
    expect(vm.pagination).toMatchObject({
      currentPage: 1,
      pageSize: 6,
      totalPages: 1,
      filteredCount: 3,
      from: 1,
      to: 3,
    });
    expect(vm.indexed.get('c1')).toMatchObject({
      status: 'ativo',
      equipsCount: 1,
      servicesCount: 1,
      displayCity: 'Campinas',
    });
    expect(vm.indexed.get('c2')?.status).toBe('precisa_atencao');
  });

  it('aplica busca, filtro de status/cidade e clamp de pagina', () => {
    const state = buildBaseState();

    const vm = buildClientesViewModel({
      ...state,
      searchTerm: 'clinica',
      statusFilter: 'precisa_atencao',
      cityFilter: 'Santos',
      sortBy: 'nome',
      currentPage: 5,
      pageSize: 6,
      nowMs: NOW_MS,
    });

    expect(vm.filtered.map((cliente) => cliente.id)).toEqual(['c2']);
    expect(vm.pageItems.map((cliente) => cliente.id)).toEqual(['c2']);
    expect(vm.pagination.currentPage).toBe(1);
    expect(vm.isFilterEmpty).toBe(false);
    expect(vm.filters).toMatchObject({
      searchTerm: 'clinica',
      statusFilter: 'precisa_atencao',
      cityFilter: 'Santos',
      sortBy: 'nome',
      currentPage: 1,
      pageSize: 6,
    });
  });

  it('normaliza dados ausentes ou invalidos sem quebrar a renderizacao futura', () => {
    const filters = normalizeClientesFilters({
      searchTerm: null,
      statusFilter: '',
      cityFilter: '',
      sortBy: '',
      currentPage: 'abc',
      pageSize: 'bad',
    });

    expect(filters).toEqual({
      searchTerm: '',
      statusFilter: 'todos',
      cityFilter: 'todas',
      sortBy: 'mais_ativos',
      currentPage: 1,
      pageSize: 6,
    });

    const vm = buildClientesViewModel({
      clientes: null,
      equipamentos: undefined,
      registros: 'invalid',
      currentPage: -10,
      pageSize: 999,
    });

    expect(vm.isEmpty).toBe(true);
    expect(vm.pagination.currentPage).toBe(1);
    expect(vm.pagination.pageSize).toBe(6);
  });

  it('centraliza contratos publicos que a ilha React deve preservar', () => {
    expect(CLIENTES_PUBLIC_IDS).toMatchObject({
      view: 'view-clientes',
      root: 'clientes-root',
      searchInput: 'cli-search-input',
      statusFilter: 'cli-status-filter',
      cityFilter: 'cli-city-filter',
      sort: 'cli-sort',
      pageSize: 'cli-page-size',
    });

    expect(CLIENTES_ACTIONS).toMatchObject({
      openModal: 'open-cliente-modal',
      editModal: 'edit-cliente',
      deleteModal: 'delete-cliente',
      cardMenuModal: 'cliente-card-menu',
      gotoPage: 'goto-page',
      clearFilters: 'clear-filters',
      edit: 'edit',
      alert: 'alert',
      delete: 'delete',
      cardMenu: 'card-menu',
      verEquipamentos: 'ver-equipamentos',
      verServicos: 'ver-servi\u00e7os',
    });
    expect(Object.keys(CLIENTES_ACTIONS).some((action) => /deprecated/i.test(action))).toBe(false);

    expect(CLIENTES_STATUS_OPTIONS.map((option) => option.id)).toEqual([
      'todos',
      'ativo',
      'sem_manutencao',
      'precisa_atencao',
    ]);
  });
});
