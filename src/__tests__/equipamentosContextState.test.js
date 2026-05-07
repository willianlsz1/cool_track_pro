import { beforeEach, describe, expect, it, vi } from 'vitest';

const currentRoute = vi.fn(() => 'equipamentos');
const currentRouteParams = vi.fn(() => ({}));
const goTo = vi.fn();

vi.mock('../core/router.js', () => ({
  currentRoute,
  currentRouteParams,
  goTo,
}));

describe('equipamentos/contextState', () => {
  beforeEach(() => {
    currentRoute.mockReturnValue('equipamentos');
    currentRouteParams.mockReturnValue({});
    goTo.mockClear();
  });

  it('getActiveQuickFilter retorna o quickFilter normalizado da rota', async () => {
    currentRouteParams.mockReturnValue({ equipCtx: { quickFilter: 'criticos', sectorId: 's-1' } });

    const { getActiveQuickFilter } = await import('../ui/views/equipamentos/contextState.js');

    expect(getActiveQuickFilter()).toBe('criticos');
  });

  it('getActiveQuickFilter normaliza todos/vazio para null', async () => {
    currentRouteParams.mockReturnValue({ equipCtx: { quickFilter: 'todos' } });

    const { getActiveQuickFilter } = await import('../ui/views/equipamentos/contextState.js');

    expect(getActiveQuickFilter()).toBeNull();
  });
});
