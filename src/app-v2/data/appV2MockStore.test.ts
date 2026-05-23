import {
  mockEquipmentClientes,
  mockEquipmentCompromissos,
  mockEquipmentEquipamentos,
  mockEquipmentRegistros,
  mockEquipmentToday,
} from '../equipment/mockEquipmentData';
import {
  mockHomeClientes,
  mockHomeCompromissos,
  mockHomeEquipamentos,
  mockHomeRegistros,
  mockHomeToday,
} from '../home/mockHomeData';
import {
  mockServiceClientes,
  mockServiceCompromissos,
  mockServiceEquipamentos,
  mockServiceRegistros,
  mockServiceToday,
} from '../service/mockServiceData';
import { appV2MockData, createAppV2MockSnapshot } from './appV2MockStore';

describe('appV2MockStore', () => {
  it('keeps Home, Equipamentos and Serviços reading the same mock source', () => {
    expect(mockHomeToday).toBe(appV2MockData.today);
    expect(mockEquipmentToday).toBe(appV2MockData.today);
    expect(mockServiceToday).toBe(appV2MockData.today);

    expect(mockHomeClientes).toBe(appV2MockData.clientes);
    expect(mockEquipmentClientes).toBe(appV2MockData.clientes);
    expect(mockServiceClientes).toBe(appV2MockData.clientes);

    expect(mockHomeEquipamentos).toBe(appV2MockData.equipamentos);
    expect(mockEquipmentEquipamentos).toBe(appV2MockData.equipamentos);
    expect(mockServiceEquipamentos).toBe(appV2MockData.equipamentos);

    expect(mockHomeCompromissos).toBe(appV2MockData.compromissos);
    expect(mockEquipmentCompromissos).toBe(appV2MockData.compromissos);
    expect(mockServiceCompromissos).toBe(appV2MockData.compromissos);

    expect(mockHomeRegistros).toBe(appV2MockData.registros);
    expect(mockEquipmentRegistros).toBe(appV2MockData.registros);
    expect(mockServiceRegistros).toBe(appV2MockData.registros);
  });

  it('creates independent snapshots for flow tests without mutating the seed', () => {
    const snapshot = createAppV2MockSnapshot();

    snapshot.equipamentos.push({
      id: 'eq-test',
      nome: 'Equipamento de teste',
      local: 'Bancada',
      status: 'ok',
    });

    expect(snapshot.equipamentos).toHaveLength(appV2MockData.equipamentos.length + 1);
    expect(appV2MockData.equipamentos).not.toContainEqual(
      expect.objectContaining({ id: 'eq-test' }),
    );
  });
});
