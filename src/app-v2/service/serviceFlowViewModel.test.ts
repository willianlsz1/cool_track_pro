import { describe, expect, it } from 'vitest';

import type { Cliente, CompromissoServico, Equipamento } from '../domain/types';
import {
  buildServiceContextViewModel,
  buildServiceDoneViewModel,
  buildServiceReviewViewModel,
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
});
