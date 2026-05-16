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

  it('renderiza sidebar desktop e bottom nav mobile com as quatro areas existentes', async () => {
    const host = await renderShell();
    const sidebar = host.querySelector('aside[aria-label="Navegacao principal"]');
    const bottomNav = host.querySelector('nav[aria-label="Navegacao principal"]');
    const officialIcon = sidebar?.querySelector('img');

    expect(sidebar?.className).toContain('tw-w-[248px]');
    expect(sidebar?.className).toContain('lg:tw-flex');
    expect(bottomNav?.className).toContain('lg:tw-hidden');
    expect(officialIcon?.getAttribute('src')).toBe('/icons/icon-192x192.png');
    expect(sidebar?.textContent).toContain('Hoje');
    expect(sidebar?.textContent).toContain('Equipamentos');
    expect(sidebar?.textContent).toContain('Servi');
    expect(sidebar?.textContent).toContain('Conta');
    expect(sidebar?.textContent).not.toContain('Clientes');
  });

  it('troca entre as abas principais sem criar novas areas', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    expect(host.textContent).toContain('Parque');

    await clickButton(host, /^Servi/i);
    expect(host.textContent).toContain('Registros recentes');

    await clickButton(host, /^Conta$/i);
    expect(host.textContent).toContain('Em breve');
    expect(host.textContent).toContain('Conta');
    expect(host.textContent).not.toContain('Billing');
    expect(host.textContent).not.toContain('Supabase');
  });

  it('abre o detalhe de equipamento a partir da lista', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);

    expect(host.textContent).toContain('Voltar para equipamentos');
    expect(host.textContent).toContain('Resumo');
    expect(host.textContent).toContain('Cliente vinculado');
  });

  it('abre Clientes como subvisao dentro de Equipamentos e retorna para a lista', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Clientes$/i);

    expect(host.textContent).toContain('Base instalada por cliente');
    expect(host.textContent).toContain('Mercado Bom');
    expect(host.textContent).toContain('Ind');

    await clickButton(host, /^Equipamentos$/i);

    expect(host.textContent).toContain('Parque');
    expect(host.textContent).toContain('Split 24.000 BTU');
  });

  it('abre detalhe de cliente e permite acessar equipamento vinculado', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Clientes$/i);
    await clickButton(host, /Mercado Bom/i);

    expect(host.textContent).toContain('Voltar para clientes');
    expect(host.textContent).toContain('Equipamentos vinculados');
    expect(host.textContent).toContain('3 equipamentos vinculados');

    await clickButton(host, /C.mara fria/i);

    expect(host.textContent).toContain('Voltar para equipamentos');
    expect(host.textContent).toContain('Cliente vinculado');
  });

  it('inicia e retoma um servico em andamento pelo shell', async () => {
    const host = await renderShell();

    await clickButton(host, /Iniciar servi/i);
    expect(host.textContent).toContain('Registro de servi');

    await clickButton(host, /Voltar para Servi/i);
    expect(host.textContent).toContain('Em andamento');

    await clickButton(host, /Retomar registro/i);
    expect(host.textContent).toContain('Registro de servi');
  });
});
