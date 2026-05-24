import {
  RELATORIO_ACTIONS,
  RELATORIO_NAV_TARGETS,
  RELATORIO_PUBLIC_IDS,
  RELATORIO_VIEW_MODES,
} from '../../viewModels/relatorioContracts.js';

const DEFAULT_FILTERS = Object.freeze({
  equipId: '',
  de: '',
  ate: '',
  hasPeriodoFilter: false,
  hasEquipFilter: false,
  periodoTxt: 'Todo o periodo',
  equipTxt: 'Todos os equipamentos',
});

const DEFAULT_CONTROLS = Object.freeze({
  pageTitle: 'Seus relatorios',
  pageSubtitle: 'Veja servicos por cliente, equipamento ou setor.',
  viewMode: RELATORIO_VIEW_MODES.compact,
  isPro: false,
  advancedOpen: false,
  filters: DEFAULT_FILTERS,
  equipOptions: [],
  modeSegmentActive: 'servicos',
  reportSummary: {
    servicos: 0,
    equipamentos: 0,
    periodo: 'todo o periodo',
  },
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

function escapeHtml(value) {
  return text(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function optionHtml(option) {
  return `<option value="${escapeHtml(option?.id)}">${escapeHtml(option?.label)}</option>`;
}

function filterChipHtml({ active, label, icon, advancedOpen }) {
  return `
    <button type="button" class="${classNames('rel-chip', active && 'is-active')}"
      data-action="${RELATORIO_ACTIONS.toggleAdvanced}"
      aria-expanded="${String(Boolean(advancedOpen))}"
      aria-controls="${RELATORIO_PUBLIC_IDS.filtersAdvanced}">
      <span class="rel-chip__icon" aria-hidden="true">${icon}</span>
      <span class="rel-chip__label">${escapeHtml(label)}</span>
    </button>
  `;
}

function renderFilterChips({ filters, advancedOpen, isPro }) {
  const hasPeriodoFilter = Boolean(filters.hasPeriodoFilter);
  const hasEquipFilter = Boolean(filters.hasEquipFilter);
  const anyActive = hasPeriodoFilter || hasEquipFilter;

  const chips = [
    filterChipHtml({
      active: hasPeriodoFilter,
      label: hasPeriodoFilter ? filters.periodoTxt : 'Todo periodo',
      icon: '&#128197;',
      advancedOpen,
    }),
    filterChipHtml({
      active: hasEquipFilter,
      label: hasEquipFilter ? filters.equipTxt : 'Todos os equipamentos',
      icon: '&#127991;',
      advancedOpen,
    }),
  ];

  if (isPro) {
    chips.push(`
      <button type="button" class="rel-chip rel-chip--dashed"
        data-action="${RELATORIO_ACTIONS.toggleAdvanced}"
        aria-expanded="${String(Boolean(advancedOpen))}"
        aria-controls="${RELATORIO_PUBLIC_IDS.filtersAdvanced}">
        <span class="rel-chip__icon" aria-hidden="true">${advancedOpen ? '&times;' : '+'}</span>
        <span class="rel-chip__label">${advancedOpen ? 'Fechar filtros' : 'Mais filtros'}</span>
      </button>
    `);
  }

  if (anyActive) {
    chips.push(`
      <button type="button" class="rel-chip__clear" data-action="${RELATORIO_ACTIONS.clearFilters}">
        <span aria-hidden="true">&times;</span>
        <span>Limpar filtros</span>
      </button>
    `);
  }

  return chips.join('');
}

function renderPmocHero(isPro) {
  if (isPro) {
    return `
      <section class="pmoc-hero" aria-label="PMOC formal">
        <div class="pmoc-hero__head">
          <div class="pmoc-hero__icon" aria-hidden="true">&#128196;</div>
          <div class="pmoc-hero__name">PMOC formal</div>
          <span class="pmoc-hero__badge">PRO</span>
        </div>
        <p class="pmoc-hero__desc">Documento anual conforme NBR 13971 - capa institucional, cronograma 12 meses e termo de RT. <strong>Diferencial pra clientes corporativos.</strong></p>
        <button class="pmoc-hero__btn" id="${RELATORIO_PUBLIC_IDS.pmocMain}"
          data-action="${RELATORIO_ACTIONS.openPmocModal}" data-tier="pro" type="button"
          title="Documento PMOC formal anual conforme NBR 13971 - Pro.">Gerar PMOC -></button>
      </section>
    `;
  }

  return `
    <section class="pmoc-hero" aria-label="PMOC formal">
      <div class="pmoc-hero__head">
        <div class="pmoc-hero__icon" aria-hidden="true">&#128196;</div>
        <div class="pmoc-hero__name">PMOC formal</div>
        <span class="pmoc-hero__badge">PRO</span>
      </div>
      <p class="pmoc-hero__desc">Documento anual conforme NBR 13971 - capa institucional, cronograma 12 meses e termo de RT. <strong>Diferencial pra clientes corporativos.</strong></p>
      <button class="pmoc-hero__btn pmoc-hero__btn--locked" id="${RELATORIO_PUBLIC_IDS.pmocNudge}"
        type="button" disabled aria-disabled="true" title="Indisponivel nesta versao.">Indisponivel nesta versao</button>
    </section>
  `;
}

function renderViewModeSegment(viewMode) {
  const current = text(viewMode, RELATORIO_VIEW_MODES.compact);
  const compactActive = current === RELATORIO_VIEW_MODES.compact;
  const detailedActive = current === RELATORIO_VIEW_MODES.detailed;
  return `
    <div class="rel-segmented" role="radiogroup" aria-label="Densidade do relatorio">
      <button type="button" class="${classNames('rel-segmented__opt', compactActive && 'is-active')}"
        data-view-mode="${RELATORIO_VIEW_MODES.compact}" role="radio" aria-checked="${compactActive ? 'true' : 'false'}">Compacto</button>
      <button type="button" class="${classNames('rel-segmented__opt', detailedActive && 'is-active')}"
        data-view-mode="${RELATORIO_VIEW_MODES.detailed}" role="radio" aria-checked="${detailedActive ? 'true' : 'false'}">Detalhado</button>
    </div>
  `;
}

function renderModeSegment(active) {
  return `
    <div class="rel-mode-segment" role="group" aria-label="Agrupar por">
      ${[
        ['servicos', 'Servicos'],
        ['cliente', 'Cliente'],
        ['setor', 'Setor'],
      ]
        .map(
          ([key, label]) =>
            `<span class="${classNames('rel-mode-segment__item', active === key && 'is-active')}">${label}</span>`,
        )
        .join('')}
    </div>
  `;
}

function renderControlsHtml(controls) {
  const data = { ...DEFAULT_CONTROLS, ...(controls || {}) };
  const filters = { ...DEFAULT_FILTERS, ...(data.filters || {}) };
  const isPro = Boolean(data.isPro);
  const advancedOpen = Boolean(data.advancedOpen);
  const summary = data.reportSummary || DEFAULT_CONTROLS.reportSummary;

  return `
    <div class="servicos-toggle" role="tablist" aria-label="Modo de visualizacao">
      <button type="button" class="servicos-toggle__btn servicos-toggle__btn--lista" data-nav="${RELATORIO_NAV_TARGETS.historico}" role="tab" aria-label="Lista de servicos"><span aria-hidden="true">&#9776;</span><span>Lista</span></button>
      <button type="button" class="servicos-toggle__btn servicos-toggle__btn--relatorio" data-nav="${RELATORIO_NAV_TARGETS.relatorio}" role="tab" aria-label="Relatorio com KPIs e PDF"><span aria-hidden="true">&#8599;</span><span>Relatorio</span></button>
    </div>
    <h1 id="${RELATORIO_PUBLIC_IDS.mainTitle}" class="rel-title">${escapeHtml(data.pageTitle)}</h1>
    <p id="${RELATORIO_PUBLIC_IDS.mainSubtitle}" class="rel-subtitle">${escapeHtml(data.pageSubtitle)}</p>
    ${renderPmocHero(isPro)}
    <div class="rel-section-divider">Relatorio livre</div>
    <div id="${RELATORIO_PUBLIC_IDS.modeSegmentSlot}" class="rel-control-blocks">
      <div class="rel-filter-block"><div class="rel-filter-label">Visualizar:</div>${renderViewModeSegment(data.viewMode)}</div>
      <div class="rel-filter-block"><div class="rel-filter-label">Agrupar por:</div>${renderModeSegment(text(data.modeSegmentActive, 'servicos'))}</div>
    </div>
    <div id="${RELATORIO_PUBLIC_IDS.hero}" class="rel-hero" aria-live="polite"></div>
    <div id="${RELATORIO_PUBLIC_IDS.filters}" class="rel-filters" role="group" aria-label="Filtros do relatorio">
      <div id="${RELATORIO_PUBLIC_IDS.filtersChips}" class="rel-filters__chips">
        ${renderFilterChips({ filters, advancedOpen, isPro })}
      </div>
      <div id="${RELATORIO_PUBLIC_IDS.filtersAdvanced}" class="rel-filters__advanced" ${advancedOpen ? '' : 'hidden'}>
        <div class="rel-filters__advanced-grid">
          <div class="form-group">
            <label class="form-label" for="${RELATORIO_PUBLIC_IDS.equipSelect}">Equipamento</label>
            <select id="${RELATORIO_PUBLIC_IDS.equipSelect}" class="form-control">
              <option value="">Todos os equipamentos</option>
              ${asArray(data.equipOptions).map(optionHtml).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="${RELATORIO_PUBLIC_IDS.dateFrom}">De</label>
            <input id="${RELATORIO_PUBLIC_IDS.dateFrom}" class="form-control" type="date" value="${escapeHtml(filters.de)}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="${RELATORIO_PUBLIC_IDS.dateTo}">Ate</label>
            <input id="${RELATORIO_PUBLIC_IDS.dateTo}" class="form-control" type="date" value="${escapeHtml(filters.ate)}" />
          </div>
        </div>
      </div>
    </div>
    <div class="rel-summary-card" aria-live="polite">
      <div class="rel-summary-card__icon" aria-hidden="true">i</div>
      <div class="rel-summary-card__text">Gerando: <strong>${Number(summary.servicos) || 0} servicos</strong> &middot; <strong>${Number(summary.equipamentos) || 0} equipamentos</strong> &middot; ${escapeHtml(summary.periodo || 'todo o periodo')}</div>
    </div>
    <div class="rel-toolbar">
      <div class="rel-toolbar__actions rel-toolbar__actions--v2">
        <button class="rel-toolbar__btn rel-toolbar__btn--whatsapp" id="btn-whatsapp" data-action="${RELATORIO_ACTIONS.whatsappExport}" type="button" title="Gera o PDF e abre o compartilhamento via WhatsApp"><span aria-hidden="true">&#9673;</span><span>Enviar pro cliente</span></button>
        <button class="rel-toolbar__btn rel-toolbar__btn--pdf" id="btn-export-pdf" data-action="${RELATORIO_ACTIONS.exportPdf}" type="button" title="Gera e baixa o PDF do relatorio"><span aria-hidden="true">&darr;</span><span>Baixar PDF</span></button>
        <div class="rel-toolbar__more rel-export-dd" id="${RELATORIO_PUBLIC_IDS.exportDropdown}">
          <button class="rel-toolbar__btn rel-toolbar__btn--icon rel-export-dd__main" id="${RELATORIO_PUBLIC_IDS.exportDropdownToggle}" data-action="${RELATORIO_ACTIONS.toggleExportDropdown}" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="${RELATORIO_PUBLIC_IDS.exportDropdownMenu}" aria-label="Mais opcoes" title="Mais opcoes">&#8942;</button>
          <div class="rel-export-dd__menu" id="${RELATORIO_PUBLIC_IDS.exportDropdownMenu}" role="menu" hidden></div>
        </div>
        <div id="${RELATORIO_PUBLIC_IDS.pdfQuotaSlot}" class="rel-toolbar__quota-slot"></div>
      </div>
    </div>
  `;
}

export function renderRelatorioControls(
  root = document.getElementById(RELATORIO_PUBLIC_IDS.controlsRoot),
  props = {},
) {
  if (!root) return null;
  const controls = { ...DEFAULT_CONTROLS, ...(props.controls || {}) };
  const filters = { ...DEFAULT_FILTERS, ...(controls.filters || {}) };
  root.dataset.relatorioControlsMounted = 'true';
  root.innerHTML = renderControlsHtml({ ...controls, filters });
  const equip = document.getElementById(RELATORIO_PUBLIC_IDS.equipSelect);
  if (equip) equip.value = text(filters.equipId);
  return root;
}

export function unmountRelatorioControlsDom(
  root = document.getElementById(RELATORIO_PUBLIC_IDS.controlsRoot),
) {
  if (!root?.dataset.relatorioControlsMounted) return null;
  root.replaceChildren();
  delete root.dataset.relatorioControlsMounted;
  return null;
}
