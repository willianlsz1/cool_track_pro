import { DAYS_60_MS, DAYS_90_MS } from './constants.js';
import { extractCity } from './helpers.js';

export function buildClienteIndex({ clientes, equipamentos, registros, nowMs = Date.now() }) {
  const idx = new Map();
  const equipsByCliente = new Map();
  const equipsById = new Map();

  equipamentos.forEach((eq) => {
    equipsById.set(eq.id, eq);
    if (!eq.clienteId) return;
    if (!equipsByCliente.has(eq.clienteId)) equipsByCliente.set(eq.clienteId, []);
    equipsByCliente.get(eq.clienteId).push(eq);
  });

  const regsByCliente = new Map();
  const startOfMonth = new Date(nowMs);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startMonthMs = startOfMonth.getTime();

  registros.forEach((registro) => {
    if (!registro.equipId) return;
    const equip = equipsById.get(registro.equipId);
    if (!equip?.clienteId) return;
    if (!regsByCliente.has(equip.clienteId)) regsByCliente.set(equip.clienteId, []);
    regsByCliente.get(equip.clienteId).push(registro);
  });

  clientes.forEach((cliente) => {
    const equips = equipsByCliente.get(cliente.id) || [];
    const regs = regsByCliente.get(cliente.id) || [];
    let lastTs = 0;
    let monthCount = 0;

    regs.forEach((registro) => {
      const ts = registro.data ? new Date(registro.data).getTime() : 0;
      if (ts > lastTs) lastTs = ts;
      if (ts >= startMonthMs) monthCount++;
    });

    const sinceLast = lastTs ? nowMs - lastTs : Number.POSITIVE_INFINITY;
    let status = 'ativo';
    if (lastTs > 0) {
      if (sinceLast > DAYS_90_MS) status = 'precisa_atencao';
      else if (sinceLast > DAYS_60_MS) status = 'sem_manutencao';
    }

    idx.set(cliente.id, {
      equipsCount: equips.length,
      servicesCount: regs.length,
      servicesThisMonth: monthCount,
      lastServiceTs: lastTs,
      sinceLast,
      status,
      displayCity: extractCity(cliente.endereco),
    });
  });

  return idx;
}

export function filterAndSortClientes(
  clientes,
  indexed,
  { searchTerm = '', statusFilter = 'todos', cityFilter = 'todas', sortBy = 'mais_ativos' },
) {
  const term = String(searchTerm).trim().toLowerCase();
  let list = clientes;

  if (term) {
    list = list.filter((cliente) => {
      const haystack = [
        cliente.nome,
        cliente.razaoSocial,
        cliente.cnpj,
        cliente.endereco,
        cliente.contato,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  if (statusFilter !== 'todos') {
    list = list.filter((cliente) => indexed.get(cliente.id)?.status === statusFilter);
  }

  if (cityFilter !== 'todas') {
    list = list.filter((cliente) => indexed.get(cliente.id)?.displayCity === cityFilter);
  }

  const dec = (a, b) => b - a;
  const asc = (a, b) => a - b;

  if (sortBy === 'mais_ativos') {
    return [...list].sort((a, b) =>
      dec(indexed.get(a.id)?.servicesCount || 0, indexed.get(b.id)?.servicesCount || 0),
    );
  }

  if (sortBy === 'recente') {
    return [...list].sort((a, b) =>
      dec(indexed.get(a.id)?.lastServiceTs || 0, indexed.get(b.id)?.lastServiceTs || 0),
    );
  }

  if (sortBy === 'antigo') {
    return [...list].sort((a, b) =>
      asc(indexed.get(a.id)?.lastServiceTs || 0, indexed.get(b.id)?.lastServiceTs || 0),
    );
  }

  if (sortBy === 'nome') {
    return [...list].sort((a, b) =>
      String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'),
    );
  }

  if (sortBy === 'equips') {
    return [...list].sort((a, b) =>
      dec(indexed.get(a.id)?.equipsCount || 0, indexed.get(b.id)?.equipsCount || 0),
    );
  }

  return list;
}
