import { pickNextHomeAction } from '../domain/homePriority';
import type { Cliente, CompromissoServico, Equipamento, RegistroServico } from '../domain/types';

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
}

export function buildHomeTodayViewModel(input: BuildHomeTodayViewModelInput): HomeTodayViewModel {
  const nextAction = pickNextHomeAction(input);
  const clientesById = new Map(input.clientes.map((cliente) => [cliente.id, cliente]));
  const equipamentosById = new Map(
    input.equipamentos.map((equipamento) => [equipamento.id, equipamento]),
  );
  const queue = buildQueue({
    today: input.today,
    clientesById,
    equipamentosById,
    compromissos: input.compromissos,
  });
  const scheduledCommitments = input.compromissos.filter((item) => item.status === 'agendado');
  const overdueCount = scheduledCommitments.filter((item) => item.dataAlvo < input.today).length;
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
        label: 'Vencido',
        value: String(overdueCount),
        detail: overdueCount === 1 ? 'vencido' : 'vencidos',
        tone: overdueCount > 0 ? 'danger' : 'primary',
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
    nextAction: mapNextAction({
      action: nextAction,
      today: input.today,
      clientesById,
      equipamentosById,
      compromissos: input.compromissos,
    }),
    queue,
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
          value: String(overdueCount),
          label: overdueCount === 1 ? 'Vencido' : 'Vencidos',
          tone: overdueCount > 0 ? 'danger' : 'primary',
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
