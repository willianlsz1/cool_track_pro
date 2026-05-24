import { describe, expect, it } from 'vitest';
import { buildClienteIndex, filterAndSortClientes } from '../ui/views/clientes/dataModel.js';

function makeNow() {
  return new Date('2026-04-28T12:00:00.000Z').getTime();
}

describe('clientes dataModel', () => {
  it('buildClienteIndex mantem cliente sem servicos como ativo', () => {
    const nowMs = makeNow();
    const clientes = [{ id: 'c1', nome: 'Alpha', endereco: 'Rua 1 - Campinas - SP' }];
    const equipamentos = [{ id: 'e1', clienteId: 'c1' }];
    const registros = [];

    const indexed = buildClienteIndex({
      clientes,
      equipamentos,
      registros,
      nowMs,
    });

    const c1 = indexed.get('c1');
    expect(c1.status).toBe('ativo');
    expect(c1.servicesCount).toBe(0);
    expect(c1.displayCity).toBe('Campinas');
  });

  it('filterAndSortClientes aplica busca, filtros e ordenacao por nome', () => {
    const clientes = [
      { id: '1', nome: 'Beta Frio', endereco: 'A' },
      { id: '2', nome: 'Alpha Clima', endereco: 'B' },
      { id: '3', nome: 'Gamma HVAC', endereco: 'C' },
    ];
    const indexed = new Map([
      [
        '1',
        {
          status: 'ativo',
          displayCity: 'Campinas',
          servicesCount: 5,
          lastServiceTs: 50,
          equipsCount: 3,
        },
      ],
      [
        '2',
        {
          status: 'sem_manutencao',
          displayCity: 'Campinas',
          servicesCount: 2,
          lastServiceTs: 10,
          equipsCount: 1,
        },
      ],
      [
        '3',
        {
          status: 'ativo',
          displayCity: 'Santos',
          servicesCount: 8,
          lastServiceTs: 80,
          equipsCount: 4,
        },
      ],
    ]);

    const result = filterAndSortClientes(clientes, indexed, {
      searchTerm: 'a',
      statusFilter: 'ativo',
      cityFilter: 'Campinas',
      sortBy: 'nome',
    });

    expect(result.map((c) => c.id)).toEqual(['1']);
  });

  it('filterAndSortClientes ordena por mais_ativos usando servicesCount desc', () => {
    const clientes = [
      { id: '1', nome: 'A' },
      { id: '2', nome: 'B' },
      { id: '3', nome: 'C' },
    ];
    const indexed = new Map([
      ['1', { servicesCount: 1 }],
      ['2', { servicesCount: 10 }],
      ['3', { servicesCount: 5 }],
    ]);

    const result = filterAndSortClientes(clientes, indexed, {
      sortBy: 'mais_ativos',
    });

    expect(result.map((c) => c.id)).toEqual(['2', '3', '1']);
  });
});
