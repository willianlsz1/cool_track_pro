import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheckCircle,
  faCircleInfo,
  faExclamationTriangle,
  faMicrochip,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import {
  ActionButton,
  PageShell,
  SectionCard,
  SectionEyebrow,
  StatusBadge,
} from '../ui/primitives';
import {
  buildAlertsViewModel,
  type BuildAlertsViewModelInput,
  type AlertsListItemViewModel,
} from './alertsViewModel';

interface AlertsHomeProps {
  input: BuildAlertsViewModelInput;
  onOpenEquipment: (equipmentId: string) => void;
  onOpenEquipmentList: () => void;
}

export function AlertsHome({ input, onOpenEquipment, onOpenEquipmentList }: AlertsHomeProps) {
  const viewModel = buildAlertsViewModel(input);

  return (
    <PageShell className="tw-mx-auto tw-max-w-5xl">
      <header className="tw-min-w-0">
        <SectionEyebrow className="tw-items-center tw-gap-2">
          <FontAwesomeIcon icon={faBell} aria-hidden="true" />
          {viewModel.subtitle}
        </SectionEyebrow>
        <h1
          className={`tw-m-0 tw-mt-3 tw-text-2xl tw-font-extrabold tw-leading-tight lg:tw-text-3xl ${appV2Tone.text}`}
        >
          {viewModel.title}
        </h1>
        <p className={`tw-m-0 tw-mt-1 tw-text-sm ${appV2Tone.mutedText}`}>
          {viewModel.description}
        </p>
      </header>

      {viewModel.items.length === 0 ? (
        <AlertsEmptyState
          title={viewModel.emptyState.title}
          description={viewModel.emptyState.description}
          actionLabel={viewModel.emptyState.actionLabel}
          onOpenEquipmentList={onOpenEquipmentList}
        />
      ) : (
        <>
          <div className="tw-grid tw-gap-4 sm:tw-grid-cols-3">
            <AlertKpi label="Alertas ativos" value={viewModel.totalAlerts} tone="primary" />
            <AlertKpi label="Críticos" value={viewModel.dangerCount} tone="danger" />
            <AlertKpi label="Atenção" value={viewModel.warningCount} tone="warning" />
          </div>

          <SectionCard labelledBy="alerts-list-title" padding="md">
            <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
              <div>
                <h2
                  id="alerts-list-title"
                  className={`tw-m-0 tw-text-base tw-font-bold ${appV2Tone.text}`}
                >
                  Equipamentos em alerta
                </h2>
                <p className={`tw-m-0 tw-mt-1 tw-text-xs ${appV2Tone.mutedText}`}>
                  Alertas gerados automaticamente a partir do estado local do app-v2.
                </p>
              </div>
              <StatusBadge tone={viewModel.dangerCount > 0 ? 'danger' : 'warning'}>
                {viewModel.totalAlerts} ativos
              </StatusBadge>
            </div>

            <div className="tw-mt-5 tw-grid tw-gap-3">
              {viewModel.items.map((alert) => (
                <AlertRow key={alert.id} alert={alert} onOpenEquipment={onOpenEquipment} />
              ))}
            </div>
          </SectionCard>
        </>
      )}

      <p className={`tw-m-0 tw-text-center tw-text-xs ${appV2Tone.subtleText}`}>
        <FontAwesomeIcon icon={faCircleInfo} className="tw-mr-1" aria-hidden="true" />
        Alertas críticos aparecem aqui automaticamente.
      </p>
    </PageShell>
  );
}

function AlertsEmptyState({
  title,
  description,
  actionLabel,
  onOpenEquipmentList,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onOpenEquipmentList: () => void;
}) {
  return (
    <SectionCard className="tw-p-8 tw-text-center">
      <div className="tw-mx-auto tw-mb-4 tw-flex tw-h-20 tw-w-20 tw-items-center tw-justify-center tw-rounded-full tw-bg-[#F0FDF4]">
        <FontAwesomeIcon icon={faCheckCircle} className="tw-h-10 tw-w-10 tw-text-[#16A34A]" />
      </div>
      <h2 className={`tw-m-0 tw-text-xl tw-font-bold ${appV2Tone.text}`}>{title}</h2>
      <p className={`tw-mx-auto tw-mb-0 tw-mt-2 tw-max-w-md tw-text-sm ${appV2Tone.mutedText}`}>
        {description}
      </p>
      <div className="tw-mt-6">
        <ActionButton size="compact" onClick={onOpenEquipmentList}>
          <FontAwesomeIcon icon={faSearch} aria-hidden="true" />
          {actionLabel}
        </ActionButton>
      </div>
    </SectionCard>
  );
}

function AlertKpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'primary' | 'danger' | 'warning';
}) {
  const valueClass =
    tone === 'danger'
      ? 'tw-text-[#DC2626]'
      : tone === 'warning'
        ? 'tw-text-[#D97706]'
        : appV2Tone.text;

  return (
    <SectionCard padding="sm" className="tw-text-center">
      <p className={`tw-m-0 tw-text-2xl tw-font-extrabold ${valueClass}`}>{value}</p>
      <p className="tw-m-0 tw-mt-1 tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide tw-text-[#1E4F8A]">
        {label}
      </p>
    </SectionCard>
  );
}

function AlertRow({
  alert,
  onOpenEquipment,
}: {
  alert: AlertsListItemViewModel;
  onOpenEquipment: (equipmentId: string) => void;
}) {
  return (
    <article className="tw-rounded-2xl tw-border tw-border-[#E2E8F0] tw-bg-[#F8FAFE] tw-p-4">
      <div className="tw-flex tw-flex-col tw-gap-4 sm:tw-flex-row sm:tw-items-start sm:tw-justify-between">
        <div className="tw-flex tw-min-w-0 tw-gap-3">
          <div
            className={`tw-flex tw-h-11 tw-w-11 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl ${
              alert.tone === 'danger'
                ? 'tw-bg-[#FEF2F2] tw-text-[#DC2626]'
                : 'tw-bg-[#FFFBEB] tw-text-[#D97706]'
            }`}
          >
            <FontAwesomeIcon
              icon={alert.tone === 'danger' ? faExclamationTriangle : faBell}
              aria-hidden="true"
            />
          </div>
          <div className="tw-min-w-0">
            <h3 className={`tw-m-0 tw-text-sm tw-font-bold ${appV2Tone.text}`}>{alert.title}</h3>
            <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-semibold ${appV2Tone.mutedText}`}>
              <FontAwesomeIcon icon={faMicrochip} className="tw-mr-1.5" aria-hidden="true" />
              {alert.equipmentName}
            </p>
            <p className={`tw-m-0 tw-mt-1 tw-text-xs ${appV2Tone.mutedText}`}>
              {alert.contextLine}
            </p>
            <p className={`tw-m-0 tw-mt-2 tw-text-sm ${appV2Tone.text}`}>{alert.detail}</p>
          </div>
        </div>

        <div className="tw-flex tw-shrink-0 tw-flex-wrap tw-items-center tw-gap-2 sm:tw-justify-end">
          <StatusBadge tone={alert.tone}>
            {alert.tone === 'danger' ? 'Crítico' : 'Atenção'}
          </StatusBadge>
          <button
            type="button"
            onClick={() => onOpenEquipment(alert.equipmentId)}
            className={`tw-inline-flex tw-min-h-9 tw-items-center tw-justify-center tw-rounded-xl tw-border tw-border-[#CBD5E1] tw-bg-white tw-px-3 tw-text-xs tw-font-semibold tw-text-[#1E4F8A] ${appV2Tone.focus}`}
          >
            {alert.actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
