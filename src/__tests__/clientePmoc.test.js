import { describe, expect, it } from 'vitest';
import { buildClientePmocDetails } from '../core/clientePmoc.js';

describe('buildClientePmocDetails', () => {
  it('marca status geral atrasado quando existe equipamento vencido', () => {
    const details = buildClientePmocDetails({
      cliente: { id: 'c1', nome: 'Cliente A' },
      equipamentos: [{ id: 'e1', clienteId: 'c1', nome: 'Split', periodicidadePreventivaDias: 30 }],
      registros: [{ id: 'r1', equipId: 'e1', data: '2026-01-01' }],
      today: '2026-04-28',
      year: 2026,
    });

    expect(details.status).toBe('atrasado');
    expect(details.equipamentosResumo[0].status).toBe('vencido');
  });

  it('marca atenção quando equipamento não tem periodicidade definida', () => {
    const details = buildClientePmocDetails({
      cliente: { id: 'c1', nome: 'Cliente A' },
      equipamentos: [{ id: 'e1', clienteId: 'c1', nome: 'Split' }],
      registros: [{ id: 'r1', equipId: 'e1', data: '2026-04-20' }],
      today: '2026-04-28',
      year: 2026,
    });

    expect(details.status).toBe('atencao');
    expect(details.equipamentosResumo[0].periodicidadeLabel).toBe('Sem periodicidade definida');
  });

  it('marca sem cronograma quando cliente não possui equipamentos', () => {
    const details = buildClientePmocDetails({
      cliente: { id: 'c1', nome: 'Cliente A' },
      equipamentos: [],
      registros: [],
      today: '2026-04-28',
      year: 2026,
    });

    expect(details.status).toBe('sem_cronograma');
    expect(details.equipamentosResumo).toHaveLength(0);
  });

  it('retorna resumo operacional para o modal PMOC', () => {
    const details = buildClientePmocDetails({
      cliente: { id: 'c1', nome: 'Cliente A' },
      equipamentos: [{ id: 'e1', clienteId: 'c1', nome: 'Split', periodicidadePreventivaDias: 30 }],
      registros: [{ id: 'r1', equipId: 'e1', data: '2026-04-20' }],
      today: '2026-04-28',
      year: 2026,
    });

    expect(details.progresso.feitos).toBe(1);
    expect(details.proximaManutencaoLabel).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(details.equipamentosSemRegistro).toBe(0);
    expect(typeof details.statusHelp).toBe('string');
  });
});
