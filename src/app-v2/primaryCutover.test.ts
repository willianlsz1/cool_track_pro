import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('app-v2 primary cutover', () => {
  it('usa o bootstrap app-v2 como entrada principal sem carregar o shell legado', () => {
    const html = readFileSync('index.html', 'utf8');

    expect(html).toContain('id="app-v2-root"');
    expect(html).toContain('src="/src/app-v2/main.tsx"');
    expect(html).not.toContain('id="app"');
    expect(html).not.toContain('src="/src/app.js"');
    expect(html).not.toContain('/src/assets/styles/redesign.css');
    expect(html).not.toContain('/src/assets/styles/equipment-detail-cp-h.css');
    expect(html).not.toContain('/src/assets/styles/equipment-list-cp-i.css');
  });

  it('mantem previews locais isolados do shell e CSS legados', () => {
    const previewEntrypoints = [
      ['preview.html', 'src="./src/app-v2/preview.tsx"'],
      ['preview/index.html', 'src="../src/app-v2/preview.tsx"'],
      ['src/app-v2/preview.html', 'src="./preview.tsx"'],
      ['src/app-v2/authenticated-preview.html', 'src="./authenticatedPreview.tsx"'],
    ] as const;

    for (const [path, expectedEntrypoint] of previewEntrypoints) {
      const html = readFileSync(path, 'utf8');

      expect(html).toContain(expectedEntrypoint);
      expect(html).not.toContain('id="app"');
      expect(html).not.toContain('/src/app.js');
      expect(html).not.toContain('/src/assets/styles/redesign.css');
      expect(html).not.toContain('/src/assets/styles/equipment-detail-cp-h.css');
      expect(html).not.toContain('/src/assets/styles/equipment-list-cp-i.css');
    }
  });
});
