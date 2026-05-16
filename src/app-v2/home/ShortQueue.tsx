import type { HomeTodayViewModel } from './homeViewModel';
import { appV2Tone } from '../styles/tokens';

interface ShortQueueProps {
  items: HomeTodayViewModel['queue'];
  onOpenItem?: (equipmentId: string) => void;
}

const statusClasses = {
  danger: {
    badge: 'tw-bg-[#FEF2F2] tw-text-[#B91C1C]',
    icon: 'tw-bg-[#FDE2E6] tw-text-[#DC2626]',
  },
  warning: {
    badge: 'tw-bg-[#FFF7ED] tw-text-[#9A3412]',
    icon: 'tw-bg-[#FFF1DD] tw-text-[#C2410C]',
  },
  primary: {
    badge: 'tw-bg-[#E6F0FF] tw-text-[#1D4ED8]',
    icon: 'tw-bg-[#E6F0FF] tw-text-[#1D4ED8]',
  },
} as const;

export function ShortQueue({ items, onOpenItem }: ShortQueueProps) {
  return (
    <section aria-labelledby="short-queue-title">
      <div className="tw-mb-3 tw-flex tw-items-center tw-justify-between tw-gap-3">
        <h2 id="short-queue-title" className={`tw-m-0 tw-text-xl tw-font-black ${appV2Tone.text}`}>
          Fila curta
        </h2>
        <span className="tw-text-sm tw-font-black tw-text-[#1D4ED8]">Ver todos</span>
      </div>

      <div
        className={`tw-overflow-hidden tw-rounded-2xl tw-border tw-bg-white ${appV2Tone.border}`}
      >
        {items.length === 0 ? (
          <div className={`tw-p-5 tw-text-sm tw-font-semibold tw-leading-6 ${appV2Tone.mutedText}`}>
            Fila limpa para hoje. Novos compromissos aparecem aqui quando forem agendados.
          </div>
        ) : (
          items.map((item, index) => {
            const tone = statusClasses[item.tone];

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenItem?.(item.equipmentId)}
                className={`tw-flex tw-w-full tw-items-center tw-gap-3 tw-border-0 tw-bg-white tw-p-4 tw-text-left hover:tw-bg-[#F8FBFF] ${index > 0 ? 'tw-border-t tw-border-[#E8EEF6]' : ''} ${appV2Tone.focus}`}
              >
                <span
                  className={`tw-grid tw-h-10 tw-w-10 tw-shrink-0 tw-place-items-center tw-rounded-full ${tone.icon}`}
                  aria-hidden="true"
                >
                  <QueueIcon kind={item.iconLabel} tone={item.tone} />
                </span>

                <span className="tw-min-w-0 tw-flex-1">
                  <span
                    className={`tw-block tw-truncate tw-text-sm tw-font-black ${appV2Tone.text}`}
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
                  className={`tw-shrink-0 tw-rounded-md tw-px-2.5 tw-py-1 tw-text-xs tw-font-black ${tone.badge}`}
                >
                  {item.status}
                </span>
                <span className={`tw-shrink-0 tw-text-lg tw-font-black ${appV2Tone.mutedText}`}>
                  ›
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

function QueueIcon({
  kind,
  tone,
}: {
  kind: HomeTodayViewModel['queue'][number]['iconLabel'];
  tone: HomeTodayViewModel['queue'][number]['tone'];
}) {
  if (tone === 'danger') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="tw-h-4 tw-w-4"
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

  if (kind === 'Corretiva') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="tw-h-4 tw-w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-3 1.5-1.5-1.5 1.5-3z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="tw-h-4 tw-w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M4 10h16" />
    </svg>
  );
}
