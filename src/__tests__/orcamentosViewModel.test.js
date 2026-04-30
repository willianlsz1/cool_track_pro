import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  ORCAMENTO_ACTIONS,
  buildOrcamentosViewModel,
} from '../ui/viewModels/orcamentosViewModel.js';

function sampleOrcamento(overrides = {}) {
  return {
    id: 'orc-1',
    numero: 'ORC-2026-0001',
    clienteNome: 'Cliente Alpha',
    clienteTelefone: '11999990000',
    titulo: 'Instalacao split',
    total: 1250.5,
    status: 'enviado',
    createdAt: '2026-04-10T10:00:00.000Z',
    enviadoEm: '2026-04-11T10:00:00.000Z',
    validadeDias: 7,
    ...overrides,
  };
}

describe('buildOrcamentosViewModel', () => {
  it('returns the empty state and zero KPIs when there are no orcamentos', () => {
    const viewModel = buildOrcamentosViewModel({ orcamentos: [] });

    expect(viewModel.isEmpty).toBe(true);
    expect(viewModel.isFilterEmpty).toBe(false);
    expect(viewModel.cards).toEqual([]);
    expect(viewModel.kpis).toEqual({
      totalAtivos: 0,
      totalAprovados: 0,
      valorPipeline: 0,
      valorPipelineLabel: expect.stringContaining('0,00'),
    });
    expect(viewModel.emptyState).toMatchObject({
      action: ORCAMENTO_ACTIONS.openModal,
      mode: 'create',
    });
  });

  it('builds KPIs, cards, labels and action contracts preserving input order', () => {
    const viewModel = buildOrcamentosViewModel({
      orcamentos: [
        sampleOrcamento({
          id: 'orc-1',
          status: 'enviado',
          total: 1200,
          shareToken: '',
        }),
        sampleOrcamento({
          id: 'orc-2',
          numero: 'ORC-2026-0002',
          clienteNome: 'Cliente Beta',
          clienteTelefone: '',
          titulo: 'Contrato aprovado',
          total: 300,
          status: 'aprovado',
          assinadoEm: '2026-04-15T12:00:00.000Z',
          assinadoNome: 'Maria',
        }),
      ],
    });

    expect(viewModel.isEmpty).toBe(false);
    expect(viewModel.kpis.totalAtivos).toBe(1);
    expect(viewModel.kpis.totalAprovados).toBe(1);
    expect(viewModel.kpis.valorPipeline).toBe(1500);
    expect(viewModel.cards.map((card) => card.id)).toEqual(['orc-1', 'orc-2']);

    expect(viewModel.cards[0]).toMatchObject({
      id: 'orc-1',
      numero: 'ORC-2026-0001',
      title: 'Instalacao split',
      titleLabel: 'Instalacao split',
      clienteLine: 'Cliente Alpha · 11999990000',
      status: 'enviado',
      statusLabel: 'Enviado',
      validityLabel: expect.stringContaining('Vale at\u00e9'),
    });
    expect(viewModel.cards[0].totalLabel).toContain('1.200,00');
    expect(viewModel.cards[0].actions.map((action) => action.action)).toEqual([
      ORCAMENTO_ACTIONS.openModal,
      ORCAMENTO_ACTIONS.sendSignature,
      ORCAMENTO_ACTIONS.share,
      ORCAMENTO_ACTIONS.download,
      ORCAMENTO_ACTIONS.markApproved,
      ORCAMENTO_ACTIONS.delete,
    ]);

    expect(viewModel.cards[1]).toMatchObject({
      id: 'orc-2',
      status: 'aprovado',
      statusLabel: 'Aprovado',
      signed: {
        nome: 'Maria',
        dateLabel: expect.any(String),
      },
    });
    expect(viewModel.cards[1].actions.map((action) => action.action)).toEqual([
      ORCAMENTO_ACTIONS.openModal,
      ORCAMENTO_ACTIONS.download,
      ORCAMENTO_ACTIONS.delete,
    ]);
  });

  it('applies status and text filters without sorting the filtered result', () => {
    const viewModel = buildOrcamentosViewModel({
      statusFilter: 'enviado',
      busca: 'beta',
      orcamentos: [
        sampleOrcamento({ id: 'orc-1', clienteNome: 'Cliente Alpha', status: 'enviado' }),
        sampleOrcamento({
          id: 'orc-2',
          numero: 'ORC-BETA',
          clienteNome: 'Cliente Beta',
          titulo: 'Outro titulo',
          status: 'enviado',
        }),
        sampleOrcamento({ id: 'orc-3', clienteNome: 'Cliente Beta', status: 'rascunho' }),
      ],
    });

    expect(viewModel.isEmpty).toBe(false);
    expect(viewModel.isFilterEmpty).toBe(false);
    expect(viewModel.filters).toEqual({ statusFilter: 'enviado', busca: 'beta' });
    expect(viewModel.cards.map((card) => card.id)).toEqual(['orc-2']);
    expect(viewModel.statusFilters.find((item) => item.id === 'enviado')).toMatchObject({
      isActive: true,
    });
  });

  it('returns a filter-empty state when existing orcamentos do not match filters', () => {
    const viewModel = buildOrcamentosViewModel({
      statusFilter: 'recusado',
      busca: 'sem resultado',
      orcamentos: [sampleOrcamento({ id: 'orc-1', status: 'enviado' })],
    });

    expect(viewModel.isEmpty).toBe(false);
    expect(viewModel.isFilterEmpty).toBe(true);
    expect(viewModel.cards).toEqual([]);
    expect(viewModel.filterEmptyMessage).toBe('Nenhum or\u00e7amento corresponde ao filtro.');
  });

  it('handles missing and invalid data without DOM, router, storage or React dependencies', () => {
    const viewModel = buildOrcamentosViewModel({
      orcamentos: [
        null,
        sampleOrcamento({
          id: undefined,
          numero: undefined,
          clienteNome: undefined,
          clienteTelefone: undefined,
          titulo: '',
          total: 'not-a-number',
          status: 'desconhecido',
          createdAt: undefined,
          enviadoEm: 'invalid-date',
          validadeDias: undefined,
        }),
      ],
    });

    expect(viewModel.cards).toHaveLength(1);
    expect(viewModel.cards[0]).toMatchObject({
      id: '',
      numero: '',
      titleLabel: 'Sem t\u00edtulo',
      clienteLine: '',
      totalLabel: expect.stringContaining('0,00'),
      status: 'desconhecido',
      statusLabel: 'Rascunho',
      createdLabel: 'Criado —',
      validityLabel: '',
      signed: null,
    });

    const source = readFileSync('src/ui/viewModels/orcamentosViewModel.js', 'utf8');
    expect(source).not.toMatch(
      /\b(document|window|localStorage|sessionStorage|React|createRoot|innerHTML)\b/,
    );
  });
});
