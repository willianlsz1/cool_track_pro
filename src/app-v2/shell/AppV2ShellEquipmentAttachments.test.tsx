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

describe('AppV2Shell equipment attachments', () => {
  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }

    root = null;
    document.body.innerHTML = '';
  });

  it('mostra e adiciona anexos placeholder locais no detalhe sem input de arquivo', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);

    expect(host.textContent).toContain('Anexos locais');
    expect(host.textContent).toContain('1/3 anexos locais');
    expect(host.textContent).toContain('Foto local evaporadora');
    expect(host.querySelector('input[type="file"]')).toBeNull();

    await clickButton(host, /^Adicionar anexo placeholder$/i);

    expect(host.textContent).toContain('2/3 anexos locais');
    expect(host.textContent).toContain('Documento local 2');
    expect(host.textContent).not.toContain('Upload');
    expect(host.textContent).not.toContain('Supabase');
  });
});
