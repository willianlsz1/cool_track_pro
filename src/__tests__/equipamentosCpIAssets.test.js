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

  it('normaliza vazamentos dark da aba Equipamentos dentro do escopo CP-I', () => {
    const css = readFileSync('src/assets/styles/equipment-list-cp-i.css', 'utf8');

    expect(css).toContain('CP-I.1: normalizacao visual');
    expect(css).toMatch(/#view-equipamentos\.view/);
    expect(css).toMatch(
      /#view-equipamentos\s+#equip-page-title[\s\S]*color:\s*var\(--eqi-blue-900\)\s*!important/,
    );
    expect(css).toMatch(
      /#view-equipamentos\s+\.search-bar[\s\S]*background:\s*#ffffff\s*!important/,
    );
    expect(css).toMatch(
      /#view-equipamentos\s+\.search-bar__input[\s\S]*background:\s*transparent\s*!important/,
    );
    expect(css).toMatch(/#view-equipamentos\s+\.btn--primary[\s\S]*background:\s*linear-gradient/);
    expect(css).toMatch(
      /#view-equipamentos\s+\.empty-state[\s\S]*background:\s*#ffffff\s*!important/,
    );
    expect(css).toMatch(
      /#view-equipamentos\s+\.setor-card__nome[\s\S]*color:\s*var\(--eqi-blue-900\)\s*!important/,
    );
  });
});
