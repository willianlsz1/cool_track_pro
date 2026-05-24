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

async function fillTextControl(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
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

describe('AppV2Shell Orçamentos', () => {
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

  it('abre Orçamentos dentro de Serviços com lista mockada sem ações sensíveis', async () => {
    const host = await renderShell(createQuoteSnapshot());
    const sidebar = host.querySelector('aside[aria-label="Navegação principal"]');
    const bottomNav = host.querySelector('nav[aria-label="Navegação principal"]');

    expect(sidebar?.textContent).not.toContain('Orçamentos');
    expect(bottomNav?.textContent).not.toContain('Orçamentos');

    await clickButton(host, /^Servi/i);
    await clickButton(host, /^Orçamentos$/i);

    expect(host.textContent).toContain('Orçamentos locais');
    expect(host.textContent).toContain('ORC-2026-001');
    expect(host.textContent).toContain('Troca de controlador');
    expect(host.textContent).toContain('Mercado Bom');
    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('R$ 1.250,00');
    expect(host.textContent).not.toContain('WhatsApp');
    expect(host.textContent).not.toContain('PDF');
    expect(host.textContent).not.toContain('Assinatura');
  });

  it('edita rascunho de Orcamento local sem integrar recursos comerciais ou storage', async () => {
    const host = await renderShell(createQuoteSnapshot());

    await openQuoteEditor(host);

    const title = host.querySelector('input[name="quote-title"]');
    const status = host.querySelector('select[name="quote-status"]');
    expect(title).toBeInstanceOf(HTMLInputElement);
    expect(status).toBeInstanceOf(HTMLSelectElement);

    expect(host.textContent).toContain('Orçamentos · Acompanhamento');
    expect(host.textContent).toContain('Edição local · Controle de itens e valores');
    expect(host.textContent).toContain('Modelos de orçamento');
    expect(host.textContent).toContain('Itens do orçamento');
    expect(host.textContent).toContain('Instalação split');
    expect(
      (host.querySelector('input[name="quote-item-0-description"]') as HTMLInputElement).value,
    ).toBe('Equipamento split (especificar modelo)');
    expect(
      (host.querySelector('input[name="quote-item-0-unit-value"]') as HTMLInputElement).value,
    ).toBe('0,00');
    expect(
      (host.querySelector('input[name="quote-validity-days"]') as HTMLInputElement).value,
    ).toBe('');
    expect(
      (host.querySelector('input[name="quote-payment-terms"]') as HTMLInputElement).value,
    ).toBe('');

    await clickButton(host, /Manutenção corretiva/i);
    expect(host.textContent).toContain('Diagnóstico técnico');
    expect(host.textContent).toContain('Modelo aplicado: Manutenção corretiva');
    expect(host.textContent).toContain('Aplicado');
    expect(
      (host.querySelector('input[name="quote-item-0-unit-value"]') as HTMLInputElement).value,
    ).toBe('0,00');

    await fillTextControl(title as HTMLInputElement, 'Troca revisada do controlador');
    await fillTextControl(
      host.querySelector('textarea[name="quote-description"]') as HTMLTextAreaElement,
      'Substituicao do controlador com testes finais.',
    );
    await fillTextControl(
      host.querySelector('input[name="quote-item-0-description"]') as HTMLInputElement,
      'Sensor NTC',
    );
    await fillTextControl(
      host.querySelector('input[name="quote-item-0-unit-value"]') as HTMLInputElement,
      '210,00',
    );
    await fillTextControl(
      host.querySelector('input[name="quote-discount"]') as HTMLInputElement,
      '30,00',
    );
    await fillTextControl(
      host.querySelector('input[name="quote-validity-days"]') as HTMLInputElement,
      '12',
    );
    await fillTextControl(
      host.querySelector('input[name="quote-payment-terms"]') as HTMLInputElement,
      'Pagamento na aprovacao',
    );
    await fillTextControl(
      host.querySelector('textarea[name="quote-notes"]') as HTMLTextAreaElement,
      'Garantia tecnica local.',
    );
    await selectOption(status as HTMLSelectElement, 'enviado');
    await clickButton(host, /^Salvar rascunho$/i);

    expect(host.textContent).toContain('Troca revisada do controlador');
    expect(host.textContent).toContain('Enviado');
    expect(host.textContent).toContain('R$ 180,00');
    expect(host.textContent).toContain('3 itens locais');
    expect(host.textContent).not.toContain(['Bill', 'ing'].join(''));
    expect(host.textContent).not.toContain('Supabase');
    expect(host.textContent).not.toContain('WhatsApp');
  });

  it('salva itens simples no rascunho de Orcamento local e recalcula total', async () => {
    const host = await renderShell(createQuoteSnapshot());

    await openQuoteEditor(host);

    await fillTextControl(
      host.querySelector('input[name="quote-item-description"]') as HTMLInputElement,
      'Controlador digital',
    );
    await fillTextControl(
      host.querySelector('input[name="quote-item-quantity"]') as HTMLInputElement,
      '1',
    );
    await fillTextControl(
      host.querySelector('input[name="quote-item-unit-value"]') as HTMLInputElement,
      '980,00',
    );
    await clickButton(host, /^Adicionar$/i);

    expect(
      (host.querySelector('input[name="quote-item-4-description"]') as HTMLInputElement).value,
    ).toBe('Controlador digital');
    expect(host.textContent).toContain('R$ 980,00');

    await clickButton(host, /^Salvar rascunho$/i);

    expect(host.textContent).toContain('5 itens locais');
    expect(host.textContent).toContain('R$ 980,00');
    expect(host.textContent).not.toContain(['Bill', 'ing'].join(''));
    expect(host.textContent).not.toContain('Supabase');
    expect(host.textContent).not.toContain('WhatsApp');
  });

  it('cria rascunho pre-servico por equipamento sem registro concluido', async () => {
    const host = await renderShell(createQuoteSnapshot({ orcamentos: [] }));

    await clickButton(host, /^Servi/i);
    await clickButton(host, /^Orçamentos$/i);
    await clickButton(host, /^Novo orçamento local$/i);

    expect(host.textContent).toContain('Novo orçamento pré-serviço');

    const equipment = host.querySelector('select[name="quote-create-equipment"]');
    const template = host.querySelector('select[name="quote-create-template"]');
    expect(equipment).toBeInstanceOf(HTMLSelectElement);
    expect(template).toBeInstanceOf(HTMLSelectElement);

    await selectOption(equipment as HTMLSelectElement, 'eq-1');
    await selectOption(template as HTMLSelectElement, 'instalacao-split');
    await clickButton(host, /^Criar rascunho$/i);

    expect(host.textContent).toContain('Orçamentos · Acompanhamento');
    expect(host.textContent).toContain('ORC-2026-001');
    expect(host.textContent).toContain('Mercado Bom');
    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('Rascunho local');
    expect(host.textContent).toContain('Instalação split');
    expect(host.textContent).not.toContain(['Bill', 'ing'].join(''));
    expect(host.textContent).not.toContain('Supabase');
    expect(host.textContent).not.toContain('WhatsApp');
    expect(host.textContent).not.toContain('Exportar PDF');

    await clickButton(host, /^Salvar rascunho$/i);

    expect(host.textContent).toContain('Orçamento pré-serviço - Split 24.000 BTU');
    expect(host.textContent).toContain('ORC-2026-001');
    expect(host.textContent).toContain('4 itens locais');
  });

  it('filtra letras em quantidade e valores do editor de Orcamento', async () => {
    const host = await renderShell(createQuoteSnapshot());

    await openQuoteEditor(host);

    await fillTextControl(
      host.querySelector('input[name="quote-item-0-quantity"]') as HTMLInputElement,
      'abc12',
    );
    await fillTextControl(
      host.querySelector('input[name="quote-item-0-unit-value"]') as HTMLInputElement,
      'R$ 9x8,7z6',
    );
    await fillTextControl(
      host.querySelector('input[name="quote-discount"]') as HTMLInputElement,
      'd1e0,00',
    );
    await fillTextControl(
      host.querySelector('input[name="quote-validity-days"]') as HTMLInputElement,
      '7 dias',
    );

    expect(
      (host.querySelector('input[name="quote-item-0-quantity"]') as HTMLInputElement).value,
    ).toBe('12');
    expect(
      (host.querySelector('input[name="quote-item-0-unit-value"]') as HTMLInputElement).value,
    ).toBe('98,76');
    expect((host.querySelector('input[name="quote-discount"]') as HTMLInputElement).value).toBe(
      '10,00',
    );
    expect(
      (host.querySelector('input[name="quote-validity-days"]') as HTMLInputElement).value,
    ).toBe('7');
  });
});

function createQuoteSnapshot(overrides: Partial<AppV2MockSnapshot> = {}): AppV2MockSnapshot {
  return createAppV2MockSnapshot({
    ...overrides,
    orcamentos: overrides.orcamentos ?? [
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
  await clickButton(host, /^Orçamentos$/i);
  await clickButton(host, /^Editar orçamento$/i);
}
