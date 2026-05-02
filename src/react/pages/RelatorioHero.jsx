import {
  RELATORIO_PUBLIC_IDS,
  RELATORIO_VIEW_MODES,
} from '../../ui/viewModels/relatorioContracts.js';

const DEFAULT_HERO = Object.freeze({
  brand: 'Relatório rápido',
  title: 'Resumo dos serviços',
  metaText: 'Todo o período · Todos os equipamentos',
  emittedAt: '',
  narrativeText: '',
  viewMode: RELATORIO_VIEW_MODES.compact,
  kpis: [
    {
      key: 'records',
      icon: 'clipboardCheck',
      iconTone: 'cyan',
      value: '0',
      label: 'Registros',
      ariaLabel: 'Registros: 0',
    },
  ],
});

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function Icon({ name, size = 14 }) {
  switch (name) {
    case 'dollarSign':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v18" />
          <path d="M16 7H10a2.5 2.5 0 0 0 0 5h4a2.5 2.5 0 0 1 0 5H8" />
        </svg>
      );
    case 'shieldCheck':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'calendarClock':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="14" height="14" rx="2" />
          <path d="M3 9h14M8 3v4M14 3v4" />
          <circle cx="18" cy="18" r="4" />
          <path d="M18 16.5V18l1 1" />
        </svg>
      );
    case 'clipboardCheck':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="6" y="4" width="12" height="17" rx="2" />
          <path d="M9 4h6v3H9z" />
          <path d="M9 13l2 2 4-4" />
        </svg>
      );
  }
}

function ViewModeButton({ mode, active, children }) {
  return (
    <button
      type="button"
      className={classNames('rel-segmented__opt', active ? 'is-active' : '')}
      role="radio"
      aria-checked={active ? 'true' : 'false'}
      data-view-mode={mode}
    >
      {children}
    </button>
  );
}

function Kpi({ item }) {
  const iconTone = text(item?.iconTone, 'cyan');
  const valueClass = classNames('rel-kpi__value', item?.valueClass);

  return (
    <div
      className="rel-kpi"
      aria-label={item?.ariaLabel || undefined}
      title={item?.title || undefined}
    >
      <div className="rel-kpi__row">
        <span className={classNames('rel-kpi__icon', `rel-kpi__icon--${iconTone}`)}>
          <Icon name={item?.icon || 'clipboardCheck'} />
        </span>
        <span className={valueClass}>{text(item?.value, '—')}</span>
      </div>
      <div className="rel-kpi__label">{text(item?.label)}</div>
    </div>
  );
}

export function RelatorioHero({ hero = DEFAULT_HERO }) {
  const data = hero || DEFAULT_HERO;
  const kpis = Array.isArray(data.kpis) && data.kpis.length ? data.kpis : DEFAULT_HERO.kpis;
  const viewMode =
    data.viewMode === RELATORIO_VIEW_MODES.detailed
      ? RELATORIO_VIEW_MODES.detailed
      : RELATORIO_VIEW_MODES.compact;

  return (
    <>
      <div className="rel-hero__brand">
        <span className="rel-hero__brand-ic" aria-hidden="true">
          <Icon name="clipboardCheck" size={14} />
        </span>
        <span className="rel-hero__brand-label">{text(data.brand, DEFAULT_HERO.brand)}</span>
      </div>
      <div className="rel-hero__head">
        <h2 id={RELATORIO_PUBLIC_IDS.heroTitle} className="rel-hero__title">
          {text(data.title, DEFAULT_HERO.title)}
        </h2>
        <div className="rel-segmented" role="radiogroup" aria-label="Modo de visualização">
          <ViewModeButton
            mode={RELATORIO_VIEW_MODES.compact}
            active={viewMode === RELATORIO_VIEW_MODES.compact}
          >
            Compacto
          </ViewModeButton>
          <ViewModeButton
            mode={RELATORIO_VIEW_MODES.detailed}
            active={viewMode === RELATORIO_VIEW_MODES.detailed}
          >
            Detalhado
          </ViewModeButton>
        </div>
      </div>
      <div className="rel-hero__meta">
        <span className="rel-hero__meta-period">{text(data.metaText, DEFAULT_HERO.metaText)}</span>
        {data.emittedAt ? (
          <span className="rel-hero__emitted" aria-label={`Emitido em ${text(data.emittedAt)}`}>
            Emitido em {text(data.emittedAt)}
          </span>
        ) : null}
      </div>
      {data.narrativeText ? (
        <p className="rel-hero__narrative">{text(data.narrativeText)}</p>
      ) : null}
      <div className="rel-hero__divider" role="presentation"></div>
      <div className="rel-hero__kpis">
        {kpis.map((item, index) => (
          <Kpi key={item?.key || index} item={item} />
        ))}
      </div>
    </>
  );
}
