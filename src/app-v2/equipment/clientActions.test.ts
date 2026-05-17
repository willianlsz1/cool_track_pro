import { describe, expect, it } from 'vitest';

import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import { saveClient } from './clientActions';

describe('saveClient', () => {
  it('cria cliente mockado com nome e dados cadastrais opcionais', () => {
    const snapshot = createAppV2MockSnapshot({ clientes: [] });

    const result = saveClient(snapshot, {
      id: 'cliente-novo',
      nome: 'Padaria Central',
      razaoSocial: 'Padaria Central LTDA',
      documento: '12.345.678/0001-90',
      contato: '(11) 97777-0000',
      endereco: 'Rua Central, 42',
    });

    expect(result.clientes).toHaveLength(1);
    expect(result.clientes[0]).toMatchObject({
      id: 'cliente-novo',
      nome: 'Padaria Central',
      razaoSocial: 'Padaria Central LTDA',
      documento: '12.345.678/0001-90',
      contato: '(11) 97777-0000',
      endereco: 'Rua Central, 42',
    });
  });

  it('bloqueia cliente sem nome com mensagem amigavel', () => {
    const snapshot = createAppV2MockSnapshot({ clientes: [] });

    expect(() =>
      saveClient(snapshot, {
        id: 'cliente-novo',
        nome: ' ',
      }),
    ).toThrow('Informe o nome do cliente.');
  });

  it('edita cliente existente preservando id e sem duplicar lista local', () => {
    const snapshot = createAppV2MockSnapshot({
      clientes: [
        {
          id: 'cliente-1',
          nome: 'Mercado antigo',
          contato: '(11) 90000-0000',
        },
      ],
    });

    const result = saveClient(snapshot, {
      id: 'cliente-1',
      nome: 'Mercado revisado',
      contato: '(11) 91111-0000',
      mode: 'edit',
    });

    expect(result.clientes).toHaveLength(1);
    expect(result.clientes[0]).toMatchObject({
      id: 'cliente-1',
      nome: 'Mercado revisado',
      contato: '(11) 91111-0000',
    });
  });

  it('bloqueia edicao de cliente inexistente', () => {
    const snapshot = createAppV2MockSnapshot({ clientes: [] });

    expect(() =>
      saveClient(snapshot, {
        id: 'cliente-inexistente',
        nome: 'Cliente revisado',
        mode: 'edit',
      }),
    ).toThrow('Cliente não encontrado para edição.');
  });
});
