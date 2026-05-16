import { describe, expect, it } from 'vitest';
import { buildHomeAlerts } from './homeAlerts';
import type { CompromissoServico, Equipamento, RegistroServico } from './types';

const today = '2026-05-10';

function equipment(input: Partial<Equipamento> = {}): Equipamento {
  return {
    id: input.id ?? 'eq-1',
    nome: input.nome ?? 'Camara fria',
    local: input.local ?? 'Estoque',
    status: input.status ?? 'ok',
    criticidade: input.criticidade,
    prioridadeOperacional: input.prioridadeOperacional,
  };
}

function commitment(input: Partial<CompromissoServico> = {}): CompromissoServico {
  return {
    id: input.id ?? 'comp-1',
    equipamentoId: input.equipamentoId ?? 'eq-1',
    tipo: input.tipo ?? 'preventiva',
    status: input.status ?? 'agendado',
    dataAlvo: input.dataAlvo ?? today,
    prioridade: input.prioridade,
    origem: input.origem ?? 'manual',
  };
}

function record(input: Partial<RegistroServico> = {}): RegistroServico {
  return {
    id: input.id ?? 'reg-1',
    equipamentoId: input.equipamentoId ?? 'eq-1',
    data: input.data ?? today,
    tipo: input.tipo ?? 'corretiva',
    status: input.status ?? 'warn',
    tecnico: input.tecnico ?? 'Joao',
    observacoes: input.observacoes,
  };
}

describe('buildHomeAlerts', () => {
  it('prioriza equipamento fora de operacao acima de preventiva vencida', () => {
    const alerts = buildHomeAlerts({
      today,
      equipamentos: [
        equipment({ id: 'eq-critical', status: 'danger', criticidade: 'critica' }),
        equipment({ id: 'eq-overdue' }),
      ],
      compromissos: [
        commitment({
          id: 'comp-overdue',
          equipamentoId: 'eq-overdue',
          dataAlvo: '2026-05-08',
        }),
      ],
      registros: [
        record({ equipamentoId: 'eq-critical' }),
        record({ equipamentoId: 'eq-overdue' }),
      ],
    });

    expect(alerts.map((alert) => alert.kind)).toEqual(['critical_status', 'overdue_commitment']);
    expect(alerts[0]).toMatchObject({
      equipamentoId: 'eq-critical',
      severity: 'danger',
      title: 'Equipamento fora de operacao',
    });
  });

  it('nao duplica compromisso quando equipamento ja esta fora de operacao', () => {
    const alerts = buildHomeAlerts({
      today,
      equipamentos: [equipment({ id: 'eq-critical', status: 'danger', criticidade: 'critica' })],
      compromissos: [
        commitment({
          id: 'comp-critical',
          equipamentoId: 'eq-critical',
          dataAlvo: '2026-05-08',
        }),
      ],
      registros: [record({ equipamentoId: 'eq-critical' })],
    });

    expect(alerts.map((alert) => alert.kind)).toEqual(['critical_status']);
  });

  it('gera alertas para preventiva vencida e preventiva proxima', () => {
    const alerts = buildHomeAlerts({
      today,
      equipamentos: [equipment({ id: 'eq-overdue' }), equipment({ id: 'eq-upcoming' })],
      compromissos: [
        commitment({ id: 'comp-overdue', equipamentoId: 'eq-overdue', dataAlvo: '2026-05-09' }),
        commitment({ id: 'comp-upcoming', equipamentoId: 'eq-upcoming', dataAlvo: '2026-05-13' }),
      ],
      registros: [
        record({ equipamentoId: 'eq-overdue' }),
        record({ equipamentoId: 'eq-upcoming' }),
      ],
    });

    expect(alerts.map((alert) => alert.kind)).toEqual([
      'overdue_commitment',
      'upcoming_commitment',
    ]);
    expect(alerts[0]).toMatchObject({
      compromissoId: 'comp-overdue',
      detail: 'Preventiva vencida ha 1 dia',
    });
    expect(alerts[1]).toMatchObject({
      compromissoId: 'comp-upcoming',
      detail: 'Preventiva prevista para 13/05',
    });
  });

  it('alerta equipamento critico sem historico tecnico', () => {
    const alerts = buildHomeAlerts({
      today,
      equipamentos: [
        equipment({
          id: 'eq-new',
          criticidade: 'critica',
          prioridadeOperacional: 'alta',
        }),
      ],
      compromissos: [],
      registros: [],
    });

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({
      kind: 'critical_without_history',
      equipamentoId: 'eq-new',
      severity: 'warning',
      title: 'Equipamento critico sem historico',
    });
  });

  it('alerta reincidencia corretiva por equipamento com ocorrencias recentes', () => {
    const alerts = buildHomeAlerts({
      today,
      equipamentos: [equipment()],
      compromissos: [],
      registros: [
        record({ id: 'reg-1', data: '2026-05-09', tipo: 'corretiva', status: 'warn' }),
        record({ id: 'reg-2', data: '2026-05-08', tipo: 'corretiva', status: 'danger' }),
        record({ id: 'reg-3', data: '2026-04-20', tipo: 'preventiva', status: 'ok' }),
      ],
    });

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({
      kind: 'corrective_recurrence',
      severity: 'warning',
      title: 'Equipamento exige acompanhamento',
      detail: '2 corretivas recentes',
    });
  });
});
