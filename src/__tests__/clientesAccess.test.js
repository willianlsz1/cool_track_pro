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

  it('mantem hidratacao pendente quando cache e free sem bloquear acesso a rota', async () => {
    localStorage.setItem('ct:anon:cooltrack-cached-plan', 'free');
    getCachedBillingProfileSnapshot.mockReturnValue(null);

    const { getClientesAccessSnapshot } = await import('../core/plans/clientesAccess.js');
    const decision = getClientesAccessSnapshot();

    expect(decision.resolved).toBe(false);
    expect(decision.planCode).toBe('free');
    expect(decision.canAccess).toBe(true);
  });

  it('resolve acesso free via billing fetch e sincroniza cache', async () => {
    localStorage.setItem('ct:anon:cooltrack-cached-plan', 'free');
    getCachedBillingProfileSnapshot.mockReturnValue(null);
    fetchMyProfileBillingCached.mockResolvedValue({
      profile: { plan_code: 'free', subscription_status: null },
    });

    const { resolveClientesAccess } = await import('../core/plans/clientesAccess.js');
    const decision = await resolveClientesAccess();

    expect(decision.resolved).toBe(true);
    expect(decision.planCode).toBe('free');
    expect(decision.canAccess).toBe(true);
    expect(localStorage.getItem('cooltrack-cached-plan')).toBeNull();
    expect(localStorage.getItem('ct:anon:cooltrack-cached-plan')).toBe('free');
  });

  it('nao impede a rota quando refresh falha com cache free nao hidratado', async () => {
    localStorage.setItem('ct:anon:cooltrack-cached-plan', 'free');
    getCachedBillingProfileSnapshot.mockReturnValue(null);
    fetchMyProfileBillingCached.mockRejectedValue(new Error('network'));

    const { resolveClientesAccess } = await import('../core/plans/clientesAccess.js');
    const decision = await resolveClientesAccess();

    expect(decision.resolved).toBe(false);
    expect(decision.errored).toBe(true);
    expect(decision.planCode).toBe('free');
    expect(decision.canAccess).toBe(true);
  });

  it('limita criacao de clientes no Free e libera pagos', async () => {
    const { canCreateCliente } = await import('../core/plans/clientesAccess.js');

    expect(canCreateCliente({ planCode: 'free', currentClientesCount: 0 })).toMatchObject({
      allowed: true,
      limit: 1,
      current: 0,
      planCode: 'free',
    });
    expect(canCreateCliente({ planCode: 'free', currentClientesCount: 1 })).toMatchObject({
      allowed: false,
      limit: 1,
      current: 1,
      planCode: 'free',
      requiredPlan: 'plus',
    });
    expect(canCreateCliente({ planCode: 'plus', currentClientesCount: 1 }).allowed).toBe(true);
    expect(canCreateCliente({ planCode: 'pro', currentClientesCount: 100 }).allowed).toBe(true);
  });

  it('permite editar cliente existente mesmo no Free acima do limite', async () => {
    const { canCreateCliente } = await import('../core/plans/clientesAccess.js');

    expect(
      canCreateCliente({ planCode: 'free', currentClientesCount: 1, isEditing: true }),
    ).toMatchObject({
      allowed: true,
      limit: 1,
      current: 1,
      planCode: 'free',
    });
  });
});
