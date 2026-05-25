import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadClientesAccess() {
  vi.resetModules();
  return import('../core/plans/clientesAccess.js');
}

describe('clientesAccess', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('mantem acesso a Clientes resolvido pelo padrao operacional', async () => {
    const { getClientesAccessSnapshot, resolveClientesAccess } = await loadClientesAccess();

    expect(getClientesAccessSnapshot()).toMatchObject({
      resolved: true,
      source: 'operational_default',
      errored: false,
      planCode: 'free',
      canAccess: true,
    });
    await expect(resolveClientesAccess()).resolves.toMatchObject({
      resolved: true,
      source: 'operational_default',
      canAccess: true,
    });
  });

  it('mantem criacao de clientes sem limite nesta etapa', async () => {
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
