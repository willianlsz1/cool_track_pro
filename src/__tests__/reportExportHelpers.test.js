import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildWhatsAppSuccessCopy } from '../domain/reportExportHelpers.js';

describe('relatorio export helpers', () => {
  it('preserva o copy de sucesso por canal de compartilhamento', () => {
    expect(buildWhatsAppSuccessCopy('web-share')).toEqual({
      title: 'RelatÃ³rio pronto para compartilhar',
    });
    expect(buildWhatsAppSuccessCopy('download')).toEqual({
      title: 'RelatÃ³rio baixado. Envie manualmente pelo WhatsApp.',
    });
    expect(buildWhatsAppSuccessCopy('wa-link')).toEqual({
      title: 'RelatÃ³rio enviado para o WhatsApp',
    });
    expect(buildWhatsAppSuccessCopy(undefined)).toEqual({
      title: 'RelatÃ³rio enviado para o WhatsApp',
    });
  });

  it('mantem helper puro sem imports do adapter, DOM, PDF, share, Toast ou Router', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/domain/reportExportHelpers.js'),
      'utf8',
    );

    expect(source).not.toContain('ui/controller/handlers/reportExportHandlers');
    expect(source).not.toContain('domain/pdf');
    expect(source).not.toContain('shareReport');
    expect(source).not.toContain('Toast');
    expect(source).not.toContain('goTo');
    expect(source).not.toContain('document');
    expect(source).not.toContain('window');
    expect(source).not.toContain('navigator');
  });
});
