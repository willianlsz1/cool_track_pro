import { describe, expect, it, vi } from 'vitest';

import {
  APP_V2_EQUIPAMENTOS_SELECT,
  type SupabaseEquipamentoRow,
} from './appV2SupabaseEquipmentMappers';
import { loadAppV2EquipamentosByClienteFromSupabase } from './supabaseAppV2EquipmentsReader';

describe('loadAppV2EquipamentosByClienteFromSupabase', () => {
  it('carrega equipamentos por user_id e cliente_id reais', async () => {
    const eqCliente = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'eq-real-1',
          cliente_id: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
          nome: 'Split',
          local: 'Recepcao',
          status: 'warn',
        },
      ] satisfies SupabaseEquipamentoRow[],
      error: null,
    });
    const eqUser = vi.fn().mockReturnValue({ eq: eqCliente });
    const select = vi.fn().mockReturnValue({ eq: eqUser });
    const from = vi.fn().mockReturnValue({ select });

    const equipamentos = await loadAppV2EquipamentosByClienteFromSupabase({
      client: { from },
      userId: ' user-1 ',
      clienteId: ' 8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0 ',
    });

    expect(from).toHaveBeenCalledWith('equipamentos');
    expect(select).toHaveBeenCalledWith(APP_V2_EQUIPAMENTOS_SELECT);
    expect(eqUser).toHaveBeenCalledWith('user_id', 'user-1');
    expect(eqCliente).toHaveBeenCalledWith('cliente_id', '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0');
    expect(equipamentos).toEqual([
      {
        id: 'eq-real-1',
        clienteId: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
        nome: 'Split',
        local: 'Recepcao',
        status: 'warn',
      },
    ]);
  });

  it('exige usuario e cliente real antes de consultar', async () => {
    const from = vi.fn();

    await expect(
      loadAppV2EquipamentosByClienteFromSupabase({
        client: { from },
        userId: '',
        clienteId: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
      }),
    ).rejects.toThrow('Usuario autenticado e obrigatorio para ler equipamentos do app-v2.');

    await expect(
      loadAppV2EquipamentosByClienteFromSupabase({
        client: { from },
        userId: 'user-1',
        clienteId: 'cliente-1',
      }),
    ).rejects.toThrow('Cliente real precisa de UUID valido para ler equipamentos.');

    expect(from).not.toHaveBeenCalled();
  });

  it('propaga erro de leitura real sem fallback local', async () => {
    const eqCliente = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'RLS denied' },
    });
    const eqUser = vi.fn().mockReturnValue({ eq: eqCliente });
    const select = vi.fn().mockReturnValue({ eq: eqUser });
    const from = vi.fn().mockReturnValue({ select });

    await expect(
      loadAppV2EquipamentosByClienteFromSupabase({
        client: { from },
        userId: 'user-1',
        clienteId: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
      }),
    ).rejects.toThrow('Nao foi possivel carregar equipamentos do app-v2: RLS denied');
  });

  it('descarta linhas invalidas retornadas pelo banco', async () => {
    const eqCliente = vi.fn().mockResolvedValue({
      data: [
        { id: 'eq-real-1', nome: 'Split', local: 'Recepcao', status: 'ok' },
        { id: '', nome: 'Invalido', local: 'Recepcao', status: 'ok' },
      ] satisfies SupabaseEquipamentoRow[],
      error: null,
    });
    const eqUser = vi.fn().mockReturnValue({ eq: eqCliente });
    const select = vi.fn().mockReturnValue({ eq: eqUser });
    const from = vi.fn().mockReturnValue({ select });

    await expect(
      loadAppV2EquipamentosByClienteFromSupabase({
        client: { from },
        userId: 'user-1',
        clienteId: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
      }),
    ).resolves.toHaveLength(1);
  });
});
