import type { EquipmentListItemViewModel, EquipmentTone } from './equipmentViewModel';
import { appV2Tone } from '../styles/tokens';
import { StatusBadge } from '../ui/primitives';

interface EquipmentCardProps {
  item: EquipmentListItemViewModel;
  onOpen: (equipmentId: string) => void;
}

const accentClasses: Record<EquipmentTone, string> = {
  danger: 'tw-bg-[#DC2626]',
  warning: 'tw-bg-[#D97706]',
  success: 'tw-bg-[#16A34A]',
  primary: 'tw-bg-[#2563EB]',
};

export function EquipmentCard({ item, onOpen }: EquipmentCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className={`tw-relative tw-flex tw-min-h-[148px] tw-w-full tw-flex-col tw-justify-between tw-overflow-hidden tw-rounded-2xl tw-border tw-bg-white tw-p-4 tw-text-left tw-shadow-[0_20px_52px_-40px_rgba(15,23,42,0.46)] tw-transition-colors hover:tw-bg-[#F8FAFC] sm:tw-p-5 ${appV2Tone.border} ${appV2Tone.focus}`}
    >
      <span
        className={`tw-absolute tw-inset-y-0 tw-left-0 tw-w-1 ${accentClasses[item.nextActionTone]}`}
        aria-hidden="true"
      />
      <span className="tw-flex tw-items-start tw-justify-between tw-gap-3">
        <span className="tw-min-w-0">
          <span className={`tw-block tw-truncate tw-text-base tw-font-bold ${appV2Tone.text}`}>
            {item.name}
          </span>
          <span
            className={`tw-mt-2 tw-block tw-truncate tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}
          >
            {item.customerLine}
          </span>
        </span>
        <StatusBadge tone={item.statusTone} className="tw-shrink-0 tw-border">
          {item.statusLabel}
        </StatusBadge>
      </span>

      <span className="tw-flex tw-items-end tw-justify-between tw-gap-3">
        <span className="tw-min-w-0">
          <span
            className={`tw-block tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            Tipo / tag
          </span>
          <span
            className={`tw-mt-1 tw-block tw-truncate tw-text-sm tw-font-medium ${appV2Tone.text}`}
          >
            {item.metaLine}
          </span>
        </span>
        <StatusBadge tone={item.nextActionTone} className="tw-shrink-0 tw-border">
          {item.nextActionLabel}
        </StatusBadge>
      </span>
    </button>
  );
}
