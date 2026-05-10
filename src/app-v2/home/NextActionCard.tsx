import type { HomeTodayViewModel } from './homeViewModel';
import { appV2Tone } from '../styles/tokens';

interface NextActionCardProps {
  action: HomeTodayViewModel['nextAction'];
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

const toneClasses = {
  danger: appV2Tone.danger,
  warning: appV2Tone.warning,
  primary: 'tw-border-[#B8D2FF] tw-bg-[#F5F9FF] tw-text-[#1D4ED8]',
  calm: 'tw-border-[#D7E3F2] tw-bg-white tw-text-[#0A1328]',
} as const;

export function NextActionCard({
  action,
  onPrimaryAction,
  onSecondaryAction,
}: NextActionCardProps) {
  return (
    <section
      className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 tw-shadow-[0_18px_44px_-32px_rgba(10,19,40,0.42)] ${appV2Tone.border}`}
      aria-labelledby="next-action-title"
    >
      <div
        className={`tw-mb-4 tw-inline-flex tw-rounded-md tw-border tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold tw-uppercase ${toneClasses[action.tone]}`}
      >
        Próxima ação
      </div>

      <h2
        id="next-action-title"
        className={`tw-text-2xl tw-font-black tw-leading-tight ${appV2Tone.text}`}
      >
        {action.title}
      </h2>

      {action.equipmentName ? (
        <p className={`tw-mt-3 tw-text-base tw-font-bold ${appV2Tone.text}`}>
          {action.equipmentName}
        </p>
      ) : null}

      {action.customerLine ? (
        <p className={`tw-mt-1 tw-text-sm tw-font-semibold ${appV2Tone.mutedText}`}>
          {action.customerLine}
        </p>
      ) : null}

      <p className={`tw-mt-4 tw-text-sm tw-font-semibold tw-leading-6 ${appV2Tone.mutedText}`}>
        {action.reason}
      </p>

      <div className="tw-mt-5 tw-flex tw-flex-col tw-gap-3">
        <button
          type="button"
          onClick={onPrimaryAction}
          className={`tw-min-h-12 tw-rounded-lg tw-border-0 tw-px-4 tw-py-3 tw-text-base tw-font-extrabold tw-shadow-[0_16px_30px_-20px_rgba(30,91,255,0.9)] ${appV2Tone.action} ${appV2Tone.focus}`}
        >
          {action.primaryCta}
        </button>
        <button
          type="button"
          onClick={onSecondaryAction}
          className={`tw-self-center tw-border-0 tw-bg-transparent tw-px-3 tw-py-2 tw-text-sm tw-font-bold tw-text-[#1D4ED8] ${appV2Tone.focus}`}
        >
          {action.secondaryAction}
        </button>
      </div>
    </section>
  );
}
