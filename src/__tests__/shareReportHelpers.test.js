import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildShareReportContext } from '../domain/pdf/shareReportHelpers.js';

describe('shareReportHelpers', () => {
  it('buildShareReportContext preserva blob, metadata, texto, client e nome seguro', () => {
    const pdfBlob = new Blob(['pdf'], { type: 'application/pdf' });
    const supabaseClient = { storage: {} };
    const buildFileName = ({ registroId, fileName }) => `${registroId}-${fileName}`;

    const context = buildShareReportContext({
      pdfBlob,
      fileName: 'relatorio-final.pdf',
      whatsappText: 'Mensagem custom',
      metadata: {
        userId: 'user-1',
        registroId: 'reg-1',
        filters: { cliente: 'Cliente A' },
      },
      supabaseClient,
      buildFileName,
    });

    expect(context).toEqual({
      pdfBlob,
      safeName: 'reg-1-relatorio-final.pdf',
      whatsappText: 'Mensagem custom',
      metadata: {
        userId: 'user-1',
        registroId: 'reg-1',
        filters: { cliente: 'Cliente A' },
      },
      supabaseClient,
    });
  });

  it('modulo helper nao importa shareReport, handlers, Supabase, Web Share, DOM ou Toast', () => {
    const source = readFileSync(resolve('src/domain/pdf/shareReportHelpers.js'), 'utf8');
    const importLines = source.split('\n').filter((line) => line.trim().startsWith('import '));

    expect(importLines).toEqual([]);
    expect(source).not.toContain('shareReport.js');
    expect(source).not.toContain('reportExportHandlers');
    expect(source).not.toMatch(
      /\bnavigator\b|\bwindow\b|\bdocument\b|\bnew File\b|ObjectURL|URL\.createObjectURL/,
    );
    expect(source).not.toMatch(/Toast|handleError|Router|goTo/);
  });
});
