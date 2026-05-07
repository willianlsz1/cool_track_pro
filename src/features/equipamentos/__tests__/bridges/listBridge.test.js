import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  loadEquipamentosListBridge,
  mountEquipamentosList,
  unmountEquipamentosList,
} from '../../bridges/listBridge.js';
import {
  clearBridgeState,
  getEquipamentosListBridge,
  getEquipamentosListBridgePromise,
  getEquipamentosListRenderGeneration,
  setEquipamentosListBridge,
} from '../../state/bridgeState.js';
import {
  mountEquipamentosListReact,
  unmountEquipamentosListReact,
} from '../../../../react/entrypoints/equipamentosListIsland.jsx';

vi.mock('../../../../react/entrypoints/equipamentosListIsland.jsx', () => ({
  mountEquipamentosListReact: vi.fn(() => 'mounted-list'),
  unmountEquipamentosListReact: vi.fn((root) => {
    delete root.dataset.reactEquipamentosListMounted;
  }),
}));

describe('bridges/listBridge', () => {
  beforeEach(() => {
    clearBridgeState();
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('load list bridge usa dynamic import memoizado', async () => {
    const first = loadEquipamentosListBridge();
    const second = loadEquipamentosListBridge();

    expect(second).toBe(first);
    expect(getEquipamentosListBridgePromise()).toBe(first);
    await first;
  });

  it('bridge carregada fica cacheada em bridgeState', async () => {
    const bridge = await loadEquipamentosListBridge();

    expect(getEquipamentosListBridge()).toBe(bridge);
    expect(bridge.mountEquipamentosListReact).toBe(mountEquipamentosListReact);
  });

  it('mount/list render incrementa generation, monta e chama onMounted após mount', async () => {
    document.body.innerHTML = '<div id="lista-equip"></div>';
    const root = document.getElementById('lista-equip');
    const onMounted = vi.fn();

    const result = await mountEquipamentosList({ root, viewModel: { cards: [] }, onMounted });

    expect(result).toBe('mounted-list');
    expect(getEquipamentosListRenderGeneration()).toBe(1);
    expect(mountEquipamentosListReact).toHaveBeenCalledWith(root, { viewModel: { cards: [] } });
    expect(onMounted).toHaveBeenCalledTimes(1);
  });

  it('mount/list render respeita generation guard e ignora mount stale', async () => {
    document.body.innerHTML = '<div id="lista-equip"></div>';
    const root = document.getElementById('lista-equip');
    const onMounted = vi.fn();

    const pendingMount = mountEquipamentosList({ root, viewModel: {}, onMounted });
    unmountEquipamentosList();
    const result = await pendingMount;

    expect(result).toBeNull();
    expect(mountEquipamentosListReact).not.toHaveBeenCalled();
    expect(onMounted).not.toHaveBeenCalled();
  });

  it('unmount retorna null quando root não está montado', () => {
    document.body.innerHTML = '<div id="lista-equip"></div>';

    expect(unmountEquipamentosList()).toBeNull();
    expect(unmountEquipamentosListReact).not.toHaveBeenCalled();
  });

  it('unmount usa bridge cache quando disponível', () => {
    document.body.innerHTML =
      '<div id="lista-equip" data-react-equipamentos-list-mounted="true"></div>';
    const root = document.getElementById('lista-equip');
    setEquipamentosListBridge({ unmountEquipamentosListReact });

    expect(unmountEquipamentosList()).toBeNull();

    expect(unmountEquipamentosListReact).toHaveBeenCalledWith(root);
  });

  it('fallback async de unmount funciona quando bridge cache ainda não existe', async () => {
    document.body.innerHTML =
      '<div id="lista-equip" data-react-equipamentos-list-mounted="true"></div>';
    const root = document.getElementById('lista-equip');

    const result = await unmountEquipamentosList();

    expect(result).toBeNull();
    expect(unmountEquipamentosListReact).toHaveBeenCalledWith(root);
  });
});
