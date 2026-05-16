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

async function fillTextarea(textarea: HTMLTextAreaElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;

  await act(async () => {
    valueSetter?.call(textarea, value);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function fillInput(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

  await act(async () => {
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('AppV2Shell', () => {
  const forbiddenRegulatoryTerm = ['P', 'MOC'].join('');

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

  it('aplica a conclusao do servico na store mockada exibida pela Central', async () => {
    const host = await renderShell();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined);

    await clickButton(host, /Iniciar serviço/i);
    expect(host.textContent).not.toContain('Ver relatorio');

    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Preventiva/i);
    await clickButton(host, /^Continuar$/i);

    const technician = host.querySelector('input[name="service-technician"]');
    expect(technician).toBeInstanceOf(HTMLInputElement);
    await fillInput(technician as HTMLInputElement, 'Ana Tecnica');

    const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
    await fillTextarea(diagnosis, 'QA diagnóstico shell store.');
    await fillTextarea(actionsDone, 'QA ações shell store.');

    await clickButton(host, /^Revisar$/i);
    await clickButton(host, /^Concluir serviço$/i);

    expect(host.textContent).toContain('Serviço concluído');
    expect(host.textContent).toContain('Resumo do serviço');
    expect(host.textContent).toContain('Concluído');
    expect(host.textContent).toContain('Ver relatorio');

    await clickButton(host, /^Ver relatorio$/i);

    expect(host.textContent).toContain('Registro de Servico Tecnico');
    expect(host.textContent).toContain('CoolTrack Pro app-v2');
    expect(host.textContent).toContain('Mercado Bom');
    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('Ana Tecnica');
    expect(host.textContent).not.toContain('Técnico app-v2');
    expect(host.textContent).toContain('QA diagnóstico shell store.');
    expect(host.textContent).toContain('QA ações shell store.');

    expect(host.textContent).toContain('Tecnico/responsavel');
    expect(host.textContent).toContain('Cliente/responsavel');
    expect(host.textContent).not.toContain(forbiddenRegulatoryTerm);

    await clickButton(host, /^Imprimir relatorio$/i);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();

    await clickButton(host, /Voltar para Serviços/i);

    expect(host.textContent).not.toContain('EM ANDAMENTO');
    expect(host.textContent).not.toContain('Pronto para revisão');
    expect(host.textContent).toContain('Ana Tecnica');
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

  it('abre Relatorios dentro de Servicos com busca e preview dedicado', async () => {
    const host = await renderShell();
    const sidebar = host.querySelector('aside[aria-label="Navegacao principal"]');
    const bottomNav = host.querySelector('nav[aria-label="Navegacao principal"]');

    expect(sidebar?.textContent).not.toContain('Relatorios');
    expect(bottomNav?.textContent).not.toContain('Relatorios');

    await clickButton(host, /^Servi/i);
    await clickButton(host, /^Relatorios$/i);

    expect(host.textContent).toContain('Relatorios prontos');
    expect(host.textContent).toContain('Com atencao');
    expect(host.textContent).toContain('Pendentes');
    expect(host.textContent).toContain('Este mes');
    expect(host.textContent).toContain('REL-REGISTRO-1');
    expect(host.textContent).toContain('Split 24.000 BTU');

    const search = host.querySelector('input[aria-label="Buscar relatorios"]');
    expect(search).toBeInstanceOf(HTMLInputElement);
    await fillInput(search as HTMLInputElement, 'camara');

    expect(host.textContent).not.toContain('REL-REGISTRO-1');
    expect(host.textContent).toContain('REL-REGISTRO-2');
    expect(host.textContent).toMatch(/C.mara fria/);

    await clickButton(host, /^Ver relatorio$/i);

    expect(host.textContent).toContain('Voltar para relatorios');
    expect(host.textContent).toContain('Registro de Servico Tecnico');
    expect(host.textContent).toMatch(/C.mara fria/);
    expect(host.querySelector('[data-app-v2-print-scope="service-report"]')).toBeTruthy();
    expect(host.querySelector('[data-app-v2-print-hidden="true"]')).toBeTruthy();

    await clickButton(host, /^Voltar para relatorios$/i);

    expect(host.textContent).toContain('REL-REGISTRO-2');
    expect(host.textContent).not.toContain('Registro de Servico Tecnico');
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
    expect(host.textContent).toContain('Atendimento em andamento');
    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('Mercado Bom');
    expect(host.textContent).toContain('Contexto');

    await clickButton(host, /Voltar para Servi/i);
    expect(host.textContent).toContain('Em andamento');

    await clickButton(host, /Retomar registro/i);
    expect(host.textContent).toContain('Registro de servi');
    expect(host.textContent).toContain('Atendimento em andamento');
  });

  it('permite descrever o tipo Outro sem perder o label na conclusao e no relatorio', async () => {
    const host = await renderShell();

    await clickButton(host, /Iniciar servi/i);
    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Outro/i);

    const customKind = host.querySelector('input[name="service-kind-custom"]');
    expect(customKind).toBeInstanceOf(HTMLInputElement);
    await fillInput(customKind as HTMLInputElement, 'Higienizacao');

    await clickButton(host, /^Continuar$/i);

    const technician = host.querySelector('input[name="service-technician"]');
    expect(technician).toBeInstanceOf(HTMLInputElement);
    await fillInput(technician as HTMLInputElement, 'Ana Tecnica');

    const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
    await fillTextarea(diagnosis, 'Atendimento fora das categorias principais.');
    await fillTextarea(actionsDone, 'Higienizacao completa registrada.');

    await clickButton(host, /^Revisar$/i);

    expect(host.textContent).toContain('Outro · Higienizacao');

    await clickButton(host, /^Concluir serviÃ§o$/i);

    expect(host.textContent).toContain('Outro · Higienizacao registrada para');

    await clickButton(host, /^Ver relatorio$/i);

    expect(host.textContent).toContain('Outro · Higienizacao');

    await clickButton(host, /Voltar para ServiÃ§os/i);

    expect(host.textContent).toContain('Outro · Higienizacao');
    expect(host.textContent).toContain('Higienizacao completa registrada.');
  });

  it('ao iniciar servico sem equipamento exige escolha antes do registro', async () => {
    const host = await renderShell();

    await clickButton(host, /^Servi/i);
    await clickButton(host, /Iniciar registro/i);

    expect(host.textContent).toContain('Escolher equipamento');
    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('Câmara fria');
    expect(host.textContent).not.toContain('Atendimento em andamento');

    await clickButton(host, /C.mara fria/i);

    expect(host.textContent).toContain('Registro de servi');
    expect(host.textContent).toContain('Câmara fria');
    expect(host.textContent).toContain('Atendimento em andamento');
  });

  it('orienta cadastrar equipamento antes de iniciar servico quando a base esta vazia', async () => {
    const host = await renderShell(
      createAppV2MockSnapshot({
        equipamentos: [],
        compromissos: [],
        registros: [],
        orcamentos: [],
      }),
    );

    await clickButton(host, /^Servi/i);
    await clickButton(host, /Iniciar registro/i);

    expect(host.textContent).toContain('Nenhum equipamento cadastrado');
    expect(host.textContent).toContain('Cadastre um equipamento antes de registrar um serviço');
    expect(host.textContent).not.toContain('Atendimento em andamento');

    await clickButton(host, /^Ir para Equipamentos$/i);

    expect(host.textContent).toContain('Parque');
  });

  it('mostra mensagem amigavel quando a data mockada impede concluir o servico', async () => {
    const host = await renderShell(createAppV2MockSnapshot({ today: '' }));

    await clickButton(host, /Iniciar servi/i);
    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Preventiva/i);
    await clickButton(host, /^Continuar$/i);

    const technician = host.querySelector('input[name="service-technician"]');
    expect(technician).toBeInstanceOf(HTMLInputElement);
    await fillInput(technician as HTMLInputElement, 'Ana Tecnica');

    const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
    await fillTextarea(diagnosis, 'Diagnostico preenchido.');
    await fillTextarea(actionsDone, 'Acoes preenchidas.');

    await clickButton(host, /^Revisar$/i);
    await clickButton(host, /^Concluir servi/i);

    expect(host.textContent).toContain('Informe uma data valida para concluir o servico.');
    expect(host.textContent).toContain('Etapa 4');
    expect(host.textContent).not.toContain('Servico concluido');
  });

  it('permite editar um registro recente usando o fluxo existente sem duplicar historico', async () => {
    const host = await renderShell();

    await clickButton(host, /^Servi/i);

    expect(host.textContent).toContain('Registros recentes');
    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('3');

    await clickButton(host, /^Editar$/i);
    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Continuar$/i);

    const technician = host.querySelector('input[name="service-technician"]');
    expect(technician).toBeInstanceOf(HTMLInputElement);
    await fillInput(technician as HTMLInputElement, 'Ana Editora');

    const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
    await fillTextarea(diagnosis, 'Diagnostico editado no mock.');
    await fillTextarea(actionsDone, 'Acoes editadas no mock.');

    await clickButton(host, /^Revisar$/i);
    await clickButton(host, /^Concluir servi/i);
    await clickButton(host, /^Voltar para Servi/i);

    expect(host.textContent).toContain('Ana Editora');
    expect(host.textContent).toContain('Diagnostico editado no mock. Acoes editadas no mock.');
    expect(host.textContent).toContain('Registros recentes');
    expect(host.textContent).toContain('3');
  });

  it('permite alterar equipamento e data durante edicao e reabrir relatorio com os novos dados', async () => {
    const host = await renderShell();

    await clickButton(host, /^Servi/i);
    await clickButton(host, /^Editar$/i);

    const serviceDate = host.querySelector('input[name="service-date"]');
    expect(serviceDate).toBeInstanceOf(HTMLInputElement);
    await fillInput(serviceDate as HTMLInputElement, '2026-05-12');

    await clickButton(host, /^Alterar equipamento$/i);
    expect(host.textContent).toContain('Escolher equipamento');

    await clickButton(host, /C.mara fria/i);
    expect(host.textContent).toContain('Câmara fria');
    expect(host.textContent).not.toContain('Split 24.000 BTU - Mercado Bom Preço - Recepção');

    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Continuar$/i);

    const technician = host.querySelector('input[name="service-technician"]');
    expect(technician).toBeInstanceOf(HTMLInputElement);
    await fillInput(technician as HTMLInputElement, 'Ana Editora');

    const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
    await fillTextarea(diagnosis, 'Diagnostico editado com troca de equipamento.');
    await fillTextarea(actionsDone, 'Acoes editadas preservadas.');

    await clickButton(host, /^Revisar$/i);
    expect(host.textContent).toContain('Câmara fria');
    expect(host.textContent).toContain('12/05/2026');

    await clickButton(host, /^Concluir servi/i);
    await clickButton(host, /^Ver relatorio$/i);

    expect(host.textContent).toContain('Registro de Servico Tecnico');
    expect(host.textContent).toContain('Câmara fria');
    expect(host.textContent).toContain('12/05/2026');
    expect(host.textContent).toContain('Diagnostico editado com troca de equipamento.');
    expect(host.textContent).toContain('Acoes editadas preservadas.');

    await clickButton(host, /^Voltar para Servi/i);

    expect(host.textContent).toContain('Registros recentes');
    expect(host.textContent).toContain('Câmara fria');
    expect(host.textContent).toContain('3');
  });
});

it('permite registrar pecas usadas sem exigir custo ou orcamento', async () => {
  const host = await renderShell();

  await clickButton(host, /Iniciar servi/i);
  await clickButton(host, /^Continuar$/i);
  await clickButton(host, /^Preventiva/i);
  await clickButton(host, /^Continuar$/i);

  const technician = host.querySelector('input[name="service-technician"]');
  expect(technician).toBeInstanceOf(HTMLInputElement);
  await fillInput(technician as HTMLInputElement, 'Ana Tecnica');

  const parts = host.querySelector('textarea[name="service-parts-used"]');
  expect(parts).toBeInstanceOf(HTMLTextAreaElement);

  const textareas = Array.from(host.querySelectorAll('textarea'));
  const [diagnosis, actionsDone] = textareas;
  await fillTextarea(diagnosis, 'Filtro saturado.');
  await fillTextarea(actionsDone, 'Limpeza e substituicao preventiva.');
  await fillTextarea(parts as HTMLTextAreaElement, 'Filtro de ar, capacitor 35uF');

  expect(host.querySelector('input[name="service-parts-cost"]')).toBeInstanceOf(HTMLInputElement);
  expect(host.querySelector('input[name="service-labor-cost"]')).toBeInstanceOf(HTMLInputElement);
  expect(host.textContent).not.toContain('Orcamento');

  await clickButton(host, /^Revisar$/i);

  expect(host.textContent).toContain('Filtro de ar, capacitor 35uF');

  await clickButton(host, /^Concluir servi/i);
  await clickButton(host, /^Ver relatorio$/i);

  expect(host.textContent).toContain('Pecas usadas');
  expect(host.textContent).toContain('Filtro de ar, capacitor 35uF');
});

it('permite registrar custos opcionais sem criar orcamento real', async () => {
  const host = await renderShell();

  await clickButton(host, /Iniciar servi/i);
  await clickButton(host, /^Continuar$/i);
  await clickButton(host, /^Preventiva/i);
  await clickButton(host, /^Continuar$/i);

  const technician = host.querySelector('input[name="service-technician"]');
  expect(technician).toBeInstanceOf(HTMLInputElement);
  await fillInput(technician as HTMLInputElement, 'Ana Tecnica');

  const partsCost = host.querySelector('input[name="service-parts-cost"]');
  const laborCost = host.querySelector('input[name="service-labor-cost"]');
  expect(partsCost).toBeInstanceOf(HTMLInputElement);
  expect(laborCost).toBeInstanceOf(HTMLInputElement);

  const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
  await fillTextarea(diagnosis, 'Filtro saturado.');
  await fillTextarea(actionsDone, 'Limpeza e substituicao preventiva.');
  await fillInput(partsCost as HTMLInputElement, '120,00');
  await fillInput(laborCost as HTMLInputElement, '250,00');

  await clickButton(host, /^Revisar$/i);

  expect(host.textContent).toContain('Custo de pecas');
  expect(host.textContent).toContain('120,00');
  expect(host.textContent).toContain('Custo de mao de obra');
  expect(host.textContent).toContain('250,00');

  await clickButton(host, /^Concluir servi/i);
  await clickButton(host, /^Ver relatorio$/i);

  expect(host.textContent).toContain('Custo de pecas');
  expect(host.textContent).toContain('120,00');
  expect(host.textContent).toContain('Custo de mao de obra');
  expect(host.textContent).toContain('250,00');
  expect(host.textContent).not.toContain('Orcamento real');
});

it('permite registrar proxima manutencao sem abrir calendario real', async () => {
  const host = await renderShell(createAppV2MockSnapshot({ compromissos: [] }));

  await clickButton(host, /Iniciar servi/i);
  await clickButton(host, /^Continuar$/i);
  await clickButton(host, /^Preventiva/i);
  await clickButton(host, /^Continuar$/i);

  const technician = host.querySelector('input[name="service-technician"]');
  expect(technician).toBeInstanceOf(HTMLInputElement);
  await fillInput(technician as HTMLInputElement, 'Ana Tecnica');

  const nextMaintenance = host.querySelector('input[name="service-next-maintenance"]');
  expect(nextMaintenance).toBeInstanceOf(HTMLInputElement);

  const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
  await fillTextarea(diagnosis, 'Filtro saturado.');
  await fillTextarea(actionsDone, 'Limpeza e substituicao preventiva.');
  await fillInput(nextMaintenance as HTMLInputElement, '2026-06-10');

  await clickButton(host, /^Revisar$/i);

  expect(host.textContent).toContain('Proxima manutencao');
  expect(host.textContent).toContain('10/06/2026');

  await clickButton(host, /^Concluir servi/i);
  await clickButton(host, /^Ver relatorio$/i);

  expect(host.textContent).toContain('Proxima manutencao');
  expect(host.textContent).toContain('10/06/2026');

  await clickButton(host, /Voltar para Servi/i);

  expect(host.textContent).toContain('10/06');
  expect(host.textContent).not.toContain('Calendario');
});
