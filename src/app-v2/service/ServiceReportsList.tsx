import { appV2Tone } from '../styles/tokens';
import { ActionButton, SectionCard, StatusBadge } from '../ui/primitives';
import type { ServicesReportListItemViewModel } from './servicesReportsViewModel';

interface ServiceReportsListProps {
  items: ServicesReportListItemViewModel[];
  onOpenReport: (reportId: string) => void;
}

export function ServiceReportsList({ items, onOpenReport }: ServiceReportsListProps) {
  if (items.length === 0) {
    return (
      <SectionCard padding="sm">
        <p className={`tw-m-0 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
          Nenhum relatorio encontrado para a busca atual.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard className="tw-overflow-hidden tw-p-0" labelledBy="service-reports-list-title">
      <div className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-b tw-border-[#E5EAF0] tw-px-4 tw-py-4">
        <div>
          <p
            className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            Relatorios
          </p>
          <h2
            id="service-reports-list-title"
            className={`tw-m-0 tw-mt-1 tw-text-lg tw-font-semibold ${appV2Tone.text}`}
          >
            Lista operacional
          </h2>
        </div>
        <span className={`tw-text-sm tw-font-bold ${appV2Tone.mutedText}`}>{items.length}</span>
      </div>

      <div className="tw-hidden tw-grid-cols-[1fr_1.2fr_1.2fr_0.8fr_0.8fr_0.8fr] tw-gap-4 tw-bg-[#F8FAFC] tw-px-4 tw-py-3 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.12em] tw-text-[#697A99] lg:tw-grid">
        <span>Relatorio</span>
        <span>Cliente</span>
        <span>Equipamento</span>
        <span>Tipo</span>
        <span>Status</span>
        <span className="tw-text-right">Acao</span>
      </div>

      <div>
        {items.map((item) => (
          <article
            key={item.id}
            className="tw-grid tw-gap-3 tw-border-t tw-border-[#E5EAF0] tw-px-4 tw-py-4 first:tw-border-t-0 lg:tw-grid-cols-[1fr_1.2fr_1.2fr_0.8fr_0.8fr_0.8fr] lg:tw-items-center lg:tw-gap-4"
          >
            <div>
              <p className="tw-m-0 tw-text-sm tw-font-bold tw-text-[#2563EB]">{item.reportId}</p>
              <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-medium ${appV2Tone.subtleText}`}>
                {item.dateLabel}
              </p>
            </div>
            <p className={`tw-m-0 tw-text-sm tw-font-medium ${appV2Tone.text}`}>
              {item.customerName}
            </p>
            <p className={`tw-m-0 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
              {item.equipmentName}
            </p>
            <p className={`tw-m-0 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
              {item.kindLabel}
            </p>
            <div>
              <StatusBadge tone={item.statusTone}>{item.statusLabel}</StatusBadge>
            </div>
            <div className="tw-flex lg:tw-justify-end">
              <ActionButton
                variant="secondary"
                className="tw-min-h-10 tw-w-full tw-px-4 tw-py-2 lg:tw-w-auto"
                onClick={() => onOpenReport(item.id)}
              >
                Ver relatorio
              </ActionButton>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
