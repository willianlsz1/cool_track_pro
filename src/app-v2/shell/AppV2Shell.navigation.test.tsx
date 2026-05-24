import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';

import {
  cleanupShell,
  clickButton,
  fillInput,
  fillTextarea,
  renderShell,
} from './AppV2Shell.testUtils';

describe('AppV2Shell navigation and alerts', () => {
  const forbiddenRegulatoryTerm = ['P', 'MOC'].join('');

  afterEach(async () => {
    await cleanupShell();
    window.history.pushState({}, '', '/');
  });

  it('mostra lista curta de alertas ativos na Home sem abrir area sensivel', async () => {
    const host = await renderShell();

    expect(host.textContent).toContain('Alertas ativos');
    expect(host.textContent).toContain('Equipamento fora de operação');
    expect(host.textContent).toContain('Status atual marcado como crítico');
    expect(host.textContent).not.toContain(forbiddenRegulatoryTerm);

    const asideAlertButtons = Array.from(host.querySelectorAll('button')).filter((button) =>
      /Crítico|Atenção/.test(button.textContent ?? ''),
    );

    expect(asideAlertButtons.length).toBeGreaterThan(0);
    for (const button of asideAlertButtons) {
      expect(button.className).toContain('tw-border-0');
    }

    const asideAlertList = Array.from(host.querySelectorAll('div')).find(
      (item) =>
        item.className.includes('tw-divide-y') && item.textContent?.includes('Preventiva vencida'),
    );

    expect(asideAlertList?.className).toContain('tw-divide-[#E5EAF0]');
  });

  it('aplica a conclusao do servico na store mockada exibida pela Central', async () => {
    const host = await renderShell();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined);

    await clickButton(host, /Iniciar serviço/i);
    expect(host.textContent).not.toContain('Ver relatório');

    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Limpeza preventiva/i);
    await clickButton(host, /^Continuar$/i);

    const technician = host.querySelector('input[name="service-technician"]');
    expect(technician).toBeInstanceOf(HTMLInputElement);
    await fillInput(technician as HTMLInputElement, 'Ana Tecnica');

    const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
    await fillTextarea(diagnosis, 'QA diagnóstico shell store.');
    await fillTextarea(actionsDone, 'QA ações shell store.');

    await clickButton(host, /^Revisar$/i);
    await clickButton(host, /^Concluir serviço$/i);

    expect(host.textContent).toContain('Atendimento concluído');
    expect(host.textContent).toContain('Serviço concluído');
    expect(host.textContent).toContain('Resumo do serviço');
    expect(host.textContent).toContain('Saídas futuras');
    expect(host.textContent).toContain('Ver relatório');

    await clickButton(host, /^Ver relatório$/i);

    expect(host.textContent).toContain('Registro de Serviço Técnico');
    expect(host.textContent).toContain('CoolTrack Pro app-v2');
    expect(host.textContent).toContain('Mercado Bom');
    expect(host.textContent).toContain('Câmara fria');
    expect(host.textContent).toContain('Ana Tecnica');
    expect(host.textContent).not.toContain('Técnico app-v2');
    expect(host.textContent).toContain('QA diagnóstico shell store.');
    expect(host.textContent).toContain('QA ações shell store.');

    expect(host.textContent).toContain('Técnico/responsável');
    expect(host.textContent).toContain('Cliente/responsável');
    expect(host.textContent).not.toContain(forbiddenRegulatoryTerm);

    await clickButton(host, /^Imprimir relatório$/i);

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
    const sidebar = host.querySelector('aside[aria-label="Navegação principal"]');
    const bottomNav = host.querySelector('nav[aria-label="Navegação principal"]');
    const officialIcon = sidebar?.querySelector('img');

    expect(sidebar?.className).toContain('tw-w-[260px]');
    expect(sidebar?.className).toContain('lg:tw-flex');
    expect(bottomNav?.className).toContain('lg:tw-hidden');
    expect(officialIcon?.getAttribute('src')).toBe('/icons/icon-192x192.png');
    expect(sidebar?.textContent).toContain('Hoje');
    expect(sidebar?.textContent).toContain('Equipamentos');
    expect(sidebar?.textContent).toContain('Servi');
    expect(sidebar?.textContent).toContain('Conta');
    expect(sidebar?.textContent).not.toContain('Clientes');
    expect(bottomNav?.querySelector('button[aria-label="Equipamentos"]')).toBeTruthy();
  });

  it('abre Alertas a partir da Home sem passar por Conta', async () => {
    const host = await renderShell();

    await clickButton(host, /^Ver alertas$/i);

    expect(host.textContent).toContain('Alertas e Anormalidades');
    expect(host.textContent).toContain('Alertas operacionais');
    expect(host.textContent).toContain('Equipamento fora de operação');
    expect(host.textContent).not.toContain('Atalhos e preferências operacionais locais');
  });

  it('troca entre as abas principais sem criar novas areas', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    expect(host.textContent).toContain('Parque');
    expect(window.location.pathname).toBe('/equipamentos');

    await clickButton(host, /^Servi/i);
    expect(host.textContent).toContain('Registros recentes');
    expect(window.location.pathname).toBe('/servicos');

    await clickButton(host, /^Conta$/i);
    expect(host.textContent).toContain('Conta');
    expect(window.location.pathname).toBe('/conta');
    expect(host.textContent).toContain('Atalhos e preferências operacionais locais desta sessão.');
    expect(host.textContent).not.toContain(['Bill', 'ing'].join(''));
    expect(host.textContent).not.toContain('Supabase');
  });

  it('usa a rota inicial para abrir areas principais do app-v2 como root', async () => {
    window.history.pushState({}, '', '/servicos');

    const host = await renderShell();

    expect(host.textContent).toContain('Registros recentes');
    expect(host.textContent).not.toContain('Orientação para o dia');
  });

  it('sincroniza popstate somente entre rotas principais contratadas', async () => {
    window.history.pushState({}, '', '/equipamentos');
    const host = await renderShell();

    expect(host.textContent).toContain('Parque');

    await act(async () => {
      window.history.pushState({}, '', '/conta');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(host.textContent).toContain('Atalhos e preferências operacionais locais desta sessão.');
    expect(host.textContent).not.toContain('Parque');
  });

  it('abre a tela completa de alertas pelo atalho local de Conta', async () => {
    const host = await renderShell();

    await clickButton(host, /^Conta$/i);
    await clickButton(host, /Alertas/i);

    expect(host.textContent).toContain('Alertas e Anormalidades');
    expect(host.textContent).toContain('Alertas operacionais');
    expect(host.textContent).toContain('Equipamento fora de operação');
    expect(host.textContent).toContain('Ver equipamento');

    const sidebar = host.querySelector('aside');
    expect(sidebar?.textContent).toContain('Hoje');
    expect(sidebar?.textContent).not.toContain('Alertas');
  });

  it('abre Relatorios dentro de Servicos com busca e preview dedicado', async () => {
    const host = await renderShell();
    const sidebar = host.querySelector('aside[aria-label="Navegação principal"]');
    const bottomNav = host.querySelector('nav[aria-label="Navegação principal"]');

    expect(sidebar?.textContent).not.toContain('Relatórios');
    expect(bottomNav?.textContent).not.toContain('Relatórios');

    await clickButton(host, /^Servi/i);
    await clickButton(host, /^Relatórios$/i);

    expect(host.textContent).toContain('Relatórios prontos');
    expect(host.textContent).toContain('Com atenção');
    expect(host.textContent).toContain('Pendentes');
    expect(host.textContent).toContain('Este mês');
    expect(host.textContent).toContain('REL-REGISTRO-1');
    expect(host.textContent).not.toContain('Baixar PDF futuro');
    expect(host.textContent).not.toContain('Exportar PDF');
    expect(host.textContent).toContain('Câmara fria');

    const search = host.querySelector('input[aria-label="Buscar relatórios"]');
    expect(search).toBeInstanceOf(HTMLInputElement);
    await fillInput(search as HTMLInputElement, 'camara');

    expect(host.textContent).not.toContain('REL-REGISTRO-1');
    expect(host.textContent).toContain('REL-REGISTRO-2');
    expect(host.textContent).toMatch(/C.mara fria/);

    await clickButton(host, /^Ver relatório$/i);

    expect(host.textContent).toContain('Voltar para relatórios');
    expect(host.textContent).toContain('Registro de Serviço Técnico');
    expect(host.textContent).toMatch(/C.mara fria/);
    expect(host.querySelector('[data-app-v2-print-scope="service-report"]')).toBeTruthy();
    expect(host.querySelector('[data-app-v2-print-hidden="true"]')).toBeTruthy();

    await clickButton(host, /^Voltar para relatórios$/i);

    expect(host.textContent).toContain('REL-REGISTRO-2');
    expect(host.textContent).not.toContain('Registro de Serviço Técnico');

    await clickButton(host, /^Abrir relatório$/i);

    expect(host.textContent).toContain('Voltar para relatórios');
    expect(host.textContent).toContain('Registro de Serviço Técnico');
    expect(host.querySelector('[data-app-v2-print-scope="service-report"]')).toBeTruthy();
  });
});
