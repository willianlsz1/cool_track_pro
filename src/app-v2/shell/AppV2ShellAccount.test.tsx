import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import { AppV2Shell } from './AppV2Shell';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let root: Root | null = null;

async function renderShell() {
  const host = document.createElement('div');
  document.body.appendChild(host);

  root = createRoot(host);
  await act(async () => {
    root?.render(<AppV2Shell initialSnapshot={createAppV2MockSnapshot()} />);
  });

  return host;
}

async function clickButton(host: HTMLElement, label: RegExp) {
  const button = Array.from(host.querySelectorAll('button')).find((item) =>
    label.test(item.textContent ?? ''),
  );

  if (!button) {
    throw new Error(`Botao nao encontrado: ${label}`);
  }

  await act(async () => {
    button.click();
  });
}

async function selectOption(select: HTMLSelectElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;

  await act(async () => {
    valueSetter?.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

describe('AppV2Shell Conta', () => {
  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }

    root = null;
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('renderiza atalhos e preferencias locais sem prometer areas sensiveis', async () => {
    const host = await renderShell();

    await clickButton(host, /^Conta$/i);

    expect(host.textContent).toContain('Painel local');
    expect(host.textContent).toContain('Atalhos e preferencias operacionais locais desta sessao.');
    expect(host.textContent).toContain('Sem pendencias locais');
    expect(host.textContent).toContain('Somente local');
    expect(host.textContent).toContain('Atalhos operacionais');
    expect(host.textContent).toContain('Registrar servico');
    expect(host.textContent).toContain('Clientes');
    expect(host.textContent).toContain('Orcamentos');
    expect(host.textContent).toContain('Densidade visual');
    expect(host.textContent).not.toContain('PMOC');
    expect(host.textContent).not.toContain('Billing');
    expect(host.textContent).not.toContain('Supabase');
    expect(host.textContent).not.toContain('WhatsApp');
    expect(host.textContent).not.toContain('PDF');
    expect(host.textContent).not.toContain('mockadas');
  });

  it('navega por atalhos locais de Conta para Clientes e Orcamentos', async () => {
    const host = await renderShell();

    await clickButton(host, /^Conta$/i);
    await clickButton(host, /^Clientes/i);

    expect(host.textContent).toContain('Base instalada por cliente');

    await clickButton(host, /^Conta$/i);
    await clickButton(host, /^Orcamentos/i);

    expect(host.textContent).toContain('Pipeline local');
  });

  it('mantem preferencias de Conta apenas em memoria', async () => {
    const host = await renderShell();

    await clickButton(host, /^Conta$/i);

    const density = host.querySelector('select[name="account-density"]');
    const startTab = host.querySelector('select[name="account-start-tab"]');
    expect(density).toBeInstanceOf(HTMLSelectElement);
    expect(startTab).toBeInstanceOf(HTMLSelectElement);

    await selectOption(density as HTMLSelectElement, 'compacta');
    await selectOption(startTab as HTMLSelectElement, 'servicos');

    expect(host.textContent).toContain('Compacta');
    expect(host.textContent).toContain('Servicos');
    expect(host.textContent).not.toContain('localStorage');
    expect(host.textContent).not.toContain('Supabase');
  });

  it('aplica preferencias locais em comportamento visivel limitado', async () => {
    const host = await renderShell();

    await clickButton(host, /^Conta$/i);

    const density = host.querySelector('select[name="account-density"]');
    const startTab = host.querySelector('select[name="account-start-tab"]');
    expect(density).toBeInstanceOf(HTMLSelectElement);
    expect(startTab).toBeInstanceOf(HTMLSelectElement);

    await selectOption(density as HTMLSelectElement, 'compacta');
    await selectOption(startTab as HTMLSelectElement, 'servicos');
    await clickButton(host, /^Desligado$/i);

    expect(host.querySelector('[data-account-density="compacta"]')).toBeTruthy();
    expect(host.textContent).toContain('Lembrete local ativo nesta sessao.');

    await clickButton(host, /^Abrir Servicos$/i);

    expect(host.textContent).toContain('Registros recentes');
    expect(host.textContent).not.toContain('localStorage');
    expect(host.textContent).not.toContain('Supabase');
  });

  it('mantem controles de Conta acessiveis e resilientes a texto longo', async () => {
    const host = await renderShell();

    await clickButton(host, /^Conta$/i);

    const density = host.querySelector('select[name="account-density"]');
    const startTab = host.querySelector('select[name="account-start-tab"]');
    const shortcutTitles = host.querySelectorAll('#account-shortcuts-title');
    const shortcutButtons = host.querySelectorAll('[data-account-shortcut]');
    const reminderButton = Array.from(host.querySelectorAll('button')).find((item) =>
      /^Desligado$/i.test(item.textContent ?? ''),
    );

    expect(density).toBeInstanceOf(HTMLSelectElement);
    expect(startTab).toBeInstanceOf(HTMLSelectElement);
    expect(density?.getAttribute('aria-describedby')).toBe('account-density-help');
    expect(startTab?.getAttribute('aria-describedby')).toBe('account-start-tab-help');
    expect(shortcutTitles).toHaveLength(1);
    expect(reminderButton?.getAttribute('aria-pressed')).toBe('false');

    await clickButton(host, /^Desligado$/i);

    expect(reminderButton?.getAttribute('aria-pressed')).toBe('true');
    expect(shortcutButtons.length).toBeGreaterThan(0);
    shortcutButtons.forEach((button) => {
      expect(button.className).toContain('tw-break-words');
      expect(button.className).toContain('tw-min-w-0');
    });
  });
});
