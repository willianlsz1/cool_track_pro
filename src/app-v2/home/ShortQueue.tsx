import type { HomeTodayViewModel } from './homeViewModel';
import { appV2Tone } from '../styles/tokens';

interface ShortQueueProps {
  items: HomeTodayViewModel['queue'];
}

const statusClasses = {
  danger: appV2Tone.danger,
  warning: appV2Tone.warning,
  primary: appV2Tone.actionSoft,
} as const;

export function ShortQueue({ items }: ShortQueueProps) {
  return (
    <section className="tw-mt-5" aria-labelledby="short-queue-title">
      <div className="tw-mb-3 tw-flex tw-items-center tw-justify-between tw-gap-3">
        <h2 id="short-queue-title" className={`tw-text-lg tw-font-black ${appV2Tone.text}`}>
          Fila curta
        </h2>
        <button
          type="button"
          className={`tw-border-0 tw-bg-transparent tw-px-2 tw-py-1 tw-text-sm tw-font-bold tw-text-[#1D4ED8] ${appV2Tone.focus}`}
        >
          Ver todos
        </button>
      </div>

      <div className="tw-flex tw-flex-col tw-gap-2">
        {items.length === 0 ? (
          <div
            className={`tw-rounded-lg tw-border tw-bg-white tw-p-4 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.mutedText}`}
          >
            Nenhum item pendente na fila de hoje.
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`tw-flex tw-w-full tw-items-center tw-justify-between tw-gap-3 tw-rounded-lg tw-border tw-bg-white tw-p-4 tw-text-left tw-shadow-[0_10px_26px_-24px_rgba(10,19,40,0.55)] ${appV2Tone.border} ${appV2Tone.focus}`}
            >
              <span className="tw-min-w-0">
                <span
                  className={`tw-block tw-truncate tw-text-sm tw-font-extrabold ${appV2Tone.text}`}
                >
                  {item.title}
                </span>
                <span
                  className={`tw-mt-1 tw-block tw-truncate tw-text-xs tw-font-semibold ${appV2Tone.mutedText}`}
                >
                  {item.detail}
                </span>
              </span>
              <span
                className={`tw-shrink-0 tw-rounded-md tw-border tw-px-2 tw-py-1 tw-text-xs tw-font-bold ${statusClasses[item.tone]}`}
              >
                {item.status}
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
