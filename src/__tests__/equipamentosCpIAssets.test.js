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

  it('organiza CP-I.2 como pagina nativa com barra operacional unica', () => {
    const css = readFileSync('src/assets/styles/equipment-list-cp-i.css', 'utf8');
    const views = readFileSync('src/ui/shell/templates/views.js', 'utf8');

    expect(css).toContain('CP-I.2: pagina nativa');
    expect(css).toMatch(
      /#view-equipamentos\s+\.equip-operational-bar[\s\S]*background:\s*transparent/,
    );
    expect(css).toMatch(/\.equip-operational-bar:has\(\.search-bar\[style\*='display: none'\]\)/);
    expect(css).toMatch(/#view-equipamentos\s+\.setor-grid[\s\S]*auto-fill/);
    expect(css).toMatch(/#view-equipamentos\s+\.lista-equip--grid[\s\S]*auto-fill/);

    const toolbarIndex = views.indexOf('class="page-toolbar"');
    const operationalIndex = views.indexOf('class="equip-operational-bar"');
    const filtersIndex = views.indexOf('id="equip-filters"');
    const searchIndex = views.indexOf('class="equip-search-row"');

    expect(toolbarIndex).toBeGreaterThan(-1);
    expect(operationalIndex).toBeGreaterThan(toolbarIndex);
    expect(filtersIndex).toBeGreaterThan(operationalIndex);
    expect(searchIndex).toBeGreaterThan(operationalIndex);
  });

  it('refina CP-I.3 para header forte, toolbar coesa e chips legiveis', () => {
    const css = readFileSync('src/assets/styles/equipment-list-cp-i.css', 'utf8');

    expect(css).toContain('CP-I.3: acabamento nativo');
    expect(css).toMatch(/#view-equipamentos\s+\.page-toolbar\s*>\s*div:first-child::before/);
    expect(css).toMatch(/#view-equipamentos\s+\.page-toolbar[\s\S]*border-bottom/);
    expect(css).toMatch(
      /#view-equipamentos\s+\.equip-operational-bar[\s\S]*grid-template-columns:\s*auto\s+minmax\(280px,\s*1fr\)\s+minmax\(min\(100%,\s*520px\),\s*auto\)/,
    );
    expect(css).toMatch(/#view-equipamentos\s+\.equip-operational-bar__top[\s\S]*order:\s*0/);
    expect(css).toMatch(
      /#view-equipamentos\s+\.setor-card__equip-preview-name[\s\S]*color:\s*var\(--eqi-blue-800\)\s*!important/,
    );
    expect(css).toMatch(
      /#view-equipamentos\s+\.setor-card__empty[\s\S]*background:\s*linear-gradient/,
    );
  });
});
