import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { createAuthenticatedAppV2DataSource } from './appV2AuthenticatedDataSource';
import { createAppV2MockSnapshot } from './appV2MockStore';

describe('createAuthenticatedAppV2DataSource', () => {
  it('usa modo local quando nao ha usuario autenticado', async () => {
    const snapshot = createAppV2MockSnapshot();
    const dataSource = await createAuthenticatedAppV2DataSource({
      initialSnapshot: snapshot,
      sessionReader: { getCurrentUser: vi.fn().mockResolvedValue(null) },
      clientesReader: vi.fn().mockResolvedValue([{ id: 'cliente-real-1', nome: 'Real' }]),
    });

    expect(dataSource.mode).toBe('local');
    expect(dataSource.reason).toBe('missing-session');
    await expect(dataSource.dataPort.loadSnapshot()).resolves.toMatchObject({
      clientes: snapshot.clientes,
    });
  });

  it('usa userId autenticado para compor a data source existente', async () => {
    const clientesReader = vi.fn().mockResolvedValue([{ id: 'cliente-real-1', nome: 'Real' }]);
    const dataSource = await createAuthenticatedAppV2DataSource({
      initialSnapshot: createAppV2MockSnapshot(),
      sessionReader: {
        getCurrentUser: vi.fn().mockResolvedValue({ id: ' user-real-1 ', email: 'a@b.com' }),
      },
      clientesReader,
    });

    expect(dataSource.mode).toBe('clientes-readonly');
    await dataSource.dataPort.loadSnapshot();
    expect(clientesReader).toHaveBeenCalledWith('user-real-1');
  });

  it('falha de auth retorna local sem ativar readers reais', async () => {
    const clientesReader = vi.fn().mockResolvedValue([]);
    const dataSource = await createAuthenticatedAppV2DataSource({
      sessionReader: { getCurrentUser: vi.fn().mockRejectedValue(new Error('auth offline')) },
      clientesReader,
    });

    expect(dataSource.mode).toBe('local');
    expect(dataSource.reason).toBe('missing-session');
    expect(clientesReader).not.toHaveBeenCalled();
  });

  it('nao importa Supabase, auth ou storage diretamente no bridge app-v2', () => {
    const source = readFileSync(resolve(__dirname, 'appV2AuthenticatedDataSource.ts'), 'utf8');

    expect(source).not.toContain('core/supabase');
    expect(source).not.toContain('core/auth');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('@supabase');
  });
});
