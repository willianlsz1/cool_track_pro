import type { Cliente, Equipamento, RegistroServico, ServiceRecordStatus } from '../domain/types';
import {
  formatServiceRecordKind,
  type BuildServiceFlowInput,
  type ServiceDraft,
  type ServiceTone,
} from './serviceFlowViewModel';

export interface ServiceReportDataInput {
  today: string;
  clientes: Cliente[];
  equipamentos: Equipamento[];
}

export interface ServiceReportFieldViewModel {
  label: string;
  value: string;
}

export interface ServiceReportSectionViewModel {
  title: string;
  fields: ServiceReportFieldViewModel[];
}

export interface ServiceReportInfoCardViewModel {
  title: string;
  fields: ServiceReportFieldViewModel[];
}

export interface ServiceReportExecutionViewModel {
  diagnosis: string;
  actionsDone: string;
  details: ServiceReportFieldViewModel[];
  recommendation: string;
}

export interface ServiceReportFooterViewModel {
  technicianName: string;
  clientName: string;
  statusSummary: string;
  generatedAtLabel: string;
}

export interface ServiceReportViewModel {
  reportId: string;
  title: 'Registro de Serviço Técnico';
  subtitle: string;
  generatedAtLabel: string;
  statusLabel: string;
  statusTone: ServiceTone;
  infoCards: ServiceReportInfoCardViewModel[];
  execution: ServiceReportExecutionViewModel;
  footer: ServiceReportFooterViewModel;
  sections: ServiceReportSectionViewModel[];
  signatureFields: string[];
}

export function buildServiceReportViewModel(
  input: BuildServiceFlowInput,
  draft: ServiceDraft,
): ServiceReportViewModel {
  const { equipamento, cliente } = getReportEntities(input, draft.equipmentId);
  const serviceDate = draft.serviceDate ?? input.today;

  return buildReport({
    date: serviceDate,
    reportId: buildReportId(serviceDate, draft),
    kindLabel: formatServiceRecordKind(draft.kind, draft.customKind),
    status: draft.finalStatus,
    technician: draft.technician,
    diagnosis: draft.diagnosis,
    actionsDone: draft.actionsDone,
    partsUsed: draft.partsUsed,
    partsCost: draft.partsCost,
    laborCost: draft.laborCost,
    nextMaintenanceDate: draft.nextMaintenanceDate,
    equipamento,
    cliente,
  });
}

export function buildServiceReportViewModelFromRecord(
  input: ServiceReportDataInput,
  registro: RegistroServico,
): ServiceReportViewModel {
  const { equipamento, cliente } = getReportEntities(input, registro.equipamentoId);

  return buildReport({
    date: registro.data,
    reportId: `REL-${registro.id.toUpperCase()}`,
    kindLabel: registro.tipoDescricao ?? formatServiceRecordKind(registro.tipo),
    status: registro.status,
    technician: registro.tecnico,
    diagnosis: registro.diagnostico ?? registro.observacoes ?? '',
    actionsDone: registro.acoesExecutadas ?? registro.observacoes ?? '',
    observations: registro.observacoes,
    partsUsed: registro.pecas,
    partsCost: registro.custoPecas,
    laborCost: registro.custoMaoObra,
    nextMaintenanceDate: registro.proximaData,
    equipamento,
    cliente,
  });
}

function buildReport({
  date,
  reportId,
  kindLabel,
  status,
  technician,
  diagnosis,
  actionsDone,
  observations,
  partsUsed,
  partsCost,
  laborCost,
  nextMaintenanceDate,
  equipamento,
  cliente,
}: {
  date: string;
  reportId: string;
  kindLabel: string;
  status: ServiceRecordStatus;
  technician: string;
  diagnosis: string;
  actionsDone: string;
  observations?: string;
  partsUsed?: string;
  partsCost?: string;
  laborCost?: string;
  nextMaintenanceDate?: string;
  equipamento: Equipamento;
  cliente?: Cliente;
}): ServiceReportViewModel {
  const statusLabel = formatStatusLabel(status);
  const technicianName = normalizeText(technician, 'Não informado');
  const clientName = cliente?.nome ?? 'Sem cliente vinculado';
  const formattedDate = formatDateLabel(date);
  const normalizedDiagnosis = normalizeText(diagnosis, 'Não informado');
  const normalizedActions = normalizeText(actionsDone, 'Não informado');
  const normalizedPartsUsed = normalizeText(partsUsed ?? '', 'Nenhuma peça substituída');
  const normalizedPartsCost = normalizeCurrencyText(partsCost, 'R$ 0,00');
  const normalizedLaborCost = normalizeCurrencyText(laborCost, 'Não informado');
  const normalizedNextMaintenance = formatOptionalDateLabel(nextMaintenanceDate);
  const normalizedObservations = normalizeText(observations ?? diagnosis, 'Não informado');
  const recommendation = buildRecommendation(status, normalizedObservations);

  const headerFields: ServiceReportFieldViewModel[] = [
    { label: 'App', value: 'CoolTrack Pro app-v2' },
    { label: 'Registro', value: reportId },
    { label: 'Data', value: formattedDate },
    { label: 'Status', value: statusLabel },
    { label: 'Técnico/responsável', value: technicianName },
  ];

  const clientFields: ServiceReportFieldViewModel[] = [
    { label: 'Cliente', value: clientName },
    { label: 'Documento', value: cliente?.documento ?? 'Não informado' },
    { label: 'Contato', value: cliente?.contato ?? 'Não informado' },
    { label: 'Endereço', value: cliente?.endereco ?? 'Não informado' },
    { label: 'Local atendimento', value: equipamento.local },
  ];

  const equipmentFields: ServiceReportFieldViewModel[] = [
    { label: 'Equipamento', value: equipamento.nome },
    { label: 'Tipo / categoria', value: equipamento.tipo ?? 'Não informado' },
    { label: 'Marca / modelo', value: equipamento.marcaModelo ?? 'Não informado' },
    { label: 'Identificador', value: equipamento.tag ?? 'Não informado' },
    { label: 'Local instalação', value: equipamento.local },
  ];

  const serviceFields: ServiceReportFieldViewModel[] = [
    { label: 'Tipo', value: kindLabel },
    { label: 'Status', value: statusLabel },
    { label: 'Início', value: formattedDate },
    { label: 'Conclusão', value: formattedDate },
    { label: 'Técnico', value: technicianName },
  ];

  const executionFields: ServiceReportFieldViewModel[] = [
    { label: 'Diagnóstico', value: normalizedDiagnosis },
    { label: 'Ações executadas', value: normalizedActions },
    { label: 'Peças usadas', value: normalizedPartsUsed },
    { label: 'Custo de peças', value: normalizedPartsCost },
    { label: 'Custo de mão de obra', value: normalizedLaborCost },
    { label: 'Próxima manutenção', value: normalizedNextMaintenance },
    { label: 'Observações', value: normalizedObservations },
    { label: 'Recomendações', value: recommendation },
  ];

  return {
    reportId,
    title: 'Registro de Serviço Técnico',
    subtitle: `${kindLabel} - ${equipamento.nome}`,
    generatedAtLabel: formattedDate,
    statusLabel,
    statusTone: mapStatusTone(status),
    infoCards: [
      { title: 'Cliente', fields: clientFields },
      { title: 'Equipamento', fields: equipmentFields },
      { title: 'Serviço', fields: serviceFields },
    ],
    execution: {
      diagnosis: normalizedDiagnosis,
      actionsDone: normalizedActions,
      details: [
        { label: 'Peças usadas', value: normalizedPartsUsed },
        { label: 'Custo de peças', value: normalizedPartsCost },
        { label: 'Custo de mão de obra', value: normalizedLaborCost },
        { label: 'Próxima manutenção', value: normalizedNextMaintenance },
      ],
      recommendation,
    },
    footer: {
      technicianName,
      clientName,
      statusSummary: buildStatusSummary(status),
      generatedAtLabel: formattedDate,
    },
    sections: [
      {
        title: 'Cabeçalho',
        fields: headerFields,
      },
      {
        title: 'Cliente',
        fields: clientFields,
      },
      {
        title: 'Equipamento',
        fields: equipmentFields,
      },
      {
        title: 'Serviço',
        fields: [
          { label: 'Tipo de serviço', value: kindLabel },
          ...serviceFields.filter((field) => field.label !== 'Tipo'),
          { label: 'Resultado', value: statusLabel },
        ],
      },
      {
        title: 'Execução',
        fields: executionFields,
      },
    ],
    signatureFields: ['Técnico/responsável', 'Cliente/responsável'],
  };
}

function getReportEntities(input: ServiceReportDataInput, equipmentId: string) {
  const equipamento = input.equipamentos.find((item) => item.id === equipmentId);

  if (!equipamento) {
    throw new Error(`Equipamento não encontrado: ${equipmentId}`);
  }

  const cliente = equipamento.clienteId
    ? input.clientes.find((item) => item.id === equipamento.clienteId)
    : undefined;

  return { equipamento, cliente };
}

function buildReportId(today: string, draft: ServiceDraft): string {
  const datePart = today.split('-').join('');
  const sourcePart = draft.commitmentId ?? draft.equipmentId;
  return `CTP-${datePart}-${sourcePart.toUpperCase()}`;
}

function formatStatusLabel(status: ServiceRecordStatus): string {
  if (status === 'danger') {
    return 'Crítico';
  }

  if (status === 'warn') {
    return 'Atenção';
  }

  return 'Operacional';
}

function mapStatusTone(status: ServiceRecordStatus): ServiceTone {
  if (status === 'danger') {
    return 'danger';
  }

  if (status === 'warn') {
    return 'warning';
  }

  return 'success';
}

function buildStatusSummary(status: ServiceRecordStatus): string {
  if (status === 'danger') {
    return 'Crítico - Intervenção necessária';
  }

  if (status === 'warn') {
    return 'Atenção - Acompanhar';
  }

  return 'Operacional - Em funcionamento';
}

function buildRecommendation(status: ServiceRecordStatus, observations: string): string {
  if (observations !== 'Não informado') {
    return observations;
  }

  if (status === 'danger') {
    return 'Recomenda-se priorizar nova avaliação técnica e acompanhar o equipamento.';
  }

  if (status === 'warn') {
    return 'Recomenda-se acompanhar o equipamento e programar nova verificação técnica.';
  }

  return 'Equipamento liberado para operação normal. Manter rotina de acompanhamento.';
}

function formatDateLabel(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function formatOptionalDateLabel(date: string | undefined): string {
  const normalizedDate = date?.trim();

  if (!normalizedDate) {
    return 'Não informado';
  }

  return formatDateLabel(normalizedDate);
}

function normalizeText(value: string, fallback: string): string {
  return normalizeDisplayText(value).trim() || fallback;
}

function normalizeCurrencyText(value: string | undefined, fallback: string): string {
  const normalizedValue = normalizeDisplayText(value ?? '').trim();

  if (!normalizedValue) {
    return fallback;
  }

  return normalizedValue.startsWith('R$') ? normalizedValue : `R$ ${normalizedValue}`;
}

function normalizeDisplayText(value: string): string {
  return value
    .replace(/Ã§/g, 'ç')
    .replace(/Ã£/g, 'ã')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã­/g, 'í')
    .replace(/Ã¢/g, 'â')
    .replace(/Ã‡/g, 'Ç')
    .replace(/Ã‰/g, 'É')
    .replace(/Ãš/g, 'Ú')
    .replace(/Â·/g, '·');
}
