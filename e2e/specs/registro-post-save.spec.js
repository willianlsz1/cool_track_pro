import { expect, test } from '@playwright/test';
import { setupAuthedPage } from '../fixtures/authedSession.js';

const EQUIP_ID = 'equip-registro-post-save-e2e';

const REGISTRO_REMOTE_DATA = {
  equipamentos: [
    {
      id: EQUIP_ID,
      nome: 'Split Registro E2E',
      local: 'Sala tecnica',
      status: 'ok',
      tag: 'REG-01',
      tipo: 'Split',
      periodicidade_preventiva_dias: 30,
    },
  ],
  registros: [],
  tecnicos: [{ nome: 'Tecnico E2E' }],
};

test.use({ bypassCSP: true });

test.describe('Registro post-save legacy flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockReportExportHandlers(page);
    await setupAuthedPage(page, { remoteData: REGISTRO_REMOTE_DATA });
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');
  });

  test('salva registro com campos React e exibe CTAs pos-save sem export real', async ({
    page,
  }) => {
    const consoleErrors = [];
    const pageErrors = [];
    const downloads = [];
    const popups = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('download', (download) => downloads.push(download.suggestedFilename()));
    page.on('popup', (popup) => popups.push(popup.url()));

    await goToRegistro(page);

    await expect(page.locator('#view-registro')).toHaveCount(1);
    await expect(page.locator('#registro-header-root')).toHaveAttribute(
      'data-react-registro-header-mounted',
      'true',
    );
    await expect(page.locator('#r-checklist-body')).toHaveCount(1);
    await expect(
      page.locator('#registro-header-root[data-react-registro-header-mounted="true"]'),
    ).toHaveCount(1);

    await fillRequiredRegistroFields(page);
    await assertChecklistIsland(page);
    await markMinimalChecklist(page);

    await page.locator('[data-action="save-registro"]').click();

    const toast = page.locator('[data-testid="post-save-registro-toast"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Split Registro E2E');
    await expect(toast.locator('.share-success-toast__action--pdf')).toHaveCount(1);
    await expect(toast.locator('.share-success-toast__action--pdf')).toHaveAttribute(
      'data-destination',
      'pdf',
    );
    await expect(toast.locator('.share-success-toast__action--whatsapp')).toHaveCount(1);
    await expect(toast.locator('.share-success-toast__action--whatsapp')).toHaveAttribute(
      'data-destination',
      'whatsapp',
    );

    const savedSnapshot = await page.evaluate(() => {
      return import('/src/core/state.js').then(({ getState }) => {
        const registros = getState().registros || [];
        return registros.at(-1) || null;
      });
    });

    expect(savedSnapshot).toMatchObject({
      equipId: EQUIP_ID,
      tipo: 'Manutenção Preventiva',
      tecnico: 'Tecnico E2E',
    });
    expect(savedSnapshot?.obs).toContain('Registro E2E preenchido no browser');
    expect(savedSnapshot?.checklist?.items?.some((item) => item.status === 'ok')).toBe(true);

    await toast.locator('.share-success-toast__action--pdf').click();
    await expect(page.locator('body')).toHaveAttribute('data-route', 'relatorio');

    const exportCalls = await page.evaluate(() => window.__registroPostSaveE2e);
    expect(exportCalls.pdf).toHaveLength(1);
    expect(exportCalls.pdf[0]).toMatchObject({ equipId: EQUIP_ID });
    expect(exportCalls.whatsapp).toHaveLength(0);
    expect(downloads).toEqual([]);
    expect(popups).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('salva e compartilha com WhatsApp mockado sem PDF, download ou popup real', async ({
    page,
  }) => {
    const consoleErrors = [];
    const pageErrors = [];
    const downloads = [];
    const popups = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('download', (download) => downloads.push(download.suggestedFilename()));
    page.on('popup', (popup) => popups.push(popup.url()));

    await goToRegistro(page);
    await expect(page.locator('#view-registro')).toHaveCount(1);
    await expect(page.locator('#registro-header-root')).toHaveAttribute(
      'data-react-registro-header-mounted',
      'true',
    );
    await expect(page.locator('#r-checklist-body')).toHaveCount(1);
    await expect(page.locator('#registro-photos-root')).toHaveCount(1);
    await expect(page.locator('#registro-signature-hint')).toHaveCount(1);

    await fillRequiredRegistroFields(page);
    await assertRegistroIslands(page);
    await markMinimalChecklist(page);

    await page.locator('[data-action="save-and-share-registro"]').click();

    const savedSnapshot = await page.evaluate(() => {
      return import('/src/core/state.js').then(({ getState }) => {
        const registros = getState().registros || [];
        return registros.at(-1) || null;
      });
    });

    expect(savedSnapshot).toMatchObject({
      equipId: EQUIP_ID,
      tecnico: 'Tecnico E2E',
    });
    expect(savedSnapshot?.tipo).toContain('Preventiva');
    expect(savedSnapshot?.obs).toContain('Registro E2E preenchido no browser');
    expect(savedSnapshot?.checklist?.items?.some((item) => item.status === 'ok')).toBe(true);

    await expect(page.locator('#toast-container .toast--success')).toContainText(
      'Abrindo WhatsApp',
    );
    await expect(page.locator('body')).toHaveAttribute('data-route', 'registro');

    const exportCalls = await page.evaluate(
      () => window.__registroPostSaveE2e || { pdf: [], whatsapp: [] },
    );
    expect(exportCalls.whatsapp).toHaveLength(1);
    expect(exportCalls.whatsapp[0]).toMatchObject({
      equipId: EQUIP_ID,
      registroId: savedSnapshot.id,
    });
    expect(exportCalls.pdf).toHaveLength(0);
    expect(downloads).toEqual([]);
    expect(popups).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});

async function mockReportExportHandlers(page) {
  await page.route('**/src/ui/controller/handlers/reportExportHandlers.js*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        function record(kind, filters) {
          const target = globalThis.window || globalThis;
          target.__registroPostSaveE2e ||= { pdf: [], whatsapp: [] };
          target.__registroPostSaveE2e[kind].push(filters || {});
        }

        export function buildReportFilters(filters = {}) {
          return { ...(filters || {}) };
        }

        export async function exportPdfFlow({ filters } = {}) {
          record('pdf', filters);
          throw new Error('E2E PDF export mocked');
        }

        export async function shareWhatsAppFlow({ filters } = {}) {
          record('whatsapp', filters);
          return true;
        }

        export function bindReportExportHandlers() {}
      `,
    }),
  );
}

async function goToRegistro(page) {
  await page.evaluate((equipId) => {
    return import('/src/core/router.js').then(({ goTo }) => goTo('registro', { equipId }));
  }, EQUIP_ID);
  await expect(page.locator('body')).toHaveAttribute('data-route', 'registro');
}

async function fillRequiredRegistroFields(page) {
  await page.locator('#r-equip').selectOption(EQUIP_ID, { force: true });
  await expect(page.locator('#r-equip')).toHaveValue(EQUIP_ID);
  await expect(page.locator('#r-equip')).toHaveAttribute('data-registro-checklist-bound', '1');
  await page.locator('#r-equip').dispatchEvent('change');

  await page.locator('#r-data').fill('2026-05-01T10:15', { force: true });
  await page.locator('#r-tipo').selectOption('Manutenção Preventiva');
  await page
    .locator('#r-obs')
    .fill('Registro E2E preenchido no browser com checklist e toast pós-save.');
  await page.locator('#r-tecnico').fill('Tecnico E2E');
}

async function assertRegistroIslands(page) {
  await expect(page.locator('#view-registro')).toHaveCount(1);
  await expect(page.locator('#registro-header-root')).toHaveAttribute(
    'data-react-registro-header-mounted',
    'true',
  );
  await expect(page.locator('#r-checklist-body')).toHaveAttribute(
    'data-react-registro-checklist-mounted',
    'true',
  );
  await expect(page.locator('#registro-photos-root')).toHaveAttribute(
    'data-react-registro-photos-mounted',
    'true',
  );
  await expect(page.locator('#registro-signature-hint')).toHaveAttribute(
    'data-react-registro-signature-mounted',
    'true',
  );
}

async function assertChecklistIsland(page) {
  await expect(page.locator('#r-checklist-body')).toHaveAttribute(
    'data-react-registro-checklist-mounted',
    'true',
  );
  await expect(
    page.locator('#r-checklist-body[data-react-registro-checklist-mounted="true"]'),
  ).toHaveCount(1);
}

async function markMinimalChecklist(page) {
  const checklistDetails = page.locator('#r-checklist-details');
  await expect(checklistDetails).toBeVisible();
  if (!(await checklistDetails.evaluate((node) => node.open))) {
    await checklistDetails.locator('summary').click();
  }
  await expect(checklistDetails).toHaveJSProperty('open', true);

  const checklistOk = page
    .locator('#r-checklist-body [data-action="r-checklist-set"][data-status="ok"]')
    .first();
  await expect(checklistOk).toHaveCount(1);
  await checklistOk.click();
  await expect(checklistOk).toHaveAttribute('aria-pressed', 'true');
}
