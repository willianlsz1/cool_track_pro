import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  cleanupShell,
  clickButton,
  createAppV2MockSnapshot,
  fillInput,
  fillTextarea,
  renderShell,
  selectOption,
} from './AppV2Shell.testUtils';

describe('AppV2Shell', () => {
  const forbiddenRegulatoryTerm = ['P', 'MOC'].join('');

  afterEach(cleanupShell);

  it('filtra Relatorios por periodo, cliente e equipamento com resumo consolidado local', async () => {
    const host = await renderShell();

    await clickButton(host, /^Servi/i);
    await clickButton(host, /^Relatórios$/i);

    const period = host.querySelector('select[name="service-report-period-filter"]');
    const client = host.querySelector('select[name="service-report-client-filter"]');
    const equipment = host.querySelector('select[name="service-report-equipment-filter"]');
    expect(period).toBeInstanceOf(HTMLSelectElement);
    expect(client).toBeInstanceOf(HTMLSelectElement);
    expect(equipment).toBeInstanceOf(HTMLSelectElement);

    await selectOption(equipment as HTMLSelectElement, 'eq-2');

    const summary = host.querySelector('[data-testid="service-report-summary"]');
    const list = host.querySelector('[data-testid="service-report-list"]');
    expect(summary?.textContent).toContain('Resumo consolidado');
    expect(summary?.textContent).toContain('1');
    expect(list?.textContent).toContain('REL-REGISTRO-2');
    expect(list?.textContent).not.toContain('REL-REGISTRO-1');

    await selectOption(equipment as HTMLSelectElement, 'all');
    await selectOption(client as HTMLSelectElement, 'cliente-2');

    expect(host.querySelector('[data-testid="service-report-list"]')?.textContent).toContain(
      'REL-REGISTRO-3',
    );
    expect(host.textContent).not.toContain('PMOC');
    expect(host.textContent).not.toContain('WhatsApp');
  });

  it('filtra registros recentes em Servicos por busca local', async () => {
    const host = await renderShell();

    await clickButton(host, /^Servi/i);

    const search = host.querySelector('input[aria-label="Buscar registros"]');
    expect(search).toBeInstanceOf(HTMLInputElement);

    await fillInput(search as HTMLInputElement, 'camara');

    const results = host.querySelector('[data-testid="service-record-results"]');
    expect(results?.textContent).toMatch(/C.mara fria/);
    expect(results?.textContent).not.toContain('Split 24.000 BTU');

    await fillInput(search as HTMLInputElement, 'sem resultado');

    expect(host.querySelector('[data-testid="service-record-results"]')?.textContent).toContain(
      'Nenhum registro encontrado',
    );
  });

  it('filtra registros recentes em Servicos por equipamento, tipo e status', async () => {
    const host = await renderShell();

    await clickButton(host, /^Servi/i);

    const status = host.querySelector('select[name="service-status-filter"]');
    const kind = host.querySelector('select[name="service-kind-filter"]');
    const equipment = host.querySelector('select[name="service-equipment-filter"]');
    expect(status).toBeInstanceOf(HTMLSelectElement);
    expect(kind).toBeInstanceOf(HTMLSelectElement);
    expect(equipment).toBeInstanceOf(HTMLSelectElement);

    await selectOption(status as HTMLSelectElement, 'warn');

    const results = host.querySelector('[data-testid="service-record-results"]');
    expect(results?.textContent).toMatch(/C.mara fria/);
    expect(results?.textContent).not.toContain('Split 24.000 BTU');

    await selectOption(status as HTMLSelectElement, 'all');
    await selectOption(kind as HTMLSelectElement, 'preventiva');

    expect(results?.textContent).toContain('Split 24.000 BTU');
    expect(results?.textContent).not.toMatch(/C.mara fria/);

    await selectOption(kind as HTMLSelectElement, 'all');
    await selectOption(equipment as HTMLSelectElement, 'eq-2');

    expect(results?.textContent).toMatch(/C.mara fria/);
    expect(results?.textContent).not.toContain('Split 24.000 BTU');
    expect(results?.textContent).not.toContain('Supabase');
  });

  it('abre Orcamentos pelo CTA contextual de Servicos quando ha rascunho em aberto', async () => {
    const host = await renderShell();

    await clickButton(host, /^Servi/i);

    expect(host.textContent).toContain('Revisar orçamento em aberto');
    await clickButton(host, /^Revisar orçamento em aberto$/i);

    expect(host.textContent).toContain('Orçamentos locais');
    expect(host.textContent).toContain('ORC-2026-001');
    expect(host.textContent).not.toContain('Supabase');
  });

  it('abre Orcamentos pela chamada discreta da Home para rascunho em aberto', async () => {
    const host = await renderShell();

    expect(host.textContent).toContain('Orçamento em aberto');
    await clickButton(host, /^Revisar orçamento$/i);

    expect(host.textContent).toContain('Orçamentos locais');
    expect(host.textContent).toContain('ORC-2026-001');
  });

  it('abre o detalhe de equipamento a partir da lista', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);

    expect(host.textContent).toContain('Voltar para equipamentos');
    expect(host.textContent).toContain('Resumo');
    expect(host.textContent).toContain('Cliente vinculado');
  });

  it('cria equipamento mockado pela lista sem storage real', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Novo equipamento$/i);

    const name = host.querySelector('input[name="equipment-name"]');
    const location = host.querySelector('input[name="equipment-location"]');
    const type = host.querySelector('input[name="equipment-type"]');
    expect(name).toBeInstanceOf(HTMLInputElement);
    expect(location).toBeInstanceOf(HTMLInputElement);
    expect(type).toBeInstanceOf(HTMLInputElement);

    await fillInput(name as HTMLInputElement, 'Self contained loja');
    await fillInput(location as HTMLInputElement, 'Area de vendas');
    await fillInput(type as HTMLInputElement, 'Refrigeracao');
    await clickButton(host, /^Salvar equipamento$/i);

    expect(host.textContent).toContain('Self contained loja');
    expect(host.textContent).toContain('Refrigeracao');
    expect(host.textContent).not.toContain('Supabase');
  });

  it('cria equipamento com setor mock/local e filtra a lista por setor sem storage real', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Novo equipamento$/i);

    const name = host.querySelector('input[name="equipment-name"]');
    const location = host.querySelector('input[name="equipment-location"]');
    const sector = host.querySelector('select[name="equipment-sector"]');
    expect(name).toBeInstanceOf(HTMLInputElement);
    expect(location).toBeInstanceOf(HTMLInputElement);
    expect(sector).toBeInstanceOf(HTMLSelectElement);

    await fillInput(name as HTMLInputElement, 'Self contained loja');
    await fillInput(location as HTMLInputElement, 'Area de vendas');
    await selectOption(sector as HTMLSelectElement, 'setor-2');

    const client = host.querySelector('select[name="equipment-client"]');
    expect(client).toBeInstanceOf(HTMLSelectElement);
    expect((client as HTMLSelectElement).value).toBe('cliente-1');
    expect(host.textContent).toContain('Cliente herdado do setor: Mercado Bom');

    await selectOption(sector as HTMLSelectElement, '');
    expect(host.textContent).not.toContain('Cliente herdado do setor');
    await selectOption(sector as HTMLSelectElement, 'setor-2');

    await clickButton(host, /^Salvar equipamento$/i);

    expect(host.textContent).toContain('Self contained loja');
    expect(host.textContent).toContain('Setor: Câmara fria');
    expect(host.textContent).not.toContain('Upload');
    expect(host.textContent).not.toContain('Supabase');

    const sectorFilter = host.querySelector('select[name="equipment-sector-filter"]');
    expect(sectorFilter).toBeInstanceOf(HTMLSelectElement);
    await selectOption(sectorFilter as HTMLSelectElement, 'setor-2');

    const equipmentList = host.querySelector('section[aria-label="Lista de equipamentos"]');
    expect(equipmentList?.textContent).toContain('Self contained loja');
    expect(equipmentList?.textContent).toMatch(/C.mara fria/);
    expect(equipmentList?.textContent).not.toContain('Split 24.000 BTU');
  });

  it('cria e edita setor mock/local na lista de equipamentos sem storage real', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);

    expect(host.querySelector('input[name="equipment-sector-name"]')).toBeNull();
    expect(host.textContent).toContain('Preventiva vencida');
    expect(host.querySelector('[data-sector-card="setor-1"]')?.textContent).toContain(
      'Split 24.000 BTU',
    );

    await clickButton(host, /^Novo setor$/i);

    const sectorName = host.querySelector('input[name="equipment-sector-name"]');
    const sectorClient = host.querySelector('select[name="equipment-sector-client"]');
    const sectorDescription = host.querySelector('textarea[name="equipment-sector-description"]');
    expect(sectorName).toBeInstanceOf(HTMLInputElement);
    expect(sectorClient).toBeInstanceOf(HTMLSelectElement);
    expect(sectorDescription).toBeInstanceOf(HTMLTextAreaElement);
    expect(host.querySelector('input[name="equipment-sector-color"]')).toBeNull();

    await fillInput(sectorName as HTMLInputElement, 'Casa de maquinas');
    await selectOption(sectorClient as HTMLSelectElement, 'cliente-1');
    await fillTextarea(sectorDescription as HTMLTextAreaElement, 'Sala tecnica com condensadoras.');
    await clickButton(host, /^Salvar setor$/i);

    expect(host.textContent).toContain('Casa de maquinas');
    expect(host.textContent).toContain('0 equipamentos');
    expect(host.querySelector('[data-sector-card="setor-shell-4"]')?.textContent).toContain(
      'Setor vazio',
    );
    expect(host.textContent).not.toContain('Supabase');
    expect(host.textContent).not.toContain('Upload');

    await clickButton(host, /^Editar setor Casa de maquinas$/i);

    const editSectorName = host.querySelector('input[name="equipment-sector-name"]');
    expect(editSectorName).toBeInstanceOf(HTMLInputElement);
    await fillInput(editSectorName as HTMLInputElement, 'Casa de maquinas revisada');
    await clickButton(host, /^Salvar setor$/i);

    expect(host.textContent).toContain('Casa de maquinas revisada');
    expect(host.textContent).not.toContain('Casa de maquinasCasa de maquinas');
  });

  it('abre painel de setor e cria equipamento herdando setor e cliente localmente', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Abrir setor Recepção$/i);

    expect(host.textContent).toContain('Painel do setor');
    expect(host.textContent).toContain('Recepção');
    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.querySelector('[data-sector-card="setor-1"]')?.textContent).toContain('Aberto');
    const sectorPanel = host.querySelector('[data-sector-panel="setor-1"]');
    expect(sectorPanel?.textContent).toContain('Split 24.000 BTU');
    expect(sectorPanel?.textContent).not.toContain('Central de refrigera');
    expect(sectorPanel?.textContent).toContain('Resumo operacional');

    await clickButton(host, /^Adicionar equipamento neste setor$/i);

    const sector = host.querySelector('select[name="equipment-sector"]');
    const client = host.querySelector('select[name="equipment-client"]');
    const name = host.querySelector('input[name="equipment-name"]');
    const location = host.querySelector('input[name="equipment-location"]');
    expect(sector).toBeInstanceOf(HTMLSelectElement);
    expect(client).toBeInstanceOf(HTMLSelectElement);
    expect(name).toBeInstanceOf(HTMLInputElement);
    expect(location).toBeInstanceOf(HTMLInputElement);
    expect((sector as HTMLSelectElement).value).toBe('setor-1');
    expect((client as HTMLSelectElement).value).toBe('cliente-1');
    expect(host.textContent).toContain('Cliente herdado do setor: Mercado Bom');

    await selectOption(client as HTMLSelectElement, 'cliente-2');
    expect(host.textContent).toContain(
      'Cliente alterado neste equipamento. O setor pertence a Mercado Bom',
    );
    await fillInput(name as HTMLInputElement, 'Self contained recepcao');
    await fillInput(location as HTMLInputElement, 'Recepcao tecnica');
    await clickButton(host, /^Salvar equipamento$/i);

    expect(host.textContent).toContain('Self contained recepcao');
    expect(host.textContent).toContain('2 equipamentos');
    expect(host.textContent).toContain('Mercado Bom Preço');

    await clickButton(host, /Self contained recepcao/i);
    expect(host.textContent).toContain('Indústria Frio Sul');
    expect(host.textContent).toContain('Setor: Recepção');
  });

  it('remove setor mock/local preservando equipamentos, registros e relatorios locais', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Remover setor Recepção$/i);
    await clickButton(host, /^Confirmar remover setor Recepção$/i);

    expect(host.textContent).not.toContain('Editar setor Recepção');
    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('Sem setor');
    expect(host.textContent).not.toContain('Storage');
    expect(host.textContent).not.toContain('Supabase');

    await clickButton(host, /^Servi/i);

    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('Limpeza de filtros e teste de temperatura.');
  });

  it('arquiva equipamento mock/local preservando registros, relatorios e orcamentos locais', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);
    await clickButton(host, /^Arquivar equipamento$/i);
    await clickButton(host, /^Confirmar arquivar equipamento$/i);

    expect(host.textContent).toContain('Arquivado em');
    expect(host.textContent).toContain('Preventiva em');
    expect(host.textContent).not.toContain('Storage');
    expect(host.textContent).not.toContain('Supabase');

    await clickButton(host, /^Voltar para equipamentos$/i);

    expect(host.textContent).not.toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('3 equipamentos');

    await clickButton(host, /^Servi/i);

    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('Limpeza de filtros e teste de temperatura.');

    await clickButton(host, /^Relatórios$/i);

    expect(host.textContent).toContain('REL-REGISTRO-1');
    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).not.toContain(forbiddenRegulatoryTerm);
  });

  it('desarquiva equipamento mock/local sem reativar compromissos cancelados', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);
    await clickButton(host, /^Arquivar equipamento$/i);
    await clickButton(host, /^Confirmar arquivar equipamento$/i);

    expect(host.textContent).toContain('Arquivado em');
    expect(host.textContent).toContain('Desarquivar equipamento');

    await clickButton(host, /^Desarquivar equipamento$/i);

    expect(host.textContent).not.toContain('Arquivado em');
    expect(host.textContent).toContain('Iniciar servi');

    await clickButton(host, /^Voltar para equipamentos$/i);

    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('4 equipamentos');

    await clickButton(host, /^Hoje$/i);

    expect(host.textContent).not.toContain('Preventiva vencida');
    expect(host.textContent).not.toContain('Supabase');
  });

  it('mostra erro amigavel ao criar equipamento sem local', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Novo equipamento$/i);

    const name = host.querySelector('input[name="equipment-name"]');
    expect(name).toBeInstanceOf(HTMLInputElement);
    await fillInput(name as HTMLInputElement, 'Self contained loja');
    await clickButton(host, /^Salvar equipamento$/i);

    expect(host.textContent).toContain('Informe o local do equipamento.');
  });

  it('edita equipamento existente pelo detalhe preservando id e sem duplicar lista', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);
    await clickButton(host, /^Editar equipamento$/i);

    const name = host.querySelector('input[name="equipment-name"]');
    const location = host.querySelector('input[name="equipment-location"]');
    expect(name).toBeInstanceOf(HTMLInputElement);
    expect(location).toBeInstanceOf(HTMLInputElement);

    await fillInput(name as HTMLInputElement, 'Split recepcao revisado');
    await fillInput(location as HTMLInputElement, 'Recepcao principal');
    await clickButton(host, /^Salvar equipamento$/i);

    expect(host.textContent).toContain('Split recepcao revisado');
    expect(host.textContent).toContain('Recepcao principal');

    await clickButton(host, /^Voltar para equipamentos$/i);

    expect(host.textContent).toContain('Split recepcao revisado');
    expect(host.textContent).not.toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('4 equipamentos');
  });

  it('move equipamento entre setores pela edicao e atualiza cliente herdado localmente', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);
    await clickButton(host, /^Editar equipamento$/i);

    const sector = host.querySelector('select[name="equipment-sector"]');
    const client = host.querySelector('select[name="equipment-client"]');
    expect(sector).toBeInstanceOf(HTMLSelectElement);
    expect(client).toBeInstanceOf(HTMLSelectElement);

    await selectOption(sector as HTMLSelectElement, 'setor-3');

    expect((sector as HTMLSelectElement).value).toBe('setor-3');
    expect((client as HTMLSelectElement).value).toBe('cliente-2');
    expect(host.textContent).toContain('Cliente herdado do setor: Ind');

    await clickButton(host, /^Salvar equipamento$/i);

    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('Setor: Produção');
    expect(host.textContent).toContain('Ind');

    await clickButton(host, /^Voltar para equipamentos$/i);
    await clickButton(host, /^Abrir setor Produção$/i);

    const sectorPanel = host.querySelector('[data-sector-panel="setor-3"]');
    expect(sectorPanel?.textContent).toContain('Split 24.000 BTU');
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

  it('mostra servicos relacionados no detalhe de cliente sem abrir PMOC ou historico legado', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Clientes$/i);
    await clickButton(host, /Mercado Bom/i);

    expect(host.textContent).toContain('Serviços relacionados');
    expect(host.textContent).toContain('2 serviços relacionados');
    expect(host.textContent).toMatch(/C.mara fria/);
    expect(host.textContent).toContain('Alarme intermitente no controlador.');
    expect(host.textContent).not.toContain(forbiddenRegulatoryTerm);
  });

  it('cria cliente mockado dentro de Equipamentos > Clientes sem storage real', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Clientes$/i);
    await clickButton(host, /^Novo cliente$/i);

    const name = host.querySelector('input[name="client-name"]');
    const contact = host.querySelector('input[name="client-contact"]');
    const address = host.querySelector('input[name="client-address"]');
    expect(name).toBeInstanceOf(HTMLInputElement);
    expect(contact).toBeInstanceOf(HTMLInputElement);
    expect(address).toBeInstanceOf(HTMLInputElement);

    await fillInput(name as HTMLInputElement, 'Padaria Central');
    await fillInput(contact as HTMLInputElement, '(11) 97777-0000');
    await fillInput(address as HTMLInputElement, 'Rua Central, 42');
    await clickButton(host, /^Salvar cliente$/i);

    expect(host.textContent).toContain('Padaria Central');
    expect(host.textContent).toContain('(11) 97777-0000');
    expect(host.textContent).toContain('3 clientes');
    expect(host.textContent).not.toContain('Supabase');
  });

  it('mostra erro amigavel ao criar cliente sem nome', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Clientes$/i);
    await clickButton(host, /^Novo cliente$/i);
    await clickButton(host, /^Salvar cliente$/i);

    expect(host.textContent).toContain('Informe o nome do cliente.');
  });

  it('edita cliente existente pelo detalhe preservando a subvisao de clientes', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Clientes$/i);
    await clickButton(host, /Mercado Bom/i);
    await clickButton(host, /^Editar cliente$/i);

    const name = host.querySelector('input[name="client-name"]');
    const contact = host.querySelector('input[name="client-contact"]');
    expect(name).toBeInstanceOf(HTMLInputElement);
    expect(contact).toBeInstanceOf(HTMLInputElement);

    await fillInput(name as HTMLInputElement, 'Mercado Bom revisado');
    await fillInput(contact as HTMLInputElement, '(11) 96666-0000');
    await clickButton(host, /^Salvar cliente$/i);

    expect(host.textContent).toContain('Mercado Bom revisado');
    expect(host.textContent).toContain('(11) 96666-0000');
    expect(host.textContent).toContain('Equipamentos vinculados');

    await clickButton(host, /^Voltar para clientes$/i);

    expect(host.textContent).toContain('Mercado Bom revisado');
    expect(host.textContent).toContain('2 clientes');
  });

  it('vincula cliente recem-criado ao formulario de equipamento sem storage real', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Clientes$/i);
    await clickButton(host, /^Novo cliente$/i);

    const clientName = host.querySelector('input[name="client-name"]');
    expect(clientName).toBeInstanceOf(HTMLInputElement);
    await fillInput(clientName as HTMLInputElement, 'Padaria Central');
    await clickButton(host, /^Salvar cliente$/i);

    await clickButton(host, /Padaria Central/i);
    await clickButton(host, /^Criar equipamento para este cliente$/i);

    const equipmentClient = host.querySelector('select[name="equipment-client"]');
    expect(equipmentClient).toBeInstanceOf(HTMLSelectElement);
    expect((equipmentClient as HTMLSelectElement).selectedOptions[0]?.textContent).toBe(
      'Padaria Central',
    );

    const equipmentName = host.querySelector('input[name="equipment-name"]');
    const equipmentLocation = host.querySelector('input[name="equipment-location"]');
    expect(equipmentName).toBeInstanceOf(HTMLInputElement);
    expect(equipmentLocation).toBeInstanceOf(HTMLInputElement);

    await fillInput(equipmentName as HTMLInputElement, 'Balcao refrigerado');
    await fillInput(equipmentLocation as HTMLInputElement, 'Vitrine');
    await clickButton(host, /^Salvar equipamento$/i);

    expect(host.textContent).toContain('Balcao refrigerado');
    expect(host.textContent).toContain('Padaria Central');
    expect(host.textContent).not.toContain('Supabase');
  });

  it('consulta clientes por busca e filtros operacionais sem criar area global', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Clientes$/i);

    const clientSearch = host.querySelector('input[name="client-search"]');
    expect(clientSearch).toBeInstanceOf(HTMLInputElement);

    await fillInput(clientSearch as HTMLInputElement, 'CAM-001');

    expect(host.textContent).toContain('1 cliente');
    expect(host.textContent).toContain('Mercado Bom');
    expect(host.textContent).not.toContain('Industria Frio Sul');

    await fillInput(clientSearch as HTMLInputElement, '');
    await clickButton(host, /^Com pendência$/i);

    expect(host.textContent).toContain('1 cliente');
    expect(host.textContent).toContain('Mercado Bom');
    expect(host.textContent).not.toContain('Industria Frio Sul');
    expect(host.textContent).not.toContain('Supabase');
  });

  it('mostra relatorio local do cliente sem PMOC, PDF ou WhatsApp real', async () => {
    const host = await renderShell();

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Clientes$/i);
    await clickButton(host, /Mercado Bom/i);

    expect(host.textContent).toContain('Resumo local do cliente');
    expect(host.textContent).toContain('2 pendências operacionais');
    expect(host.textContent).toContain('09/05 - Câmara fria');
    expect(host.textContent).not.toContain(forbiddenRegulatoryTerm);
    expect(host.textContent).not.toContain('Enviar WhatsApp');
    expect(host.textContent).not.toContain('Exportar PDF');
  });

  it('inicia e retoma um servico em andamento pelo shell', async () => {
    const host = await renderShell();

    await clickButton(host, /Iniciar servi/i);
    expect(host.textContent).toContain('Registrar serviço');
    expect(host.textContent).toContain('Atendimento em andamento');
    expect(host.textContent).toContain('Câmara fria');
    expect(host.textContent).toContain('Mercado Bom');
    expect(host.textContent).toContain('Contexto');

    await clickButton(host, /Voltar para Servi/i);
    expect(host.textContent).toContain('Em andamento');

    await clickButton(host, /Retomar registro/i);
    expect(host.textContent).toContain('Registrar serviço');
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

    expect(host.textContent).toContain('Etapa 4 · Revisar');
    expect(host.textContent).toContain('Outro · Higienizacao');

    await clickButton(host, /^Concluir serviço$/i);

    expect(host.textContent).toContain('Outro · Higienizacao registrada para');

    await clickButton(host, /^Ver relatório$/i);

    expect(host.textContent).toContain('Outro · Higienizacao');

    await clickButton(host, /Voltar para Serviços/i);

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

    expect(host.textContent).toContain('Registrar serviço');
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

  it('inicia registro apos cadastrar o primeiro equipamento vindo do estado vazio', async () => {
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
    await clickButton(host, /^Ir para Equipamentos$/i);
    await clickButton(host, /^Novo equipamento$/i);

    expect(host.textContent).toContain('Cadastro para continuar o registro');
    expect(host.textContent).toContain(
      'Salve este equipamento para retomar o Registro de serviço automaticamente.',
    );

    const name = host.querySelector('input[name="equipment-name"]');
    const location = host.querySelector('input[name="equipment-location"]');
    expect(name).toBeInstanceOf(HTMLInputElement);
    expect(location).toBeInstanceOf(HTMLInputElement);

    await fillInput(name as HTMLInputElement, 'Self contained inicial');
    await fillInput(location as HTMLInputElement, 'Area de vendas');
    await clickButton(host, /^Salvar equipamento$/i);

    expect(host.textContent).toContain('Registrar serviço');
    expect(host.textContent).toContain('Atendimento em andamento');
    expect(host.textContent).toContain('Self contained inicial');
    expect(host.textContent).toContain('Area de vendas');
  });

  it('mostra mensagem amigavel quando a data mockada impede concluir o servico', async () => {
    const host = await renderShell(createAppV2MockSnapshot({ today: '' }));

    await clickButton(host, /Iniciar servi/i);
    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Limpeza preventiva/i);
    await clickButton(host, /^Continuar$/i);

    const technician = host.querySelector('input[name="service-technician"]');
    expect(technician).toBeInstanceOf(HTMLInputElement);
    await fillInput(technician as HTMLInputElement, 'Ana Tecnica');

    const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
    await fillTextarea(diagnosis, 'Diagnostico preenchido.');
    await fillTextarea(actionsDone, 'Acoes preenchidas.');

    await clickButton(host, /^Revisar$/i);
    await clickButton(host, /^Concluir servi/i);

    expect(host.textContent).toContain('Informe uma data válida para concluir o serviço.');
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
    await clickButton(host, /^Ver relatório$/i);

    expect(host.textContent).toContain('Registro de Serviço Técnico');
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
  expect(host.textContent).not.toContain('Billing');
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
