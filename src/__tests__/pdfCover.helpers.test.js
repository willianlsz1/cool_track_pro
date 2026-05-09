import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { PDF_COLORS as C } from '../domain/pdf/constants.js';
import {
  buildCoverContext,
  buildCoverEquipamentosRows,
  buildCoverFichaTecnicaBlocks,
  buildCoverInfoBlocksModel,
  buildCoverPendenciasModel,
  buildCoverPeriodText,
  buildCoverResumoModel,
  buildCoverTitleModel,
} from '../domain/pdf/sections/coverHelpers.js';

const equipamentos = [
  {
    id: 'eq-1',
    codigo: 'AC-01',
    nome: 'Evaporadora Sala Técnica Principal Com Nome Longo',
    local: 'Casa de Máquinas Setor Norte',
    dadosPlaca: {
      numero_serie: 'SN-123',
      capacidade_btu: 12000,
      camposExtras: [{ key: 'fluido', label: 'Fluido', value: 'R410A' }],
    },
  },
  {
    id: 'eq-2',
    tag: 'TAG-02',
    nome: 'Condensadora',
    local: 'Cobertura',
    dadosPlaca: {},
  },
];

const registros = [
  {
    id: 'reg-1',
    equipId: 'eq-1',
    status: 'warn',
    data: '2026-05-02',
    proxima: '2026-05-20',
  },
  {
    id: 'reg-2',
    equipId: 'eq-2',
    status: 'ok',
    data: '2026-05-03',
  },
];

describe('pdf cover section helpers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('buildCoverPeriodText preserva periodo e fallbacks visiveis', () => {
    expect(buildCoverPeriodText('2026-05-01', '2026-05-09')).toBe(
      'Período 01/05/2026 – 09/05/2026',
    );
    expect(buildCoverPeriodText(null, '2026-05-09')).toBe('Período início – 09/05/2026');
    expect(buildCoverPeriodText('2026-05-01', null)).toBe('Período 01/05/2026 – atual');
    expect(buildCoverPeriodText(null, null)).toBe('');
  });

  it('buildCoverContext e buildCoverTitleModel preservam OS, emissao, cliente, tecnico e periodo', () => {
    const context = buildCoverContext({
      doc: { marker: 'doc' },
      pageWidth: 210,
      pageHeight: 297,
      margin: 12,
      profile: { nome: 'Técnica Beta' },
      de: '2026-05-01',
      ate: '2026-05-09',
      filtered: registros,
      equipamentos,
      context: {
        osNumber: 'OS-42',
        emitido: '09/05/2026',
        cliente: { nome: 'Cliente Alfa' },
      },
    });

    expect(context).toMatchObject({
      pageWidth: 210,
      pageHeight: 297,
      margin: 12,
      cliente: { nome: 'Cliente Alfa' },
      periodoTexto: 'Período 01/05/2026 – 09/05/2026',
    });
    expect(buildCoverTitleModel(context)).toEqual({
      osNumber: 'OS-42',
      emitido: '09/05/2026',
      clienteNome: 'Cliente Alfa',
      tecnicoNome: 'Técnica Beta',
      periodoTexto: 'Período 01/05/2026 – 09/05/2026',
    });
  });

  it('buildCoverInfoBlocksModel preserva linhas tecnico/cliente e fallback', () => {
    const model = buildCoverInfoBlocksModel(
      {
        nome: 'Técnica Beta',
        razao_social: 'Beta HVAC Ltda',
        cnpj: '12.345.678/0001-90',
        inscricao_estadual: 'IE-1',
        telefone: '(11) 99999-0000',
      },
      {
        nome: 'Cliente Alfa',
        documento: '00.000.000/0001-00',
        local: 'Unidade A',
        contato: 'Operação',
      },
    );

    expect(model.blockH).toBe(42);
    expect(model.tecnicoLines.map((line) => line.value)).toContain('Técnica Beta');
    expect(model.tecnicoLines.map((line) => line.value)).toContain('CNPJ 12.345.678/0001-90');
    expect(model.clienteLines.map((line) => line.value)).toContain('Cliente Alfa');

    expect(buildCoverInfoBlocksModel({}, null).clienteLines).toEqual([
      { value: 'Não informado', size: 9, color: C.text3, italic: true },
    ]);
  });

  it('buildCoverResumoModel preserva totais, equipamentos e pior status', () => {
    expect(buildCoverResumoModel(registros, equipamentos)).toEqual({
      totalServicos: 2,
      equipCount: 2,
      statusLabel: 'Requer atenção',
      statusColor: C.amber,
    });

    expect(buildCoverResumoModel([], equipamentos)).toEqual({
      totalServicos: 0,
      equipCount: 0,
      statusLabel: '—',
      statusColor: C.text3,
    });
  });

  it('buildCoverEquipamentosRows preserva rows principais e fallbacks', () => {
    const rows = buildCoverEquipamentosRows(registros, equipamentos);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      tag: 'AC-01',
      nome: 'Evaporadora Sala Técnica Princi…',
      local: 'Casa de Máquinas Setor Norte',
      ultimo: '02/05/2026',
      proxima: '20/05/2026',
      statusKey: 'warn',
    });
    expect(rows[1]).toMatchObject({
      tag: 'TAG-02',
      ultimo: '03/05/2026',
      proxima: '—',
      statusKey: 'ok',
    });
  });

  it('buildCoverFichaTecnicaBlocks preserva dados de placa e extras', () => {
    const blocks = buildCoverFichaTecnicaBlocks(registros, equipamentos);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].eq.id).toBe('eq-1');
    expect(blocks[0].fixedRows.some((row) => row.label === 'Nº de série')).toBe(true);
    expect(blocks[0].fixedRows.some((row) => row.value === '12.000 BTU')).toBe(true);
    expect(blocks[0].extraRows).toEqual([
      { key: 'fluido', label: 'Fluido', value: 'R410A', extra: true },
    ]);
  });

  it('buildCoverPendenciasModel preserva pendencias e fallback de acao', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-09T12:00:00-03:00'));

    const pendencias = buildCoverPendenciasModel(
      [...registros, { id: 'reg-3', equipId: 'eq-2', status: 'danger', data: '2026-05-04' }],
      equipamentos,
    );

    expect(pendencias).toHaveLength(2);
    expect(pendencias[0]).toMatchObject({
      equipamento: equipamentos[0],
      cor: C.amber,
      acao: 'Preventiva recomendada até 20/05/2026',
    });
    expect(pendencias[1]).toMatchObject({
      equipamento: equipamentos[1],
      cor: C.red,
      acao: 'Requer intervenção imediata',
    });
  });

  it('mantem o modulo sem imports de cover.js, jsPDF, autoTable, drawChecklist, DOM ou UI', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/domain/pdf/sections/coverHelpers.js'),
      'utf8',
    );

    expect(source).not.toMatch(/cover\.js|jspdf|autoTable|drawChecklist/);
    expect(source).not.toMatch(/\bdocument\b|\bwindow\b|React|ui\/|reportExportHandlers/);
    expect(source).not.toMatch(/views\/registro/);
    expect(source).not.toMatch(/fillPage|txt\(|card\(|accentLine|doc\.|addPage/);
  });
});
