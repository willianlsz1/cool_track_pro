import type { EquipmentListItemViewModel, EquipmentTone } from './equipmentViewModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faCheckCircle,
  faClock,
  faClipboardList,
  faExclamationTriangle,
  faHammer,
  faIndustry,
  faStore,
  faTag,
  faWarehouse,
} from '@fortawesome/free-solid-svg-icons';

import { appV2Border, appV2Focus, appV2Shadow, appV2Text } from '../styles/tokens';
import { StatusBadge } from '../ui/primitives';

interface EquipmentCardProps {
  item: EquipmentListItemViewModel;
  onOpen: (equipmentId: string) => void;
}

const accentClasses: Record<EquipmentTone, string> = {
  danger: 'tw-border-l-[#DC2626]',
  warning: 'tw-border-l-[#D97706]',
  success: 'tw-border-l-[#16A34A]',
  primary: 'tw-border-l-[#2563EB]',
};

export function EquipmentCard({ item, onOpen }: EquipmentCardProps) {
  const statusIcon = mapStatusIcon(item.statusTone);
  const nextIcon = mapNextActionIcon(item.nextActionTone, item.nextActionLabel);
  const locationIcon = mapLocationIcon(item.customerLine);

  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className={`tw-flex tw-min-h-[156px] tw-w-full tw-flex-col tw-rounded-2xl tw-border tw-border-l-4 tw-bg-white tw-p-4 tw-text-left tw-transition hover:tw-bg-[#F8FAFC] sm:tw-p-5 ${accentClasses[item.nextActionTone]} ${appV2Border.default} ${appV2Shadow.card} ${appV2Focus}`}
    >
      <span className="tw-flex tw-items-start tw-justify-between tw-gap-3">
        <span className="tw-min-w-0">
          <span className={`tw-block tw-truncate tw-text-base tw-font-bold ${appV2Text.primary}`}>
            {item.name}
          </span>
        </span>
        <StatusBadge tone={item.statusTone} className="tw-shrink-0 tw-gap-1 tw-rounded-full">
          <FontAwesomeIcon icon={statusIcon} className="tw-h-3 tw-w-3" aria-hidden="true" />
          {item.statusLabel}
        </StatusBadge>
      </span>

      <span className="tw-mt-3 tw-grid tw-gap-1.5">
        <span
          className={`tw-flex tw-min-w-0 tw-items-center tw-gap-2 tw-text-xs tw-font-semibold ${appV2Text.muted}`}
        >
          <FontAwesomeIcon icon={locationIcon} className="tw-h-3.5 tw-w-3.5 tw-shrink-0" />
          <span className="tw-min-w-0 tw-truncate">{item.customerLine}</span>
        </span>
        <span
          className={`tw-flex tw-min-w-0 tw-flex-wrap tw-items-center tw-gap-2 tw-text-xs tw-font-semibold ${appV2Text.muted}`}
        >
          <span className="tw-rounded-full tw-bg-[#EFF6FF] tw-px-2 tw-py-1 tw-font-mono tw-text-[0.68rem] tw-font-bold tw-text-[#1E4F8A]">
            {item.metaLine}
          </span>
          <span className="tw-min-w-0 tw-truncate">
            <FontAwesomeIcon icon={faTag} className="tw-mr-1 tw-h-3 tw-w-3" aria-hidden="true" />
            {item.sectorLabel}
          </span>
        </span>
        {item.attachmentLabel ? (
          <span className={`tw-block tw-truncate tw-text-xs tw-font-semibold ${appV2Text.subtle}`}>
            {item.coverAttachmentLabel
              ? `Foto principal: ${item.coverAttachmentLabel}`
              : `Fotos: ${item.attachmentLabel}`}
          </span>
        ) : null}
      </span>

      <span
        className={`tw-mt-3 tw-block tw-border-t tw-border-[#EDF2F7] tw-pt-3 tw-text-xs tw-font-bold ${appV2Text.primary}`}
      >
        <FontAwesomeIcon icon={nextIcon} className="tw-mr-2 tw-h-3.5 tw-w-3.5" aria-hidden="true" />
        Próxima ação: {item.nextActionLabel}
      </span>
    </button>
  );
}

function mapStatusIcon(tone: EquipmentTone) {
  if (tone === 'danger') {
    return faExclamationTriangle;
  }

  if (tone === 'warning') {
    return faClock;
  }

  return faCheckCircle;
}

function mapNextActionIcon(tone: EquipmentTone, label: string) {
  if (tone === 'danger' || label.toLocaleLowerCase('pt-BR').includes('corretiva')) {
    return faHammer;
  }

  if (tone === 'primary') {
    return faClipboardList;
  }

  return faCheck;
}

function mapLocationIcon(customerLine: string) {
  const normalized = customerLine
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

  if (normalized.includes('producao')) {
    return faIndustry;
  }

  if (normalized.includes('estoque') || normalized.includes('camara')) {
    return faWarehouse;
  }

  return faStore;
}
