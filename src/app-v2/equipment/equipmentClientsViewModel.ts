import {
  buildEquipmentListViewModel,
  type BuildEquipmentViewModelInput,
  type EquipmentListItemViewModel,
  type EquipmentTone,
} from './equipmentViewModel';
import type { RegistroServico } from '../domain/types';
import { formatServiceRecordKind } from '../service/serviceFlowViewModel';

export type ClientFilter = 'all' | 'with_pending' | 'critical' | 'without_first_service';

export interface BuildEquipmentClientsListOptions {
  query?: string;
  filter?: ClientFilter;
}

export interface EquipmentClientsListViewModel {
  title: 'Clientes';
  subtitle: 'Base instalada por cliente';
  totalLabel: string;
  query: string;
  activeFilter: ClientFilter;
  items: EquipmentClientListItemViewModel[];
}

export interface EquipmentClientListItemViewModel {
  id: string;
  name: string;
  detailLine: string;
  contactLine: string;
  equipmentCountLabel: string;
  pendingCountLabel: string;
  lastServiceLabel: string;
  statusLabel: string;
  statusTone: EquipmentTone;
}

export interface EquipmentClientDetailViewModel {
  id: string;
  name: string;
  contactLine: string;
  addressLine: string;
  documentLine: string;
  legalNameLine: string;
  environmentLine: string;
  ticketChannelLine: string;
  registrationDetails: Array<{ label: string; value: string }>;
  internalNotesLine: string;
  equipmentCountLabel: string;
  statusLabel: string;
  statusTone: EquipmentTone;
  equipments: EquipmentListItemViewModel[];
  servicesCountLabel: string;
  services: EquipmentClientServiceViewModel[];
  localReport: EquipmentClientLocalReportViewModel;
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

export interface EquipmentClientLocalReportViewModel {
  title: 'Resumo local do cliente';
  facts: Array<{ label: string; value: string }>;
}

export function buildEquipmentClientsListViewModel(
  input: BuildEquipmentViewModelInput,
  options: BuildEquipmentClientsListOptions = {},
): EquipmentClientsListViewModel {
  const query = options.query?.trim() ?? '';
  const activeFilter = options.filter ?? 'all';
  const equipmentItems = buildEquipmentListViewModel(input).items;

  const allItems = input.clientes.map((cliente) => {
    const equipments = equipmentItems.filter((equipment) =>
      input.equipamentos.some(
        (rawEquipment) => rawEquipment.id === equipment.id && rawEquipment.clienteId === cliente.id,
      ),
    );
    const rawEquipments = input.equipamentos.filter(
      (equipment) => equipment.clienteId === cliente.id,
    );
    const services = getClientServices(input, equipments);
    const statusTone = getClientStatusTone(equipments);
    const pendingCount = countOperationalPending(equipments);

    return {
      id: cliente.id,
      name: cliente.nome,
      detailLine: cliente.razaoSocial ?? cliente.endereco ?? 'Cliente sem endereço informado',
      contactLine: cliente.contato ?? 'Sem contato informado',
      equipmentCountLabel: formatCount(equipments.length, 'equipamento', 'equipamentos'),
      pendingCountLabel: formatCount(pendingCount, 'pendência', 'pendências'),
      lastServiceLabel: formatLastServiceLabel(services[0]),
      statusLabel: formatClientStatus(statusTone, equipments.length),
      statusTone,
      searchText: normalizeSearch(
        [
          cliente.nome,
          cliente.razaoSocial,
          cliente.documento,
          cliente.contato,
          cliente.endereco,
          cliente.inscricaoEstadual,
          cliente.inscricaoMunicipal,
          cliente.canalChamados,
          cliente.finalidadeAmbiente,
          cliente.observacoesInternas,
          ...rawEquipments.flatMap((equipment) => [
            equipment.nome,
            equipment.local,
            equipment.tag,
            equipment.tipo,
          ]),
          ...services.map((service) => service.observacoes),
        ].join(' '),
      ),
      hasPending: pendingCount > 0,
      hasCritical: equipments.some((equipment) => equipment.statusTone === 'danger'),
      hasWithoutFirstService: equipments.some(
        (equipment) => equipment.nextActionTone === 'primary',
      ),
    };
  });
  const items = allItems
    .filter((item) => matchesClientQuery(item, query))
    .filter((item) => matchesClientFilter(item, activeFilter))
    .map(
      ({
        searchText: _searchText,
        hasPending: _hasPending,
        hasCritical: _hasCritical,
        hasWithoutFirstService: _hasWithoutFirstService,
        ...item
      }) => item,
    );

  return {
    title: 'Clientes',
    subtitle: 'Base instalada por cliente',
    totalLabel: formatCount(items.length, 'cliente', 'clientes'),
    query,
    activeFilter,
    items,
  };
}

export function buildEquipmentClientDetailViewModel(
  input: BuildEquipmentViewModelInput,
  clientId: string,
): EquipmentClientDetailViewModel {
  const cliente = input.clientes.find((item) => item.id === clientId);

  if (!cliente) {
    throw new Error(`Cliente não encontrado: ${clientId}`);
  }

  const equipmentItems = buildEquipmentListViewModel(input).items.filter((equipment) =>
    input.equipamentos.some(
      (rawEquipment) => rawEquipment.id === equipment.id && rawEquipment.clienteId === cliente.id,
    ),
  );
  const clientEquipmentIds = new Set(equipmentItems.map((equipment) => equipment.id));
  const rawServices = getClientServices(input, equipmentItems);
  const services = rawServices.map((registro) => mapClientService(input, registro));
  const statusTone = getClientStatusTone(equipmentItems);
  const pendingCount = countOperationalPending(equipmentItems);
  const lastService = rawServices[0];

  return {
    id: cliente.id,
    name: cliente.nome,
    contactLine: cliente.contato ?? 'Sem contato informado',
    addressLine: cliente.endereco ?? 'Sem endereço informado',
    documentLine: cliente.documento ?? 'Sem documento informado',
    legalNameLine: cliente.razaoSocial ?? 'Sem razao social informada',
    environmentLine: cliente.finalidadeAmbiente ?? 'Sem finalidade informada',
    ticketChannelLine: cliente.canalChamados ?? 'Sem canal de chamados informado',
    registrationDetails: buildClientRegistrationDetails(cliente),
    internalNotesLine: cliente.observacoesInternas ?? 'Sem observações internas',
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
      'serviço relacionado',
      'serviços relacionados',
    ),
    services,
    localReport: {
      title: 'Resumo local do cliente',
      facts: [
        {
          label: 'Equipamentos',
          value: formatCount(
            equipmentItems.length,
            'equipamento vinculado',
            'equipamentos vinculados',
          ),
        },
        {
          label: 'Serviços',
          value: formatCount(services.length, 'serviço relacionado', 'serviços relacionados'),
        },
        {
          label: 'Pendências',
          value: formatCount(pendingCount, 'pendência operacional', 'pendências operacionais'),
        },
        {
          label: 'Último serviço',
          value: formatLastServiceFact(input, lastService),
        },
        {
          label: 'Canal de chamados',
          value: cliente.canalChamados ?? 'Não informado',
        },
      ],
    },
  };
}

function buildClientRegistrationDetails(
  cliente: BuildEquipmentViewModelInput['clientes'][number],
): Array<{ label: string; value: string }> {
  return [
    { label: 'Inscrição estadual', value: cliente.inscricaoEstadual ?? 'Não informado' },
    { label: 'Inscrição municipal', value: cliente.inscricaoMunicipal ?? 'Não informado' },
  ];
}

function getClientServices(
  input: BuildEquipmentViewModelInput,
  equipmentItems: EquipmentListItemViewModel[],
): RegistroServico[] {
  const clientEquipmentIds = new Set(equipmentItems.map((equipment) => equipment.id));

  return input.registros
    .filter((registro) => clientEquipmentIds.has(registro.equipamentoId))
    .slice()
    .sort((a, b) => b.data.localeCompare(a.data));
}

function mapClientService(
  input: BuildEquipmentViewModelInput,
  registro: RegistroServico,
): EquipmentClientServiceViewModel {
  const equipamento = input.equipamentos.find((item) => item.id === registro.equipamentoId);

  return {
    id: registro.id,
    equipmentName: equipamento?.nome ?? 'Equipamento não encontrado',
    kindLabel: registro.tipoDescricao ?? formatServiceRecordKind(registro.tipo),
    dateLabel: formatDateLabel(registro.data),
    statusLabel: formatServiceStatus(registro.status),
    statusTone: mapServiceStatusTone(registro.status),
    summary: registro.observacoes?.trim() || 'Sem resumo técnico informado.',
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

function countOperationalPending(equipments: EquipmentListItemViewModel[]): number {
  return equipments.filter(
    (item) =>
      item.statusTone === 'danger' ||
      item.statusTone === 'warning' ||
      item.nextActionTone === 'danger' ||
      item.nextActionTone === 'warning',
  ).length;
}

function matchesClientQuery(item: { searchText: string }, query: string): boolean {
  return !query || item.searchText.includes(normalizeSearch(query));
}

function matchesClientFilter(
  item: {
    hasPending: boolean;
    hasCritical: boolean;
    hasWithoutFirstService: boolean;
  },
  filter: ClientFilter,
): boolean {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'with_pending') {
    return item.hasPending;
  }

  if (filter === 'critical') {
    return item.hasCritical;
  }

  return item.hasWithoutFirstService;
}

function formatClientStatus(tone: EquipmentTone, equipmentCount: number): string {
  if (equipmentCount === 0) {
    return 'Sem equipamentos';
  }

  if (tone === 'danger') {
    return 'Atenção crítica';
  }

  if (tone === 'warning') {
    return 'Com pendências';
  }

  return 'Operacional';
}

function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatLastServiceLabel(registro: RegistroServico | undefined): string {
  if (!registro) {
    return 'Sem serviço registrado';
  }

  return `Último serviço em ${formatDateLabel(registro.data)}`;
}

function formatLastServiceFact(
  input: BuildEquipmentViewModelInput,
  registro: RegistroServico | undefined,
): string {
  if (!registro) {
    return 'Sem serviço registrado';
  }

  const equipamento = input.equipamentos.find((item) => item.id === registro.equipamentoId);
  return `${formatDateLabel(registro.data)} - ${stripDiacritics(
    equipamento?.nome ?? 'Equipamento não encontrado',
  )}`;
}

function formatDateLabel(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

function normalizeSearch(value: string): string {
  return stripDiacritics(value).toLocaleLowerCase('pt-BR');
}

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function formatServiceStatus(status: RegistroServico['status']): string {
  if (status === 'danger') {
    return 'Crítico';
  }

  if (status === 'warn') {
    return 'Atenção';
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
