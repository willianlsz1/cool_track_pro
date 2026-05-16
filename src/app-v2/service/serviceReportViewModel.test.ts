import { describe, expect, it } from 'vitest';

import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import { createServiceDraft } from './serviceFlowViewModel';
import { buildServiceReportViewModel } from './serviceReportViewModel';

describe('serviceReportViewModel', () => {
  const forbiddenRegulatoryTerm = ['P', 'MOC'].join('');

  it('monta relatorio simples com cliente, equipamento e resumo do servico', () => {
    const input = createAppV2MockSnapshot();
    const draft = {
      ...createServiceDraft(input, 'eq-1', 'compromisso-1'),
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
});
