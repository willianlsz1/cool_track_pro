import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faFilePen, faMicrochip } from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import { QuoteFact } from './QuoteFact';
import type { ServicesQuoteListItemViewModel } from './servicesQuotesViewModel';

export function QuoteCard({
  quote,
  onEdit,
}: {
  quote: ServicesQuoteListItemViewModel;
  onEdit?: () => void;
}) {
  return (
    <article className="tw-rounded-2xl tw-border tw-border-[#EDF2F7] tw-bg-white tw-p-4">
      <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
        <p className="tw-m-0 tw-inline-flex tw-rounded-full tw-bg-[#EFF6FF] tw-px-2.5 tw-py-1 tw-text-[0.85rem] tw-font-bold tw-text-[#1E4F8A]">
          {quote.number}
        </p>
        <span className="tw-text-[0.9rem] tw-font-bold tw-text-[#16A34A]">
          Total: {quote.totalLabel}
        </span>
      </div>

      <h3 className={`tw-m-0 tw-mt-2 tw-text-[0.9rem] tw-font-semibold ${appV2Tone.text}`}>
        {quote.title}
      </h3>

      <dl className={`tw-m-0 tw-mt-3 tw-grid tw-gap-1 tw-text-[0.7rem] ${appV2Tone.mutedText}`}>
        <QuoteFact icon={faBuilding} label="Cliente" value={quote.customerLine} />
        <QuoteFact icon={faMicrochip} label="Equipamento" value={quote.equipmentLine} />
      </dl>
      <p className={`tw-m-0 tw-mt-3 tw-text-[0.7rem] tw-font-medium ${appV2Tone.mutedText}`}>
        {quote.statusLabel} · {quote.itemsLabel}
      </p>
      {onEdit ? (
        <div className="tw-mt-4 tw-flex">
          <button
            type="button"
            className={`tw-inline-flex tw-w-fit tw-items-center tw-gap-1.5 tw-rounded-lg tw-border tw-border-[#CBD5E1] tw-bg-transparent tw-px-3 tw-py-1.5 tw-text-[0.65rem] tw-font-semibold tw-text-[#1E4F8A] ${appV2Tone.focus}`}
            onClick={onEdit}
          >
            <FontAwesomeIcon icon={faFilePen} className="tw-text-[0.7rem]" aria-hidden="true" />
            Editar orçamento
          </button>
        </div>
      ) : null}
    </article>
  );
}
