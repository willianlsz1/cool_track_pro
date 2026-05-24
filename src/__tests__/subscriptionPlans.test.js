import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadSubscriptionPlans({ profile = { plan: 'pro' }, error = null } = {}) {
  vi.resetModules();

  const maybeSingle = vi.fn().mockResolvedValue({ data: profile, error });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  vi.doMock('../core/supabase.js', () => ({
    supabase: { from },
  }));

  const module = await import('../core/plans/subscriptionPlans.js');
  return { ...module, mocks: { maybeSingle, eq, select, from } };
}

describe('subscriptionPlans', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps legacy plan codes normalized for compatibility', async () => {
    const { normalizePlanCode, PLAN_CODE_FREE, PLAN_CODE_PRO } = await loadSubscriptionPlans();

    expect(normalizePlanCode('enterprise')).toBe(PLAN_CODE_FREE);
    expect(normalizePlanCode(PLAN_CODE_PRO)).toBe(PLAN_CODE_PRO);
  });

  it('resolves every effective plan to the non-commercial operational plan', async () => {
    const { getEffectivePlan, PLAN_CODE_FREE } = await loadSubscriptionPlans();

    expect(getEffectivePlan({ is_dev: true })).toBe(PLAN_CODE_FREE);
    expect(getEffectivePlan({ plan: 'pro', subscription_status: 'active' })).toBe(PLAN_CODE_FREE);
    expect(getEffectivePlan({ plan_code: 'pro', subscription_status: 'trialing' })).toBe(
      PLAN_CODE_FREE,
    );
    expect(getEffectivePlan(null)).toBe(PLAN_CODE_FREE);
  });

  it('keeps legacy access helpers open while billing is disabled', async () => {
    const { assertProAccess, hasProAccess, hasPlusAccess, assertFeature, hasFeature } =
      await loadSubscriptionPlans();

    expect(hasProAccess({ plan: 'free' })).toBe(true);
    expect(hasPlusAccess({ plan: 'free' })).toBe(true);
    expect(hasFeature(null, 'setores')).toBe(true);
    expect(() => assertProAccess(null, 'premium_feature')).not.toThrow();
    expect(assertFeature(null, 'setores')).toMatchObject({ allowed: true, planCode: 'free' });
  });

  it('removes commercial equipment limits', async () => {
    const { canCreateEquipment } = await loadSubscriptionPlans();

    expect(canCreateEquipment({ plan: 'free' }, 10_000)).toMatchObject({
      allowed: true,
      limit: Number.POSITIVE_INFINITY,
      current: 10_000,
      planCode: 'free',
    });
  });

  it('keeps a non-commercial catalog for callers that still read plan metadata', async () => {
    const { PLAN_CATALOG, PLAN_CODE_FREE, PLAN_CODE_PLUS, PLAN_CODE_PRO } =
      await loadSubscriptionPlans();

    expect(PLAN_CATALOG[PLAN_CODE_FREE].label).toBe('Operacional');
    expect(PLAN_CATALOG[PLAN_CODE_FREE].perks).toContain(
      'Planos pagos removidos ate etapa propria',
    );
    expect(PLAN_CATALOG[PLAN_CODE_PLUS].limits.equipamentos).toBe(Number.POSITIVE_INFINITY);
    expect(PLAN_CATALOG[PLAN_CODE_PRO].limits.clientes).toBe(Number.POSITIVE_INFINITY);
  });

  it('can still read profile rows, but plan code stays operational', async () => {
    const { getPlanProfileForUserId, getPlanCodeForUserId, PLAN_CODE_FREE, mocks } =
      await loadSubscriptionPlans({
        profile: { plan: 'pro', subscription_status: 'active', is_dev: false },
      });

    await expect(getPlanProfileForUserId('user-1')).resolves.toMatchObject({ plan: 'pro' });
    await expect(getPlanCodeForUserId('user-1')).resolves.toBe(PLAN_CODE_FREE);
    expect(mocks.from).toHaveBeenCalledWith('profiles');
  });
});
