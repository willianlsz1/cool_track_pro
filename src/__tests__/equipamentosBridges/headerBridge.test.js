import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  loadEquipamentosHeaderBridge,
  mountEquipamentosHeader,
  unmountEquipamentosHeader,
} from '../../ui/views/equipamentos/bridges/headerBridge.js';
import {
  clearBridgeState,
  getEquipamentosHeaderBridge,
  getEquipamentosHeaderBridgePromise,
  getEquipamentosHeaderRenderGeneration,
} from '../../ui/views/equipamentos/state/bridgeState.js';

describe('bridges/headerBridge', () => {
  beforeEach(() => {
    clearBridgeState();
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('load header bridge uses a memoized local bridge promise without importing React', async () => {
    const first = loadEquipamentosHeaderBridge();
    const second = loadEquipamentosHeaderBridge();

    expect(second).toBe(first);
    expect(getEquipamentosHeaderBridgePromise()).toBe(first);

    const bridge = await first;
    expect(bridge.mountEquipamentosHeader).toEqual(expect.any(Function));
    expect(bridge.unmountEquipamentosHeader).toEqual(expect.any(Function));
  });

  it('caches the loaded bridge in bridgeState', async () => {
    const bridge = await loadEquipamentosHeaderBridge();

    expect(getEquipamentosHeaderBridge()).toBe(bridge);
  });

  it('mount increments generation and renders when generation is current', async () => {
    document.body.innerHTML =
      '<section id="equip-hero"></section><nav id="equip-filters"></nav><div id="equip-context-chip"></div>';
    const root = document.getElementById('equip-hero');
    const filtersRoot = document.getElementById('equip-filters');
    const contextRoot = document.getElementById('equip-context-chip');

    const result = await mountEquipamentosHeader({
      root,
      filtersRoot,
      contextRoot,
      viewModel: {
        hero: {
          visible: true,
          title: 'Atencao',
          items: [{ id: 'eq-1', name: 'Split Alpha' }],
        },
        filters: {
          visible: true,
          chips: [{ id: 'todos', label: 'Todos', count: 1, active: true }],
        },
        context: { visible: true, label: 'Cliente Alpha' },
      },
    });

    expect(result).toBe(root);
    expect(getEquipamentosHeaderRenderGeneration()).toBe(1);
    expect(root.dataset.equipamentosHeaderMounted).toBe('true');
    expect(root.querySelector('[data-action="go-register-equip"]')?.dataset.id).toBe('eq-1');
    expect(filtersRoot.querySelector('[data-action="equip-quickfilter"]')).not.toBeNull();
    expect(contextRoot.querySelector('[data-action="equip-clear-cliente-filter"]')).not.toBeNull();
  });

  it('respects generation guard and ignores stale mount', async () => {
    document.body.innerHTML = '<section id="equip-hero"></section>';
    const root = document.getElementById('equip-hero');

    const pendingMount = mountEquipamentosHeader({ root, viewModel: {} });
    unmountEquipamentosHeader();
    const result = await pendingMount;

    expect(result).toBeNull();
    expect(root.dataset.equipamentosHeaderMounted).toBeUndefined();
  });

  it('unmount returns null when root is not mounted', () => {
    document.body.innerHTML = '<section id="equip-hero"></section>';

    expect(unmountEquipamentosHeader()).toBeNull();
  });

  it('unmount clears mounted DOM content', async () => {
    document.body.innerHTML =
      '<section id="equip-hero"></section><nav id="equip-filters"></nav><div id="equip-context-chip"></div>';
    const root = document.getElementById('equip-hero');
    const filtersRoot = document.getElementById('equip-filters');
    const contextRoot = document.getElementById('equip-context-chip');

    await mountEquipamentosHeader({
      root,
      filtersRoot,
      contextRoot,
      viewModel: {
        hero: { visible: true },
        filters: { visible: true, chips: [{ id: 'todos', label: 'Todos', count: 1 }] },
        context: { visible: true, label: 'Cliente' },
      },
    });

    const result = unmountEquipamentosHeader();

    expect(result).toBeNull();
    expect(root.dataset.equipamentosHeaderMounted).toBeUndefined();
    expect(root.innerHTML).toBe('');
    expect(filtersRoot.innerHTML).toBe('');
    expect(contextRoot.innerHTML).toBe('');
  });
});
