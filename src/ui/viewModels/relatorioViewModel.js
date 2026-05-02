import {
  RELATORIO_ACTIONS,
  RELATORIO_PLAN_CODES,
  RELATORIO_VIEW_MODES,
} from './relatorioContracts.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const CORRETIVAS_BANNER_MIN_COUNT = 2;
const CORRETIVAS_BANNER_MIN_RATIO = 0.3;
const PROXIMAS_ACOES_WINDOW_DAYS = 14;
const PROXIMAS_ACOES_DEFAULT_LIMIT = 5;

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isRecord(value) {
  return value !== null && typeof value === 'object';
}

function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function safeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(value) {
  const date = safeDate(value) || new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function defaultDaysUntil(iso, now = new Date()) {
  if (!iso) return null;
  const raw = safeString(iso);
  const date = safeDate(raw.length === 10 ? `${raw}T00:00:00` : raw);
  if (!date) return null;
  return Math.round((startOfDay(date) - startOfDay(now)) / DAY_MS);
}

function defaultFormatDueRelative(iso, now = new Date()) {
  const days = defaultDaysUntil(iso, now);
  if (days == null) return '—';
  if (days === 0) return 'vence hoje';
  if (days > 0) return `daqui ${days}d`;
  return `atrasada ${-days}d`;
}

function shortDate(value) {
  const raw = safeString(value).slice(0, 10);
  const [, month, day] = raw.split('-');
  if (!month || !day) return '';
  const months = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];
  return `${Number(day)} de ${months[Number(month) - 1] || month}`;
}

function defaultFormatShortDateRange(de, ate) {
  if (de && ate) return `${shortDate(de)} a ${shortDate(ate)}`;
  if (de) return `desde ${shortDate(de)}`;
  if (ate) return `até ${shortDate(ate)}`;
  return 'Todo período';
}

function buildLookup(items) {
  return new Map(
    asArray(items)
      .filter((item) => item?.id)
      .map((item) => [safeString(item.id), item]),
  );
}

function sortByDateDesc(items) {
  return [...asArray(items)].sort((a, b) => safeString(b?.data).localeCompare(safeString(a?.data)));
}

function normalizeViewMode(viewMode) {
  return viewMode === RELATORIO_VIEW_MODES.detailed
    ? RELATORIO_VIEW_MODES.detailed
    : RELATORIO_VIEW_MODES.compact;
}

function normalizeFilters(filters = {}) {
  return {
    equipId: safeString(filters?.equipId),
    de: safeString(filters?.de),
    ate: safeString(filters?.ate),
  };
}

export function computeRelatorioKpis(registros, { daysUntil = defaultDaysUntil, now } = {}) {
  const list = asArray(registros).filter(isRecord);
  const count = list.length;
  const total = list.reduce(
    (sum, registro) => sum + toNumber(registro?.custoPecas) + toNumber(registro?.custoMaoObra),
    0,
  );

  const byType = list.reduce((acc, registro) => {
    const tipo = safeString(registro?.tipo, 'Outro') || 'Outro';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  let mostCommonType = null;
  let mostCommonCount = 0;
  Object.keys(byType).forEach((tipo) => {
    if (byType[tipo] > mostCommonCount) {
      mostCommonType = tipo;
      mostCommonCount = byType[tipo];
    }
  });

  const allDues = list
    .map((registro) => registro?.proxima)
    .filter(Boolean)
    .map((iso) => ({ iso, n: daysUntil(iso, now) }))
    .filter((item) => item.n != null);
  allDues.sort((a, b) => a.n - b.n);
  const nextDue = allDues.find((item) => item.n >= 0) || allDues[allDues.length - 1] || null;

  return { count, total, mostCommonType, mostCommonCount, nextDue };
}

export function buildPeriodNarrative(list) {
  const registros = asArray(list).filter(isRecord);
  if (!registros.length) return null;

  const total = registros.length;
  const equipsSet = new Set();
  const byTipo = {};
  let corretivas = 0;

  registros.forEach((registro) => {
    if (registro?.equipId) equipsSet.add(registro.equipId);
    const tipo = safeString(registro?.tipo, 'Outro') || 'Outro';
    byTipo[tipo] = (byTipo[tipo] || 0) + 1;
    if (/corretiva/i.test(safeString(registro?.tipo))) corretivas += 1;
  });

  const equipsUnicos = equipsSet.size;
  let tipoTop = null;
  let tipoTopCount = 0;
  Object.keys(byTipo).forEach((tipo) => {
    if (byTipo[tipo] > tipoTopCount) {
      tipoTop = tipo;
      tipoTopCount = byTipo[tipo];
    }
  });
  const tipoPct = total > 0 ? Math.round((tipoTopCount / total) * 100) : 0;

  const atendimentosTxt = `${total} ${total === 1 ? 'atendimento' : 'atendimentos'}`;
  const equipsTxt =
    equipsUnicos > 0
      ? ` em ${equipsUnicos} ${equipsUnicos === 1 ? 'equipamento' : 'equipamentos'}`
      : '';
  const partes = [`${atendimentosTxt}${equipsTxt}`];

  const multiTipos = Object.keys(byTipo).length > 1;
  if (tipoTop && tipoPct >= 30 && multiTipos) {
    const nomeCurto = tipoTop.replace(/^Manutenção\s+/i, '');
    partes.push(`predomínio de ${nomeCurto} (${tipoPct}%)`);
  }
  if (corretivas > 0) {
    partes.push(`${corretivas} ${corretivas === 1 ? 'corretiva' : 'corretivas'}`);
  }

  return {
    text: `${partes.join(' · ')}.`,
    total,
    equipsUnicos,
    tipoTop,
    tipoTopCount,
    tipoPct,
    corretivas,
  };
}

export function countCorretivas(list) {
  return asArray(list)
    .filter(isRecord)
    .reduce((acc, registro) => {
      return /corretiva/i.test(safeString(registro?.tipo)) ? acc + 1 : acc;
    }, 0);
}

export function shouldShowCorretivasBanner(count, total) {
  if (count < CORRETIVAS_BANNER_MIN_COUNT) return false;
  if (total <= 0) return false;
  return count / total >= CORRETIVAS_BANNER_MIN_RATIO;
}

export function getProximasAcoes(
  list,
  equipamentos = [],
  limit = PROXIMAS_ACOES_DEFAULT_LIMIT,
  days = PROXIMAS_ACOES_WINDOW_DAYS,
  { daysUntil = defaultDaysUntil, formatDueRelative = defaultFormatDueRelative, now } = {},
) {
  const registros = asArray(list).filter(isRecord);
  if (!registros.length) return [];
  const equipIndex = buildLookup(equipamentos);
  const byEquip = new Map();

  registros.forEach((registro) => {
    if (!registro?.equipId || !registro?.proxima) return;
    const n = daysUntil(registro.proxima, now);
    if (n == null) return;
    if (n > days) return;
    const equipId = safeString(registro.equipId);
    const existing = byEquip.get(equipId);
    if (!existing || n < existing.daysUntil) {
      const equipamento = equipIndex.get(equipId) || null;
      byEquip.set(equipId, {
        equipId,
        equipNome: equipamento?.nome || registro?.equipNome || '—',
        equipTag: equipamento?.tag || '',
        proximaIso: registro.proxima,
        daysUntil: n,
        registro,
      });
    }
  });

  const items = Array.from(byEquip.values());
  items.sort((a, b) => a.daysUntil - b.daysUntil);
  return items.slice(0, limit).map((item) => ({
    ...item,
    tone: item.daysUntil < 0 ? 'danger' : 'warn',
    label: formatDueRelative(item.proximaIso, now),
  }));
}

export function resolveRelatorioModeCopy({ isPro }) {
  if (isPro) {
    return {
      pageTitle: 'Relatórios da empresa',
      pageSubtitle: 'Acompanhe serviços por cliente, setor, equipamento e PMOC.',
      heroTitle: 'Contexto do relatório',
      heroBrand: 'Relatórios da empresa',
    };
  }
  return {
    pageTitle: 'Relatório rápido',
    pageSubtitle: 'Gere e envie o PDF do serviço em poucos toques.',
    heroTitle: 'Resumo dos serviços',
    heroBrand: 'Relatório rápido',
  };
}

export function buildReportContext({ isPro, equipFiltrado, clientes, setores }) {
  const cliente = equipFiltrado?.clienteId
    ? asArray(clientes).find((item) => item?.id === equipFiltrado.clienteId) || null
    : null;
  const setor = equipFiltrado?.setorId
    ? asArray(setores).find((item) => item?.id === equipFiltrado.setorId) || null
    : null;
  const equipamento = equipFiltrado?.nome ? equipFiltrado : null;
  if (!isPro) return { cliente: null, setor: null, equipamento };
  return { cliente, setor, equipamento };
}

function applyFilters(registros, filters) {
  let list = sortByDateDesc(asArray(registros).filter(isRecord));
  if (filters.equipId) list = list.filter((registro) => registro?.equipId === filters.equipId);
  if (filters.de) list = list.filter((registro) => safeString(registro?.data) >= filters.de);
  if (filters.ate) {
    const ateLimit = `${filters.ate}T23:59`;
    list = list.filter((registro) => safeString(registro?.data) <= ateLimit);
  }
  return list;
}

function buildFiltersViewModel({
  filters,
  equipamentos,
  formatShortDateRange = defaultFormatShortDateRange,
}) {
  const hasPeriodoFilter = Boolean(filters.de || filters.ate);
  const hasEquipFilter = Boolean(filters.equipId);
  const equipFiltrado = hasEquipFilter
    ? asArray(equipamentos).find((equipamento) => equipamento?.id === filters.equipId) || null
    : null;

  return {
    ...filters,
    hasPeriodoFilter,
    hasEquipFilter,
    equipFiltrado,
    periodoTxt: hasPeriodoFilter ? formatShortDateRange(filters.de, filters.ate) : 'Todo o período',
    equipTxt: hasEquipFilter
      ? equipFiltrado?.nome || 'Equipamento selecionado'
      : 'Todos os equipamentos',
    singleEquipFilter: hasEquipFilter,
  };
}

export function buildRelatorioViewModel({
  registros = [],
  equipamentos = [],
  clientes = [],
  setores = [],
  filters: inputFilters = {},
  isPro = false,
  viewMode,
  context: inputContext = null,
  pmocSummary = null,
  daysUntil = defaultDaysUntil,
  formatDueRelative = defaultFormatDueRelative,
  formatShortDateRange = defaultFormatShortDateRange,
  now,
} = {}) {
  const filters = normalizeFilters(inputFilters);
  const records = applyFilters(registros, filters);
  const filterVm = buildFiltersViewModel({ filters, equipamentos, formatShortDateRange });
  const context =
    inputContext ||
    buildReportContext({
      isPro,
      equipFiltrado: filterVm.equipFiltrado,
      clientes,
      setores,
    });
  const kpis = computeRelatorioKpis(records, { daysUntil, now });
  const narrative = buildPeriodNarrative(records);
  const corretivasCount = countCorretivas(records);
  const proximasAcoes = getProximasAcoes(records, equipamentos, undefined, undefined, {
    daysUntil,
    formatDueRelative,
    now,
  });
  const hasPmocAttention = Boolean(
    pmocSummary && (pmocSummary.status === 'atencao' || pmocSummary.status === 'atrasado'),
  );

  return {
    viewMode: normalizeViewMode(viewMode),
    planCode: isPro ? RELATORIO_PLAN_CODES.pro : '',
    isPro: Boolean(isPro),
    isEmpty: records.length === 0,
    records,
    filters: filterVm,
    modeCopy: resolveRelatorioModeCopy({ isPro }),
    context,
    hasPmocAttention,
    kpis,
    narrative,
    corretivasCount,
    showCorretivasBanner: shouldShowCorretivasBanner(corretivasCount, records.length),
    proximasAcoes,
    actions: RELATORIO_ACTIONS,
  };
}
