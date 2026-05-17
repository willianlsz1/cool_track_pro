import { useState } from 'react';
import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCalendarTimes,
  faCheckCircle,
  faFileAlt,
  faFileInvoiceDollar,
  faMicrochip,
} from '@fortawesome/free-solid-svg-icons';

import { SectionCard } from '../ui/primitives';
import { ServiceReportPreview } from './ServiceReportPreview';
import type { ServiceDoneViewModel } from './serviceFlowViewModel';
import type { ServiceReportViewModel } from './serviceReportViewModel';

interface ServiceDoneProps {
  done: ServiceDoneViewModel;
  report: ServiceReportViewModel;
  onBackToServices: () => void;
  onCreateQuote: () => void;
  onOpenEquipment: () => void;
}

export function ServiceDone({
  done,
  report,
  onBackToServices,
  onCreateQuote,
  onOpenEquipment,
}: ServiceDoneProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const summaryItems = buildSummaryItems(done.technicalSummary);

  function printReport() {
    window.print();
  }

  return (
    <div className="tw-grid tw-gap-5">
      <SectionCard className="tw-rounded-[20px] tw-border-[#E2E8F0] tw-bg-white tw-p-6 tw-shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="tw-text-center">
          <div className="tw-mx-auto tw-mb-3 tw-flex tw-h-14 tw-w-14 tw-items-center tw-justify-center tw-rounded-full tw-bg-[#F0FDF4]">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="tw-h-8 tw-w-8 tw-text-[#16A34A]"
              aria-hidden="true"
            />
          </div>
          <h1 className="tw-m-0 tw-text-xl tw-font-bold tw-leading-tight tw-text-[#071A33]">
            {done.title}
          </h1>
          <p className="tw-m-0 tw-mt-1 tw-text-sm tw-font-normal tw-leading-5 tw-text-[#52677F]">
            {done.summary}
          </p>
        </div>

        <div className="tw-mt-6 tw-flex tw-flex-wrap tw-justify-center tw-gap-4">
          <DoneButton variant="outline" onClick={() => setIsReportOpen(true)}>
            <FontAwesomeIcon icon={faFileAlt} className="tw-h-3.5 tw-w-3.5" aria-hidden="true" />
            Ver relatório
          </DoneButton>
          <DoneButton variant="outline" onClick={onOpenEquipment}>
            <FontAwesomeIcon icon={faMicrochip} className="tw-h-3.5 tw-w-3.5" aria-hidden="true" />
            Ver equipamento
          </DoneButton>
          <DoneButton variant="primary" onClick={onBackToServices}>
            <FontAwesomeIcon icon={faArrowLeft} className="tw-h-3.5 tw-w-3.5" aria-hidden="true" />
            Voltar para Serviços
          </DoneButton>
        </div>

        <hr className="tw-my-6 tw-h-px tw-border-0 tw-bg-[#EDF2F7]" />

        <h2 className="tw-m-0 tw-mb-3 tw-text-sm tw-font-bold tw-text-[#071A33]">
          Resumo do serviço
        </h2>
        <div className="tw-grid tw-gap-3 lg:tw-grid-cols-2 lg:tw-gap-x-4">
          {summaryItems.map((item) => (
            <SummaryItem key={item.label} item={item} />
          ))}
        </div>

        <div className="tw-mt-6">
          <h2 className="tw-m-0 tw-mb-3 tw-text-sm tw-font-bold tw-text-[#071A33]">
            Saídas futuras
          </h2>
          <div className="tw-flex tw-flex-wrap tw-gap-4">
            {done.postDiagnosticQuote ? (
              <button
                type="button"
                title={done.postDiagnosticQuote.detail}
                className="tw-inline-flex tw-min-h-12 tw-items-center tw-gap-2.5 tw-rounded-[14px] tw-border tw-border-[#EDF2F7] tw-bg-[#F8FAFE] tw-px-4 tw-py-3 tw-text-xs tw-font-semibold tw-text-[#071A33] tw-transition focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[#2563EB]"
                onClick={onCreateQuote}
              >
                <FontAwesomeIcon
                  icon={faFileInvoiceDollar}
                  className="tw-h-4 tw-w-4 tw-text-[#2563EB]"
                  aria-hidden="true"
                />
                {done.postDiagnosticQuote.label}
              </button>
            ) : null}
            {done.disabledOutputs.map((output) => (
              <button
                key={output}
                type="button"
                disabled
                className="tw-inline-flex tw-min-h-12 tw-items-center tw-gap-2.5 tw-rounded-[14px] tw-border tw-border-[#EDF2F7] tw-bg-[#F8FAFE] tw-px-4 tw-py-3 tw-text-xs tw-font-semibold tw-text-[#8BA0BC] tw-opacity-60"
              >
                <FontAwesomeIcon
                  icon={faCalendarTimes}
                  className="tw-h-4 tw-w-4"
                  aria-hidden="true"
                />
                {output} indisponível
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {isReportOpen ? <ServiceReportPreview report={report} onPrint={printReport} /> : null}
    </div>
  );
}

function DoneButton({
  children,
  onClick,
  variant,
}: {
  children: ReactNode;
  onClick: () => void;
  variant: 'outline' | 'primary';
}) {
  const classes =
    variant === 'primary'
      ? 'tw-border-[#2563EB] tw-bg-[#2563EB] tw-text-white'
      : 'tw-border-[#CBD5E1] tw-bg-transparent tw-text-[#1E4F8A]';

  return (
    <button
      type="button"
      className={`tw-inline-flex tw-min-h-10 tw-items-center tw-gap-2 tw-rounded-[10px] tw-border tw-px-4 tw-py-2 tw-text-xs tw-font-semibold tw-transition focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[#2563EB] ${classes}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface SummaryItemView {
  label: string;
  value: string;
  fullWidth?: boolean;
}

function SummaryItem({ item }: { item: SummaryItemView }) {
  const empty = isEmptySummaryValue(item.value);

  return (
    <div
      className={`tw-rounded-xl tw-border tw-border-[#EDF2F7] tw-bg-[#F8FAFE] tw-px-3 tw-py-2 ${
        item.fullWidth ? 'lg:tw-col-span-2' : ''
      }`}
    >
      <div className="tw-text-[0.65rem] tw-font-bold tw-uppercase tw-text-[#1E4F8A]">
        {item.label}
      </div>
      <div
        className={`tw-mt-1 tw-break-words tw-text-[0.8rem] tw-font-semibold tw-leading-5 ${
          empty ? 'tw-italic tw-text-[#8BA0BC]' : 'tw-text-[#071A33]'
        }`}
      >
        {item.value}
      </div>
    </div>
  );
}

function buildSummaryItems(technicalSummary: string[]): SummaryItemView[] {
  return technicalSummary.map((item) => {
    const separatorIndex = item.indexOf(':');

    if (separatorIndex === -1) {
      return { label: 'Resumo', value: item };
    }

    const label = item.slice(0, separatorIndex).trim();
    const value = item.slice(separatorIndex + 1).trim();

    return {
      label,
      value,
      fullWidth: label === 'Status final',
    };
  });
}

function isEmptySummaryValue(value: string): boolean {
  return ['Sem peças informadas', 'Não informado', 'Não informada'].includes(value);
}
