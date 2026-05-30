import { describe, expect, it, vi } from 'vitest';

import type { RegistroServico } from '../domain/types';
import { APP_V2_REGISTROS_SELECT } from './appV2SupabaseRegistroMappers';
import { saveAppV2RegistroToSupabase } from './supabaseAppV2RegistrosWriter';

const baseRegistro: RegistroServico = {
  id: 'reg-1',
  equipamentoId: 'eq-1',
  data: '2026-05-01',
  tipo: 'corretiva',
  status: 'warn',
  tecnico: 'Ana',
  diagnostico: 'vazamento',
  acoesExecutadas: 'troca de valvula',
  observacoes: 'vazamento troca de valvula',
  custoPecas: '150,00',
  custoMaoObra: '80',
  proximaData: '2026-08-01',
};

function buildWriteClient(response: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(response);
  const select = vi.fn().mockReturnValue({ single });
  const upsert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ upsert });
  return { client: { from }, single, select, upsert, from };
}

describe('saveAppV2RegistroToSupabase', () => {
  it('faz upsert com user_id e converte custos para numero', async () => {
    const { client, upsert, select } = buildWriteClient({
      data: {
        id: 'reg-1',
        equip_id: 'eq-1',
        data: '2026-05-01',
        tipo: 'corretiva',
        status: 'warn',
        tecnico: 'Ana',
        diagnostico: 'vazamento',
        acoes_executadas: 'troca de valvula',
        obs: 'vazamento troca de valvula',
        custo_pecas: 150,
        custo_mao_obra: 80,
        proxima: '2026-08-01',
      },
      error: null,
    });

    const saved = await saveAppV2RegistroToSupabase({
      client,
      userId: ' user-1 ',
      registro: baseRegistro,
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'reg-1',
        user_id: 'user-1',
        equip_id: 'eq-1',
        tipo: 'corretiva',
        tipo_descricao: null,
        diagnostico: 'vazamento',
        acoes_executadas: 'troca de valvula',
        custo_pecas: 150,
        custo_mao_obra: 80,
        proxima: '2026-08-01',
      }),
    );
    expect(select).toHaveBeenCalledWith(APP_V2_REGISTROS_SELECT);
    expect(saved).toMatchObject({
      id: 'reg-1',
      equipamentoId: 'eq-1',
      tipo: 'corretiva',
      diagnostico: 'vazamento',
      custoPecas: '150',
    });
  });

  it('exige usuario e id antes de salvar', async () => {
    const { client, from } = buildWriteClient({ data: null, error: null });

    await expect(
      saveAppV2RegistroToSupabase({ client, userId: '', registro: baseRegistro }),
    ).rejects.toThrow('Usuario autenticado obrigatorio para salvar registro.');

    await expect(
      saveAppV2RegistroToSupabase({
        client,
        userId: 'user-1',
        registro: { ...baseRegistro, id: '' },
      }),
    ).rejects.toThrow('Registro precisa de id para salvar.');

    expect(from).not.toHaveBeenCalled();
  });

  it('propaga erro de escrita real', async () => {
    const { client } = buildWriteClient({ data: null, error: { message: 'RLS denied' } });

    await expect(
      saveAppV2RegistroToSupabase({ client, userId: 'user-1', registro: baseRegistro }),
    ).rejects.toThrow('RLS denied');
  });
});
