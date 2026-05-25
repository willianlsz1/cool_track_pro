import { Utils } from '../../../core/utils.js';
import { HISTORICO_TIPO_OPTIONS } from '../../viewModels/historicoContracts.js';

function toNumber(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getSafeMediaUrl(value) {
  const url = String(value || '').trim();
  if (!url) return null;
  if (/^data:image\/(?:png|jpe?g|gif|webp|bmp|avif);base64,/i.test(url)) return url;
  if (/^(https?:|blob:)/i.test(url)) return url;
  if (/^(\/(?!\/)|\.\/|\.\.\/)/.test(url)) return url;
  return null;
}

export function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatBRLMoney(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getPhotoUrl(photo) {
  if (!photo) return null;
  const raw = typeof photo === 'string' ? photo : photo.url || photo.src || photo.dataUrl || null;
  return getSafeMediaUrl(raw);
}

function getTypePillInfo(tipo) {
  const normalized = (tipo || '').toLowerCase().trim();
  if (!normalized) return { color: 'cyan', label: '—' };

  for (const opt of HISTORICO_TIPO_OPTIONS) {
    if (opt.match.some((keyword) => normalized.includes(keyword))) {
      return { color: opt.color, label: tipo };
    }
  }
  return { color: 'cyan', label: tipo };
}

export function getSummaryMetrics(list) {
  const totalServicos = list.length;
  const custoTotal = list.reduce(
    (acc, reg) => acc + toNumber(reg.custoPecas) + toNumber(reg.custoMaoObra),
    0,
  );
  const preventivas = list
    .filter((reg) => (reg.tipo || '').trim().toLowerCase().includes('preventiva'))
    .sort((a, b) => a.data.localeCompare(b.data));

  let mediaDiasPreventiva = null;
  if (preventivas.length >= 2) {
    const intervals = [];
    for (let i = 1; i < preventivas.length; i += 1) {
      const previous = new Date(preventivas[i - 1].data);
      const current = new Date(preventivas[i].data);
      const diffMs = current.getTime() - previous.getTime();
      if (!Number.isNaN(diffMs) && diffMs > 0) intervals.push(diffMs / (1000 * 60 * 60 * 24));
    }
    if (intervals.length) {
      mediaDiasPreventiva = Math.round(
        intervals.reduce((acc, val) => acc + val, 0) / intervals.length,
      );
    }
  }

  return { totalServicos, custoTotal, mediaDiasPreventiva };
}

export function getHistInsights(list, equipamentos = []) {
  const equipsAtendidosSet = new Set();
  let preventivasCount = 0;
  let corretivasCount = 0;

  list.forEach((reg) => {
    if (reg.equipId) equipsAtendidosSet.add(reg.equipId);
    const tipoNorm = (reg.tipo || '').toLowerCase();
    if (tipoNorm.includes('preventiva')) preventivasCount += 1;
    if (tipoNorm.includes('corretiva')) corretivasCount += 1;
  });

  const equipsById = new Map((equipamentos || []).map((e) => [e.id, e]));
  let equipsAtencao = 0;
  equipsAtendidosSet.forEach((equipId) => {
    const eq = equipsById.get(equipId);
    const status = (eq?.status || '').toLowerCase();
    if (status === 'warn' || status === 'danger') equipsAtencao += 1;
  });

  return {
    preventivasCount,
    corretivasCount,
    equipsAtendidos: equipsAtendidosSet.size,
    equipsAtencao,
  };
}

export function getRecurringEquips(list, days = 14, threshold = 3) {
  if (!Array.isArray(list) || !list.length) return [];
  const cutoffMs = Date.now() - days * 86400000;
  const byEquip = new Map();
  list.forEach((reg) => {
    if (!reg.equipId || !reg.data) return;
    const ts = new Date(reg.data).getTime();
    if (!Number.isFinite(ts) || ts < cutoffMs) return;
    byEquip.set(reg.equipId, (byEquip.get(reg.equipId) || 0) + 1);
  });
  return Array.from(byEquip.entries())
    .filter(([, count]) => count >= threshold)
    .map(([equipId, count]) => ({ equipId, count }))
    .sort((a, b) => b.count - a.count);
}

export function getProximaStatus(proximaIso) {
  if (!proximaIso) return null;
  const diasRaw = Utils.daysDiff(String(proximaIso).slice(0, 10));
  if (!Number.isFinite(diasRaw)) return null;

  if (diasRaw < 0) {
    const abs = Math.abs(diasRaw);
    return {
      tone: 'danger',
      label: `Vencida há ${abs} ${abs === 1 ? 'dia' : 'dias'}`,
      days: diasRaw,
    };
  }
  if (diasRaw === 0) {
    return { tone: 'warn', label: 'Vence hoje', days: 0 };
  }
  if (diasRaw <= 7) {
    return {
      tone: 'warn',
      label: `Vence em ${diasRaw} ${diasRaw === 1 ? 'dia' : 'dias'}`,
      days: diasRaw,
    };
  }
  return {
    tone: 'neutral',
    label: `Próxima em ${diasRaw} dias`,
    days: diasRaw,
  };
}

export function getEquipStatusPill(eq) {
  const status = (eq?.status || '').toLowerCase();
  if (!status) return null;
  const defaultLabels = {
    ok: 'Em dia',
    warn: 'Atenção',
    danger: 'Crítico',
  };
  const tone = status === 'danger' ? 'danger' : status === 'warn' ? 'warn' : 'ok';
  const label =
    (eq?.statusDescricao && String(eq.statusDescricao).trim()) || defaultLabels[tone] || 'Em dia';
  return { tone, label };
}

export function getTodaySummary(registros = []) {
  const today = Utils.localDateString();
  const todayRegs = (registros || []).filter((r) => String(r?.data || '').slice(0, 10) === today);
  const equipIds = new Set(todayRegs.map((r) => r?.equipId).filter(Boolean));
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

export function getAttentionItems({ registros = [], equipamentos = [] }) {
  const list = [];
  const byEquip = new Map((equipamentos || []).map((eq) => [eq.id, eq]));
  const latestByEquip = new Map();
  [...(registros || [])]
    .filter((r) => r?.equipId && r?.data)
    .sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')))
    .forEach((r) => {
      if (!latestByEquip.has(r.equipId)) latestByEquip.set(r.equipId, r);
    });

  latestByEquip.forEach((reg, equipId) => {
    const eq = byEquip.get(equipId);
    const prox = getProximaStatus(reg?.proxima);
    const eqName = eq?.nome?.trim() || 'Equipamento';
    if (prox?.tone === 'danger') {
      list.push(
        createAttentionItem({
          id: `proxima-${equipId}`,
          tone: 'danger',
          title: eqName,
          reason: prox.label,
          ctaLabel: 'Resolver',
          equipId,
        }),
      );
    }

    const statusPill = getEquipStatusPill(eq);
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

function groupRegistrosByDate(list) {
  const today = Utils.localDateString();
  const todayDate = new Date(today + 'T00:00:00');
  const yesterdayDate = new Date(todayDate.getTime() - 24 * 60 * 60 * 1000);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);
  const dow = todayDate.getDay();
  const daysSinceMonday = dow === 0 ? 6 : dow - 1;
  const weekStartDate = new Date(todayDate.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000);
  const weekStart = weekStartDate.toISOString().slice(0, 10);
  const monthStartDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  const monthStart = monthStartDate.toISOString().slice(0, 10);

  const buckets = [
    { id: 'hoje', label: 'Hoje', items: [] },
    { id: 'ontem', label: 'Ontem', items: [] },
    { id: 'semana', label: 'Esta semana', items: [] },
    { id: 'mes', label: 'Este mês', items: [] },
    { id: 'antigos', label: 'Anteriores', items: [] },
  ];
  const byId = Object.fromEntries(buckets.map((b) => [b.id, b]));

  for (const r of list) {
    const day = (r.data || '').slice(0, 10);
    if (!day) {
      byId.antigos.items.push(r);
      continue;
    }
    if (day === today) byId.hoje.items.push(r);
    else if (day === yesterday) byId.ontem.items.push(r);
    else if (day >= weekStart) byId.semana.items.push(r);
    else if (day >= monthStart) byId.mes.items.push(r);
    else byId.antigos.items.push(r);
  }

  return buckets.filter((b) => b.items.length > 0);
}

function getTimelineDateLabel(registro, groupId) {
  const dateInGroupContext = groupId && groupId !== 'antigos';
  if (!dateInGroupContext) return Utils.formatDatetime(registro?.data);

  const date = registro?.data ? new Date(registro.data) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : Utils.formatDatetime(registro?.data);
}

function buildTimelineHeadPills(registro, equipamento) {
  const prioridade = (registro?.prioridade || '').toLowerCase();
  const typePill = getTypePillInfo(registro?.tipo);
  const equipStatusPill = getEquipStatusPill(equipamento);
  const showEquipStatusPill = equipStatusPill && equipStatusPill.tone !== 'ok';
  const showPrioridadePill = prioridade === 'alta' || prioridade === 'baixa';

  return [
    String(registro?.data || '').slice(0, 10) === Utils.localDateString()
      ? { id: 'today', label: 'Hoje', color: 'success' }
      : null,
    showEquipStatusPill
      ? {
          id: 'equip-status',
          label: equipStatusPill.label,
          color: equipStatusPill.tone === 'danger' ? 'red' : 'amber',
          title: 'Status atual do equipamento',
        }
      : null,
    showPrioridadePill
      ? {
          id: 'prioridade',
          label: prioridade === 'alta' ? 'Alta prioridade' : 'Baixa prioridade',
          color: prioridade === 'alta' ? 'red' : 'cyan',
        }
      : null,
    {
      id: 'type',
      label: typePill.label,
      color: typePill.color,
    },
  ].filter(Boolean);
}

function buildTimelineMeta(registro) {
  const chunks = [];
  const custoPecas = toNumber(registro?.custoPecas);
  const custoMao = toNumber(registro?.custoMaoObra);
  const custoTotal = custoPecas + custoMao;

  if (registro?.tecnico) {
    chunks.push({ id: 'tecnico', icon: 'user', text: registro.tecnico });
  }
  if (registro?.pecas) {
    chunks.push({ id: 'pecas', icon: 'box', text: registro.pecas });
  }
  if (custoTotal > 0) {
    chunks.push({
      id: 'custo',
      className: 'meta-mono',
      prefix: 'Total: ',
      highlight: formatBRL(custoTotal),
      highlightClassName: 'meta-cyan',
      details:
        custoPecas > 0 && custoMao > 0
          ? `(peças ${formatBRLMoney(custoPecas)} · mão ${formatBRLMoney(custoMao)})`
          : '',
    });
  }
  if (registro?.proxima) {
    const proxInfo = getProximaStatus(registro.proxima) || {
      tone: 'neutral',
      label: `Próxima: ${Utils.formatDate(registro.proxima)}`,
    };
    chunks.push({
      id: 'proxima',
      icon: 'calendar',
      text: proxInfo.label,
      textClassName:
        proxInfo.tone === 'danger'
          ? 'meta-danger'
          : proxInfo.tone === 'warn'
            ? 'meta-warn'
            : 'meta-neutral',
      title: 'Próxima: ' + Utils.formatDate(registro.proxima),
    });
  }

  return chunks;
}

function buildTimelineItemModel(
  registro,
  {
    isFirst,
    equipamentos,
    setoresById,
    clientesById,
    isPro = false,
    currentFilterEquipId = '',
    groupId = '',
    findEquipById = () => null,
  },
) {
  const eq =
    equipamentos.find((item) => item.id === registro?.equipId) || findEquipById(registro?.equipId);
  const setorNome = eq?.setorId ? setoresById.get(eq.setorId)?.nome || '' : '';
  const clienteNome = eq?.clienteId ? clientesById.get(eq.clienteId)?.nome || '' : '';
  const equipTag = (eq?.tag || eq?.local || '').trim();
  const setorTag = setorNome ? setorNome.slice(0, 12).toUpperCase().replace(/\s+/g, ' ') : '';
  const photoUrls = asArray(registro?.fotos).map(getPhotoUrl).filter(Boolean);
  const safeStatus = Utils.safeStatus(registro?.status);

  return {
    id: String(registro?.id || ''),
    equipId: String(registro?.equipId || ''),
    isLatest: Boolean(isFirst),
    status: safeStatus,
    headerDateLabel: getTimelineDateLabel(registro, groupId),
    headPills: buildTimelineHeadPills(registro, eq),
    serviceTitle: (registro?.tipo || 'Serviço').trim(),
    equipmentName: eq?.nome ?? '—',
    setorName: setorNome,
    setorTag,
    equipTag,
    context:
      isPro && (clienteNome || setorNome || eq?.nome)
        ? [clienteNome, setorNome, eq?.nome].filter(Boolean).join(' · ')
        : '',
    obs: registro?.obs || '',
    meta: buildTimelineMeta(registro),
    photoUrls: photoUrls.slice(0, 3),
    extraPhotoCount: Math.max(0, photoUrls.length - 3),
    showFilterEquip: Boolean(registro?.equipId && currentFilterEquipId !== registro.equipId),
  };
}

function buildTimelineEmptyState(hasFilters) {
  if (hasFilters) {
    return {
      variant: 'default',
      icon: '\u{1f50d}',
      title: 'Nenhum resultado para esse filtro',
      description: 'Tente outro termo ou remova um filtro acima.',
    };
  }

  return {
    variant: 'engaging',
    ariaLabel: 'Histórico vazio',
    icon: '\u{1f4cb}',
    title: 'Nenhum serviço registrado ainda.',
    description: 'Depois do registro, seu histórico aparece aqui.',
    cta: {
      label: 'Registrar primeiro serviço',
      nav: 'registro',
    },
    microcopy: '',
  };
}

export function buildHistoricoTimelineDomViewModel({
  list,
  todaySummary,
  attentionItems,
  equipamentos,
  setoresById,
  clientesById,
  isProMode,
  currentFilterEquipId,
  hasFilters,
  findEquipById,
}) {
  let globalIdx = 0;
  const groups = groupRegistrosByDate(list).map((group) => {
    const count = group.items.length;
    const items = group.items.map((registro) => {
      const item = buildTimelineItemModel(registro, {
        isFirst: globalIdx === 0,
        equipamentos,
        setoresById,
        clientesById,
        isPro: isProMode,
        currentFilterEquipId,
        groupId: group.id,
        findEquipById,
      });
      globalIdx += 1;
      return item;
    });

    return {
      id: group.id,
      label: group.label,
      countLabel: count === 1 ? '1 serviço' : `${count} serviços`,
      items,
    };
  });

  return {
    operationSummary: todaySummary,
    attentionItems,
    groups,
    emptyState: groups.length ? null : buildTimelineEmptyState(hasFilters),
  };
}
