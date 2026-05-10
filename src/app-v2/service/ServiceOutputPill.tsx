import { appV2Tone } from '../styles/tokens';
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

const outputClasses: Record<ServiceOutputStatus, string> = {
  relatorio_pendente: appV2Tone.actionSoft,
  orcamento_sugerido: 'tw-border-[#F6C453] tw-bg-[#FFF7E6] tw-text-[#8A5A00]',
  proximo_compromisso_sugerido: appV2Tone.success,
  sem_pendencia: `tw-bg-[#F8FAFC] tw-text-[#64748B] ${appV2Tone.border}`,
};

export function ServiceOutputPill({ status }: ServiceOutputPillProps) {
  return (
    <span
      className={`tw-inline-flex tw-w-fit tw-rounded-md tw-border tw-px-2.5 tw-py-1 tw-text-xs tw-font-black ${outputClasses[status]}`}
    >
      {outputLabels[status]}
    </span>
  );
}
