import { expect, test } from '@playwright/test';
import { setupAuthedPage } from '../fixtures/authedSession.js';

const CLIENTE_ID = 'cliente-relatorio-visual-smoke-e2e';
const SETOR_ID = 'setor-relatorio-visual-smoke-e2e';
const EQUIP_ID = 'equip-relatorio-visual-smoke-e2e';
const REGISTRO_ID = 'reg-relatorio-visual-smoke-e2e';

const RELATORIO_REMOTE_DATA = {
  clientes: [
    {
      id: CLIENTE_ID,
      nome: 'Cliente Relatorio Smoke',
      telefone: '11999990000',
    },
  ],
  setores: [
    {
      id: SETOR_ID,
      nome: 'Sala tecnica',
      clienteId: CLIENTE_ID,
    },
  ],
  equipamentos: [
    {
      id: EQUIP_ID,
      nome: 'Split Relatorio Smoke',
      local: 'Sala tecnica',
      status: 'ok',
      tag: 'REL-SMOKE-01',
      tipo: 'Split',
      clienteId: CLIENTE_ID,
      setorId: SETOR_ID,
      periodicidade_preventiva_dias: 30,
    },
  ],
  registros: [
    {
      id: REGISTRO_ID,
      equip_id: EQUIP_ID,
      data: '2026-04-30T10:00:00.000Z',
      tipo: 'Preventiva',
      obs: 'Registro E2E do relatorio visual smoke',
      status: 'ok',
      pecas: 'Filtro',
      proxima: '2026-05-30',
      tecnico: 'Tecnico Smoke',
      custo_pecas: 120,
      custo_mao_obra: 250,
      assinatura: false,
      fotos: [],
    },
  ],
  tecnicos: [{ nome: 'Tecnico Smoke' }],
};

test.use({ bypassCSP: true });

test.describe('Relatorio visual smoke', () => {
  test('renderiza roots, controles, cards e contratos principais sem erros de console', async ({
    page,
  }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await setupAuthedPage(page, {
      profile: { plan: 'pro', subscription_status: 'active' },
      remoteData: RELATORIO_REMOTE_DATA,
    });
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');

    await openRelatorio(page);

    await expect(page.locator('#view-relatorio')).toHaveCount(1);
    await assertHeroContracts(page);
    await assertControlsContracts(page);
    await assertCardsContracts(page);
    await assertCompanyPmocContracts(page);

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});

async function openRelatorio(page) {
  await waitForEquipmentState(page);

  await page.evaluate((equipId) => {
    return import('/src/core/router.js').then(({ goTo }) => goTo('relatorio', { equipId }));
  }, EQUIP_ID);

  await expect(page.locator('body')).toHaveAttribute('data-route', 'relatorio');
  await expect(page.locator('#rel-equip')).toHaveValue(EQUIP_ID);
}

async function waitForEquipmentState(page) {
  await expect
    .poll(() =>
      page.evaluate(
        (equipId) =>
          import('/src/core/state.js').then(({ getState }) =>
            Boolean((getState().equipamentos || []).some((equip) => equip.id === equipId)),
          ),
        EQUIP_ID,
      ),
    )
    .toBe(true);
}

async function assertHeroContracts(page) {
  const heroRoot = page.locator('#rel-hero');

  await expect(heroRoot).toHaveCount(1);
  await expect(heroRoot).toHaveClass(/rel-hero/);
  await expect(heroRoot).toHaveAttribute('data-react-relatorio-hero-mounted', 'true');
  await expect(page.locator('#rel-hero-title')).toHaveCount(1);
  await expect(heroRoot.locator('.rel-hero__title')).toHaveCount(1);
  await expect(heroRoot.locator('.rel-hero__kpis')).toHaveCount(1);
  expect(await heroRoot.locator('.rel-kpi').count()).toBeGreaterThanOrEqual(1);
}

async function assertControlsContracts(page) {
  const controlsRoot = page.locator('#rel-controls-root');

  await expect(controlsRoot).toHaveCount(1);
  await expect(controlsRoot).toHaveAttribute('data-react-relatorio-controls-mounted', 'true');
  await expect(page.locator('#rel-filters')).toHaveCount(1);
  await expect(page.locator('#rel-filters-chips')).toHaveCount(1);
  await expect(page.locator('#rel-filters-advanced')).toHaveCount(1);
  await expect(page.locator('#rel-equip')).toHaveCount(1);
  await expect(page.locator('#rel-de')).toHaveCount(1);
  await expect(page.locator('#rel-ate')).toHaveCount(1);

  await expect(page.locator('#btn-whatsapp')).toHaveAttribute('data-action', 'whatsapp-export');
  await expect(page.locator('#btn-export-pdf')).toHaveAttribute('data-action', 'export-pdf');
  await expect(page.locator('#btn-export-dd-toggle')).toHaveAttribute(
    'data-action',
    'toggle-export-dd',
  );
  await expect(page.locator('#rel-export-dd-menu')).toHaveCount(1);
  await expect(page.locator('#pdf-quota-slot')).toHaveCount(1);

  const pmocMain = page.locator('#rel-dd-pmoc-main');
  if ((await pmocMain.count()) > 0) {
    await expect(pmocMain).toHaveAttribute('data-action', 'open-pmoc-modal');
    await expect(pmocMain).toHaveAttribute('data-tier', /.+/);
  }

  const pmocInfo = page.locator('#rel-dd-pmoc-info');
  if ((await pmocInfo.count()) > 0) {
    await expect(pmocInfo).toHaveAttribute('data-action', 'open-pmoc-info');
  }

  const pmocNudge = page.locator('#rel-dd-pmoc-nudge');
  if ((await pmocNudge.count()) > 0) {
    await expect(pmocNudge).toHaveAttribute('data-nav', 'pricing');
  }

  expect(await controlsRoot.locator('[data-action]').count()).toBeGreaterThan(0);
  expect(await controlsRoot.locator('[data-nav]').count()).toBeGreaterThan(0);
  expect(await controlsRoot.locator('[data-view-mode]').count()).toBeGreaterThan(0);
}

async function assertCardsContracts(page) {
  const cardsRoot = page.locator('#relatorio-corpo');

  await expect(cardsRoot).toHaveCount(1);
  await expect(cardsRoot).toHaveAttribute('data-react-relatorio-cards-mounted', 'true');
  await expect(cardsRoot).toHaveAttribute('data-view-mode', /.+/);

  const recordCount = await cardsRoot.locator('.rel-record').count();
  if (recordCount > 0) {
    const firstRecord = cardsRoot.locator('.rel-record').first();
    await expect(firstRecord).toHaveAttribute('data-id', REGISTRO_ID);
    await expect(firstRecord.locator('[data-rel-action="rel-toggle-card"]')).toHaveAttribute(
      'data-id',
      REGISTRO_ID,
    );
    return;
  }

  await expect(cardsRoot.locator('.rel-empty')).toHaveCount(1);
  await expect(cardsRoot.locator('.rel-empty__cta')).toHaveAttribute('data-nav', /.+/);
}

async function assertCompanyPmocContracts(page) {
  const pmocSlot = page.locator('#rel-company-pmoc-slot');

  await expect(pmocSlot).toHaveCount(1);

  const pmocBlock = pmocSlot.locator('.rel-company-pmoc');
  if ((await pmocBlock.count()) === 0) return;

  await expect(pmocBlock).toHaveCount(1);
  await expect(pmocBlock.locator('.rel-company-pmoc__head')).toHaveCount(1);
  await expect(pmocBlock.locator('.rel-company-pmoc__desc')).toHaveCount(1);
  await expect(pmocBlock.locator('.rel-company-pmoc__actions')).toHaveCount(1);

  const pmocAction = pmocBlock.locator('[data-action="open-pmoc-modal"]');
  if ((await pmocAction.count()) > 0) {
    await expect(pmocAction.first()).toHaveAttribute('data-action', 'open-pmoc-modal');
  }

  const clientesNav = pmocBlock.locator('[data-nav="clientes"]');
  if ((await clientesNav.count()) > 0) {
    await expect(clientesNav.first()).toHaveAttribute('data-nav', 'clientes');
  }
}
