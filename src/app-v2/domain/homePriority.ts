import type { CompromissoServico, Equipamento, RegistroServico } from './types';

export type HomeAction =
  | {
      kind: 'compromisso_vencido' | 'compromisso_hoje';
      equipamentoId: string;
      compromissoId: string;
      cta: 'Iniciar serviço';
    }
  | {
      kind: 'equipamento_sem_primeiro_servico';
      equipamentoId: string;
      cta: 'Registrar primeiro serviço';
    }
  | {
      kind: 'sem_acao';
      cta: 'Buscar equipamento';
    };

interface PickNextHomeActionInput {
  today: string;
  equipamentos: Equipamento[];
  compromissos: CompromissoServico[];
  registros: RegistroServico[];
}

export function pickNextHomeAction(input: PickNextHomeActionInput): HomeAction {
  const activeCommitments = input.compromissos
    .filter((compromisso) => compromisso.status === 'agendado')
    .sort((a, b) => a.dataAlvo.localeCompare(b.dataAlvo));

  const dueCommitment = activeCommitments.find(
    (compromisso) => compromisso.dataAlvo <= input.today,
  );

  if (dueCommitment) {
    return {
      kind: dueCommitment.dataAlvo < input.today ? 'compromisso_vencido' : 'compromisso_hoje',
      equipamentoId: dueCommitment.equipamentoId,
      compromissoId: dueCommitment.id,
      cta: 'Iniciar serviço',
    };
  }

  const equipmentWithService = new Set(input.registros.map((registro) => registro.equipamentoId));
  const equipmentWithoutService = input.equipamentos.find(
    (equipamento) => !equipmentWithService.has(equipamento.id),
  );

  if (equipmentWithoutService) {
    return {
      kind: 'equipamento_sem_primeiro_servico',
      equipamentoId: equipmentWithoutService.id,
      cta: 'Registrar primeiro serviço',
    };
  }

  return {
    kind: 'sem_acao',
    cta: 'Buscar equipamento',
  };
}
