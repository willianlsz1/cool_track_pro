import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  bindRenderEquipPlanInvalidationEvents,
  configureRenderEquipPlan,
  refreshRenderEquipPlan,
} from '../../bridges/renderPlan.js';
import {
  clearRenderPlanState,
  getRenderEquipPlanNeedsRefresh,
  getRenderEquipPlanRefreshPromise,
  incrementRenderEquipPlanToken,
  setRenderEquipPlanNeedsRefresh,
  setRenderEquipPlanRefreshPromise,
} from '../../state/renderPlanState.js';
import { fetchOperationalProfileCached } from '../../../../core/plans/monetization.js';
import { hasProAccess } from '../../../../core/plans/subscriptionPlans.js';

vi.mock('../../../../core/plans/monetization.js', () => ({
  fetchOperationalProfileCached: vi.fn(),
}));

vi.mock('../../../../core/plans/planCache.js', () => ({
  setCachedPlan: vi.fn(),
}));

vi.mock('../../../../core/plans/subscriptionPlans.js', () => ({
  getEffectivePlan: vi.fn((profile) => profile?.plan ?? 'free'),
  hasProAccess: vi.fn((profile) => profile?.plan === 'pro'),
}));

describe('bridges/renderPlan', () => {
  beforeEach(() => {
    clearRenderPlanState();
    configureRenderEquipPlan({ renderEquip: vi.fn() });
    vi.clearAllMocks();
  });

  it('binda eventos de invalidação uma única vez', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');

    bindRenderEquipPlanInvalidationEvents();
    bindRenderEquipPlanInvalidationEvents();

    expect(addEventListener).toHaveBeenCalledTimes(3);
    expect(addEventListener).toHaveBeenCalledWith('cooltrack:auth-changed', expect.any(Function));
    expect(addEventListener).toHaveBeenCalledWith(
      'cooltrack:profile-updated',
      expect.any(Function),
    );
    expect(addEventListener).toHaveBeenCalledWith('cooltrack:plan-changed', expect.any(Function));
  });

  it('eventos de auth/profile/plan marcam needsRefresh true', () => {
    bindRenderEquipPlanInvalidationEvents();

    for (const eventName of [
      'cooltrack:auth-changed',
      'cooltrack:profile-updated',
      'cooltrack:plan-changed',
    ]) {
      setRenderEquipPlanNeedsRefresh(false);
      window.dispatchEvent(new Event(eventName));
      expect(getRenderEquipPlanNeedsRefresh()).toBe(true);
    }
  });

  it('não inicia nova promise se já há refresh em andamento', () => {
    const activePromise = new Promise(() => {});
    setRenderEquipPlanRefreshPromise(activePromise);

    refreshRenderEquipPlan({ renderToken: 1 });

    expect(fetchOperationalProfileCached).not.toHaveBeenCalled();
    expect(getRenderEquipPlanRefreshPromise()).toBe(activePromise);
  });

  it('limpa refreshPromise no finally', async () => {
    fetchOperationalProfileCached.mockResolvedValue({ profile: { plan: 'free' } });

    refreshRenderEquipPlan({ renderToken: incrementRenderEquipPlanToken() });
    await getRenderEquipPlanRefreshPromise();

    expect(getRenderEquipPlanRefreshPromise()).toBeNull();
  });

  it('preserva fallback silencioso em erro', async () => {
    fetchOperationalProfileCached.mockRejectedValue(new Error('billing unavailable'));

    refreshRenderEquipPlan({ renderToken: incrementRenderEquipPlanToken() });
    await expect(getRenderEquipPlanRefreshPromise()).resolves.toBeUndefined();

    expect(getRenderEquipPlanRefreshPromise()).toBeNull();
  });

  it('chama renderEquip com __skipPlanRefresh true quando Pro access muda e token ainda é atual', async () => {
    const renderEquip = vi.fn();
    configureRenderEquipPlan({ renderEquip });
    fetchOperationalProfileCached.mockResolvedValue({ profile: { plan: 'pro' } });

    refreshRenderEquipPlan({
      filtro: 'split',
      options: { clienteId: 'cli-1' },
      renderToken: incrementRenderEquipPlanToken(),
      isProAtRender: false,
    });
    await getRenderEquipPlanRefreshPromise();

    expect(hasProAccess).toHaveBeenCalledWith({ plan: 'pro' });
    expect(renderEquip).toHaveBeenCalledWith('split', {
      clienteId: 'cli-1',
      __skipPlanRefresh: true,
    });
  });

  it('não chama renderEquip quando token está stale', async () => {
    const renderEquip = vi.fn();
    configureRenderEquipPlan({ renderEquip });
    fetchOperationalProfileCached.mockResolvedValue({ profile: { plan: 'pro' } });
    const staleToken = incrementRenderEquipPlanToken();
    incrementRenderEquipPlanToken();

    refreshRenderEquipPlan({ renderToken: staleToken, isProAtRender: false });
    await getRenderEquipPlanRefreshPromise();

    expect(renderEquip).not.toHaveBeenCalled();
  });
});
