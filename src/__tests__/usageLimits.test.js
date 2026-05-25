import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadUsageLimits({
  usageRows = [],
  selectError = null,
  rpcData = 3,
  rpcError = null,
} = {}) {
  vi.resetModules();

  const eqMonth = vi.fn().mockResolvedValue({ data: usageRows, error: selectError });
  const eqUser = vi.fn(() => ({ eq: eqMonth }));
  const select = vi.fn(() => ({ eq: eqUser }));
  const from = vi.fn(() => ({ select }));
  const rpc = vi.fn().mockResolvedValue({ data: rpcData, error: rpcError });

  vi.doMock('../core/supabase.js', () => ({
    supabase: { from, rpc },
  }));

  const module = await import('../core/usageLimits.js');
  return { ...module, mocks: { eqMonth, eqUser, select, from, rpc } };
}

describe('usageLimits', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps only the operational nameplate resource while plan gates are disabled', async () => {
    const { getMonthlyLimitForPlan, hasReachedMonthlyLimit, USAGE_RESOURCE_NAMEPLATE_ANALYSIS } =
      await loadUsageLimits();

    expect(getMonthlyLimitForPlan('free', USAGE_RESOURCE_NAMEPLATE_ANALYSIS)).toBe(
      Number.POSITIVE_INFINITY,
    );
    expect(getMonthlyLimitForPlan('plus', USAGE_RESOURCE_NAMEPLATE_ANALYSIS)).toBe(
      Number.POSITIVE_INFINITY,
    );
    expect(getMonthlyLimitForPlan('pro', USAGE_RESOURCE_NAMEPLATE_ANALYSIS)).toBe(
      Number.POSITIVE_INFINITY,
    );
    expect(
      hasReachedMonthlyLimit({
        planCode: 'free',
        resource: USAGE_RESOURCE_NAMEPLATE_ANALYSIS,
        usedCount: 10_000,
      }),
    ).toBe(false);
  });

  it('rejects removed PDF and WhatsApp quota resources', async () => {
    const { getMonthlyLimitForPlan } = await loadUsageLimits();

    expect(() => getMonthlyLimitForPlan('free', 'pdf_export')).toThrow(
      'Unsupported usage resource: pdf_export',
    );
    expect(() => getMonthlyLimitForPlan('free', 'whatsapp_share')).toThrow(
      'Unsupported usage resource: whatsapp_share',
    );
  });

  it('loads monthly usage snapshot from Supabase', async () => {
    const { getMonthlyUsageSnapshot, mocks } = await loadUsageLimits({
      usageRows: [
        { resource: 'pdf_export', used_count: 2 },
        { resource: 'whatsapp_share', used_count: 4 },
        { resource: 'nameplate_analysis', used_count: 5 },
      ],
    });

    const snapshot = await getMonthlyUsageSnapshot('user-1', { monthStart: '2026-04-01' });

    expect(snapshot).not.toHaveProperty('pdf_export');
    expect(snapshot).not.toHaveProperty('whatsapp_share');
    expect(snapshot.nameplate_analysis).toBe(5);
    expect(mocks.from).toHaveBeenCalledWith('usage_monthly');
    expect(mocks.eqUser).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mocks.eqMonth).toHaveBeenCalledWith('month_start', '2026-04-01');
  });

  it('increments usage via rpc helper', async () => {
    const { incrementMonthlyUsage, USAGE_RESOURCE_NAMEPLATE_ANALYSIS, mocks } =
      await loadUsageLimits({
        rpcData: 3,
      });

    const count = await incrementMonthlyUsage('user-1', USAGE_RESOURCE_NAMEPLATE_ANALYSIS, {
      monthStart: '2026-04-01',
    });

    expect(count).toBe(3);
    expect(mocks.rpc).toHaveBeenCalledWith('increment_monthly_usage', {
      p_user_id: 'user-1',
      p_resource: USAGE_RESOURCE_NAMEPLATE_ANALYSIS,
      p_month_start: '2026-04-01',
      p_delta: 1,
    });
  });
});
