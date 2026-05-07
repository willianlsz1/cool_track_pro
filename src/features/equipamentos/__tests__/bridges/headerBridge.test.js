import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  loadEquipamentosHeaderBridge,
  mountEquipamentosHeader,
  unmountEquipamentosHeader,
} from '../../bridges/headerBridge.js';
import {
  clearBridgeState,
  getEquipamentosHeaderBridge,
  getEquipamentosHeaderBridgePromise,
  getEquipamentosHeaderRenderGeneration,
  setEquipamentosHeaderBridge,
} from '../../state/bridgeState.js';
import {
  mountEquipamentosHeaderReact,
  unmountEquipamentosHeaderReact,
} from '../../../../react/entrypoints/equipamentosHeaderIsland.jsx';

vi.mock('../../../../react/entrypoints/equipamentosHeaderIsland.jsx', () => ({
  mountEquipamentosHeaderReact: vi.fn(() => 'mounted-header'),
  unmountEquipamentosHeaderReact: vi.fn((root) => {
    delete root.dataset.reactEquipamentosHeaderMounted;
  }),
}));

describe('bridges/headerBridge', () => {
  beforeEach(() => {
    clearBridgeState();
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('load header bridge usa dynamic import memoizado', async () => {
    const first = loadEquipamentosHeaderBridge();
    const second = loadEquipamentosHeaderBridge();

    expect(second).toBe(first);
    expect(getEquipamentosHeaderBridgePromise()).toBe(first);
    await first;
  });

  it('bridge carregada fica cacheada em bridgeState', async () => {
    const bridge = await loadEquipamentosHeaderBridge();

    expect(getEquipamentosHeaderBridge()).toBe(bridge);
    expect(bridge.mountEquipamentosHeaderReact).toBe(mountEquipamentosHeaderReact);
  });

  it('mount incrementa generation e monta quando generation ainda é atual', async () => {
    document.body.innerHTML = '<section id="equip-hero"></section><nav id="equip-filters"></nav>';
    const root = document.getElementById('equip-hero');
    const filtersRoot = document.getElementById('equip-filters');

    const result = await mountEquipamentosHeader({ root, filtersRoot, viewModel: { hero: {} } });

    expect(result).toBe('mounted-header');
    expect(getEquipamentosHeaderRenderGeneration()).toBe(1);
    expect(mountEquipamentosHeaderReact).toHaveBeenCalledWith(root, {
      viewModel: { hero: {} },
      filtersRoot,
      contextRoot: undefined,
    });
  });

  it('mount respeita generation guard e ignora mount stale', async () => {
    document.body.innerHTML = '<section id="equip-hero"></section>';
    const root = document.getElementById('equip-hero');

    const pendingMount = mountEquipamentosHeader({ root, viewModel: {} });
    unmountEquipamentosHeader();
    const result = await pendingMount;

    expect(result).toBeNull();
    expect(mountEquipamentosHeaderReact).not.toHaveBeenCalled();
  });

  it('unmount retorna null quando root não está montado', () => {
    document.body.innerHTML = '<section id="equip-hero"></section>';

    expect(unmountEquipamentosHeader()).toBeNull();
    expect(unmountEquipamentosHeaderReact).not.toHaveBeenCalled();
  });

  it('unmount usa bridge cache quando disponível', () => {
    document.body.innerHTML =
      '<section id="equip-hero" data-react-equipamentos-header-mounted="true"></section>';
    const root = document.getElementById('equip-hero');
    setEquipamentosHeaderBridge({ unmountEquipamentosHeaderReact });

    expect(unmountEquipamentosHeader()).toBeNull();

    expect(unmountEquipamentosHeaderReact).toHaveBeenCalledWith(root);
  });

  it('fallback async de unmount funciona quando bridge cache ainda não existe', async () => {
    document.body.innerHTML =
      '<section id="equip-hero" data-react-equipamentos-header-mounted="true"></section>';
    const root = document.getElementById('equip-hero');

    const result = await unmountEquipamentosHeader();

    expect(result).toBeNull();
    expect(unmountEquipamentosHeaderReact).toHaveBeenCalledWith(root);
  });
});
