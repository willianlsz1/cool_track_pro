import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountAuthenticatedAppV2 } from './authenticatedHarness';
import { createAppV2MockSnapshot } from './data/appV2MockStore';
import type { AppV2MountHandle } from './index';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

type MountedAuthenticatedApp = AppV2MountHandle & {
  dataSource?: {
    mode: string;
    reason?: string;
  };
};

let mountedApp: MountedAuthenticatedApp | null = null;

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

describe('mountAuthenticatedAppV2', () => {
  it('monta o app-v2 por data source autenticada opt-in', async () => {
    const root = document.createElement('div');
    const clientesReader = vi
      .fn()
      .mockResolvedValue([{ id: 'cliente-real-1', nome: 'Cliente Real' }]);

    document.body.appendChild(root);

    await act(async () => {
      mountedApp = await mountAuthenticatedAppV2(root, {
        initialSnapshot: createAppV2MockSnapshot(),
        sessionReader: {
          getCurrentUser: vi.fn().mockResolvedValue({ id: ' user-real-1 ' }),
        },
        clientesReader,
      });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mountedApp?.dataSource?.mode).toBe('clientes-readonly');
    expect(clientesReader).toHaveBeenCalledWith('user-real-1');
    expect(root.textContent).toContain('Hoje');
  });

  it('preserva fallback local quando o harness opt-in nao encontra sessao', async () => {
    const root = document.createElement('div');
    const clientesReader = vi
      .fn()
      .mockResolvedValue([{ id: 'cliente-real-1', nome: 'Cliente Real' }]);

    document.body.appendChild(root);

    await act(async () => {
      mountedApp = await mountAuthenticatedAppV2(root, {
        initialSnapshot: createAppV2MockSnapshot(),
        sessionReader: { getCurrentUser: vi.fn().mockResolvedValue(null) },
        clientesReader,
      });
    });

    expect(mountedApp?.dataSource?.mode).toBe('local');
    expect(mountedApp?.dataSource?.reason).toBe('missing-session');
    expect(clientesReader).not.toHaveBeenCalled();
    expect(root.textContent).toContain('Hoje');
  });

  it('mantem helper opt-in sem importar auth, Supabase ou storage diretamente', () => {
    const source = readFileSync(resolve(__dirname, 'authenticatedHarness.ts'), 'utf8');

    expect(source).not.toContain('core/auth');
    expect(source).not.toContain('core/supabase');
    expect(source).not.toContain('@supabase');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
  });
});
