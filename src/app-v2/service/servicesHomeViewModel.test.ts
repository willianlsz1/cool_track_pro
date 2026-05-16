import { describe, expect, it } from 'vitest';

import type { Cliente, Equipamento, RegistroServico } from '../domain/types';
import type { ServiceDraft } from './serviceFlowViewModel';
import { buildServicesHomeViewModel, type BuildServicesHomeInput } from './servicesHomeViewModel';

const baseInput: BuildServicesHomeInput = {
  today: '2026-05-10',
  clientes: [
    {
      id: 'cliente-1',
      nome: 'Mercado Bom Preço',
      contato: '(11) 99999-0000',
      endereco: 'Rua das Palmeiras, 120',
    },
  ] satisfies Cliente[],
  equipamentos: [
    {
      id: 'eq-1',
      nome: 'Split 24.000 BTU',
      local: 'Recepção',
      status: 'warn',
      clienteId: 'cliente-1',
      tag: 'SPL-024',
      tipo: 'Ar condicionado',
    },
    {
      id: 'eq-2',
      nome: 'Câmara fria',
      local: 'Estoque',
      status: 'danger',
      clienteId: 'cliente-1',
      tag: 'CAM-001',
      tipo: 'Refrigeração',
    },
  ] satisfies Equipamento[],
  registros: [
    {
      id: 'registro-1',
      equipamentoId: 'eq-1',
      data: '2026-05-09',
      tipo: 'preventiva',
      status: 'ok',
      tecnico: 'Técnico',
      observacoes: 'Limpeza de filtros e teste de temperatura.',
      proximaData: '2026-06-09',
    },
    {
      id: 'registro-2',
      equipamentoId: 'eq-2',
      data: '2026-05-08',
      tipo: 'corretiva',
      status: 'warn',
      tecnico: 'Técnico',
      observacoes: 'Ruído no compressor e orientação ao cliente.',
    },
  ] satisfies RegistroServico[],
};

describe('servicesHomeViewModel', () => {
  it('monta estado vazio sem draft e sem registros', () => {
    expect(buildServicesHomeViewModel({ ...baseInput, registros: [] }, null)).toMatchObject({
      title: 'Serviços',
      subtitle: 'Trabalho técnico',
      emptyState: {
        title: 'Nenhum serviço em andamento',
        actionLabel: 'Iniciar registro',
      },
      inProgress: null,
      recentServices: [],
    });
  });

  it('monta serviço em andamento a partir do draft local', () => {
    const draft: ServiceDraft = {
      equipmentId: 'eq-1',
      kind: 'preventiva',
      customKind: '',
      technician: 'Tecnico',
      diagnosis: 'Filtro com acúmulo de sujeira.',
      actionsDone: '',
      finalStatus: 'ok',
    };

    expect(buildServicesHomeViewModel(baseInput, draft).inProgress).toMatchObject({
      equipmentName: 'Split 24.000 BTU',
      customerLine: 'Mercado Bom Preço - Recepção',
      kindLabel: 'Preventiva',
      progressLabel: 'Diagnóstico preenchido',
      actionLabel: 'Retomar registro',
    });
  });

  it('lista registros recentes com equipamento e cliente/local', () => {
    expect(buildServicesHomeViewModel(baseInput, null).recentServices[0]).toMatchObject({
      id: 'registro-1',
      equipmentName: 'Split 24.000 BTU',
      customerLine: 'Mercado Bom Preço - Recepção',
      kindLabel: 'Preventiva',
      technician: 'Técnico',
      dateLabel: '09/05',
      statusLabel: 'Operacional',
      summary: 'Limpeza de filtros e teste de temperatura.',
    });
  });

  it('mapeia saídas futuras mockadas por registro', () => {
    const viewModel = buildServicesHomeViewModel(baseInput, null);

    expect(viewModel.recentServices.map((item) => item.outputStatus)).toEqual([
      'proximo_compromisso_sugerido',
      'orcamento_sugerido',
    ]);
  });

  it('usa descricao customizada de Outro nos registros recentes', () => {
    const viewModel = buildServicesHomeViewModel(
      {
        ...baseInput,
        registros: [
          {
            id: 'registro-outro',
            equipamentoId: 'eq-1',
            data: '2026-05-10',
            tipo: 'outro',
            tipoDescricao: 'Outro · Higienizacao',
            status: 'ok',
            tecnico: 'Tecnico',
            observacoes: 'Higienizacao completa registrada.',
          },
        ],
      },
      null,
    );

    expect(viewModel.recentServices[0]).toMatchObject({
      id: 'registro-outro',
      kindLabel: 'Outro · Higienizacao',
      outputStatus: 'relatorio_pendente',
    });
  });
});

it('exibe pecas usadas em registro recente quando informadas', () => {
  const viewModel = buildServicesHomeViewModel(
    {
      ...baseInput,
      registros: [
        {
          id: 'registro-pecas',
          equipamentoId: 'eq-1',
          data: '2026-05-10',
          tipo: 'preventiva',
          status: 'ok',
          tecnico: 'Tecnico',
          observacoes: 'Limpeza e substituicao preventiva.',
          pecas: 'Filtro de ar, capacitor 35uF',
        },
      ],
    },
    null,
  );

  expect(viewModel.recentServices[0]).toMatchObject({
    id: 'registro-pecas',
    partsUsed: 'Filtro de ar, capacitor 35uF',
  });
});

it('exibe custos opcionais em registro recente quando informados', () => {
  const input: BuildServicesHomeInput = {
    ...baseInput,
    registros: [
      {
        id: 'registro-custos',
        equipamentoId: 'eq-1',
        data: '2026-05-10',
        tipo: 'preventiva',
        status: 'ok',
        tecnico: 'Ana Tecnica',
        observacoes: 'Limpeza preventiva.',
        custoPecas: '120,00',
        custoMaoObra: '250,00',
      },
    ],
  };

  const viewModel = buildServicesHomeViewModel(input, null);

  expect(viewModel.recentServices[0]).toMatchObject({
    id: 'registro-custos',
    partsCost: '120,00',
    laborCost: '250,00',
  });
});

it('exibe proxima manutencao em registro recente quando informada', () => {
  const input: BuildServicesHomeInput = {
    ...baseInput,
    registros: [
      {
        id: 'registro-proxima',
        equipamentoId: 'eq-1',
        data: '2026-05-10',
        tipo: 'preventiva',
        status: 'ok',
        tecnico: 'Ana Tecnica',
        observacoes: 'Limpeza preventiva.',
        proximaData: '2026-06-10',
      },
    ],
  };

  const viewModel = buildServicesHomeViewModel(input, null);

  expect(viewModel.recentServices[0]).toMatchObject({
    id: 'registro-proxima',
    nextMaintenanceLabel: '10/06',
    outputStatus: 'proximo_compromisso_sugerido',
  });
});
