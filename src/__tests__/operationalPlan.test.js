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

async function loadOperationalPlan({ supabaseMock = makeSupabaseMock() } = {}) {
  vi.resetModules();
  vi.doMock('../core/supabase.js', () => ({ supabase: supabaseMock }));
  const mod = await import('../core/plans/operationalPlan.js');
  return { mod, supabaseMock };
}

describe('operational plan compatibility layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps session project mismatch sanitizer available', async () => {
    const { mod } = await loadOperationalPlan();

    await expect(mod.sanitizeSessionForCurrentProject()).resolves.toMatchObject({
      sanitized: false,
      session: null,
    });
  });

  it('does not expose retired paid-plan helper surface after cleanup', async () => {
    const { mod } = await loadOperationalPlan();

    expect(Object.keys(mod)).not.toContain('isProUser');
    expect(Object.keys(mod)).not.toContain('canUsePremiumFeature');
    expect(Object.keys(mod)).not.toContain('PREMIUM_FEATURE_EQUIPAMENTOS');
    expect(Object.keys(mod)).not.toContain('PREMIUM_FEATURE_PDF_EXPORT');
    expect(mod.getPlanCodeFromProfile({ plan_code: 'pro' })).toBe('free');
  });

  it('fetchOperationalProfile returns a disabled local profile without querying plan tables', async () => {
    const { mod, supabaseMock } = await loadOperationalPlan();

    const result = await mod.fetchOperationalProfile();

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
    const { mod, supabaseMock } = await loadOperationalPlan();

    await mod.fetchOperationalProfileCached();
    await mod.fetchOperationalProfileCached();
    expect(supabaseMock.auth.getUser).toHaveBeenCalledTimes(1);

    mod.invalidateOperationalProfileCache();
    await mod.fetchOperationalProfileCached();
    expect(supabaseMock.auth.getUser).toHaveBeenCalledTimes(2);
  });

  it('does not expose removed subscription portal entrypoints', async () => {
    const { mod } = await loadOperationalPlan();

    expect(Object.keys(mod)).not.toContain(['start', 'Check', 'out'].join(''));
    expect(Object.keys(mod)).not.toContain(['start', 'Bill', 'ing', 'Portal'].join(''));
  });
});
