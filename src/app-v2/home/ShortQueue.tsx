import type { HomeTodayViewModel } from './homeViewModel';
import { appV2Tone } from '../styles/tokens';
import { ListRow, StatusBadge } from '../ui/primitives';

interface ShortQueueProps {
  items: HomeTodayViewModel['queue'];
  onOpenItem?: (equipmentId: string) => void;
}

const statusClasses = {
  danger: {
    badge: 'tw-bg-[#FEF2F2] tw-text-[#DC2626]',
    icon: 'tw-bg-[#FEF2F2] tw-text-[#DC2626]',
  },
  warning: {
    badge: 'tw-bg-[#FFF7ED] tw-text-[#D97706]',
    icon: 'tw-bg-[#FFF7ED] tw-text-[#D97706]',
  },
  primary: {
    badge: 'tw-bg-[#EFF6FF] tw-text-[#2563EB]',
    icon: 'tw-bg-[#ECFEFF] tw-text-[#0891B2]',
  },
} as const;

export function ShortQueue({ items, onOpenItem }: ShortQueueProps) {
  return (
    <section
      className={`tw-overflow-hidden tw-rounded-2xl tw-border tw-bg-white tw-shadow-[0_20px_52px_-40px_rgba(15,23,42,0.46)] ${appV2Tone.border}`}
      aria-labelledby="short-queue-title"
    >
      <div className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-b tw-border-[#E5EAF0] tw-px-4 tw-py-4 sm:tw-px-5">
        <h2
          id="short-queue-title"
          className={`tw-m-0 tw-flex tw-items-center tw-gap-2 tw-text-base tw-font-semibold ${appV2Tone.text}`}
        >
          <span className="tw-h-2 tw-w-2 tw-rounded-full tw-bg-[#2CC7EA]" aria-hidden="true" />
          Fila curta
        </h2>
        <span className="tw-text-sm tw-font-semibold tw-text-[#2563EB]">Ver todos</span>
      </div>

      {items.length === 0 ? (
        <div className={`tw-p-5 tw-text-sm tw-font-medium tw-leading-6 ${appV2Tone.mutedText}`}>
          Fila limpa para hoje. Novos compromissos aparecem aqui quando forem agendados.
        </div>
      ) : (
        <div className="tw-divide-y tw-divide-[#E5EAF0]">
          {items.map((item) => {
            const tone = statusClasses[item.tone];

            return (
              <ListRow
                key={item.id}
                onClick={() => onOpenItem?.(item.equipmentId)}
                interactive
                className="tw-grid tw-grid-cols-[36px_minmax(0,1fr)_auto_16px] tw-items-center tw-gap-3 tw-px-4 sm:tw-px-5"
              >
                <span
                  className={`tw-grid tw-h-9 tw-w-9 tw-shrink-0 tw-place-items-center tw-rounded-full ${tone.icon}`}
                  aria-hidden="true"
                >
                  <QueueIcon kind={item.iconLabel} tone={item.tone} />
                </span>

                <span className="tw-min-w-0">
                  <span
                    className={`tw-block tw-truncate tw-text-sm tw-font-bold ${appV2Tone.text}`}
                  >
                    {item.title}
                  </span>
                  <span
                    className={`tw-mt-1 tw-block tw-truncate tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}
                  >
                    {item.detail}
                  </span>
                </span>

                <StatusBadge tone={item.tone} className="tw-shrink-0">
                  {item.status}
                </StatusBadge>
                <span className={`tw-shrink-0 tw-text-xl tw-font-semibold ${appV2Tone.mutedText}`}>
                  ›
                </span>
              </ListRow>
            );
          })}
        </div>
      )}
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
