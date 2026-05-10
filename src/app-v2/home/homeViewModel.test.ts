import { describe, expect, it } from 'vitest';

import { buildHomeTodayViewModel } from './homeViewModel';
import type { Cliente, CompromissoServico, Equipamento, RegistroServico } from '../domain/types';

const cliente: Cliente = {
  id: 'cliente-1',
  nome: 'Mercado Bom Preço',
  endereco: 'Setor frios',
};

const split: Equipamento = {
  id: 'eq-1',
  nome: 'Split 24.000 BTU',
  local: 'Recepção',
  status: 'warn',
  clienteId: cliente.id,
  tipo: 'Ar condicionado',
};

const camara: Equipamento = {
  id: 'eq-2',
  nome: 'Câmara fria',
  local: 'Estoque',
  status: 'danger',
  clienteId: cliente.id,
  tipo: 'Refrigeração',
};

const registroSplit: RegistroServico = {
  id: 'registro-1',
  equipamentoId: split.id,
  data: '2026-05-07',
  tipo: 'preventiva',
  status: 'ok',
  tecnico: 'Técnico',
};

describe('buildHomeTodayViewModel', () => {
  it('destaca preventiva vencida como próxima ação operacional', () => {
    const compromissos: CompromissoServico[] = [
      {
        id: 'compromisso-1',
        equipamentoId: split.id,
        tipo: 'preventiva',
        status: 'agendado',
        dataAlvo: '2026-05-08',
        origem: 'periodicidade',
      },
      {
        id: 'compromisso-2',
        equipamentoId: camara.id,
        tipo: 'corretiva',
        status: 'agendado',
        dataAlvo: '2026-05-10',
        origem: 'manual',
      },
    ];

    const viewModel = buildHomeTodayViewModel({
      today: '2026-05-10',
      clientes: [cliente],
      equipamentos: [split, camara],
      compromissos,
      registros: [registroSplit],
    });

    expect(viewModel.nextAction.title).toBe('Preventiva vencida');
    expect(viewModel.nextAction.equipmentId).toBe('eq-1');
    expect(viewModel.nextAction.equipmentName).toBe('Split 24.000 BTU');
    expect(viewModel.nextAction.customerLine).toBe('Mercado Bom Preço - Recepção');
    expect(viewModel.nextAction.reason).toBe('Preventiva vencida há 2 dias');
    expect(viewModel.nextAction.primaryCta).toBe('Iniciar serviço');
    expect(viewModel.nextAction.secondaryAction).toBe('Ver equipamento');
    expect(viewModel.nextAction.tone).toBe('danger');
    expect(viewModel.queue).toHaveLength(2);
    expect(viewModel.queue[0]?.equipmentId).toBe('eq-1');
  });

  it('mostra estado sem urgências quando todos os equipamentos já têm serviço', () => {
    const viewModel = buildHomeTodayViewModel({
      today: '2026-05-10',
      clientes: [cliente],
      equipamentos: [split],
      compromissos: [],
      registros: [registroSplit],
    });

    expect(viewModel.nextAction.title).toBe('Sem urgências agora');
    expect(viewModel.nextAction.reason).toBe('Nenhuma preventiva ou corretiva vencida para hoje');
    expect(viewModel.nextAction.primaryCta).toBe('Buscar equipamento');
    expect(viewModel.nextAction.secondaryAction).toBe('Ver fila');
    expect(viewModel.nextAction.tone).toBe('calm');
    expect(viewModel.queue).toEqual([]);
  });
});
