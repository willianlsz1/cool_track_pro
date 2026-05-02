import { expect, test } from '@playwright/test';
import { setupAuthedPage } from '../fixtures/authedSession.js';

const CLIENTE_ID = 'cliente-equip-visual-smoke-e2e';
const SETOR_ID = 'setor-equip-visual-smoke-e2e';
const EQUIP_ID = 'equip-visual-smoke-e2e-1';
const EQUIP_DANGER_ID = 'equip-visual-smoke-e2e-2';

const PRO_PROFILE = {
  plan: 'pro',
  plan_code: 'pro',
  subscription_status: 'active',
  is_dev: true,
};

const EQUIPAMENTOS_REMOTE_DATA = {
  clientes: [
    {
      id: CLIENTE_ID,
      nome: 'Cliente Equipamentos E2E',
      telefone: '11999990000',
    },
  ],
  setores: [
    {
      id: SETOR_ID,
      cliente_id: CLIENTE_ID,
      clienteId: CLIENTE_ID,
      nome: 'Sala tecnica E2E',
      descricao: 'Ambiente de smoke E2E',
      responsavel: 'Tecnico E2E',
      cor: '#00c8e8',
    },
  ],
  equipamentos: [
    {
      id: EQUIP_ID,
      cliente_id: CLIENTE_ID,
      clienteId: CLIENTE_ID,
      setor_id: SETOR_ID,
      setorId: SETOR_ID,
      nome: 'Split Visual E2E',
      local: 'Sala tecnica',
      status: 'ok',
      tag: 'SPLIT-E2E',
      tipo: 'Split',
      fluido: 'R-410A',
      modelo: 'CT-12000',
      periodicidade_preventiva_dias: 90,
      periodicidadePreventivaDias: 90,
      fotos: [],
    },
    {
      id: EQUIP_DANGER_ID,
      nome: 'Self Visual Critico E2E',
      local: 'Casa de maquinas',
      status: 'danger',
      tag: 'SELF-E2E',
      tipo: 'Self',
      fluido: 'R-410A',
      periodicidade_preventiva_dias: 30,
      periodicidadePreventivaDias: 30,
      fotos: [],
    },
  ],
  registros: [
    {
      id: 'reg-equip-visual-smoke-e2e-1',
      equip_id: EQUIP_ID,
      equipId: EQUIP_ID,
      data: '2026-04-28T10:00:00.000Z',
      tipo: 'Preventiva',
      obs: 'Registro de smoke E2E',
      status: 'ok',
      tecnico: 'Tecnico E2E',
      fotos: [],
      assinatura: false,
    },
  ],
  tecnicos: [{ nome: 'Tecnico E2E' }],
  usage_monthly: [],
};

test.use({ bypassCSP: true });

test.describe('Equipamentos visual smoke', () => {
  test('preserva ilhas, cards, filtros e detalhe legado sem erros de console', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await setupAuthedPage(page, {
      profile: PRO_PROFILE,
      remoteData: EQUIPAMENTOS_REMOTE_DATA,
    });
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');
    await waitForEquipmentState(page);

    await page.evaluate(() =>
      import('/src/core/router.js').then(({ goTo }) => {
        goTo('equipamentos');
      }),
    );
    await expect(page.locator('body')).toHaveAttribute('data-route', 'equipamentos');
    await expect(page.locator('#view-equipamentos')).toHaveCount(1);

    await assertHeaderContracts(page);
    await assertListContracts(page);
    await assertFilterContracts(page);
    await assertDetailContracts(page);

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});

async function waitForEquipmentState(page) {
  await expect
    .poll(() =>
      page.evaluate(
        (equipId) =>
          import('/src/core/state.js').then(({ getState }) =>
            Boolean(
              (getState().equipamentos || []).some((equipamento) => equipamento.id === equipId),
            ),
          ),
        EQUIP_ID,
      ),
    )
    .toBe(true);
}

async function assertHeaderContracts(page) {
  const hero = page.locator('#equip-hero');
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveClass(/equip-hero/);
  await expect(hero).toHaveAttribute('data-react-equipamentos-header-mounted', 'true');
  await expect(
    page.locator('#equip-hero[data-react-equipamentos-header-mounted="true"]'),
  ).toHaveCount(1);
  await expect(page.locator('#equip-hero-title')).toHaveCount(1);
  await expect(page.locator('#equip-hero-sub')).toHaveCount(1);
  await expect(page.locator('#equip-hero-kpis')).toHaveCount(1);

  await expect(page.locator('#equip-filters')).toHaveCount(1);
  await expect(page.locator('#equip-context-chip')).toHaveCount(1);
  await expect(page.locator('#equip-busca')).toHaveCount(1);
  await expect(page.locator('#equip-search-bar')).toHaveCount(1);
  await expect(page.locator('#equip-toolbar-actions')).toHaveCount(1);
  await expect(page.locator('.equip-search-row')).toHaveCount(1);
  await expect(page.locator('.equip-view-toggle')).toHaveCount(1);
  await expect(
    page.locator('#equip-toolbar-actions [data-action="open-modal"][data-id="modal-add-eq"]'),
  ).toHaveCount(1);
  await expect(page.locator('[data-action="equip-set-view-mode"][data-mode="list"]')).toHaveCount(
    1,
  );
  await expect(page.locator('[data-action="equip-set-view-mode"][data-mode="grid"]')).toHaveCount(
    1,
  );
}

async function assertListContracts(page) {
  const list = page.locator('#lista-equip');
  await expect(list).toHaveCount(1);
  await expect(list).toHaveAttribute('data-react-equipamentos-list-mounted', 'true');
  await expect(page.locator('#lista-equip [data-testid="equipamentos-list"]')).toHaveCount(1);

  const cards = page.locator('#lista-equip .equip-card');
  await expect(cards).toHaveCount(2);

  const firstCard = page.locator(`#lista-equip .equip-card[data-id="${EQUIP_ID}"]`);
  await expect(firstCard).toHaveCount(1);
  await expect(firstCard).toHaveAttribute('data-action', 'view-equip');
  await expect(firstCard.locator('.equip-card__name')).toContainText('Split Visual E2E');
  await expect(firstCard.locator('[data-action="go-register-equip"]')).toHaveAttribute(
    'data-id',
    EQUIP_ID,
  );

  const dangerCard = page.locator(`#lista-equip .equip-card[data-id="${EQUIP_DANGER_ID}"]`);
  await expect(dangerCard).toHaveCount(1);
  await expect(dangerCard).toHaveAttribute('data-action', 'view-equip');
  await expect(dangerCard).toHaveClass(/equip-card--danger/);
}

async function assertFilterContracts(page) {
  await expect(page.locator('#equip-filters .equip-filter')).toHaveCount(5);
  await expect(page.locator('#equip-filters [data-action="equip-quickfilter"]')).toHaveCount(5);
  await expect(page.locator('#equip-filters [data-id="criticos"]')).toHaveCount(1);

  await page.locator('#equip-filters [data-id="criticos"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-route', 'equipamentos');
  await expect(page.locator('#lista-equip .equip-card')).toHaveCount(1);
  await expect(page.locator(`#lista-equip .equip-card[data-id="${EQUIP_DANGER_ID}"]`)).toHaveCount(
    1,
  );
  await expect(
    page.locator('#equip-toolbar-actions [data-action="equip-quickfilter"]'),
  ).toHaveCount(1);

  await page
    .locator('#equip-toolbar-actions [data-action="equip-quickfilter"][data-id="todos"]')
    .click();
  await expect(page.locator('#lista-equip .equip-card')).toHaveCount(2);
}

async function assertDetailContracts(page) {
  await page.locator(`#lista-equip .equip-card[data-id="${EQUIP_ID}"]`).click();

  const detailModal = page.locator('#modal-eq-det');
  await expect(detailModal).toHaveClass(/is-open/);
  await expect(page.locator('#eq-det-title')).toContainText('Split Visual E2E');
  await expect(page.locator('#eq-det-corpo .eq-detail-view')).toHaveCount(1);
  await expect(page.locator('#eq-det-corpo .eq-detail-cover')).toHaveCount(1);
  await expect(page.locator('#eq-det-corpo [data-action="open-eq-photos-editor"]')).toHaveAttribute(
    'data-id',
    EQUIP_ID,
  );
  await expect(
    page.locator('#eq-det-corpo [data-action="go-register-equip"]').first(),
  ).toHaveAttribute('data-id', EQUIP_ID);
  await expect(
    page.locator('#eq-det-corpo .eq-modal-footer [data-action="edit-equip"]'),
  ).toHaveAttribute('data-id', EQUIP_ID);
  await expect(page.locator('#eq-det-corpo [data-action="toggle-eq-detail-menu"]')).toHaveAttribute(
    'data-id',
    EQUIP_ID,
  );
  await expect(page.locator('#eq-det-corpo [data-action="delete-equip"]')).toHaveAttribute(
    'data-id',
    EQUIP_ID,
  );
}
