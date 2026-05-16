import type { Cliente, Equipamento, ServiceRecordKind, ServiceRecordStatus } from '../domain/types';
import type { BuildServiceFlowInput, ServiceDraft, ServiceTone } from './serviceFlowViewModel';

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
  title: 'Registro de Servico Tecnico';
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
  const kindLabel = formatRecordKind(draft.kind);
  const statusLabel = formatStatusLabel(draft.finalStatus);
  const reportId = buildReportId(input.today, draft);

  return {
    reportId,
    title: 'Registro de Servico Tecnico',
    subtitle: `${kindLabel} - ${equipamento.nome}`,
    generatedAtLabel: formatDateLabel(input.today),
    statusLabel,
    statusTone: mapStatusTone(draft.finalStatus),
    sections: [
      {
        title: 'Cabecalho',
        fields: [
          { label: 'App', value: 'CoolTrack Pro app-v2' },
          { label: 'Registro', value: reportId },
          { label: 'Data', value: formatDateLabel(input.today) },
          { label: 'Status', value: statusLabel },
          { label: 'Tecnico/responsavel', value: 'Nao informado' },
        ],
      },
      {
        title: 'Cliente',
        fields: [
          { label: 'Cliente', value: cliente?.nome ?? 'Sem cliente vinculado' },
          { label: 'Documento', value: cliente?.documento ?? 'Nao informado' },
          { label: 'Contato', value: cliente?.contato ?? 'Nao informado' },
          { label: 'Endereco', value: cliente?.endereco ?? 'Nao informado' },
          { label: 'Local de atendimento', value: equipamento.local },
        ],
      },
      {
        title: 'Equipamento',
        fields: [
          { label: 'Equipamento', value: equipamento.nome },
          { label: 'Tipo/categoria', value: equipamento.tipo ?? 'Nao informado' },
          { label: 'Marca/modelo', value: 'Nao informado' },
          { label: 'Identificador', value: equipamento.tag ?? 'Nao informado' },
          { label: 'Local de instalacao', value: equipamento.local },
        ],
      },
      {
        title: 'Servico',
        fields: [
          { label: 'Tipo de servico', value: kindLabel },
          { label: 'Status', value: statusLabel },
          { label: 'Inicio', value: formatDateLabel(input.today) },
          { label: 'Conclusao', value: formatDateLabel(input.today) },
          { label: 'Resultado', value: statusLabel },
        ],
      },
      {
        title: 'Execucao',
        fields: [
          { label: 'Diagnostico', value: normalizeText(draft.diagnosis, 'Nao informado') },
          { label: 'Acoes executadas', value: normalizeText(draft.actionsDone, 'Nao informado') },
          { label: 'Observacoes', value: normalizeText(draft.diagnosis, 'Nao informado') },
          { label: 'Recomendacoes', value: 'Nao informado' },
        ],
      },
    ],
    signatureFields: ['Tecnico/responsavel', 'Cliente/responsavel'],
  };
}

function getReportEntities(input: BuildServiceFlowInput, equipmentId: string) {
  const equipamento = input.equipamentos.find((item) => item.id === equipmentId);

  if (!equipamento) {
    throw new Error(`Equipamento nao encontrado: ${equipmentId}`);
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

function formatRecordKind(kind: ServiceRecordKind | undefined): string {
  const labels: Record<ServiceRecordKind, string> = {
    preventiva: 'Preventiva',
    corretiva: 'Corretiva',
    instalacao: 'Instalacao',
    visita: 'Visita tecnica',
    outro: 'Servico',
  };

  return kind ? labels[kind] : 'Servico';
}

function formatStatusLabel(status: ServiceRecordStatus): string {
  if (status === 'danger') {
    return 'Critico';
  }

  if (status === 'warn') {
    return 'Atencao';
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

function normalizeText(value: string, fallback: string): string {
  return value.trim() || fallback;
}
