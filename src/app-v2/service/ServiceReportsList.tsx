import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import { SectionCard } from '../ui/primitives';
import type { ServicesReportListItemViewModel } from './servicesReportsViewModel';

interface ServiceReportsListProps {
  items: ServicesReportListItemViewModel[];
  onOpenReport: (reportId: string) => void;
}

export function ServiceReportsList({ items, onOpenReport }: ServiceReportsListProps) {
  if (items.length === 0) {
    return (
      <div data-testid="service-report-list">
        <SectionCard padding="sm">
          <p className={`tw-m-0 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
            Nenhum relatório encontrado para a busca atual.
          </p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div data-testid="service-report-list">
      <SectionCard className="tw-overflow-hidden tw-p-0" labelledBy="service-reports-list-title">
        <div className="tw-px-5 tw-py-4">
          <h2
            id="service-reports-list-title"
            className={`tw-m-0 tw-text-[0.8rem] tw-font-semibold tw-uppercase ${appV2Tone.text}`}
          >
            Relatórios · Lista operacional
          </h2>
        </div>

        <div className="tw-hidden tw-grid-cols-[1fr_1.05fr_1.05fr_0.72fr_0.72fr_0.78fr] tw-gap-4 tw-bg-[#F8FAFE] tw-px-5 tw-py-3 tw-text-[0.75rem] tw-font-semibold tw-uppercase tw-text-[#1E4F8A] lg:tw-grid">
          <span>Relatório</span>
          <span>Cliente</span>
          <span>Equipamento</span>
          <span>Tipo</span>
          <span>Status</span>
          <span className="tw-text-right">Ação</span>
        </div>

        <div>
          {items.map((item) => (
            <article
              key={item.id}
              className="tw-grid tw-gap-3 tw-border-t tw-border-[#EDF2F7] tw-px-5 tw-py-4 first:tw-border-t-0 lg:tw-grid-cols-[1fr_1.05fr_1.05fr_0.72fr_0.72fr_0.78fr] lg:tw-items-start lg:tw-gap-4"
            >
              <div>
                <p className={`tw-m-0 tw-text-[0.75rem] tw-font-bold ${appV2Tone.text}`}>
                  {item.reportId}
                </p>
                <p className={`tw-m-0 tw-mt-1 tw-text-[0.65rem] ${appV2Tone.subtleText}`}>
                  {item.dateLabel}
                </p>
              </div>
              <p className={`tw-m-0 tw-text-[0.75rem] tw-font-normal ${appV2Tone.text}`}>
                {item.customerName}
              </p>
              <p className={`tw-m-0 tw-text-[0.75rem] tw-font-normal ${appV2Tone.text}`}>
                {item.equipmentName}
              </p>
              <p className={`tw-m-0 tw-text-[0.75rem] tw-font-normal ${appV2Tone.text}`}>
                {item.kindLabel}
              </p>
              <div>
                <ReportStatusBadge item={item} />
              </div>
              <div className="tw-flex lg:tw-justify-start">
                <button
                  type="button"
                  className={`tw-inline-flex tw-items-center tw-gap-1 tw-rounded-lg tw-border-0 tw-bg-transparent tw-p-0 tw-text-[0.7rem] tw-font-semibold tw-text-[#2563EB] ${appV2Tone.focus}`}
                  onClick={() => onOpenReport(item.id)}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="tw-text-[0.72rem]" />
                  Ver relatório
                </button>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function ReportStatusBadge({ item }: { item: ServicesReportListItemViewModel }) {
  const statusClass = {
    atencao: 'tw-bg-[#FFFBEB] tw-text-[#D97706]',
    pendente: 'tw-bg-[#FEF2F2] tw-text-[#DC2626]',
    pronto: 'tw-bg-[#F0FDF4] tw-text-[#16A34A]',
  }[item.status];
  const statusLabel = item.status === 'pendente' ? 'Pendente' : item.statusLabel;

  return (
    <span
      className={`tw-inline-flex tw-rounded-full tw-px-2.5 tw-py-1 tw-text-[0.65rem] tw-font-semibold ${statusClass}`}
    >
      {statusLabel}
    </span>
  );
}
