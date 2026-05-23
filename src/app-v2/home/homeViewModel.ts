import { pickNextHomeAction } from '../domain/homePriority';
import { buildHomeAlerts, type HomeAlert } from '../domain/homeAlerts';
import type {
  Cliente,
  CompromissoServico,
  Equipamento,
  Orcamento,
  RegistroServico,
} from '../domain/types';

type HomeActionTone = 'danger' | 'warning' | 'primary' | 'calm';
type QueueTone = 'danger' | 'warning' | 'primary';
type HomeStatIcon = 'calendar' | 'alert' | 'next';

export interface HomeTodayViewModel {
  title: 'Hoje';
  context: string;
  dateLabel: string;
  shiftSummary: string;
  quickStats: Array<{
    id: string;
    label: string;
    value: string;
    detail: string;
    tone: QueueTone;
    icon: HomeStatIcon;
  }>;
  nextAction: {
    title: string;
    equipmentId?: string;
    equipmentName?: string;
    customerLine?: string;
    reason: string;
    primaryCta: string;
    secondaryAction: string;
    tone: HomeActionTone;
    equipmentVisual: {
      imageUrl?: string;
      fallbackLabel: string;
    };
  };
  queue: Array<{
    id: string;
    equipmentId: string;
    title: string;
    detail: string;
    status: string;
    tone: QueueTone;
    iconLabel: string;
  }>;
  alerts: Array<{
    id: string;
    equipmentId: string;
    equipmentName: string;
    title: string;
    detail: string;
    tone: QueueTone;
  }>;
  alertTriage: {
    total: number;
    criticalTotal: number;
    label: 'Ver alertas';
    detail: string;
    tone: 'danger' | 'warning' | 'calm';
    hasActiveAlerts: boolean;
  };
  openQuoteReminder?: {
    quoteId: string;
    label: 'Revisar orçamento';
    title: 'Orçamento em aberto';
    detail: string;
    equipmentName?: string;
  };
  aside: {
    summary: Array<{
      id: string;
      value: string;
      label: string;
      tone: QueueTone | 'success';
    }>;
    nextInQueue?: {
      title: string;
      detail: string;
      status: string;
      tone: QueueTone;
    };
    note: string;
  };
}

export interface BuildHomeTodayViewModelInput {
  today: string;
  clientes: Cliente[];
  equipamentos: Equipamento[];
  compromissos: CompromissoServico[];
  registros: RegistroServico[];
  orcamentos?: Orcamento[];
}

export function buildHomeTodayViewModel(input: BuildHomeTodayViewModelInput): HomeTodayViewModel {
  const activeEquipmentIds = new Set(
    input.equipamentos.filter((equipamento) => !equipamento.archivedAt).map((item) => item.id),
  );
  const activeCommitments = input.compromissos.filter(
    (item) => item.status === 'agendado' && activeEquipmentIds.has(item.equipamentoId),
  );
  const operationalInput = {
    ...input,
    compromissos: activeCommitments,
  };
  const alerts = buildHomeAlerts(operationalInput);
  const nextAction = pickNextHomeAction(operationalInput);
  const clientesById = new Map(input.clientes.map((cliente) => [cliente.id, cliente]));
  const equipamentosById = new Map(
    input.equipamentos.map((equipamento) => [equipamento.id, equipamento]),
  );
  const alertNextAction = mapAlertNextAction({
    alert: alerts[0],
    clientesById,
    equipamentosById,
  });
  const queue = buildQueue({
    today: input.today,
    clientesById,
    equipamentosById,
    compromissos: activeCommitments,
  });
  const scheduledCommitments = activeCommitments;
  const dangerAlertCount = alerts.filter((alert) => alert.severity === 'danger').length;
  const completedToday = input.registros.filter((registro) => registro.data === input.today).length;

  return {
    title: 'Hoje',
    context: 'Atendimentos de hoje',
    dateLabel: formatDateLabel(input.today),
    shiftSummary: 'Prioridade, fila curta e equipamentos que pedem atenção.',
    quickStats: [
      {
        id: 'services-today',
        label: 'Atendimentos',
        value: String(scheduledCommitments.length),
        detail: 'para hoje',
        tone: 'primary',
        icon: 'calendar',
      },
      {
        id: 'overdue',
        label: 'Alertas',
        value: String(alerts.length),
        detail: alerts.length === 1 ? 'alerta ativo' : 'alertas ativos',
        tone: dangerAlertCount > 0 ? 'danger' : alerts.length > 0 ? 'warning' : 'primary',
        icon: 'alert',
      },
      {
        id: 'next-window',
        label: 'Próximo',
        value: queue[1]?.status ?? queue[0]?.status ?? 'Livre',
        detail: 'próximo na fila',
        tone: 'primary',
        icon: 'next',
      },
    ],
    nextAction:
      alertNextAction ??
      mapNextAction({
        action: nextAction,
        today: input.today,
        clientesById,
        equipamentosById,
        compromissos: input.compromissos,
      }),
    queue,
    alerts: alerts.slice(0, 3).map((alert) => {
      const equipamento = equipamentosById.get(alert.equipamentoId);

      return {
        id: alert.id,
        equipmentId: alert.equipamentoId,
        equipmentName: equipamento?.nome ?? 'Equipamento',
        title: alert.title,
        detail: alert.detail,
        tone: alert.severity === 'danger' ? 'danger' : 'warning',
      };
    }),
    alertTriage: buildAlertTriage(alerts.length, dangerAlertCount),
    openQuoteReminder: buildOpenQuoteReminder(input.orcamentos ?? [], equipamentosById),
    aside: {
      summary: [
        {
          id: 'scheduled',
          value: String(scheduledCommitments.length),
          label: 'Serviços programados',
          tone: 'primary',
        },
        {
          id: 'overdue',
          value: String(alerts.length),
          label: alerts.length === 1 ? 'Alerta ativo' : 'Alertas ativos',
          tone: dangerAlertCount > 0 ? 'danger' : alerts.length > 0 ? 'warning' : 'primary',
        },
        {
          id: 'done',
          value: String(completedToday),
          label: 'Concluído',
          tone: 'success',
        },
      ],
      nextInQueue: queue[1]
        ? {
            title: queue[1].title,
            detail: queue[1].detail,
            status: queue[1].status,
            tone: queue[1].tone,
          }
        : undefined,
      note: 'Verifique o histórico do equipamento antes de iniciar o atendimento.',
    },
  };
}

function buildAlertTriage(total: number, criticalTotal: number): HomeTodayViewModel['alertTriage'] {
  if (total === 0) {
    return {
      total: 0,
      criticalTotal: 0,
      label: 'Ver alertas',
      detail: 'Tudo em dia',
      tone: 'calm',
      hasActiveAlerts: false,
    };
  }

  const criticalLabel =
    criticalTotal > 0 ? `${criticalTotal} ${criticalTotal === 1 ? 'crítico' : 'críticos'} · ` : '';
  const alertLabel = `${total} ${total === 1 ? 'alerta ativo' : 'alertas ativos'}`;

  return {
    total,
    criticalTotal,
    label: 'Ver alertas',
    detail: `${criticalLabel}${alertLabel}`,
    tone: criticalTotal > 0 ? 'danger' : 'warning',
    hasActiveAlerts: true,
  };
}

function buildOpenQuoteReminder(
  orcamentos: Orcamento[],
  equipamentosById: Map<string, Equipamento>,
): HomeTodayViewModel['openQuoteReminder'] {
  const openQuote = orcamentos.find((quote) => ['rascunho', 'enviado'].includes(quote.status));

  if (!openQuote) {
    return undefined;
  }

  const equipamento = openQuote.equipamentoId
    ? equipamentosById.get(openQuote.equipamentoId)
    : undefined;

  return {
    quoteId: openQuote.id,
    label: 'Revisar orçamento',
    title: 'Orçamento em aberto',
    detail: `${openQuote.numero} - ${openQuote.titulo}`,
    equipmentName: equipamento?.nome,
  };
}

function mapAlertNextAction({
  alert,
  clientesById,
  equipamentosById,
}: {
  alert: HomeAlert | undefined;
  clientesById: Map<string, Cliente>;
  equipamentosById: Map<string, Equipamento>;
}): HomeTodayViewModel['nextAction'] | undefined {
  if (!alert || alert.kind !== 'critical_status') {
    return undefined;
  }

  const equipamento = equipamentosById.get(alert.equipamentoId);

  return {
    title: alert.title,
    equipmentId: alert.equipamentoId,
    equipmentName: equipamento?.nome,
    customerLine: formatCustomerLine(equipamento, clientesById),
    reason: alert.detail,
    primaryCta: 'Registrar serviço',
    secondaryAction: 'Ver equipamento',
    tone: 'danger',
    equipmentVisual: buildEquipmentVisual(equipamento),
  };
}

function mapNextAction({
  action,
  today,
  clientesById,
  equipamentosById,
  compromissos,
}: {
  action: ReturnType<typeof pickNextHomeAction>;
  today: string;
  clientesById: Map<string, Cliente>;
  equipamentosById: Map<string, Equipamento>;
  compromissos: CompromissoServico[];
}): HomeTodayViewModel['nextAction'] {
  if (action.kind === 'sem_acao') {
    return {
      title: 'Sem urgências agora',
      reason: 'Nenhuma preventiva ou corretiva vencida para hoje',
      primaryCta: action.cta,
      secondaryAction: 'Ver fila',
      tone: 'calm',
      equipmentVisual: {
        fallbackLabel: 'Sem prioridade',
      },
    };
  }

  const equipamento = equipamentosById.get(action.equipamentoId);

  if (action.kind === 'equipamento_sem_primeiro_servico') {
    return {
      title: 'Equipamento sem primeiro serviço',
      equipmentId: action.equipamentoId,
      equipmentName: equipamento?.nome,
      customerLine: formatCustomerLine(equipamento, clientesById),
      reason: 'Cadastro ainda sem histórico técnico',
      primaryCta: action.cta,
      secondaryAction: 'Ver equipamento',
      tone: 'primary',
      equipmentVisual: buildEquipmentVisual(equipamento),
    };
  }

  const compromisso = compromissos.find((item) => item.id === action.compromissoId);
  const kindLabel = compromisso?.tipo === 'corretiva' ? 'Corretiva' : 'Preventiva';
  const overdueDays = compromisso ? daysBetween(compromisso.dataAlvo, today) : 0;

  return {
    title: action.kind === 'compromisso_vencido' ? `${kindLabel} vencida` : `${kindLabel} hoje`,
    equipmentId: action.equipamentoId,
    equipmentName: equipamento?.nome,
    customerLine: formatCustomerLine(equipamento, clientesById),
    reason:
      action.kind === 'compromisso_vencido'
        ? `${kindLabel} vencida há ${overdueDays} ${overdueDays === 1 ? 'dia' : 'dias'}`
        : `${kindLabel} marcada para hoje`,
    primaryCta: action.cta,
    secondaryAction: 'Ver equipamento',
    tone: action.kind === 'compromisso_vencido' ? 'danger' : 'warning',
    equipmentVisual: buildEquipmentVisual(equipamento),
  };
}

function buildEquipmentVisual(
  equipamento: Equipamento | undefined,
): HomeTodayViewModel['nextAction']['equipmentVisual'] {
  return {
    fallbackLabel: equipamento?.tipo ?? 'Equipamento',
  };
}

function buildQueue({
  today,
  clientesById,
  equipamentosById,
  compromissos,
}: {
  today: string;
  clientesById: Map<string, Cliente>;
  equipamentosById: Map<string, Equipamento>;
  compromissos: CompromissoServico[];
}): HomeTodayViewModel['queue'] {
  return compromissos
    .filter((compromisso) => compromisso.status === 'agendado')
    .sort((a, b) => a.dataAlvo.localeCompare(b.dataAlvo))
    .slice(0, 3)
    .map((compromisso) => {
      const equipamento = equipamentosById.get(compromisso.equipamentoId);
      const kindLabel = compromisso.tipo === 'corretiva' ? 'Corretiva' : 'Preventiva';
      const isOverdue = compromisso.dataAlvo < today;
      const isToday = compromisso.dataAlvo === today;

      return {
        id: compromisso.id,
        equipmentId: compromisso.equipamentoId,
        title: `${kindLabel} · ${equipamento?.nome ?? 'Equipamento'}`,
        detail: formatCustomerLine(equipamento, clientesById) ?? 'Sem cliente vinculado',
        status: isOverdue ? 'Vencida' : isToday ? 'Hoje' : formatDateLabel(compromisso.dataAlvo),
        tone: isOverdue ? 'danger' : isToday ? 'warning' : 'primary',
        iconLabel: kindLabel,
      };
    });
}

function formatCustomerLine(
  equipamento: Equipamento | undefined,
  clientesById: Map<string, Cliente>,
): string | undefined {
  if (!equipamento) {
    return undefined;
  }

  const cliente = equipamento.clienteId ? clientesById.get(equipamento.clienteId) : undefined;
  const parts = [cliente?.nome, equipamento.local].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

function daysBetween(start: string, end: string): number {
  const startDate = Date.parse(`${start}T00:00:00`);
  const endDate = Date.parse(`${end}T00:00:00`);
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((endDate - startDate) / oneDay));
}

function formatDateLabel(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}
