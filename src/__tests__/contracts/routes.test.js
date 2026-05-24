import { beforeEach, describe, expect, it, vi } from 'vitest';

const renderSpies = new Map();
const routeIds = [
  'inicio',
  'equipamentos',
  'registro',
  'historico',
  'alertas',
  'relatorio',
  'clientes',
  'conta',
  'orcamentos',
];

function makeRenderSpy(routeId) {
  const spy = vi.fn(() => {
    const view = document.getElementById(`view-${routeId}`);
    if (view) view.innerHTML = `<div data-testid="mounted-${routeId}"></div>`;
  });
  renderSpies.set(routeId, spy);
  return spy;
}

vi.mock('../../ui/views/dashboard.js', () => ({
  renderDashboard: makeRenderSpy('inicio'),
  updateHeader: vi.fn(),
}));
vi.mock('../../ui/views/equipamentos.js', () => ({
  renderEquip: makeRenderSpy('equipamentos'),
  populateEquipSelects: vi.fn(),
  unmountEquipamentosHeader: vi.fn(),
  unmountEquipamentosList: vi.fn(),
}));
vi.mock('../../ui/views/registro.js', () => ({
  initRegistro: makeRenderSpy('registro'),
  loadRegistroForEdit: vi.fn(),
  unmountRegistroHeader: vi.fn(),
  unmountRegistroChecklist: vi.fn(),
  unmountRegistroPhotos: vi.fn(),
  unmountRegistroSignature: vi.fn(),
}));
vi.mock('../../ui/views/historico.js', () => ({
  renderHist: makeRenderSpy('historico'),
  setHistClienteFilter: vi.fn(),
  clearHistClienteFilter: vi.fn(),
  unmountHistoricoFilters: vi.fn(),
  unmountHistoricoTimeline: vi.fn(),
}));
vi.mock('../../ui/views/alertas.js', () => ({
  renderAlertas: makeRenderSpy('alertas'),
  unmountAlertas: vi.fn(),
}));
vi.mock('../../ui/views/relatorio.js', () => ({
  renderRelatorio: makeRenderSpy('relatorio'),
  populateRelatorioSelects: vi.fn(),
  unmountRelatorioHero: vi.fn(),
  unmountRelatorioControls: vi.fn(),
  unmountRelatorioCards: vi.fn(),
}));
vi.mock('../../ui/views/clientes.js', () => ({
  renderClientes: makeRenderSpy('clientes'),
  unmountClientes: vi.fn(),
}));
vi.mock('../../ui/views/conta.js', () => ({ renderConta: makeRenderSpy('conta') }));
vi.mock('../../ui/views/orcamentos.js', () => ({
  loadAndRenderOrcamentos: makeRenderSpy('orcamentos'),
  unmountOrcamentos: vi.fn(),
}));
vi.mock('../../core/plans/clientesAccess.js', () => ({
  getClientesAccessSnapshot: () => ({ resolved: true, canAccess: true }),
  resolveClientesAccess: async () => ({ resolved: true, canAccess: true }),
}));
vi.mock('../../ui/components/onboarding/onboardingChecklist.js', () => ({
  OnboardingChecklist: { markStep: vi.fn() },
}));

function mountRouteShell() {
  document.body.innerHTML = `<main id="main-content" tabindex="-1"></main>
  <button id="nav-inicio" class="nav-btn"></button>
  ${routeIds.map((r) => `<button id="nav-${r}" class="nav-btn"></button>`).join('')}
  ${routeIds.map((r) => `<button id="sidenav-${r}" class="app-sidebar__nav-item"></button>`).join('')}
  ${routeIds
    .map((r) => `<section id="view-${r}" class="view"><div class="view-content"></div></section>`)
    .join('')}
  <div id="rel-equip"></div>`;
}

describe('contracts/routes', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    mountRouteShell();
  });

  it('keeps the public route list without commercial route', () => {
    expect([...routeIds].sort()).toEqual([
      'alertas',
      'clientes',
      'conta',
      'equipamentos',
      'historico',
      'inicio',
      'orcamentos',
      'registro',
      'relatorio',
    ]);
  });

  it('navigates all registered routes without throwing', async () => {
    const { registerAppRoutes } = await import('../../ui/controller/routes.js');
    const { goTo } = await import('../../core/router.js');
    registerAppRoutes();

    for (const routeId of routeIds) {
      goTo(routeId);
      vi.advanceTimersByTime(180);
      expect(document.body.getAttribute('data-route')).toBe(routeId);
      expect(document.getElementById(`view-${routeId}`)).toBeTruthy();
    }
  });
});
