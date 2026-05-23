import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import { createMemoryAppV2DataAdapter } from '../data/memoryAppV2DataAdapter';
import { AppV2Shell } from './AppV2Shell';
import { clickButton } from './AppV2Shell.testUtils';

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
});
