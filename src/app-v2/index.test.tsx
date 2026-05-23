import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppV2MockSnapshot } from './data/appV2MockStore';
import { createMemoryAppV2DataAdapter } from './data/memoryAppV2DataAdapter';
import { mountAppV2, type AppV2MountHandle } from './index';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let mountedApp: AppV2MountHandle | null = null;

afterEach(async () => {
  if (mountedApp) {
    await act(async () => {
      mountedApp?.unmount();
    });
  }

  mountedApp = null;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('mountAppV2', () => {
  it('permite injetar dataPort no harness sem mudar o default local', async () => {
    const snapshot = createAppV2MockSnapshot();
    const dataPort = createMemoryAppV2DataAdapter(snapshot);
    const loadSnapshot = vi.spyOn(dataPort, 'loadSnapshot');
    const root = document.createElement('div');
    document.body.appendChild(root);

    await act(async () => {
      mountedApp = mountAppV2(root, { dataPort });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(loadSnapshot).toHaveBeenCalled();
    expect(root.textContent).toContain('Hoje');
  });

  it('mantem mount do app-v2 sem importar auth ou Supabase', () => {
    const source = readFileSync(resolve(__dirname, 'index.tsx'), 'utf8');

    expect(source).not.toContain('core/auth');
    expect(source).not.toContain('core/supabase');
    expect(source).not.toContain('@supabase');
  });

  it('mantem preview default local sem ativar data source autenticado', () => {
    const source = readFileSync(resolve(__dirname, 'preview.tsx'), 'utf8');

    expect(source).toContain('mountAppV2(root)');
    expect(source).not.toContain('mountAuthenticatedAppV2');
    expect(source).not.toContain('authenticatedHarness');
    expect(source).not.toContain('createAuthenticatedAppV2DataSource');
    expect(source).not.toContain('core/auth');
    expect(source).not.toContain('core/supabase');
    expect(source).not.toContain('@supabase');
  });
});
