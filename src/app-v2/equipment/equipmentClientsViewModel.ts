import {
  buildEquipmentListViewModel,
  type BuildEquipmentViewModelInput,
  type EquipmentListItemViewModel,
  type EquipmentTone,
} from './equipmentViewModel';
import type { RegistroServico } from '../domain/types';
import { formatServiceRecordKind } from '../service/serviceFlowViewModel';

export interface EquipmentClientsListViewModel {
  title: 'Clientes';
  subtitle: 'Base instalada por cliente';
  totalLabel: string;
  items: EquipmentClientListItemViewModel[];
}

export interface EquipmentClientListItemViewModel {
  id: string;
  name: string;
  detailLine: string;
  contactLine: string;
  equipmentCountLabel: string;
  statusLabel: string;
  statusTone: EquipmentTone;
}

export interface EquipmentClientDetailViewModel {
  id: string;
  name: string;
  contactLine: string;
  addressLine: string;
  documentLine: string;
  equipmentCountLabel: string;
  statusLabel: string;
  statusTone: EquipmentTone;
  equipments: EquipmentListItemViewModel[];
  servicesCountLabel: string;
  services: EquipmentClientServiceViewModel[];
}

export interface EquipmentClientServiceViewModel {
  id: string;
  equipmentName: string;
  kindLabel: string;
  dateLabel: string;
  statusLabel: string;
  statusTone: EquipmentTone;
  summary: string;
}

export function buildEquipmentClientsListViewModel(
  input: BuildEquipmentViewModelInput,
): EquipmentClientsListViewModel {
  const equipmentItems = buildEquipmentListViewModel(input).items;

  const items = input.clientes.map((cliente) => {
    const equipments = equipmentItems.filter((equipment) =>
      input.equipamentos.some(
        (rawEquipment) => rawEquipment.id === equipment.id && rawEquipment.clienteId === cliente.id,
      ),
    );
    const statusTone = getClientStatusTone(equipments);

    return {
      id: cliente.id,
      name: cliente.nome,
      detailLine: cliente.razaoSocial ?? cliente.endereco ?? 'Cliente sem endereco informado',
      contactLine: cliente.contato ?? 'Sem contato informado',
      equipmentCountLabel: formatCount(equipments.length, 'equipamento', 'equipamentos'),
      statusLabel: formatClientStatus(statusTone, equipments.length),
      statusTone,
    };
  });

  return {
    title: 'Clientes',
    subtitle: 'Base instalada por cliente',
    totalLabel: formatCount(items.length, 'cliente', 'clientes'),
    items,
  };
}

export function buildEquipmentClientDetailViewModel(
  input: BuildEquipmentViewModelInput,
  clientId: string,
): EquipmentClientDetailViewModel {
  const cliente = input.clientes.find((item) => item.id === clientId);

  if (!cliente) {
    throw new Error(`Cliente nao encontrado: ${clientId}`);
  }

  const equipmentItems = buildEquipmentListViewModel(input).items.filter((equipment) =>
    input.equipamentos.some(
      (rawEquipment) => rawEquipment.id === equipment.id && rawEquipment.clienteId === cliente.id,
    ),
  );
  const clientEquipmentIds = new Set(equipmentItems.map((equipment) => equipment.id));
  const services = input.registros
    .filter((registro) => clientEquipmentIds.has(registro.equipamentoId))
    .slice()
    .sort((a, b) => b.data.localeCompare(a.data))
    .map((registro) => mapClientService(input, registro));
  const statusTone = getClientStatusTone(equipmentItems);

  return {
    id: cliente.id,
    name: cliente.nome,
    contactLine: cliente.contato ?? 'Sem contato informado',
    addressLine: cliente.endereco ?? 'Sem endereco informado',
    documentLine: cliente.documento ?? 'Sem documento informado',
    equipmentCountLabel: formatCount(
      equipmentItems.length,
      'equipamento vinculado',
      'equipamentos vinculados',
    ),
    statusLabel: formatClientStatus(statusTone, equipmentItems.length),
    statusTone,
    equipments: equipmentItems,
    servicesCountLabel: formatCount(
      services.length,
      'servico relacionado',
      'servicos relacionados',
    ),
    services,
  };
}

function mapClientService(
  input: BuildEquipmentViewModelInput,
  registro: RegistroServico,
): EquipmentClientServiceViewModel {
  const equipamento = input.equipamentos.find((item) => item.id === registro.equipamentoId);

  return {
    id: registro.id,
    equipmentName: equipamento?.nome ?? 'Equipamento nao encontrado',
    kindLabel: registro.tipoDescricao ?? formatServiceRecordKind(registro.tipo),
    dateLabel: formatDateLabel(registro.data),
    statusLabel: formatServiceStatus(registro.status),
    statusTone: mapServiceStatusTone(registro.status),
    summary: registro.observacoes?.trim() || 'Sem resumo tecnico informado.',
  };
}

function getClientStatusTone(equipments: EquipmentListItemViewModel[]): EquipmentTone {
  if (equipments.some((item) => item.statusTone === 'danger' || item.nextActionTone === 'danger')) {
    return 'danger';
  }

  if (
    equipments.some((item) => item.statusTone === 'warning' || item.nextActionTone === 'warning')
  ) {
    return 'warning';
  }

  return 'success';
}

function formatClientStatus(tone: EquipmentTone, equipmentCount: number): string {
  if (equipmentCount === 0) {
    return 'Sem equipamentos';
  }

  if (tone === 'danger') {
    return 'Atencao critica';
  }

  if (tone === 'warning') {
    return 'Com pendencias';
  }

  return 'Operacional';
}

function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatDateLabel(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

function formatServiceStatus(status: RegistroServico['status']): string {
  if (status === 'danger') {
    return 'Critico';
  }

  if (status === 'warn') {
    return 'AtenÃ§Ã£o';
  }

  return 'Operacional';
}

function mapServiceStatusTone(status: RegistroServico['status']): EquipmentTone {
  if (status === 'danger') {
    return 'danger';
  }

  if (status === 'warn') {
    return 'warning';
  }

  return 'success';
}
