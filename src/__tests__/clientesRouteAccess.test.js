import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  registerRoute: vi.fn(),
  currentRoute: vi.fn(() => 'clientes'),
  renderClientes: vi.fn(),
  unmountClientes: vi.fn(),
  updateHeader: vi.fn(),
  openPaywall: vi.fn(),
  getClientesAccessSnapshot: vi.fn(),
  resolveClientesAccess: vi.fn(),
}));

vi.mock('../core/router.js', () => ({
  currentRoute: mocks.currentRoute,
  registerRoute: mocks.registerRoute,
}));
vi.mock('../ui/views/dashboard.js', () => ({
  renderDashboard: vi.fn(),
  updateHeader: mocks.updateHeader,
}));
vi.mock('../ui/views/equipamentos.js', () => ({
  renderEquip: vi.fn(),
  populateEquipSelects: vi.fn(),
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
  initRegistro: vi.fn(),
  loadRegistroForEdit: vi.fn(),
  unmountRegistroHeader: vi.fn(),
}));
vi.mock('../ui/views/pricing.js', () => ({ renderPricing: vi.fn() }));
vi.mock('../ui/views/clientes.js', () => ({
  renderClientes: mocks.renderClientes,
  setClientesSearch: vi.fn(),
  unmountClientes: mocks.unmountClientes,
}));
vi.mock('../ui/views/conta.js', () => ({ renderConta: vi.fn() }));
vi.mock('../ui/views/privacidade.js', () => ({ renderPrivacidade: vi.fn() }));
vi.mock('../ui/components/clientesPaywallModal.js', () => ({
  ClientesPaywallModal: { open: mocks.openPaywall },
}));
vi.mock('../core/plans/clientesAccess.js', () => ({
  getClientesAccessSnapshot: mocks.getClientesAccessSnapshot,
  resolveClientesAccess: mocks.resolveClientesAccess,
}));
vi.mock('../ui/components/onboarding/onboardingChecklist.js', () => ({
  OnboardingChecklist: { markStep: vi.fn() },
}));

function getClientesRoute() {
  const call = mocks.registerRoute.mock.calls.find(([name]) => name === 'clientes');
  if (!call) throw new Error('clientes route was not registered');
  return { onEnter: call[1], onLeave: call[2] };
}

describe('clientes route access contract', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((mock) => mock.mockClear?.());
    mocks.currentRoute.mockReturnValue('clientes');
    document.body.innerHTML = '<div id="view-clientes"><div class="view-content"></div></div>';
  });

  it('mantem paywall Pro fora da view quando acesso e negado', async () => {
    mocks.getClientesAccessSnapshot.mockReturnValue({ resolved: true, canAccess: false });

    const { registerAppRoutes } = await import('../ui/controller/routes.js');
    registerAppRoutes();
    await getClientesRoute().onEnter();

    expect(mocks.openPaywall).toHaveBeenCalledTimes(1);
    expect(mocks.renderClientes).not.toHaveBeenCalled();
    expect(mocks.updateHeader).not.toHaveBeenCalled();
  });

  it('renderiza clientes apenas quando acesso Pro esta liberado', async () => {
    mocks.getClientesAccessSnapshot.mockReturnValue({ resolved: true, canAccess: true });

    const { registerAppRoutes } = await import('../ui/controller/routes.js');
    registerAppRoutes();
    await getClientesRoute().onEnter();

    expect(mocks.openPaywall).not.toHaveBeenCalled();
    expect(mocks.renderClientes).toHaveBeenCalledTimes(1);
    expect(mocks.updateHeader).toHaveBeenCalledTimes(1);
  });

  it('desmonta a ilha React de clientes ao sair da rota', async () => {
    mocks.getClientesAccessSnapshot.mockReturnValue({ resolved: true, canAccess: true });

    const { registerAppRoutes } = await import('../ui/controller/routes.js');
    registerAppRoutes();
    const route = getClientesRoute();

    await route.onEnter();
    await route.onLeave();
    await route.onEnter();

    expect(mocks.unmountClientes).toHaveBeenCalledTimes(1);
    expect(mocks.renderClientes).toHaveBeenCalledTimes(2);
    expect(mocks.updateHeader).toHaveBeenCalledTimes(2);
  });
});
