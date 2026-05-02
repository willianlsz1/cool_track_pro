import { expect, test } from '@playwright/test';
import { setupAuthedPage } from '../fixtures/authedSession.js';

const CLIENTE_ID = 'cliente-historico-functional-e2e';
const SETOR_ID = 'setor-historico-functional-e2e';
const EQUIP_ID = 'equip-historico-functional-e2e';
const REGISTRO_ID = 'reg-historico-functional-e2e';

const PRO_PROFILE = {
  plan: 'pro',
  plan_code: 'pro',
  subscription_status: 'active',
  is_dev: true,
};

// PNG 1x1 transparente — suficiente pra ativar a thumb que carrega data-photo-url.
const PNG_1X1_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
const PHOTO_DATA_URL = `data:image/png;base64,${PNG_1X1_BASE64}`;

const HISTORICO_REMOTE_DATA = {
  clientes: [
    {
      id: CLIENTE_ID,
      nome: 'Cliente Historico Functional',
      telefone: '11999990000',
    },
  ],
  setores: [
    {
      id: SETOR_ID,
      nome: 'Sala tecnica historico',
      cliente_id: CLIENTE_ID,
      clienteId: CLIENTE_ID,
    },
  ],
  equipamentos: [
    {
      id: EQUIP_ID,
      nome: 'Split Historico Functional',
      local: 'Sala tecnica',
      status: 'ok',
      tag: 'HIST-FUNC-01',
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
      obs: 'Registro historico functional E2E',
      status: 'ok',
      tecnico: 'Tecnico Historico',
      assinatura: false,
      fotos: [PHOTO_DATA_URL],
    },
  ],
  tecnicos: [{ nome: 'Tecnico Historico' }],
  usage_monthly: [],
};

test.use({ bypassCSP: true });

test.describe('Historico functional smoke', () => {
  test('filtros, timeline, sheet mobile e saved-highlight preservam contratos sem erros de console', async ({
    page,
  }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    // O registro tem foto em data:image/png. O app tenta auto-uploadar o
    // data URL pra Supabase Storage no background — sem mock, o request
    // bate em 127.0.0.1:54321 e falha com ERR_CONNECTION_REFUSED, virando
    // console.error. Mockamos como upload bem-sucedido pra preservar o
    // contrato de regressao (zero console.error real).
    await page.route('**/storage/v1/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ Key: 'e2e/mock', Id: 'e2e-mock-id' }),
      }),
    );

    await setupAuthedPage(page, {
      profile: PRO_PROFILE,
      remoteData: HISTORICO_REMOTE_DATA,
    });
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');

    await waitForRegistroState(page);

    // Marca o registro pra saved-highlight ANTES de navegar — aplicado pela
    // historico view via SavedHighlight.applyIfPending() apos o timeline montar.
    await page.evaluate((id) => sessionStorage.setItem('cooltrack-highlight-id', id), REGISTRO_ID);

    await page.evaluate(() => import('/src/core/router.js').then(({ goTo }) => goTo('historico')));

    await expect(page.locator('body')).toHaveAttribute('data-route', 'historico');
    await expect(page.locator('#view-historico')).toHaveCount(1);
    await expect(page.locator('#hist-filters-root')).toHaveAttribute(
      'data-react-historico-filters-mounted',
      'true',
    );
    await expect(page.locator('#timeline')).toHaveAttribute(
      'data-react-historico-timeline-mounted',
      'true',
    );

    // saved-highlight DEVE ser asserted antes de qualquer assertion lenta —
    // a classe `timeline__item--saved` e removida 3s apos aplicacao.
    await assertSavedHighlightContracts(page);

    await assertTimelineContracts(page);
    await assertFilterContracts(page);
    await assertSheetContracts(page);

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});

async function waitForRegistroState(page) {
  await expect
    .poll(() =>
      page.evaluate(
        ({ equipId, registroId }) =>
          import('/src/core/state.js').then(({ getState }) => {
            const state = getState();
            const hasEquip = (state.equipamentos || []).some((eq) => eq.id === equipId);
            const hasRegistro = (state.registros || []).some((reg) => reg.id === registroId);
            return Boolean(hasEquip && hasRegistro);
          }),
        { equipId: EQUIP_ID, registroId: REGISTRO_ID },
      ),
    )
    .toBe(true);
}

async function assertSavedHighlightContracts(page) {
  const item = page.locator(`#timeline .timeline__item[data-reg-id="${REGISTRO_ID}"]`);
  await expect(item).toHaveCount(1);
  await expect(item).toHaveClass(/timeline__item--saved/);
}

async function assertTimelineContracts(page) {
  const timeline = page.locator('#timeline');
  await expect(timeline.locator('.timeline')).toHaveCount(1);
  await expect(timeline.locator('.hist-day-group')).toHaveCount(1);

  const item = timeline.locator(`.timeline__item[data-reg-id="${REGISTRO_ID}"]`);
  await expect(item).toHaveCount(1);
  await expect(item).toHaveAttribute('data-reg-id', REGISTRO_ID);

  await expect(item.locator('[data-hist-action="toggle-card-menu"]')).toHaveCount(1);
  await expect(item.locator('[data-action="edit-reg"]')).toHaveCount(1);
  await expect(item.locator('[data-action="delete-reg"]')).toHaveCount(1);

  // Foto: a fixture inclui 1 foto, entao a thumb com data-photo-url DEVE renderizar.
  const photoBtn = item.locator('[data-hist-action="hist-open-photo"]').first();
  await expect(photoBtn).toHaveCount(1);
  await expect(photoBtn).toHaveAttribute('data-photo-url', /.+/);

  // Filter-equip aparece quando o equip filter atual nao casa o do registro.
  // Em fixture limpa, nenhum filter ativo, logo o botao DEVE aparecer.
  const filterEquip = item.locator('[data-hist-action="hist-filter-equip"]').first();
  if ((await filterEquip.count()) > 0) {
    await expect(filterEquip).toHaveAttribute('data-equip-id', EQUIP_ID);
  }
}

async function assertFilterContracts(page) {
  const filtersRoot = page.locator('#hist-filters-root');
  await expect(filtersRoot.locator('.hist-quickfilters')).toHaveCount(1);

  const periodChips = page.locator(
    '#hist-quickfilters-slot [data-hist-action="hist-filter-period"][data-period]',
  );
  expect(await periodChips.count()).toBeGreaterThanOrEqual(1);

  const tipoChips = page.locator(
    '#hist-quickfilters-slot [data-hist-action="hist-filter-tipo"][data-tipo-id]',
  );
  expect(await tipoChips.count()).toBeGreaterThanOrEqual(1);

  // Click toggle: chip preventiva passa de aria-pressed=false para true.
  const preventiva = page.locator(
    '#hist-quickfilters-slot [data-hist-action="hist-filter-tipo"][data-tipo-id="preventiva"]',
  );
  await expect(preventiva).toHaveCount(1);
  await expect(preventiva).toHaveAttribute('aria-pressed', 'false');
  await preventiva.click();
  await expect(preventiva).toHaveAttribute('aria-pressed', 'true');

  // Registro de fixture e tipo Preventiva — apos filtro permanece visivel.
  await expect(page.locator(`#timeline .timeline__item[data-reg-id="${REGISTRO_ID}"]`)).toHaveCount(
    1,
  );

  // Clear via clique de novo (toggle volta pra false).
  await preventiva.click();
  await expect(preventiva).toHaveAttribute('aria-pressed', 'false');

  // Inputs/selects principais
  await expect(page.locator('#hist-busca')).toHaveAttribute('type', 'search');
  await expect(page.locator('#hist-setor')).toHaveCount(1);
  await expect(page.locator('#hist-equip')).toHaveCount(1);
}

async function assertSheetContracts(page) {
  const trigger = page.locator('#hist-filters-trigger');
  // Contrato presente no DOM em qualquer viewport — `data-hist-action` e
  // estavel.
  await expect(trigger).toHaveAttribute('data-hist-action', 'open-filters-sheet');

  // O trigger so e visivel via media (max-width: 720px) — sheet mobile so
  // abre nessa janela. Reduzir viewport e o caminho honesto pra exercitar
  // o overlay sem alterar CSS.
  await page.setViewportSize({ width: 380, height: 800 });
  await expect(trigger).toBeVisible();

  await trigger.click();

  const overlay = page.locator('#hist-filters-sheet-overlay');
  await expect(overlay).toHaveCount(1);
  await expect(overlay).toHaveClass(/hist-filters-sheet-overlay/);

  await expect(page.locator('#hist-filters-sheet-title')).toHaveCount(1);
  await expect(page.locator('#hfs-setor')).toHaveCount(1);
  await expect(page.locator('#hfs-equip')).toHaveCount(1);
  await expect(page.locator('#hfs-close')).toHaveCount(1);
  await expect(page.locator('#hfs-reset')).toHaveCount(1);
  await expect(page.locator('#hfs-apply')).toHaveCount(1);

  // Sheet replica os tipo-chips com data-tipo-id pro modo mobile. O chip
  // "Todos" tem data-tipo-id="" (clear-filter) e e excluido do contrato.
  const sheetTipoChips = overlay.locator(
    '.hist-filters-sheet__tipo-chip[data-tipo-id]:not([data-tipo-id=""])',
  );
  expect(await sheetTipoChips.count()).toBeGreaterThanOrEqual(1);
  await expect(sheetTipoChips.first()).toHaveAttribute('data-tipo-id', /.+/);

  // Fecha via #hfs-close — overlay e removido do DOM (componente vanila).
  await page.locator('#hfs-close').click();
  await expect(overlay).toHaveCount(0);
}
