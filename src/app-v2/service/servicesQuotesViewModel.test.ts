import { describe, expect, it } from 'vitest';

import type { Cliente, Equipamento, Orcamento } from '../domain/types';
import {
  buildServicesQuotesViewModel,
  type BuildServicesQuotesInput,
} from './servicesQuotesViewModel';

const baseInput: BuildServicesQuotesInput = {
  clientes: [
    {
      id: 'cliente-1',
      nome: 'Mercado Bom Preco',
      contato: '(11) 99999-0000',
      endereco: 'Rua das Palmeiras, 120',
    },
  ] satisfies Cliente[],
  equipamentos: [
    {
      id: 'eq-1',
      nome: 'Split 24.000 BTU',
      local: 'Recepcao',
      status: 'warn',
      clienteId: 'cliente-1',
      tag: 'SPL-024',
      tipo: 'Ar condicionado',
    },
  ] satisfies Equipamento[],
  orcamentos: [
    {
      id: 'orc-1',
      numero: 'ORC-2026-001',
      status: 'rascunho',
      clienteId: 'cliente-1',
      equipamentoId: 'eq-1',
      registroId: 'registro-2',
      titulo: 'Troca de controlador',
      total: 1250,
      itens: [
        {
          id: 'item-1',
          descricao: 'Controlador digital',
          quantidade: 1,
          valorUnitario: 980,
          total: 980,
        },
        {
          id: 'item-2',
          descricao: 'Mao de obra',
          quantidade: 2,
          valorUnitario: 135,
          total: 270,
        },
      ],
    },
    {
      id: 'orc-2',
      numero: 'ORC-2026-002',
      status: 'aprovado',
      clienteId: 'cliente-1',
      titulo: 'Substituicao de sensor',
      total: 480,
    },
  ] satisfies Orcamento[],
};

describe('servicesQuotesViewModel', () => {
  it('lista orcamentos locais com cliente, equipamento, status e total', () => {
    const viewModel = buildServicesQuotesViewModel(baseInput);

    expect(viewModel).toMatchObject({
      title: 'Orçamentos',
      subtitle: 'Orçamentos locais',
      totalItems: 2,
      kpis: [
        { label: 'Ativos', value: 1 },
        { label: 'Aprovados', value: 1 },
        { label: 'Valor em aberto', valueLabel: 'R$ 1.250,00' },
      ],
    });
    expect(viewModel.items[0]).toMatchObject({
      id: 'orc-1',
      number: 'ORC-2026-001',
      title: 'Troca de controlador',
      customerLine: 'Mercado Bom Preco',
      equipmentLine: 'Split 24.000 BTU - Recepcao',
      statusLabel: 'Rascunho',
      totalLabel: 'R$ 1.250,00',
      itemsLabel: '2 itens locais',
    });
    expect(viewModel.items[1]).toMatchObject({
      id: 'orc-2',
      equipmentLine: 'Sem equipamento vinculado',
      statusLabel: 'Aprovado',
      totalLabel: 'R$ 480,00',
    });
  });

  it('mantem estado vazio funcional sem prometer PDF ou WhatsApp real', () => {
    const viewModel = buildServicesQuotesViewModel({
      ...baseInput,
      orcamentos: [],
    });

    expect(viewModel.items).toEqual([]);
    expect(viewModel.emptyState).toEqual({
      title: 'Nenhum orçamento local',
      description: 'Orçamentos locais aparecerão aqui quando houver um rascunho cadastrado.',
    });
  });
});
