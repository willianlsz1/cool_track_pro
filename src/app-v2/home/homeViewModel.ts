import { pickNextHomeAction } from '../domain/homePriority';
import type { Cliente, CompromissoServico, Equipamento, RegistroServico } from '../domain/types';

type HomeActionTone = 'danger' | 'warning' | 'primary' | 'calm';
type QueueTone = 'danger' | 'warning' | 'primary';

export interface HomeTodayViewModel {
  title: 'Hoje';
  context: string;
  nextAction: {
    title: string;
    equipmentId?: string;
    equipmentName?: string;
    customerLine?: string;
    reason: string;
    primaryCta: string;
    secondaryAction: string;
    tone: HomeActionTone;
  };
  queue: Array<{
    id: string;
    equipmentId: string;
    title: string;
    detail: string;
    status: string;
    tone: QueueTone;
  }>;
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

  return {
    title: 'Hoje',
    context: 'Turno de campo',
    nextAction: mapNextAction({
      action: nextAction,
      today: input.today,
      clientesById,
      equipamentosById,
      compromissos: input.compromissos,
    }),
    queue: buildQueue({
      today: input.today,
      clientesById,
      equipamentosById,
      compromissos: input.compromissos,
    }),
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
        title: `${kindLabel} - ${equipamento?.nome ?? 'Equipamento'}`,
        detail: formatCustomerLine(equipamento, clientesById) ?? 'Sem cliente vinculado',
        status: isOverdue ? 'Vencida' : isToday ? 'Hoje' : formatDateLabel(compromisso.dataAlvo),
        tone: isOverdue ? 'danger' : isToday ? 'warning' : 'primary',
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
  return parts.length > 0 ? parts.join(' - ') : undefined;
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
