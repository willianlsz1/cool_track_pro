import { describe, expect, it } from 'vitest';

import type { Cliente, CompromissoServico, Equipamento, RegistroServico } from '../domain/types';
import {
  buildServiceContextViewModel,
  buildServiceDoneViewModel,
  buildServiceReviewViewModel,
  buildServiceTypeViewModel,
  createServiceDraftFromRecord,
  createServiceDraft,
  type BuildServiceFlowInput,
  type ServiceDraft,
} from './serviceFlowViewModel';

const input: BuildServiceFlowInput = {
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
  ] satisfies Equipamento[],
  compromissos: [
    {
      id: 'compromisso-1',
      equipamentoId: 'eq-1',
      tipo: 'preventiva',
      status: 'agendado',
      dataAlvo: '2026-05-08',
      origem: 'periodicidade',
    },
  ] satisfies CompromissoServico[],
};

describe('serviceFlowViewModel', () => {
  it('monta o contexto do registro a partir do equipamento', () => {
    const draft = createServiceDraft(input, 'eq-1', 'compromisso-1');

    expect(buildServiceContextViewModel(input, draft)).toMatchObject({
      title: 'Registrar serviço',
      equipmentName: 'Split 24.000 BTU',
      customerLine: 'Mercado Bom Preço - Recepção',
      equipmentLine: 'Ar condicionado - SPL-024',
      reason: 'Preventiva vencida desde 08/05',
      statusLabel: 'Atenção',
    });
  });

  it('pré-seleciona o tipo quando existe compromisso preventiva ou corretiva', () => {
    expect(createServiceDraft(input, 'eq-1', 'compromisso-1')).toMatchObject({
      equipmentId: 'eq-1',
      commitmentId: 'compromisso-1',
      kind: 'preventiva',
      customKind: '',
      technician: '',
      diagnosis: '',
      actionsDone: '',
      finalStatus: 'ok',
    });
  });

  it('monta o resumo final com diagnóstico, ações e status', () => {
    const draft: ServiceDraft = {
      equipmentId: 'eq-1',
      commitmentId: 'compromisso-1',
      kind: 'preventiva',
      customKind: '',
      technician: 'Ana Tecnica',
      diagnosis: 'Filtro com acúmulo de sujeira.',
      actionsDone: 'Limpeza de filtros e teste de temperatura.',
      finalStatus: 'warn',
    };

    expect(buildServiceReviewViewModel(input, draft)).toMatchObject({
      title: 'Revisar serviço',
      kindLabel: 'Preventiva',
      technician: 'Ana Tecnica',
      diagnosis: 'Filtro com acúmulo de sujeira.',
      actionsDone: 'Limpeza de filtros e teste de temperatura.',
      finalStatusLabel: 'Atenção',
    });
  });

  it('monta a conclusão sem executar saídas futuras', () => {
    const draft: ServiceDraft = {
      equipmentId: 'eq-1',
      kind: 'corretiva',
      customKind: '',
      technician: 'Bruno Tecnico',
      diagnosis: 'Compressor com ruído acima do normal.',
      actionsDone: 'Ajuste de fixação e orientação ao cliente.',
      finalStatus: 'ok',
    };

    expect(buildServiceDoneViewModel(input, draft)).toMatchObject({
      title: 'Serviço concluído',
      summary: 'Corretiva registrada para Split 24.000 BTU.',
      technicalSummary: expect.arrayContaining(['Tecnico: Bruno Tecnico']),
      disabledOutputs: ['Orçamento', 'Próximo compromisso'],
    });
  });

  it('exige descricao curta quando o tipo selecionado e Outro', () => {
    const emptyCustomDraft: ServiceDraft = {
      equipmentId: 'eq-1',
      kind: 'outro',
      customKind: '',
      technician: '',
      diagnosis: '',
      actionsDone: '',
      finalStatus: 'ok',
    };
    const validCustomDraft = {
      ...emptyCustomDraft,
      customKind: 'Higienizacao',
    };
    const longCustomDraft = {
      ...emptyCustomDraft,
      customKind: 'x'.repeat(41),
    };

    expect(buildServiceTypeViewModel(emptyCustomDraft)).toMatchObject({
      selectedKind: 'outro',
      customKind: '',
      customKindMaxLength: 40,
      canContinue: false,
    });
    expect(buildServiceTypeViewModel(longCustomDraft)).toMatchObject({
      canContinue: false,
    });
    expect(buildServiceTypeViewModel(validCustomDraft)).toMatchObject({
      selectedKind: 'outro',
      customKind: 'Higienizacao',
      canContinue: true,
    });
    expect(buildServiceReviewViewModel(input, validCustomDraft)).toMatchObject({
      kindLabel: 'Outro · Higienizacao',
    });
    expect(buildServiceDoneViewModel(input, validCustomDraft).summary).toBe(
      'Outro · Higienizacao registrada para Split 24.000 BTU.',
    );
  });
});

it('reidrata draft de edicao a partir de registro existente com campos migrados', () => {
  const registro: RegistroServico = {
    id: 'registro-editado',
    equipamentoId: 'eq-1',
    data: '2026-05-11',
    tipo: 'outro',
    tipoDescricao: 'Outro Â· Higienizacao',
    status: 'warn',
    tecnico: 'Ana Tecnica',
    diagnostico: 'Serpentina com sujeira acumulada.',
    acoesExecutadas: 'Limpeza preventiva e teste operacional.',
    observacoes: 'Serpentina com sujeira acumulada. Limpeza preventiva e teste operacional.',
    pecas: 'Filtro de ar',
    custoPecas: '120,00',
    custoMaoObra: '250,00',
    proximaData: '2026-06-10',
  };

  expect(createServiceDraftFromRecord(registro)).toMatchObject({
    equipmentId: 'eq-1',
    kind: 'outro',
    customKind: 'Higienizacao',
    technician: 'Ana Tecnica',
    diagnosis: 'Serpentina com sujeira acumulada.',
    actionsDone: 'Limpeza preventiva e teste operacional.',
    partsUsed: 'Filtro de ar',
    partsCost: '120,00',
    laborCost: '250,00',
    nextMaintenanceDate: '2026-06-10',
    finalStatus: 'warn',
  });
});

it('reidrata draft de registro antigo usando observacoes como fallback', () => {
  const registro: RegistroServico = {
    id: 'registro-legado',
    equipamentoId: 'eq-1',
    data: '2026-05-11',
    tipo: 'preventiva',
    status: 'ok',
    tecnico: 'Tecnico',
    observacoes: 'Limpeza de filtros e teste de temperatura.',
  };

  expect(createServiceDraftFromRecord(registro)).toMatchObject({
    equipmentId: 'eq-1',
    kind: 'preventiva',
    customKind: '',
    technician: 'Tecnico',
    diagnosis: 'Limpeza de filtros e teste de temperatura.',
    actionsDone: 'Limpeza de filtros e teste de temperatura.',
    finalStatus: 'ok',
  });
});

it('mantem pecas usadas como campo opcional no resumo tecnico', () => {
  const draft: ServiceDraft = {
    equipmentId: 'eq-1',
    kind: 'preventiva',
    customKind: '',
    technician: 'Ana Tecnica',
    diagnosis: 'Filtro saturado.',
    actionsDone: 'Limpeza e substituicao preventiva.',
    partsUsed: 'Filtro de ar, capacitor 35uF',
    finalStatus: 'ok',
  };

  expect(buildServiceReviewViewModel(input, draft)).toMatchObject({
    partsUsed: 'Filtro de ar, capacitor 35uF',
  });
  expect(buildServiceDoneViewModel(input, draft).technicalSummary).toEqual(
    expect.arrayContaining(['Pecas usadas: Filtro de ar, capacitor 35uF']),
  );
  expect(buildServiceReviewViewModel(input, { ...draft, partsUsed: '' })).toMatchObject({
    partsUsed: 'Sem pecas informadas',
  });
});

it('mantem custos opcionais no resumo tecnico sem exigir orcamento', () => {
  const draft: ServiceDraft = {
    equipmentId: 'eq-1',
    kind: 'preventiva',
    customKind: '',
    technician: 'Ana Tecnica',
    diagnosis: 'Filtro saturado.',
    actionsDone: 'Limpeza e substituicao preventiva.',
    partsUsed: 'Filtro de ar',
    partsCost: '120,00',
    laborCost: '250,00',
    finalStatus: 'ok',
  };

  expect(buildServiceReviewViewModel(input, draft)).toMatchObject({
    partsCost: '120,00',
    laborCost: '250,00',
  });
  expect(buildServiceDoneViewModel(input, draft).technicalSummary).toEqual(
    expect.arrayContaining(['Custo de pecas: 120,00', 'Custo de mao de obra: 250,00']),
  );
  expect(
    buildServiceReviewViewModel(input, { ...draft, partsCost: '', laborCost: '' }),
  ).toMatchObject({
    partsCost: 'Nao informado',
    laborCost: 'Nao informado',
  });
});

it('mantem proxima manutencao como campo opcional no resumo tecnico', () => {
  const draft: ServiceDraft = {
    equipmentId: 'eq-1',
    kind: 'preventiva',
    customKind: '',
    technician: 'Ana Tecnica',
    diagnosis: 'Filtro saturado.',
    actionsDone: 'Limpeza e substituicao preventiva.',
    nextMaintenanceDate: '2026-06-10',
    finalStatus: 'ok',
  };

  expect(buildServiceReviewViewModel(input, draft)).toMatchObject({
    nextMaintenanceLabel: '10/06/2026',
  });
  expect(buildServiceDoneViewModel(input, draft).technicalSummary).toEqual(
    expect.arrayContaining(['Proxima manutencao: 10/06/2026']),
  );
  expect(buildServiceReviewViewModel(input, { ...draft, nextMaintenanceDate: '' })).toMatchObject({
    nextMaintenanceLabel: 'Nao informada',
  });
});
