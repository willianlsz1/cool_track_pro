import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppV2MockSnapshot, type AppV2MockSnapshot } from '../data/appV2MockStore';
import { AppV2Shell } from './AppV2Shell';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let root: Root | null = null;

async function renderShell(initialSnapshot?: AppV2MockSnapshot) {
  const host = document.createElement('div');
  document.body.appendChild(host);

  root = createRoot(host);
  await act(async () => {
    root?.render(<AppV2Shell initialSnapshot={initialSnapshot} />);
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

async function selectOption(select: HTMLSelectElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;

  await act(async () => {
    valueSetter?.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

describe('AppV2Shell Orcamentos', () => {
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

  it('abre Orcamentos dentro de Servicos com lista mockada sem acoes sensiveis', async () => {
    const host = await renderShell(createQuoteSnapshot());
    const sidebar = host.querySelector('aside[aria-label="Navegação principal"]');
    const bottomNav = host.querySelector('nav[aria-label="Navegação principal"]');

    expect(sidebar?.textContent).not.toContain('Orcamentos');
    expect(bottomNav?.textContent).not.toContain('Orcamentos');

    await clickButton(host, /^Servi/i);
    await clickButton(host, /^Orcamentos$/i);

    expect(host.textContent).toContain('Pipeline local');
    expect(host.textContent).toContain('ORC-2026-001');
    expect(host.textContent).toContain('Troca de controlador');
    expect(host.textContent).toContain('Mercado Bom');
    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('R$ 1.250,00');
    expect(host.textContent).not.toContain('WhatsApp');
    expect(host.textContent).not.toContain('PDF');
    expect(host.textContent).not.toContain('Assinatura');
  });

  it('edita rascunho de Orcamento local sem integrar billing ou storage', async () => {
    const host = await renderShell(createQuoteSnapshot());

    await openQuoteEditor(host);

    const title = host.querySelector('input[name="quote-title"]');
    const total = host.querySelector('input[name="quote-total"]');
    const status = host.querySelector('select[name="quote-status"]');
    expect(title).toBeInstanceOf(HTMLInputElement);
    expect(total).toBeInstanceOf(HTMLInputElement);
    expect(status).toBeInstanceOf(HTMLSelectElement);

    await fillInput(title as HTMLInputElement, 'Troca revisada do controlador');
    await fillInput(total as HTMLInputElement, '1480,50');
    await selectOption(status as HTMLSelectElement, 'enviado');
    await clickButton(host, /^Salvar orcamento$/i);

    expect(host.textContent).toContain('Troca revisada do controlador');
    expect(host.textContent).toContain('Enviado');
    expect(host.textContent).toContain('R$ 1.480,50');
    expect(host.textContent).not.toContain('Billing');
    expect(host.textContent).not.toContain('Supabase');
    expect(host.textContent).not.toContain('WhatsApp');
  });

  it('salva itens simples no rascunho de Orcamento local e recalcula total', async () => {
    const host = await renderShell(createQuoteSnapshot());

    await openQuoteEditor(host);

    await fillInput(
      host.querySelector('input[name="quote-item-description"]') as HTMLInputElement,
      'Controlador digital',
    );
    await fillInput(
      host.querySelector('input[name="quote-item-quantity"]') as HTMLInputElement,
      '1',
    );
    await fillInput(
      host.querySelector('input[name="quote-item-unit-value"]') as HTMLInputElement,
      '980,00',
    );
    await clickButton(host, /^Adicionar item$/i);

    expect(host.textContent).toContain('Controlador digital');
    expect(host.textContent).toContain('R$ 980,00');

    await clickButton(host, /^Salvar orcamento$/i);

    expect(host.textContent).toContain('1 item local');
    expect(host.textContent).toContain('R$ 980,00');
    expect(host.textContent).not.toContain('Billing');
    expect(host.textContent).not.toContain('Supabase');
    expect(host.textContent).not.toContain('WhatsApp');
  });
});

function createQuoteSnapshot(): AppV2MockSnapshot {
  return createAppV2MockSnapshot({
    orcamentos: [
      {
        id: 'orc-1',
        numero: 'ORC-2026-001',
        status: 'rascunho',
        clienteId: 'cliente-1',
        equipamentoId: 'eq-1',
        registroId: 'registro-2',
        titulo: 'Troca de controlador',
        total: 1250,
      },
    ],
  });
}

async function openQuoteEditor(host: HTMLElement) {
  await clickButton(host, /^Servi/i);
  await clickButton(host, /^Orcamentos$/i);
  await clickButton(host, /^Editar orcamento$/i);
}
