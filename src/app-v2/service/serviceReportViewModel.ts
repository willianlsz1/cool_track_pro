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

export interface ServiceReportViewModel {
  reportId: string;
  title: 'Registro de Serviço Técnico';
  subtitle: string;
  generatedAtLabel: string;
  statusLabel: string;
  statusTone: ServiceTone;
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

  return {
    reportId,
    title: 'Registro de Serviço Técnico',
    subtitle: `${kindLabel} - ${equipamento.nome}`,
    generatedAtLabel: formatDateLabel(date),
    statusLabel,
    statusTone: mapStatusTone(status),
    sections: [
      {
        title: 'Cabeçalho',
        fields: [
          { label: 'App', value: 'CoolTrack Pro app-v2' },
          { label: 'Registro', value: reportId },
          { label: 'Data', value: formatDateLabel(date) },
          { label: 'Status', value: statusLabel },
          { label: 'Técnico/responsável', value: normalizeText(technician, 'Não informado') },
        ],
      },
      {
        title: 'Cliente',
        fields: [
          { label: 'Cliente', value: cliente?.nome ?? 'Sem cliente vinculado' },
          { label: 'Documento', value: cliente?.documento ?? 'Não informado' },
          { label: 'Contato', value: cliente?.contato ?? 'Não informado' },
          { label: 'Endereço', value: cliente?.endereco ?? 'Não informado' },
          { label: 'Local de atendimento', value: equipamento.local },
        ],
      },
      {
        title: 'Equipamento',
        fields: [
          { label: 'Equipamento', value: equipamento.nome },
          { label: 'Tipo/categoria', value: equipamento.tipo ?? 'Não informado' },
          { label: 'Marca/modelo', value: 'Não informado' },
          { label: 'Identificador', value: equipamento.tag ?? 'Não informado' },
          { label: 'Local de instalação', value: equipamento.local },
        ],
      },
      {
        title: 'Serviço',
        fields: [
          { label: 'Tipo de serviço', value: kindLabel },
          { label: 'Status', value: statusLabel },
          { label: 'Inicio', value: formatDateLabel(date) },
          { label: 'Conclusão', value: formatDateLabel(date) },
          { label: 'Resultado', value: statusLabel },
        ],
      },
      {
        title: 'Execução',
        fields: [
          { label: 'Diagnóstico', value: normalizeText(diagnosis, 'Não informado') },
          { label: 'Ações executadas', value: normalizeText(actionsDone, 'Não informado') },
          { label: 'Peças usadas', value: normalizeText(partsUsed ?? '', 'Não informado') },
          { label: 'Custo de peças', value: normalizeText(partsCost ?? '', 'Não informado') },
          { label: 'Custo de mão de obra', value: normalizeText(laborCost ?? '', 'Não informado') },
          {
            label: 'Próxima manutenção',
            value: formatOptionalDateLabel(nextMaintenanceDate),
          },
          {
            label: 'Observações',
            value: normalizeText(observations ?? diagnosis, 'Não informado'),
          },
          { label: 'Recomendações', value: 'Não informado' },
        ],
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
  return value.trim() || fallback;
}
