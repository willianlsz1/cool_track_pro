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

async function fillTextarea(textarea: HTMLTextAreaElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;

  await act(async () => {
    valueSetter?.call(textarea, value);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('AppV2Shell', () => {
  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }

    root = null;
    document.body.innerHTML = '';
  });

  it('aplica a conclusao do servico na store mockada exibida pela Central', async () => {
    const host = await renderShell();

    await clickButton(host, /Iniciar serviço/i);
    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Preventiva/i);
    await clickButton(host, /^Continuar$/i);

    const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
    await fillTextarea(diagnosis, 'QA diagnóstico shell store.');
    await fillTextarea(actionsDone, 'QA ações shell store.');

    await clickButton(host, /^Revisar$/i);
    await clickButton(host, /^Concluir serviço$/i);

    expect(host.textContent).toContain('Serviço concluído');

    await clickButton(host, /Voltar para Serviços/i);

    expect(host.textContent).not.toContain('EM ANDAMENTO');
    expect(host.textContent).not.toContain('Pronto para revisão');
    expect(host.textContent).toContain('QA diagnóstico shell store.');
    expect(host.textContent).toContain('QA ações shell store.');
  });
});
