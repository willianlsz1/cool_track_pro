import { useState } from 'react';

import { DASHBOARD_ACTIONS, DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';

const EMPTY_BLOCKS = Object.freeze({
  criticalNow: { visible: false, count: 0, groups: [] },
  alertsMini: { visible: false, alerts: [] },
  criticalEquipments: { visible: false, equipments: [] },
  recentServices: { visible: false, records: [] },
});

const SAFE_IMAGE_DATA_RE = /^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i;

function items(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function dataValue(value) {
  const normalized = text(value);
  return normalized ? normalized : undefined;
}

function cssToken(value, fallback = 'default') {
  const normalized = text(value, fallback);
  return /^[a-z0-9_-]+$/i.test(normalized) ? normalized : fallback;
}

function safePercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function safeImageSrc(value) {
  const src = text(value).trim();
  if (!src) return '';
  if (SAFE_IMAGE_DATA_RE.test(src)) return src;

  try {
    const url = new URL(src, 'https://cooltrack.local');
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'blob:') {
      return src;
    }
  } catch {
    return '';
  }

  return '';
}

function trendLabel(trend) {
  const delta = Number(trend?.delta || 0);
  if (!trend || trend.trend === 'stable') return { text: '→ estável', modifier: 'stable' };
  if (trend.trend === 'improving') {
    return { text: `↓ ${Math.abs(delta)}`, modifier: 'improving' };
  }
  return { text: `↑ ${delta}`, modifier: 'worsening' };
}

function CriticalNowSection({ block }) {
  const visible = Boolean(block?.visible);
  const groups = items(block?.groups);

  return (
    <section className="dash__section" id={DASHBOARD_PUBLIC_IDS.criticalSection} hidden={!visible}>
      <header className="dash__section-header">
        <span className="dash__section-label">A FAZER AGORA</span>
        <span className="dash__section-count" id={DASHBOARD_PUBLIC_IDS.criticalNowCount}>
          {text(block?.count, '0')}
        </span>
      </header>
      <div id={DASHBOARD_PUBLIC_IDS.criticalNow}>
        {visible &&
          groups.map((group) => {
            const groupItems = items(group.items);
            if (!groupItems.length) return null;
            return (
              <div className="critical-now-group" key={text(group.key, group.label)}>
                <div className="critical-now-group__label">{text(group.label)}</div>
                <div className="critical-now-list">
                  {groupItems.map((item) => (
                    <button
                      className={`critical-now-item critical-now-item--${cssToken(item.tone, 'danger')}`}
                      data-action={dataValue(item.action)}
                      data-id={dataValue(item.id)}
                      key={`${text(item.id)}-${text(item.title)}`}
                      type="button"
                    >
                      <span className="critical-now-item__icon" aria-hidden="true">
                        {text(item.icon, '!')}
                      </span>
                      <span className="critical-now-item__body">
                        <span className="critical-now-item__title">{text(item.title)}</span>
                        {item.subtitle ? (
                          <span className="critical-now-item__subtitle">{text(item.subtitle)}</span>
                        ) : null}
                      </span>
                      <span className="critical-now-item__cta">{text(item.ctaLabel, 'Abrir')}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}

function AlertsMiniSection({ block }) {
  const visible = Boolean(block?.visible);
  const alerts = items(block?.alerts);

  return (
    <section className="dash__section" id={DASHBOARD_PUBLIC_IDS.alertsSection} hidden={!visible}>
      <header className="dash__section-header">
        <span className="dash__section-label">Alertas ativos</span>
      </header>
      <div id={DASHBOARD_PUBLIC_IDS.alertsMini}>
        {visible && alerts.length ? (
          <div className="dash-alertas-list">
            {alerts.map((alert) => (
              <div
                className={`alert-card${alert.critical ? ' alert-card--critical' : ''}`}
                data-action={dataValue(alert.action)}
                data-id={dataValue(alert.id)}
                key={`${text(alert.id)}-${text(alert.title)}`}
                role="listitem"
                tabIndex={0}
              >
                <span className="alert-card__icon">{text(alert.icon, '!')}</span>
                <div className="alert-card__body">
                  <div className="alert-card__equip">{text(alert.equipmentName, '—')}</div>
                  <div className="alert-card__title">{text(alert.title, 'Alerta')}</div>
                  {alert.subtitle ? (
                    <div className="alert-card__sub">{text(alert.subtitle)}</div>
                  ) : null}
                </div>
                <span className="alert-card__action">→ Agir</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div id={DASHBOARD_PUBLIC_IDS.upgradeInlineHint}></div>
    </section>
  );
}

function RiskTrend({ trend }) {
  const label = trendLabel(trend);
  return (
    <span
      aria-label="Tendência de risco"
      className={`equip-card__risk-trend equip-card__risk-trend--${label.modifier}`}
      title="Tendência nos últimos 30 dias"
    >
      {label.text}
    </span>
  );
}

function EquipmentIcon({ visual }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const photoUrl = failed ? '' : safeImageSrc(visual?.photoUrl);
  const tone = cssToken(visual?.tone, 'ok');
  const iconClass = [
    'equip-card__type-icon',
    'equip-card__type-icon--lg',
    photoUrl ? 'equip-card__type-icon--photo' : 'equip-card__type-icon--fallback',
    `equip-card__type-icon--fallback-t${tone}`,
    loaded ? 'equip-card__type-icon--loaded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={iconClass} aria-hidden="true">
      {photoUrl ? (
        <img
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          src={photoUrl}
        />
      ) : null}
      <span className="equip-card__fallback-initials">{text(visual?.initials, 'EQ')}</span>
    </div>
  );
}

function CriticalEquipmentCard({ equipment }) {
  const statusClass = cssToken(equipment.statusClass, 'ok');
  const healthClass = cssToken(equipment.health?.className, 'ok');
  const riskClass = cssToken(equipment.risk?.classification, 'medio');
  const priorityLevel = cssToken(equipment.priority?.level, '1');
  const score = safePercent(equipment.health?.score);

  return (
    <div
      aria-label={text(equipment.ariaLabel, text(equipment.name, 'Equipamento'))}
      className={`equip-card equip-card--${statusClass}`}
      data-action={DASHBOARD_ACTIONS.viewEquip}
      data-id={dataValue(equipment.id)}
      role="listitem"
      tabIndex={0}
    >
      <div className={`equip-card__status-band equip-card__status-band--${statusClass}`}></div>
      <div className="equip-card__header">
        <EquipmentIcon visual={equipment.visual} />
        <div className="equip-card__meta">
          <div
            className={`equip-card__name${statusClass === 'danger' ? ' equip-card__name--danger' : ''}`}
          >
            {text(equipment.name, '—')}
          </div>
          <div className="equip-card__tag">{text(equipment.meta)}</div>
        </div>
        <span className={`equip-card__status equip-card__status--${statusClass}`}>
          <span className={`status-dot status-dot--${statusClass}`}></span>
          {text(equipment.statusLabel)}
        </span>
      </div>
      <div className="equip-card__health">
        <div className="equip-card__health-bar">
          <div
            className={`equip-card__health-fill equip-card__health-fill--${healthClass}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <div className="equip-card__health-meta">
          <span className="equip-card__health-label">Eficiência</span>
          <span className={`equip-card__health-value equip-card__health-value--${healthClass}`}>
            {score}%
          </span>
        </div>
      </div>
      <div className="equip-card__risk">
        <span className={`equip-card__risk-badge equip-card__risk-badge--${riskClass}`}>
          {text(equipment.risk?.label)}
        </span>
        <span className="equip-card__risk-score">Score {text(equipment.risk?.score, '0')}</span>
        <RiskTrend trend={equipment.risk?.trend} />
      </div>
      <div className="equip-card__priority">
        <span className={`equip-card__priority-badge equip-card__priority-badge--${priorityLevel}`}>
          {text(equipment.priority?.label)}
        </span>
      </div>
      <div className="equip-card__metrics">
        <div className="equip-card__metric">
          <div className="equip-card__metric-label">Última manutenção</div>
          <div className="equip-card__metric-value">
            {equipment.metrics?.lastLabel ? (
              text(equipment.metrics.lastLabel)
            ) : (
              <span className="equip-card__metric-empty">Nenhum registro</span>
            )}
          </div>
          {equipment.metrics?.lastType ? (
            <div className="equip-card__metric-sub">{text(equipment.metrics.lastType)}</div>
          ) : null}
        </div>
        <div className="equip-card__metric">
          <div className="equip-card__metric-label">Próxima prev.</div>
          <div
            className={`equip-card__metric-value ${cssToken(equipment.metrics?.nextClass, 'equip-card__metric-value--muted')}`}
          >
            {equipment.metrics?.nextIcon ? <span>{text(equipment.metrics.nextIcon)} </span> : null}
            {text(equipment.metrics?.nextLabel, '—')}
          </div>
        </div>
      </div>
      <div className="equip-card__footer">
        <button
          className="equip-card__cta"
          data-action={DASHBOARD_ACTIONS.goRegisterEquip}
          data-id={dataValue(equipment.id)}
          type="button"
        >
          {text(equipment.ctaLabel, 'Registrar serviço →')}
        </button>
      </div>
    </div>
  );
}

function CriticalEquipmentsSection({ block }) {
  const visible = Boolean(block?.visible);
  const equipments = items(block?.equipments);

  return (
    <section className="dash__section" id={DASHBOARD_PUBLIC_IDS.criticosSection} hidden={!visible}>
      <header className="dash__section-header">
        <span className="dash__section-label">Equipamentos com ocorrência</span>
      </header>
      <div id={DASHBOARD_PUBLIC_IDS.criticos}>
        {visible && equipments.length ? (
          <div className="dash-criticos-list">
            {equipments.map((equipment) => (
              <CriticalEquipmentCard equipment={equipment} key={text(equipment.id)} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function RecentServicesSection({ block }) {
  const visible = Boolean(block?.visible);
  const records = items(block?.records);

  return (
    <section className="dash__section" id={DASHBOARD_PUBLIC_IDS.recentesSection} hidden={!visible}>
      <header className="dash__section-header">
        <span className="dash__section-label">Últimos serviços</span>
      </header>
      <div id={DASHBOARD_PUBLIC_IDS.recentes}>
        {visible && records.length ? (
          <div className="dash-recentes-grid">
            {records.map((record) => (
              <article className="card recent-card" data-nav="historico" key={text(record.id)}>
                <div className="recent-card__date">{text(record.dateLabel)}</div>
                <div className="recent-card__title">{text(record.title)}</div>
                <div className="recent-card__equip">{text(record.context, '—')}</div>
                <div className="recent-card__obs">{text(record.obs)}</div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function DashboardReadOnlyBlocks({ readOnlyBlocks = EMPTY_BLOCKS }) {
  const model = {
    ...EMPTY_BLOCKS,
    ...(readOnlyBlocks || {}),
  };

  return (
    <>
      <CriticalNowSection block={model.criticalNow} />
      <AlertsMiniSection block={model.alertsMini} />
      <CriticalEquipmentsSection block={model.criticalEquipments} />
      <RecentServicesSection block={model.recentServices} />
    </>
  );
}
