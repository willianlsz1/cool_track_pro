import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  loadEquipamentosListBridge,
  mountEquipamentosList,
  unmountEquipamentosList,
} from '../../ui/views/equipamentos/bridges/listBridge.js';
import {
  clearBridgeState,
  getEquipamentosListBridge,
  getEquipamentosListBridgePromise,
  getEquipamentosListRenderGeneration,
  setEquipamentosListBridge,
} from '../../ui/views/equipamentos/state/bridgeState.js';
import {
  mountEquipamentosListDom,
  unmountEquipamentosListDom,
} from '../../ui/views/equipamentos/ui/listRenderer.js';

vi.mock('../../ui/views/equipamentos/ui/listRenderer.js', () => ({
  mountEquipamentosListDom: vi.fn(() => 'mounted-list'),
  unmountEquipamentosListDom: vi.fn((root) => {
    delete root.dataset.equipamentosListMounted;
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
    expect(bridge.mountEquipamentosListDom).toBe(mountEquipamentosListDom);
  });

  it('mount/list render incrementa generation, monta e chama onMounted após mount', async () => {
    document.body.innerHTML = '<div id="lista-equip"></div>';
    const root = document.getElementById('lista-equip');
    const onMounted = vi.fn();

    const result = await mountEquipamentosList({ root, viewModel: { cards: [] }, onMounted });

    expect(result).toBe('mounted-list');
    expect(getEquipamentosListRenderGeneration()).toBe(1);
    expect(mountEquipamentosListDom).toHaveBeenCalledWith(root, { viewModel: { cards: [] } });
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
    expect(mountEquipamentosListDom).not.toHaveBeenCalled();
    expect(onMounted).not.toHaveBeenCalled();
  });

  it('unmount retorna null quando root não está montado', () => {
    document.body.innerHTML = '<div id="lista-equip"></div>';

    expect(unmountEquipamentosList()).toBeNull();
    expect(unmountEquipamentosListDom).not.toHaveBeenCalled();
  });

  it('unmount usa bridge cache quando disponível', () => {
    document.body.innerHTML = '<div id="lista-equip" data-equipamentos-list-mounted="true"></div>';
    const root = document.getElementById('lista-equip');
    setEquipamentosListBridge({ unmountEquipamentosListDom });

    expect(unmountEquipamentosList()).toBeNull();

    expect(unmountEquipamentosListDom).toHaveBeenCalledWith(root);
  });

  it('fallback async de unmount funciona quando bridge cache ainda não existe', async () => {
    document.body.innerHTML = '<div id="lista-equip" data-equipamentos-list-mounted="true"></div>';
    const root = document.getElementById('lista-equip');

    const result = await unmountEquipamentosList();

    expect(result).toBeNull();
    expect(unmountEquipamentosListDom).toHaveBeenCalledWith(root);
  });

  it('usa renderer DOM da lista em vez da ilha React legada', () => {
    const bridgeSource = readFileSync('src/ui/views/equipamentos/bridges/listBridge.js', 'utf8');

    expect(bridgeSource).toContain('../ui/listRenderer.js');
    expect(bridgeSource).not.toContain('../../../react/entrypoints/equipamentosListIsland.jsx');
    expect(bridgeSource).not.toContain(['mountEquipamentos', 'ListReact'].join(''));
    expect(bridgeSource).not.toContain(['unmountEquipamentos', 'ListReact'].join(''));
  });
});
