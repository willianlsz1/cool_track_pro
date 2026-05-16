import type { HomeTodayViewModel } from './homeViewModel';
import { appV2Tone } from '../styles/tokens';

interface NextActionCardProps {
  action: HomeTodayViewModel['nextAction'];
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

const toneClasses = {
  danger: {
    badge: 'tw-bg-[#FEF2F2] tw-text-[#B91C1C]',
    icon: 'tw-bg-[#FDE2E6] tw-text-[#DC2626]',
    reason: 'tw-text-[#DC2626]',
  },
  warning: {
    badge: 'tw-bg-[#FFF7ED] tw-text-[#9A3412]',
    icon: 'tw-bg-[#FFF1DD] tw-text-[#C2410C]',
    reason: 'tw-text-[#C2410C]',
  },
  primary: {
    badge: 'tw-bg-[#E6F0FF] tw-text-[#1D4ED8]',
    icon: 'tw-bg-[#E6F0FF] tw-text-[#1D4ED8]',
    reason: 'tw-text-[#1D4ED8]',
  },
  calm: {
    badge: 'tw-bg-[#F1F5F9] tw-text-[#31415F]',
    icon: 'tw-bg-[#F1F5F9] tw-text-[#31415F]',
    reason: 'tw-text-[#31415F]',
  },
} as const;

export function NextActionCard({
  action,
  onPrimaryAction,
  onSecondaryAction,
}: NextActionCardProps) {
  const tone = toneClasses[action.tone];

  return (
    <section
      className={`tw-rounded-2xl tw-border tw-bg-white tw-p-3.5 tw-shadow-[0_20px_46px_-38px_rgba(10,19,40,0.7)] sm:tw-p-5 ${appV2Tone.border}`}
      aria-labelledby="next-action-title"
    >
      <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
        <span className={`tw-rounded-md tw-px-2.5 tw-py-1 tw-text-xs tw-font-black ${tone.badge}`}>
          PRÓXIMA AÇÃO
        </span>
        <span className={`tw-hidden tw-text-xs tw-font-black sm:tw-inline ${tone.reason}`}>
          {action.reason}
        </span>
      </div>

      <div className="tw-mt-3.5 tw-grid tw-gap-4 lg:tw-mt-4 lg:tw-grid-cols-[minmax(0,1fr)_180px] lg:tw-items-center">
        <div className="tw-flex tw-min-w-0 tw-gap-3.5 sm:tw-gap-4">
          <span
            className={`tw-grid tw-h-10 tw-w-10 tw-shrink-0 tw-place-items-center tw-rounded-full sm:tw-h-12 sm:tw-w-12 ${tone.icon}`}
            aria-hidden="true"
          >
            <AlertIcon />
          </span>

          <div className="tw-min-w-0 tw-flex-1">
            <h2
              id="next-action-title"
              className={`tw-m-0 tw-text-[1.32rem] tw-font-black tw-leading-tight sm:tw-text-[1.6rem] ${appV2Tone.text}`}
            >
              {action.title}
            </h2>

            {action.equipmentName ? (
              <p className={`tw-m-0 tw-mt-1.5 tw-text-base tw-font-black ${appV2Tone.text}`}>
                {action.equipmentName}
              </p>
            ) : null}

            {action.customerLine ? (
              <p className={`tw-m-0 tw-mt-1.5 tw-text-sm tw-font-semibold ${appV2Tone.mutedText}`}>
                {action.customerLine}
              </p>
            ) : null}

            <p className={`tw-m-0 tw-mt-1.5 tw-text-sm tw-font-black ${tone.reason}`}>
              {action.reason}
            </p>
          </div>
        </div>

        <EquipmentVisual visual={action.equipmentVisual} />
      </div>

      <div className="tw-mt-4 tw-grid tw-gap-2 sm:tw-grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <button
          type="button"
          onClick={onPrimaryAction}
          className={`tw-min-h-11 tw-rounded-lg tw-border-0 tw-px-4 tw-py-2.5 tw-text-base tw-font-extrabold tw-shadow-[0_16px_30px_-22px_rgba(30,91,255,0.95)] ${appV2Tone.action} ${appV2Tone.focus}`}
        >
          Iniciar serviço
        </button>
        <button
          type="button"
          onClick={onSecondaryAction}
          className={`tw-min-h-11 tw-rounded-lg tw-border tw-bg-white tw-px-4 tw-py-2.5 tw-text-base tw-font-extrabold tw-text-[#1D4ED8] ${appV2Tone.border} ${appV2Tone.focus}`}
        >
          {action.secondaryAction}
        </button>
      </div>
    </section>
  );
}

function EquipmentVisual({
  visual,
}: {
  visual: HomeTodayViewModel['nextAction']['equipmentVisual'];
}) {
  if (visual.imageUrl) {
    return (
      <div className="tw-hidden tw-h-28 tw-overflow-hidden tw-rounded-2xl tw-border tw-border-[#D8E2F0] tw-bg-[#F8FBFF] lg:tw-block">
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
    <div className="tw-hidden tw-h-28 tw-rounded-2xl tw-border tw-border-[#D8E2F0] tw-bg-[#F8FBFF] tw-p-4 lg:tw-flex lg:tw-items-center lg:tw-justify-center">
      <div className="tw-flex tw-flex-col tw-items-center tw-gap-3">
        <div className="tw-flex tw-h-14 tw-w-28 tw-items-end tw-justify-center tw-rounded-2xl tw-border tw-border-[#B8D2FF] tw-bg-white tw-pb-3 tw-shadow-[0_18px_28px_-24px_rgba(10,19,40,0.7)]">
          <span className="tw-h-2 tw-w-16 tw-rounded-full tw-bg-[#1E5BFF]/25" aria-hidden="true" />
        </div>
        <span className={`tw-text-xs tw-font-black ${appV2Tone.mutedText}`}>
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
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6" />
      <path d="M12 16h.01" />
    </svg>
  );
}
