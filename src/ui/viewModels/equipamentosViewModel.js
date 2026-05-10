import { EQUIPAMENTOS_STATUS_FILTERS } from './equipamentosContracts.js';

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

function safeScore(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function optionSet(values) {
  return new Set(
    asArray(values)
      .map((value) => safeString(value))
      .filter(Boolean),
  );
}

function buildLookup(items) {
  return new Map(
    asArray(items)
      .filter((item) => item && item.id)
      .map((item) => [String(item.id), item]),
  );
}

function normalizeStatusFilter(statusFilter) {
  const value = safeString(statusFilter);
  return EQUIPAMENTOS_STATUS_FILTERS.includes(value) ? value : '';
}

function readActionPriority(getActionPriority, eq) {
  try {
    return safeScore(getActionPriority?.(eq)?.actionPriorityScore);
  } catch {
    return 0;
  }
}

function readPriorityLevel(getPriority, eq) {
  try {
    return safeScore(getPriority?.(eq)?.priorityLevel);
  } catch {
    return 0;
  }
}

function readRiskScore(getRisk, eq) {
  try {
    return safeScore(getRisk?.(eq)?.score);
  } catch {
    return 0;
  }
}

function readIsFullyIdle(isFullyIdle, eq) {
  try {
    return Boolean(isFullyIdle?.(eq));
  } catch {
    return false;
  }
}

function buildAllowedIds({
  equipamentos,
  statusFilter,
  preventiva7dIds,
  preventiva30dIds,
  preventivaVencidaIds,
  getPriority,
}) {
  if (statusFilter === 'preventiva-7d') return optionSet(preventiva7dIds);
  if (statusFilter === 'preventiva-30d') return optionSet(preventiva30dIds);
  if (statusFilter === 'preventiva-vencida') return optionSet(preventivaVencidaIds);

  if (statusFilter === 'em-atencao' || statusFilter === 'em-atenção') {
    return new Set(
      equipamentos
        .filter((eq) => {
          const status = safeStatus(eq?.status);
          if (status === 'danger') return false;
          return readPriorityLevel(getPriority, eq) >= 3 || status === 'warn';
        })
        .map((eq) => safeString(eq?.id))
        .filter(Boolean),
    );
  }

  if (statusFilter === 'criticos') {
    return new Set(
      equipamentos
        .filter((eq) => safeStatus(eq?.status) === 'danger')
        .map((eq) => safeString(eq?.id))
        .filter(Boolean),
    );
  }

  return null;
}

function getClienteNome(eq, clientesById) {
  return safeString(clientesById.get(safeString(eq?.clienteId))?.nome);
}

function getSetorNome(eq, setoresById) {
  return safeString(setoresById.get(safeString(eq?.setorId))?.nome);
}

function matchesSearch(eq, query, clientesById, setoresById) {
  if (!query) return true;
  const searchable = [
    eq?.nome,
    eq?.local,
    eq?.tag,
    getClienteNome(eq, clientesById),
    getSetorNome(eq, setoresById),
  ];
  return searchable.some((value) => safeString(value).toLowerCase().includes(query));
}

function buildEmptyState({
  hasAnyEquipamentos,
  filtro,
  setorId,
  clienteId,
  clienteNome,
  statusFilter,
}) {
  if (clienteId) {
    const titleName = safeString(clienteNome, 'este cliente') || 'este cliente';
    return {
      title: `${titleName} ainda não tem equipamentos`,
      description:
        'Adicione o primeiro equipamento deste cliente para registrar serviços com histórico certo.',
      cta: {
        label: 'Adicionar primeiro equipamento',
        action: 'eq-add-for-cliente',
        id: clienteId,
      },
    };
  }

  if (setorId === '__sem_setor__') {
    return {
      title: 'Nenhum equipamento sem setor',
      description: 'Todos os equipamentos já estão vinculados a um setor.',
      cta: null,
    };
  }

  if (setorId) {
    return {
      title: 'Nenhum equipamento neste setor',
      description: 'Cadastre ou mova equipamentos para este setor quando fizer sentido.',
      cta: null,
    };
  }

  if (statusFilter === 'em-atencao' || statusFilter === 'em-atenção') {
    return {
      title: 'Nenhum equipamento pedindo atenção',
      description: 'Nada crítico agora. Continue acompanhando as próximas preventivas.',
      cta: null,
    };
  }

  if (statusFilter === 'criticos') {
    return {
      title: 'Nenhum equipamento crítico',
      description: 'Tudo operacional. Volte aqui se algum alerta aparecer.',
      cta: null,
    };
  }

  if (
    statusFilter === 'preventiva-7d' ||
    statusFilter === 'preventiva-30d' ||
    statusFilter === 'preventiva-vencida'
  ) {
    return {
      title: 'Nenhuma preventiva vencida',
      description: 'Agenda de manutenção em dia.',
      cta: null,
    };
  }

  if (!filtro && !hasAnyEquipamentos) {
    return {
      title: 'Nenhum equipamento ainda',
      description: 'Cadastre o primeiro equipamento para registrar serviços no lugar certo.',
      cta: {
        label: '+ Novo equipamento',
        action: 'open-modal',
        id: 'modal-add-eq',
      },
    };
  }

  return {
    title: 'Nenhum equipamento encontrado',
    description: 'Tente outro termo, confira filtros ou cadastre um novo equipamento.',
    cta: {
      label: '+ Novo equipamento',
      action: 'open-modal',
      id: 'modal-add-eq',
    },
  };
}

function buildQuickMove({ clienteId, setorId, sortedItems, setores }) {
  if (!clienteId || setorId !== '__sem_setor__' || !sortedItems.length) return null;

  const setoresDoCliente = setores.filter((setor) => setor?.clienteId === clienteId);
  const setoresOrfaos = setores.filter((setor) => !setor?.clienteId);
  if (!setoresDoCliente.length && !setoresOrfaos.length) return null;

  return {
    equipIds: sortedItems.map((eq) => safeString(eq?.id)).filter(Boolean),
    setoresDoCliente,
    setoresOrfaos,
  };
}

export function buildEquipamentosViewModel({
  equipamentos,
  clientes,
  setores,
  filtro = '',
  setorId = null,
  clienteId = null,
  clienteNome = '',
  statusFilter = '',
  preventiva7dIds = [],
  preventiva30dIds = [],
  preventivaVencidaIds = [],
  getActionPriority,
  getPriority,
  getRisk,
  isFullyIdle,
} = {}) {
  const safeEquipamentos = asArray(equipamentos);
  const safeClientes = asArray(clientes);
  const safeSetores = asArray(setores);
  const normalizedFiltro = safeString(filtro).toLowerCase();
  const normalizedSetorId = setorId === null || setorId === undefined ? null : safeString(setorId);
  const normalizedClienteId = safeString(clienteId) || null;
  const normalizedStatusFilter = normalizeStatusFilter(statusFilter);
  const clientesById = buildLookup(safeClientes);
  const setoresById = buildLookup(safeSetores);
  const allowedIds = buildAllowedIds({
    equipamentos: safeEquipamentos,
    statusFilter: normalizedStatusFilter,
    preventiva7dIds,
    preventiva30dIds,
    preventivaVencidaIds,
    getPriority,
  });

  const items = safeEquipamentos.filter((eq) => {
    if (normalizedSetorId === '__sem_setor__') {
      if (eq?.setorId) return false;
    } else if (normalizedSetorId && eq?.setorId !== normalizedSetorId) {
      return false;
    }
    if (normalizedClienteId && eq?.clienteId !== normalizedClienteId) return false;
    if (allowedIds && !allowedIds.has(safeString(eq?.id))) return false;
    return matchesSearch(eq, normalizedFiltro, clientesById, setoresById);
  });

  const sortedItems = [...items].sort((a, b) => {
    const actionDiff =
      readActionPriority(getActionPriority, b) - readActionPriority(getActionPriority, a);
    if (actionDiff !== 0) return actionDiff;
    const priorityDiff = readPriorityLevel(getPriority, b) - readPriorityLevel(getPriority, a);
    if (priorityDiff !== 0) return priorityDiff;
    return readRiskScore(getRisk, b) - readRiskScore(getRisk, a);
  });

  const idleItems = [];
  const activeItems = [];
  sortedItems.forEach((eq) => {
    if (readIsFullyIdle(isFullyIdle, eq)) idleItems.push(eq);
    else activeItems.push(eq);
  });

  return {
    equipamentos: safeEquipamentos,
    clientes: safeClientes,
    setores: safeSetores,
    filters: {
      filtro: safeString(filtro),
      setorId: normalizedSetorId,
      clienteId: normalizedClienteId,
      clienteNome: safeString(clienteNome),
      statusFilter: normalizedStatusFilter,
    },
    items,
    sortedItems,
    idleItems,
    activeItems,
    shouldUseIdleCluster: idleItems.length >= 5 && activeItems.length > 0,
    quickMove: buildQuickMove({
      clienteId: normalizedClienteId,
      setorId: normalizedSetorId,
      sortedItems,
      setores: safeSetores,
    }),
    emptyState: sortedItems.length
      ? null
      : buildEmptyState({
          hasAnyEquipamentos: safeEquipamentos.length > 0,
          filtro: safeString(filtro),
          setorId: normalizedSetorId,
          clienteId: normalizedClienteId,
          clienteNome: safeString(clienteNome),
          statusFilter: normalizedStatusFilter,
        }),
    isEmpty: safeEquipamentos.length === 0,
    isFilterEmpty: safeEquipamentos.length > 0 && sortedItems.length === 0,
    skeletonCount: Math.min(Math.max(items.length, 3), 5),
  };
}
