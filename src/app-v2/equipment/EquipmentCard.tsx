import type { EquipmentListItemViewModel, EquipmentTone } from './equipmentViewModel';
import { appV2Tone } from '../styles/tokens';

interface EquipmentCardProps {
  item: EquipmentListItemViewModel;
  onOpen: (equipmentId: string) => void;
}

const toneClasses: Record<EquipmentTone, string> = {
  danger: appV2Tone.danger,
  warning: appV2Tone.warning,
  success: appV2Tone.success,
  primary: appV2Tone.actionSoft,
};

export function EquipmentCard({ item, onOpen }: EquipmentCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className={`tw-flex tw-w-full tw-flex-col tw-gap-3 tw-rounded-lg tw-border tw-bg-white tw-p-4 tw-text-left tw-shadow-[0_12px_30px_-26px_rgba(10,19,40,0.55)] ${appV2Tone.border} ${appV2Tone.focus}`}
    >
      <span className="tw-flex tw-items-start tw-justify-between tw-gap-3">
        <span className="tw-min-w-0">
          <span className={`tw-block tw-truncate tw-text-base tw-font-black ${appV2Tone.text}`}>
            {item.name}
          </span>
          <span
            className={`tw-mt-1 tw-block tw-truncate tw-text-sm tw-font-semibold ${appV2Tone.mutedText}`}
          >
            {item.customerLine}
          </span>
        </span>
        <span
          className={`tw-shrink-0 tw-rounded-md tw-border tw-px-2 tw-py-1 tw-text-xs tw-font-bold ${toneClasses[item.statusTone]}`}
        >
          {item.statusLabel}
        </span>
      </span>

      <span className="tw-flex tw-items-center tw-justify-between tw-gap-3">
        <span className={`tw-min-w-0 tw-truncate tw-text-xs tw-font-bold ${appV2Tone.subtleText}`}>
          {item.metaLine}
        </span>
        <span
          className={`tw-shrink-0 tw-rounded-md tw-border tw-px-2 tw-py-1 tw-text-xs tw-font-bold ${toneClasses[item.nextActionTone]}`}
        >
          {item.nextActionLabel}
        </span>
      </span>
    </button>
  );
}
