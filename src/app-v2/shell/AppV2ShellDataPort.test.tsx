import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import type { AppV2DataPort } from '../data/appV2DataPort';
import { createMemoryAppV2DataAdapter } from '../data/memoryAppV2DataAdapter';
import { createServiceDraftFromRecord } from '../service/serviceFlowViewModel';
import { AppV2Shell } from './AppV2Shell';
import { clickButton, fillInput, fillTextarea, selectOption } from './AppV2Shell.testUtils';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let root: Root | null = null;

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

describe('AppV2Shell dataPort', () => {
  it('carrega snapshot por dataPort somente quando a prop e injetada explicitamente', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const remoteSnapshot = {
      ...initialSnapshot,
      clientes: [
        {
          id: 'cliente-remoto-1',
          nome: 'Cliente remoto CP-F',
          contato: '(31) 98888-0000',
        },
      ],
      equipamentos: [],
      setores: [],
      compromissos: [],
      registros: [],
      orcamentos: [],
    };
    const dataPort = createMemoryAppV2DataAdapter(remoteSnapshot);
    const loadSnapshot = vi.spyOn(dataPort, 'loadSnapshot');
    const host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);

    await act(async () => {
      root?.render(<AppV2Shell initialSnapshot={initialSnapshot} dataPort={dataPort} />);
    });

    await act(async () => {
      await Promise.resolve();
    });
    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Clientes$/i);

    expect(loadSnapshot).toHaveBeenCalledTimes(1);
    expect(host.textContent).toContain('Cliente remoto CP-F');
    expect(host.textContent).not.toContain(initialSnapshot.clientes[0].nome);
  });

  it('salva novo cliente pela dataPort injetada', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    const saveClient = vi.spyOn(dataPort, 'saveClient');
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Clientes$/i);
    await clickButton(host, /^Novo cliente$/i);

    await fillInput(host.querySelector('input[name="client-name"]') as HTMLInputElement, 'CP-K');
    await clickButton(host, /^Salvar cliente$/i);
    await flushPromises();

    expect(saveClient).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^cliente-shell-/),
        mode: 'create',
        nome: 'CP-K',
      }),
    );
    expect(host.textContent).toContain('CP-K');
    expect(host.querySelector('input[name="client-name"]')).toBeNull();
  });

  it('salva novo equipamento pela dataPort injetada', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    const saveEquipment = vi.spyOn(dataPort, 'saveEquipment');
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Novo equipamento$/i);

    await fillInput(
      host.querySelector('input[name="equipment-name"]') as HTMLInputElement,
      'Evaporadora CP-K',
    );
    await fillInput(
      host.querySelector('input[name="equipment-location"]') as HTMLInputElement,
      'Sala tecnica',
    );
    await clickButton(host, /^Salvar equipamento$/i);
    await flushPromises();

    expect(saveEquipment).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^eq-shell-/),
        mode: 'create',
        nome: 'Evaporadora CP-K',
        local: 'Sala tecnica',
      }),
    );
    expect(host.textContent).toContain('Evaporadora CP-K');
    expect(host.querySelector('input[name="equipment-name"]')).toBeNull();
  });

  it('mantem formulario aberto e mostra erro quando saveClient da dataPort rejeita', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    vi.spyOn(dataPort, 'saveClient').mockRejectedValueOnce(new Error('Falha controlada CP-K'));
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Clientes$/i);
    await clickButton(host, /^Novo cliente$/i);

    await fillInput(
      host.querySelector('input[name="client-name"]') as HTMLInputElement,
      'Cliente com erro',
    );
    await clickButton(host, /^Salvar cliente$/i);
    await flushPromises();

    expect(host.textContent).toContain('Falha controlada CP-K');
    expect(host.textContent).toContain('Novo cliente');
    expect(host.querySelector('input[name="client-name"]')).toBeInstanceOf(HTMLInputElement);
  });

  it('mantem formulario aberto e mostra erro quando saveEquipment da dataPort rejeita', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    vi.spyOn(dataPort, 'saveEquipment').mockRejectedValueOnce(new Error('Falha equipamento CP-K'));
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Novo equipamento$/i);

    await fillInput(
      host.querySelector('input[name="equipment-name"]') as HTMLInputElement,
      'Equipamento com erro',
    );
    await fillInput(
      host.querySelector('input[name="equipment-location"]') as HTMLInputElement,
      'Sala tecnica',
    );
    await clickButton(host, /^Salvar equipamento$/i);
    await flushPromises();

    expect(host.textContent).toContain('Falha equipamento CP-K');
    expect(host.textContent).toContain('Novo equipamento');
    expect(host.querySelector('input[name="equipment-name"]')).toBeInstanceOf(HTMLInputElement);
  });

  it('salva novo setor pela dataPort injetada', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    const saveSector = vi.spyOn(dataPort, 'saveSector');
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Novo setor$/i);

    await fillInput(
      host.querySelector('input[name="equipment-sector-name"]') as HTMLInputElement,
      'CP-O setor',
    );
    await selectOption(
      host.querySelector('select[name="equipment-sector-client"]') as HTMLSelectElement,
      'cliente-1',
    );
    await clickButton(host, /^Salvar setor$/i);
    await flushPromises();

    expect(saveSector).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'setor-shell-4',
        nome: 'CP-O setor',
        clienteId: 'cliente-1',
      }),
    );
    expect(host.textContent).toContain('CP-O setor');
    expect(host.querySelector('input[name="equipment-sector-name"]')).toBeNull();
  });

  it('mantem formulario aberto e mostra erro quando saveSector da dataPort rejeita', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    vi.spyOn(dataPort, 'saveSector').mockRejectedValueOnce(new Error('Falha setor CP-O'));
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /^Novo setor$/i);

    await fillInput(
      host.querySelector('input[name="equipment-sector-name"]') as HTMLInputElement,
      'Setor com erro',
    );
    await clickButton(host, /^Salvar setor$/i);
    await flushPromises();

    expect(host.textContent).toContain('Falha setor CP-O');
    expect(host.textContent).toContain('Novo setor');
    expect(host.querySelector('input[name="equipment-sector-name"]')).toBeInstanceOf(
      HTMLInputElement,
    );
  });

  it('remove setor pela dataPort injetada e preserva equipamento como sem setor', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    const deleteSector = vi.spyOn(dataPort, 'deleteSector');
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Remover setor Recep/i);
    await clickButton(host, /^Confirmar/i);
    await flushPromises();

    expect(deleteSector).toHaveBeenCalledWith('setor-1');
    expect(host.querySelector('[data-sector-card="setor-1"]')).toBeNull();
    expect(host.textContent).toContain('Split 24.000 BTU');
    expect(host.textContent).toContain('Sem setor');
  });

  it('mantem confirmacao aberta e mostra erro quando deleteSector da dataPort rejeita', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    vi.spyOn(dataPort, 'deleteSector').mockRejectedValueOnce(new Error('Falha remover setor CP-O'));
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Remover setor Recep/i);
    await clickButton(host, /^Confirmar/i);
    await flushPromises();

    expect(host.textContent).toContain('Falha remover setor CP-O');
    expect(host.querySelector('[data-sector-card="setor-1"]')).toBeInstanceOf(HTMLElement);
    expect(host.textContent).toContain('Confirmar');
  });

  it('arquiva equipamento pela dataPort injetada usando today', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    const archiveEquipment = vi.spyOn(dataPort, 'archiveEquipment');
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);
    await clickButton(host, /^Arquivar equipamento$/i);
    await clickButton(host, /^Confirmar arquivar equipamento$/i);
    await flushPromises();

    expect(archiveEquipment).toHaveBeenCalledWith('eq-1', initialSnapshot.today);
    expect(host.textContent).toContain('Arquivado em');
    expect(host.textContent).toContain('Desarquivar equipamento');
  });

  it('desarquiva equipamento pela dataPort injetada', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    const unarchiveEquipment = vi.spyOn(dataPort, 'unarchiveEquipment');
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);
    await clickButton(host, /^Arquivar equipamento$/i);
    await clickButton(host, /^Confirmar arquivar equipamento$/i);
    await flushPromises();
    await clickButton(host, /^Desarquivar equipamento$/i);
    await flushPromises();

    expect(unarchiveEquipment).toHaveBeenCalledWith('eq-1');
    expect(host.textContent).not.toContain('Arquivado em');
    expect(host.textContent).toContain('Iniciar servi');
  });

  it('mantem confirmacao aberta e mostra erro quando archiveEquipment da dataPort rejeita', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    vi.spyOn(dataPort, 'archiveEquipment').mockRejectedValueOnce(new Error('Falha archive CP-L'));
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);
    await clickButton(host, /^Arquivar equipamento$/i);
    await clickButton(host, /^Confirmar arquivar equipamento$/i);
    await flushPromises();

    expect(host.textContent).toContain('Falha archive CP-L');
    expect(host.textContent).toContain('Confirmar arquivar equipamento');
    expect(host.textContent).not.toContain('Desarquivar equipamento');
  });

  it('adiciona foto placeholder pela dataPort injetada', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    const saveEquipmentAttachment = vi.spyOn(dataPort, 'saveEquipmentAttachment');
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);
    await clickButton(host, /^Adicionar foto local$/i);
    await flushPromises();

    expect(saveEquipmentAttachment).toHaveBeenCalledWith('eq-1', {
      id: 'foto-eq-1-2',
      kind: 'foto',
      label: 'Foto local 2',
      source: 'placeholder',
      createdAt: initialSnapshot.today,
      cover: false,
    });
    expect(host.textContent).toContain('2/3 fotos locais');
    expect(host.textContent).toContain('Foto local 2');
  });

  it('mostra erro e nao adiciona foto quando saveEquipmentAttachment rejeita', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    vi.spyOn(dataPort, 'saveEquipmentAttachment').mockRejectedValueOnce(
      new Error('Falha attachment CP-N'),
    );
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Split 24\.000 BTU/i);
    await clickButton(host, /^Adicionar foto local$/i);
    await flushPromises();

    expect(host.textContent).toContain('Falha attachment CP-N');
    expect(host.textContent).toContain('1/3 fotos locais');
    expect(host.textContent).not.toContain('Foto local 2');
  });

  it('agenda preventiva pela dataPort injetada e atualiza a proxima preventiva', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    const scheduleCommitment = vi.spyOn(dataPort, 'scheduleCommitment');
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Cassete recep/i);
    await clickButton(host, /^Agendar preventiva local$/i);

    await fillInput(
      host.querySelector('input[name="equipment-preventive-date"]') as HTMLInputElement,
      '2026-06-09',
    );
    await clickButton(host, /^Salvar preventiva$/i);
    await flushPromises();

    expect(scheduleCommitment).toHaveBeenCalledWith({
      id: `compromisso-local-eq-4-${initialSnapshot.compromissos.length + 1}`,
      equipmentId: 'eq-4',
      kind: 'preventiva',
      targetDate: '2026-06-09',
      origin: 'periodicidade',
    });
    expect(host.textContent).toMatch(/Pr.xima preventiva em 09\/06/);
    expect(host.querySelector('input[name="equipment-preventive-date"]')).toBeNull();
  });

  it('mantem modal de preventiva aberto e mostra erro quando scheduleCommitment rejeita', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    vi.spyOn(dataPort, 'scheduleCommitment').mockRejectedValueOnce(
      new Error('Falha schedule CP-M'),
    );
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Equipamentos$/i);
    await clickButton(host, /Cassete recep/i);
    await clickButton(host, /^Agendar preventiva local$/i);
    await clickButton(host, /^Salvar preventiva$/i);
    await flushPromises();

    expect(host.textContent).toContain('Falha schedule CP-M');
    expect(host.textContent).toContain('Agendar preventiva local');
    expect(host.querySelector('input[name="equipment-preventive-date"]')).toBeInstanceOf(
      HTMLInputElement,
    );
  });

  it('salva rascunho de orcamento pela dataPort injetada', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    const updateQuoteDraft = vi.spyOn(dataPort, 'updateQuoteDraft');
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Servi/i);
    await clickButton(host, /^Or/i);
    await clickButton(host, /^Editar or/i);

    await fillInput(
      host.querySelector('input[name="quote-title"]') as HTMLInputElement,
      'CP-P orcamento revisado',
    );
    await clickButton(host, /^Salvar rascunho$/i);
    await flushPromises();

    expect(updateQuoteDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'orcamento-1',
        title: 'CP-P orcamento revisado',
      }),
    );
    expect(host.textContent).toContain('CP-P orcamento revisado');
    expect(host.querySelector('input[name="quote-title"]')).toBeNull();
  });

  it('mantem editor de orcamento aberto e mostra erro quando updateQuoteDraft rejeita', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    vi.spyOn(dataPort, 'updateQuoteDraft').mockRejectedValueOnce(new Error('Falha quote CP-P'));
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Servi/i);
    await clickButton(host, /^Or/i);
    await clickButton(host, /^Editar or/i);

    await fillInput(
      host.querySelector('input[name="quote-title"]') as HTMLInputElement,
      'CP-P quote com erro',
    );
    await clickButton(host, /^Salvar rascunho$/i);
    await flushPromises();

    expect(host.textContent).toContain('Falha quote CP-P');
    expect(host.querySelector('input[name="quote-title"]')).toBeInstanceOf(HTMLInputElement);
    expect((host.querySelector('input[name="quote-title"]') as HTMLInputElement).value).toBe(
      'CP-P quote com erro',
    );
  });

  it('cria orcamento pre-servico pela dataPort injetada e abre o rascunho criado', async () => {
    const initialSnapshot = createAppV2MockSnapshot({ orcamentos: [] });
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    const createPreServiceQuote = vi.spyOn(dataPort, 'createPreServiceQuote');
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Servi/i);
    await clickButton(host, /^Or/i);
    await clickButton(host, /^Novo or/i);
    await selectOption(
      host.querySelector('select[name="quote-create-equipment"]') as HTMLSelectElement,
      'eq-1',
    );
    await selectOption(
      host.querySelector('select[name="quote-create-template"]') as HTMLSelectElement,
      'instalacao-split',
    );
    await clickButton(host, /^Criar rascunho$/i);
    await flushPromises();

    expect(createPreServiceQuote).toHaveBeenCalledWith({
      id: 'orcamento-pre-servico-1',
      equipmentId: 'eq-1',
      templateId: 'instalacao-split',
    });
    expect(host.textContent).toContain('ORC-2026-001');
    expect(host.querySelector('input[name="quote-title"]')).toBeInstanceOf(HTMLInputElement);
  });

  it('mantem painel de criacao aberto e mostra erro quando createPreServiceQuote rejeita', async () => {
    const initialSnapshot = createAppV2MockSnapshot({ orcamentos: [] });
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    vi.spyOn(dataPort, 'createPreServiceQuote').mockRejectedValueOnce(
      new Error('Falha criar quote CP-P'),
    );
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /^Servi/i);
    await clickButton(host, /^Or/i);
    await clickButton(host, /^Novo or/i);
    await clickButton(host, /^Criar rascunho$/i);
    await flushPromises();

    expect(host.textContent).toContain('Falha criar quote CP-P');
    expect(host.querySelector('select[name="quote-create-equipment"]')).toBeInstanceOf(
      HTMLSelectElement,
    );
  });

  it('conclui servico novo pela dataPort injetada antes de voltar para Servicos', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    const startServiceFromEquipment = vi.spyOn(dataPort, 'startServiceFromEquipment');
    const completeService = vi.spyOn(dataPort, 'completeService');
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /Iniciar servi/i);
    await flushPromises();
    await completeCurrentServiceFlow(host, 'CP-Q diagnostico', 'CP-Q acoes');
    await clickButton(host, /^Voltar para Servi/i);
    await flushPromises();

    expect(startServiceFromEquipment).toHaveBeenCalledTimes(1);
    expect(completeService).toHaveBeenCalledWith({
      id: 'reg-shell-4',
      date: initialSnapshot.today,
      technician: 'Ana CP-Q',
      diagnosis: 'CP-Q diagnostico',
      actionsDone: 'CP-Q acoes',
      finalStatus: 'ok',
    });
    expect(host.textContent).toContain('Registros recentes');
    expect(host.textContent).toContain('Ana CP-Q');
    expect(host.textContent).toContain('CP-Q diagnostico CP-Q acoes');
    expect(host.textContent).not.toContain('Atendimento conclu');
  });

  it('mantem tela concluida e mostra erro quando completeService da dataPort rejeita', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(initialSnapshot);
    vi.spyOn(dataPort, 'completeService').mockRejectedValueOnce(new Error('Falha complete CP-Q'));
    const host = await renderShellWithDataPort(initialSnapshot, dataPort);

    await clickButton(host, /Iniciar servi/i);
    await flushPromises();
    await completeCurrentServiceFlow(host, 'CP-Q erro diagnostico', 'CP-Q erro acoes');
    await clickButton(host, /^Voltar para Servi/i);
    await flushPromises();

    expect(host.textContent).toContain('Falha complete CP-Q');
    expect(host.textContent).toContain('Atendimento conclu');
    expect(host.textContent).toContain('Ver equipamento');
    expect(host.textContent).not.toContain('Registros recentes');
  });

  it('atualiza registro existente pela dataPort injetada durante edicao', async () => {
    const initialSnapshot = createAppV2MockSnapshot();
    const editableRecord = initialSnapshot.registros[1];
    const initialFlowSnapshot = {
      ...initialSnapshot,
      serviceDraft: createServiceDraftFromRecord(editableRecord),
    };
    const dataPort = createMemoryAppV2DataAdapter(initialFlowSnapshot);
    const updateServiceRecord = vi.spyOn(dataPort, 'updateServiceRecord');
    const host = await renderShellWithDataPort(initialFlowSnapshot, dataPort);

    await clickButton(host, /^Servi/i);
    await clickButton(host, /^Editar$/i);
    await clickButton(host, /^Continuar$/i);
    await clickButton(host, /^Continuar$/i);

    const technician = host.querySelector('input[name="service-technician"]');
    expect(technician).toBeInstanceOf(HTMLInputElement);
    await fillInput(technician as HTMLInputElement, 'Ana CP-Q Editora');

    const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
    await fillTextarea(diagnosis, 'CP-Q diagnostico editado');
    await fillTextarea(actionsDone, 'CP-Q acoes editadas');

    await clickButton(host, /^Revisar$/i);
    await clickButton(host, /^Concluir servi/i);
    await clickButton(host, /^Voltar para Servi/i);
    await flushPromises();

    expect(updateServiceRecord).toHaveBeenCalledWith({
      id: editableRecord.id,
      date: editableRecord.data,
      technician: 'Ana CP-Q Editora',
      diagnosis: 'CP-Q diagnostico editado',
      actionsDone: 'CP-Q acoes editadas',
      finalStatus: editableRecord.status,
    });
    expect(host.textContent).toContain('Ana CP-Q Editora');
    expect(host.textContent).toContain('CP-Q diagnostico editado CP-Q acoes editadas');
    expect(host.textContent).toContain('Registros recentes');
  });
});

async function renderShellWithDataPort(
  initialSnapshot: ReturnType<typeof createAppV2MockSnapshot>,
  dataPort: AppV2DataPort,
): Promise<HTMLElement> {
  const host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);

  await act(async () => {
    root?.render(<AppV2Shell initialSnapshot={initialSnapshot} dataPort={dataPort} />);
  });
  await flushPromises();

  return host;
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
  });
}

async function completeCurrentServiceFlow(
  host: HTMLElement,
  diagnosisText: string,
  actionsDoneText: string,
) {
  await clickButton(host, /^Continuar$/i);
  await clickButton(host, /^Limpeza preventiva/i);
  await clickButton(host, /^Continuar$/i);

  const technician = host.querySelector('input[name="service-technician"]');
  expect(technician).toBeInstanceOf(HTMLInputElement);
  await fillInput(technician as HTMLInputElement, 'Ana CP-Q');

  const [diagnosis, actionsDone] = Array.from(host.querySelectorAll('textarea'));
  await fillTextarea(diagnosis, diagnosisText);
  await fillTextarea(actionsDone, actionsDoneText);

  await clickButton(host, /^Revisar$/i);
  await clickButton(host, /^Concluir servi/i);

  expect(host.textContent).toContain('Atendimento conclu');
}
