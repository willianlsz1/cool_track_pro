import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('equipamentos ownership cleanup', () => {
  it('nao referencia modulos obsoletos paralelos de equipamentos', () => {
    const files = [
      'src/ui/controller/handlers/equipmentHandlers.js',
      'src/ui/views/equipamentos.js',
    ];

    const obsoleteImportPattern =
      /ui\/views\/equipamentos\/(equipDetail|equipCrud|setorCrud|setorCard)\.js/;

    files.forEach((filePath) => {
      const source = readFileSync(filePath, 'utf-8');
      expect(source).not.toMatch(obsoleteImportPattern);
    });
  });
});
