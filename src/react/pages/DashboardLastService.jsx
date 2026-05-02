import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';

const EMPTY_LAST_SERVICE = Object.freeze({
  hidden: true,
  title: '—',
  subtitle: '—',
  description: '',
});

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

export function DashboardLastService({ lastService = EMPTY_LAST_SERVICE }) {
  const model = lastService || EMPTY_LAST_SERVICE;

  return (
    <>
      <div className="dash__card-icon" aria-hidden="true">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2.8-2.8 2.8-2.8z" />
        </svg>
      </div>
      <div className="dash__card-body">
        <div className="dash__card-label">{'Último serviço'}</div>
        <div className="dash__card-title" id={DASHBOARD_PUBLIC_IDS.lastServiceTitle}>
          {text(model.title, EMPTY_LAST_SERVICE.title)}
        </div>
        <div className="dash__card-sub" id={DASHBOARD_PUBLIC_IDS.lastServiceSubtitle}>
          {text(model.subtitle, EMPTY_LAST_SERVICE.subtitle)}
        </div>
        <div className="dash__card-desc" id="dash-last-desc">
          {text(model.description, EMPTY_LAST_SERVICE.description)}
        </div>
      </div>
    </>
  );
}
