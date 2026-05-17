import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faFileAlt,
  faFlagCheckered,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import { SectionCard } from '../ui/primitives';
import type {
  ServicesReportListItemViewModel,
  ServiceReportListStatus,
} from './servicesReportsViewModel';

interface ServiceReportsListProps {
  items: ServicesReportListItemViewModel[];
  selectedReportId?: string | null;
  onOpenReport: (reportId: string) => void;
  onSelectReport: (reportId: string) => void;
}

export function ServiceReportsList({
  items,
  selectedReportId,
  onOpenReport,
  onSelectReport,
}: ServiceReportsListProps) {
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
    <div data-testid="service-report-list" className="tw-grid tw-gap-4">
      {items.map((item) => (
        <article
          key={item.id}
          className={`tw-rounded-2xl tw-border tw-border-l-[6px] tw-bg-white tw-p-5 tw-shadow-sm tw-transition hover:tw--translate-y-0.5 hover:tw-shadow-lg ${getStatusBorderClass(
            item.status,
          )} ${selectedReportId === item.id ? 'tw-ring-2 tw-ring-[#2563EB]/20' : ''}`}
        >
          <div className="tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-3">
            <button
              type="button"
              className="tw-min-w-0 tw-flex-1 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left"
              onClick={() => onSelectReport(item.id)}
            >
              <div className="tw-min-w-0">
                <ReportStatusBadge item={item} />
                <h3 className={`tw-m-0 tw-mt-2 tw-text-lg tw-font-bold ${appV2Tone.text}`}>
                  {item.reportId}
                </h3>
                <p
                  className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-medium tw-leading-5 ${appV2Tone.mutedText}`}
                >
                  {item.kindLabel} · {item.equipmentLine} · {item.customerName}
                </p>
              </div>
            </button>
            <button
              type="button"
              className={`tw-inline-flex tw-rounded-xl tw-border-0 tw-bg-[#2563EB] tw-px-4 tw-py-2 tw-text-sm tw-font-bold tw-text-white ${appV2Tone.focus}`}
              onClick={() => onOpenReport(item.id)}
            >
              Abrir relatório
            </button>
          </div>

          <div
            className={`tw-mt-3 tw-flex tw-flex-wrap tw-gap-x-4 tw-gap-y-2 tw-border-t tw-border-[#EDF2F7] tw-pt-3 tw-text-sm ${appV2Tone.mutedText}`}
          >
            <span className="tw-inline-flex tw-items-center tw-gap-1">
              <FontAwesomeIcon icon={faCalendarAlt} aria-hidden="true" />
              {item.dateLabel}
            </span>
            <span>Técnico: {item.technicianName}</span>
            <span className="tw-inline-flex tw-items-center tw-gap-1">
              <FontAwesomeIcon
                icon={item.status === 'atencao' ? faExclamationTriangle : faFlagCheckered}
                className={item.status === 'atencao' ? 'tw-text-[#D97706]' : ''}
                aria-hidden="true"
              />
              {item.statusHint}
            </span>
          </div>

          <button
            type="button"
            className={`tw-mt-4 tw-inline-flex tw-items-center tw-gap-2 tw-rounded-xl tw-border tw-border-[#CBD5E1] tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-bold tw-text-[#1E4F8A] ${appV2Tone.focus}`}
            onClick={() => onOpenReport(item.id)}
          >
            <FontAwesomeIcon icon={faFileAlt} aria-hidden="true" />
            Ver relatório
          </button>
        </article>
      ))}
    </div>
  );
}

function ReportStatusBadge({ item }: { item: ServicesReportListItemViewModel }) {
  const statusMeta: Record<
    ServiceReportListStatus,
    { className: string; icon: typeof faCheckCircle; label: string }
  > = {
    atencao: {
      className: 'tw-bg-[#FFFBEB] tw-text-[#D97706]',
      icon: faClock,
      label: 'Atenção',
    },
    pendente: {
      className: 'tw-bg-[#FEF2F2] tw-text-[#DC2626]',
      icon: faTimesCircle,
      label: 'Pendente',
    },
    pronto: {
      className: 'tw-bg-[#F0FDF4] tw-text-[#16A34A]',
      icon: faCheckCircle,
      label: 'Pronto',
    },
  };
  const meta = statusMeta[item.status];

  return (
    <span
      className={`tw-inline-flex tw-items-center tw-gap-1 tw-rounded-full tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold ${meta.className}`}
    >
      <FontAwesomeIcon icon={meta.icon} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function getStatusBorderClass(status: ServiceReportListStatus): string {
  if (status === 'atencao') {
    return 'tw-border-l-[#D97706]';
  }

  if (status === 'pendente') {
    return 'tw-border-l-[#DC2626]';
  }

  return 'tw-border-l-[#16A34A]';
}
