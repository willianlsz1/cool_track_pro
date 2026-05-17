import {
  faBuilding,
  faCalendarAlt,
  faClipboardList,
  faMicrochip,
  faPrint,
  faSnowflake,
  faStethoscope,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { ActionButton, SectionCard } from '../ui/primitives';
import type {
  ServiceReportFieldViewModel,
  ServiceReportInfoCardViewModel,
  ServiceReportViewModel,
} from './serviceReportViewModel';

interface ServiceReportPreviewProps {
  report: ServiceReportViewModel;
  onPrint: () => void;
}

const infoCardIconByTitle: Record<string, IconDefinition> = {
  Cliente: faBuilding,
  Equipamento: faMicrochip,
  Serviço: faClipboardList,
};

const statusToneClass = {
  success: 'tw-bg-[#F0FDF4] tw-text-[#16A34A]',
  warning: 'tw-bg-[#FFFBEB] tw-text-[#D97706]',
  danger: 'tw-bg-[#FEF2F2] tw-text-[#DC2626]',
  primary: 'tw-bg-[#EFF6FF] tw-text-[#2563EB]',
  muted: 'tw-bg-[#F1F5F9] tw-text-[#52677F]',
};

export function ServiceReportPreview({ report, onPrint }: ServiceReportPreviewProps) {
  return (
    <SectionCard
      className="tw-overflow-hidden tw-bg-[#E8EDF4] tw-p-0 print:tw-border-0 print:tw-bg-white print:tw-shadow-none"
      labelledBy="service-report-title"
    >
      <div
        className="tw-flex tw-flex-col tw-gap-3 tw-border-b tw-border-[#D7E0EC] tw-bg-white tw-p-4 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between"
        data-app-v2-print-hidden="true"
      >
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-text-xs tw-font-bold tw-uppercase tw-tracking-[0.08em] tw-text-[#1E4F8A]">
            Prévia imprimível
          </p>
          <h2
            id="service-report-title"
            className="tw-m-0 tw-mt-1 tw-text-xl tw-font-extrabold tw-leading-tight tw-text-[#071A33]"
          >
            {report.title}
          </h2>
          <p className="tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-[#52677F]">
            {report.subtitle}
          </p>
        </div>
        <ActionButton onClick={onPrint} className="tw-min-h-10 tw-gap-2 tw-px-4 tw-py-2">
          <FontAwesomeIcon icon={faPrint} className="tw-h-3.5 tw-w-3.5" aria-hidden="true" />
          Imprimir relatório
        </ActionButton>
      </div>

      <div className="tw-flex tw-justify-center tw-p-4 sm:tw-p-6 print:tw-block print:tw-p-0">
        <article
          className="tw-w-full tw-max-w-[1100px] tw-overflow-hidden tw-rounded-[20px] tw-bg-white tw-shadow-[0_20px_40px_-12px_rgba(15,23,42,0.18)] print:tw-max-w-none print:tw-rounded-none print:tw-shadow-none"
          data-app-v2-print-scope="service-report"
        >
          <div className="tw-p-5 sm:tw-p-8 print:tw-p-0">
            <ReportHeader report={report} />

            <div className="tw-mt-7 tw-grid tw-gap-5 lg:tw-grid-cols-3">
              {report.infoCards.map((card) => (
                <ReportInfoCard key={card.title} card={card} />
              ))}
            </div>

            <section className="tw-mt-7 tw-rounded-[20px] tw-border tw-border-[#E2E8F0] tw-bg-[#F8FAFE] tw-p-5">
              <h3 className="tw-m-0 tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-extrabold tw-uppercase tw-tracking-[0.03em] tw-text-[#1E4F8A]">
                <FontAwesomeIcon
                  icon={faStethoscope}
                  className="tw-h-4 tw-w-4"
                  aria-hidden="true"
                />
                Execução do serviço
              </h3>

              <ReportTextBlock label="Diagnóstico" value={report.execution.diagnosis} />
              <ReportTextBlock label="Ações executadas" value={report.execution.actionsDone} />

              <div className="tw-mt-4 tw-grid tw-gap-4 sm:tw-grid-cols-2">
                {report.execution.details.map((field) => (
                  <div
                    key={field.label}
                    className="tw-rounded-[14px] tw-border tw-border-[#E2E8F0] tw-bg-white tw-px-3 tw-py-2.5"
                  >
                    <p className="tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.03em] tw-text-[#1E4F8A]">
                      {field.label}
                    </p>
                    <p className="tw-m-0 tw-mt-1 tw-text-sm tw-font-medium tw-text-[#071A33]">
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="tw-mt-4">
                <p className="tw-m-0 tw-mb-1 tw-text-xs tw-font-bold tw-uppercase tw-tracking-[0.03em] tw-text-[#1E4F8A]">
                  Observações / Recomendações
                </p>
                <p className="tw-m-0 tw-rounded-[14px] tw-border tw-border-[#FDE68A] tw-bg-[#FFF8EB] tw-px-3 tw-py-2.5 tw-text-sm tw-leading-6 tw-text-[#2C3F5C]">
                  {report.execution.recommendation}
                </p>
              </div>
            </section>

            <ReportFooter report={report} />
          </div>
        </article>
      </div>
    </SectionCard>
  );
}

function ReportHeader({ report }: { report: ServiceReportViewModel }) {
  return (
    <header className="tw-flex tw-flex-col tw-gap-5 tw-border-b-2 tw-border-[#EFF3F8] tw-pb-5 sm:tw-flex-row sm:tw-items-start sm:tw-justify-between">
      <div className="tw-flex tw-items-center tw-gap-3">
        <div className="tw-flex tw-h-12 tw-w-12 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-gradient-to-br tw-from-[#1E4F8A] tw-to-[#2563EB] tw-text-white tw-shadow-[0_8px_18px_-14px_rgba(37,99,235,0.8)]">
          <FontAwesomeIcon icon={faSnowflake} className="tw-h-6 tw-w-6" aria-hidden="true" />
        </div>
        <div>
          <span className="tw-sr-only">CoolTrack Pro app-v2</span>
          <p className="tw-m-0 tw-text-[1.35rem] tw-font-extrabold tw-leading-tight tw-tracking-[-0.02em] tw-text-[#071A33]">
            CoolTrack Pro
          </p>
          <p className="tw-m-0 tw-mt-1 tw-text-xs tw-font-medium tw-text-[#52677F]">
            Gestão de manutenção e refrigeração
          </p>
        </div>
      </div>

      <div className="tw-text-left sm:tw-text-right">
        <p className="tw-m-0 tw-text-xs tw-font-bold tw-uppercase tw-tracking-[0.06em] tw-text-[#52677F]">
          Número do relatório
        </p>
        <p className="tw-m-0 tw-mt-1 tw-text-base tw-font-extrabold tw-text-[#071A33]">
          {report.reportId}
        </p>
        <span className="tw-mt-2 tw-inline-flex tw-items-center tw-gap-2 tw-rounded-full tw-bg-[#EFF6FF] tw-px-3 tw-py-1 tw-text-xs tw-font-bold tw-uppercase tw-text-[#1E4F8A]">
          <FontAwesomeIcon icon={faPrint} className="tw-h-3 tw-w-3" aria-hidden="true" />
          Prévia imprimível
        </span>
      </div>
    </header>
  );
}

function ReportInfoCard({ card }: { card: ServiceReportInfoCardViewModel }) {
  return (
    <section className="tw-rounded-[20px] tw-border tw-border-[#E2E8F0] tw-bg-[#F9FBFE] tw-p-4">
      <h3 className="tw-m-0 tw-mb-3 tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-extrabold tw-uppercase tw-tracking-[0.03em] tw-text-[#1E4F8A]">
        <FontAwesomeIcon
          icon={infoCardIconByTitle[card.title] ?? faClipboardList}
          className="tw-h-3.5 tw-w-3.5"
          aria-hidden="true"
        />
        {card.title}
      </h3>

      <dl className="tw-m-0 tw-grid">
        {card.fields.map((field) => (
          <InfoRow key={`${card.title}-${field.label}`} field={field} />
        ))}
      </dl>
    </section>
  );
}

function InfoRow({ field }: { field: ServiceReportFieldViewModel }) {
  const isStatus = field.label === 'Status';

  return (
    <div className="tw-flex tw-gap-3 tw-border-b tw-border-[#EDF2F7] tw-py-1.5 last:tw-border-b-0">
      <dt className="tw-min-w-0 tw-flex-1 tw-text-sm tw-font-medium tw-text-[#52677F]">
        {field.label}
      </dt>
      <dd className="tw-m-0 tw-min-w-0 tw-flex-1 tw-text-right tw-text-sm tw-font-bold tw-text-[#071A33]">
        {isStatus ? <StatusPill>{field.value}</StatusPill> : field.value}
      </dd>
    </div>
  );
}

function ReportTextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="tw-mt-4">
      <p className="tw-m-0 tw-mb-1 tw-text-xs tw-font-bold tw-text-[#071A33]">{label}</p>
      <p className="tw-m-0 tw-rounded-[14px] tw-border tw-border-[#E2E8F0] tw-bg-white tw-px-3 tw-py-2.5 tw-text-sm tw-leading-6 tw-text-[#2C3F5C]">
        {value}
      </p>
    </div>
  );
}

function ReportFooter({ report }: { report: ServiceReportViewModel }) {
  return (
    <footer className="tw-mt-5 tw-flex tw-flex-col tw-gap-4 tw-border-t tw-border-[#E2E8F0] tw-pt-5 lg:tw-flex-row lg:tw-items-center lg:tw-justify-between">
      <div className="tw-flex tw-flex-col tw-gap-4 sm:tw-flex-row sm:tw-gap-8">
        {report.signatureFields.map((field) => (
          <span key={field} className="tw-sr-only">
            {field}
          </span>
        ))}
        <SignatureBlock label="Técnico responsável" value={report.footer.technicianName} />
        <SignatureBlock label="Cliente / responsável" value={report.footer.clientName} />
      </div>

      <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row sm:tw-items-center sm:tw-gap-4">
        <StatusPill icon>{report.footer.statusSummary}</StatusPill>
        <span className="tw-inline-flex tw-items-center tw-gap-2 tw-text-xs tw-text-[#6F87A3]">
          <FontAwesomeIcon icon={faCalendarAlt} className="tw-h-3 tw-w-3" aria-hidden="true" />
          Gerado em {report.footer.generatedAtLabel}
        </span>
      </div>
    </footer>
  );
}

function SignatureBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="tw-text-xs tw-text-[#52677F]">
      {label}
      <strong className="tw-mt-1 tw-block tw-text-sm tw-text-[#071A33]">{value}</strong>
    </div>
  );
}

function StatusPill({ children, icon = false }: { children: string; icon?: boolean }) {
  const className = getStatusPillClass(children);

  return (
    <span
      className={`tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded-full tw-px-3 tw-py-1 tw-text-xs tw-font-bold ${className}`}
    >
      {icon ? (
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="tw-h-3 tw-w-3"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}

function getStatusPillClass(value: string): string {
  if (value.includes('Crítico')) {
    return statusToneClass.danger;
  }

  if (value.includes('Atenção')) {
    return statusToneClass.warning;
  }

  if (value.includes('Operacional')) {
    return statusToneClass.success;
  }

  return statusToneClass.muted;
}
