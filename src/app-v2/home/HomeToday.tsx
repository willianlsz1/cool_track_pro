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
import { PageShell, SectionCard, StatusBadge } from '../ui/primitives';

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
    dot: 'tw-bg-[#DC2626]',
    icon: 'tw-bg-[#FEF2F2] tw-text-[#DC2626]',
    badge: 'tw-bg-[#FEF2F2] tw-text-[#DC2626]',
  },
  warning: {
    dot: 'tw-bg-[#D97706]',
    icon: 'tw-bg-[#FFF7ED] tw-text-[#D97706]',
    badge: 'tw-bg-[#FFF7ED] tw-text-[#D97706]',
  },
  primary: {
    dot: 'tw-bg-[#2CC7EA]',
    icon: 'tw-bg-[#ECFEFF] tw-text-[#0891B2]',
    badge: 'tw-bg-[#EFF6FF] tw-text-[#2563EB]',
  },
  success: {
    dot: 'tw-bg-[#16A34A]',
    icon: 'tw-bg-[#F0FDF4] tw-text-[#16A34A]',
    badge: 'tw-bg-[#F0FDF4] tw-text-[#16A34A]',
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
    <PageShell>
      <header className="tw-grid tw-gap-5 lg:tw-grid-cols-[minmax(0,1fr)_minmax(540px,0.86fr)] lg:tw-items-start">
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
            Hoje em CoolTrack
          </p>
          <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-3">
            <h1
              className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-none sm:tw-text-[2rem] ${appV2Tone.text}`}
            >
              {viewModel.title}
            </h1>
            <span
              className={`tw-mt-2 tw-inline-flex tw-items-center tw-gap-2 tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-shadow-[0_16px_36px_-30px_rgba(15,23,42,0.45)] ${appV2Tone.border} ${appV2Tone.text}`}
            >
              <HomeIcon name="calendar" />
              {viewModel.dateLabel}
            </span>
          </div>
          <p className={`tw-m-0 tw-mt-5 tw-text-base tw-font-semibold ${appV2Tone.text}`}>
            {viewModel.context}
          </p>
          <p
            className={`tw-m-0 tw-mt-2 tw-max-w-xl tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}
          >
            {viewModel.shiftSummary}
          </p>
        </div>

        <QuickStats stats={viewModel.quickStats} />
      </header>

      <div className="tw-grid tw-gap-5 lg:tw-grid-cols-[minmax(0,1fr)_336px] lg:tw-items-start">
        <div className="tw-flex tw-min-w-0 tw-flex-col tw-gap-5">
          <NextActionCard
            action={viewModel.nextAction}
            onPrimaryAction={startNextService}
            onSecondaryAction={openNextEquipment}
          />
          <ShortQueue items={viewModel.queue} onOpenItem={onOpenEquipment} />
        </div>

        <HomeAside
          aside={viewModel.aside}
          alerts={viewModel.alerts}
          onOpenAlert={onOpenEquipment}
        />
      </div>
    </PageShell>
  );
}

function QuickStats({ stats }: { stats: HomeTodayViewModel['quickStats'] }) {
  return (
    <section
      className="tw-grid tw-grid-cols-1 tw-gap-3 sm:tw-grid-cols-3"
      aria-label="Resumo rapido do turno"
    >
      {stats.map((stat) => (
        <SectionCard
          key={stat.id}
          className="tw-relative tw-flex tw-min-h-[100px] tw-min-w-0 tw-items-center tw-gap-4"
          padding="sm"
        >
          <span
            className={`tw-absolute tw-right-4 tw-top-4 tw-h-2 tw-w-2 tw-rounded-full ${statToneClasses[stat.tone].dot}`}
            aria-hidden="true"
          />
          <span
            className={`tw-grid tw-h-11 tw-w-11 tw-shrink-0 tw-place-items-center tw-rounded-2xl ${statToneClasses[stat.tone].icon}`}
            aria-hidden="true"
          >
            <HomeIcon name={stat.icon} />
          </span>
          <span className="tw-min-w-0">
            <span className={`tw-block tw-text-2xl tw-font-bold tw-leading-7 ${appV2Tone.text}`}>
              {stat.value}
            </span>
            <span
              className={`tw-block tw-text-sm tw-font-medium tw-leading-5 ${appV2Tone.mutedText}`}
            >
              {stat.detail}
            </span>
          </span>
        </SectionCard>
      ))}
    </section>
  );
}

function HomeAside({
  aside,
  alerts,
  onOpenAlert,
}: {
  aside: HomeTodayViewModel['aside'];
  alerts: HomeTodayViewModel['alerts'];
  onOpenAlert?: (equipmentId: string) => void;
}) {
  return (
    <aside className="tw-flex tw-flex-col tw-gap-4" aria-label="Resumo auxiliar do turno">
      <SectionCard>
        <h2 className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}>
          Resumo do turno
        </h2>
        <div className="tw-mt-5 tw-flex tw-flex-col tw-gap-5">
          {aside.summary.map((item) => (
            <div key={item.id} className="tw-flex tw-items-center tw-gap-4">
              <span
                className={`tw-grid tw-h-11 tw-w-11 tw-shrink-0 tw-place-items-center tw-rounded-2xl ${statToneClasses[item.tone].icon}`}
                aria-hidden="true"
              >
                <HomeIcon
                  name={item.id === 'overdue' ? 'alert' : item.id === 'done' ? 'check' : 'calendar'}
                />
              </span>
              <span className="tw-min-w-0">
                <span className={`tw-block tw-text-xl tw-font-bold tw-leading-6 ${appV2Tone.text}`}>
                  {item.value}
                </span>
                <span className={`tw-block tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
                  {item.label}
                </span>
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {alerts.length > 0 ? (
        <SectionCard>
          <h2 className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}>
            Alertas ativos
          </h2>
          <div className={`tw-mt-4 tw-divide-y ${appV2Tone.border}`}>
            {alerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => onOpenAlert?.(alert.equipmentId)}
                className="tw-w-full tw-bg-transparent tw-py-4 tw-text-left tw-transition first:tw-pt-0 last:tw-pb-0 hover:tw-text-[#2563EB]"
              >
                <span className="tw-flex tw-items-start tw-justify-between tw-gap-3">
                  <span className="tw-min-w-0">
                    <span className={`tw-block tw-text-sm tw-font-bold ${appV2Tone.text}`}>
                      {alert.title}
                    </span>
                    <span
                      className={`tw-mt-1 tw-block tw-text-xs tw-font-semibold ${appV2Tone.mutedText}`}
                    >
                      {alert.equipmentName}
                    </span>
                    <span
                      className={`tw-mt-2 tw-block tw-text-xs tw-font-medium ${appV2Tone.subtleText}`}
                    >
                      {alert.detail}
                    </span>
                  </span>
                  <StatusBadge tone={alert.tone} className="tw-shrink-0">
                    {alert.tone === 'danger' ? 'Critico' : 'Atencao'}
                  </StatusBadge>
                </span>
              </button>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {aside.nextInQueue ? (
        <SectionCard>
          <h2 className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}>
            Próximo na fila
          </h2>
          <div className="tw-mt-5 tw-flex tw-items-center tw-gap-4">
            <span
              className={`tw-grid tw-h-11 tw-w-11 tw-shrink-0 tw-place-items-center tw-rounded-full ${statToneClasses[aside.nextInQueue.tone].icon}`}
              aria-hidden="true"
            >
              <HomeIcon name="next" />
            </span>
            <div className="tw-min-w-0">
              <p className={`tw-m-0 tw-truncate tw-text-sm tw-font-bold ${appV2Tone.text}`}>
                {aside.nextInQueue.title}
              </p>
              <p
                className={`tw-m-0 tw-mt-1 tw-truncate tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}
              >
                {aside.nextInQueue.detail}
              </p>
              <StatusBadge tone={aside.nextInQueue.tone} className="tw-mt-3">
                {aside.nextInQueue.status}
              </StatusBadge>
            </div>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard>
        <h2 className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}>
          Lembrete técnico
        </h2>
        <p
          className={`tw-m-0 tw-mt-4 tw-text-sm tw-font-normal tw-leading-6 ${appV2Tone.mutedText}`}
        >
          {aside.note}
        </p>
      </SectionCard>
    </aside>
  );
}

function HomeIcon({ name }: { name: HomeTodayViewModel['quickStats'][number]['icon'] | 'check' }) {
  if (name === 'alert') {
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

  if (name === 'check') {
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
        <path d="m8 12 3 3 5-6" />
      </svg>
    );
  }

  if (name === 'next') {
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
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

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
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M4 10h16" />
    </svg>
  );
}
