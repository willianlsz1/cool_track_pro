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
});
