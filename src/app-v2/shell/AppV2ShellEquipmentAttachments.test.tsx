import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

import { AppV2Shell } from './AppV2Shell';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let root: Root | null = null;

async function renderShell() {
  const host = document.createElement('div');
  document.body.appendChild(host);

  root = createRoot(host);
  await act(async () => {
    root?.render(<AppV2Shell />);
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

async function fillInput(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

  await act(async () => {
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('AppV2Shell equipment photos', () => {
  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }

    root = null;
    document.body.innerHTML = '';
  });

  it('mostra e adiciona fotos locais no detalhe sem input de arquivo', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);

    expect(host.textContent).toContain('Fotos do equipamento');
    expect(host.textContent).toContain('1/3 fotos locais');
    expect(host.textContent).toContain('Foto local evaporadora');
    expect(host.querySelector('input[type="file"]')).toBeNull();

    await clickButton(host, /^Adicionar foto local$/i);

    expect(host.textContent).toContain('2/3 fotos locais');
    expect(host.textContent).toContain('Foto local 2');
    expect(host.textContent).not.toContain('Upload');
    expect(host.textContent).not.toContain('Supabase');
  });

  it('agenda preventiva local pelo detalhe do equipamento sem calendario externo', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Cassete recep/i);
    await clickButton(host, /^Agendar preventiva local$/i);

    expect(host.textContent).toContain('Cria um compromisso mockado');

    const date = host.querySelector('input[name="equipment-preventive-date"]');
    expect(date).toBeInstanceOf(HTMLInputElement);
    await fillInput(date as HTMLInputElement, '2026-06-10');
    await clickButton(host, /^Salvar preventiva$/i);

    expect(host.textContent).toMatch(/Pr.xima preventiva em 10\/06/);
    expect(host.textContent).not.toContain('Calendario');
    expect(host.textContent).not.toContain('Supabase');
  });
});
