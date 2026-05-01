import { HISTORICO_ACTIONS } from '../../ui/viewModels/historicoContracts.js';

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

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function FiltersIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function QuickFilters({ filters, periodOptions, tipoOptions }) {
  const period = text(filters?.period, 'tudo');
  const tipo = text(filters?.tipo);

  return (
    <div className="hist-quickfilters" role="toolbar" aria-label="Filtros rapidos">
      {asArray(periodOptions).map((option) => {
        const id = text(option?.id);
        const active = period === id || (!period && id === 'tudo');
        return (
          <button
            type="button"
            className={classNames('hist-quickfilter', active && 'is-active')}
            data-hist-action={HISTORICO_ACTIONS.filterPeriod}
            data-period={id}
            aria-pressed={active ? 'true' : 'false'}
            key={id || text(option?.label)}
          >
            {text(option?.label)}
          </button>
        );
      })}
      <div className="hist-quickfilters__sep" aria-hidden="true"></div>
      {asArray(tipoOptions).map((option) => {
        const id = text(option?.id);
        const active = tipo === id;
        return (
          <button
            type="button"
            className={classNames(
              'hist-quickfilter',
              `hist-quickfilter--${text(option?.color, 'cyan')}`,
              active && 'is-active',
            )}
            data-hist-action={HISTORICO_ACTIONS.filterTipo}
            data-tipo-id={id}
            aria-pressed={active ? 'true' : 'false'}
            key={id || text(option?.label)}
          >
            <span className="hist-quickfilter__dot" aria-hidden="true"></span>
            {text(option?.label)}
          </button>
        );
      })}
    </div>
  );
}

function ActiveChips({ chips }) {
  const rows = asArray(chips);
  if (!rows.length) return <div id="hist-active-chips-slot"></div>;

  return (
    <div id="hist-active-chips-slot">
      <div className="hist-active-chips" role="status">
        <span className="hist-active-chips__label">Filtros ativos</span>
        {rows.map((chip, index) => {
          const key = text(chip?.key);
          const value = text(chip?.value);
          return (
            <span className="hist-active-chip" key={`${key}-${value}-${index}`}>
              <b>{key}:</b> {value}
              <button
                type="button"
                className="hist-active-chip__x"
                data-hist-action={text(chip?.clearAction)}
                aria-label={`Remover filtro ${key}: ${value}`}
              >
                <CloseIcon />
              </button>
            </span>
          );
        })}
        <button
          type="button"
          className="hist-active-chips__clear"
          data-hist-action={HISTORICO_ACTIONS.clearAll}
        >
          Limpar tudo
        </button>
      </div>
    </div>
  );
}

function SelectFilter({ id, label, value, options, defaultLabel, hidden = false }) {
  return (
    <div className="hist-select">
      <select
        id={id}
        aria-label={label}
        style={hidden ? { display: 'none' } : undefined}
        defaultValue={text(value)}
      >
        <option value="">{defaultLabel}</option>
        {asArray(options).map((option) => (
          <option value={text(option?.id)} key={text(option?.id)}>
            {text(option?.label)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function HistoricoFilters({ viewModel = {} }) {
  const filters = viewModel.filters || {};
  const filtersCount = Number(viewModel.filtersCount) || 0;

  return (
    <>
      <div className="hist-sticky-header" id="hist-sticky-header">
        <div className="hist-sticky-header__row">
          <div className="hist-title">{'Hist\u00f3rico de Servi\u00e7os'}</div>
          <span className="hist-count" id="hist-count" aria-live="polite">
            {text(viewModel.countLabel)}
          </span>
          <div className="hist-sticky-header__spacer"></div>
        </div>
        <div className="hist-sticky-header__row">
          <div className="hist-search-row">
            <label className="hist-input" htmlFor="hist-busca">
              <span className="hist-input__icon" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                id="hist-busca"
                type="search"
                placeholder={'Buscar equipamento, tipo, t\u00e9cnico\u2026'}
                aria-label={'Buscar no hist\u00f3rico'}
                defaultValue={text(filters.busca)}
              />
            </label>
            <button
              type="button"
              className={classNames('hist-filters-trigger', filtersCount > 0 && 'is-active')}
              id="hist-filters-trigger"
              data-hist-action={HISTORICO_ACTIONS.openFiltersSheet}
              aria-label={'Abrir filtros avan\u00e7ados'}
            >
              <FiltersIcon />
              Filtros
              <span
                className="hist-filters-trigger__count"
                id="hist-filters-count"
                hidden={filtersCount <= 0}
              >
                {filtersCount || 0}
              </span>
            </button>
            <SelectFilter
              id="hist-setor"
              label="Filtrar por setor"
              value={filters.setorId}
              options={viewModel.setorOptions}
              defaultLabel="Todos os setores"
              hidden={!viewModel.showSetorSelect}
            />
            <SelectFilter
              id="hist-equip"
              label="Filtrar por equipamento"
              value={filters.equipId}
              options={viewModel.equipamentoOptions}
              defaultLabel="Todos os equipamentos"
            />
          </div>
        </div>
        <div
          className="hist-sticky-header__row hist-sticky-header__row--quickfilters"
          id="hist-quickfilters-slot"
        >
          <QuickFilters
            filters={filters}
            periodOptions={viewModel.periodOptions}
            tipoOptions={viewModel.tipoOptions}
          />
        </div>
      </div>
      <ActiveChips chips={viewModel.activeChips} />
      <div className="hist-chrono-label" id="hist-chrono-label">
        <ClockIcon />
        Mais recente primeiro
      </div>
    </>
  );
}
