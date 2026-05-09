import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildPdfDocumentModel } from '../domain/pdf/generatorHelpers.js';

function createMemoryStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

describe('pdf generator helpers', () => {
  it('preserva filters.registroId e monta modelo de documento com OS, emissao e cliente', () => {
    const storage = createMemoryStorage();
    const now = new Date('2026-05-09T12:00:00.000Z');
    const registros = [
      {
        id: 'reg-outro',
        data: '2026-05-08T10:00',
        equipId: 'eq-b',
        cliente: 'Cliente fora',
        equipamento: 'Split 12k',
      },
      {
        id: 'reg-alvo',
        data: '2026-05-01T09:00',
        equipId: 'eq-a',
        clienteNome: 'Cliente Alvo',
        localAtendimento: 'Sala tecnica',
        equipamento: 'Chiller 01',
      },
    ];

    const model = buildPdfDocumentModel(
      {
        registros,
        registroId: 'reg-alvo',
        filtEq: 'eq-b',
        de: '2026-05-08',
        ate: '2026-05-08',
      },
      now,
      storage,
    );

    expect(model.filtered.map((registro) => registro.id)).toEqual(['reg-alvo']);
    expect(model.osNumber).toBe('2026-0509-001');
    expect(model.emitido).toBe('09/05/2026');
    expect(model.reportContext.osNumber).toBe(model.osNumber);
    expect(model.reportContext.emitido).toBe(model.emitido);
    expect(model.reportContext.cliente).toMatchObject({
      nome: 'Cliente Alvo',
      local: 'Sala tecnica',
    });
  });

  it('preserva incremento do numero de OS via storage injetado', () => {
    const storage = createMemoryStorage();
    const now = new Date('2026-05-09T12:00:00.000Z');
    const generationContext = {
      registros: [{ id: 'reg-1', data: '2026-05-09T10:00', equipId: 'eq-a' }],
      registroId: '',
      filtEq: '',
      de: '',
      ate: '',
    };

    expect(buildPdfDocumentModel(generationContext, now, storage).osNumber).toBe('2026-0509-001');
    expect(buildPdfDocumentModel(generationContext, now, storage).osNumber).toBe('2026-0509-002');
  });

  it('mantem o modulo sem imports de pdf.js, jsPDF, sections, UI, state/Profile ou DOM', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/domain/pdf/generatorHelpers.js'),
      'utf8',
    );

    expect(source).not.toMatch(/domain\/pdf\.js|from ['"].*\.\.\/pdf\.js/);
    expect(source).not.toMatch(/jspdf|sections\/|ui\/components\/signature/);
    expect(source).not.toMatch(/core\/state|features\/profile|document|window|Toast|Router/);
  });
});
