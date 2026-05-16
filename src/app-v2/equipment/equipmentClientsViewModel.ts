import {
  buildEquipmentListViewModel,
  type BuildEquipmentViewModelInput,
  type EquipmentListItemViewModel,
  type EquipmentTone,
} from './equipmentViewModel';

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
