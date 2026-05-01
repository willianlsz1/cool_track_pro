import { expect, test } from '@playwright/test';
import { setupAuthedPage } from '../fixtures/authedSession.js';

const PRO_PROFILE = {
  plan: 'pro',
  subscription_status: 'active',
};

const LIFECYCLE_REMOTE_DATA = {
  equipamentos: [
    {
      id: 'equip-hist-e2e-1',
      nome: 'Split E2E',
      local: 'Sala tecnica',
      status: 'ok',
      tag: 'SALA-01',
      tipo: 'Split',
    },
  ],
  registros: [
    {
      id: 'reg-hist-e2e-1',
      equip_id: 'equip-hist-e2e-1',
      data: '2026-04-30T10:00:00.000Z',
      tipo: 'Preventiva',
      obs: 'Registro E2E do timeline',
      status: 'ok',
      pecas: 'Filtro',
      proxima: '',
      tecnico: 'Tecnico E2E',
      custo_pecas: 0,
      custo_mao_obra: 0,
      assinatura: false,
      fotos: [],
    },
  ],
  tecnicos: [{ nome: 'Tecnico E2E' }],
};

test.use({ bypassCSP: true });

test.describe('React islands lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthedPage(page, { profile: PRO_PROFILE, remoteData: LIFECYCLE_REMOTE_DATA });
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');
  });

  async function assertNoDuplicateCreateRoot(page, action) {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await action();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  }

  async function cycleIsland(page, { navSelector, route, rootSelector, markerSelector }) {
    await page.click(navSelector);
    await expect(page.locator('body')).toHaveAttribute('data-route', route);
    await expect(page.locator(rootSelector)).toHaveCount(1);
    await expect(page.locator(markerSelector)).toHaveCount(1);

    await page.click('#sidenav-inicio');
    await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');
    await expect(page.locator(markerSelector)).toHaveCount(0);

    await page.click(navSelector);
    await expect(page.locator('body')).toHaveAttribute('data-route', route);
    await expect(page.locator(rootSelector)).toHaveCount(1);
    await expect(page.locator(markerSelector)).toHaveCount(1);
  }

  async function assertDashboardKpisIsland(page) {
    await expect(page.locator('#view-inicio')).toHaveCount(1);
    await expect(page.locator('#dash-kpis-root')).toHaveCount(1);
    await expect(page.locator('#dash-kpis-root')).toHaveAttribute(
      'data-react-dashboard-kpis-mounted',
      'true',
    );
    await expect(
      page.locator('#dash-kpis-root[data-react-dashboard-kpis-mounted="true"]'),
    ).toHaveCount(1);

    await expect(page.locator('#dash-kpi-ativos')).toHaveCount(1);
    await expect(page.locator('#dash-kpi-ef')).toHaveCount(1);
    await expect(page.locator('#dash-kpi-anom')).toHaveCount(1);
    await expect(page.locator('#dash-kpi-mes')).toHaveCount(1);
    await expect(page.locator('#dash-kpis-root .dash__kpi')).toHaveCount(4);
    await expect(page.locator('#dash-kpis-root .dash__kpi-value')).toHaveCount(4);
    expect(await page.locator('#dash-kpis-root [data-tone]').count()).toBeGreaterThan(0);
  }

  async function assertDashboardNextActionIsland(page) {
    const card = page.locator('#dash-next-action-card');
    const cta = page.locator('#dash-next-cta');

    await expect(card).toHaveCount(1);
    await expect(card).toHaveClass(/dash__card/);
    await expect(card).toHaveClass(/dash__card--next-action/);
    await expect(card).toHaveAttribute('data-react-dashboard-next-action-mounted', 'true');
    await expect(
      page.locator('#dash-next-action-card[data-react-dashboard-next-action-mounted="true"]'),
    ).toHaveCount(1);
    await expect(card).toHaveAttribute('data-tone', /.+/);

    await expect(page.locator('#dash-next-title')).toHaveCount(1);
    await expect(page.locator('#dash-next-sub')).toHaveCount(1);
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveClass(/dash__card-cta/);
    await expect(page.locator('#dash-next-cta-label')).toHaveCount(1);

    const ctaAttrs = await cta.evaluate((node) => ({
      action: node.getAttribute('data-action'),
      id: node.getAttribute('data-id'),
      nav: node.getAttribute('data-nav'),
    }));
    expect(Boolean(ctaAttrs.nav || ctaAttrs.action || ctaAttrs.id)).toBe(true);
  }

  async function assertDashboardLastServiceIsland(page) {
    const card = page.locator('#dash-last-service');

    await expect(card).toHaveCount(1);
    await expect(card).toHaveClass(/dash__card/);
    await expect(card).toHaveClass(/dash__card--last-service/);
    await expect(card).toHaveAttribute('data-react-dashboard-last-service-mounted', 'true');
    await expect(
      page.locator('#dash-last-service[data-react-dashboard-last-service-mounted="true"]'),
    ).toHaveCount(1);

    await expect(page.locator('#dash-last-title')).toHaveCount(1);
    await expect(page.locator('#dash-last-sub')).toHaveCount(1);
    await expect(page.locator('#dash-last-desc')).toHaveCount(1);
    await expect(card.locator('.dash__card-label')).toHaveCount(1);
    await expect(card.locator('.dash__card-title')).toHaveCount(1);
    await expect(card.locator('.dash__card-sub')).toHaveCount(1);
  }

  async function assertDashboardMonthSummaryIsland(page) {
    const section = page.locator('#dash-month-section');

    await expect(section).toHaveCount(1);
    await expect(section).toHaveClass(/dash__section/);
    await expect(section).toHaveAttribute('data-react-dashboard-month-summary-mounted', 'true');
    await expect(
      page.locator('#dash-month-section[data-react-dashboard-month-summary-mounted="true"]'),
    ).toHaveCount(1);

    await expect(page.locator('#dash-month-label')).toHaveCount(1);
    await expect(page.locator('#dash-month-services')).toHaveCount(1);
    await expect(page.locator('#dash-month-equips')).toHaveCount(1);
    await expect(page.locator('#dash-month-pending')).toHaveCount(1);
    await expect(page.locator('#dash-month-trend')).toHaveCount(1);
    await expect(section.locator('.dash__section-header')).toHaveCount(1);
    await expect(section.locator('.dash__section-label')).toHaveCount(1);
    await expect(section.locator('.dash__kpi-grid')).toHaveCount(1);
    await expect(section.locator('.dash__kpi')).toHaveCount(4);
    await expect(section.locator('.dash__kpi-value')).toHaveCount(3);
  }

  async function assertHistoricoTimelineIsland(page) {
    const timelineRoot = page.locator('#timeline');
    const marker = page.locator('#timeline[data-react-historico-timeline-mounted="true"]');
    const firstItem = timelineRoot.locator('.timeline__item').first();

    await expect(page.locator('#view-historico')).toHaveCount(1);
    await expect(timelineRoot).toHaveCount(1);
    await expect(timelineRoot).toHaveAttribute('data-react-historico-timeline-mounted', 'true');
    await expect(marker).toHaveCount(1);

    await expect(timelineRoot.locator('.timeline')).toHaveCount(1);
    await expect(timelineRoot.locator('.hist-day-group')).toHaveCount(1);
    await expect(timelineRoot.locator('.timeline__item')).toHaveCount(1);
    await expect(firstItem).toHaveAttribute('data-reg-id', /.+/);
    await expect(firstItem.locator('[data-action="edit-reg"]')).toHaveCount(1);
    await expect(firstItem.locator('[data-action="delete-reg"]')).toHaveCount(1);
    await expect(firstItem.locator('[data-hist-action="toggle-card-menu"]')).toHaveCount(1);
  }

  async function assertHistoricoFiltersIsland(page) {
    const filtersRoot = page.locator('#hist-filters-root');
    const stickyHeader = page.locator('#hist-sticky-header');
    const searchInput = page.locator('#hist-busca');
    const filtersTrigger = page.locator('#hist-filters-trigger');

    await expect(page.locator('#view-historico')).toHaveCount(1);
    await expect(filtersRoot).toHaveCount(1);
    await expect(filtersRoot).toHaveAttribute('data-react-historico-filters-mounted', 'true');
    await expect(
      page.locator('#hist-filters-root[data-react-historico-filters-mounted="true"]'),
    ).toHaveCount(1);

    await expect(stickyHeader).toHaveCount(1);
    await expect(stickyHeader).toHaveClass(/hist-sticky-header/);
    await expect(page.locator('#hist-count')).toHaveCount(1);
    await expect(searchInput).toHaveCount(1);
    await expect(searchInput).toHaveAttribute('type', 'search');
    await expect(filtersTrigger).toHaveCount(1);
    await expect(filtersTrigger).toHaveClass(/hist-filters-trigger/);
    await expect(filtersTrigger).toHaveAttribute('data-hist-action', 'open-filters-sheet');
    await expect(page.locator('#hist-filters-count')).toHaveCount(1);
    await expect(page.locator('#hist-setor')).toHaveCount(1);
    await expect(page.locator('#hist-equip')).toHaveCount(1);
    await expect(page.locator('#hist-quickfilters-slot')).toHaveCount(1);
    await expect(page.locator('#hist-active-chips-slot')).toHaveCount(1);
    await expect(page.locator('#hist-chrono-label')).toHaveCount(1);

    await expect(page.locator('.hist-search-row')).toHaveCount(1);
    await expect(page.locator('label.hist-input[for="hist-busca"]')).toHaveCount(1);
    await expect(page.locator('#hist-filters-trigger.hist-filters-trigger')).toHaveCount(1);
    await expect(page.locator('#hist-quickfilters-slot .hist-quickfilters')).toHaveCount(1);
    await expect(page.locator('#hist-active-chips-slot .hist-active-chips')).toHaveCount(1);
  }

  async function assertRelatorioHeroIsland(page) {
    const heroRoot = page.locator('#rel-hero');

    await expect(page.locator('#view-relatorio')).toHaveCount(1);
    await expect(heroRoot).toHaveCount(1);
    await expect(heroRoot).toHaveClass(/rel-hero/);
    await expect(heroRoot).toHaveAttribute('data-react-relatorio-hero-mounted', 'true');
    await expect(page.locator('#rel-hero[data-react-relatorio-hero-mounted="true"]')).toHaveCount(
      1,
    );

    await expect(page.locator('#rel-hero-title')).toHaveCount(1);
    await expect(heroRoot.locator('.rel-hero__title')).toHaveCount(1);
    await expect(heroRoot.locator('.rel-hero__kpis')).toHaveCount(1);
    expect(await heroRoot.locator('.rel-kpi').count()).toBeGreaterThanOrEqual(1);
    expect(await heroRoot.locator('.rel-kpi__value').count()).toBeGreaterThanOrEqual(1);

    const viewModeControls = await heroRoot.locator('[data-view-mode]').count();
    if (viewModeControls > 0) {
      await expect(heroRoot.locator('[data-view-mode]').first()).toHaveAttribute(
        'data-view-mode',
        /.+/,
      );
    }
  }

  async function assertRelatorioControlsIsland(page) {
    const controlsRoot = page.locator('#rel-controls-root');
    const exportDropdown = page.locator('#rel-export-dd');
    const exportToggle = page.locator('#btn-export-dd-toggle');

    await expect(page.locator('#view-relatorio')).toHaveCount(1);
    await expect(controlsRoot).toHaveCount(1);
    await expect(controlsRoot).toHaveAttribute('data-react-relatorio-controls-mounted', 'true');
    await expect(
      page.locator('#rel-controls-root[data-react-relatorio-controls-mounted="true"]'),
    ).toHaveCount(1);

    await expect(page.locator('#rel-filters')).toHaveCount(1);
    await expect(page.locator('#rel-filters-chips')).toHaveCount(1);
    await expect(page.locator('#rel-filters-advanced')).toHaveCount(1);
    await expect(page.locator('#rel-equip')).toHaveCount(1);
    await expect(page.locator('#rel-de')).toHaveCount(1);
    await expect(page.locator('#rel-ate')).toHaveCount(1);
    await expect(exportDropdown).toHaveCount(1);
    await expect(exportDropdown).toHaveClass(/rel-export-dd/);
    await expect(exportToggle).toHaveCount(1);
    await expect(exportToggle).toHaveAttribute('data-action', 'toggle-export-dd');
    await expect(page.locator('#rel-export-dd-menu')).toHaveCount(1);
    await expect(page.locator('#pdf-quota-slot')).toHaveCount(1);

    expect(await controlsRoot.locator('[data-action]').count()).toBeGreaterThan(0);
    expect(await controlsRoot.locator('[data-nav]').count()).toBeGreaterThan(0);
    expect(await controlsRoot.locator('[data-view-mode]').count()).toBeGreaterThan(0);
  }

  async function assertRelatorioCardsIsland(page) {
    const cardsRoot = page.locator('#relatorio-corpo');

    await expect(page.locator('#view-relatorio')).toHaveCount(1);
    await expect(cardsRoot).toHaveCount(1);
    await expect(cardsRoot).toHaveAttribute('data-react-relatorio-cards-mounted', 'true');
    await expect(
      page.locator('#relatorio-corpo[data-react-relatorio-cards-mounted="true"]'),
    ).toHaveCount(1);
    await expect(cardsRoot).toHaveAttribute('data-view-mode', /.+/);

    const emptyState = cardsRoot.locator('.rel-empty');
    const recordCount = await cardsRoot.locator('.rel-record').count();

    if (recordCount > 0) {
      await expect(cardsRoot).toHaveClass(/rel-records/);
      const firstRecord = cardsRoot.locator('.rel-record').first();
      await expect(firstRecord).toHaveAttribute('data-id', /.+/);
      await expect(firstRecord.locator('[data-rel-action="rel-toggle-card"]')).toHaveCount(1);

      const signatureButton = firstRecord.locator('[data-action="rel-view-signature"]');
      if ((await signatureButton.count()) > 0) {
        await expect(signatureButton.first()).toHaveAttribute('data-id', /.+/);
      }
    } else {
      await expect(emptyState).toHaveCount(1);
      await expect(emptyState.locator('.rel-empty__cta')).toHaveAttribute('data-nav', /.+/);
    }
  }

  async function assertRegistroHeaderIsland(page) {
    const headerRoot = page.locator('#registro-header-root');

    await expect(page.locator('#view-registro')).toHaveCount(1);
    await expect(headerRoot).toHaveCount(1);
    await expect(headerRoot).toHaveAttribute('data-react-registro-header-mounted', 'true');
    await expect(
      page.locator('#registro-header-root[data-react-registro-header-mounted="true"]'),
    ).toHaveCount(1);

    await expect(page.locator('#registro-hero')).toHaveCount(1);
    await expect(page.locator('#r-equip')).toHaveCount(1);
    await expect(page.locator('#r-data')).toHaveCount(1);
    await expect(page.locator('#r-tipo')).toHaveCount(1);
    await expect(page.locator('#r-obs')).toHaveCount(1);
    await expect(page.locator('#r-tecnico')).toHaveCount(1);
  }

  test('dashboard islands do inicio saem e voltam sem duplicar roots React', async ({ page }) => {
    await assertNoDuplicateCreateRoot(page, async () => {
      await assertDashboardKpisIsland(page);
      await assertDashboardNextActionIsland(page);
      await assertDashboardLastServiceIsland(page);
      await assertDashboardMonthSummaryIsland(page);

      await page.click('#sidenav-clientes');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'clientes');
      await expect(page.locator('#clientes-root')).toHaveCount(1);

      await page.click('#sidenav-inicio');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');
      await assertDashboardKpisIsland(page);
      await assertDashboardNextActionIsland(page);
      await assertDashboardLastServiceIsland(page);
      await assertDashboardMonthSummaryIsland(page);
    });
  });

  test('clientes sai e volta sem duplicar root React', async ({ page }) => {
    await assertNoDuplicateCreateRoot(page, () =>
      cycleIsland(page, {
        navSelector: '#sidenav-clientes',
        route: 'clientes',
        rootSelector: '#clientes-root',
        markerSelector: '[data-react-clientes-page="true"]',
      }),
    );

    const clientesRoot = page.locator('#clientes-root');
    await expect(clientesRoot.locator('.cli-empty')).toHaveCount(1);
    await expect(clientesRoot.locator('[data-action="open-cliente-modal"]')).toHaveCount(2);
  });

  test('alertas sai e volta sem duplicar root React', async ({ page }) => {
    await assertNoDuplicateCreateRoot(page, () =>
      cycleIsland(page, {
        navSelector: '#sidenav-alertas',
        route: 'alertas',
        rootSelector: '#view-alertas',
        markerSelector: '[data-react-alertas-page="true"]',
      }),
    );
  });

  test('orcamentos sai e volta sem duplicar root React', async ({ page }) => {
    await assertNoDuplicateCreateRoot(page, () =>
      cycleIsland(page, {
        navSelector: '#sidenav-orcamentos',
        route: 'orcamentos',
        rootSelector: '#view-orcamentos',
        markerSelector: '[data-react-orcamentos-page="true"]',
      }),
    );
  });

  test('equipamentos sai e volta sem duplicar root React da lista flat', async ({ page }) => {
    await assertNoDuplicateCreateRoot(page, () =>
      cycleIsland(page, {
        navSelector: '#sidenav-equipamentos',
        route: 'equipamentos',
        rootSelector: '#lista-equip',
        markerSelector: '#lista-equip [data-testid="equipamentos-list"]',
      }),
    );

    await expect(page.locator('#view-equipamentos')).toHaveCount(1);
    await expect(page.locator('#lista-equip')).toHaveCount(1);
    await expect(page.locator('#lista-equip [data-testid="equipamentos-list"]')).toHaveCount(1);

    const equipCards = page.locator('#lista-equip .equip-card');
    const cardCount = await equipCards.count();
    if (cardCount > 0) {
      const firstCard = equipCards.first();
      await expect(firstCard).toHaveAttribute('data-id', /.+/);
      await expect(firstCard).toHaveAttribute('data-action', 'view-equip');
    } else {
      await expect(page.locator('#lista-equip .empty-state')).toHaveCount(1);
    }
  });

  test('historico sai e volta sem duplicar roots React dos filtros e timeline', async ({
    page,
  }) => {
    await assertNoDuplicateCreateRoot(page, async () => {
      await page.evaluate(() => {
        window.history.replaceState(null, '', '/?q=Preventiva');
      });
      await page.click('#sidenav-historico');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'historico');
      await assertHistoricoFiltersIsland(page);
      await assertHistoricoTimelineIsland(page);

      await page.click('#sidenav-inicio');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');
      await expect(
        page.locator('#hist-filters-root[data-react-historico-filters-mounted="true"]'),
      ).toHaveCount(0);
      await expect(
        page.locator('#timeline[data-react-historico-timeline-mounted="true"]'),
      ).toHaveCount(0);

      await page.click('#sidenav-historico');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'historico');
      await assertHistoricoFiltersIsland(page);
      await assertHistoricoTimelineIsland(page);
    });
  });

  test('relatorio sai e volta sem duplicar roots React do hero, controles e cards', async ({
    page,
  }) => {
    await assertNoDuplicateCreateRoot(page, async () => {
      await page.click('#sidenav-relatorio');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'relatorio');
      await assertRelatorioControlsIsland(page);
      await assertRelatorioHeroIsland(page);
      await assertRelatorioCardsIsland(page);

      await page.click('#sidenav-inicio');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');
      await expect(page.locator('#rel-hero[data-react-relatorio-hero-mounted="true"]')).toHaveCount(
        0,
      );
      await expect(
        page.locator('#rel-controls-root[data-react-relatorio-controls-mounted="true"]'),
      ).toHaveCount(0);
      await expect(
        page.locator('#relatorio-corpo[data-react-relatorio-cards-mounted="true"]'),
      ).toHaveCount(0);

      await page.click('#sidenav-relatorio');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'relatorio');
      await assertRelatorioControlsIsland(page);
      await assertRelatorioHeroIsland(page);
      await assertRelatorioCardsIsland(page);
    });
  });

  test('registro sai e volta sem duplicar root React do header', async ({ page }) => {
    await assertNoDuplicateCreateRoot(page, async () => {
      await page.click('#sidenav-registro');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'registro');
      await assertRegistroHeaderIsland(page);

      await page.click('#sidenav-inicio');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');
      await expect(
        page.locator('#registro-header-root[data-react-registro-header-mounted="true"]'),
      ).toHaveCount(0);

      await page.click('#sidenav-registro');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'registro');
      await assertRegistroHeaderIsland(page);
    });
  });
});
