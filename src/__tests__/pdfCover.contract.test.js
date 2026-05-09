import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  autoTable: vi.fn((doc, options) => {
    doc.__autoTableCalls.push(options);
    doc.lastAutoTable = { finalY: (options.startY || 0) + 12 };

    options.didParseCell?.({
      section: 'body',
      row: { index: 0 },
      column: { index: 6 },
      cell: { styles: {} },
    });
    options.didDrawCell?.({
      section: 'body',
      row: { index: 0 },
      column: { index: 0 },
      cell: { x: 10, y: 20, width: 6, height: 6 },
      doc,
    });
  }),
  drawChecklist: vi.fn((_doc, _pageWidth, _pageHeight, _margin, startY) => startY + 10),
}));

vi.mock('jspdf-autotable', () => ({
  default: (...args) => mocks.autoTable(...args),
}));

vi.mock('../domain/pdf/sections/checklist.js', () => ({
  drawChecklist: (...args) => mocks.drawChecklist(...args),
}));

const { drawCover } = await import('../domain/pdf/sections/cover.js');

function createDocMock() {
  return {
    __autoTableCalls: [],
    __texts: [],
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
      getFontSize: () => 9,
      getNumberOfPages: () => 1,
    },
    addPage: vi.fn(),
    circle: vi.fn(),
    getTextWidth: vi.fn((text) => String(text || '').length * 1.8),
    line: vi.fn(),
    rect: vi.fn(),
    roundedRect: vi.fn(),
    setDrawColor: vi.fn(),
    setFillColor: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setLineWidth: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(function captureText(text, x, y, opts) {
      this.__texts.push({ text: String(text), x, y, opts });
    }),
  };
}

function textOutput(doc) {
  return doc.__texts.map((entry) => entry.text).join('\n');
}

function makeProfile() {
  return {
    nome: 'Ana Tecnica',
    empresa: 'Acme HVAC',
    razao_social: 'Acme HVAC Servicos Ltda',
    cnpj: '12.345.678/0001-90',
    inscricao_estadual: '123456',
    telefone: '(11) 90000-0000',
    email: 'ana@example.com',
  };
}

function makeContext() {
  return {
    osNumber: '2026-0509-001',
    emitido: '09/05/2026',
    cliente: {
      nome: 'Cliente Alfa',
      documento: '98.765.432/0001-10',
      local: 'Sala Tecnica',
      contato: 'Maria Operacao',
    },
  };
}

function makeEquipamentos() {
  return [
    {
      id: 'eq-1',
      nome: 'Split Sala Critica',
      tag: 'AC-01',
      codigo: 'AC-01',
      local: 'Sala Tecnica',
      dadosPlaca: {
        numero_serie: 'SN-12345',
        capacidade_btu: 12000,
        tensao: '220',
        frequencia_hz: 60,
        camposExtras: [{ key: 'fluido_refrigerante', label: 'Fluido', value: 'R410A' }],
      },
    },
  ];
}

function makeRegistros() {
  return [
    {
      id: 'reg-1',
      equipId: 'eq-1',
      data: '2026-05-08T10:00',
      proxima: '2026-05-20',
      status: 'danger',
      checklist: {
        tipo_template: 'split_hi_wall',
        items: [
          { id: 'filtros_limpeza', status: 'ok', obs: 'Filtro limpo.' },
          { id: 'tensao_alimentacao', status: 'fail', obs: 'Tensao fora da faixa.' },
        ],
      },
    },
  ];
}

describe('pdf cover contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza contrato basico com masthead, OS, cliente, tecnico, periodo e resumo', () => {
    const doc = createDocMock();
    const filtered = makeRegistros();
    const equipamentos = makeEquipamentos();

    expect(() =>
      drawCover(
        doc,
        210,
        297,
        15,
        makeProfile(),
        '',
        '2026-05-01',
        '2026-05-31',
        filtered,
        equipamentos,
        null,
        makeContext(),
      ),
    ).not.toThrow();

    const output = textOutput(doc);
    expect(output).toContain('COOLTRACK');
    expect(output).toContain('OS 2026-0509-001');
    expect(output).toContain('Cliente Alfa');
    expect(output).toContain('Ana Tecnica');
    expect(output).toContain('01/05/2026');
    expect(output).toContain('31/05/2026');
    expect(output).toContain('RESUMO EXECUTIVO');
    expect(output).toContain('EQUIPAMENTOS ATENDIDOS');
    expect(output).toContain('FICHA');
    expect(output).toContain('Split Sala Critica');
  });

  it('trava equipamentos, ficha tecnica e checklist/PMOC sem snapshot visual', () => {
    const doc = createDocMock();
    const filtered = makeRegistros();
    const equipamentos = makeEquipamentos();

    drawCover(
      doc,
      210,
      297,
      15,
      makeProfile(),
      '',
      '2026-05-01',
      '2026-05-31',
      filtered,
      equipamentos,
      null,
      makeContext(),
    );

    expect(mocks.autoTable).toHaveBeenCalled();
    const autoTablePayload = JSON.stringify(doc.__autoTableCalls);
    expect(autoTablePayload).toContain('AC-01');
    expect(autoTablePayload).toContain('Split Sala Critica');
    expect(autoTablePayload).toContain('SN-12345');
    expect(autoTablePayload).toContain('12.000 BTU');
    expect(autoTablePayload).toContain('R410A');

    expect(mocks.drawChecklist).toHaveBeenCalledWith(
      doc,
      210,
      297,
      15,
      expect.any(Number),
      filtered,
      equipamentos,
    );
    expect(mocks.drawChecklist.mock.calls[0][5][0].checklist).toMatchObject({
      tipo_template: 'split_hi_wall',
      items: expect.arrayContaining([
        expect.objectContaining({ id: 'filtros_limpeza', status: 'ok' }),
        expect.objectContaining({ id: 'tensao_alimentacao', status: 'fail' }),
      ]),
    });
  });

  it('preserva fallbacks para cliente, equipamento e registros ausentes', () => {
    const doc = createDocMock();

    expect(() => drawCover(doc, 210, 297, 15, {}, '', '', '', [], [], null, {})).not.toThrow();

    const output = textOutput(doc);
    expect(output).toContain('Prestador');
    expect(output).toContain('T');
    expect(output).toContain('RESUMO EXECUTIVO');
    expect(output).toContain('0');
    expect(mocks.autoTable).not.toHaveBeenCalled();
    expect(mocks.drawChecklist).toHaveBeenCalledWith(doc, 210, 297, 15, expect.any(Number), [], []);
  });

  it('nao quebra quando registro filtrado referencia equipamento inexistente', () => {
    const doc = createDocMock();
    const filtered = [
      {
        id: 'reg-missing-equip',
        equipId: 'eq-missing',
        data: '2026-05-08T10:00',
        proxima: '2026-05-20',
        status: 'danger',
      },
    ];

    expect(() =>
      drawCover(
        doc,
        210,
        297,
        15,
        makeProfile(),
        '',
        '2026-05-01',
        '2026-05-31',
        filtered,
        [],
        null,
        makeContext(),
      ),
    ).not.toThrow();

    expect(mocks.autoTable).not.toHaveBeenCalled();
    expect(mocks.drawChecklist).toHaveBeenCalledWith(
      doc,
      210,
      297,
      15,
      expect.any(Number),
      filtered,
      [],
    );
  });
});
