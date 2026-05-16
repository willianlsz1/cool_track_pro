import { describe, expect, it } from 'vitest';

import {
  buildEquipmentClientDetailViewModel,
  buildEquipmentClientsListViewModel,
} from './equipmentClientsViewModel';
import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import type { BuildEquipmentViewModelInput } from './equipmentViewModel';

function createInput(): BuildEquipmentViewModelInput {
  const snapshot = createAppV2MockSnapshot();

  return {
    today: snapshot.today,
    clientes: snapshot.clientes,
    equipamentos: snapshot.equipamentos,
    compromissos: snapshot.compromissos,
    registros: snapshot.registros,
  };
}

describe('buildEquipmentClientsListViewModel', () => {
  it('lista clientes com contagem e status agregados dos equipamentos vinculados', () => {
    const viewModel = buildEquipmentClientsListViewModel(createInput());

    expect(viewModel.totalLabel).toBe('2 clientes');
    expect(viewModel.items).toHaveLength(2);
    expect(viewModel.items[0]).toMatchObject({
      id: 'cliente-1',
      equipmentCountLabel: '3 equipamentos',
      statusLabel: 'Atencao critica',
      statusTone: 'danger',
    });
  });
});

describe('buildEquipmentClientDetailViewModel', () => {
  it('monta detalhe do cliente com equipamentos associados pelo clienteId', () => {
    const detail = buildEquipmentClientDetailViewModel(createInput(), 'cliente-1');

    expect(detail.id).toBe('cliente-1');
    expect(detail.equipmentCountLabel).toBe('3 equipamentos vinculados');
    expect(detail.equipments.map((item) => item.id)).toEqual(['eq-1', 'eq-2', 'eq-4']);
  });
});
