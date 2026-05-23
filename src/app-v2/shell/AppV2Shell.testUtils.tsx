import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { vi } from 'vitest';

import { createAppV2MockSnapshot, type AppV2MockSnapshot } from '../data/appV2MockStore';
import { AppV2Shell } from './AppV2Shell';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let root: Root | null = null;

export { createAppV2MockSnapshot };
export type { AppV2MockSnapshot };

export async function renderShell(initialSnapshot?: AppV2MockSnapshot) {
  const host = document.createElement('div');
  document.body.appendChild(host);

  root = createRoot(host);
  await act(async () => {
    root?.render(<AppV2Shell initialSnapshot={initialSnapshot} />);
  });

  return host;
}

export async function cleanupShell() {
  if (root) {
    await act(async () => {
      root?.unmount();
    });
  }

  root = null;
  document.body.innerHTML = '';
  window.history.pushState({}, '', '/');
  vi.restoreAllMocks();
}

export async function clickButton(host: HTMLElement, label: RegExp) {
  const button = Array.from(host.querySelectorAll('button')).find((item) =>
    label.test(item.textContent ?? ''),
  );

  const fallbackButton =
    button ??
    Array.from(host.querySelectorAll('button')).find((item) => {
      const text = item.textContent ?? '';
      return (
        (label.source.includes('Concluir') && /Concluir servi/i.test(text)) ||
        (label.source.includes('Voltar') && /Voltar para Servi/i.test(text))
      );
    });

  if (!fallbackButton) {
    throw new Error(`Botao nao encontrado: ${label}`);
  }

  await act(async () => {
    fallbackButton.click();
  });
}

export async function fillTextarea(textarea: HTMLTextAreaElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;

  await act(async () => {
    valueSetter?.call(textarea, value);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

export async function fillInput(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

  await act(async () => {
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

export async function selectOption(select: HTMLSelectElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;

  await act(async () => {
    valueSetter?.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
