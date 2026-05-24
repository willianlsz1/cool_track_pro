import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadClientesAccess() {
  vi.resetModules();
  return import('../core/plans/clientesAccess.js');
}

describe('clientesAccess', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('mantem acesso a Clientes resolvido sem depender de billing', async () => {
    const { getClientesAccessSnapshot, resolveClientesAccess } = await loadClientesAccess();

    expect(getClientesAccessSnapshot()).toMatchObject({
      resolved: true,
      source: 'billing_disabled',
      errored: false,
      planCode: 'free',
      canAccess: true,
    });
    await expect(resolveClientesAccess()).resolves.toMatchObject({
      resolved: true,
      source: 'billing_disabled',
      canAccess: true,
    });
  });

  it('remove limite comercial de criacao de clientes', async () => {
    const { canCreateCliente } = await loadClientesAccess();

    expect(canCreateCliente({ planCode: 'free', currentClientesCount: 10_000 })).toMatchObject({
      allowed: true,
      limit: Number.POSITIVE_INFINITY,
      current: 10_000,
      planCode: 'free',
      requiredPlan: null,
    });
  });

  it('mantem edicao liberada', async () => {
    const { canCreateCliente } = await loadClientesAccess();

    expect(
      canCreateCliente({ planCode: 'free', currentClientesCount: 1, isEditing: true }),
    ).toMatchObject({
      allowed: true,
      limit: Number.POSITIVE_INFINITY,
      current: 1,
      planCode: 'free',
    });
  });
});
