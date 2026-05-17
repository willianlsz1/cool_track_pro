import type {
  Cliente,
  CompromissoServico,
  EquipmentCriticality,
  EquipmentStatus,
  Equipamento,
  OperationalPriority,
  RegistroServico,
  ServiceCommitmentKind,
  ServiceRecordKind,
  SetorEquipamento,
} from '../domain/types';

export type EquipmentFilter = 'all' | 'attention' | 'critical' | 'without_first_service';
export type EquipmentTone = 'danger' | 'warning' | 'success' | 'primary';

export interface BuildEquipmentViewModelInput {
  today: string;
  clientes: Cliente[];
  setores?: SetorEquipamento[];
  equipamentos: Equipamento[];
  compromissos: CompromissoServico[];
  registros: RegistroServico[];
}

export interface BuildEquipmentListOptions {
  query?: string;
  filter?: EquipmentFilter;
  sectorId?: string;
}

export interface EquipmentListViewModel {
  title: 'Equipamentos';
  subtitle: 'Parque técnico';
  totalLabel: string;
  activeFilter: EquipmentFilter;
  query: string;
  sectors: EquipmentSectorViewModel[];
  items: EquipmentListItemViewModel[];
}

export interface EquipmentSectorViewModel {
  id: string;
  name: string;
  clientId?: string;
  clientName: string;
  equipmentCount: number;
  equipmentCountLabel: string;
  attentionCount: number;
  attentionLabel: string;
  nextCommitmentLabel: string;
  equipmentIds: string[];
}

export interface EquipmentListItemViewModel {
  id: string;
  name: string;
  customerLine: string;
  sectorId?: string;
  sectorLabel: string;
  metaLine: string;
  isCritical: boolean;
  statusLabel: string;
  statusTone: EquipmentTone;
  nextActionLabel: string;
  nextActionTone: EquipmentTone;
  attachmentLabel?: string;
  coverAttachmentLabel?: string;
}

export interface EquipmentAttachmentViewModel {
  id: string;
  kindLabel: string;
  label: string;
  sourceLabel: string;
  coverLabel?: 'Capa local';
}

export interface EquipmentDetailViewModel {
  id: string;
  name: string;
  customerId?: string;
  archivedLabel?: string;
  typeLine: string;
  statusLabel: string;
  statusTone: EquipmentTone;
  customerName: string;
  sectorLabel: string;
  customerContact?: string;
  customerAddress?: string;
  location: string;
  criticalityLabel?: string;
  priorityLabel?: string;
  technicalDetails: Array<{ label: string; value: string }>;
  primaryActionLabel: string;
  secondaryActionLabel: 'Agendar preventiva';
  customerActionLabel: 'Ver cliente';
  lastServiceLabel: string;
  nextPreventiveLabel: string;
  note: string;
  attachmentSummaryLabel: string;
  attachments: EquipmentAttachmentViewModel[];
}

export function buildEquipmentListViewModel(
  input: BuildEquipmentViewModelInput,
  options: BuildEquipmentListOptions = {},
): EquipmentListViewModel {
  const query = options.query?.trim() ?? '';
  const activeFilter = options.filter ?? 'all';
  const clientesById = new Map(input.clientes.map((cliente) => [cliente.id, cliente]));
  const setoresById = new Map((input.setores ?? []).map((setor) => [setor.id, setor]));
  const registrosByEquipment = groupByEquipment(input.registros);
  const commitmentsByEquipment = groupByEquipment(input.compromissos);
  const activeEquipments = input.equipamentos.filter((equipamento) => !equipamento.archivedAt);
  const sectors = buildSectorViewModels({
    setores: input.setores ?? [],
    clientesById,
    equipamentos: activeEquipments,
    commitmentsByEquipment,
    today: input.today,
  });

  const items = activeEquipments
    .map((equipamento) =>
      mapEquipmentItem({
        equipamento,
        cliente: equipamento.clienteId ? clientesById.get(equipamento.clienteId) : undefined,
        setor: equipamento.setorId ? setoresById.get(equipamento.setorId) : undefined,
        registros: registrosByEquipment.get(equipamento.id) ?? [],
        compromissos: commitmentsByEquipment.get(equipamento.id) ?? [],
        today: input.today,
      }),
    )
    .filter((item) => matchesQuery(item, query))
    .filter((item) => matchesSector(item, options.sectorId))
    .filter((item) => matchesFilter(item, activeFilter));

  return {
    title: 'Equipamentos',
    subtitle: 'Parque técnico',
    totalLabel: `${items.length} ${items.length === 1 ? 'equipamento' : 'equipamentos'}`,
    activeFilter,
    query,
    sectors,
    items,
  };
}

export function buildEquipmentDetailViewModel(
  input: BuildEquipmentViewModelInput,
  equipmentId: string,
): EquipmentDetailViewModel {
  const clientesById = new Map(input.clientes.map((cliente) => [cliente.id, cliente]));
  const setoresById = new Map((input.setores ?? []).map((setor) => [setor.id, setor]));
  const equipamento = input.equipamentos.find((item) => item.id === equipmentId);

  if (!equipamento) {
    throw new Error(`Equipamento não encontrado: ${equipmentId}`);
  }

  const cliente = equipamento.clienteId ? clientesById.get(equipamento.clienteId) : undefined;
  const setor = equipamento.setorId ? setoresById.get(equipamento.setorId) : undefined;
  const registros = input.registros
    .filter((registro) => registro.equipamentoId === equipamento.id)
    .sort((a, b) => b.data.localeCompare(a.data));
  const compromissos = input.compromissos
    .filter((compromisso) => compromisso.equipamentoId === equipamento.id)
    .sort((a, b) => a.dataAlvo.localeCompare(b.dataAlvo));
  const nextAction = getNextAction({ equipamento, compromissos, registros, today: input.today });
  const lastRecord = registros[0];
  const isArchived = Boolean(equipamento.archivedAt);
  const attachments = (equipamento.anexos ?? []).slice(0, 3).map((anexo) => ({
    id: anexo.id,
    kindLabel: formatAttachmentKind(anexo.kind),
    label: anexo.label,
    sourceLabel: formatAttachmentSource(anexo.source),
    coverLabel: anexo.cover ? ('Capa local' as const) : undefined,
  }));

  return {
    id: equipamento.id,
    name: equipamento.nome,
    customerId: cliente?.id,
    archivedLabel: equipamento.archivedAt
      ? `Arquivado em ${formatDateLabel(equipamento.archivedAt)}`
      : undefined,
    typeLine: formatTypeLine(equipamento),
    statusLabel: isArchived ? 'Arquivado' : formatStatusLabel(equipamento.status),
    statusTone: isArchived ? 'primary' : mapStatusTone(equipamento.status),
    customerName: cliente?.nome ?? 'Sem cliente vinculado',
    sectorLabel: formatSectorLabel(setor),
    customerContact: cliente?.contato,
    customerAddress: cliente?.endereco,
    location: equipamento.local,
    criticalityLabel: formatCriticality(equipamento.criticidade),
    priorityLabel: formatPriority(equipamento.prioridadeOperacional),
    technicalDetails: buildTechnicalDetails(equipamento),
    primaryActionLabel: isArchived
      ? 'Equipamento arquivado'
      : registros.length === 0
        ? 'Registrar primeiro serviço'
        : 'Iniciar serviço',
    secondaryActionLabel: 'Agendar preventiva',
    customerActionLabel: 'Ver cliente',
    lastServiceLabel: lastRecord ? formatLastService(lastRecord) : 'Sem histórico técnico',
    nextPreventiveLabel: formatNextPreventive(compromissos, input.today),
    note: lastRecord?.observacoes ?? nextAction.detail,
    attachmentSummaryLabel: formatAttachmentSummary(attachments.length),
    attachments,
  };
}

function mapEquipmentItem({
  equipamento,
  cliente,
  setor,
  registros,
  compromissos,
  today,
}: {
  equipamento: Equipamento;
  cliente: Cliente | undefined;
  setor: SetorEquipamento | undefined;
  registros: RegistroServico[];
  compromissos: CompromissoServico[];
  today: string;
}): EquipmentListItemViewModel {
  const nextAction = getNextAction({ equipamento, compromissos, registros, today });

  return {
    id: equipamento.id,
    name: equipamento.nome,
    customerLine: formatCustomerLine(equipamento, cliente),
    sectorId: equipamento.setorId,
    sectorLabel: formatSectorLabel(setor),
    metaLine: formatTypeLine(equipamento),
    isCritical: equipamento.criticidade === 'alta' || equipamento.criticidade === 'critica',
    statusLabel: formatStatusLabel(equipamento.status),
    statusTone: mapStatusTone(equipamento.status),
    nextActionLabel: nextAction.label,
    nextActionTone: nextAction.tone,
    attachmentLabel: formatAttachmentCount(equipamento.anexos?.length ?? 0),
    coverAttachmentLabel: equipamento.anexos?.find((anexo) => anexo.cover)?.label,
  };
}

function getNextAction({
  equipamento,
  compromissos,
  registros,
  today,
}: {
  equipamento: Equipamento;
  compromissos: CompromissoServico[];
  registros: RegistroServico[];
  today: string;
}): { label: string; tone: EquipmentTone; detail: string } {
  if (equipamento.archivedAt) {
    return {
      label: 'Arquivado',
      tone: 'primary',
      detail: `Equipamento arquivado em ${formatDateLabel(equipamento.archivedAt)}`,
    };
  }

  const pending = compromissos
    .filter((compromisso) => compromisso.status === 'agendado')
    .sort((a, b) => a.dataAlvo.localeCompare(b.dataAlvo));
  const overdue = pending.find((compromisso) => compromisso.dataAlvo < today);

  if (overdue) {
    return {
      label: `${formatCommitmentKind(overdue.tipo)} vencida`,
      tone: 'danger',
      detail: `${formatCommitmentKind(overdue.tipo)} vencida desde ${formatDateLabel(
        overdue.dataAlvo,
      )}`,
    };
  }

  const todayCommitment = pending.find((compromisso) => compromisso.dataAlvo === today);

  if (todayCommitment) {
    return {
      label: `${formatCommitmentKind(todayCommitment.tipo)} hoje`,
      tone: 'warning',
      detail: `${formatCommitmentKind(todayCommitment.tipo)} marcada para hoje`,
    };
  }

  if (registros.length === 0) {
    return {
      label: 'Registrar primeiro serviço',
      tone: 'primary',
      detail: 'Cadastro ainda sem histórico técnico',
    };
  }

  if (equipamento.status === 'danger') {
    return {
      label: 'Verificar falha crítica',
      tone: 'danger',
      detail: 'Equipamento marcado como crítico',
    };
  }

  return {
    label: 'Em dia',
    tone: 'success',
    detail: 'Nenhuma ação pendente no protótipo',
  };
}

function matchesQuery(item: EquipmentListItemViewModel, query: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = normalizeSearchText(
    [
      item.name,
      item.customerLine,
      item.sectorLabel,
      item.metaLine,
      item.statusLabel,
      item.nextActionLabel,
      item.attachmentLabel,
      item.coverAttachmentLabel,
    ].join(' '),
  );
  return haystack.includes(normalizeSearchText(query));
}

function matchesSector(item: EquipmentListItemViewModel, sectorId: string | undefined): boolean {
  if (!sectorId || sectorId === 'all') {
    return true;
  }

  if (sectorId === '__sem_setor__') {
    return !item.sectorId;
  }

  return item.sectorId === sectorId;
}

function matchesFilter(item: EquipmentListItemViewModel, filter: EquipmentFilter): boolean {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'attention') {
    return (
      item.statusTone === 'danger' ||
      item.statusTone === 'warning' ||
      item.nextActionTone === 'danger'
    );
  }

  if (filter === 'critical') {
    return item.statusTone === 'danger' || item.isCritical;
  }

  return item.nextActionLabel === 'Registrar primeiro serviço';
}

function buildSectorViewModels({
  setores,
  clientesById,
  equipamentos,
  commitmentsByEquipment,
  today,
}: {
  setores: SetorEquipamento[];
  clientesById: Map<string, Cliente>;
  equipamentos: Equipamento[];
  commitmentsByEquipment: Map<string, CompromissoServico[]>;
  today: string;
}): EquipmentSectorViewModel[] {
  return setores.map((setor) => {
    const sectorEquipments = equipamentos.filter((equipamento) => equipamento.setorId === setor.id);
    const attentionCount = sectorEquipments.filter((equipamento) =>
      ['warn', 'danger'].includes(equipamento.status),
    ).length;

    return {
      id: setor.id,
      name: setor.nome,
      clientId: setor.clienteId,
      clientName: setor.clienteId
        ? (clientesById.get(setor.clienteId)?.nome ?? 'Cliente não encontrado')
        : 'Sem cliente fixo',
      equipmentCount: sectorEquipments.length,
      equipmentCountLabel: `${sectorEquipments.length} ${
        sectorEquipments.length === 1 ? 'equipamento' : 'equipamentos'
      }`,
      attentionCount,
      attentionLabel: attentionCount > 0 ? `${attentionCount} em atenção` : 'Sem atenção',
      nextCommitmentLabel: formatSectorNextCommitment(
        sectorEquipments,
        commitmentsByEquipment,
        today,
      ),
      equipmentIds: sectorEquipments.map((equipamento) => equipamento.id),
    };
  });
}

function formatSectorNextCommitment(
  equipamentos: Equipamento[],
  commitmentsByEquipment: Map<string, CompromissoServico[]>,
  today: string,
): string {
  const commitments = equipamentos
    .flatMap((equipamento) => commitmentsByEquipment.get(equipamento.id) ?? [])
    .filter((compromisso) => compromisso.status === 'agendado')
    .sort((a, b) => a.dataAlvo.localeCompare(b.dataAlvo));
  const nextCommitment =
    commitments.find((compromisso) => compromisso.dataAlvo < today) ?? commitments[0];

  if (!nextCommitment) {
    return 'Sem compromisso agendado';
  }

  const kind = formatCommitmentKind(nextCommitment.tipo);

  if (nextCommitment.dataAlvo < today) {
    return `${kind} vencida desde ${formatDateLabel(nextCommitment.dataAlvo)}`;
  }

  if (nextCommitment.dataAlvo === today) {
    return `${kind} para hoje`;
  }

  return `${kind} em ${formatDateLabel(nextCommitment.dataAlvo)}`;
}

function groupByEquipment<T extends { equipamentoId: string }>(items: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  items.forEach((item) => {
    const group = grouped.get(item.equipamentoId) ?? [];
    group.push(item);
    grouped.set(item.equipamentoId, group);
  });

  return grouped;
}

function formatCustomerLine(equipamento: Equipamento, cliente: Cliente | undefined): string {
  const customerName = cliente?.nome ?? 'Sem cliente vinculado';
  return `${customerName} - ${equipamento.local}`;
}

function formatSectorLabel(setor: SetorEquipamento | undefined): string {
  return setor ? `Setor: ${setor.nome}` : 'Sem setor';
}

function formatTypeLine(equipamento: Equipamento): string {
  const parts = [equipamento.tipo, equipamento.tag].filter(Boolean);
  return parts.length > 0 ? parts.join(' - ') : 'Sem tipo definido';
}

function buildTechnicalDetails(equipamento: Equipamento): Array<{ label: string; value: string }> {
  return [
    { label: 'Componente', value: equipamento.componente },
    { label: 'Fluido', value: equipamento.fluidoRefrigerante },
    { label: 'Marca/modelo', value: equipamento.marcaModelo },
    { label: 'Número de série', value: equipamento.numeroSerie },
    { label: 'Capacidade', value: equipamento.capacidadeBtuh },
    {
      label: 'Preventiva',
      value: equipamento.periodicidadePreventivaDias
        ? `${equipamento.periodicidadePreventivaDias} dias`
        : undefined,
    },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));
}

function formatAttachmentCount(count: number): string | undefined {
  if (count <= 0) {
    return undefined;
  }

  return `${count} ${count === 1 ? 'anexo' : 'anexos'}`;
}

function formatAttachmentSummary(count: number): string {
  return `${count}/3 anexos locais`;
}

function formatAttachmentKind(kind: 'foto' | 'documento'): string {
  return kind === 'foto' ? 'Foto' : 'Documento';
}

function formatAttachmentSource(source: 'mock' | 'placeholder'): string {
  return source === 'mock' ? 'Mock local' : 'Placeholder local';
}

function formatStatusLabel(status: EquipmentStatus): string {
  if (status === 'danger') {
    return 'Crítico';
  }

  if (status === 'warn') {
    return 'Atenção';
  }

  return 'Operacional';
}

function mapStatusTone(status: EquipmentStatus): EquipmentTone {
  if (status === 'danger') {
    return 'danger';
  }

  if (status === 'warn') {
    return 'warning';
  }

  return 'success';
}

function formatCriticality(criticality: EquipmentCriticality | undefined): string | undefined {
  const labels: Record<EquipmentCriticality, string> = {
    baixa: 'Criticidade baixa',
    media: 'Criticidade média',
    alta: 'Criticidade alta',
    critica: 'Criticidade crítica',
  };

  return criticality ? labels[criticality] : undefined;
}

function formatPriority(priority: OperationalPriority | undefined): string | undefined {
  const labels: Record<OperationalPriority, string> = {
    baixa: 'Prioridade baixa',
    normal: 'Prioridade normal',
    alta: 'Prioridade alta',
  };

  return priority ? labels[priority] : undefined;
}

function formatCommitmentKind(kind: ServiceCommitmentKind): string {
  return kind === 'corretiva' ? 'Corretiva' : 'Preventiva';
}

function formatRecordKind(kind: ServiceRecordKind): string {
  const labels: Record<ServiceRecordKind, string> = {
    preventiva: 'Preventiva',
    corretiva: 'Corretiva',
    instalacao: 'Instalação',
    visita: 'Visita',
    outro: 'Serviço',
  };

  return labels[kind];
}

function formatLastService(registro: RegistroServico): string {
  return `${formatRecordKind(registro.tipo)} em ${formatDateLabel(registro.data)}`;
}

function formatNextPreventive(compromissos: CompromissoServico[], today: string): string {
  const preventiva = compromissos.find(
    (compromisso) => compromisso.tipo === 'preventiva' && compromisso.status === 'agendado',
  );

  if (!preventiva) {
    return 'Sem preventiva agendada';
  }

  if (preventiva.dataAlvo < today) {
    return `Preventiva vencida desde ${formatDateLabel(preventiva.dataAlvo)}`;
  }

  if (preventiva.dataAlvo === today) {
    return 'Preventiva marcada para hoje';
  }

  return `Próxima preventiva em ${formatDateLabel(preventiva.dataAlvo)}`;
}

function formatDateLabel(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR');
}
