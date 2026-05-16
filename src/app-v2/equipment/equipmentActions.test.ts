import { describe, expect, it } from 'vitest';

import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import { saveEquipment } from './equipmentActions';

describe('saveEquipment', () => {
  it('cria equipamento mockado com nome, local e dados operacionais basicos', () => {
    const snapshot = createAppV2MockSnapshot({ equipamentos: [] });

    const result = saveEquipment(snapshot, {
      id: 'eq-novo',
      nome: 'Self contained loja',
      local: 'Area de vendas',
      tipo: 'Refrigeracao',
      tag: 'SELF-001',
      clienteId: 'cliente-1',
      status: 'warn',
      criticidade: 'alta',
      prioridadeOperacional: 'alta',
      periodicidadePreventivaDias: '45',
    });

    expect(result.equipamentos).toHaveLength(1);
    expect(result.equipamentos[0]).toMatchObject({
      id: 'eq-novo',
      nome: 'Self contained loja',
      local: 'Area de vendas',
      tipo: 'Refrigeracao',
      tag: 'SELF-001',
      clienteId: 'cliente-1',
      status: 'warn',
      criticidade: 'alta',
      prioridadeOperacional: 'alta',
      periodicidadePreventivaDias: 45,
    });
  });

  it('bloqueia criacao sem nome com mensagem amigavel', () => {
    const snapshot = createAppV2MockSnapshot({ equipamentos: [] });

    expect(() =>
      saveEquipment(snapshot, {
        id: 'eq-novo',
        nome: ' ',
        local: 'Area de vendas',
      }),
    ).toThrow('Informe o nome do equipamento.');
  });

  it('bloqueia criacao sem local com mensagem amigavel', () => {
    const snapshot = createAppV2MockSnapshot({ equipamentos: [] });

    expect(() =>
      saveEquipment(snapshot, {
        id: 'eq-novo',
        nome: 'Self contained loja',
        local: '',
      }),
    ).toThrow('Informe o local do equipamento.');
  });

  it('edita equipamento existente preservando id e sem duplicar historico local', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [
        {
          id: 'eq-1',
          nome: 'Split antigo',
          local: 'Recepcao',
          status: 'ok',
        },
      ],
    });

    const result = saveEquipment(snapshot, {
      id: 'eq-1',
      nome: 'Split revisado',
      local: 'Sala principal',
      status: 'danger',
    });

    expect(result.equipamentos).toHaveLength(1);
    expect(result.equipamentos[0]).toMatchObject({
      id: 'eq-1',
      nome: 'Split revisado',
      local: 'Sala principal',
      status: 'danger',
    });
  });

  it('preserva campos operacionais existentes quando a edicao minima nao os envia', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [
        {
          id: 'eq-1',
          nome: 'Split antigo',
          local: 'Recepcao',
          status: 'ok',
          criticidade: 'alta',
          prioridadeOperacional: 'alta',
          periodicidadePreventivaDias: 30,
        },
      ],
    });

    const result = saveEquipment(snapshot, {
      id: 'eq-1',
      nome: 'Split revisado',
      local: 'Recepcao',
    });

    expect(result.equipamentos[0]).toMatchObject({
      id: 'eq-1',
      nome: 'Split revisado',
      criticidade: 'alta',
      prioridadeOperacional: 'alta',
      periodicidadePreventivaDias: 30,
    });
  });

  it('bloqueia edicao de equipamento inexistente', () => {
    const snapshot = createAppV2MockSnapshot({ equipamentos: [] });

    expect(() =>
      saveEquipment(snapshot, {
        id: 'eq-inexistente',
        nome: 'Split revisado',
        local: 'Sala principal',
        mode: 'edit',
      }),
    ).toThrow('Equipamento nao encontrado para edicao.');
  });
});
