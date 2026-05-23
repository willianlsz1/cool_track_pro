import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ClientForm } from './ClientForm';
import type { SaveClientDraft } from './clientActions';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let root: Root | null = null;

async function renderForm(onSave = vi.fn((_draft: SaveClientDraft) => null)) {
  const host = document.createElement('div');
  document.body.appendChild(host);

  root = createRoot(host);
  await act(async () => {
    root?.render(<ClientForm title="Novo cliente" onCancel={() => undefined} onSave={onSave} />);
  });

  return { host, onSave };
}

async function fillInput(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
  const valueSetter = Object.getOwnPropertyDescriptor(prototype.prototype, 'value')?.set;

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

describe('ClientForm', () => {
  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }

    root = null;
    document.body.innerHTML = '';
  });

  it('envia cadastro avancado do cliente como rascunho local', async () => {
    const onSave = vi.fn((_draft: SaveClientDraft) => null);
    const { host } = await renderForm(onSave);

    expect(host.textContent).toContain('Dados principais');
    expect(host.textContent).toContain('Como encontrar e acionar o cliente');
    expect(host.textContent).toContain('Documentos e observações');

    await fillInput(
      host.querySelector('input[name="client-name"]') as HTMLInputElement,
      'Mercado Bom',
    );
    await fillInput(
      host.querySelector('input[name="client-legal-name"]') as HTMLInputElement,
      'Mercado Bom LTDA',
    );
    await fillInput(
      host.querySelector('input[name="client-document"]') as HTMLInputElement,
      '12.345.678/0001-90',
    );
    await selectOption(
      host.querySelector('select[name="client-environment"]') as HTMLSelectElement,
      'Comercial',
    );
    await fillInput(
      host.querySelector('input[name="client-address"]') as HTMLInputElement,
      'Rua Central, 42',
    );
    await fillInput(
      host.querySelector('input[name="client-contact"]') as HTMLInputElement,
      '(11) 99999-0000',
    );
    await fillInput(
      host.querySelector('input[name="client-ticket-channel"]') as HTMLInputElement,
      'Portal do cliente',
    );
    await fillInput(
      host.querySelector('input[name="client-state-registration"]') as HTMLInputElement,
      'Isento',
    );
    await fillInput(
      host.querySelector('input[name="client-city-registration"]') as HTMLInputElement,
      '12345',
    );
    await fillInput(
      host.querySelector('textarea[name="client-internal-notes"]') as HTMLTextAreaElement,
      'Avisar antes da visita.',
    );
    await clickButton(host, /^Salvar cliente$/i);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Mercado Bom',
        razaoSocial: 'Mercado Bom LTDA',
        documento: '12.345.678/0001-90',
        finalidadeAmbiente: 'Comercial',
        endereco: 'Rua Central, 42',
        contato: '(11) 99999-0000',
        canalChamados: 'Portal do cliente',
        inscricaoEstadual: 'Isento',
        inscricaoMunicipal: '12345',
        observacoesInternas: 'Avisar antes da visita.',
      }),
    );
  });
});
