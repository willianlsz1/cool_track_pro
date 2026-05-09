import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { closeHistoricoCardMenus, toggleHistoricoCardMenu } from '../../actions/cardMenuHelpers.js';

function createMenuFixture() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="hist-item-actions">
      <button type="button" data-hist-action="toggle-card-menu" aria-expanded="true"></button>
      <div class="hist-item-actions__menu"></div>
    </div>
    <div class="hist-item-actions">
      <button type="button" data-hist-action="toggle-card-menu" aria-expanded="true"></button>
      <div class="hist-item-actions__menu"></div>
    </div>
  `;

  const menus = [...container.querySelectorAll('.hist-item-actions__menu')];
  const toggles = [...container.querySelectorAll('[data-hist-action="toggle-card-menu"]')];
  menus.forEach((menu) => {
    menu.hidden = false;
  });

  return { container, menus, toggles };
}

describe('historico card menu helpers', () => {
  it('closeHistoricoCardMenus fecha menus e reseta aria-expanded', () => {
    const { container, menus, toggles } = createMenuFixture();

    closeHistoricoCardMenus(container);

    expect(menus.every((menu) => menu.hidden)).toBe(true);
    expect(toggles.map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual([
      'false',
      'false',
    ]);
  });

  it('toggleHistoricoCardMenu abre menu fechado e fecha os demais', () => {
    const { container, menus, toggles } = createMenuFixture();
    menus.forEach((menu) => {
      menu.hidden = true;
    });
    toggles.forEach((toggle) => {
      toggle.setAttribute('aria-expanded', 'false');
    });

    toggleHistoricoCardMenu(container, toggles[1]);

    expect(menus[0].hidden).toBe(true);
    expect(menus[1].hidden).toBe(false);
    expect(toggles[0].getAttribute('aria-expanded')).toBe('false');
    expect(toggles[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('toggleHistoricoCardMenu fecha menu aberto sem reabrir', () => {
    const { container, menus, toggles } = createMenuFixture();

    toggleHistoricoCardMenu(container, toggles[0]);

    expect(menus.every((menu) => menu.hidden)).toBe(true);
    expect(toggles.map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual([
      'false',
      'false',
    ]);
  });

  it('cardMenuHelpers nao importa adapter, React, handlers ou side effects proibidos', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/features/historico/actions/cardMenuHelpers.js'),
      'utf8',
    );

    expect(source).not.toContain('ui/views/historico');
    expect(source).not.toContain('react/pages');
    expect(source).not.toContain('Toast');
    expect(source).not.toContain('goTo');
    expect(source).not.toContain('Photos');
    expect(source).not.toContain('SignatureViewerModal');
    expect(source).not.toContain('reportExportHandlers');
    expect(source).not.toContain('loadRegistroForEdit');
  });
});
