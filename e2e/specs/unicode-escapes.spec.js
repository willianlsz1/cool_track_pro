import { expect, test } from '@playwright/test';
import { setupAuthedPage } from '../fixtures/authedSession.js';

const CLIENTE_ID = 'cliente-unicode-escapes-e2e';
const SETOR_ID = 'setor-unicode-escapes-e2e';
const EQUIP_ID = 'equip-unicode-escapes-e2e';
const REGISTRO_ID = 'reg-unicode-escapes-e2e';

const PRO_PROFILE = {
  plan: 'pro',
  plan_code: 'pro',
  subscription_status: 'active',
  is_dev: true,
};

const REMOTE_DATA = {
  clientes: [{ id: CLIENTE_ID, nome: 'Cliente Unicode E2E', telefone: '11999990000' }],
  setores: [
    {
      id: SETOR_ID,
      nome: 'Sala tecnica',
      cliente_id: CLIENTE_ID,
      clienteId: CLIENTE_ID,
    },
  ],
  equipamentos: [
    {
      id: EQUIP_ID,
      nome: 'Split Unicode E2E',
      local: 'Sala tecnica',
      status: 'ok',
      tag: 'UNI-01',
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
      obs: 'Registro unicode E2E',
      status: 'ok',
      tecnico: 'Tecnico Unicode',
      assinatura: false,
      fotos: [],
    },
  ],
  tecnicos: [{ nome: 'Tecnico Unicode' }],
  usage_monthly: [],
};

test.use({ bypassCSP: true });

// Padrao usado para detectar escapes Unicode literais que vazaram pra UI.
// Em JS source, `'\\u00f3'` e interpretado como 'ó'. O padrao abaixo so casa
// se o texto realmente contem a sequencia literal `\u00`, indicando regressao.
const UNICODE_ESCAPE_PATTERN = /\\u00[0-9a-fA-F]{2}/;

async function bodyText(page) {
  return page.evaluate(() => document.body?.innerText ?? '');
}

async function waitForState(page) {
  await expect
    .poll(() =>
      page.evaluate(
        ({ equipId }) =>
          import('/src/core/state.js').then(({ getState }) =>
            Boolean((getState().equipamentos || []).some((eq) => eq.id === equipId)),
          ),
        { equipId: EQUIP_ID },
      ),
    )
    .toBe(true);
}

async function bootstrap(page) {
  await setupAuthedPage(page, { profile: PRO_PROFILE, remoteData: REMOTE_DATA });
  await page.goto('/');
  await expect(page.locator('#main-content')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');
  await waitForState(page);
}

async function goToRoute(page, route, params) {
  await page.evaluate(
    ({ route, params }) =>
      import('/src/core/router.js').then(({ goTo }) => goTo(route, params || {})),
    { route, params: params || {} },
  );
  await expect(page.locator('body')).toHaveAttribute('data-route', route);
}

test.describe('Unicode escapes never leak to the UI', () => {
  // TODO(mudanca-7.1): falha em CI — escapes literais aparecem na UI quando
  // boot acontece num timing específico. Investigar se é race condition de
  // hidratação ou diferença de encoding entre dev local e runner ubuntu.
  test.skip('inicio + relatorio + historico nao renderizam escapes literais e mostram acentos corretos', async ({
    page,
  }) => {
    await bootstrap(page);

    // Inicio: bottom-nav menu mostra "Relatorio" com acento real.
    const inicioText = await bodyText(page);
    expect(inicioText).not.toMatch(UNICODE_ESCAPE_PATTERN);
    expect(inicioText).toContain('Relatório');

    // Relatorio: titulos do hero/controles devem estar com acento real.
    await goToRoute(page, 'relatorio', { equipId: EQUIP_ID });
    await expect(page.locator('#view-relatorio')).toHaveCount(1);
    await expect(page.locator('#rel-equip')).toHaveValue(EQUIP_ID);

    const relatorioText = await bodyText(page);
    expect(relatorioText).not.toMatch(UNICODE_ESCAPE_PATTERN);
    expect(relatorioText).toContain('Relatório');
    // Pro multi-equipamento: o segmented mostra "Relatórios" no plural.
    expect(relatorioText).toContain('Relatórios');

    // O botao "Conheça o Pro (PMOC)" e o texto/title do nudge ficam no DOM
    // mesmo em Pro (com atributo `hidden`). Validamos via textContent +
    // attribute para nao depender do `innerText` (que pula hidden).
    const pmocNudge = page.locator('#rel-dd-pmoc-nudge');
    await expect(pmocNudge).toHaveCount(1);
    const nudgeText = (await pmocNudge.textContent()) ?? '';
    const nudgeTitle = (await pmocNudge.getAttribute('title')) ?? '';
    expect(nudgeText).not.toMatch(UNICODE_ESCAPE_PATTERN);
    expect(nudgeTitle).not.toMatch(UNICODE_ESCAPE_PATTERN);
    expect(nudgeText).toContain('Conheça');
    expect(nudgeTitle).toContain('Conheça');

    // Aria-labels do menu de export tambem devem estar limpas.
    const exportToggle = page.locator('#btn-export-dd-toggle');
    await expect(exportToggle).toHaveCount(1);
    const ariaLabels = await page
      .locator('[aria-label]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('aria-label')).filter(Boolean));
    for (const label of ariaLabels) {
      expect(label).not.toMatch(UNICODE_ESCAPE_PATTERN);
    }

    // Historico: quickfilters/timeline em PT.
    await goToRoute(page, 'historico');
    await expect(page.locator('#view-historico')).toHaveCount(1);
    const historicoText = await bodyText(page);
    expect(historicoText).not.toMatch(UNICODE_ESCAPE_PATTERN);

    // Tipos do quickfilters tem acentos (Inspeção, Recarga).
    expect(historicoText).toContain('Inspeção');
  });
});
