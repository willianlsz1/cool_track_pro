import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPmocSummaryForCliente } from '../core/pmocProgress.js';

describe('getPmocSummaryForCliente', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna inativo quando clienteId não é informado', () => {
    const summary = getPmocSummaryForCliente({ clienteId: null, year: 2026 });

    expect(summary.isActive).toBe(false);
    expect(summary.status).toBe('sem_dados');
    expect(summary.plannedCount).toBe(0);
    expect(summary.doneCount).toBe(0);
  });

  it('classifica cronograma em dia quando entrega acima do esperado', () => {
    vi.setSystemTime(new Date('2026-07-01T00:00:00.000Z'));

    const summary = getPmocSummaryForCliente({
      clienteId: 'cli-1',
      year: 2026,
      equipamentos: [{ id: 'eq-1', clienteId: 'cli-1', periodicidadePreventivaDias: 30 }],
      registros: [
        { equipId: 'eq-1', data: '2026-01-02', tipo: 'Preventiva' },
        { equipId: 'eq-1', data: '2026-02-10', tipo: 'Preventiva' },
        { equipId: 'eq-1', data: '2026-03-15', tipo: 'Preventiva' },
        { equipId: 'eq-1', data: '2026-04-10', tipo: 'Preventiva' },
        { equipId: 'eq-1', data: '2026-05-10', tipo: 'Preventiva' },
        { equipId: 'eq-1', data: '2026-06-10', tipo: 'Preventiva' },
        { equipId: 'eq-1', data: '2026-06-25', tipo: 'Preventiva' },
      ],
    });

    expect(summary.isActive).toBe(true);
    expect(summary.plannedCount).toBe(12);
    expect(summary.doneCount).toBe(7);
    expect(summary.status).toBe('em_dia');
  });

  it('mensal (30 dias) usa 12 intervenções no ano (Jan–Dez)', () => {
    const summary = getPmocSummaryForCliente({
      clienteId: 'cli-1',
      year: 2026,
      equipamentos: [{ id: 'eq-1', clienteId: 'cli-1', periodicidadePreventivaDias: 30 }],
      registros: [],
    });

    expect(summary.plannedCount).toBe(12);
  });

  it('classifica cronograma atrasado quando abaixo de 60% do esperado', () => {
    vi.setSystemTime(new Date('2026-10-01T00:00:00.000Z'));

    const summary = getPmocSummaryForCliente({
      clienteId: 'cli-2',
      year: 2026,
      equipamentos: [{ id: 'eq-2', clienteId: 'cli-2', periodicidadePreventivaDias: 90 }],
      registros: [{ equipId: 'eq-2', data: '2026-01-20', tipo: 'limpeza' }],
    });

    expect(summary.plannedCount).toBe(4);
    expect(summary.doneCount).toBe(1);
    expect(summary.status).toBe('atrasado');
    expect(summary.lastUpdateLabel).toBe('20/01/2026');
  });

  it('não conta corretiva como execução PMOC', () => {
    const summary = getPmocSummaryForCliente({
      clienteId: 'cli-3',
      year: 2026,
      equipamentos: [{ id: 'eq-3', clienteId: 'cli-3', periodicidadePreventivaDias: 30 }],
      registros: [
        { equipId: 'eq-3', data: '2026-01-10', tipo: 'Corretiva' },
        { equipId: 'eq-3', data: '2026-02-10', tipo: 'Manutenção Preventiva' },
      ],
    });

    expect(summary.doneCount).toBe(1);
  });

  it('cliente sem equipamentos vinculados permanece inativo', () => {
    const summary = getPmocSummaryForCliente({
      clienteId: 'cli-vazio',
      year: 2026,
      equipamentos: [{ id: 'eq-x', clienteId: 'cli-outro', periodicidadePreventivaDias: 30 }],
      registros: [],
    });

    expect(summary.isActive).toBe(false);
    expect(summary.activeLabel).toBe('PMOC 2026 inativo');
  });

  it('aceita vínculo legado (cliente_id/equip_id)', () => {
    const summary = getPmocSummaryForCliente({
      clienteId: 'cli-legado',
      year: 2026,
      equipamentos: [
        { id: 'eq-legado', cliente_id: 'cli-legado', periodicidadePreventivaDias: 30 },
      ],
      registros: [{ equip_id: 'eq-legado', data: '2026-03-01', tipo: 'limpeza' }],
    });

    expect(summary.isActive).toBe(true);
    expect(summary.doneCount).toBe(1);
  });

  it('expõe próxima manutenção e explicação de status', () => {
    const summary = getPmocSummaryForCliente({
      clienteId: 'cli-next',
      year: 2026,
      equipamentos: [{ id: 'eq-next', clienteId: 'cli-next', periodicidadePreventivaDias: 30 }],
      registros: [{ equipId: 'eq-next', data: '2026-01-10', tipo: 'Preventiva' }],
    });

    expect(summary.nextMaintenanceLabel).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(typeof summary.statusHelp).toBe('string');
    expect(summary.statusHelp.length).toBeGreaterThan(0);
  });
});
