import { expect, test } from '@playwright/test';
import { setupAuthedPage } from '../fixtures/authedSession.js';

const EQUIP_ID = 'equip-registro-visual-smoke-e2e';

const REGISTRO_REMOTE_DATA = {
  equipamentos: [
    {
      id: EQUIP_ID,
      nome: 'Split Registro Smoke',
      local: 'Sala tecnica',
      status: 'ok',
      tag: 'REG-SMOKE-01',
      tipo: 'Split',
      periodicidade_preventiva_dias: 30,
    },
  ],
  registros: [],
  tecnicos: [{ nome: 'Tecnico Smoke' }],
};

test.use({ bypassCSP: true });

test.describe('Registro visual smoke', () => {
  test('renderiza roots, CTAs e contratos principais sem erros de console', async ({ page }) => {
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
      remoteData: REGISTRO_REMOTE_DATA,
    });
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');

    await openRegistro(page);

    await expect(page.locator('#view-registro')).toHaveCount(1);
    await assertHeaderContracts(page);
    await assertChecklistContracts(page);
    await assertPhotosContracts(page);
    await assertSignatureContracts(page);

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});

async function openRegistro(page) {
  await waitForEquipmentState(page);

  await page.evaluate((equipId) => {
    return import('/src/core/router.js').then(({ goTo }) => goTo('registro', { equipId }));
  }, EQUIP_ID);

  await expect(page.locator('body')).toHaveAttribute('data-route', 'registro');
  await expect(page.locator('#r-equip')).toHaveValue(EQUIP_ID);
  await expect(page.locator('#r-equip')).toHaveAttribute('data-registro-checklist-bound', '1');
  await page.locator('#r-equip').dispatchEvent('change');
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

async function assertHeaderContracts(page) {
  const headerRoot = page.locator('#registro-header-root');

  await expect(headerRoot).toHaveCount(1);
  await expect(headerRoot).toHaveAttribute('data-react-registro-header-mounted', 'true');
  await expect(page.locator('#registro-hero')).toHaveCount(1);
  await expect(page.locator('#r-equip')).toHaveCount(1);
  await expect(page.locator('#r-data')).toHaveCount(1);
  await expect(page.locator('#r-tipo')).toHaveCount(1);
  await expect(page.locator('#r-obs')).toHaveCount(1);
  await expect(page.locator('#r-tecnico')).toHaveCount(1);
  await expect(page.locator('[data-action="save-registro"]')).toHaveCount(1);
  await expect(page.locator('[data-action="save-and-share-registro"]')).toHaveCount(1);
}

async function assertChecklistContracts(page) {
  const checklistRoot = page.locator('#r-checklist-body');
  const checklistActions = checklistRoot.locator('[data-action="r-checklist-set"]');

  await expect(checklistRoot).toHaveCount(1);
  await expect(checklistRoot).toHaveAttribute('data-react-registro-checklist-mounted', 'true');
  await expect(page.locator('#r-checklist-details')).toHaveCount(1);
  await expect(page.locator('#r-checklist-summary')).toHaveCount(1);
  await expect(checklistRoot.locator('.r-checklist__intro')).toHaveCount(1);

  const actionCount = await checklistActions.count();
  if (actionCount > 0) {
    await expect(checklistActions.first()).toHaveAttribute('data-item', /.+/);
    await expect(checklistActions.first()).toHaveAttribute('data-status', /^(ok|fail|na)$/);
    await expect(checklistActions.first()).toHaveAttribute('aria-pressed', /^(true|false)$/);
    return;
  }

  await expect(checklistRoot.locator('.r-checklist__empty')).toHaveCount(1);
}

async function assertPhotosContracts(page) {
  const photosRoot = page.locator('#registro-photos-root');

  await expect(photosRoot).toHaveCount(1);
  await expect(photosRoot).toHaveAttribute('data-react-registro-photos-mounted', 'true');
  await expect(page.locator('#photo-drop-zone')).toHaveCount(1);
  await expect(page.locator('#photo-drop-zone')).toHaveClass(/registro-photo-drop/);
  await expect(page.locator('#photo-drop-text')).toHaveCount(1);
  await expect(page.locator('#input-fotos')).toHaveCount(1);
  await expect(page.locator('#input-fotos-camera')).toHaveCount(1);
  await expect(page.locator('#photo-preview')).toHaveCount(1);
  await expect(page.locator('#photo-preview')).toHaveClass(/photo-grid/);
}

async function assertSignatureContracts(page) {
  const signatureRoot = page.locator('#registro-signature-hint');

  await expect(signatureRoot).toHaveCount(1);
  await expect(signatureRoot).toHaveClass(/registro-sig-hint/);
  await expect(signatureRoot).toHaveAttribute('data-react-registro-signature-mounted', 'true');

  const signatureActions = signatureRoot.locator('[data-r-action]');
  if ((await signatureActions.count()) > 0) {
    await expect(signatureActions.first()).toHaveAttribute('data-r-action', /^registro-signature-/);
  }

  const upsellCta = signatureRoot.locator('[data-action="signature-upsell-cta"]');
  if ((await upsellCta.count()) > 0) {
    await expect(upsellCta.first()).toHaveAttribute('data-action', 'signature-upsell-cta');
  }
}
