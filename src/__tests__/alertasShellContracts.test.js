import { describe, expect, it } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';

describe('alertas shell contracts', () => {
  it('declares the fixed root and list containers used by the React island', () => {
    const host = document.createElement('main');
    host.innerHTML = renderShellViews();

    const root = host.querySelector('#view-alertas');
    const contextual = host.querySelector('#alertas-contextual');
    const list = host.querySelector('#lista-alertas');

    expect(root).not.toBeNull();
    expect(root?.contains(contextual)).toBe(true);
    expect(root?.contains(list)).toBe(true);
    expect(list?.getAttribute('role')).toBe('list');
  });
});
