import { describe, expect, it } from 'vitest';

import { resolveRegistroContext } from '../ui/composables/registroContext.js';

const baseState = {
  clientes: [
    {
      id: 'c1',
      nome: 'Cliente A',
      cnpj: '00.000.000/0001-00',
      endereco: 'Rua 1',
      telefone: '1199',
    },
  ],
  setores: [{ id: 's1', nome: 'Setor Frio', clienteId: 'c1' }],
  equipamentos: [{ id: 'e1', nome: 'Split 1', tag: 'EQ-1', clienteId: 'c1', setorId: 's1' }],
};

describe('resolveRegistroContext', () => {
  it('prioriza ids explícitos de params', () => {
    const context = resolveRegistroContext(
      { clienteId: 'c1', setorId: 's1', equipId: 'e1' },
      baseState,
    );

    expect(context.cliente?.id).toBe('c1');
    expect(context.setor?.id).toBe('s1');
    expect(context.equipamento?.id).toBe('e1');
    expect(context.hasCompanyContext).toBe(true);
  });

  it('infere cliente pelo equipamento quando não vem em params', () => {
    const context = resolveRegistroContext({ equipId: 'e1' }, baseState);

    expect(context.cliente?.id).toBe('c1');
    expect(context.setor?.id).toBe('s1');
    expect(context.shouldWarnEquipmentOnly).toBe(false);
  });

  it('mostra aviso de histórico apenas no equipamento sem cliente/setor', () => {
    const context = resolveRegistroContext(
      { equipId: 'e2' },
      {
        ...baseState,
        equipamentos: [{ id: 'e2', nome: 'Janela', tag: 'EQ-2' }],
      },
    );

    expect(context.cliente).toBeNull();
    expect(context.setor).toBeNull();
    expect(context.shouldWarnEquipmentOnly).toBe(true);
  });

  it('sinaliza equipamento ausente sem quebrar o contexto', () => {
    const context = resolveRegistroContext({ equipId: 'missing' }, baseState);

    expect(context.equipamento).toBeNull();
    expect(context.missingEquipFromParams).toBe(true);
    expect(context.hasRouteContext).toBe(true);
  });
});
