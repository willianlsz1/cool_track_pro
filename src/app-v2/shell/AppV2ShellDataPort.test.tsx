import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import type { AppV2DataPort } from '../data/appV2DataPort';
import { createMemoryAppV2DataAdapter } from '../data/memoryAppV2DataAdapter';
import { AppV2Shell } from './AppV2Shell';
import { clickButton, fillInput } from './AppV2Shell.testUtils';

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
