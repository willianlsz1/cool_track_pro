import {
  HISTORICO_ACTIONS,
  HISTORICO_PERIOD_OPTIONS,
  HISTORICO_TIPO_OPTIONS,
} from './historicoContracts.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function asArray(value) {
  return Array.isArray(value) ? value : [];
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

function localDateString(date = new Date()) {
  const reference = safeDate(date) || new Date();
  const year = reference.getFullYear();
  const month = String(reference.getMonth() + 1).padStart(2, '0');
  const day = String(reference.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysDiff(isoDate, now = new Date()) {
  if (!isoDate) return 0;
  const today = safeDate(now) || new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${String(isoDate).slice(0, 10)}T00:00:00`);
  return Math.ceil((target - today) / DAY_MS);
}

function buildLookup(items) {
  return new Map(
    asArray(items)
      .filter((item) => item?.id)
      .map((item) => [safeString(item.id), item]),
  );
}

function normalizePeriod(period) {
  const value = safeString(period) || 'tudo';
  return HISTORICO_PERIOD_OPTIONS.some((option) => option.id === value) ? value : 'tudo';
}

function normalizeTipo(tipo) {
  const value = safeString(tipo);
  return HISTORICO_TIPO_OPTIONS.some((option) => option.id === value) ? value : '';
}

function validRegistro(registro) {
  return Boolean(
    registro && registro.equipId && typeof registro.data === 'string' && registro.data.length >= 10,
  );
}

function sortByDateDesc(items) {
  return [...asArray(items)].sort((a, b) => safeString(b?.data).localeCompare(safeString(a?.data)));
}

function applyPeriodFilter(list, periodId, now = new Date()) {
  const option = HISTORICO_PERIOD_OPTIONS.find((period) => period.id === periodId);
  if (!option || option.days === null) return list;

  const cutoff = safeDate(now) || new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - option.days);
  const cutoffValue = cutoff.toISOString();
  return list.filter((registro) => safeString(registro?.data) >= cutoffValue);
}

function applyTipoFilter(list, tipoId) {
  if (!tipoId) return list;
  const option = HISTORICO_TIPO_OPTIONS.find((tipo) => tipo.id === tipoId);
  if (!option) return list;
  return list.filter((registro) => {
    const normalized = safeString(registro?.tipo).toLowerCase();
    return option.match.some((keyword) => normalized.includes(keyword));
  });
}

function matchesSearch(registro, query, equipamentosById) {
  if (!query) return true;
  const equipamento = equipamentosById.get(safeString(registro?.equipId));
  return [registro?.obs, registro?.tipo, equipamento?.nome, registro?.tecnico].some((value) =>
    safeString(value).toLowerCase().includes(query),
  );
}

export function getTypePillInfo(tipo) {
  const label = safeString(tipo).trim();
  const normalized = label.toLowerCase();
  if (!normalized) return { color: 'cyan', label: '-' };

  for (const option of HISTORICO_TIPO_OPTIONS) {
    if (option.match.some((keyword) => normalized.includes(keyword))) {
      return { color: option.color, label };
    }
  }
  return { color: 'cyan', label };
}

export function getSummaryMetrics(list = []) {
  const registros = asArray(list);
  const totalServicos = registros.length;
  const custoTotal = registros.reduce(
    (acc, registro) => acc + toNumber(registro?.custoPecas) + toNumber(registro?.custoMaoObra),
    0,
  );
  const preventivas = registros
    .filter((registro) => safeString(registro?.tipo).trim().toLowerCase().includes('preventiva'))
    .sort((a, b) => safeString(a?.data).localeCompare(safeString(b?.data)));

  let mediaDiasPreventiva = null;
  if (preventivas.length >= 2) {
    const intervals = [];
    for (let index = 1; index < preventivas.length; index += 1) {
      const previous = safeDate(preventivas[index - 1]?.data);
      const current = safeDate(preventivas[index]?.data);
      if (!previous || !current) continue;
      const diffMs = current.getTime() - previous.getTime();
      if (diffMs > 0) intervals.push(diffMs / DAY_MS);
    }
    if (intervals.length) {
      mediaDiasPreventiva = Math.round(
        intervals.reduce((acc, value) => acc + value, 0) / intervals.length,
      );
    }
  }

  return { totalServicos, custoTotal, mediaDiasPreventiva };
}

export function getHistInsights(list = [], equipamentos = []) {
  const equipsAtendidosSet = new Set();
  let preventivasCount = 0;
  let corretivasCount = 0;

  asArray(list).forEach((registro) => {
    if (registro?.equipId) equipsAtendidosSet.add(registro.equipId);
    const tipoNorm = safeString(registro?.tipo).toLowerCase();
    if (tipoNorm.includes('preventiva')) preventivasCount += 1;
    if (tipoNorm.includes('corretiva')) corretivasCount += 1;
  });

  const equipamentosById = buildLookup(equipamentos);
  let equipsAtencao = 0;
  equipsAtendidosSet.forEach((equipId) => {
    const equipamento = equipamentosById.get(safeString(equipId));
    const status = safeString(equipamento?.status).toLowerCase();
    if (status === 'warn' || status === 'danger') equipsAtencao += 1;
  });

  return {
    preventivasCount,
    corretivasCount,
    equipsAtendidos: equipsAtendidosSet.size,
    equipsAtencao,
  };
}

export function getRecurringEquips(list = [], days = 14, threshold = 3, now = new Date()) {
  const registros = asArray(list);
  if (!registros.length) return [];
  const reference = safeDate(now) || new Date();
  const cutoffMs = reference.getTime() - days * DAY_MS;
  const byEquip = new Map();

  registros.forEach((registro) => {
    if (!registro?.equipId || !registro?.data) return;
    const date = safeDate(registro.data);
    if (!date || date.getTime() < cutoffMs) return;
    const equipId = safeString(registro.equipId);
    byEquip.set(equipId, (byEquip.get(equipId) || 0) + 1);
  });

  return Array.from(byEquip.entries())
    .filter(([, count]) => count >= threshold)
    .map(([equipId, count]) => ({ equipId, count }))
    .sort((a, b) => b.count - a.count);
}

export function getProximaStatus(proximaIso, now = new Date()) {
  if (!proximaIso) return null;
  const days = daysDiff(proximaIso, now);
  if (!Number.isFinite(days)) return null;

  if (days < 0) {
    const abs = Math.abs(days);
    return {
      tone: 'danger',
      label: `Vencida ha ${abs} ${abs === 1 ? 'dia' : 'dias'}`,
      days,
    };
  }
  if (days === 0) return { tone: 'warn', label: 'Vence hoje', days: 0 };
  if (days <= 7) {
    return {
      tone: 'warn',
      label: `Vence em ${days} ${days === 1 ? 'dia' : 'dias'}`,
      days,
    };
  }
  return { tone: 'neutral', label: `Próxima em ${days} dias`, days };
}

export function getEquipStatusPill(equipamento) {
  const status = safeString(equipamento?.status).toLowerCase();
  if (!status) return null;
  const tone = status === 'danger' ? 'danger' : status === 'warn' ? 'warn' : 'ok';
  const defaultLabels = {
    ok: 'Em dia',
    warn: 'Atenção',
    danger: 'Crítico',
  };
  const label = safeString(equipamento?.statusDescricao).trim() || defaultLabels[tone] || 'Em dia';
  return { tone, label };
}

export function getTodaySummary(registros = [], now = new Date()) {
  const today = localDateString(now);
  const todayRegs = asArray(registros).filter(
    (registro) => safeString(registro?.data).slice(0, 10) === today,
  );
  const equipIds = new Set(todayRegs.map((registro) => registro?.equipId).filter(Boolean));
  return {
    totalServicosHoje: todayRegs.length,
    totalEquipHoje: equipIds.size,
  };
}

function createAttentionItem({
  id,
  tone = 'warn',
  title,
  reason,
  ctaLabel = 'Resolver',
  equipId = null,
}) {
  return { id, tone, title, reason, ctaLabel, equipId };
}

export function getAttentionItems({ registros = [], equipamentos = [], now = new Date() }) {
  const list = [];
  const byEquip = buildLookup(equipamentos);
  const latestByEquip = new Map();

  sortByDateDesc(
    asArray(registros).filter((registro) => registro?.equipId && registro?.data),
  ).forEach((registro) => {
    const equipId = safeString(registro.equipId);
    if (!latestByEquip.has(equipId)) latestByEquip.set(equipId, registro);
  });

  latestByEquip.forEach((registro, equipId) => {
    const equipamento = byEquip.get(equipId);
    const proxima = getProximaStatus(registro?.proxima, now);
    const eqName = safeString(equipamento?.nome).trim() || 'Equipamento';
    if (proxima?.tone === 'danger') {
      list.push(
        createAttentionItem({
          id: `proxima-${equipId}`,
          tone: 'danger',
          title: eqName,
          reason: proxima.label,
          ctaLabel: 'Resolver',
          equipId,
        }),
      );
    }

    const statusPill = getEquipStatusPill(equipamento);
    if (statusPill && statusPill.tone !== 'ok') {
      list.push(
        createAttentionItem({
          id: `status-${equipId}`,
          tone: statusPill.tone,
          title: eqName,
          reason: `Status: ${statusPill.label}`,
          ctaLabel: 'Ver equipamento',
          equipId,
        }),
      );
    }
  });

  return list.slice(0, 6);
}

export function groupRegistrosByDate(list = [], now = new Date()) {
  const today = localDateString(now);
  const todayDate = new Date(`${today}T00:00:00`);
  const yesterday = localDateString(new Date(todayDate.getTime() - DAY_MS));
  const dow = todayDate.getDay();
  const daysSinceMonday = dow === 0 ? 6 : dow - 1;
  const weekStart = localDateString(new Date(todayDate.getTime() - daysSinceMonday * DAY_MS));
  const monthStart = localDateString(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  const buckets = [
    { id: 'hoje', label: 'Hoje', items: [] },
    { id: 'ontem', label: 'Ontem', items: [] },
    { id: 'semana', label: 'Esta semana', items: [] },
    { id: 'mes', label: 'Este mes', items: [] },
    { id: 'antigos', label: 'Anteriores', items: [] },
  ];
  const byId = Object.fromEntries(buckets.map((bucket) => [bucket.id, bucket]));

  asArray(list).forEach((registro) => {
    const day = safeString(registro?.data).slice(0, 10);
    if (!day) byId.antigos.items.push(registro);
    else if (day === today) byId.hoje.items.push(registro);
    else if (day === yesterday) byId.ontem.items.push(registro);
    else if (day >= weekStart) byId.semana.items.push(registro);
    else if (day >= monthStart) byId.mes.items.push(registro);
    else byId.antigos.items.push(registro);
  });

  return buckets.filter((bucket) => bucket.items.length > 0);
}

function buildActiveChips(filters) {
  const chips = [];
  if (filters.setorLabel) {
    chips.push({
      key: 'Setor',
      value: filters.setorLabel,
      clearAction: HISTORICO_ACTIONS.clearSetor,
    });
  }
  if (filters.equipLabel) {
    chips.push({
      key: 'Equipamento',
      value: filters.equipLabel,
      clearAction: HISTORICO_ACTIONS.clearEquip,
    });
  }
  const tipoOption = HISTORICO_TIPO_OPTIONS.find((tipo) => tipo.id === filters.tipo);
  if (tipoOption) {
    chips.push({ key: 'Tipo', value: tipoOption.label, clearAction: HISTORICO_ACTIONS.clearTipo });
  }
  const periodOption = HISTORICO_PERIOD_OPTIONS.find((period) => period.id === filters.period);
  if (periodOption && periodOption.id !== 'tudo') {
    chips.push({
      key: 'Periodo',
      value: periodOption.label,
      clearAction: HISTORICO_ACTIONS.clearPeriod,
    });
  }
  if (filters.busca) {
    chips.push({
      key: 'Busca',
      value: `"${filters.busca}"`,
      clearAction: HISTORICO_ACTIONS.clearBusca,
    });
  }
  return chips;
}

function buildCardItem(registro, { equipamentosById, setoresById, clientesById, now }) {
  const equipamento = equipamentosById.get(safeString(registro?.equipId));
  const setor = setoresById.get(safeString(equipamento?.setorId));
  const cliente = clientesById.get(safeString(equipamento?.clienteId));
  const custoPecas = toNumber(registro?.custoPecas);
  const custoMaoObra = toNumber(registro?.custoMaoObra);
  const id = safeString(registro?.id);

  return {
    id,
    equipId: safeString(registro?.equipId),
    data: safeString(registro?.data),
    serviceTitle: safeString(registro?.tipo, 'Servico').trim() || 'Servico',
    obs: safeString(registro?.obs),
    tecnico: safeString(registro?.tecnico),
    pecas: safeString(registro?.pecas),
    prioridade: safeString(registro?.prioridade).toLowerCase(),
    status: safeString(registro?.status, 'ok'),
    equipmentName: safeString(equipamento?.nome, '-'),
    equipmentTag: safeString(equipamento?.tag || equipamento?.local),
    setorName: safeString(setor?.nome),
    clienteName: safeString(cliente?.nome),
    typePill: getTypePillInfo(registro?.tipo),
    statusPill: getEquipStatusPill(equipamento),
    proximaStatus: getProximaStatus(registro?.proxima, now),
    costTotal: custoPecas + custoMaoObra,
    hasPhotos: asArray(registro?.fotos).length > 0,
    isToday: safeString(registro?.data).slice(0, 10) === localDateString(now),
    actions: {
      edit: { action: HISTORICO_ACTIONS.editReg, id },
      delete: { action: HISTORICO_ACTIONS.deleteReg, id },
      toggleMenu: { histAction: HISTORICO_ACTIONS.toggleCardMenu, id },
      filterEquip: registro?.equipId
        ? { histAction: HISTORICO_ACTIONS.filterEquip, equipId: safeString(registro.equipId) }
        : null,
    },
  };
}

export function buildHistoricoViewModel({
  registros = [],
  equipamentos = [],
  setores = [],
  clientes = [],
  filters = {},
  clienteFilter = { id: null, nome: null },
  isPro = false,
  now = new Date(),
} = {}) {
  const equipamentosList = asArray(equipamentos);
  const setoresList = asArray(setores);
  const clientesList = asArray(clientes);
  const equipamentosById = buildLookup(equipamentosList);
  const setoresById = buildLookup(setoresList);
  const clientesById = buildLookup(clientesList);
  const busca = safeString(filters.busca).toLowerCase();
  const setorId = safeString(filters.setorId);
  const equipId = safeString(filters.equipId);
  const period = normalizePeriod(filters.period);
  const tipo = normalizeTipo(filters.tipo);
  const clienteId = safeString(clienteFilter?.id);
  const clienteNome = safeString(clienteFilter?.nome);

  let list = sortByDateDesc(asArray(registros).filter(validRegistro));

  if (setorId) {
    const equipIdsNoSetor = new Set(
      equipamentosList
        .filter((equipamento) => safeString(equipamento?.setorId) === setorId)
        .map((equipamento) => safeString(equipamento?.id)),
    );
    list = list.filter((registro) => equipIdsNoSetor.has(safeString(registro?.equipId)));
  }
  if (equipId) list = list.filter((registro) => safeString(registro?.equipId) === equipId);
  if (clienteId) {
    const equipIdsForClient = new Set(
      equipamentosList
        .filter((equipamento) => safeString(equipamento?.clienteId) === clienteId)
        .map((equipamento) => safeString(equipamento?.id)),
    );
    list = list.filter((registro) => equipIdsForClient.has(safeString(registro?.equipId)));
  }
  list = applyPeriodFilter(list, period, now);
  list = applyTipoFilter(list, tipo);
  if (busca) list = list.filter((registro) => matchesSearch(registro, busca, equipamentosById));

  const activeFilters = {
    period,
    tipo,
    busca,
    setorLabel: setorId ? safeString(setoresById.get(setorId)?.nome) : '',
    equipLabel: equipId ? safeString(equipamentosById.get(equipId)?.nome) : '',
  };
  const activeChips = buildActiveChips(activeFilters);
  const filtered = Boolean(busca || setorId || equipId || period !== 'tudo' || tipo || clienteId);
  const summaryMetrics = getSummaryMetrics(list);
  const insights = getHistInsights(list, equipamentosList);
  const recurring = getRecurringEquips(list, 14, 3, now);
  const groups = groupRegistrosByDate(list, now);
  const items = list.map((registro) =>
    buildCardItem(registro, { equipamentosById, setoresById, clientesById, now }),
  );

  return {
    list,
    items,
    groups,
    countLabel: list.length
      ? `${list.length} registro${list.length !== 1 ? 's' : ''}`
      : 'Sem registros',
    filtered,
    activeFilters,
    activeChips,
    clienteFilter: { id: clienteId || null, nome: clienteNome || null },
    emptyState: list.length ? null : { kind: filtered ? 'filtered' : 'empty' },
    todaySummary: getTodaySummary(list, now),
    attentionItems: getAttentionItems({
      registros: asArray(registros),
      equipamentos: equipamentosList,
      now,
    }),
    summary: {
      ...summaryMetrics,
      insights,
      recurring,
    },
    recurring,
    filters: {
      busca,
      setorId,
      equipId,
      period,
      tipo,
    },
    lookups: {
      equipamentosById,
      setoresById,
      clientesById,
    },
    isPro,
  };
}
