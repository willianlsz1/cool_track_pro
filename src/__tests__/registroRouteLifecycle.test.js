import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  registerRoute: vi.fn(),
  populateEquipSelects: vi.fn(),
  initRegistro: vi.fn(),
  loadRegistroForEdit: vi.fn(),
  unmountRegistroHeader: vi.fn(),
  updateHeader: vi.fn(),
}));

vi.mock('../core/router.js', () => ({
  currentRoute: vi.fn(() => 'registro'),
  registerRoute: mocks.registerRoute,
}));

vi.mock('../ui/views/dashboard.js', () => ({
  renderDashboard: vi.fn(),
  updateHeader: mocks.updateHeader,
}));

vi.mock('../ui/views/equipamentos.js', () => ({
  renderEquip: vi.fn(),
  populateEquipSelects: mocks.populateEquipSelects,
  unmountEquipamentosList: vi.fn(),
}));

vi.mock('../ui/views/historico.js', () => ({
  renderHist: vi.fn(),
  setHistClienteFilter: vi.fn(),
  clearHistClienteFilter: vi.fn(),
}));

vi.mock('../ui/views/alertas.js', () => ({
  renderAlertas: vi.fn(),
  unmountAlertas: vi.fn(),
}));

vi.mock('../ui/views/relatorio.js', () => ({
  renderRelatorio: vi.fn(),
  populateRelatorioSelects: vi.fn(),
  unmountRelatorioHero: vi.fn(),
  unmountRelatorioControls: vi.fn(),
  unmountRelatorioCards: vi.fn(),
}));

vi.mock('../ui/views/registro.js', () => ({
  initRegistro: mocks.initRegistro,
  loadRegistroForEdit: mocks.loadRegistroForEdit,
  unmountRegistroHeader: mocks.unmountRegistroHeader,
}));

vi.mock('../ui/views/pricing.js', () => ({ renderPricing: vi.fn() }));
vi.mock('../ui/views/clientes.js', () => ({
  renderClientes: vi.fn(),
  setClientesSearch: vi.fn(),
  unmountClientes: vi.fn(),
}));
vi.mock('../ui/views/conta.js', () => ({ renderConta: vi.fn() }));
vi.mock('../ui/views/privacidade.js', () => ({ renderPrivacidade: vi.fn() }));
vi.mock('../ui/components/clientesPaywallModal.js', () => ({
  ClientesPaywallModal: { open: vi.fn() },
}));
vi.mock('../core/plans/clientesAccess.js', () => ({
  getClientesAccessSnapshot: vi.fn(() => ({ resolved: true, canAccess: true })),
  resolveClientesAccess: vi.fn(),
}));
vi.mock('../ui/components/onboarding/onboardingChecklist.js', () => ({
  OnboardingChecklist: { markStep: vi.fn() },
}));

function getRegistroRoute() {
  const call = mocks.registerRoute.mock.calls.find(([name]) => name === 'registro');
  if (!call) throw new Error('registro route was not registered');
  return { onEnter: call[1], onLeave: call[2] };
}

describe('registro route lifecycle', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((mock) => mock.mockClear?.());
  });

  it('unmounts the React header island when leaving registro', async () => {
    const { registerAppRoutes } = await import('../ui/controller/routes.js');
    registerAppRoutes();
    const route = getRegistroRoute();

    route.onEnter({ equipId: 'eq-1' });
    route.onLeave();
    route.onEnter({ editRegistroId: 'reg-1' });

    expect(mocks.populateEquipSelects).toHaveBeenCalledTimes(2);
    expect(mocks.initRegistro).toHaveBeenCalledTimes(2);
    expect(mocks.initRegistro).toHaveBeenNthCalledWith(1, { equipId: 'eq-1' });
    expect(mocks.loadRegistroForEdit).toHaveBeenCalledWith('reg-1');
    expect(mocks.unmountRegistroHeader).toHaveBeenCalledTimes(1);
    expect(mocks.updateHeader).toHaveBeenCalledTimes(2);
  });
});
