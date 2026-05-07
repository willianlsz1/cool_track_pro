import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearRenderEquipPlanRefreshPromise,
  clearRenderPlanState,
  getRenderEquipPlanEventsBound,
  getRenderEquipPlanNeedsRefresh,
  getRenderEquipPlanRefreshPromise,
  getRenderEquipPlanToken,
  incrementRenderEquipPlanToken,
  setRenderEquipPlanEventsBound,
  setRenderEquipPlanNeedsRefresh,
  setRenderEquipPlanRefreshPromise,
} from '../../state/renderPlanState.js';

describe('state/renderPlanState', () => {
  beforeEach(() => {
    clearRenderPlanState();
  });

  it('começa com token zerado, needsRefresh true, eventsBound false e promise null', () => {
    expect(getRenderEquipPlanToken()).toBe(0);
    expect(getRenderEquipPlanNeedsRefresh()).toBe(true);
    expect(getRenderEquipPlanEventsBound()).toBe(false);
    expect(getRenderEquipPlanRefreshPromise()).toBeNull();
  });

  it('incrementa token e retorna o novo valor', () => {
    expect(incrementRenderEquipPlanToken()).toBe(1);
    expect(incrementRenderEquipPlanToken()).toBe(2);
    expect(getRenderEquipPlanToken()).toBe(2);
  });

  it('faz set/get de needsRefresh', () => {
    setRenderEquipPlanNeedsRefresh(false);
    expect(getRenderEquipPlanNeedsRefresh()).toBe(false);

    setRenderEquipPlanNeedsRefresh(true);
    expect(getRenderEquipPlanNeedsRefresh()).toBe(true);
  });

  it('faz set/get de eventsBound', () => {
    setRenderEquipPlanEventsBound(true);
    expect(getRenderEquipPlanEventsBound()).toBe(true);

    setRenderEquipPlanEventsBound(false);
    expect(getRenderEquipPlanEventsBound()).toBe(false);
  });

  it('faz set/get/clear da refreshPromise', () => {
    const promise = Promise.resolve({});

    setRenderEquipPlanRefreshPromise(promise);
    expect(getRenderEquipPlanRefreshPromise()).toBe(promise);

    clearRenderEquipPlanRefreshPromise();
    expect(getRenderEquipPlanRefreshPromise()).toBeNull();
  });

  it('clearRenderPlanState reseta todo o estado', () => {
    incrementRenderEquipPlanToken();
    setRenderEquipPlanNeedsRefresh(false);
    setRenderEquipPlanEventsBound(true);
    setRenderEquipPlanRefreshPromise(Promise.resolve({}));

    clearRenderPlanState();

    expect(getRenderEquipPlanToken()).toBe(0);
    expect(getRenderEquipPlanNeedsRefresh()).toBe(true);
    expect(getRenderEquipPlanEventsBound()).toBe(false);
    expect(getRenderEquipPlanRefreshPromise()).toBeNull();
  });
});
