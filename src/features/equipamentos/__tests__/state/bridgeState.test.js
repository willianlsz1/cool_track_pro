import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearBridgeState,
  clearEquipamentosHeaderBridge,
  clearEquipamentosHeaderBridgePromise,
  clearEquipamentosListBridge,
  clearEquipamentosListBridgePromise,
  getEquipamentosHeaderBridge,
  getEquipamentosHeaderBridgePromise,
  getEquipamentosHeaderRenderGeneration,
  getEquipamentosListBridge,
  getEquipamentosListBridgePromise,
  getEquipamentosListRenderGeneration,
  incrementEquipamentosHeaderRenderGeneration,
  incrementEquipamentosListRenderGeneration,
  setEquipamentosHeaderBridge,
  setEquipamentosHeaderBridgePromise,
  setEquipamentosListBridge,
  setEquipamentosListBridgePromise,
} from '../../state/bridgeState.js';

describe('state/bridgeState', () => {
  beforeEach(() => {
    clearBridgeState();
  });

  it('começa com promises null e generations zeradas', () => {
    expect(getEquipamentosHeaderBridgePromise()).toBeNull();
    expect(getEquipamentosListBridgePromise()).toBeNull();
    expect(getEquipamentosHeaderRenderGeneration()).toBe(0);
    expect(getEquipamentosListRenderGeneration()).toBe(0);
  });

  it('faz set/get/clear da header promise', () => {
    const promise = Promise.resolve({});

    setEquipamentosHeaderBridgePromise(promise);
    expect(getEquipamentosHeaderBridgePromise()).toBe(promise);

    clearEquipamentosHeaderBridgePromise();
    expect(getEquipamentosHeaderBridgePromise()).toBeNull();
  });

  it('faz set/get/clear da list promise', () => {
    const promise = Promise.resolve({});

    setEquipamentosListBridgePromise(promise);
    expect(getEquipamentosListBridgePromise()).toBe(promise);

    clearEquipamentosListBridgePromise();
    expect(getEquipamentosListBridgePromise()).toBeNull();
  });

  it('faz set/get/clear do header bridge', () => {
    const bridge = { mountEquipamentosHeader() {} };

    setEquipamentosHeaderBridge(bridge);
    expect(getEquipamentosHeaderBridge()).toBe(bridge);

    clearEquipamentosHeaderBridge();
    expect(getEquipamentosHeaderBridge()).toBeNull();
  });

  it('faz set/get/clear do list bridge', () => {
    const bridge = { mountEquipamentosListReact() {} };

    setEquipamentosListBridge(bridge);
    expect(getEquipamentosListBridge()).toBe(bridge);

    clearEquipamentosListBridge();
    expect(getEquipamentosListBridge()).toBeNull();
  });

  it('incrementa header generation e retorna o novo valor', () => {
    expect(incrementEquipamentosHeaderRenderGeneration()).toBe(1);
    expect(incrementEquipamentosHeaderRenderGeneration()).toBe(2);
    expect(getEquipamentosHeaderRenderGeneration()).toBe(2);
  });

  it('incrementa list generation e retorna o novo valor', () => {
    expect(incrementEquipamentosListRenderGeneration()).toBe(1);
    expect(incrementEquipamentosListRenderGeneration()).toBe(2);
    expect(getEquipamentosListRenderGeneration()).toBe(2);
  });

  it('mantém increments independentes', () => {
    incrementEquipamentosHeaderRenderGeneration();
    incrementEquipamentosHeaderRenderGeneration();
    incrementEquipamentosListRenderGeneration();

    expect(getEquipamentosHeaderRenderGeneration()).toBe(2);
    expect(getEquipamentosListRenderGeneration()).toBe(1);
  });

  it('clearBridgeState limpa caches/promises e reseta generations', () => {
    setEquipamentosHeaderBridgePromise(Promise.resolve({}));
    setEquipamentosListBridgePromise(Promise.resolve({}));
    setEquipamentosHeaderBridge({});
    setEquipamentosListBridge({});
    incrementEquipamentosHeaderRenderGeneration();
    incrementEquipamentosListRenderGeneration();

    clearBridgeState();

    expect(getEquipamentosHeaderBridgePromise()).toBeNull();
    expect(getEquipamentosListBridgePromise()).toBeNull();
    expect(getEquipamentosHeaderBridge()).toBeNull();
    expect(getEquipamentosListBridge()).toBeNull();
    expect(getEquipamentosHeaderRenderGeneration()).toBe(0);
    expect(getEquipamentosListRenderGeneration()).toBe(0);
  });
});
