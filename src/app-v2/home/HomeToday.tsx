import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBell,
  faCalendarDays,
  faChartSimple,
  faClipboardList,
  faEye,
  faForwardStep,
  faInfoCircle,
  faLightbulb,
  faPlay,
  faTemperatureLow,
} from '@fortawesome/free-solid-svg-icons';

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
import {
  appV2Border,
  appV2Focus,
  appV2Shadow,
  appV2Status,
  appV2Surface,
  appV2Text,
} from '../styles/tokens';
import {
  ActionButton,
  PageShell,
  SectionCard,
  SectionEyebrow,
  StatusBadge,
} from '../ui/primitives';

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

const quickStatToneClass = {
  danger: appV2Status.danger,
  warning: appV2Status.warning,
  primary: appV2Status.primary,
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
    <PageShell className="tw-gap-6 lg:tw-gap-7">
      <div className="tw-grid tw-gap-6 xl:tw-grid-cols-[minmax(0,1fr)_320px] xl:tw-items-start">
        <div className="tw-flex tw-min-w-0 tw-flex-col tw-gap-6">
          <HomeHeader viewModel={viewModel} />
          <QuickStats stats={viewModel.quickStats} />
          <NextActionPanel
            action={viewModel.nextAction}
            onPrimaryAction={startNextService}
            onSecondaryAction={openNextEquipment}
          />
          <ShortQueuePanel items={viewModel.queue} onOpenItem={onOpenEquipment} />
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

function HomeHeader({ viewModel }: { viewModel: HomeTodayViewModel }) {
  return (
    <header className="tw-min-w-0">
      <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-3">
        <SectionEyebrow>Hoje em CoolTrack</SectionEyebrow>
        <span
          className={`tw-inline-flex tw-items-center tw-gap-2 tw-rounded-full tw-border tw-bg-white tw-px-3 tw-py-1 tw-text-sm tw-font-semibold ${appV2Border.default} ${appV2Text.action}`}
        >
          <FontAwesomeIcon icon={faCalendarDays} className="tw-h-4 tw-w-4" aria-hidden="true" />
          {viewModel.dateLabel}
        </span>
      </div>

      <h1
        className={`tw-m-0 tw-mt-3 tw-text-[1.8rem] tw-font-bold tw-leading-none tw-tracking-tight sm:tw-text-[2rem] ${appV2Text.primary}`}
      >
        {viewModel.title}
      </h1>
      <p className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-semibold ${appV2Text.primary}`}>
        {viewModel.context}
      </p>
      <p
        className={`tw-m-0 tw-mt-1 tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-medium ${appV2Text.subtle}`}
      >
        <FontAwesomeIcon
          icon={faInfoCircle}
          className="tw-h-3.5 tw-w-3.5 tw-shrink-0"
          aria-hidden="true"
        />
        {viewModel.shiftSummary}
      </p>
    </header>
  );
}

function QuickStats({ stats }: { stats: HomeTodayViewModel['quickStats'] }) {
  return (
    <section
      className="tw-grid tw-grid-cols-1 tw-gap-4 sm:tw-grid-cols-3"
      aria-label="Resumo rápido do turno"
    >
      {stats.map((stat) => {
        const tone = quickStatToneClass[stat.tone];

        return (
          <SectionCard
            key={stat.id}
            className="tw-flex tw-min-h-[86px] tw-min-w-0 tw-items-center tw-justify-between tw-gap-3 tw-rounded-2xl"
            padding="sm"
          >
            <span className="tw-min-w-0">
              <span
                className={`tw-block tw-text-2xl tw-font-bold tw-leading-7 ${appV2Text.primary}`}
              >
                {stat.value}
              </span>
              <span className={`tw-mt-1 tw-block tw-text-xs tw-font-medium ${appV2Text.muted}`}>
                {stat.label}
              </span>
            </span>
            <StatusBadge tone={stat.tone} className={`${tone.surface} ${tone.text} tw-shrink-0`}>
              {stat.detail}
            </StatusBadge>
          </SectionCard>
        );
      })}
    </section>
  );
}

function NextActionPanel({
  action,
  onPrimaryAction,
  onSecondaryAction,
}: {
  action: HomeTodayViewModel['nextAction'];
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}) {
  const tone = mapActionTone(action.tone);
  const isDanger = action.tone === 'danger';

  return (
    <SectionCard
      className={`tw-relative tw-grid tw-min-w-0 tw-gap-5 tw-overflow-hidden tw-rounded-2xl tw-border-l-4 tw-p-5 lg:tw-grid-cols-[minmax(0,1fr)_90px] lg:tw-items-center ${tone.borderLeft}`}
      labelledBy="next-action-title"
      padding="sm"
    >
      <div className="tw-min-w-0">
        <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-3">
          <SectionEyebrow>Próxima ação</SectionEyebrow>
          <StatusBadge
            tone={isDanger ? 'danger' : action.tone === 'warning' ? 'warning' : 'primary'}
          >
            {isDanger ? 'Crítico' : action.tone === 'warning' ? 'Atenção' : 'Hoje'}
          </StatusBadge>
        </div>

        <h2
          id="next-action-title"
          className={`tw-m-0 tw-mt-3 tw-text-xl tw-font-bold tw-leading-tight ${appV2Text.primary}`}
        >
          {action.title}
        </h2>
        {action.customerLine ? (
          <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-medium ${appV2Text.muted}`}>
            {action.customerLine}
          </p>
        ) : null}
        <p
          className={`tw-m-0 tw-mt-3 tw-inline-flex tw-rounded-full tw-px-3 tw-py-1 tw-text-xs tw-font-semibold ${tone.soft} ${tone.text}`}
        >
          {action.reason}
        </p>

        <div className="tw-mt-5 tw-flex tw-flex-wrap tw-gap-3">
          <ActionButton
            onClick={onPrimaryAction}
            className="tw-min-h-10 tw-gap-2 tw-rounded-lg tw-px-4 tw-py-2 tw-text-xs"
          >
            <FontAwesomeIcon icon={faPlay} className="tw-h-3.5 tw-w-3.5" aria-hidden="true" />
            Iniciar serviço
          </ActionButton>
          <ActionButton
            onClick={onSecondaryAction}
            variant="secondary"
            className="tw-min-h-10 tw-gap-2 tw-rounded-lg tw-px-4 tw-py-2 tw-text-xs"
          >
            <FontAwesomeIcon icon={faEye} className="tw-h-3.5 tw-w-3.5" aria-hidden="true" />
            {action.secondaryAction}
          </ActionButton>
        </div>
      </div>

      <div
        className="tw-hidden tw-w-20 tw-justify-self-end tw-text-center tw-text-[#60A5FA] tw-opacity-80 lg:tw-block"
        aria-hidden="true"
      >
        <FontAwesomeIcon icon={faTemperatureLow} className="tw-mx-auto tw-h-12 tw-w-12" />
        <span className={`tw-mt-1 tw-block tw-text-[0.6rem] tw-font-semibold ${appV2Text.subtle}`}>
          {action.equipmentVisual.fallbackLabel}
        </span>
      </div>
    </SectionCard>
  );
}

function ShortQueuePanel({
  items,
  onOpenItem,
}: {
  items: HomeTodayViewModel['queue'];
  onOpenItem?: (equipmentId: string) => void;
}) {
  return (
    <section
      className={`tw-overflow-hidden tw-rounded-2xl tw-border tw-bg-white ${appV2Border.default} ${appV2Shadow.card}`}
      aria-labelledby="short-queue-title"
    >
      <div
        className={`tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-b tw-px-5 tw-py-4 ${appV2Border.default}`}
      >
        <h2
          id="short-queue-title"
          className={`tw-m-0 tw-text-base tw-font-bold ${appV2Text.primary}`}
        >
          Fila curta
        </h2>
        <span
          className={`tw-inline-flex tw-items-center tw-gap-1 tw-text-xs tw-font-semibold ${appV2Text.action}`}
        >
          Ver todos
          <FontAwesomeIcon icon={faArrowRight} className="tw-h-3.5 tw-w-3.5" aria-hidden="true" />
        </span>
      </div>

      {items.length === 0 ? (
        <p className={`tw-m-0 tw-px-5 tw-py-4 tw-text-sm tw-font-medium ${appV2Text.muted}`}>
          Fila limpa para hoje. Novos compromissos aparecem aqui quando forem agendados.
        </p>
      ) : (
        <div className={`tw-divide-y tw-divide-[#E5EAF0] ${appV2Border.default}`}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenItem?.(item.equipmentId)}
              className={`tw-grid tw-w-full tw-grid-cols-[minmax(0,1fr)_auto] tw-items-center tw-gap-3 tw-border-0 tw-bg-white tw-px-5 tw-py-3 tw-text-left tw-transition hover:tw-bg-[#F8FAFC] ${appV2Focus}`}
            >
              <span className="tw-min-w-0">
                <span
                  className={`tw-block tw-truncate tw-text-sm tw-font-semibold ${appV2Text.primary}`}
                >
                  {item.title}
                </span>
                <span
                  className={`tw-mt-0.5 tw-block tw-truncate tw-text-xs tw-font-medium ${appV2Text.muted}`}
                >
                  {item.detail}
                </span>
              </span>
              <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
            </button>
          ))}
        </div>
      )}
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
    <aside
      className="tw-flex tw-min-w-0 tw-flex-col tw-gap-5"
      aria-label="Resumo auxiliar do turno"
    >
      <SectionCard padding="sm">
        <SideTitle
          icon={
            <FontAwesomeIcon icon={faChartSimple} className="tw-h-4 tw-w-4" aria-hidden="true" />
          }
        >
          Resumo do turno
        </SideTitle>
        <div className="tw-mt-3 tw-grid tw-gap-2">
          {aside.summary.map((item) => (
            <div
              key={item.id}
              className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-b tw-border-[#EDF2F7] tw-py-1.5 last:tw-border-b-0"
            >
              <span className={`tw-text-sm tw-font-medium ${appV2Text.muted}`}>{item.label}</span>
              <span className={`tw-text-sm tw-font-bold ${appV2Text.primary}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {alerts.length > 0 ? (
        <SectionCard padding="sm">
          <SideTitle
            icon={<FontAwesomeIcon icon={faBell} className="tw-h-4 tw-w-4" aria-hidden="true" />}
          >
            Alertas ativos
          </SideTitle>
          <div className={`tw-mt-3 tw-divide-y tw-divide-[#E5EAF0] ${appV2Border.default}`}>
            {alerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => onOpenAlert?.(alert.equipmentId)}
                className={`tw-w-full tw-border-0 tw-bg-transparent tw-py-3 tw-text-left tw-transition first:tw-pt-0 last:tw-pb-0 hover:tw-text-[#2563EB] ${appV2Focus}`}
              >
                <span className="tw-flex tw-items-start tw-justify-between tw-gap-3">
                  <span className="tw-min-w-0">
                    <span className={`tw-block tw-text-sm tw-font-bold ${appV2Text.primary}`}>
                      {alert.title}
                    </span>
                    <span
                      className={`tw-mt-1 tw-block tw-text-xs tw-font-medium ${appV2Text.muted}`}
                    >
                      {alert.equipmentName}
                    </span>
                    <span
                      className={`tw-mt-0.5 tw-block tw-text-[0.68rem] tw-font-medium ${appV2Text.subtle}`}
                    >
                      {alert.detail}
                    </span>
                  </span>
                  <StatusBadge tone={alert.tone} className="tw-shrink-0">
                    {alert.tone === 'danger' ? 'Crítico' : 'Atenção'}
                  </StatusBadge>
                </span>
              </button>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {aside.nextInQueue ? (
        <SectionCard padding="sm">
          <SideTitle
            icon={
              <FontAwesomeIcon icon={faForwardStep} className="tw-h-4 tw-w-4" aria-hidden="true" />
            }
          >
            Próximo na fila
          </SideTitle>
          <div className={`tw-mt-3 tw-rounded-xl ${appV2Surface.muted} tw-p-3`}>
            <p className={`tw-m-0 tw-truncate tw-text-sm tw-font-bold ${appV2Text.primary}`}>
              {aside.nextInQueue.title}
            </p>
            <p
              className={`tw-m-0 tw-mt-1 tw-truncate tw-text-xs tw-font-medium ${appV2Text.muted}`}
            >
              {aside.nextInQueue.detail}
            </p>
            <StatusBadge tone={aside.nextInQueue.tone} className="tw-mt-2">
              {aside.nextInQueue.status}
            </StatusBadge>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard padding="sm">
        <SideTitle
          icon={<FontAwesomeIcon icon={faLightbulb} className="tw-h-4 tw-w-4" aria-hidden="true" />}
        >
          Lembrete técnico
        </SideTitle>
        <p
          className={`tw-m-0 tw-mt-2 tw-flex tw-gap-2 tw-text-xs tw-font-medium tw-leading-5 ${appV2Text.muted}`}
        >
          <FontAwesomeIcon
            icon={faClipboardList}
            className={`tw-mt-0.5 tw-h-3.5 tw-w-3.5 tw-shrink-0 ${appV2Text.action}`}
            aria-hidden="true"
          />
          {aside.note}
        </p>
      </SectionCard>
    </aside>
  );
}

function SideTitle({ children, icon }: { children: string; icon: ReactNode }) {
  return (
    <h2
      className={`tw-m-0 tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-bold ${appV2Text.primary}`}
    >
      <span className={appV2Text.action}>{icon}</span>
      {children}
    </h2>
  );
}

function mapActionTone(tone: HomeTodayViewModel['nextAction']['tone']) {
  if (tone === 'danger') {
    return {
      borderLeft: 'tw-border-l-[#DC2626]',
      soft: appV2Status.danger.surface,
      text: appV2Status.danger.text,
    };
  }

  if (tone === 'warning') {
    return {
      borderLeft: 'tw-border-l-[#D97706]',
      soft: appV2Status.warning.surface,
      text: appV2Status.warning.text,
    };
  }

  return {
    borderLeft: 'tw-border-l-[#2563EB]',
    soft: appV2Status.primary.surface,
    text: appV2Status.primary.text,
  };
}
