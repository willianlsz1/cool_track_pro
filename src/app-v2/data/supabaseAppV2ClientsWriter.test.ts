import { describe, expect, it, vi } from 'vitest';

import { saveAppV2ClienteToSupabase } from './supabaseAppV2ClientsWriter';
import type { SupabaseAppV2ClientsWriteClient } from './supabaseAppV2ClientsWriter';

describe('saveAppV2ClienteToSupabase', () => {
  it('cria cliente real deixando o banco gerar UUID e mapeia a linha retornada', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: '11111111-1111-4111-8111-111111111111',
        nome: 'Cliente real',
        razao_social: 'Cliente Real LTDA',
        cnpj: '12.345.678/0001-90',
        contato: '(31) 98888-0000',
        endereco: null,
        inscricao_estadual: null,
        inscricao_municipal: null,
        url_chamados: null,
        finalidade: 'Comercial',
        observacoes: null,
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const client = {
      from: vi.fn(() => ({ insert })),
    } as unknown as SupabaseAppV2ClientsWriteClient;

    await expect(
      saveAppV2ClienteToSupabase({
        client,
        userId: '22222222-2222-4222-8222-222222222222',
        draft: {
          id: 'cliente-local-temp',
          mode: 'create',
          nome: ' Cliente real ',
          razaoSocial: ' Cliente Real LTDA ',
          documento: ' 12.345.678/0001-90 ',
          contato: ' (31) 98888-0000 ',
          finalidadeAmbiente: ' Comercial ',
        },
      }),
    ).resolves.toMatchObject({
      id: '11111111-1111-4111-8111-111111111111',
      nome: 'Cliente real',
      razaoSocial: 'Cliente Real LTDA',
      documento: '12.345.678/0001-90',
      finalidadeAmbiente: 'Comercial',
    });

    expect(client.from).toHaveBeenCalledWith('clientes');
    expect(insert).toHaveBeenCalledWith({
      user_id: '22222222-2222-4222-8222-222222222222',
      nome: 'Cliente real',
      razao_social: 'Cliente Real LTDA',
      cnpj: '12.345.678/0001-90',
      contato: '(31) 98888-0000',
      endereco: null,
      inscricao_estadual: null,
      inscricao_municipal: null,
      url_chamados: null,
      finalidade: 'Comercial',
      observacoes: null,
    });
  });

  it('edita cliente real somente com UUID e escopo de user_id', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: '11111111-1111-4111-8111-111111111111',
        nome: 'Cliente editado',
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const eqUser = vi.fn(() => ({ select }));
    const eqId = vi.fn(() => ({ eq: eqUser }));
    const update = vi.fn(() => ({ eq: eqId }));
    const client = {
      from: vi.fn(() => ({ update })),
    } as unknown as SupabaseAppV2ClientsWriteClient;

    await saveAppV2ClienteToSupabase({
      client,
      userId: '22222222-2222-4222-8222-222222222222',
      draft: {
        id: '11111111-1111-4111-8111-111111111111',
        mode: 'edit',
        nome: 'Cliente editado',
        observacoesInternas: '',
      },
    });

    expect(update).toHaveBeenCalledWith({
      nome: 'Cliente editado',
      razao_social: null,
      cnpj: null,
      contato: null,
      endereco: null,
      inscricao_estadual: null,
      inscricao_municipal: null,
      url_chamados: null,
      finalidade: null,
      observacoes: null,
    });
    expect(eqId).toHaveBeenCalledWith('id', '11111111-1111-4111-8111-111111111111');
    expect(eqUser).toHaveBeenCalledWith('user_id', '22222222-2222-4222-8222-222222222222');
  });

  it('rejeita escrita sem userId, nome ou UUID valido para edicao', async () => {
    const client = {
      from: vi.fn(),
    } as unknown as SupabaseAppV2ClientsWriteClient;

    await expect(
      saveAppV2ClienteToSupabase({
        client,
        userId: '',
        draft: { id: 'cliente-local', mode: 'create', nome: 'Cliente' },
      }),
    ).rejects.toThrow('Usuario autenticado obrigatorio para salvar cliente.');

    await expect(
      saveAppV2ClienteToSupabase({
        client,
        userId: '22222222-2222-4222-8222-222222222222',
        draft: { id: 'cliente-local', mode: 'create', nome: ' ' },
      }),
    ).rejects.toThrow('Informe o nome do cliente.');

    await expect(
      saveAppV2ClienteToSupabase({
        client,
        userId: '22222222-2222-4222-8222-222222222222',
        draft: { id: 'cliente-local', mode: 'edit', nome: 'Cliente' },
      }),
    ).rejects.toThrow('Cliente real precisa de UUID valido para edicao.');

    expect(client.from).not.toHaveBeenCalled();
  });

  it('propaga erro retornado pelo Supabase sem fallback para escrita local', async () => {
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'new row violates row-level security policy' },
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const client = {
      from: vi.fn(() => ({ insert })),
    } as unknown as SupabaseAppV2ClientsWriteClient;

    await expect(
      saveAppV2ClienteToSupabase({
        client,
        userId: '22222222-2222-4222-8222-222222222222',
        draft: { id: 'cliente-local', mode: 'create', nome: 'Cliente' },
      }),
    ).rejects.toThrow('new row violates row-level security policy');
  });
});
