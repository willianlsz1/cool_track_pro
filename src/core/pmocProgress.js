function startOfYearMs(year) {
  return new Date(year, 0, 1, 0, 0, 0, 0).getTime();
}

function endOfYearMs(year) {
  return new Date(year, 11, 31, 23, 59, 59, 999).getTime();
}

function parseDateMs(value) {
  const ts = value ? new Date(value).getTime() : Number.NaN;
  return Number.isFinite(ts) ? ts : Number.NaN;
}

function calcExpectedByNow(plannedCount, year) {
  const now = Date.now();
  const start = startOfYearMs(year);
  const end = endOfYearMs(year);
  if (now <= start) return 0;
  if (now >= end) return plannedCount;
  const progress = (now - start) / (end - start);
  return plannedCount * progress;
}

function periodicidadeToPlannedCount(periodicidadeDias) {
  const dias = Number(periodicidadeDias);
  if (!Number.isFinite(dias) || dias <= 0) return 1;
  // Mantém consistência com o cronograma Jan-Dez do PDF PMOC:
  // intervalo em meses (round(dias/30)) e slots de Jan..Dez.
  const intervalMonths = Math.max(1, Math.round(dias / 30));
  return Math.floor((12 - 1) / intervalMonths) + 1;
}

function getEquipClienteId(equipamento) {
  return equipamento?.clienteId ?? equipamento?.cliente_id ?? null;
}

function getRegistroEquipId(registro) {
  return registro?.equipId ?? registro?.equip_id ?? null;
}

function isPmocExecutionType(tipo) {
  const normalized = String(tipo || '')
    .trim()
    .toLowerCase();
  if (!normalized) return false;
  if (normalized.includes('corretiv')) return false;
  return (
    normalized.includes('preventiv') ||
    normalized.includes('limpeza') ||
    normalized.includes('higieniz') ||
    normalized.includes('pmoc')
  );
}

export function getPmocSummaryForCliente({
  clienteId,
  year = new Date().getFullYear(),
  equipamentos = [],
  registros = [],
} = {}) {
  const safeYear = Number(year) || new Date().getFullYear();
  if (!clienteId) {
    return {
      year: safeYear,
      isActive: false,
      equipamentoCount: 0,
      plannedCount: 0,
      doneCount: 0,
      completionRatio: 0,
      status: 'sem_dados',
      statusLabel: 'Sem cronograma',
      activeLabel: `PMOC ${safeYear} inativo`,
      lastUpdateIso: null,
      lastUpdateLabel: 'Sem atualização',
    };
  }

  const equips = (equipamentos || []).filter((e) => getEquipClienteId(e) === clienteId);
  const equipIds = new Set(equips.map((e) => e.id));
  const from = startOfYearMs(safeYear);
  const to = endOfYearMs(safeYear);
  const regsYear = (registros || []).filter((r) => {
    const equipId = getRegistroEquipId(r);
    if (!equipId || !equipIds.has(equipId)) return false;
    const ts = parseDateMs(r.data);
    return Number.isFinite(ts) && ts >= from && ts <= to;
  });

  const plannedCount = equips.reduce(
    (sum, eq) => sum + periodicidadeToPlannedCount(eq.periodicidadePreventivaDias),
    0,
  );
  const doneCount = regsYear.reduce((acc, r) => (isPmocExecutionType(r?.tipo) ? acc + 1 : acc), 0);
  const expectedByNow = calcExpectedByNow(plannedCount, safeYear);
  const completionRatio = plannedCount > 0 ? doneCount / plannedCount : 0;
  const paceRatio = expectedByNow > 0 ? doneCount / expectedByNow : doneCount > 0 ? 1 : 0;

  let status = 'sem_dados';
  let statusLabel = 'Sem cronograma';
  if (plannedCount > 0) {
    if (paceRatio >= 1) {
      status = 'em_dia';
      statusLabel = 'Cronograma em dia';
    } else if (paceRatio >= 0.6) {
      status = 'atencao';
      statusLabel = 'Cronograma em atenção';
    } else {
      status = 'atrasado';
      statusLabel = 'Cronograma atrasado';
    }
  }

  const lastUpdateTs = regsYear.reduce((maxTs, r) => {
    const ts = parseDateMs(r.data);
    return Number.isFinite(ts) && ts > maxTs ? ts : maxTs;
  }, 0);
  const lastUpdateIso = lastUpdateTs ? new Date(lastUpdateTs).toISOString() : null;
  const lastUpdateLabel = lastUpdateTs
    ? new Date(lastUpdateTs).toLocaleDateString('pt-BR')
    : 'Sem atualização';

  const isActive = equips.length > 0;
  return {
    year: safeYear,
    isActive,
    equipamentoCount: equips.length,
    plannedCount,
    doneCount,
    completionRatio,
    status,
    statusLabel,
    activeLabel: `PMOC ${safeYear} ${isActive ? 'ativo' : 'inativo'}`,
    lastUpdateIso,
    lastUpdateLabel,
  };
}
