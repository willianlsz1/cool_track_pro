import { expect, test } from '@playwright/test';

test.describe('App-v2 service layout', () => {
  test('mantem labels da execucao separados dos campos compactos em desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await openServiceExecutionStep(page);

    await assertFieldLabelSpacing(page, 'input[name="service-parts-cost"]');
    await assertFieldLabelSpacing(page, 'input[name="service-labor-cost"]');
    await assertFieldLabelSpacing(page, 'input[name="service-next-maintenance"]');
    await assertStatusLabelSpacing(page);
    await assertServiceFlowUsesDesktopWidth(page);
  });

  test('mantem grupos de labels e campos separados em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 824 });
    await openServiceExecutionStep(page);

    await assertFieldGroupSpacing(page, {
      previousFieldSelector: 'input[name="service-parts-cost"]',
      nextLabelText: 'Custo de mao de obra',
    });
    await assertFieldGroupSpacing(page, {
      previousFieldSelector: 'input[name="service-labor-cost"]',
      nextLabelText: 'Proxima manutencao',
    });
    await assertFieldGroupSpacing(page, {
      previousFieldSelector: 'input[name="service-next-maintenance"]',
      nextLabelText: 'Status final',
    });
  });
});

async function openServiceExecutionStep(page) {
  await page.goto('/src/app-v2/preview.html');

  await page.getByRole('button', { name: /^Servi/i }).click();
  await page.getByRole('button', { name: /Iniciar registro/i }).click();
  await page
    .getByRole('button', { name: /^Iniciar /i })
    .first()
    .click();
  await page.getByRole('button', { name: /^Continuar$/i }).click();
  await page.getByRole('button', { name: /^Preventiva/i }).click();
  await page.getByRole('button', { name: /^Continuar$/i }).click();
}

async function assertFieldLabelSpacing(page, fieldSelector) {
  const metrics = await page.locator(fieldSelector).evaluate((field) => {
    const label = field.closest('label');
    const labelText = label?.querySelector('span');

    if (!label || !labelText) {
      throw new Error(`Campo sem label estruturado: ${fieldSelector}`);
    }

    const labelRect = labelText.getBoundingClientRect();
    const fieldRect = field.getBoundingClientRect();

    return {
      gap: fieldRect.top - labelRect.bottom,
      label: labelText.textContent?.trim(),
      labelBottom: labelRect.bottom,
      fieldTop: fieldRect.top,
    };
  });

  expect(metrics.gap, `${metrics.label} deve manter respiro antes do campo`).toBeGreaterThanOrEqual(
    20,
  );
  expect(metrics.fieldTop, `${metrics.label} nao pode sobrepor o campo`).toBeGreaterThan(
    metrics.labelBottom,
  );
}

async function assertStatusLabelSpacing(page) {
  const metrics = await page.getByText('Status final', { exact: true }).evaluate((labelText) => {
    const buttons = labelText.parentElement?.querySelector('div');

    if (!buttons) {
      throw new Error('Status final sem grupo de botoes');
    }

    const labelRect = labelText.getBoundingClientRect();
    const buttonsRect = buttons.getBoundingClientRect();

    return {
      gap: buttonsRect.top - labelRect.bottom,
      labelBottom: labelRect.bottom,
      buttonsTop: buttonsRect.top,
    };
  });

  expect(metrics.gap, 'Status final deve manter respiro antes dos botoes').toBeGreaterThanOrEqual(
    20,
  );
  expect(metrics.buttonsTop, 'Status final nao pode sobrepor botoes').toBeGreaterThan(
    metrics.labelBottom,
  );
}

async function assertFieldGroupSpacing(page, { previousFieldSelector, nextLabelText }) {
  const metrics = await page.locator(previousFieldSelector).evaluate((previousField, labelText) => {
    const labels = Array.from(document.querySelectorAll('label span, p'));
    const nextLabel = labels.find((element) => element.textContent?.trim() === labelText);

    if (!nextLabel) {
      throw new Error(`Label nao encontrado: ${labelText}`);
    }

    const previousRect = previousField.getBoundingClientRect();
    const nextLabelRect = nextLabel.getBoundingClientRect();

    return {
      gap: nextLabelRect.top - previousRect.bottom,
      previousBottom: previousRect.bottom,
      nextLabelTop: nextLabelRect.top,
    };
  }, nextLabelText);

  expect(
    metrics.gap,
    `${nextLabelText} deve manter respiro antes de iniciar o proximo grupo`,
  ).toBeGreaterThanOrEqual(20);
  expect(
    metrics.nextLabelTop,
    `${nextLabelText} nao pode invadir a borda do campo anterior`,
  ).toBeGreaterThan(metrics.previousBottom);
}

async function assertServiceFlowUsesDesktopWidth(page) {
  const metrics = await page.locator('main').evaluate((main) => {
    const appSurface = main.parentElement;

    if (!appSurface) {
      throw new Error('Fluxo sem superficie de app');
    }

    const mainRect = main.getBoundingClientRect();
    const appRect = appSurface.getBoundingClientRect();

    return {
      appWidth: appRect.width,
      mainWidth: mainRect.width,
      ratio: mainRect.width / appRect.width,
    };
  });

  expect(metrics.ratio, 'Registro de Servico deve aproveitar a largura desktop').toBeGreaterThan(
    0.9,
  );
  expect(
    metrics.mainWidth,
    'Registro de Servico nao deve ficar preso em largura estreita',
  ).toBeGreaterThan(1500);
}
