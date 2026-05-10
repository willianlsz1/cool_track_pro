import { describe, expect, it, vi } from 'vitest';

import { drawPmocCover } from '../domain/pdf/pmoc/sections/cover.js';
import { drawUpsellBlock } from '../domain/pdf/sections/upsell.js';

function makeDoc() {
  const calls = {
    link: [],
    text: [],
  };
  const doc = {
    internal: {
      getNumberOfPages: () => 1,
    },
    setPage: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setDrawColor: vi.fn(),
    setFillColor: vi.fn(),
    setLineWidth: vi.fn(),
    rect: vi.fn(),
    line: vi.fn(),
    splitTextToSize: (text) => [String(text)],
    getTextWidth: (text) => String(text).length,
    text: vi.fn((value) => {
      calls.text.push(value);
    }),
    link: vi.fn((x, y, width, height, options) => {
      calls.link.push(options?.url);
    }),
  };
  return { doc, calls };
}

function drawCoverWithUrl(urlChamados) {
  const { doc, calls } = makeDoc();
  drawPmocCover(
    doc,
    210,
    297,
    { left: 12, right: 12, top: 12, bottom: 12 },
    {
      ano: 2026,
      docNumber: 'PMOC-1',
      cliente: {
        nome: 'Cliente',
        urlChamados,
      },
      profile: {
        nome: 'Tecnico',
      },
      equipamentos: [],
      pmocSummary: {},
    },
  );
  return calls;
}

describe('PMOC PDF secure links', () => {
  it('aceita link http/https valido em urlChamados', () => {
    const calls = drawCoverWithUrl('https://suporte.example/chamados?id=1');

    expect(calls.link).toContain('https://suporte.example/chamados?id=1');
  });

  it('renderiza urlChamados perigoso sem link clicavel', () => {
    const calls = drawCoverWithUrl('javascript:alert(1)');

    expect(calls.text).toContain('javascript:alert(1)');
    expect(calls.link).toHaveLength(0);
  });

  it('renderiza urlChamados invalido sem quebrar o PDF', () => {
    const calls = drawCoverWithUrl('not a url');

    expect(calls.text).toContain('not a url');
    expect(calls.link).toHaveLength(0);
  });

  it('nao promove dominio placeholder no upsell Free', () => {
    const { doc, calls } = makeDoc();

    drawUpsellBlock(doc, 210, 297, 12);

    expect(calls.text.join(' ')).not.toContain('cooltrack.app');
  });
});
