import { useMemo } from 'react';

import { NextActionCard } from './NextActionCard';
import { ShortQueue } from './ShortQueue';
import {
  mockHomeClientes,
  mockHomeCompromissos,
  mockHomeEquipamentos,
  mockHomeRegistros,
  mockHomeToday,
} from './mockHomeData';
import {
  buildHomeTodayViewModel,
  type BuildHomeTodayViewModelInput,
  type HomeTodayViewModel,
} from './homeViewModel';
import { appV2Tone } from '../styles/tokens';

const defaultHomeInput: BuildHomeTodayViewModelInput = {
  today: mockHomeToday,
  clientes: mockHomeClientes,
  equipamentos: mockHomeEquipamentos,
  compromissos: mockHomeCompromissos,
  registros: mockHomeRegistros,
};

interface HomeTodayProps {
  input?: BuildHomeTodayViewModelInput;
  onOpenEquipment?: (equipmentId: string) => void;
  onStartService?: (equipmentId: string) => void;
}

const statToneClasses = {
  danger: {
    icon: 'tw-bg-[#FDE2E6] tw-text-[#DC2626]',
    badge: 'tw-bg-[#FEF2F2] tw-text-[#B91C1C]',
  },
  warning: {
    icon: 'tw-bg-[#FFF1DD] tw-text-[#C2410C]',
    badge: 'tw-bg-[#FFF7ED] tw-text-[#9A3412]',
  },
  primary: {
    icon: 'tw-bg-[#E6F0FF] tw-text-[#1D4ED8]',
    badge: 'tw-bg-[#E6F0FF] tw-text-[#1D4ED8]',
  },
  success: {
    icon: 'tw-bg-[#DCFCE7] tw-text-[#15803D]',
    badge: 'tw-bg-[#ECFDF3] tw-text-[#15803D]',
  },
} as const;

export function HomeToday({ input, onOpenEquipment, onStartService }: HomeTodayProps) {
  const viewModel = useMemo(() => buildHomeTodayViewModel(input ?? defaultHomeInput), [input]);

  function openNextEquipment() {
    if (viewModel.nextAction.equipmentId) {
      onOpenEquipment?.(viewModel.nextAction.equipmentId);
    }
  }

  function startNextService() {
    if (viewModel.nextAction.equipmentId) {
      onStartService?.(viewModel.nextAction.equipmentId);
    }
  }

  return (
    <main className="tw-mx-auto tw-box-border tw-flex tw-min-h-screen tw-w-full tw-max-w-[1220px] tw-flex-col tw-gap-4 tw-px-4 tw-pb-48 tw-pt-4 sm:tw-px-6 lg:tw-gap-5 lg:tw-px-8 lg:tw-pb-44 lg:tw-pt-6">
      <header
        className={`tw-rounded-2xl tw-border tw-bg-white/90 tw-px-4 tw-py-3.5 tw-shadow-[0_18px_42px_-36px_rgba(10,19,40,0.65)] sm:tw-px-5 sm:tw-py-4 lg:tw-py-3 ${appV2Tone.border}`}
      >
        <div className="tw-flex tw-items-center tw-justify-between tw-gap-4">
          <div className="tw-flex tw-min-w-0 tw-items-center tw-gap-3">
            <img
              src="/icons/icon-192x192.png"
              alt=""
              className="tw-h-9 tw-w-9 tw-shrink-0 tw-rounded-xl"
              aria-hidden="true"
            />
            <div className="tw-min-w-0">
              <p className={`tw-m-0 tw-truncate tw-text-sm tw-font-black ${appV2Tone.text}`}>
                CoolTrack Pro
              </p>
              <p className={`tw-m-0 tw-text-xs tw-font-black tw-text-[#1D4ED8]`}>app-v2</p>
            </div>
          </div>

          <div className="tw-flex tw-shrink-0 tw-items-center tw-gap-3">
            <span
              className={`tw-hidden tw-text-xs tw-font-bold sm:tw-inline ${appV2Tone.mutedText}`}
            >
              Hoje
            </span>
            <span
              className={`tw-rounded-full tw-border tw-bg-white tw-px-3 tw-py-1.5 tw-text-sm tw-font-black ${appV2Tone.border} ${appV2Tone.text}`}
            >
              {viewModel.dateLabel}
            </span>
          </div>
        </div>

        <div className="tw-mt-3 tw-flex tw-flex-col tw-gap-3 lg:tw-mt-3 lg:tw-flex-row lg:tw-items-center lg:tw-justify-between">
          <div className="tw-min-w-0">
            <h1
              className={`tw-m-0 tw-text-[1.85rem] tw-font-black tw-leading-none sm:tw-text-3xl ${appV2Tone.text}`}
            >
              {viewModel.title}
            </h1>
            <p className={`tw-m-0 tw-mt-1.5 tw-text-base tw-font-black ${appV2Tone.text}`}>
              {viewModel.context}
            </p>
            <p
              className={`tw-m-0 tw-mt-1.5 tw-hidden tw-max-w-2xl tw-text-sm tw-font-semibold tw-leading-5 sm:tw-block ${appV2Tone.mutedText}`}
            >
              {viewModel.shiftSummary}
            </p>
          </div>

          <QuickStats stats={viewModel.quickStats} />
        </div>
      </header>

      <div className="tw-grid tw-gap-4 lg:tw-grid-cols-[minmax(0,2.25fr)_minmax(280px,0.8fr)] lg:tw-items-start">
        <div className="tw-flex tw-min-w-0 tw-flex-col tw-gap-4">
          <NextActionCard
            action={viewModel.nextAction}
            onPrimaryAction={startNextService}
            onSecondaryAction={openNextEquipment}
          />
          <ShortQueue items={viewModel.queue} onOpenItem={onOpenEquipment} />
        </div>

        <HomeAside aside={viewModel.aside} />
      </div>
    </main>
  );
}

function QuickStats({ stats }: { stats: HomeTodayViewModel['quickStats'] }) {
  return (
    <section
      className={`tw-grid tw-grid-cols-3 tw-gap-1.5 tw-rounded-2xl tw-border tw-bg-white tw-p-2.5 sm:tw-min-w-[440px] sm:tw-gap-3 sm:tw-p-3 ${appV2Tone.border}`}
      aria-label="Resumo rápido do turno"
    >
      {stats.map((stat) => (
        <div key={stat.id} className="tw-flex tw-min-w-0 tw-items-center tw-gap-1.5 sm:tw-gap-3">
          <span
            className={`tw-grid tw-h-8 tw-w-8 tw-shrink-0 tw-place-items-center tw-rounded-full sm:tw-h-9 sm:tw-w-9 ${statToneClasses[stat.tone].icon}`}
            aria-hidden="true"
          >
            <HomeIcon name={stat.icon} />
          </span>
          <span className="tw-min-w-0">
            <span
              className={`tw-block tw-text-sm tw-font-black tw-leading-4 sm:tw-text-base sm:tw-leading-5 ${appV2Tone.text}`}
            >
              {stat.value}
            </span>
            <span
              className={`tw-block tw-text-[0.68rem] tw-font-bold tw-leading-3 sm:tw-text-xs sm:tw-leading-4 ${appV2Tone.mutedText}`}
            >
              {stat.detail}
            </span>
          </span>
        </div>
      ))}
    </section>
  );
}

function HomeAside({ aside }: { aside: HomeTodayViewModel['aside'] }) {
  return (
    <aside
      className="tw-hidden tw-flex-col tw-gap-4 lg:tw-flex"
      aria-label="Resumo auxiliar do turno"
    >
      <section className={`tw-rounded-2xl tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
        <h2 className={`tw-m-0 tw-text-base tw-font-black ${appV2Tone.text}`}>Resumo do turno</h2>
        <div className="tw-mt-5 tw-flex tw-flex-col tw-gap-4">
          {aside.summary.map((item) => (
            <div key={item.id} className="tw-flex tw-items-center tw-gap-3">
              <span
                className={`tw-grid tw-h-10 tw-w-10 tw-shrink-0 tw-place-items-center tw-rounded-full ${statToneClasses[item.tone].icon}`}
                aria-hidden="true"
              >
                <HomeIcon
                  name={item.id === 'overdue' ? 'alert' : item.id === 'done' ? 'check' : 'calendar'}
                />
              </span>
              <span className="tw-min-w-0">
                <span
                  className={`tw-block tw-text-lg tw-font-black tw-leading-5 ${appV2Tone.text}`}
                >
                  {item.value}
                </span>
                <span className={`tw-block tw-text-xs tw-font-bold ${appV2Tone.mutedText}`}>
                  {item.label}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {aside.nextInQueue ? (
        <section className={`tw-rounded-2xl tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
          <h2 className={`tw-text-base tw-font-black ${appV2Tone.text}`}>Próximo na fila</h2>
          <div className="tw-mt-4 tw-flex tw-items-center tw-gap-3">
            <span
              className={`tw-grid tw-h-10 tw-w-10 tw-shrink-0 tw-place-items-center tw-rounded-full ${statToneClasses[aside.nextInQueue.tone].icon}`}
              aria-hidden="true"
            >
              <HomeIcon name="next" />
            </span>
            <div className="tw-min-w-0">
              <p className={`tw-m-0 tw-truncate tw-text-sm tw-font-black ${appV2Tone.text}`}>
                {aside.nextInQueue.title}
              </p>
              <p
                className={`tw-m-0 tw-mt-1 tw-truncate tw-text-xs tw-font-bold ${appV2Tone.mutedText}`}
              >
                {aside.nextInQueue.detail}
              </p>
              <span
                className={`tw-mt-2 tw-inline-flex tw-rounded-md tw-px-2 tw-py-1 tw-text-xs tw-font-black ${statToneClasses[aside.nextInQueue.tone].badge}`}
              >
                {aside.nextInQueue.status}
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <section className="tw-rounded-2xl tw-border tw-border-[#D7E3F2] tw-bg-[#F8FBFF] tw-p-4">
        <h2 className={`tw-text-sm tw-font-black ${appV2Tone.text}`}>Lembrete técnico</h2>
        <p className={`tw-mt-2 tw-text-sm tw-font-semibold tw-leading-6 ${appV2Tone.mutedText}`}>
          {aside.note}
        </p>
      </section>
    </aside>
  );
}

function HomeIcon({ name }: { name: HomeTodayViewModel['quickStats'][number]['icon'] | 'check' }) {
  if (name === 'alert') {
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

  if (name === 'check') {
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
        <path d="m8 12 3 3 5-6" />
      </svg>
    );
  }

  if (name === 'next') {
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
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
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
