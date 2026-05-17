import type {
  AccountDensityPreference,
  AccountPreferencesState,
  AccountShortcutId,
  AccountStartTabPreference,
} from './accountViewModel';
import { buildAccountViewModel } from './accountViewModel';
import { appV2Tone } from '../styles/tokens';
import { ActionButton, PageShell, SectionCard, StatusBadge } from '../ui/primitives';

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
        <header className="tw-grid tw-gap-5 lg:tw-grid-cols-[minmax(0,1fr)_minmax(280px,0.36fr)] lg:tw-items-end">
          <div className="tw-min-w-0">
            <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
              {viewModel.subtitle}
            </p>
            <h1
              className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-none sm:tw-text-[2rem] ${appV2Tone.text}`}
            >
              {viewModel.title}
            </h1>
            <p
              className={`tw-m-0 tw-mt-3 tw-break-words tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}
            >
              {viewModel.description}
            </p>
          </div>
          <SectionCard padding="sm" label="Resumo das preferências locais">
            <span className={`tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
              Preferências locais
            </span>
            <span className={`tw-mt-1 tw-block tw-text-2xl tw-font-bold ${appV2Tone.text}`}>
              {viewModel.preferences.density.valueLabel}
            </span>
            <ActionButton
              variant="ghost"
              className="tw-mt-4 tw-w-full"
              onClick={() => onOpenStartTab(preferences.startTab)}
            >
              {viewModel.preferences.startTab.actionLabel}
            </ActionButton>
          </SectionCard>
        </header>

        {viewModel.preferences.reminder.banner ? (
          <SectionCard padding="sm" label="Lembrete local de conta">
            <p className={`tw-m-0 tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
              {viewModel.preferences.reminder.banner}
            </p>
          </SectionCard>
        ) : null}

        <SectionCard padding="sm" labelledBy="account-empty-state-title">
          <div className="tw-grid tw-gap-2 sm:tw-grid-cols-[minmax(0,1fr)_minmax(220px,0.42fr)] sm:tw-items-center">
            <div className="tw-min-w-0">
              <h2
                id="account-empty-state-title"
                className={`tw-m-0 tw-text-lg tw-font-semibold ${appV2Tone.text}`}
              >
                {viewModel.emptyState.title}
              </h2>
              <p className={`tw-m-0 tw-mt-1 tw-break-words tw-text-sm ${appV2Tone.mutedText}`}>
                {viewModel.emptyState.description}
              </p>
            </div>
            <div
              className={`tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-p-3 tw-text-sm ${appV2Tone.border}`}
            >
              <span className={`tw-block tw-font-bold ${appV2Tone.text}`}>
                {viewModel.localBoundary.title}
              </span>
              <span className={`tw-mt-1 tw-block tw-break-words ${appV2Tone.mutedText}`}>
                {viewModel.localBoundary.description}
              </span>
            </div>
          </div>
        </SectionCard>

        {viewModel.shortcutGroups.map((group) => (
          <SectionCard key={group.title} labelledBy="account-shortcuts-title" padding="sm">
            <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
              <h2
                id="account-shortcuts-title"
                className={`tw-m-0 tw-text-lg tw-font-semibold ${appV2Tone.text}`}
              >
                {group.title}
              </h2>
              <StatusBadge>{group.items.length}</StatusBadge>
            </div>
            <div className="tw-mt-4 tw-grid tw-gap-3 sm:tw-grid-cols-2">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-account-shortcut={item.id}
                  onClick={() => onShortcut(item.id)}
                  className={`tw-min-w-0 tw-break-words tw-rounded-xl tw-border tw-bg-white tw-p-4 tw-text-left ${appV2Tone.border} ${appV2Tone.focus}`}
                >
                  <span className={`tw-block tw-text-sm tw-font-bold ${appV2Tone.text}`}>
                    {item.label}
                  </span>
                  <span className={`tw-mt-1 tw-block tw-text-sm ${appV2Tone.mutedText}`}>
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </SectionCard>
        ))}

        <SectionCard labelledBy="account-preferences-title">
          <h2
            id="account-preferences-title"
            className={`tw-m-0 tw-text-lg tw-font-semibold ${appV2Tone.text}`}
          >
            Preferências
          </h2>
          <div className="tw-mt-4 tw-grid tw-gap-3 md:tw-grid-cols-3">
            <label className="tw-block">
              <span className="tw-text-sm tw-font-semibold tw-text-[#334155]">
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
                className={`tw-mt-2 tw-min-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
              >
                <option value="confortavel">Confortável</option>
                <option value="compacta">Compacta</option>
              </select>
              <span
                id="account-density-help"
                className={`tw-mt-2 tw-block tw-break-words tw-text-sm ${appV2Tone.mutedText}`}
              >
                {viewModel.preferences.density.valueLabel}
              </span>
            </label>

            <label className="tw-block">
              <span className="tw-text-sm tw-font-semibold tw-text-[#334155]">
                {viewModel.preferences.startTab.label}
              </span>
              <select
                name="account-start-tab"
                value={preferences.startTab}
                aria-describedby="account-start-tab-help"
                onChange={(event) =>
                  onChangePreferences({
                    ...preferences,
                    startTab: event.target.value as AccountStartTabPreference,
                  })
                }
                className={`tw-mt-2 tw-min-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
              >
                <option value="hoje">Hoje</option>
                <option value="equipamento">Equipamentos</option>
                <option value="servicos">Serviços</option>
              </select>
              <span
                id="account-start-tab-help"
                className={`tw-mt-2 tw-block tw-break-words tw-text-sm ${appV2Tone.mutedText}`}
              >
                {viewModel.preferences.startTab.valueLabel}
              </span>
            </label>

            <div className="tw-block">
              <span className="tw-text-sm tw-font-semibold tw-text-[#334155]">
                {viewModel.preferences.reminder.label}
              </span>
              <div className="tw-mt-2">
                <ActionButton
                  variant="secondary"
                  aria-pressed={preferences.reminderEnabled}
                  onClick={() =>
                    onChangePreferences({
                      ...preferences,
                      reminderEnabled: !preferences.reminderEnabled,
                    })
                  }
                >
                  {viewModel.preferences.reminder.valueLabel}
                </ActionButton>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard labelledBy="account-help-title" padding="sm">
          <h2
            id="account-help-title"
            className={`tw-m-0 tw-text-lg tw-font-semibold ${appV2Tone.text}`}
          >
            Ajuda local
          </h2>
          <ul
            className={`tw-m-0 tw-mt-3 tw-grid tw-gap-2 tw-break-words tw-pl-5 tw-text-sm ${appV2Tone.mutedText}`}
          >
            {viewModel.helpItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </PageShell>
  );
}
