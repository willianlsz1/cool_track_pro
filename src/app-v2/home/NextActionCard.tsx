import type { HomeTodayViewModel } from './homeViewModel';
import { appV2Tone } from '../styles/tokens';
import { ActionButton, SectionCard } from '../ui/primitives';

interface NextActionCardProps {
  action: HomeTodayViewModel['nextAction'];
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

const toneClasses = {
  danger: {
    accent: 'tw-bg-[#DC2626]',
    badge: 'tw-bg-[#FEF2F2] tw-text-[#DC2626]',
    icon: 'tw-bg-[#FEE2E2] tw-text-[#DC2626]',
    reason: 'tw-text-[#DC2626]',
  },
  warning: {
    accent: 'tw-bg-[#D97706]',
    badge: 'tw-bg-[#FFF7ED] tw-text-[#D97706]',
    icon: 'tw-bg-[#FEF3C7] tw-text-[#D97706]',
    reason: 'tw-text-[#D97706]',
  },
  primary: {
    accent: 'tw-bg-[#2563EB]',
    badge: 'tw-bg-[#EFF6FF] tw-text-[#2563EB]',
    icon: 'tw-bg-[#DBEAFE] tw-text-[#2563EB]',
    reason: 'tw-text-[#2563EB]',
  },
  calm: {
    accent: 'tw-bg-[#64748B]',
    badge: 'tw-bg-[#F1F5F9] tw-text-[#334155]',
    icon: 'tw-bg-[#F1F5F9] tw-text-[#334155]',
    reason: 'tw-text-[#334155]',
  },
} as const;

export function NextActionCard({
  action,
  onPrimaryAction,
  onSecondaryAction,
}: NextActionCardProps) {
  const tone = toneClasses[action.tone];

  return (
    <SectionCard
      className="tw-relative tw-overflow-hidden sm:tw-p-5"
      labelledBy="next-action-title"
      padding="sm"
    >
      <span
        className={`tw-absolute tw-inset-y-0 tw-left-0 tw-w-1 ${tone.accent}`}
        aria-hidden="true"
      />
      <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
        <span className="tw-inline-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold tw-text-[#061635]">
          <span className={`tw-h-2 tw-w-2 tw-rounded-full ${tone.accent}`} aria-hidden="true" />
          Próxima ação
        </span>
        <span className={`tw-hidden tw-text-sm tw-font-semibold sm:tw-inline ${tone.reason}`}>
          {action.reason}
        </span>
      </div>

      <div className="tw-mt-6 tw-grid tw-gap-6 xl:tw-grid-cols-[minmax(0,1fr)_320px] xl:tw-items-center">
        <div className="tw-flex tw-min-w-0 tw-gap-4 sm:tw-gap-5">
          <span
            className={`tw-grid tw-h-12 tw-w-12 tw-shrink-0 tw-place-items-center tw-rounded-full sm:tw-h-14 sm:tw-w-14 ${tone.icon}`}
            aria-hidden="true"
          >
            <AlertIcon />
          </span>

          <div className="tw-min-w-0 tw-flex-1">
            <h2
              id="next-action-title"
              className={`tw-m-0 tw-text-xl tw-font-bold tw-leading-tight sm:tw-text-[1.7rem] ${appV2Tone.text}`}
            >
              {action.title}
            </h2>

            {action.equipmentName ? (
              <p className={`tw-m-0 tw-mt-2 tw-text-base tw-font-semibold ${appV2Tone.text}`}>
                {action.equipmentName}
              </p>
            ) : null}

            {action.customerLine ? (
              <p className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
                {action.customerLine}
              </p>
            ) : null}

            <p className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-semibold ${tone.reason}`}>
              {action.reason}
            </p>
          </div>
        </div>

        <EquipmentVisual visual={action.equipmentVisual} />
      </div>

      <div className="tw-mt-7 tw-grid tw-gap-3 sm:tw-grid-cols-[minmax(0,248px)_minmax(0,216px)]">
        <ActionButton onClick={onPrimaryAction}>Iniciar serviço</ActionButton>
        <ActionButton onClick={onSecondaryAction} variant="secondary">
          {action.secondaryAction}
        </ActionButton>
      </div>
    </SectionCard>
  );
}

function EquipmentVisual({
  visual,
}: {
  visual: HomeTodayViewModel['nextAction']['equipmentVisual'];
}) {
  if (visual.imageUrl) {
    return (
      <div className="tw-hidden tw-h-40 tw-overflow-hidden tw-rounded-2xl tw-border tw-border-[#E5EAF0] tw-bg-[#F6F8FB] xl:tw-block">
        <img
          src={visual.imageUrl}
          alt=""
          className="tw-h-full tw-w-full tw-object-cover"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="tw-hidden tw-h-40 tw-rounded-2xl tw-border tw-border-[#E5EAF0] tw-bg-[linear-gradient(135deg,#F8FAFC_0%,#EEF3FA_100%)] tw-p-5 xl:tw-flex xl:tw-items-center xl:tw-justify-center">
      <div className="tw-flex tw-flex-col tw-items-center tw-gap-3">
        <div className="tw-relative tw-h-[86px] tw-w-[206px] tw-rounded-2xl tw-border tw-border-[#D7E0EC] tw-bg-white tw-shadow-[0_24px_42px_-32px_rgba(15,23,42,0.62)]">
          <span
            className="tw-absolute tw-inset-x-5 tw-bottom-4 tw-h-2 tw-rounded-full tw-bg-[#C7D7F4]"
            aria-hidden="true"
          />
          <span
            className="tw-absolute tw-bottom-3 tw-right-7 tw-h-4 tw-w-8 tw-rounded tw-bg-[#E8F3FF]"
            aria-hidden="true"
          />
          <span
            className="tw-absolute tw-inset-x-0 tw-bottom-0 tw-h-px tw-bg-[#D7E0EC]"
            aria-hidden="true"
          />
        </div>
        <span className={`tw-text-xs tw-font-medium ${appV2Tone.mutedText}`}>
          {visual.fallbackLabel}
        </span>
      </div>
    </div>
  );
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="tw-h-5 tw-w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6" />
      <path d="M12 16h.01" />
    </svg>
  );
}
