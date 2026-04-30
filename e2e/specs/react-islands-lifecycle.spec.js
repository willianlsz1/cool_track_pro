import { expect, test } from '@playwright/test';
import { setupAuthedPage } from '../fixtures/authedSession.js';

const PRO_PROFILE = {
  plan: 'pro',
  subscription_status: 'active',
};

test.use({ bypassCSP: true });

test.describe('React islands lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthedPage(page, { profile: PRO_PROFILE });
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

  test('dashboard islands do inicio saem e voltam sem duplicar roots React', async ({ page }) => {
    await assertNoDuplicateCreateRoot(page, async () => {
      await assertDashboardKpisIsland(page);
      await assertDashboardNextActionIsland(page);
      await assertDashboardLastServiceIsland(page);

      await page.click('#sidenav-clientes');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'clientes');
      await expect(page.locator('#clientes-root')).toHaveCount(1);

      await page.click('#sidenav-inicio');
      await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');
      await assertDashboardKpisIsland(page);
      await assertDashboardNextActionIsland(page);
      await assertDashboardLastServiceIsland(page);
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
});
