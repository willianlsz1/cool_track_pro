import { StatusBadge, type StatusBadgeTone } from '../ui/primitives';
import type { ServiceOutputStatus } from './servicesHomeViewModel';

interface ServiceOutputPillProps {
  status: ServiceOutputStatus;
}

const outputLabels: Record<ServiceOutputStatus, string> = {
  relatorio_pendente: 'Relatório pendente',
  orcamento_sugerido: 'Orçamento sugerido',
  proximo_compromisso_sugerido: 'Próximo compromisso',
  sem_pendencia: 'Sem pendência',
};

const outputTones: Record<ServiceOutputStatus, StatusBadgeTone> = {
  relatorio_pendente: 'primary',
  orcamento_sugerido: 'warning',
  proximo_compromisso_sugerido: 'success',
  sem_pendencia: 'muted',
};

export function ServiceOutputPill({ status }: ServiceOutputPillProps) {
  return <StatusBadge tone={outputTones[status]}>{outputLabels[status]}</StatusBadge>;
}
