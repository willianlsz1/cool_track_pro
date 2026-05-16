import { appV2Tone } from '../styles/tokens';
import { ActionButton, ListRow, SectionCard, StatusBadge } from '../ui/primitives';
import type { ServiceReportViewModel } from './serviceReportViewModel';

interface ServiceReportPreviewProps {
  report: ServiceReportViewModel;
  onPrint: () => void;
}

export function ServiceReportPreview({ report, onPrint }: ServiceReportPreviewProps) {
  return (
    <SectionCard className="tw-overflow-hidden tw-p-0" labelledBy="service-report-title">
      <div
        className="tw-flex tw-flex-col tw-gap-4 tw-border-b tw-border-[#E5EAF0] tw-p-5 sm:tw-flex-row sm:tw-items-start sm:tw-justify-between"
        data-app-v2-print-hidden="true"
      >
        <div className="tw-min-w-0">
          <p
            className={`tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.16em] ${appV2Tone.subtleText}`}
          >
            Previa imprimivel
          </p>
          <h2
            id="service-report-title"
            className={`tw-m-0 tw-mt-2 tw-text-xl tw-font-bold tw-leading-tight ${appV2Tone.text}`}
          >
            {report.title}
          </h2>
          <p className={`tw-m-0 tw-mt-2 tw-text-sm tw-leading-6 ${appV2Tone.mutedText}`}>
            {report.subtitle}
          </p>
        </div>
        <div className="tw-flex tw-flex-col tw-items-start tw-gap-3 sm:tw-items-end">
          <StatusBadge tone={report.statusTone} className="tw-border">
            {report.statusLabel}
          </StatusBadge>
          <ActionButton onClick={onPrint} className="tw-min-h-11">
            Imprimir relatorio
          </ActionButton>
        </div>
      </div>

      <div className="tw-bg-white tw-p-5 print:tw-p-0">
        <div
          className="tw-rounded-lg tw-border tw-border-[#E5EAF0] tw-bg-[#F8FAFC] tw-p-5 print:tw-border-0 print:tw-bg-white print:tw-p-0"
          data-app-v2-print-scope="service-report"
        >
          <div className="tw-flex tw-flex-col tw-gap-3 sm:tw-flex-row sm:tw-items-start sm:tw-justify-between">
            <div>
              <p className="tw-m-0 tw-text-[0.72rem] tw-font-bold tw-uppercase tw-tracking-[0.16em] tw-text-[#2563EB]">
                CoolTrack Pro app-v2
              </p>
              <h3 className={`tw-m-0 tw-mt-2 tw-text-lg tw-font-bold ${appV2Tone.text}`}>
                {report.reportId}
              </h3>
            </div>
            <p className={`tw-m-0 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
              Gerado em {report.generatedAtLabel}
            </p>
          </div>

          <div className="tw-mt-5 tw-grid tw-gap-4">
            {report.sections.map((section) => (
              <div
                key={section.title}
                className="tw-overflow-hidden tw-rounded-lg tw-border tw-border-[#E5EAF0] tw-bg-white"
              >
                <div className="tw-border-b tw-border-[#E5EAF0] tw-bg-[#F8FAFC] tw-px-4 tw-py-3">
                  <h4 className={`tw-m-0 tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
                    {section.title}
                  </h4>
                </div>
                {section.fields.map((field) => (
                  <ListRow key={`${section.title}-${field.label}`} className="tw-px-4 tw-py-3">
                    <div className="tw-grid tw-gap-1 sm:tw-grid-cols-[180px_minmax(0,1fr)] sm:tw-gap-4">
                      <p className={`tw-m-0 tw-text-xs tw-font-bold ${appV2Tone.subtleText}`}>
                        {field.label}
                      </p>
                      <p className={`tw-m-0 tw-text-sm tw-leading-6 ${appV2Tone.text}`}>
                        {field.value}
                      </p>
                    </div>
                  </ListRow>
                ))}
              </div>
            ))}
          </div>

          <div className="tw-mt-6 tw-grid tw-gap-4 sm:tw-grid-cols-2">
            {report.signatureFields.map((label) => (
              <div
                key={label}
                className="tw-rounded-lg tw-border tw-border-[#CBD5E1] tw-bg-white tw-p-4"
              >
                <div className="tw-h-14 tw-border-b tw-border-[#94A3B8]" aria-hidden="true" />
                <p
                  className={`tw-m-0 tw-mt-3 tw-text-center tw-text-sm tw-font-semibold ${appV2Tone.text}`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
