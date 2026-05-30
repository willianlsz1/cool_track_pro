import { afterEach, describe, expect, it } from 'vitest';

import {
  cleanupShell,
  clickButton,
  createAppV2MockSnapshot,
  fillInput,
  fillTextarea,
  renderShell,
} from './AppV2Shell.testUtils';

afterEach(cleanupShell);

describe('AppV2Shell service closure', () => {
  it('permite registrar pecas usadas sem exigir custo ou orcamento', async () => {
    const host = await renderShell();

    await clickButton(host, /Iniciar servi/i);
    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Limpeza preventiva/i);
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
    await clickButton(host, /^Ver relatório$/i);

    expect(host.textContent).toContain('Peças usadas');
    expect(host.textContent).toContain('Filtro de ar, capacitor 35uF');
  });

  it('permite registrar custos opcionais sem criar orcamento real', async () => {
    const host = await renderShell();

    await clickButton(host, /Iniciar servi/i);
    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Limpeza preventiva/i);
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

    expect(host.textContent).toContain('Custo de peças');
    expect(host.textContent).toContain('120,00');
    expect(host.textContent).toContain('Custo de mão de obra');
    expect(host.textContent).toContain('250,00');

    await clickButton(host, /^Concluir servi/i);
    await clickButton(host, /^Ver relatório$/i);

    expect(host.textContent).toContain('Custo de peças');
    expect(host.textContent).toContain('120,00');
    expect(host.textContent).toContain('Custo de mão de obra');
    expect(host.textContent).toContain('250,00');
    expect(host.textContent).not.toContain('Orcamento real');
  });

  it('cria orcamento local a partir do fechamento do servico', async () => {
    const host = await renderShell();

    await clickButton(host, /Iniciar servi/i);
    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Limpeza preventiva/i);
    await clickButton(host, /^Continuar$/i);

    const technician = host.querySelector('input[name="service-technician"]');
    const partsCost = host.querySelector('input[name="service-parts-cost"]');
    const laborCost = host.querySelector('input[name="service-labor-cost"]');
    expect(technician).toBeInstanceOf(HTMLInputElement);
    expect(partsCost).toBeInstanceOf(HTMLInputElement);
    expect(laborCost).toBeInstanceOf(HTMLInputElement);

    const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
    await fillInput(technician as HTMLInputElement, 'Ana Tecnica');
    await fillTextarea(diagnosis, 'Filtro saturado.');
    await fillTextarea(actionsDone, 'Limpeza e substituicao preventiva.');
    await fillInput(partsCost as HTMLInputElement, '120,00');
    await fillInput(laborCost as HTMLInputElement, '250,00');

    await clickButton(host, /^Aten/i);

    await clickButton(host, /^Revisar$/i);
    await clickButton(host, /^Concluir servi/i);
    await clickButton(host, /^Criar orçamento pós-diagnóstico$/i);

    expect(host.textContent).toContain('Orçamentos locais');
    expect(host.textContent).toMatch(/Orçamento local - C.mara fria/);
    expect(host.textContent).toContain('R$ 370,00');
    expect(host.textContent).not.toContain(['Bill', 'ing'].join(''));
    expect(host.textContent).not.toContain('Supabase');
    expect(host.textContent).not.toContain('WhatsApp');
  });

  it('permite registrar proxima manutencao sem abrir calendario real', async () => {
    const host = await renderShell(createAppV2MockSnapshot({ compromissos: [] }));

    await clickButton(host, /Iniciar servi/i);
    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Limpeza preventiva/i);
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

    expect(host.textContent).toContain('Próxima manutenção');
    expect(host.textContent).toContain('10/06/2026');

    await clickButton(host, /^Concluir servi/i);
    await clickButton(host, /^Ver relatório$/i);

    expect(host.textContent).toContain('Próxima manutenção');
    expect(host.textContent).toContain('10/06/2026');

    await clickButton(host, /Voltar para Servi/i);

    expect(host.textContent).toContain('10/06');
    expect(host.textContent).not.toContain('Calendario');
  });
});
