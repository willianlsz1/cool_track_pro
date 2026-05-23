import { describe, expect, it } from 'vitest';

import { mapSupabaseClienteRowToAppV2Cliente } from './appV2SupabaseMappers';

describe('appV2SupabaseMappers', () => {
  it('mapeia uma linha de clientes para o contrato Cliente do app-v2', () => {
    expect(
      mapSupabaseClienteRowToAppV2Cliente({
        id: '48e099e1-3c38-4b5f-a16d-90046df3a65a',
        nome: 'Mercado Bom Preco',
        razao_social: 'Mercado Bom Preco LTDA',
        cnpj: '12.345.678/0001-90',
        contato: '(31) 99999-0000',
        endereco: 'Rua das Palmeiras, 120',
        inscricao_estadual: 'IE-123',
        inscricao_municipal: 'IM-456',
        url_chamados: 'https://chamados.example.com',
        finalidade: 'Comercial',
        observacoes: 'Entrada pela doca lateral.',
      }),
    ).toEqual({
      id: '48e099e1-3c38-4b5f-a16d-90046df3a65a',
      nome: 'Mercado Bom Preco',
      razaoSocial: 'Mercado Bom Preco LTDA',
      documento: '12.345.678/0001-90',
      contato: '(31) 99999-0000',
      endereco: 'Rua das Palmeiras, 120',
      inscricaoEstadual: 'IE-123',
      inscricaoMunicipal: 'IM-456',
      canalChamados: 'https://chamados.example.com',
      finalidadeAmbiente: 'Comercial',
      observacoesInternas: 'Entrada pela doca lateral.',
    });
  });

  it('descarta linha sem id ou nome e normaliza campos vazios', () => {
    expect(mapSupabaseClienteRowToAppV2Cliente({ id: '', nome: 'Cliente' })).toBeNull();
    expect(mapSupabaseClienteRowToAppV2Cliente({ id: 'cliente-1', nome: '' })).toBeNull();

    expect(
      mapSupabaseClienteRowToAppV2Cliente({
        id: 'cliente-1',
        nome: '  Padaria Central  ',
        cnpj: '',
        contato: null,
        observacoes: '   ',
      }),
    ).toEqual({
      id: 'cliente-1',
      nome: 'Padaria Central',
    });
  });
});
