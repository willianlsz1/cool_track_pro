function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safeStatus(value) {
  return value === 'warn' || value === 'danger' || value === 'ok' ? value : 'ok';
}

function readActionPriority(getActionPriority, eq) {
  try {
    return Number(getActionPriority?.(eq)?.actionPriorityScore) || 0;
  } catch {
    return 0;
  }
}

export function buildEquipamentosHeaderViewModel({
  equipamentos = [],
  activeQuickFilter = null,
  activeClienteId = null,
  activeClienteNome = '',
  activeSectorId = null,
  kpis = {},
  preventivaVencidaIds = [],
  getActionPriority = null,
} = {}) {
  const safeEquipamentos = asArray(equipamentos);
  const preventivaVencidaSet = new Set(asArray(preventivaVencidaIds).map((id) => safeString(id)));
  const pending = safeEquipamentos
    .filter((eq) => {
      const isCritico = safeStatus(eq?.status) === 'danger';
      const isVencido = preventivaVencidaSet.has(safeString(eq?.id));
      return isCritico || isVencido;
    })
    .sort((a, b) => {
      const aCrit = safeStatus(a?.status) === 'danger' ? 1 : 0;
      const bCrit = safeStatus(b?.status) === 'danger' ? 1 : 0;
      if (bCrit !== aCrit) return bCrit - aCrit;
      return readActionPriority(getActionPriority, b) - readActionPriority(getActionPriority, a);
    })
    .slice(0, 3)
    .map((eq) => ({
      id: safeString(eq?.id),
      name: safeString(eq?.nome, 'Equipamento'),
    }));

  const active = activeQuickFilter || 'todos';
  const filtersVisible = safeEquipamentos.length > 0;
  const filterDefinitions = [
    { id: 'todos', label: 'Todos', count: safeEquipamentos.length, tone: 'neutral' },
    { id: 'em-atencao', label: 'Em atenção', count: Number(kpis.emAtencao) || 0, tone: 'warn' },
    { id: 'criticos', label: 'Críticos', count: Number(kpis.criticos) || 0, tone: 'danger' },
    { id: 'sem-setor', label: 'Sem setor', count: Number(kpis.semSetor) || 0, tone: 'neutral' },
    {
      id: 'preventiva-vencida',
      label: 'Preventiva vencida',
      count: preventivaVencidaSet.size,
      tone: 'cyan',
    },
  ];

  const contextVisible = Boolean(activeClienteId || activeSectorId);
  const contextLabel = activeSectorId
    ? `Filtrando: ${activeSectorId === '__sem_setor__' ? 'Sem setor' : 'Setor'}`
    : `Filtrando: Cliente ${safeString(activeClienteNome)}`;

  return {
    hero: {
      visible: safeEquipamentos.length > 0 && pending.length > 0,
      title: 'Atenção agora',
      subtitle: pending.length
        ? `${pending.length} equipamento${pending.length !== 1 ? 's' : ''} precisando ação imediata.`
        : '',
      items: pending,
    },
    filters: {
      visible: filtersVisible,
      chips: filtersVisible
        ? filterDefinitions.map((chip) => ({
            ...chip,
            active: chip.id === active,
            empty: chip.count === 0 && chip.id !== 'todos',
          }))
        : [],
    },
    context: {
      visible: contextVisible,
      label: contextVisible ? contextLabel : '',
    },
  };
}
