import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMyProfileBillingCached = vi.fn();
const getCachedBillingProfileSnapshot = vi.fn();

vi.mock('../core/plans/monetization.js', () => ({
  fetchMyProfileBillingCached,
  getCachedBillingProfileSnapshot,
}));

describe('clientesAccess', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    fetchMyProfileBillingCached.mockReset();
    getCachedBillingProfileSnapshot.mockReset();
  });

  it('não bloqueia imediatamente quando cache é free e plano não hidratou na sessão', async () => {
    localStorage.setItem('cooltrack-cached-plan', 'free');
    getCachedBillingProfileSnapshot.mockReturnValue(null);

    const { getClientesAccessSnapshot } = await import('../core/plans/clientesAccess.js');
    const decision = getClientesAccessSnapshot();

    expect(decision.resolved).toBe(false);
    expect(decision.planCode).toBe('free');
    expect(decision.canAccess).toBe(false);
  });

  it('resolve acesso pro via billing fetch e sincroniza cache', async () => {
    localStorage.setItem('cooltrack-cached-plan', 'free');
    getCachedBillingProfileSnapshot.mockReturnValue(null);
    fetchMyProfileBillingCached.mockResolvedValue({
      profile: { plan_code: 'pro', subscription_status: 'active' },
    });

    const { resolveClientesAccess } = await import('../core/plans/clientesAccess.js');
    const decision = await resolveClientesAccess();

    expect(decision.resolved).toBe(true);
    expect(decision.planCode).toBe('pro');
    expect(decision.canAccess).toBe(true);
    expect(localStorage.getItem('cooltrack-cached-plan')).toBe('pro');
  });
});
