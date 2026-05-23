import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import { fieldInputClass } from '../ui/FieldGroup';
import type { QuoteEditItemDraft } from './quoteDraftTypes';
import { formatCurrency, getItemTotal } from './quoteDraftUtils';

export function QuoteItemsTable({
  items,
  onChangeItem,
  onRemoveItem,
}: {
  items: QuoteEditItemDraft[];
  onChangeItem: (index: number, patch: Partial<QuoteEditItemDraft>) => void;
  onRemoveItem: (index: number) => void;
}) {
  if (items.length === 0) {
    return (
      <div
        className={`tw-mt-3 tw-rounded-2xl tw-border tw-border-dashed tw-border-[#CBD5E1] tw-bg-[#F8FAFE] tw-p-4 tw-text-center tw-text-xs ${appV2Tone.mutedText}`}
      >
        <FontAwesomeIcon icon={faBoxOpen} className="tw-mr-1.5" aria-hidden="true" />
        Nenhum item local adicionado.
      </div>
    );
  }

  return (
    <div className="tw-mt-3 tw-overflow-x-auto">
      <table className="tw-w-full tw-text-sm">
        <thead className="tw-border-b tw-border-[#EDF2F7] tw-text-[0.65rem] tw-font-bold tw-uppercase tw-text-[#1E4F8A]">
          <tr>
            <th className="tw-py-2 tw-text-left">Descrição</th>
            <th className="tw-py-2 tw-text-left">Qtd.</th>
            <th className="tw-py-2 tw-text-left">Valor unit.</th>
            <th className="tw-py-2 tw-text-right">Total</th>
            <th className="tw-py-2 tw-text-right">Ação</th>
          </tr>
        </thead>
        <tbody className="tw-divide-y tw-divide-[#EDF2F7]">
          {items.map((item, index) => (
            <tr key={`${item.description}-${index}`}>
              <td className="tw-min-w-[240px] tw-py-2 tw-pr-3">
                <input
                  name={`quote-item-${index}-description`}
                  value={item.description}
                  onChange={(event) => onChangeItem(index, { description: event.target.value })}
                  className={fieldInputClass}
                />
              </td>
              <td className="tw-w-28 tw-py-2 tw-pr-3">
                <input
                  name={`quote-item-${index}-quantity`}
                  value={item.quantity || '1'}
                  onChange={(event) => onChangeItem(index, { quantity: event.target.value })}
                  className={fieldInputClass}
                />
              </td>
              <td className="tw-w-40 tw-py-2 tw-pr-3">
                <input
                  name={`quote-item-${index}-unit-value`}
                  value={item.unitValue}
                  onChange={(event) => onChangeItem(index, { unitValue: event.target.value })}
                  className={fieldInputClass}
                />
              </td>
              <td className="tw-py-2 tw-text-right tw-font-semibold">
                {formatCurrency(getItemTotal(item))}
              </td>
              <td className="tw-py-2 tw-pl-3 tw-text-right">
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  className={`tw-rounded-lg tw-border tw-border-[#FECACA] tw-bg-white tw-px-3 tw-py-2 tw-text-xs tw-font-semibold tw-text-[#DC2626] ${appV2Tone.focus}`}
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
