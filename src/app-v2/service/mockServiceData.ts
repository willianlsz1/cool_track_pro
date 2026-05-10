import type { Cliente, CompromissoServico, Equipamento, RegistroServico } from '../domain/types';
import {
  mockEquipmentClientes,
  mockEquipmentCompromissos,
  mockEquipmentEquipamentos,
  mockEquipmentRegistros,
  mockEquipmentToday,
} from '../equipment/mockEquipmentData';

export const mockServiceToday = mockEquipmentToday;
export const mockServiceClientes: Cliente[] = mockEquipmentClientes;
export const mockServiceEquipamentos: Equipamento[] = mockEquipmentEquipamentos;
export const mockServiceCompromissos: CompromissoServico[] = mockEquipmentCompromissos;
export const mockServiceRegistros: RegistroServico[] = mockEquipmentRegistros;
