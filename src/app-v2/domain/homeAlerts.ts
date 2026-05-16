import type {
  CompromissoServico,
  Equipamento,
  EquipmentCriticality,
  OperationalPriority,
  RegistroServico,
} from './types';

export interface BuildHomeAlertsInput {
  today: string;
  equipamentos: Equipamento[];
  compromissos: CompromissoServico[];
  registros: RegistroServico[];
}

export type HomeAlertKind =
  | 'critical_status'
  | 'overdue_commitment'
  | 'upcoming_commitment'
  | 'critical_without_history'
  | 'corrective_recurrence';

export type HomeAlertSeverity = 'danger' | 'warning';

export interface HomeAlert {
  id: string;
  kind: HomeAlertKind;
  severity: HomeAlertSeverity;
  equipamentoId: string;
  compromissoId?: string;
  title: string;
  detail: string;
  sortScore: number;
}

const CRITICALITY_WEIGHT: Record<EquipmentCriticality, number> = {
  baixa: 0,
  media: 8,
  alta: 18,
  critica: 30,
};

const PRIORITY_WEIGHT: Record<OperationalPriority, number> = {
  baixa: 0,
  normal: 6,
  alta: 18,
};

const UPCOMING_WINDOW_DAYS = 7;

export function buildHomeAlerts(input: BuildHomeAlertsInput): HomeAlert[] {
  const recordsByEquipment = groupRecordsByEquipment(input.registros);
  const commitmentsByEquipment = groupCommitmentsByEquipment(input.compromissos);

  return input.equipamentos
    .flatMap((equipamento) =>
      buildEquipmentAlerts({
        today: input.today,
        equipamento,
        compromissos: commitmentsByEquipment.get(equipamento.id) ?? [],
        registros: recordsByEquipment.get(equipamento.id) ?? [],
      }),
    )
    .sort(compareAlerts);
}

function buildEquipmentAlerts({
  today,
  equipamento,
  compromissos,
  registros,
}: {
  today: string;
  equipamento: Equipamento;
  compromissos: CompromissoServico[];
  registros: RegistroServico[];
}): HomeAlert[] {
  const alerts: HomeAlert[] = [];
  const operationalScore = getOperationalScore(equipamento);

  if (equipamento.status === 'danger') {
    alerts.push({
      id: `${equipamento.id}:critical-status`,
      kind: 'critical_status',
      severity: 'danger',
      equipamentoId: equipamento.id,
      title: 'Equipamento fora de operacao',
      detail: 'Status atual marcado como critico',
      sortScore: 220 + operationalScore,
    });

    return alerts;
  }

  const urgentCommitment = pickUrgentCommitment(compromissos, today);
  if (urgentCommitment) {
    const daysUntil = daysBetween(today, urgentCommitment.dataAlvo);
    const isOverdue = daysUntil < 0;
    const daysOverdue = Math.abs(daysUntil);
    const kindLabel = urgentCommitment.tipo === 'corretiva' ? 'Corretiva' : 'Preventiva';

    alerts.push({
      id: `${urgentCommitment.id}:${isOverdue ? 'overdue' : 'upcoming'}`,
      kind: isOverdue ? 'overdue_commitment' : 'upcoming_commitment',
      severity: isOverdue ? 'danger' : 'warning',
      equipamentoId: equipamento.id,
      compromissoId: urgentCommitment.id,
      title: isOverdue ? `${kindLabel} vencida` : `${kindLabel} proxima`,
      detail: isOverdue
        ? `${kindLabel} vencida ha ${daysOverdue} ${daysOverdue === 1 ? 'dia' : 'dias'}`
        : `${kindLabel} prevista para ${formatShortDate(urgentCommitment.dataAlvo)}`,
      sortScore: (isOverdue ? 180 : 120) + operationalScore + (isOverdue ? daysOverdue : 0),
    });
  }

  if (registros.length === 0 && isCriticalWithoutHistory(equipamento)) {
    alerts.push({
      id: `${equipamento.id}:critical-without-history`,
      kind: 'critical_without_history',
      severity: 'warning',
      equipamentoId: equipamento.id,
      title: 'Equipamento critico sem historico',
      detail: 'Cadastre o primeiro servico para iniciar a rotina',
      sortScore: 115 + operationalScore,
    });
  }

  const recentCorrectiveCount = countRecentCorrectives(registros);
  if (recentCorrectiveCount >= 2) {
    alerts.push({
      id: `${equipamento.id}:corrective-recurrence`,
      kind: 'corrective_recurrence',
      severity: 'warning',
      equipamentoId: equipamento.id,
      title: 'Equipamento exige acompanhamento',
      detail: `${recentCorrectiveCount} corretivas recentes`,
      sortScore: 90 + operationalScore + recentCorrectiveCount,
    });
  }

  return alerts;
}

function groupRecordsByEquipment(registros: RegistroServico[]): Map<string, RegistroServico[]> {
  const result = new Map<string, RegistroServico[]>();

  registros.forEach((registro) => {
    const existing = result.get(registro.equipamentoId) ?? [];
    existing.push(registro);
    result.set(registro.equipamentoId, existing);
  });

  result.forEach((items) => items.sort((a, b) => b.data.localeCompare(a.data)));
  return result;
}

function groupCommitmentsByEquipment(
  compromissos: CompromissoServico[],
): Map<string, CompromissoServico[]> {
  const result = new Map<string, CompromissoServico[]>();

  compromissos
    .filter((compromisso) => compromisso.status === 'agendado')
    .forEach((compromisso) => {
      const existing = result.get(compromisso.equipamentoId) ?? [];
      existing.push(compromisso);
      result.set(compromisso.equipamentoId, existing);
    });

  result.forEach((items) => items.sort((a, b) => a.dataAlvo.localeCompare(b.dataAlvo)));
  return result;
}

function pickUrgentCommitment(
  compromissos: CompromissoServico[],
  today: string,
): CompromissoServico | undefined {
  return compromissos.find(
    (compromisso) => daysBetween(today, compromisso.dataAlvo) <= UPCOMING_WINDOW_DAYS,
  );
}

function isCriticalWithoutHistory(equipamento: Equipamento): boolean {
  return (
    equipamento.criticidade === 'alta' ||
    equipamento.criticidade === 'critica' ||
    equipamento.prioridadeOperacional === 'alta'
  );
}

function countRecentCorrectives(registros: RegistroServico[]): number {
  return registros
    .slice(0, 3)
    .filter((registro) => registro.tipo === 'corretiva' || registro.status === 'danger').length;
}

function getOperationalScore(equipamento: Equipamento): number {
  return (
    CRITICALITY_WEIGHT[equipamento.criticidade ?? 'media'] +
    PRIORITY_WEIGHT[equipamento.prioridadeOperacional ?? 'normal']
  );
}

function compareAlerts(a: HomeAlert, b: HomeAlert): number {
  return getSeverityWeight(b.severity) - getSeverityWeight(a.severity) || b.sortScore - a.sortScore;
}

function getSeverityWeight(severity: HomeAlertSeverity): number {
  return severity === 'danger' ? 2 : 1;
}

function daysBetween(today: string, target: string): number {
  const start = Date.parse(`${today}T00:00:00`);
  const end = Date.parse(`${target}T00:00:00`);
  const day = 24 * 60 * 60 * 1000;
  return Math.round((end - start) / day);
}

function formatShortDate(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}
