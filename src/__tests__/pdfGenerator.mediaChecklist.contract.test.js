import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  state: { registros: [], equipamentos: [] },
  lastDoc: null,
  output: vi.fn(() => new Blob(['pdf'], { type: 'application/pdf' })),
  save: vi.fn(),
  drawCover: vi.fn(),
  stampFooterTotals: vi.fn(),
  resolvePhotoDataUrlForPdf: vi.fn(),
  resolveSignatureForRecord: vi.fn(),
  autoTable: vi.fn((doc, options) => {
    doc.__autoTableCalls.push(options);
    doc.lastAutoTable = { finalY: (options.startY || 0) + 10 };
  }),
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => {
    const doc = createDocMock();
    mocks.lastDoc = doc;
    return doc;
  }),
}));

vi.mock('jspdf-autotable', () => ({
  default: mocks.autoTable,
}));

vi.mock('../core/state.js', () => ({
  getState: () => mocks.state,
}));

vi.mock('../core/profile.js', () => ({
  Profile: { get: () => ({ empresa: 'Acme HVAC', nome: 'Tecnica Ana' }) },
}));

vi.mock('../core/photoStorage.js', () => ({
  resolvePhotoDataUrlForPdf: (...args) => mocks.resolvePhotoDataUrlForPdf(...args),
}));

vi.mock('../domain/pdf/sections/cover.js', () => ({
  drawCover: (...args) => mocks.drawCover(...args),
}));

vi.mock('../domain/pdf/sections/footer.js', () => ({
  stampFooterTotals: (...args) => mocks.stampFooterTotals(...args),
}));

const PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const originalImage = globalThis.Image;

function createDocMock() {
  return {
    __autoTableCalls: [],
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
      getFontSize: () => 9,
      getNumberOfPages: () => 1,
    },
    addImage: vi.fn(),
    addPage: vi.fn(),
    line: vi.fn(),
    output: mocks.output,
    rect: vi.fn(),
    roundedRect: vi.fn(),
    save: mocks.save,
    setDrawColor: vi.fn(),
    setFillColor: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setLineWidth: vi.fn(),
    setPage: vi.fn(),
    setTextColor: vi.fn(),
    splitTextToSize: vi.fn((text) => [String(text || '')]),
    text: vi.fn(),
  };
}

function makeChecklist() {
  return {
    tipo_template: 'split_hi_wall',
    items: [
      {
        id: 'filtros_limpeza',
        status: 'ok',
        obs: 'Filtro limpo.',
      },
      {
        id: 'tensao_alimentacao',
        status: 'fail',
        measure: { value: 198, unit: 'V' },
        obs: 'Tensao fora da faixa.',
      },
      {
        id: 'serpentina_evaporadora',
        status: null,
        obs: '',
      },
    ],
  };
}

function makeTargetRegistro(overrides = {}) {
  return {
    id: 'reg-target',
    equipId: 'eq-2',
    data: '2026-05-08T10:00',
    tipo: 'Preventiva',
    tecnico: 'Tecnica Ana',
    status: 'ok',
    obs: 'Preventiva com evidencias, assinatura e checklist PMOC.',
    fotos: [
      PNG_DATA_URL,
      {
        bucket: 'registro-fotos',
        path: 'user-1/registros/reg-target/foto-1.jpg',
        mimeType: 'image/jpeg',
      },
    ],
    assinatura: true,
    checklist: makeChecklist(),
    ...overrides,
  };
}

describe('PDFGenerator media/checklist contract', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    globalThis.Image = undefined;
    mocks.lastDoc = null;
    mocks.state.registros = [
      {
        id: 'reg-old',
        equipId: 'eq-1',
        data: '2026-05-01T10:00',
        fotos: [],
        assinatura: null,
        checklist: null,
      },
      makeTargetRegistro(),
    ];
    mocks.state.equipamentos = [
      { id: 'eq-1', nome: 'Split Antigo', local: 'Sala 1' },
      { id: 'eq-2', nome: 'Split Novo', local: 'Sala 2' },
    ];
    mocks.resolvePhotoDataUrlForPdf.mockResolvedValue(PNG_DATA_URL);
    mocks.resolveSignatureForRecord.mockResolvedValue(PNG_DATA_URL);
  });

  afterEach(() => {
    globalThis.Image = originalImage;
  });

  it('preserva registroId e encaminha fotos, assinatura e checklist no fluxo do gerador', async () => {
    const { PDFGenerator } = await import('../domain/pdf.js');

    const result = await PDFGenerator.generateMaintenanceReport(
      {
        registroId: 'reg-target',
        filtEq: 'eq-1',
        de: '2026-05-01',
        ate: '2026-05-31',
        asBlob: true,
      },
      { planCode: 'pro', resolveSignatureForRecord: mocks.resolveSignatureForRecord },
    );

    expect(result).toEqual({
      fileName: expect.stringMatching(/^CoolTrack_Acme_HVAC_\d{4}-\d{2}-\d{2}\.pdf$/),
      blob: expect.any(Blob),
    });

    const coverFiltered = mocks.drawCover.mock.calls[0][8];
    expect(coverFiltered).toHaveLength(1);
    expect(coverFiltered[0]).toMatchObject({
      id: 'reg-target',
      fotos: expect.arrayContaining([
        PNG_DATA_URL,
        expect.objectContaining({ path: expect.any(String) }),
      ]),
      assinatura: true,
      checklist: expect.objectContaining({
        tipo_template: 'split_hi_wall',
        items: expect.arrayContaining([
          expect.objectContaining({ id: 'filtros_limpeza', status: 'ok' }),
          expect.objectContaining({ id: 'tensao_alimentacao', status: 'fail' }),
        ]),
      }),
    });

    expect(mocks.resolvePhotoDataUrlForPdf).toHaveBeenCalledWith(PNG_DATA_URL);
    expect(mocks.resolvePhotoDataUrlForPdf).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'user-1/registros/reg-target/foto-1.jpg' }),
    );
    expect(mocks.resolveSignatureForRecord).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'reg-target', assinatura: true }),
    );
    expect(mocks.resolveSignatureForRecord).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: 'reg-old' }),
    );
    expect(mocks.lastDoc.addImage).toHaveBeenCalledWith(
      PNG_DATA_URL,
      'PNG',
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    );
    expect(mocks.lastDoc.text).toHaveBeenCalledWith(
      expect.stringContaining('Resumo PMOC/preventivo'),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object),
    );
    expect(mocks.lastDoc.text).toHaveBeenCalledWith(
      expect.stringContaining('Nao substitui o PMOC formal'),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object),
    );
  });

  it('mantem fallback silencioso quando foto, assinatura ou checklist estao ausentes/invalidos', async () => {
    mocks.state.registros = [
      makeTargetRegistro({
        fotos: ['foto-legada-indisponivel'],
        assinatura: true,
        checklist: null,
      }),
    ];
    mocks.resolvePhotoDataUrlForPdf.mockRejectedValue(new Error('foto indisponivel'));
    mocks.resolveSignatureForRecord.mockRejectedValue(new Error('assinatura indisponivel'));

    const { PDFGenerator } = await import('../domain/pdf.js');

    const result = await PDFGenerator.generateMaintenanceReport(
      { registroId: 'reg-target', asBlob: true },
      { planCode: 'pro', resolveSignatureForRecord: mocks.resolveSignatureForRecord },
    );

    expect(result).toEqual({
      fileName: expect.stringMatching(/^CoolTrack_Acme_HVAC_\d{4}-\d{2}-\d{2}\.pdf$/),
      blob: expect.any(Blob),
    });
    expect(mocks.resolvePhotoDataUrlForPdf).toHaveBeenCalledWith('foto-legada-indisponivel');
    expect(mocks.resolveSignatureForRecord).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'reg-target', assinatura: true }),
    );
    expect(mocks.lastDoc.text).toHaveBeenCalledWith(
      expect.stringContaining('Foto indispon'),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object),
    );
    expect(mocks.lastDoc.text).toHaveBeenCalledWith(
      expect.stringContaining('Assinatura'),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object),
    );
  });

  it('trava drawChecklist consumindo tipo_template e items marcados sem exigir snapshot visual', async () => {
    const { drawChecklist } = await import('../domain/pdf/sections/checklist.js');
    const doc = createDocMock();

    const nextY = drawChecklist(
      doc,
      210,
      297,
      12,
      40,
      [
        {
          id: 'reg-target',
          equipId: 'eq-2',
          data: '2026-05-08T10:00',
          checklist: makeChecklist(),
        },
        {
          id: 'reg-sem-checklist',
          equipId: 'eq-1',
          data: '2026-05-01T10:00',
          checklist: null,
        },
      ],
      mocks.state.equipamentos,
    );

    expect(nextY).toBeGreaterThan(40);
    expect(mocks.autoTable).toHaveBeenCalled();
    const renderedRows = doc.__autoTableCalls.flatMap((call) => call.body);
    expect(renderedRows).toEqual(
      expect.arrayContaining([
        ['Limpeza dos filtros de ar', 'Conforme', '', 'Filtro limpo.'],
        [
          expect.stringMatching(/Tens/i),
          expect.stringMatching(/conforme/i),
          '198 V',
          'Tensao fora da faixa.',
        ],
      ]),
    );
    expect(JSON.stringify(doc.__autoTableCalls)).not.toContain('serpentina_evaporadora');
  });
});
