import { describe, expect, it } from 'vitest';
import { pickNextHomeAction } from './homePriority';
import type { CompromissoServico, Equipamento, RegistroServico } from './types';

const today = '2026-05-10';

const equipamento: Equipamento = {
  id: 'eq-1',
  nome: 'Split sala tecnica',
  local: 'Sala tecnica',
  status: 'ok',
};

describe('pickNextHomeAction', () => {
  it('prioriza compromisso vencido antes de equipamento novo sem serviço', () => {
    const compromissos: CompromissoServico[] = [
      {
        id: 'comp-1',
        equipamentoId: 'eq-1',
        tipo: 'preventiva',
        status: 'agendado',
        dataAlvo: '2026-05-09',
        origem: 'manual',
      },
    ];

    const result = pickNextHomeAction({
      today,
      equipamentos: [equipamento],
      compromissos,
      registros: [],
    });

    expect(result).toEqual({
      kind: 'compromisso_vencido',
      equipamentoId: 'eq-1',
      compromissoId: 'comp-1',
      cta: 'Iniciar serviço',
    });
  });

  it('sugere primeiro serviço para equipamento sem histórico quando não há compromisso urgente', () => {
    const registros: RegistroServico[] = [];

    const result = pickNextHomeAction({
      today,
      equipamentos: [equipamento],
      compromissos: [],
      registros,
    });

    expect(result).toEqual({
      kind: 'equipamento_sem_primeiro_servico',
      equipamentoId: 'eq-1',
      cta: 'Registrar primeiro serviço',
    });
  });
});
