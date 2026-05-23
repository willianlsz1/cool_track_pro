import { describe, expect, it, vi } from 'vitest';

import { loadAppV2ClientesFromSupabase } from './supabaseAppV2ClientsReader';

describe('supabaseAppV2ClientsReader', () => {
  it('carrega clientes do usuario atual com client injetado e mapper app-v2', async () => {
    const eq = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'cliente-1',
          nome: 'Mercado Bom Preco',
          cnpj: '12.345.678/0001-90',
          url_chamados: 'https://chamados.example.com',
          finalidade: 'Comercial',
          observacoes: 'Contato pelo gerente.',
        },
      ],
      error: null,
    });
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    await expect(
      loadAppV2ClientesFromSupabase({
        client: { from },
        userId: 'user-1',
      }),
    ).resolves.toEqual([
      {
        id: 'cliente-1',
        nome: 'Mercado Bom Preco',
        documento: '12.345.678/0001-90',
        canalChamados: 'https://chamados.example.com',
        finalidadeAmbiente: 'Comercial',
        observacoesInternas: 'Contato pelo gerente.',
      },
    ]);

    expect(from).toHaveBeenCalledWith('clientes');
    expect(select).toHaveBeenCalledWith(
      'id,nome,razao_social,cnpj,contato,endereco,inscricao_estadual,inscricao_municipal,url_chamados,finalidade,observacoes',
    );
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('filtra linhas invalidas e nao faz fallback para storage local', async () => {
    const client = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            data: [
              { id: 'cliente-1', nome: 'Cliente valido' },
              { id: '', nome: 'Sem id' },
              { id: 'cliente-2', nome: '' },
            ],
            error: null,
          }),
        })),
      })),
    };

    await expect(loadAppV2ClientesFromSupabase({ client, userId: 'user-1' })).resolves.toEqual([
      {
        id: 'cliente-1',
        nome: 'Cliente valido',
      },
    ]);
  });

  it('falha de forma explicita quando userId esta ausente ou a query retorna erro', async () => {
    await expect(
      loadAppV2ClientesFromSupabase({
        client: {
          from: vi.fn(),
        },
        userId: '',
      }),
    ).rejects.toThrow('Usuario autenticado e obrigatorio para ler clientes do app-v2.');

    await expect(
      loadAppV2ClientesFromSupabase({
        client: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'RLS denied' },
              }),
            })),
          })),
        },
        userId: 'user-1',
      }),
    ).rejects.toThrow('Nao foi possivel carregar clientes do app-v2: RLS denied');
  });
});
