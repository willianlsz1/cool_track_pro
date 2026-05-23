import { describe, expect, it, vi } from 'vitest';

import { saveAppV2EquipamentoToSupabase } from './supabaseAppV2EquipmentsWriter';
import type { SupabaseAppV2EquipmentsWriteClient } from './supabaseAppV2EquipmentsWriter';

describe('saveAppV2EquipamentoToSupabase', () => {
  it('cria equipamento real com UUID mesmo quando o shell envia id local e mapeia a linha retornada', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: '33333333-3333-4333-8333-333333333333',
        user_id: '22222222-2222-4222-8222-222222222222',
        cliente_id: '11111111-1111-4111-8111-111111111111',
        setor_id: null,
        nome: 'Split recepcao',
        local: 'Recepcao',
        status: 'warn',
        tag: 'EQ-01',
        tipo: 'Split',
        modelo: 'Carrier X',
        fluido: 'R410A',
        componente: 'condensadora',
        criticidade: 'alta',
        prioridade_operacional: 'normal',
        periodicidade_preventiva_dias: 90,
        dados_placa: {
          numero_serie: 'NS-123',
          capacidade_btu: '24000',
        },
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const client = {
      from: vi.fn(() => ({ insert })),
    } as unknown as SupabaseAppV2EquipmentsWriteClient;

    await expect(
      saveAppV2EquipamentoToSupabase({
        client,
        userId: '22222222-2222-4222-8222-222222222222',
        draft: {
          id: ' equip-local-1 ',
          mode: 'create',
          nome: ' Split recepcao ',
          local: ' Recepcao ',
          status: 'warn',
          clienteId: '11111111-1111-4111-8111-111111111111',
          setorId: 'setor-local-fora-do-cp',
          tag: ' EQ-01 ',
          tipo: ' Split ',
          componente: ' condensadora ',
          fluidoRefrigerante: ' R410A ',
          marcaModelo: ' Carrier X ',
          numeroSerie: ' NS-123 ',
          capacidadeBtuh: ' 24000 ',
          criticidade: 'alta',
          prioridadeOperacional: 'normal',
          periodicidadePreventivaDias: '90',
        },
      }),
    ).resolves.toMatchObject({
      id: '33333333-3333-4333-8333-333333333333',
      nome: 'Split recepcao',
      local: 'Recepcao',
      status: 'warn',
      clienteId: '11111111-1111-4111-8111-111111111111',
      tag: 'EQ-01',
      tipo: 'Split',
      componente: 'condensadora',
      fluidoRefrigerante: 'R410A',
      marcaModelo: 'Carrier X',
      numeroSerie: 'NS-123',
      capacidadeBtuh: '24000',
      criticidade: 'alta',
      prioridadeOperacional: 'normal',
      periodicidadePreventivaDias: 90,
    });

    expect(client.from).toHaveBeenCalledWith('equipamentos');
    expect(insert).toHaveBeenCalledTimes(1);
    const insertCalls = insert.mock.calls as unknown as Array<[Record<string, unknown>]>;
    const insertedRow = insertCalls[0][0];
    expect(insertedRow).toMatchObject({
      user_id: '22222222-2222-4222-8222-222222222222',
      cliente_id: '11111111-1111-4111-8111-111111111111',
      nome: 'Split recepcao',
      local: 'Recepcao',
      status: 'warn',
      tag: 'EQ-01',
      tipo: 'Split',
      modelo: 'Carrier X',
      fluido: 'R410A',
      componente: 'condensadora',
      criticidade: 'alta',
      prioridade_operacional: 'normal',
      periodicidade_preventiva_dias: 90,
      dados_placa: {
        numero_serie: 'NS-123',
        capacidade_btu: '24000',
      },
    });
    expect(insertedRow.id).toEqual(expect.any(String));
    expect(String(insertedRow.id)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('edita equipamento real filtrando por id e user_id', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: 'equip-real-1',
        nome: 'Split editado',
        local: 'Sala tecnica',
        status: 'ok',
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const eqUser = vi.fn(() => ({ select }));
    const eqId = vi.fn(() => ({ eq: eqUser }));
    const update = vi.fn(() => ({ eq: eqId }));
    const client = {
      from: vi.fn(() => ({ update })),
    } as unknown as SupabaseAppV2EquipmentsWriteClient;

    await saveAppV2EquipamentoToSupabase({
      client,
      userId: '22222222-2222-4222-8222-222222222222',
      draft: {
        id: ' equip-real-1 ',
        mode: 'edit',
        nome: ' Split editado ',
        local: ' Sala tecnica ',
        clienteId: '',
      },
    });

    expect(update).toHaveBeenCalledWith({
      cliente_id: null,
      nome: 'Split editado',
      local: 'Sala tecnica',
      status: 'ok',
      tag: null,
      tipo: null,
      modelo: null,
      fluido: null,
      componente: null,
      criticidade: 'media',
      prioridade_operacional: 'normal',
      periodicidade_preventiva_dias: null,
      dados_placa: {},
    });
    expect(eqId).toHaveBeenCalledWith('id', 'equip-real-1');
    expect(eqUser).toHaveBeenCalledWith('user_id', '22222222-2222-4222-8222-222222222222');
  });

  it('rejeita escrita sem userId, id, nome, local ou clienteId UUID valido', async () => {
    const client = {
      from: vi.fn(),
    } as unknown as SupabaseAppV2EquipmentsWriteClient;

    await expect(
      saveAppV2EquipamentoToSupabase({
        client,
        userId: '',
        draft: { id: 'equip-1', mode: 'create', nome: 'Equipamento', local: 'Sala' },
      }),
    ).rejects.toThrow('Usuario autenticado obrigatorio para salvar equipamento.');

    await expect(
      saveAppV2EquipamentoToSupabase({
        client,
        userId: '22222222-2222-4222-8222-222222222222',
        draft: { id: ' ', mode: 'edit', nome: 'Equipamento', local: 'Sala' },
      }),
    ).rejects.toThrow('Nao foi possivel identificar o equipamento.');

    await expect(
      saveAppV2EquipamentoToSupabase({
        client,
        userId: '22222222-2222-4222-8222-222222222222',
        draft: { id: 'equip-1', mode: 'create', nome: ' ', local: 'Sala' },
      }),
    ).rejects.toThrow('Informe o nome do equipamento.');

    await expect(
      saveAppV2EquipamentoToSupabase({
        client,
        userId: '22222222-2222-4222-8222-222222222222',
        draft: { id: 'equip-1', mode: 'create', nome: 'Equipamento', local: ' ' },
      }),
    ).rejects.toThrow('Informe o local do equipamento.');

    await expect(
      saveAppV2EquipamentoToSupabase({
        client,
        userId: '22222222-2222-4222-8222-222222222222',
        draft: {
          id: 'equip-1',
          mode: 'create',
          nome: 'Equipamento',
          local: 'Sala',
          clienteId: 'cliente-local',
        },
      }),
    ).rejects.toThrow('Cliente real precisa de UUID valido para salvar equipamento.');

    expect(client.from).not.toHaveBeenCalled();
  });

  it('propaga erro Supabase/RLS e exige dados retornados validos', async () => {
    const singleWithError = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'new row violates row-level security policy' },
    });
    const selectWithError = vi.fn(() => ({ single: singleWithError }));
    const insertWithError = vi.fn(() => ({ select: selectWithError }));
    const clientWithError = {
      from: vi.fn(() => ({ insert: insertWithError })),
    } as unknown as SupabaseAppV2EquipmentsWriteClient;

    await expect(
      saveAppV2EquipamentoToSupabase({
        client: clientWithError,
        userId: '22222222-2222-4222-8222-222222222222',
        draft: { id: 'equip-1', mode: 'create', nome: 'Equipamento', local: 'Sala' },
      }),
    ).rejects.toThrow('new row violates row-level security policy');

    const singleWithoutData = vi.fn().mockResolvedValue({ data: null, error: null });
    const selectWithoutData = vi.fn(() => ({ single: singleWithoutData }));
    const insertWithoutData = vi.fn(() => ({ select: selectWithoutData }));
    const clientWithoutData = {
      from: vi.fn(() => ({ insert: insertWithoutData })),
    } as unknown as SupabaseAppV2EquipmentsWriteClient;

    await expect(
      saveAppV2EquipamentoToSupabase({
        client: clientWithoutData,
        userId: '22222222-2222-4222-8222-222222222222',
        draft: { id: 'equip-1', mode: 'create', nome: 'Equipamento', local: 'Sala' },
      }),
    ).rejects.toThrow('Equipamento salvo sem dados retornados.');
  });
});
