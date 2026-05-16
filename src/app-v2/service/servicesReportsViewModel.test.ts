import { describe, expect, it } from 'vitest';

import type { BuildServicesHomeInput } from './servicesHomeViewModel';
import { buildServicesReportsViewModel } from './servicesReportsViewModel';

const input: BuildServicesHomeInput = {
  today: '2026-05-10',
  clientes: [
    {
      id: 'cliente-1',
      nome: 'Mercado Bom Preco',
      contato: '(11) 99999-0000',
    },
    {
      id: 'cliente-2',
      nome: 'Industria Frio Sul',
    },
  ],
  equipamentos: [
    {
      id: 'eq-1',
      nome: 'Split 24.000 BTU',
      local: 'Recepcao',
      status: 'ok',
      clienteId: 'cliente-1',
      tipo: 'Ar condicionado',
    },
    {
      id: 'eq-2',
      nome: 'Camara fria',
      local: 'Estoque',
      status: 'warn',
      clienteId: 'cliente-1',
      tipo: 'Refrigeracao',
    },
    {
      id: 'eq-3',
      nome: 'Central de refrigeracao',
      local: 'Producao',
      status: 'danger',
      clienteId: 'cliente-2',
      tipo: 'Refrigeracao',
    },
  ],
  registros: [
    {
      id: 'registro-1',
      equipamentoId: 'eq-1',
      data: '2026-05-09',
      tipo: 'preventiva',
      status: 'ok',
      tecnico: 'Tecnico',
      observacoes: 'Limpeza preventiva concluida.',
    },
    {
      id: 'registro-2',
      equipamentoId: 'eq-2',
      data: '2026-05-08',
      tipo: 'corretiva',
      status: 'warn',
      tecnico: 'Tecnico',
      observacoes: 'Ruido no compressor.',
    },
    {
      id: 'registro-3',
      equipamentoId: 'eq-3',
      data: '2026-04-30',
      tipo: 'visita',
      status: 'ok',
      tecnico: 'Tecnico',
      observacoes: '',
    },
  ],
};

describe('servicesReportsViewModel', () => {
  it('deriva relatorios a partir dos registros concluidos com dados relacionados', () => {
    const viewModel = buildServicesReportsViewModel(input);

    expect(viewModel.title).toBe('Relatorios');
    expect(viewModel.items).toHaveLength(3);
    expect(viewModel.items[0]).toMatchObject({
      id: 'registro-1',
      reportId: 'REL-REGISTRO-1',
      customerName: 'Mercado Bom Preco',
      equipmentName: 'Split 24.000 BTU',
      kindLabel: 'Preventiva',
      dateLabel: '09/05/2026',
      statusLabel: 'Pronto',
      statusTone: 'success',
    });
  });

  it('calcula KPIs locais de prontos, atencao, pendentes e este mes', () => {
    expect(buildServicesReportsViewModel(input).kpis).toEqual([
      { label: 'Relatorios prontos', value: 1, tone: 'success' },
      { label: 'Com atencao', value: 1, tone: 'warning' },
      { label: 'Pendentes', value: 1, tone: 'muted' },
      { label: 'Este mes', value: 2, tone: 'primary' },
    ]);
  });

  it('aplica busca local por id, cliente, equipamento e tipo de servico', () => {
    expect(buildServicesReportsViewModel(input, 'registro-2').items.map((item) => item.id)).toEqual(
      ['registro-2'],
    );
    expect(buildServicesReportsViewModel(input, 'frio sul').items.map((item) => item.id)).toEqual([
      'registro-3',
    ]);
    expect(buildServicesReportsViewModel(input, 'split').items.map((item) => item.id)).toEqual([
      'registro-1',
    ]);
    expect(buildServicesReportsViewModel(input, 'corretiva').items.map((item) => item.id)).toEqual([
      'registro-2',
    ]);
  });

  it('aplica fallback para dados ausentes sem criar blocos regulatorios', () => {
    const viewModel = buildServicesReportsViewModel({
      ...input,
      registros: [
        {
          id: 'registro-sem-equipamento',
          equipamentoId: 'eq-inexistente',
          data: '2026-05-10',
          tipo: 'outro',
          status: 'ok',
          tecnico: 'Tecnico',
        },
      ],
    });

    expect(viewModel.items[0]).toMatchObject({
      customerName: 'Sem cliente vinculado',
      equipmentName: 'Equipamento nao encontrado',
      statusLabel: 'Pendente de revisao',
    });
    expect(JSON.stringify(viewModel)).not.toContain(['P', 'MOC'].join(''));
    expect(JSON.stringify(viewModel)).not.toContain(['share', 'Report'].join(''));
  });
});
