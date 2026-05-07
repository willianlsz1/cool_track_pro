import { describe, expect, it } from 'vitest';

import { buildSetorGridForClienteModel } from '../../setor/setorState.js';

describe('buildSetorGridForClienteModel', () => {
  it('inclui setor vinculado diretamente pelo clienteId', () => {
    const model = buildSetorGridForClienteModel({
      clienteId: 'cliente-1',
      setores: [{ id: 'setor-direto', clienteId: 'cliente-1' }],
      equipamentos: [],
    });

    expect(model.setoresDoCliente.map((s) => s.id)).toEqual(['setor-direto']);
  });

  it('inclui setor derivado por equipamento do cliente mesmo sem clienteId no setor', () => {
    const model = buildSetorGridForClienteModel({
      clienteId: 'cliente-1',
      setores: [{ id: 'setor-derivado', clienteId: null }],
      equipamentos: [{ id: 'eq-1', clienteId: 'cliente-1', setorId: 'setor-derivado' }],
    });

    expect(model.setoresDoCliente.map((s) => s.id)).toEqual(['setor-derivado']);
    expect(model.equipsDoCliente.map((e) => e.id)).toEqual(['eq-1']);
  });

  it('separa equipamentos sem setor do cliente', () => {
    const model = buildSetorGridForClienteModel({
      clienteId: 'cliente-1',
      setores: [],
      equipamentos: [
        { id: 'eq-sem-setor', clienteId: 'cliente-1', setorId: null },
        { id: 'eq-outro-cliente', clienteId: 'cliente-2', setorId: null },
      ],
    });

    expect(model.equipsSemSetor.map((e) => e.id)).toEqual(['eq-sem-setor']);
  });

  it('retorna arrays vazios para cliente sem setores nem equipamentos', () => {
    const model = buildSetorGridForClienteModel({
      clienteId: 'cliente-sem-setor',
      setores: [{ id: 'setor-outro', clienteId: 'cliente-1' }],
      equipamentos: [{ id: 'eq-outro', clienteId: 'cliente-1', setorId: 'setor-outro' }],
    });

    expect(model.setoresDoCliente).toEqual([]);
    expect(model.equipsDoCliente).toEqual([]);
    expect(model.equipsSemSetor).toEqual([]);
  });
});
