import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  autoTable: vi.fn((doc, options) => {
    const finalY = (options.startY || 0) + 12;
    doc.__autoTableCalls.push({ ...options, __finalY: finalY });
    doc.lastAutoTable = { finalY };

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
  drawChecklist: vi.fn(),
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

function makeProfile() {
  return {
    nome: 'Ana Tecnica',
    empresa: 'Acme HVAC',
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
      local: 'Sala Tecnica',
    },
  };
}

function makeEquipamentos({ withDadosPlaca = true } = {}) {
  return [
    {
      id: 'eq-1',
      nome: 'Split Sala Critica',
      tag: 'AC-01',
      codigo: 'AC-01',
      local: 'Sala Tecnica',
      dadosPlaca: withDadosPlaca
        ? {
            numero_serie: 'SN-12345',
            capacidade_btu: 12000,
            camposExtras: [{ key: 'fluido_refrigerante', label: 'Fluido', value: 'R410A' }],
          }
        : undefined,
    },
  ];
}

function makeRegistro({ checklist = true } = {}) {
  return {
    id: 'reg-1',
    equipId: 'eq-1',
    data: '2026-05-08T10:00',
    proxima: '2026-05-20',
    status: 'danger',
    ...(checklist
      ? {
          checklist: {
            tipo_template: 'split_hi_wall',
            items: [
              { id: 'filtros_limpeza', status: 'ok', obs: 'Filtro limpo.' },
              { id: 'tensao_alimentacao', status: 'fail', obs: 'Tensao fora da faixa.' },
            ],
          },
        }
      : {}),
  };
}

function drawTestCover({ doc = createDocMock(), filtered, equipamentos } = {}) {
  drawCover(
    doc,
    210,
    297,
    15,
    makeProfile(),
    '',
    '2026-05-01',
    '2026-05-31',
    filtered ?? [makeRegistro()],
    equipamentos ?? makeEquipamentos(),
    null,
    makeContext(),
  );
  return doc;
}

function findRecommendedActionsText(doc) {
  return doc.__texts.find((entry) => entry.text.includes('RECOMENDADAS'));
}

describe('pdf cover -> checklist cursor contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.drawChecklist.mockImplementation((_doc, _pageWidth, _pageHeight, _margin, startY) => {
      return startY + 18;
    });
  });

  it('envia ao drawChecklist um startY posterior a ficha tecnica e preserva dados filtrados', () => {
    const doc = drawTestCover();

    expect(mocks.autoTable).toHaveBeenCalled();
    expect(mocks.drawChecklist).toHaveBeenCalledTimes(1);

    const checklistCall = mocks.drawChecklist.mock.calls[0];
    const checklistStartY = checklistCall[4];
    const lastAutoTableCall = doc.__autoTableCalls.at(-1);

    expect(checklistStartY).toEqual(expect.any(Number));
    expect(checklistStartY).toBeGreaterThan(lastAutoTableCall.__finalY);
    expect(checklistCall).toEqual([
      doc,
      210,
      297,
      15,
      checklistStartY,
      [makeRegistro()],
      makeEquipamentos(),
    ]);
    expect(checklistCall[5][0].checklist).toMatchObject({
      tipo_template: 'split_hi_wall',
      items: expect.arrayContaining([
        expect.objectContaining({ id: 'filtros_limpeza', status: 'ok' }),
        expect.objectContaining({ id: 'tensao_alimentacao', status: 'fail' }),
      ]),
    });
  });

  it('usa o cursor retornado pelo checklist como startY das pendencias', () => {
    mocks.drawChecklist.mockImplementation((_doc, _pageWidth, _pageHeight, _margin, startY) => {
      return startY + 8;
    });

    const doc = drawTestCover();
    const checklistStartY = mocks.drawChecklist.mock.calls[0][4];
    const returnedCursor = checklistStartY + 8;

    expect(findRecommendedActionsText(doc)).toMatchObject({ y: returnedCursor });
  });

  it('mantem fallback silencioso quando o checklist nao avanca cursor', () => {
    mocks.drawChecklist.mockImplementation(
      (_doc, _pageWidth, _pageHeight, _margin, startY, filtered) => {
        const hasChecklist = filtered.some((registro) => Array.isArray(registro.checklist?.items));
        return hasChecklist ? startY + 18 : startY;
      },
    );

    const doc = drawTestCover({
      filtered: [makeRegistro({ checklist: false })],
      equipamentos: makeEquipamentos({ withDadosPlaca: false }),
    });
    const checklistStartY = mocks.drawChecklist.mock.calls[0][4];

    expect(mocks.drawChecklist).toHaveBeenCalledWith(
      doc,
      210,
      297,
      15,
      checklistStartY,
      [makeRegistro({ checklist: false })],
      makeEquipamentos({ withDadosPlaca: false }),
    );
    expect(findRecommendedActionsText(doc)).toMatchObject({ y: checklistStartY });
  });

  it('preserva fluxo quando drawChecklist adiciona pagina e devolve novo cursor', () => {
    mocks.drawChecklist.mockImplementation((doc, _pageWidth, _pageHeight, _margin) => {
      doc.addPage();
      return 42;
    });

    const doc = drawTestCover({
      equipamentos: makeEquipamentos({ withDadosPlaca: false }),
    });

    expect(doc.addPage).toHaveBeenCalledTimes(1);
    expect(findRecommendedActionsText(doc)).toMatchObject({ y: 42 });
  });
});
