import { beforeEach, describe, expect, it, vi } from 'vitest';

function makeSupabaseMock() {
  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      signOut: vi.fn(async () => ({})),
      getUser: vi.fn(async () => ({
        data: { user: { id: 'user-1', email: 'user@test.local' } },
        error: null,
      })),
    },
  };
}

async function loadMonetization({ supabaseMock = makeSupabaseMock() } = {}) {
  vi.resetModules();
  vi.doMock('../core/supabase.js', () => ({ supabase: supabaseMock }));
  const mod = await import('../core/plans/monetization.js');
  return { mod, supabaseMock };
}

describe('monetization disabled compatibility layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps session project mismatch sanitizer available', async () => {
    const { mod } = await loadMonetization();

    await expect(mod.sanitizeSessionForCurrentProject()).resolves.toMatchObject({
      sanitized: false,
      session: null,
    });
  });

  it('keeps legacy premium helpers open while billing is disabled', async () => {
    const { mod } = await loadMonetization();

    expect(mod.isProUser({ plan_code: 'free' })).toBe(true);
    expect(mod.canUsePremiumFeature(null, mod.PREMIUM_FEATURE_EQUIPAMENTOS)).toBe(true);
    expect(mod.canUsePremiumFeature(null, mod.PREMIUM_FEATURE_PDF_EXPORT)).toBe(true);
    expect(mod.getPlanCodeFromProfile({ plan_code: 'pro' })).toBe('free');
  });

  it('fetchMyProfileBilling returns a disabled local profile without querying billing tables', async () => {
    const { mod, supabaseMock } = await loadMonetization();

    const result = await mod.fetchMyProfileBilling();

    expect(result.user.id).toBe('user-1');
    expect(result.profile).toMatchObject({
      id: 'user-1',
      plan: 'free',
      plan_code: 'free',
      subscription_status: 'disabled',
      is_dev: false,
    });
    expect(supabaseMock.auth.getUser).toHaveBeenCalledTimes(1);
  });

  it('caches the disabled profile snapshot until explicitly invalidated', async () => {
    const { mod, supabaseMock } = await loadMonetization();

    await mod.fetchMyProfileBillingCached();
    await mod.fetchMyProfileBillingCached();
    expect(supabaseMock.auth.getUser).toHaveBeenCalledTimes(1);

    mod.invalidateBillingProfileCache();
    await mod.fetchMyProfileBillingCached();
    expect(supabaseMock.auth.getUser).toHaveBeenCalledTimes(2);
  });

  it('commercial entrypoints are removed', async () => {
    const { mod } = await loadMonetization();

    await expect(mod.startCheckout()).rejects.toMatchObject({ code: 'COMMERCIAL_REMOVED' });
    await expect(mod.startBillingPortal()).rejects.toMatchObject({ code: 'COMMERCIAL_REMOVED' });
  });
});
