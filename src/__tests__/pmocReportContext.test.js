import { describe, expect, it } from 'vitest';

import { buildContextualPmocReportSummary } from '../domain/pmoc/reportContext.js';

describe('contextual PMOC report summary', () => {
  it('retorna null para servico comum sem checklist PMOC', () => {
    expect(
      buildContextualPmocReportSummary({
        registro: {
          tipo: 'Manutencao Corretiva',
          proxima: '2026-05-20',
        },
        equipamento: { periodicidadePreventivaDias: 30 },
      }),
    ).toBeNull();
  });

  it('resume preventiva/PMOC sem transformar em PMOC formal', () => {
    const summary = buildContextualPmocReportSummary({
      registro: {
        tipo: 'Checklist PMOC',
        proxima: '2026-05-20',
        checklist: {
          items: [{ status: 'ok' }, { status: 'fail' }, { status: 'na' }, { status: null }],
        },
      },
      equipamento: { periodicidadePreventivaDias: 30 },
      formatDate: (value) => `date:${value}`,
      formatDueRelative: (value) => `due:${value}`,
    });

    expect(summary).toEqual({
      visible: true,
      title: 'Resumo PMOC/preventivo',
      description: 'Resumo tecnico do atendimento preventivo. Nao substitui o PMOC formal.',
      badges: ['Contexto PMOC', 'Checklist preenchido'],
      items: [
        { label: 'Tipo', value: 'Checklist PMOC' },
        { label: 'Rotina preventiva', value: '30 dias' },
        { label: 'Proxima preventiva', value: 'date:2026-05-20 (due:2026-05-20)' },
        { label: 'Checklist', value: '1 conforme, 1 nao conforme, 1 N/A' },
      ],
    });
  });

  it('usa checklist preenchido como contexto mesmo quando tipo nao e preventiva', () => {
    const summary = buildContextualPmocReportSummary({
      registro: {
        tipo: 'Outro',
        checklist: {
          items: [{ status: 'ok' }],
        },
      },
      equipamento: null,
    });

    expect(summary?.badges).toContain('Checklist preenchido');
    expect(summary?.items).toContainEqual({ label: 'Checklist', value: '1 conforme' });
  });
});
