import { describe, expect, it } from 'vitest';

import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import { createServiceDraft } from './serviceFlowViewModel';
import {
  buildServiceReportViewModel,
  buildServiceReportViewModelFromRecord,
} from './serviceReportViewModel';

describe('serviceReportViewModel', () => {
  const forbiddenRegulatoryTerm = ['P', 'MOC'].join('');

  it('monta relatorio simples com cliente, equipamento e resumo do servico', () => {
    const input = createAppV2MockSnapshot();
    const draft = {
      ...createServiceDraft(input, 'eq-1', 'compromisso-1'),
      technician: 'Ana Tecnica',
      customKind: '',
      diagnosis: 'Filtro saturado e serpentina com sujeira.',
      actionsDone: 'Limpeza preventiva e teste operacional.',
      finalStatus: 'ok' as const,
    };

    const report = buildServiceReportViewModel(input, draft);
    const flatFields = report.sections.flatMap((section) => section.fields);

    expect(report.reportId).toBe('CTP-20260510-COMPROMISSO-1');
    expect(report.title).toBe('Registro de Servico Tecnico');
    expect(report.subtitle).toContain('Preventiva');
    expect(report.subtitle).toContain('Split 24.000 BTU');
    expect(report.generatedAtLabel).toBe('10/05/2026');
    expect(report.statusLabel).toBe('Operacional');
    expect(report.statusTone).toBe('success');
    expect(report.sections.map((section) => section.title)).toEqual([
      'Cabecalho',
      'Cliente',
      'Equipamento',
      'Servico',
      'Execucao',
    ]);
    expect(report.signatureFields).toEqual(['Tecnico/responsavel', 'Cliente/responsavel']);
    expect(flatFields).toEqual(
      expect.arrayContaining([
        { label: 'Cliente', value: 'Mercado Bom Preço' },
        { label: 'Equipamento', value: 'Split 24.000 BTU' },
        { label: 'Tipo de servico', value: 'Preventiva' },
        { label: 'Tecnico/responsavel', value: 'Ana Tecnica' },
        { label: 'Diagnostico', value: 'Filtro saturado e serpentina com sujeira.' },
        { label: 'Acoes executadas', value: 'Limpeza preventiva e teste operacional.' },
      ]),
    );
  });

  it('mantem fallback seguro quando textos de execucao ainda estao vazios', () => {
    const input = createAppV2MockSnapshot();
    const draft = createServiceDraft(input, 'eq-1', 'compromisso-1');

    const report = buildServiceReportViewModel(input, draft);
    const flatFields = report.sections.flatMap((section) => section.fields);

    expect(flatFields).toEqual(
      expect.arrayContaining([
        { label: 'Diagnostico', value: 'Nao informado' },
        { label: 'Acoes executadas', value: 'Nao informado' },
      ]),
    );
  });

  it('mantem o modelo simples sem blocos regulatorios', () => {
    const input = createAppV2MockSnapshot();
    const draft = createServiceDraft(input, 'eq-1', 'compromisso-1');

    const report = buildServiceReportViewModel(input, draft);
    const serializedReport = JSON.stringify(report);

    expect(report.sections.some((section) => section.title.includes(forbiddenRegulatoryTerm))).toBe(
      false,
    );
    expect(serializedReport).not.toContain(forbiddenRegulatoryTerm);
    expect(serializedReport).not.toContain(forbiddenRegulatoryTerm.toLowerCase());
    expect(serializedReport).not.toContain('HVAC');
    expect(serializedReport).not.toContain('mensal');
  });

  it('reabre relatorio a partir de registro concluido', () => {
    const input = createAppV2MockSnapshot();
    const report = buildServiceReportViewModelFromRecord(input, input.registros[0]);
    const flatFields = report.sections.flatMap((section) => section.fields);

    expect(report.reportId).toBe('REL-REGISTRO-1');
    expect(report.subtitle).toContain('Preventiva');
    expect(report.subtitle).toContain('Split 24.000 BTU');
    expect(report.generatedAtLabel).toBe('07/05/2026');
    expect(flatFields).toEqual(
      expect.arrayContaining([
        { label: 'Cliente', value: 'Mercado Bom Preço' },
        { label: 'Equipamento', value: 'Split 24.000 BTU' },
        { label: 'Tipo de servico', value: 'Preventiva' },
        { label: 'Tecnico/responsavel', value: 'Técnico' },
        { label: 'Acoes executadas', value: 'Limpeza de filtros e teste de temperatura.' },
      ]),
    );
  });

  it('reabre relatorio usando diagnostico e acoes separados quando o registro possui esses campos', () => {
    const input = createAppV2MockSnapshot();
    const report = buildServiceReportViewModelFromRecord(input, {
      id: 'registro-execucao-separada',
      equipamentoId: 'eq-1',
      data: input.today,
      tipo: 'preventiva',
      status: 'ok',
      tecnico: 'Ana Tecnica',
      diagnostico: 'Serpentina com sujeira acumulada.',
      acoesExecutadas: 'Limpeza preventiva e teste operacional.',
      observacoes: 'Serpentina com sujeira acumulada. Limpeza preventiva e teste operacional.',
    });
    const flatFields = report.sections.flatMap((section) => section.fields);

    expect(flatFields).toEqual(
      expect.arrayContaining([
        { label: 'Diagnostico', value: 'Serpentina com sujeira acumulada.' },
        { label: 'Acoes executadas', value: 'Limpeza preventiva e teste operacional.' },
        {
          label: 'Observacoes',
          value: 'Serpentina com sujeira acumulada. Limpeza preventiva e teste operacional.',
        },
      ]),
    );
  });

  it('preserva descricao customizada de Outro no relatorio imediato e reaberto', () => {
    const input = createAppV2MockSnapshot();
    const draft = {
      ...createServiceDraft(input, 'eq-1'),
      kind: 'outro' as const,
      customKind: 'Higienizacao',
      technician: 'Ana Tecnica',
      diagnosis: 'Atendimento fora das categorias principais.',
      actionsDone: 'Higienizacao completa registrada.',
      finalStatus: 'ok' as const,
    };

    const immediateReport = buildServiceReportViewModel(input, draft);
    const immediateFields = immediateReport.sections.flatMap((section) => section.fields);

    expect(immediateReport.subtitle).toContain('Outro · Higienizacao');
    expect(immediateFields).toEqual(
      expect.arrayContaining([{ label: 'Tipo de servico', value: 'Outro · Higienizacao' }]),
    );

    const reopenedReport = buildServiceReportViewModelFromRecord(input, {
      id: 'registro-outro',
      equipamentoId: 'eq-1',
      data: input.today,
      tipo: 'outro',
      tipoDescricao: 'Outro · Higienizacao',
      status: 'ok',
      tecnico: 'Ana Tecnica',
      observacoes: 'Higienizacao completa registrada.',
    });
    const reopenedFields = reopenedReport.sections.flatMap((section) => section.fields);

    expect(reopenedReport.subtitle).toContain('Outro · Higienizacao');
    expect(reopenedFields).toEqual(
      expect.arrayContaining([{ label: 'Tipo de servico', value: 'Outro · Higienizacao' }]),
    );
  });
});

it('exibe pecas usadas no relatorio imediato e reaberto', () => {
  const input = createAppV2MockSnapshot();
  const draft = {
    ...createServiceDraft(input, 'eq-1', 'compromisso-1'),
    technician: 'Ana Tecnica',
    diagnosis: 'Filtro saturado.',
    actionsDone: 'Limpeza e substituicao preventiva.',
    partsUsed: 'Filtro de ar, capacitor 35uF',
    finalStatus: 'ok' as const,
  };

  const immediateFields = buildServiceReportViewModel(input, draft).sections.flatMap(
    (section) => section.fields,
  );

  expect(immediateFields).toEqual(
    expect.arrayContaining([{ label: 'Pecas usadas', value: 'Filtro de ar, capacitor 35uF' }]),
  );

  const reopenedFields = buildServiceReportViewModelFromRecord(input, {
    id: 'registro-pecas',
    equipamentoId: 'eq-1',
    data: input.today,
    tipo: 'preventiva',
    status: 'ok',
    tecnico: 'Ana Tecnica',
    observacoes: 'Limpeza e substituicao preventiva.',
    pecas: 'Filtro de ar, capacitor 35uF',
  }).sections.flatMap((section) => section.fields);

  expect(reopenedFields).toEqual(
    expect.arrayContaining([{ label: 'Pecas usadas', value: 'Filtro de ar, capacitor 35uF' }]),
  );
});

it('exibe custos opcionais no relatorio imediato e reaberto', () => {
  const input = createAppV2MockSnapshot();
  const draft = {
    ...createServiceDraft(input, 'eq-1', 'compromisso-1'),
    technician: 'Ana Tecnica',
    diagnosis: 'Filtro saturado.',
    actionsDone: 'Limpeza e substituicao preventiva.',
    partsCost: '120,00',
    laborCost: '250,00',
    finalStatus: 'ok' as const,
  };

  const immediateFields = buildServiceReportViewModel(input, draft).sections.flatMap(
    (section) => section.fields,
  );

  expect(immediateFields).toEqual(
    expect.arrayContaining([
      { label: 'Custo de pecas', value: '120,00' },
      { label: 'Custo de mao de obra', value: '250,00' },
    ]),
  );

  const reopenedFields = buildServiceReportViewModelFromRecord(input, {
    id: 'registro-custos',
    equipamentoId: 'eq-1',
    data: input.today,
    tipo: 'preventiva',
    status: 'ok',
    tecnico: 'Ana Tecnica',
    observacoes: 'Limpeza e substituicao preventiva.',
    custoPecas: '120,00',
    custoMaoObra: '250,00',
  }).sections.flatMap((section) => section.fields);

  expect(reopenedFields).toEqual(
    expect.arrayContaining([
      { label: 'Custo de pecas', value: '120,00' },
      { label: 'Custo de mao de obra', value: '250,00' },
    ]),
  );
});

it('exibe proxima manutencao no relatorio imediato e reaberto', () => {
  const input = createAppV2MockSnapshot();
  const draft = {
    ...createServiceDraft(input, 'eq-1', 'compromisso-1'),
    technician: 'Ana Tecnica',
    diagnosis: 'Filtro saturado.',
    actionsDone: 'Limpeza e substituicao preventiva.',
    nextMaintenanceDate: '2026-06-10',
    finalStatus: 'ok' as const,
  };

  const immediateFields = buildServiceReportViewModel(input, draft).sections.flatMap(
    (section) => section.fields,
  );

  expect(immediateFields).toEqual(
    expect.arrayContaining([{ label: 'Proxima manutencao', value: '10/06/2026' }]),
  );

  const reopenedFields = buildServiceReportViewModelFromRecord(input, {
    id: 'registro-proxima',
    equipamentoId: 'eq-1',
    data: input.today,
    tipo: 'preventiva',
    status: 'ok',
    tecnico: 'Ana Tecnica',
    observacoes: 'Limpeza e substituicao preventiva.',
    proximaData: '2026-06-10',
  }).sections.flatMap((section) => section.fields);

  expect(reopenedFields).toEqual(
    expect.arrayContaining([{ label: 'Proxima manutencao', value: '10/06/2026' }]),
  );
});
