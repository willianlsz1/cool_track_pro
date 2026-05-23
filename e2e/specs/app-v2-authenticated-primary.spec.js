import { expect, test } from '@playwright/test';

import { fakeUser, setupAuthedPage } from '../fixtures/authedSession.js';

test.use({ bypassCSP: true });

test.describe('App-v2 authenticated primary entrypoint', () => {
  test('carrega clientes remotos e salva cliente pela raiz principal', async ({ page }) => {
    const errors = collectBlockingErrors(page);
    const clientWrites = [];

    await setupAuthedPage(page, {
      remoteData: {
        clientes: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            nome: 'Cliente Supabase CP-AE',
            razao_social: 'Cliente Supabase CP-AE LTDA',
            cnpj: '12.345.678/0001-90',
            contato: '(31) 99999-0000',
            endereco: 'Rua Teste, 100',
            inscricao_estadual: null,
            inscricao_municipal: null,
            url_chamados: null,
            finalidade: 'Comercial',
            observacoes: null,
          },
        ],
      },
    });

    page.on('request', (request) => {
      if (request.method() !== 'POST' || !request.url().includes('/rest/v1/clientes')) {
        return;
      }

      clientWrites.push(request.postDataJSON());
    });

    await page.goto('/equipamentos');

    await page.getByRole('button', { name: 'Clientes' }).click();
    await expect(page.getByRole('button', { name: /Cliente Supabase CP-AE/ })).toBeVisible();

    await page.getByRole('button', { name: 'Novo cliente' }).click();
    await page.getByLabel('Nome do cliente').fill('Cliente Criado CP-AE');
    await page.getByRole('button', { name: 'Salvar cliente' }).click();

    await expect(page.getByRole('button', { name: /Cliente Criado CP-AE/ })).toBeVisible();
    expect(clientWrites).toHaveLength(1);
    expect(clientWrites[0]).toMatchObject({
      nome: 'Cliente Criado CP-AE',
      user_id: fakeUser.id,
    });
    expect(errors()).toEqual([]);
  });
});

function collectBlockingErrors(page) {
  const errors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  return () => errors;
}
