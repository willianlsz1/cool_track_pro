import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  registerRoute: vi.fn(),
  renderEquip: vi.fn(),
  populateEquipSelects: vi.fn(),
  unmountEquipamentosHeader: vi.fn(),
  unmountEquipamentosList: vi.fn(),
  updateHeader: vi.fn(),
}));

vi.mock('../core/router.js', () => ({
  currentRoute: vi.fn(() => 'equipamentos'),
  registerRoute: mocks.registerRoute,
}));

vi.mock('../ui/views/dashboard.js', () => ({
  renderDashboard: vi.fn(),
  updateHeader: mocks.updateHeader,
}));

vi.mock('../ui/views/equipamentos.js', () => ({
  renderEquip: mocks.renderEquip,
  populateEquipSelects: mocks.populateEquipSelects,
  unmountEquipamentosHeader: mocks.unmountEquipamentosHeader,
  unmountEquipamentosList: mocks.unmountEquipamentosList,
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
  unmountRegistroChecklist: vi.fn(),
  unmountRegistroPhotos: vi.fn(),
}));

vi.mock('../ui/views/clientes.js', () => ({
  renderClientes: vi.fn(),
  setClientesSearch: vi.fn(),
  unmountClientes: vi.fn(),
}));
vi.mock('../ui/views/conta.js', () => ({ renderConta: vi.fn() }));
vi.mock('../core/plans/clientesAccess.js', () => ({
  getClientesAccessSnapshot: vi.fn(() => ({ resolved: true, canAccess: true })),
  resolveClientesAccess: vi.fn(),
}));
vi.mock('../ui/components/onboarding/onboardingChecklist.js', () => ({
  OnboardingChecklist: { markStep: vi.fn() },
}));

function getEquipamentosRoute() {
  const call = mocks.registerRoute.mock.calls.find(([name]) => name === 'equipamentos');
  if (!call) throw new Error('equipamentos route was not registered');
  return { onEnter: call[1], onLeave: call[2] };
}

describe('equipamentos route lifecycle', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(mocks).forEach((mock) => mock.mockClear?.());
  });

  it('unmounts the React header and flat list islands when leaving equipamentos', async () => {
    const { registerAppRoutes } = await import('../ui/controller/routes.js');
    registerAppRoutes();
    const route = getEquipamentosRoute();

    route.onEnter({ sectorId: '__sem_setor__' });
    route.onLeave();
    route.onEnter();

    expect(mocks.populateEquipSelects).toHaveBeenCalledTimes(2);
    expect(mocks.renderEquip).toHaveBeenCalledTimes(2);
    expect(mocks.renderEquip).toHaveBeenNthCalledWith(1, '', { sectorId: '__sem_setor__' });
    expect(mocks.unmountEquipamentosHeader).toHaveBeenCalledTimes(1);
    expect(mocks.unmountEquipamentosList).toHaveBeenCalledTimes(1);
    expect(mocks.updateHeader).toHaveBeenCalledTimes(2);
  });
});
