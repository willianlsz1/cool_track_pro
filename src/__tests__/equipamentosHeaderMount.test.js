import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  configureHeaderMount,
  mountEquipamentosHeader,
} from '../ui/views/equipamentos/ui/headerMount.js';

function configureHeaderMountTestDeps({ mountHeaderBridge = vi.fn(() => 'mounted') } = {}) {
  const Utils = {
    getEl: vi.fn((id) => document.getElementById(id)),
  };

  configureHeaderMount({ Utils, mountHeaderBridge });

  return { Utils, mountHeaderBridge };
}

describe('headerMount', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    configureHeaderMount({ Utils: null, mountHeaderBridge: null });
  });

  it('exige dependencias configuradas', () => {
    expect(() => mountEquipamentosHeader({})).toThrow(
      'header mount dependency not configured: Utils',
    );

    configureHeaderMount({
      Utils: {
        getEl: vi.fn(),
      },
      mountHeaderBridge: null,
    });

    expect(() => mountEquipamentosHeader({})).toThrow(
      'header mount dependency not configured: mountHeaderBridge',
    );
  });

  it('resolve os roots atuais via Utils.getEl e chama a bridge com o viewModel', () => {
    document.body.innerHTML = `
      <section id="equip-hero"></section>
      <nav id="equip-filters"></nav>
      <div id="equip-context-chip"></div>
    `;
    const { Utils, mountHeaderBridge } = configureHeaderMountTestDeps();
    const viewModel = { hero: { title: 'Atenção agora' } };

    const result = mountEquipamentosHeader(viewModel);

    expect(result).toBe('mounted');
    expect(Utils.getEl).toHaveBeenNthCalledWith(1, 'equip-hero');
    expect(Utils.getEl).toHaveBeenNthCalledWith(2, 'equip-filters');
    expect(Utils.getEl).toHaveBeenNthCalledWith(3, 'equip-context-chip');
    expect(mountHeaderBridge).toHaveBeenCalledWith({
      viewModel,
      root: document.getElementById('equip-hero'),
      filtersRoot: document.getElementById('equip-filters'),
      contextRoot: document.getElementById('equip-context-chip'),
    });
  });

  it('preserva fallback silencioso quando root nao existe', () => {
    document.body.innerHTML = '<nav id="equip-filters"></nav>';
    const mountHeaderBridge = vi.fn(({ root }) => (root ? 'mounted' : null));
    configureHeaderMountTestDeps({ mountHeaderBridge });

    const result = mountEquipamentosHeader({ hero: {} });

    expect(result).toBeNull();
    expect(mountHeaderBridge).toHaveBeenCalledWith({
      viewModel: { hero: {} },
      root: null,
      filtersRoot: document.getElementById('equip-filters'),
      contextRoot: null,
    });
  });

  it('nao importa adapter obsoleto', () => {
    const source = readFileSync(resolve('src/ui/views/equipamentos/ui/headerMount.js'), 'utf8');

    expect(source).not.toContain('ui/views/equipamentos');
    expect(source).not.toContain('views/equipamentos.js');
  });
});
