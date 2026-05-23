import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { createAppV2MockSnapshot } from './appV2MockStore';
import { createAppV2DataSource } from './appV2DataSourceFactory';

describe('createAppV2DataSource', () => {
  it('usa porta local quando a sessao nao esta disponivel', async () => {
    const snapshot = createAppV2MockSnapshot();
    const clientesReader = vi.fn().mockResolvedValue([{ id: 'cliente-real-1', nome: 'Real' }]);

    const dataSource = createAppV2DataSource({
      initialSnapshot: snapshot,
      session: null,
      clientesReader,
    });

    await expect(dataSource.dataPort.loadSnapshot()).resolves.toMatchObject({
      clientes: snapshot.clientes,
    });
    expect(dataSource.mode).toBe('local');
    expect(dataSource.reason).toBe('missing-session');
    expect(clientesReader).not.toHaveBeenCalled();
  });

  it('usa leitura real somente para clientes quando sessao e reader existem', async () => {
    const snapshot = createAppV2MockSnapshot();
    const clientesReader = vi.fn().mockResolvedValue([
      {
        id: 'cliente-real-1',
        nome: 'Cliente real',
      },
    ]);

    const dataSource = createAppV2DataSource({
      initialSnapshot: snapshot,
      session: { userId: ' user-1 ' },
      clientesReader,
    });

    await expect(dataSource.dataPort.loadSnapshot()).resolves.toMatchObject({
      clientes: [{ id: 'cliente-real-1', nome: 'Cliente real' }],
      equipamentos: snapshot.equipamentos,
      registros: snapshot.registros,
    });
    expect(dataSource.mode).toBe('clientes-readonly');
    expect(dataSource.reason).toBeUndefined();
    expect(clientesReader).toHaveBeenCalledWith('user-1');
  });

  it('compoe leitura e escrita real de clientes somente quando reader e writer existem', async () => {
    const clientesReader = vi.fn().mockResolvedValue([]);
    const clientesWriter = vi.fn().mockResolvedValue({
      id: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
      nome: 'Cliente real',
    });
    const dataSource = createAppV2DataSource({
      initialSnapshot: createAppV2MockSnapshot({ clientes: [] }),
      session: { userId: ' user-1 ' },
      clientesReader,
      clientesWriter,
    });

    const state = await dataSource.dataPort.saveClient({
      id: 'cliente-temp-1',
      nome: 'Cliente real',
      mode: 'create',
    });

    expect(dataSource.mode).toBe('clientes-readwrite');
    expect(clientesWriter).toHaveBeenCalledWith({
      userId: 'user-1',
      draft: {
        id: 'cliente-temp-1',
        nome: 'Cliente real',
        mode: 'create',
      },
    });
    expect(state.clientes).toEqual([
      {
        id: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
        nome: 'Cliente real',
      },
    ]);
  });

  it('mantem fallback local quando reader nao existe ou falha', async () => {
    const snapshot = createAppV2MockSnapshot();

    const withoutReader = createAppV2DataSource({
      initialSnapshot: snapshot,
      session: { userId: 'user-1' },
    });

    await expect(withoutReader.dataPort.loadSnapshot()).resolves.toMatchObject({
      clientes: snapshot.clientes,
    });
    expect(withoutReader.mode).toBe('local');
    expect(withoutReader.reason).toBe('missing-clientes-reader');

    const failingReader = vi.fn().mockRejectedValue(new Error('auth expired'));
    const withFailingReader = createAppV2DataSource({
      initialSnapshot: snapshot,
      session: { userId: 'user-1' },
      clientesReader: failingReader,
    });

    await expect(withFailingReader.dataPort.loadSnapshot()).resolves.toMatchObject({
      clientes: snapshot.clientes,
    });
    expect(withFailingReader.mode).toBe('clientes-readonly');
  });

  it('nao ativa escrita real quando writer existe sem reader', async () => {
    const clientesWriter = vi.fn().mockRejectedValue(new Error('nao deveria chamar'));
    const dataSource = createAppV2DataSource({
      initialSnapshot: createAppV2MockSnapshot({ clientes: [] }),
      session: { userId: 'user-1' },
      clientesWriter,
    });

    const state = await dataSource.dataPort.saveClient({
      id: 'cliente-local-1',
      nome: 'Cliente local',
      mode: 'create',
    });

    expect(dataSource.mode).toBe('local');
    expect(dataSource.reason).toBe('missing-clientes-reader');
    expect(clientesWriter).not.toHaveBeenCalled();
    expect(state.clientes).toContainEqual({
      id: 'cliente-local-1',
      nome: 'Cliente local',
    });
  });

  it('propaga erro de writer real quando modo readwrite esta ativo', async () => {
    const dataSource = createAppV2DataSource({
      initialSnapshot: createAppV2MockSnapshot({ clientes: [] }),
      session: { userId: 'user-1' },
      clientesReader: vi.fn().mockResolvedValue([]),
      clientesWriter: vi.fn().mockRejectedValue(new Error('RLS denied')),
    });

    await expect(
      dataSource.dataPort.saveClient({
        id: 'cliente-temp-1',
        nome: 'Cliente bloqueado',
        mode: 'create',
      }),
    ).rejects.toThrow('RLS denied');
  });

  it('nao importa Supabase, auth ou storage diretamente na factory', () => {
    const source = readFileSync(resolve(__dirname, 'appV2DataSourceFactory.ts'), 'utf8');

    expect(source).not.toContain('core/supabase');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('@supabase');
  });
});
