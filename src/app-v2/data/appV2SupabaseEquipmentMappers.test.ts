import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  APP_V2_EQUIPAMENTOS_SELECT,
  mapSupabaseEquipamentoRowToAppV2Equipamento,
} from './appV2SupabaseEquipmentMappers';

describe('mapSupabaseEquipamentoRowToAppV2Equipamento', () => {
  it('mapeia campos reais minimos e relacionamentos Cliente -> Equipamento', () => {
    expect(
      mapSupabaseEquipamentoRowToAppV2Equipamento({
        id: 'eq-real-1',
        cliente_id: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
        setor_id: 'setor-real-1',
        nome: ' Split 24.000 BTU ',
        local: ' Recepcao ',
        status: 'warn',
        created_at: '2026-05-23T10:00:00.000Z',
      }),
    ).toEqual({
      id: 'eq-real-1',
      clienteId: '8e3b08ce-5b33-42fd-9cbf-5a73e81d41e0',
      setorId: 'setor-real-1',
      nome: 'Split 24.000 BTU',
      local: 'Recepcao',
      status: 'warn',
      createdAt: '2026-05-23T10:00:00.000Z',
    });
  });

  it('mapeia campos opcionais e dados de placa sem incluir fotos/storage', () => {
    expect(
      mapSupabaseEquipamentoRowToAppV2Equipamento({
        id: 'eq-real-2',
        nome: 'Central',
        local: 'Producao',
        status: 'ok',
        tag: 'CTR-002',
        tipo: 'Refrigeracao',
        modelo: 'Carrier X',
        fluido: 'R-410A',
        componente: 'condensadora',
        criticidade: 'critica',
        prioridade_operacional: 'alta',
        periodicidade_preventiva_dias: 45,
        dados_placa: {
          numero_serie: 'SN-123',
          capacidade_btu: 24000,
        },
        fotos: [{ path: 'fora-do-escopo.jpg' }],
      }),
    ).toEqual({
      id: 'eq-real-2',
      nome: 'Central',
      local: 'Producao',
      status: 'ok',
      tag: 'CTR-002',
      tipo: 'Refrigeracao',
      marcaModelo: 'Carrier X',
      fluidoRefrigerante: 'R-410A',
      componente: 'condensadora',
      criticidade: 'critica',
      prioridadeOperacional: 'alta',
      periodicidadePreventivaDias: 45,
      numeroSerie: 'SN-123',
      capacidadeBtuh: '24000',
    });
  });

  it('normaliza enums desconhecidos para defaults seguros', () => {
    expect(
      mapSupabaseEquipamentoRowToAppV2Equipamento({
        id: 'eq-real-3',
        nome: 'Camara fria',
        local: 'Estoque',
        status: 'quebrado',
        criticidade: 'urgente',
        prioridade_operacional: 'maxima',
      }),
    ).toEqual({
      id: 'eq-real-3',
      nome: 'Camara fria',
      local: 'Estoque',
      status: 'ok',
      criticidade: 'media',
      prioridadeOperacional: 'normal',
    });
  });

  it('descarta linhas sem id, nome ou local validos', () => {
    expect(
      mapSupabaseEquipamentoRowToAppV2Equipamento({ id: '', nome: 'Split', local: 'Sala' }),
    ).toBeNull();
    expect(
      mapSupabaseEquipamentoRowToAppV2Equipamento({ id: 'eq-1', nome: '', local: 'Sala' }),
    ).toBeNull();
    expect(
      mapSupabaseEquipamentoRowToAppV2Equipamento({ id: 'eq-1', nome: 'Split', local: '' }),
    ).toBeNull();
  });

  it('mantem select read-only sem colunas de storage como payload operacional', () => {
    expect(APP_V2_EQUIPAMENTOS_SELECT).toContain('cliente_id');
    expect(APP_V2_EQUIPAMENTOS_SELECT).toContain('dados_placa');
    expect(APP_V2_EQUIPAMENTOS_SELECT).not.toContain('fotos');
  });

  it('nao importa Supabase, storage real, billing, PDF/share ou WhatsApp', () => {
    const source = readFileSync('src/app-v2/data/appV2SupabaseEquipmentMappers.ts', 'utf-8');

    expect(source).not.toContain('core/supabase');
    expect(source).not.toContain('@supabase');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('billing');
    expect(source).not.toContain('pdf');
    expect(source).not.toContain('whatsapp');
  });
});
