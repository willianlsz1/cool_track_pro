import { describe, expect, it, vi } from 'vitest';

import { APP_V2_REGISTROS_SELECT, type SupabaseRegistroRow } from './appV2SupabaseRegistroMappers';
import { loadAppV2RegistrosFromSupabase } from './supabaseAppV2RegistrosReader';

describe('loadAppV2RegistrosFromSupabase', () => {
  it('carrega registros do usuario por user_id', async () => {
    const eqUser = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'reg-1',
          equip_id: 'eq-1',
          data: '2026-05-01',
          tipo: 'preventiva',
          status: 'ok',
          tecnico: 'Ana',
          obs: 'tudo ok',
          diagnostico: 'diag',
          acoes_executadas: 'acoes',
          custo_pecas: 150,
          custo_mao_obra: 80,
        },
      ] satisfies SupabaseRegistroRow[],
      error: null,
    });
    const select = vi.fn().mockReturnValue({ eq: eqUser });
    const from = vi.fn().mockReturnValue({ select });

    const registros = await loadAppV2RegistrosFromSupabase({
      client: { from },
      userId: ' user-1 ',
    });

    expect(from).toHaveBeenCalledWith('registros');
    expect(select).toHaveBeenCalledWith(APP_V2_REGISTROS_SELECT);
    expect(eqUser).toHaveBeenCalledWith('user_id', 'user-1');
    expect(registros).toHaveLength(1);
    expect(registros[0]).toMatchObject({
      id: 'reg-1',
      equipamentoId: 'eq-1',
      data: '2026-05-01',
      tipo: 'preventiva',
      status: 'ok',
      tecnico: 'Ana',
      diagnostico: 'diag',
      acoesExecutadas: 'acoes',
      observacoes: 'tudo ok',
      custoPecas: '150',
      custoMaoObra: '80',
    });
  });

  it('exige usuario autenticado antes de consultar', async () => {
    const from = vi.fn();

    await expect(
      loadAppV2RegistrosFromSupabase({ client: { from }, userId: '  ' }),
    ).rejects.toThrow('Usuario autenticado e obrigatorio para ler registros do app-v2.');

    expect(from).not.toHaveBeenCalled();
  });

  it('propaga erro de leitura real', async () => {
    const eqUser = vi.fn().mockResolvedValue({ data: null, error: { message: 'RLS denied' } });
    const select = vi.fn().mockReturnValue({ eq: eqUser });
    const from = vi.fn().mockReturnValue({ select });

    await expect(
      loadAppV2RegistrosFromSupabase({ client: { from }, userId: 'user-1' }),
    ).rejects.toThrow('Nao foi possivel carregar registros do app-v2: RLS denied');
  });

  it('descarta linhas invalidas retornadas pelo banco', async () => {
    const eqUser = vi.fn().mockResolvedValue({
      data: [
        { id: 'reg-1', equip_id: 'eq-1', data: '2026-05-01', tipo: 'preventiva', status: 'ok' },
        { id: '', equip_id: 'eq-2', data: '2026-05-02' },
      ] satisfies SupabaseRegistroRow[],
      error: null,
    });
    const select = vi.fn().mockReturnValue({ eq: eqUser });
    const from = vi.fn().mockReturnValue({ select });

    await expect(
      loadAppV2RegistrosFromSupabase({ client: { from }, userId: 'user-1' }),
    ).resolves.toHaveLength(1);
  });
});
