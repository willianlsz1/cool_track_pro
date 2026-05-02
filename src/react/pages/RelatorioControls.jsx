import {
  RELATORIO_ACTIONS,
  RELATORIO_NAV_TARGETS,
  RELATORIO_PUBLIC_IDS,
  RELATORIO_VIEW_MODES,
} from '../../ui/viewModels/relatorioContracts.js';

const DEFAULT_FILTERS = Object.freeze({
  equipId: '',
  de: '',
  ate: '',
  hasPeriodoFilter: false,
  hasEquipFilter: false,
  periodoTxt: 'Todo o período',
  equipTxt: 'Todos os equipamentos',
});

const DEFAULT_CONTROLS = Object.freeze({
  pageTitle: 'Relatório rápido',
  pageSubtitle: 'Gere e envie o PDF do serviço em poucos toques.',
  viewMode: RELATORIO_VIEW_MODES.compact,
  isPro: false,
  advancedOpen: false,
  filters: DEFAULT_FILTERS,
  equipOptions: [],
  modeSegmentActive: 'servicos',
});

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function Icon({ name, size = 14, fill = 'none' }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill,
    stroke: fill === 'none' ? 'currentColor' : undefined,
    strokeWidth: fill === 'none' ? '1.8' : undefined,
    strokeLinecap: fill === 'none' ? 'round' : undefined,
    strokeLinejoin: fill === 'none' ? 'round' : undefined,
    'aria-hidden': 'true',
  };

  switch (name) {
    case 'list':
      return (
        <svg {...common}>
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <circle cx="3.5" cy="6" r="1" />
          <circle cx="3.5" cy="12" r="1" />
          <circle cx="3.5" cy="18" r="1" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="M7 14l4-4 4 4 5-5" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...common} fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
        </svg>
      );
    case 'download':
      return (
        <svg {...common}>
          <path d="M12 4v12" />
          <path d="M7 11l5 5 5-5" />
          <path d="M4 20h16" />
        </svg>
      );
    case 'more':
      return (
        <svg {...common} fill="currentColor">
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      );
    case 'file':
      return (
        <svg {...common} width={20} height={20}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
          <line x1="9" y1="11" x2="15" y2="11" />
        </svg>
      );
    case 'info':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8h.01M11 12h1v5h1" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common}>
          <path d="M12 3l2.5 5.3L20 9l-4 3.9.9 5.6L12 16l-4.9 2.5.9-5.6L4 9l5.5-.7z" />
        </svg>
      );
    case 'arrowRight':
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case 'tag':
      return (
        <svg {...common}>
          <path d="M3 12l9-9h8v8l-9 9-8-8z" />
          <circle cx="15.5" cy="8.5" r="1.2" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    default:
      return null;
  }
}

function ServicosToggle() {
  return (
    <div className="servicos-toggle" role="tablist" aria-label="Modo de visualização">
      <button
        type="button"
        className="servicos-toggle__btn servicos-toggle__btn--lista"
        data-nav={RELATORIO_NAV_TARGETS.historico}
        role="tab"
        aria-label="Lista de serviços"
      >
        <Icon name="list" size={13} />
        <span>Lista</span>
      </button>
      <button
        type="button"
        className="servicos-toggle__btn servicos-toggle__btn--relatorio"
        data-nav={RELATORIO_NAV_TARGETS.relatorio}
        role="tab"
        aria-label="Relatório com KPIs e PDF"
      >
        <Icon name="chart" size={13} />
        <span>Relatório</span>
      </button>
    </div>
  );
}

function ExportToolbar({ isPro }) {
  return (
    <div className="rel-toolbar">
      <div className="rel-toolbar__actions rel-toolbar__actions--v2">
        <button
          className="rel-toolbar__btn rel-toolbar__btn--whatsapp"
          id="btn-whatsapp"
          data-action={RELATORIO_ACTIONS.whatsappExport}
          type="button"
          title="Gera o PDF e abre o compartilhamento via WhatsApp"
        >
          <Icon name="whatsapp" size={16} fill="currentColor" />
          <span>Enviar pro cliente</span>
        </button>
        <button
          className="rel-toolbar__btn rel-toolbar__btn--pdf"
          id="btn-export-pdf"
          data-action={RELATORIO_ACTIONS.exportPdf}
          type="button"
          title="Gera e baixa o PDF do relatório"
        >
          <Icon name="download" />
          <span>Baixar PDF</span>
        </button>
        <div className="rel-toolbar__more rel-export-dd" id={RELATORIO_PUBLIC_IDS.exportDropdown}>
          <button
            className="rel-toolbar__btn rel-toolbar__btn--icon rel-export-dd__main"
            id={RELATORIO_PUBLIC_IDS.exportDropdownToggle}
            data-action={RELATORIO_ACTIONS.toggleExportDropdown}
            type="button"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-controls={RELATORIO_PUBLIC_IDS.exportDropdownMenu}
            aria-label="Mais opções"
            title="Mais opções"
          >
            <Icon name="more" fill="currentColor" />
          </button>
          <div
            className="rel-export-dd__menu"
            id={RELATORIO_PUBLIC_IDS.exportDropdownMenu}
            role="menu"
            hidden
          >
            <button
              type="button"
              className="rel-export-dd__item rel-export-dd__item--pmoc rel-export-dd__item--featured"
              id={RELATORIO_PUBLIC_IDS.pmocMain}
              role="menuitem"
              data-action={RELATORIO_ACTIONS.openPmocModal}
              data-tier="unknown"
              title="Documento PMOC formal anual conforme NBR 13971 - Pro."
              hidden={!isPro}
            >
              <span className="rel-export-dd__item-icon" aria-hidden="true">
                <Icon name="file" />
              </span>
              <div className="rel-export-dd__item-text">
                <strong>
                  Gerar PMOC formal{' '}
                  <span className="pro-badge pro-badge--inline" aria-hidden="true">
                    PRO
                  </span>
                </strong>
                <span>
                  Documento anual conforme NBR 13971 - capa institucional, cronograma 12 meses e
                  termo de RT
                </span>
              </div>
              <span className="rel-export-dd__item-arrow" aria-hidden="true">
                <Icon name="arrowRight" />
              </span>
            </button>
            <button
              type="button"
              className="rel-export-dd__item rel-export-dd__item--meta"
              id={RELATORIO_PUBLIC_IDS.pmocInfo}
              role="menuitem"
              data-action={RELATORIO_ACTIONS.openPmocInfo}
              title="Saiba quando usar cada um."
              hidden={!isPro}
            >
              <Icon name="info" />
              <span>Sobre o PMOC</span>
            </button>
            <button
              type="button"
              className="rel-export-dd__item rel-export-dd__item--meta"
              id={RELATORIO_PUBLIC_IDS.pmocNudge}
              role="menuitem"
              data-nav={RELATORIO_NAV_TARGETS.pricing}
              title="Conheça o plano Pro para PMOC formal."
              hidden={isPro}
            >
              <Icon name="star" />
              <span>Conheça o Pro (PMOC)</span>
            </button>
          </div>
        </div>
        <div id={RELATORIO_PUBLIC_IDS.pdfQuotaSlot} className="rel-toolbar__quota-slot"></div>
      </div>
    </div>
  );
}

function ModeSegment({ isPro, active }) {
  if (!isPro) return null;
  const options = [
    ['servicos', 'Serviços'],
    ['cliente', 'Cliente'],
    ['setor', 'Setor'],
    ['pmoc', 'PMOC'],
  ];

  return (
    <div className="rel-mode-segment" role="group" aria-label="Contexto dos relatórios">
      {options.map(([key, label]) => (
        <span
          className={classNames('rel-mode-segment__item', active === key && 'is-active')}
          key={key}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function ViewModeSegment({ viewMode }) {
  const current = text(viewMode, RELATORIO_VIEW_MODES.compact);
  return (
    <div className="rel-segmented" role="radiogroup" aria-label="Densidade do relatório">
      <button
        type="button"
        className={classNames(
          'rel-segmented__opt',
          current === RELATORIO_VIEW_MODES.compact && 'is-active',
        )}
        data-view-mode={RELATORIO_VIEW_MODES.compact}
        role="radio"
        aria-checked={current === RELATORIO_VIEW_MODES.compact ? 'true' : 'false'}
      >
        Compacto
      </button>
      <button
        type="button"
        className={classNames(
          'rel-segmented__opt',
          current === RELATORIO_VIEW_MODES.detailed && 'is-active',
        )}
        data-view-mode={RELATORIO_VIEW_MODES.detailed}
        role="radio"
        aria-checked={current === RELATORIO_VIEW_MODES.detailed ? 'true' : 'false'}
      >
        Detalhado
      </button>
    </div>
  );
}

function FilterChips({ filters, advancedOpen, isPro }) {
  const hasPeriodoFilter = Boolean(filters.hasPeriodoFilter);
  const hasEquipFilter = Boolean(filters.hasEquipFilter);
  const anyActive = hasPeriodoFilter || hasEquipFilter;

  return (
    <>
      <button
        type="button"
        className={classNames('rel-chip', hasPeriodoFilter && 'is-active')}
        data-action={RELATORIO_ACTIONS.toggleAdvanced}
        aria-expanded={String(Boolean(advancedOpen))}
        aria-controls={RELATORIO_PUBLIC_IDS.filtersAdvanced}
      >
        <span className="rel-chip__icon">
          <Icon name="calendar" size={12} />
        </span>
        <span className="rel-chip__label">
          {hasPeriodoFilter ? text(filters.periodoTxt) : 'Todo período'}
        </span>
      </button>
      <button
        type="button"
        className={classNames('rel-chip', hasEquipFilter && 'is-active')}
        data-action={RELATORIO_ACTIONS.toggleAdvanced}
        aria-expanded={String(Boolean(advancedOpen))}
        aria-controls={RELATORIO_PUBLIC_IDS.filtersAdvanced}
      >
        <span className="rel-chip__icon">
          <Icon name="tag" size={12} />
        </span>
        <span className="rel-chip__label">
          {hasEquipFilter ? text(filters.equipTxt) : 'Todos os equipamentos'}
        </span>
      </button>
      {isPro ? (
        <button
          type="button"
          className="rel-chip rel-chip--dashed"
          data-action={RELATORIO_ACTIONS.toggleAdvanced}
          aria-expanded={String(Boolean(advancedOpen))}
          aria-controls={RELATORIO_PUBLIC_IDS.filtersAdvanced}
        >
          <span className="rel-chip__icon">
            <Icon name={advancedOpen ? 'x' : 'plus'} size={12} />
          </span>
          <span className="rel-chip__label">
            {advancedOpen ? 'Fechar filtros' : 'Mais filtros'}
          </span>
        </button>
      ) : null}
      {anyActive ? (
        <button
          type="button"
          className="rel-chip__clear"
          data-action={RELATORIO_ACTIONS.clearFilters}
        >
          <Icon name="x" size={12} />
          <span>Limpar filtros</span>
        </button>
      ) : null}
    </>
  );
}

function AdvancedFilters({ filters, equipOptions, advancedOpen }) {
  return (
    <div
      id={RELATORIO_PUBLIC_IDS.filtersAdvanced}
      className="rel-filters__advanced"
      hidden={!advancedOpen}
    >
      <div className="rel-filters__advanced-grid">
        <div className="form-group">
          <label className="form-label" htmlFor={RELATORIO_PUBLIC_IDS.equipSelect}>
            Equipamento
          </label>
          <select
            id={RELATORIO_PUBLIC_IDS.equipSelect}
            key={`equip-${text(filters.equipId)}`}
            className="form-control"
            defaultValue={text(filters.equipId)}
          >
            <option value="">Todos os equipamentos</option>
            {asArray(equipOptions).map((option) => (
              <option value={text(option?.id)} key={text(option?.id)}>
                {text(option?.label)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={RELATORIO_PUBLIC_IDS.dateFrom}>
            De
          </label>
          <input
            id={RELATORIO_PUBLIC_IDS.dateFrom}
            key={`from-${text(filters.de)}`}
            className="form-control"
            type="date"
            defaultValue={text(filters.de)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={RELATORIO_PUBLIC_IDS.dateTo}>
            Até
          </label>
          <input
            id={RELATORIO_PUBLIC_IDS.dateTo}
            key={`to-${text(filters.ate)}`}
            className="form-control"
            type="date"
            defaultValue={text(filters.ate)}
          />
        </div>
      </div>
    </div>
  );
}

export function RelatorioControls({ controls = DEFAULT_CONTROLS }) {
  const data = { ...DEFAULT_CONTROLS, ...controls };
  const filters = { ...DEFAULT_FILTERS, ...(data.filters || {}) };
  const isPro = Boolean(data.isPro);
  const advancedOpen = Boolean(data.advancedOpen);

  return (
    <>
      <ServicosToggle />
      <ExportToolbar isPro={isPro} />
      <h1 id={RELATORIO_PUBLIC_IDS.mainTitle} className="rel-title">
        {text(data.pageTitle, DEFAULT_CONTROLS.pageTitle)}
      </h1>
      <p id={RELATORIO_PUBLIC_IDS.mainSubtitle} className="rel-subtitle">
        {text(data.pageSubtitle, DEFAULT_CONTROLS.pageSubtitle)}
      </p>
      <div id={RELATORIO_PUBLIC_IDS.modeSegmentSlot}>
        <ViewModeSegment viewMode={data.viewMode} />
        <ModeSegment isPro={isPro} active={text(data.modeSegmentActive, 'servicos')} />
      </div>
      <div id={RELATORIO_PUBLIC_IDS.hero} className="rel-hero" aria-live="polite"></div>
      <div
        id={RELATORIO_PUBLIC_IDS.filters}
        className="rel-filters"
        role="group"
        aria-label="Filtros do relatório"
      >
        <div id={RELATORIO_PUBLIC_IDS.filtersChips} className="rel-filters__chips">
          <FilterChips filters={filters} advancedOpen={advancedOpen} isPro={isPro} />
        </div>
        <AdvancedFilters
          filters={filters}
          equipOptions={data.equipOptions}
          advancedOpen={advancedOpen}
        />
      </div>
    </>
  );
}
