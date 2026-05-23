import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faBolt,
  faCheckCircle,
  faCircleInfo,
  faClipboardList,
  faFileInvoiceDollar,
  faHome,
  faMicrochip,
  faQuestionCircle,
  faSliders,
  faUsers,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';

import type {
  AccountDensityPreference,
  AccountPreferencesState,
  AccountShortcutId,
  AccountStartTabPreference,
} from './accountViewModel';
import { buildAccountViewModel } from './accountViewModel';
import { appV2Tone } from '../styles/tokens';
import { PageShell, SectionCard } from '../ui/primitives';

interface AccountHomeProps {
  preferences: AccountPreferencesState;
  onShortcut: (shortcut: AccountShortcutId) => void;
  onOpenStartTab: (tab: AccountStartTabPreference) => void;
  onChangePreferences: (preferences: AccountPreferencesState) => void;
}

export function AccountHome({
  preferences,
  onShortcut,
  onOpenStartTab,
  onChangePreferences,
}: AccountHomeProps) {
  const viewModel = buildAccountViewModel(preferences);

  return (
    <PageShell className={viewModel.preferences.density.layoutClassName}>
      <div
        className={`tw-grid ${viewModel.preferences.density.layoutClassName}`}
        data-account-density={preferences.density}
      >
        <header className="tw-min-w-0">
          <h1
            className={`tw-m-0 tw-text-[1.8rem] tw-font-bold tw-leading-tight tw-tracking-[-0.01em] ${appV2Tone.text}`}
          >
            {viewModel.title}
          </h1>
          <p className={`tw-m-0 tw-mt-1 tw-break-words tw-text-sm ${appV2Tone.mutedText}`}>
            {viewModel.description}
          </p>
          <p
            className={`tw-m-0 tw-mt-1 tw-flex tw-items-center tw-gap-1.5 tw-break-words tw-text-xs ${appV2Tone.subtleText}`}
          >
            <FontAwesomeIcon icon={faCircleInfo} className="tw-h-3 tw-w-3" aria-hidden="true" />
            Configurações de interface e navegação rápida.
          </p>
        </header>

        {viewModel.preferences.reminder.banner ? (
          <SectionCard padding="sm" label="Lembrete local de conta">
            <p className={`tw-m-0 tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
              {viewModel.preferences.reminder.banner}
            </p>
          </SectionCard>
        ) : null}

        <SectionCard padding="sm" labelledBy="account-empty-state-title">
          <div className="tw-rounded-2xl tw-bg-[#F8FAFE] tw-p-4 tw-text-center">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="tw-mb-2 tw-h-6 tw-w-6 tw-text-[#16A34A]"
              aria-hidden="true"
            />
            <h2
              id="account-empty-state-title"
              className={`tw-m-0 tw-text-sm tw-font-semibold ${appV2Tone.text}`}
            >
              {viewModel.emptyState.title}
            </h2>
            <p className={`tw-m-0 tw-mt-1 tw-break-words tw-text-xs ${appV2Tone.mutedText}`}>
              {viewModel.emptyState.description}
            </p>
          </div>
        </SectionCard>

        {viewModel.shortcutGroups.map((group) => (
          <SectionCard key={group.title} labelledBy="account-shortcuts-title" padding="sm">
            <CardTitle id="account-shortcuts-title" icon={faBolt} title={group.title} />
            <div className="tw-mt-4 tw-grid tw-gap-3 sm:tw-grid-cols-2">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-account-shortcut={item.id}
                  onClick={() => onShortcut(item.id)}
                  className={`tw-min-w-0 tw-break-words tw-rounded-xl tw-border tw-bg-[#F8FAFE] tw-p-3 tw-text-left ${appV2Tone.border} ${appV2Tone.focus}`}
                >
                  <span
                    className={`tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold ${appV2Tone.text}`}
                  >
                    <FontAwesomeIcon
                      icon={shortcutIconById[item.id]}
                      className="tw-h-3.5 tw-w-3.5"
                      aria-hidden="true"
                    />
                    {item.label}
                  </span>
                  <span className={`tw-mt-1 tw-block tw-text-xs ${appV2Tone.mutedText}`}>
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </SectionCard>
        ))}

        <SectionCard labelledBy="account-preferences-title" padding="sm">
          <CardTitle id="account-preferences-title" icon={faSliders} title="Preferências" />
          <div className="tw-mt-3 tw-divide-y tw-divide-[#EDF2F7]">
            <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
              <span className={`tw-text-sm tw-font-medium ${appV2Tone.text}`}>
                {viewModel.preferences.density.label}
              </span>
              <select
                name="account-density"
                value={preferences.density}
                aria-describedby="account-density-help"
                onChange={(event) =>
                  onChangePreferences({
                    ...preferences,
                    density: event.target.value as AccountDensityPreference,
                  })
                }
                className={`tw-min-h-8 tw-rounded-full tw-border-0 tw-bg-[#EFF6FF] tw-px-3 tw-text-xs tw-font-medium tw-text-[#1E4F8A] ${appV2Tone.focus}`}
              >
                <option value="confortavel">Confortável</option>
                <option value="compacta">Compacta</option>
              </select>
              <span id="account-density-help" className="tw-sr-only">
                {viewModel.preferences.density.valueLabel}
              </span>
            </div>

            <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
              <span className={`tw-text-sm tw-font-medium ${appV2Tone.text}`}>
                {viewModel.preferences.reminder.label}
              </span>
              <button
                type="button"
                aria-pressed={preferences.reminderEnabled}
                onClick={() =>
                  onChangePreferences({
                    ...preferences,
                    reminderEnabled: !preferences.reminderEnabled,
                  })
                }
                className={`tw-relative tw-h-[18px] tw-w-8 tw-rounded-full tw-border-0 ${
                  preferences.reminderEnabled ? 'tw-bg-[#2563EB]' : 'tw-bg-[#CBD5E1]'
                } ${appV2Tone.focus}`}
                aria-label={`${viewModel.preferences.reminder.label}: ${viewModel.preferences.reminder.valueLabel}`}
              >
                <span
                  className={`tw-absolute tw-top-0.5 tw-h-3.5 tw-w-3.5 tw-rounded-full tw-bg-white tw-transition ${
                    preferences.reminderEnabled ? 'tw-right-0.5' : 'tw-left-0.5'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
              <span className={`tw-text-sm tw-font-medium ${appV2Tone.text}`}>Modo escuro</span>
              <span
                className="tw-relative tw-h-[18px] tw-w-8 tw-rounded-full tw-bg-[#CBD5E1]"
                aria-label="Modo escuro indisponível nesta etapa"
                role="img"
              >
                <span
                  className="tw-absolute tw-left-0.5 tw-top-0.5 tw-h-3.5 tw-w-3.5 tw-rounded-full tw-bg-white"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard labelledBy="account-help-title" padding="sm">
          <CardTitle id="account-help-title" icon={faQuestionCircle} title="Ajuda local" />
          <ul
            className={`tw-m-0 tw-mt-3 tw-grid tw-list-none tw-gap-2 tw-break-words tw-p-0 tw-text-xs ${appV2Tone.mutedText}`}
          >
            {viewModel.helpItems.map((item) => (
              <li key={item} className="tw-flex tw-items-start tw-gap-2">
                <FontAwesomeIcon
                  icon={helpIconByText(item)}
                  className="tw-mt-0.5 tw-h-3 tw-w-3 tw-shrink-0 tw-text-[#2563EB]"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard labelledBy="account-sidebar-title" padding="sm">
          <CardTitle id="account-sidebar-title" icon={faClipboardList} title="Sidebar" />
          <div className="tw-mt-3 tw-flex tw-flex-wrap tw-gap-3">
            {startTabOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                name="account-start-tab"
                value={item.value}
                aria-pressed={preferences.startTab === item.value}
                onClick={() => {
                  onChangePreferences({ ...preferences, startTab: item.value });
                  onOpenStartTab(item.value);
                }}
                className={`tw-rounded-full tw-px-3 tw-py-1 tw-text-xs tw-font-medium ${
                  preferences.startTab === item.value
                    ? 'tw-bg-[#1E4F8A] tw-text-white'
                    : 'tw-bg-[#EFF6FF] tw-text-[#1E4F8A]'
                } ${appV2Tone.focus}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}

const shortcutIconById: Record<AccountShortcutId, typeof faClipboardList> = {
  'start-service': faClipboardList,
  'open-clients': faUsers,
  'open-quotes': faFileInvoiceDollar,
  'open-alerts': faBell,
};

const startTabOptions: Array<{ value: AccountStartTabPreference; label: string }> = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'equipamento', label: 'Equipamentos' },
  { value: 'servicos', label: 'Serviços' },
];

interface CardTitleProps {
  id: string;
  icon: typeof faClipboardList;
  title: string;
}

function CardTitle({ id, icon, title }: CardTitleProps) {
  return (
    <h2
      id={id}
      className={`tw-m-0 tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-bold ${appV2Tone.text}`}
    >
      <FontAwesomeIcon icon={icon} className="tw-h-3.5 tw-w-3.5 tw-text-[#2563EB]" />
      {title}
    </h2>
  );
}

function helpIconByText(item: string) {
  if (item.startsWith('Hoje')) {
    return faHome;
  }

  if (item.startsWith('Equipamentos')) {
    return faMicrochip;
  }

  return faWrench;
}
