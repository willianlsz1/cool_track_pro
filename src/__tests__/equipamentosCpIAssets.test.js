import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('equipamentos CP-I visual assets', () => {
  it('carrega CSS escopado da aba Equipamentos depois do detalhe CP-H', () => {
    const index = readFileSync('index.html', 'utf8');
    const detailCss = '/src/assets/styles/equipment-detail-cp-h.css';
    const listCss = '/src/assets/styles/equipment-list-cp-i.css';

    expect(index).toContain(detailCss);
    expect(index).toContain(listCss);
    expect(index.indexOf(listCss)).toBeGreaterThan(index.indexOf(detailCss));
  });

  it('mantem o CSS CP-I escopado na aba Equipamentos', () => {
    const cssPath = 'src/assets/styles/equipment-list-cp-i.css';

    expect(existsSync(cssPath)).toBe(true);
    const css = readFileSync(cssPath, 'utf8');

    expect(css).toContain('#view-equipamentos');
    expect(css).not.toMatch(/(^|\\n)\\.app-shell\\b/);
    expect(css).not.toMatch(/(^|\\n)\\.sidebar\\b/);
    expect(css).not.toMatch(/(^|\\n)\\.topbar\\b/);
  });
});
