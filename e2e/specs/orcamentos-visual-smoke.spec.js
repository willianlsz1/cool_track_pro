import { expect, test } from '@playwright/test';
import { setupAuthedPage } from '../fixtures/authedSession.js';

const PRO_PROFILE = {
  plan: 'pro',
  subscription_status: 'active',
};

const ORCAMENTOS_ROWS = [
  {
    id: 'orc-e2e-rascunho',
    numero: 'ORC-2026-0001',
    cliente_nome: 'Cliente Rascunho',
    cliente_telefone: '11999990001',
    titulo: 'Instalacao rascunho',
    subtotal: 1000,
    desconto: 0,
    total: 1000,
    validade_dias: 7,
    status: 'rascunho',
    created_at: '2026-04-24T10:00:00.000Z',
  },
  {
    id: 'orc-e2e-enviado',
    numero: 'ORC-2026-0002',
    cliente_nome: 'Cliente Enviado',
    cliente_telefone: '11999990002',
    titulo: 'Instalacao enviada',
    subtotal: 1500,
    desconto: 0,
    total: 1500,
    validade_dias: 30,
    status: 'enviado',
    enviado_em: '2026-04-25T10:00:00.000Z',
    created_at: '2026-04-25T10:00:00.000Z',
  },
  {
    id: 'orc-e2e-visualizado',
    numero: 'ORC-2026-0003',
    cliente_nome: 'Cliente Visualizado',
    cliente_telefone: '11999990003',
    titulo: 'Instalacao visualizada',
    subtotal: 1700,
    desconto: 0,
    total: 1700,
    validade_dias: 30,
    status: 'visualizado',
    visualizado_em: '2026-04-26T10:00:00.000Z',
    created_at: '2026-04-26T10:00:00.000Z',
  },
  {
    id: 'orc-e2e-aprovado',
    numero: 'ORC-2026-0004',
    cliente_nome: 'Cliente Aprovado',
    cliente_telefone: '11999990004',
    titulo: 'Instalacao aprovada',
    subtotal: 2000,
    desconto: 0,
    total: 2000,
    validade_dias: 30,
    status: 'aprovado',
    aprovado_em: '2026-04-27T10:00:00.000Z',
    created_at: '2026-04-27T10:00:00.000Z',
  },
  {
    id: 'orc-e2e-recusado',
    numero: 'ORC-2026-0005',
    cliente_nome: 'Cliente Recusado',
    cliente_telefone: '11999990005',
    titulo: 'Instalacao recusada',
    subtotal: 900,
    desconto: 0,
    total: 900,
    validade_dias: 30,
    status: 'recusado',
    created_at: '2026-04-28T10:00:00.000Z',
  },
  {
    id: 'orc-e2e-expirado',
    numero: 'ORC-2026-0006',
    cliente_nome: 'Cliente Expirado',
    cliente_telefone: '11999990006',
    titulo: 'Instalacao expirada',
    subtotal: 1200,
    desconto: 0,
    total: 1200,
    validade_dias: 1,
    status: 'expirado',
    enviado_em: '2026-04-01T10:00:00.000Z',
    created_at: '2026-04-29T10:00:00.000Z',
  },
];

test.use({ bypassCSP: true });

test.describe('Orcamentos visual smoke', () => {
  async function setupOrcamentosPage(page, orcamentos) {
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
      remoteData: {
        orcamentos,
      },
    });
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');
    await page.evaluate(() =>
      import('/src/core/router.js').then(({ goTo }) => {
        goTo('orcamentos');
      }),
    );
    await expect(page.locator('body')).toHaveAttribute('data-route', 'orcamentos');
    await expect(page.locator('#view-orcamentos')).toHaveCount(1);
    await expect(page.locator('[data-react-orcamentos-page="true"]')).toHaveCount(1);

    return {
      assertNoErrors() {
        expect(pageErrors).toEqual([]);
        expect(consoleErrors).toEqual([]);
      },
    };
  }

  test('estado vazio preserva CTA e contratos principais', async ({ page }) => {
    const monitor = await setupOrcamentosPage(page, []);

    await expect(page.locator('.orc-empty')).toHaveCount(1);
    await expect(page.locator('.orc-empty__cta')).toHaveAttribute(
      'data-action',
      'open-orcamento-modal',
    );
    await expect(page.locator('.orc-empty__cta')).toHaveAttribute('data-mode', 'create');
    await expect(page.locator('.orc-card')).toHaveCount(0);

    monitor.assertNoErrors();
  });

  test('lista com cards preserva status, actions e filtros apos Button/Badge', async ({ page }) => {
    const monitor = await setupOrcamentosPage(page, ORCAMENTOS_ROWS);

    await expect(page.locator('.orc-empty')).toHaveCount(0);
    await expect(page.locator('.orc-card')).toHaveCount(ORCAMENTOS_ROWS.length);
    await expect(page.locator('.orc-card__numero')).toHaveCount(ORCAMENTOS_ROWS.length);

    for (const status of [
      'rascunho',
      'enviado',
      'visualizado',
      'aprovado',
      'recusado',
      'expirado',
    ]) {
      await expect(page.locator(`.orc-status-pill[data-status="${status}"]`)).toHaveCount(1);
    }

    const enviadoCard = page.locator('.orc-card[data-id="orc-e2e-enviado"]');
    await expect(enviadoCard).toHaveCount(1);
    await expect(
      enviadoCard.locator('[data-action="open-orcamento-modal"][data-mode="edit"]'),
    ).toHaveAttribute('data-id', 'orc-e2e-enviado');
    await expect(enviadoCard.locator('[data-action="orc-share"]')).toHaveAttribute(
      'data-id',
      'orc-e2e-enviado',
    );
    await expect(enviadoCard.locator('[data-action="orc-download"]')).toHaveAttribute(
      'data-id',
      'orc-e2e-enviado',
    );
    await expect(enviadoCard.locator('[data-action="orc-mark-approved"]')).toHaveAttribute(
      'data-id',
      'orc-e2e-enviado',
    );

    await expect(
      page.locator('.orc-filter-chips [data-action="orc-set-status-filter"]'),
    ).toHaveCount(6);

    await page.click('.orc-filter-chips [data-status="rascunho"]');
    await expect(page.locator('.orc-card')).toHaveCount(1);
    await expect(page.locator('.orc-card[data-id="orc-e2e-rascunho"]')).toHaveCount(1);
    await expect(page.locator('.orc-chip[data-status="rascunho"]')).toHaveClass(/is-active/);

    await page.click('.orc-filter-chips [data-status="enviado"]');
    await expect(page.locator('.orc-card')).toHaveCount(1);
    await expect(page.locator('.orc-card[data-id="orc-e2e-enviado"]')).toHaveCount(1);
    await expect(page.locator('.orc-chip[data-status="enviado"]')).toHaveClass(/is-active/);

    await page.click('.orc-filter-chips [data-status="todos"]');
    await expect(page.locator('.orc-card')).toHaveCount(ORCAMENTOS_ROWS.length);

    monitor.assertNoErrors();
  });
});
