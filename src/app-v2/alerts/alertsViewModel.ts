import { buildHomeAlerts } from '../domain/homeAlerts';
import type { Cliente, CompromissoServico, Equipamento, RegistroServico } from '../domain/types';

export interface BuildAlertsViewModelInput {
  today: string;
  clientes: Cliente[];
  equipamentos: Equipamento[];
  compromissos: CompromissoServico[];
  registros: RegistroServico[];
}

export interface AlertsViewModel {
  title: 'Alertas e Anormalidades';
  subtitle: 'Alertas operacionais';
  description: string;
  totalAlerts: number;
  dangerCount: number;
  warningCount: number;
  emptyState: {
    title: 'Tudo em dia!';
    description: string;
    actionLabel: 'Ver todos os equipamentos';
  };
  items: AlertsListItemViewModel[];
}

export interface AlertsListItemViewModel {
  id: string;
  equipmentId: string;
  title: string;
  equipmentName: string;
  contextLine: string;
  detail: string;
  tone: 'danger' | 'warning';
  actionLabel: 'Ver equipamento';
}

export function buildAlertsViewModel(input: BuildAlertsViewModelInput): AlertsViewModel {
  const activeEquipmentIds = new Set(
    input.equipamentos.filter((equipamento) => !equipamento.archivedAt).map((item) => item.id),
  );
  const alerts = buildHomeAlerts({
    ...input,
    compromissos: input.compromissos.filter(
      (compromisso) =>
        compromisso.status === 'agendado' && activeEquipmentIds.has(compromisso.equipamentoId),
    ),
  });
  const clientesById = new Map(input.clientes.map((cliente) => [cliente.id, cliente]));
  const equipamentosById = new Map(
    input.equipamentos.map((equipamento) => [equipamento.id, equipamento]),
  );

  return {
    title: 'Alertas e Anormalidades',
    subtitle: 'Alertas operacionais',
    description: 'Acompanhe equipamentos que exigem atenção imediata ou preventiva.',
    totalAlerts: alerts.length,
    dangerCount: alerts.filter((alert) => alert.severity === 'danger').length,
    warningCount: alerts.filter((alert) => alert.severity === 'warning').length,
    emptyState: {
      title: 'Tudo em dia!',
      description:
        'Nenhum equipamento precisa de atenção agora. Continue registrando serviços para manter o histórico atualizado.',
      actionLabel: 'Ver todos os equipamentos',
    },
    items: alerts.map((alert) => {
      const equipamento = equipamentosById.get(alert.equipamentoId);

      return {
        id: alert.id,
        equipmentId: alert.equipamentoId,
        title: alert.title,
        equipmentName: equipamento?.nome ?? 'Equipamento',
        contextLine: formatContextLine(equipamento, clientesById),
        detail: alert.detail,
        tone: alert.severity,
        actionLabel: 'Ver equipamento',
      };
    }),
  };
}

function formatContextLine(
  equipamento: Equipamento | undefined,
  clientesById: Map<string, Cliente>,
): string {
  if (!equipamento) {
    return 'Sem equipamento vinculado';
  }

  const cliente = equipamento.clienteId ? clientesById.get(equipamento.clienteId) : undefined;
  return [cliente?.nome, equipamento.local].filter(Boolean).join(' - ') || equipamento.local;
}
