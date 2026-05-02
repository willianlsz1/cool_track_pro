import { expect, test } from '@playwright/test';
import { setupAuthedPage } from '../fixtures/authedSession.js';

const CLIENTE_ID = 'cliente-relatorio-export-pmoc-e2e';
const SETOR_ID = 'setor-relatorio-export-pmoc-e2e';
const EQUIP_ID = 'equip-relatorio-export-pmoc-e2e';
const EQUIP_NOME = 'Split Relatorio Export PMOC';
const REGISTRO_ID = 'reg-relatorio-export-pmoc-e2e';

const PRO_PROFILE = {
  plan: 'pro',
  plan_code: 'pro',
  subscription_status: 'active',
  is_dev: true,
};

const RELATORIO_REMOTE_DATA = {
  clientes: [
    {
      id: CLIENTE_ID,
      nome: 'Cliente Relatorio Export PMOC',
      telefone: '11999990000',
    },
  ],
  setores: [
    {
      id: SETOR_ID,
      nome: 'Sala tecnica export pmoc',
      cliente_id: CLIENTE_ID,
      clienteId: CLIENTE_ID,
    },
  ],
  equipamentos: [
    {
      id: EQUIP_ID,
      nome: EQUIP_NOME,
      local: 'Sala tecnica',
      status: 'ok',
      tag: 'REL-EXPORT-01',
      tipo: 'Split',
      cliente_id: CLIENTE_ID,
      clienteId: CLIENTE_ID,
      setor_id: SETOR_ID,
      setorId: SETOR_ID,
      periodicidade_preventiva_dias: 30,
      periodicidadePreventivaDias: 30,
      fotos: [],
    },
  ],
  registros: [
    {
      id: REGISTRO_ID,
      equip_id: EQUIP_ID,
      equipId: EQUIP_ID,
      data: '2026-04-30T10:00:00.000Z',
      tipo: 'Preventiva',
      obs: 'Registro relatorio export/PMOC E2E',
      status: 'ok',
      tecnico: 'Tecnico Export',
      assinatura: false,
      fotos: [],
    },
  ],
  tecnicos: [{ nome: 'Tecnico Export' }],
  usage_monthly: [],
};

test.use({ bypassCSP: true });

test.describe('Relatorio export/dropdown/PMOC funcional', () => {
  test('dropdown alterna estado e PDF/WhatsApp/PMOC registram chamadas sem side effects reais', async ({
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

    await mockReportExportHandlers(page);
    await setupAuthedPage(page, {
      profile: PRO_PROFILE,
      remoteData: RELATORIO_REMOTE_DATA,
    });
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');

    await openRelatorio(page);

    await expect(page.locator('#view-relatorio')).toHaveCount(1);
    await expect(page.locator('#rel-equip')).toHaveValue(EQUIP_ID);

    await assertDropdownToggleContracts(page);
    await assertExportActionContracts(page);
    await assertPmocContracts(page);
    await assertQuotaSlotContracts(page);

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
        function record(kind, payload) {
          const target = globalThis.window || globalThis;
          target.__relatorioExportPmocE2e ||= { pdf: [], whatsapp: [], pmoc: [] };
          target.__relatorioExportPmocE2e[kind].push(payload || {});
        }

        export function buildReportFilters(filters = {}) {
          return { ...(filters || {}) };
        }

        export async function exportPdfFlow({ filters } = {}) {
          record('pdf', filters);
          return true;
        }

        export async function shareWhatsAppFlow({ filters } = {}) {
          record('whatsapp', filters);
          return true;
        }

        export function bindReportExportHandlers() {
          // Delegate de cliques pra simular o que o handler real faria, mas
          // sem disparar PDF/WhatsApp reais. Mantem o toggle do dropdown
          // como contrato DOM puro e grava os cliques de PDF/WhatsApp/PMOC.
          document.addEventListener('click', (event) => {
            const el = event.target?.closest?.('[data-action]');
            if (!el) return;
            const action = el.dataset.action;

            if (action === 'toggle-export-dd') {
              const menu = document.getElementById('rel-export-dd-menu');
              if (!menu) return;
              const willOpen = menu.hidden;
              menu.hidden = !willOpen;
              el.setAttribute('aria-expanded', String(willOpen));
              return;
            }

            if (action === 'export-pdf') {
              record('pdf', {
                equipId: document.getElementById('rel-equip')?.value || '',
                source: el.id || null,
              });
              return;
            }

            if (action === 'whatsapp-export') {
              record('whatsapp', {
                equipId: document.getElementById('rel-equip')?.value || '',
                source: el.id || null,
              });
              return;
            }

            if (action === 'open-pmoc-modal') {
              record('pmoc', {
                tier: el.dataset?.tier || null,
                source: el.id || null,
              });
              return;
            }
          });
        }
      `,
    }),
  );
}

async function openRelatorio(page) {
  await waitForEquipmentState(page);

  await page.evaluate((equipId) => {
    return import('/src/core/router.js').then(({ goTo }) => goTo('relatorio', { equipId }));
  }, EQUIP_ID);

  await expect(page.locator('body')).toHaveAttribute('data-route', 'relatorio');
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

async function assertDropdownToggleContracts(page) {
  const toggle = page.locator('#btn-export-dd-toggle');
  const menu = page.locator('#rel-export-dd-menu');

  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toHaveJSProperty('hidden', true);

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toHaveJSProperty('hidden', false);

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toHaveJSProperty('hidden', true);
}

async function assertExportActionContracts(page) {
  const initial = await page.evaluate(
    () => globalThis.window.__relatorioExportPmocE2e || { pdf: [], whatsapp: [], pmoc: [] },
  );
  expect(initial.pdf.length).toBe(0);
  expect(initial.whatsapp.length).toBe(0);

  const pdfBtn = page.locator('#btn-export-pdf');
  await expect(pdfBtn).toHaveAttribute('data-action', 'export-pdf');
  await pdfBtn.click();
  await expect
    .poll(() => page.evaluate(() => globalThis.window.__relatorioExportPmocE2e?.pdf?.length || 0))
    .toBe(1);

  const pdfCall = await page.evaluate(
    () => globalThis.window.__relatorioExportPmocE2e?.pdf?.[0] || null,
  );
  expect(pdfCall).toMatchObject({ equipId: EQUIP_ID, source: 'btn-export-pdf' });

  const whatsBtn = page.locator('#btn-whatsapp');
  await expect(whatsBtn).toHaveAttribute('data-action', 'whatsapp-export');
  await whatsBtn.click();
  await expect
    .poll(() =>
      page.evaluate(() => globalThis.window.__relatorioExportPmocE2e?.whatsapp?.length || 0),
    )
    .toBe(1);

  const whatsCall = await page.evaluate(
    () => globalThis.window.__relatorioExportPmocE2e?.whatsapp?.[0] || null,
  );
  expect(whatsCall).toMatchObject({ equipId: EQUIP_ID, source: 'btn-whatsapp' });
}

async function assertPmocContracts(page) {
  const toggle = page.locator('#btn-export-dd-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  const pmocMain = page.locator('#rel-dd-pmoc-main');
  if ((await pmocMain.count()) === 0) {
    await toggle.click();
    return;
  }

  await expect(pmocMain).toHaveAttribute('data-action', 'open-pmoc-modal');
  await expect(pmocMain).toHaveAttribute('data-tier', /.+/);

  await pmocMain.click();
  await expect
    .poll(() => page.evaluate(() => globalThis.window.__relatorioExportPmocE2e?.pmoc?.length || 0))
    .toBeGreaterThan(0);

  const pmocCall = await page.evaluate(
    () => globalThis.window.__relatorioExportPmocE2e?.pmoc?.[0] || null,
  );
  expect(pmocCall).toMatchObject({ source: 'rel-dd-pmoc-main' });
  expect(typeof pmocCall.tier === 'string' && pmocCall.tier.length > 0).toBe(true);
}

async function assertQuotaSlotContracts(page) {
  const slot = page.locator('#pdf-quota-slot');
  await expect(slot).toHaveCount(1);

  const badge = slot.locator('#pdf-quota-badge');
  if ((await badge.count()) > 0) {
    await expect(badge).toHaveAttribute('role', 'status');
    await expect(badge).toHaveAttribute('aria-live', 'polite');
    await expect(badge).toHaveClass(/pdf-quota-badge/);
  }
}
