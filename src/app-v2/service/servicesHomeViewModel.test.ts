import { describe, expect, it } from 'vitest';

import type { Cliente, Equipamento, Orcamento, RegistroServico } from '../domain/types';
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
    {
      id: 'registro-3',
      equipamentoId: 'eq-1',
      data: '2026-04-20',
      tipo: 'visita',
      status: 'danger',
      tecnico: 'Técnico',
      observacoes: 'Visita antiga com falha recorrente.',
    },
  ] satisfies RegistroServico[],
  orcamentos: [],
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

    const viewModel = buildServicesHomeViewModel(baseInput, draft);

    expect(viewModel.inProgress).toMatchObject({
      equipmentName: 'Split 24.000 BTU',
      customerLine: 'Mercado Bom Preço - Recepção',
      kindLabel: 'Preventiva',
      progressLabel: 'Diagnóstico preenchido',
      actionLabel: 'Retomar registro',
    });
    expect(viewModel.dominantCta).toMatchObject({
      kind: 'resume_service',
      label: 'Retomar registro',
      targetView: 'registros',
    });
  });

  it('prioriza revisar orcamento em aberto quando nao ha registro em andamento', () => {
    const openQuote: Orcamento = {
      id: 'orcamento-1',
      numero: 'ORC-2026-001',
      status: 'rascunho',
      clienteId: 'cliente-1',
      equipamentoId: 'eq-2',
      titulo: 'Troca de controlador',
      total: 1250,
    };

    expect(
      buildServicesHomeViewModel({ ...baseInput, orcamentos: [openQuote] }, null).dominantCta,
    ).toMatchObject({
      kind: 'review_quote',
      label: 'Revisar orçamento em aberto',
      targetView: 'orcamentos',
      detail: 'ORC-2026-001 - Troca de controlador',
    });
  });

  it('sugere relatorio recente quando nao ha rascunho de orcamento', () => {
    expect(buildServicesHomeViewModel(baseInput, null).dominantCta).toMatchObject({
      kind: 'view_recent_report',
      label: 'Ver relatório recente',
      targetView: 'relatorios',
      detail: 'Preventiva - Split 24.000 BTU',
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
      'orcamento_sugerido',
    ]);
  });

  it('filtra registros por equipamento, cliente, tecnico e texto', () => {
    expect(
      buildServicesHomeViewModel(baseInput, null, { query: 'camara' }).recentServices,
    ).toHaveLength(1);
    expect(
      buildServicesHomeViewModel(baseInput, null, { query: 'ruido' }).recentServices[0]?.id,
    ).toBe('registro-2');
    expect(
      buildServicesHomeViewModel(baseInput, null, { query: 'mercado' }).recentServices,
    ).toHaveLength(3);
    expect(
      buildServicesHomeViewModel(baseInput, null, { query: 'tecnico' }).recentServices,
    ).toHaveLength(3);
    expect(
      buildServicesHomeViewModel(baseInput, null, { query: 'sem resultado' }).recentServices,
    ).toEqual([]);
  });

  it('filtra registros por periodo, cliente, equipamento, tipo e status', () => {
    expect(
      buildServicesHomeViewModel(baseInput, null, { period: 'last_7_days' }).recentServices.map(
        (item) => item.id,
      ),
    ).toEqual(['registro-1', 'registro-2']);
    expect(
      buildServicesHomeViewModel(baseInput, null, { clientId: 'cliente-1' }).recentServices,
    ).toHaveLength(3);
    expect(
      buildServicesHomeViewModel(baseInput, null, { equipmentId: 'eq-2' }).recentServices.map(
        (item) => item.id,
      ),
    ).toEqual(['registro-2']);
    expect(
      buildServicesHomeViewModel(baseInput, null, { kind: 'visita' }).recentServices.map(
        (item) => item.id,
      ),
    ).toEqual(['registro-3']);
    expect(
      buildServicesHomeViewModel(baseInput, null, { status: 'warn' }).recentServices.map(
        (item) => item.id,
      ),
    ).toEqual(['registro-2']);
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
