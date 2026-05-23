import { describe, expect, it } from 'vitest';

import type { Cliente, CompromissoServico, Equipamento, RegistroServico } from '../domain/types';
import { buildAlertsViewModel, type BuildAlertsViewModelInput } from './alertsViewModel';

const baseInput: BuildAlertsViewModelInput = {
  today: '2026-05-17',
  clientes: [
    {
      id: 'cliente-1',
      nome: 'Mercado Bom Preco',
    },
  ] satisfies Cliente[],
  equipamentos: [
    {
      id: 'eq-1',
      nome: 'Split 24.000 BTU',
      local: 'Recepcao',
      status: 'ok',
      clienteId: 'cliente-1',
      criticidade: 'media',
    },
  ] satisfies Equipamento[],
  compromissos: [] satisfies CompromissoServico[],
  registros: [] satisfies RegistroServico[],
};

describe('alertsViewModel', () => {
  it('mostra estado vazio quando nao existem alertas operacionais', () => {
    const viewModel = buildAlertsViewModel(baseInput);

    expect(viewModel).toMatchObject({
      title: 'Alertas e Anormalidades',
      subtitle: 'Alertas operacionais',
      description: 'Acompanhe equipamentos que exigem atenção imediata ou preventiva.',
      totalAlerts: 0,
      dangerCount: 0,
      warningCount: 0,
      emptyState: {
        title: 'Tudo em dia!',
        description:
          'Nenhum equipamento precisa de atenção agora. Continue registrando serviços para manter o histórico atualizado.',
        actionLabel: 'Ver todos os equipamentos',
      },
      items: [],
    });
  });

  it('lista alertas com equipamento, cliente, detalhe e severidade', () => {
    const viewModel = buildAlertsViewModel({
      ...baseInput,
      equipamentos: [
        {
          ...baseInput.equipamentos[0],
          status: 'danger',
          criticidade: 'critica',
        },
      ],
    });

    expect(viewModel).toMatchObject({
      totalAlerts: 1,
      dangerCount: 1,
      warningCount: 0,
    });
    expect(viewModel.items[0]).toMatchObject({
      id: 'eq-1:critical-status',
      equipmentId: 'eq-1',
      title: 'Equipamento fora de operação',
      equipmentName: 'Split 24.000 BTU',
      contextLine: 'Mercado Bom Preco - Recepcao',
      detail: 'Status atual marcado como crítico',
      tone: 'danger',
      actionLabel: 'Ver equipamento',
    });
  });
});
