import { expect, test } from '@playwright/test';

test.describe('App-v2 primary entrypoint', () => {
  test('renderiza a raiz principal sem voltar para o shell legado', async ({ page }) => {
    const errors = collectBlockingErrors(page);

    await page.goto('/');

    await expect(page.locator('#app-v2-root')).toHaveCount(1);
    await expect(page.locator('#app')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Hoje' })).toBeVisible();
    await expect(page.getByText('CoolTrack Pro').first()).toBeVisible();

    const entrypoint = await page.evaluate(() => ({
      scripts: Array.from(document.scripts)
        .map((script) => script.getAttribute('src'))
        .filter(Boolean),
      stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map((link) => link.getAttribute('href'))
        .filter(Boolean),
    }));

    expect(entrypoint.scripts).not.toContain('/src/app.js');
    expect(entrypoint.stylesheets).not.toContain('/src/assets/styles/redesign.css');
    expect(errors()).toEqual([]);
  });

  test('mantem fallback SPA para rota nao-arquivo no preview de producao', async ({ page }) => {
    const errors = collectBlockingErrors(page);

    await page.goto('/equipamentos');

    await expect(page.locator('#app-v2-root')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Hoje' })).toBeVisible();
    await expect(page.locator('#app')).toHaveCount(0);
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
