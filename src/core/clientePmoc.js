import { Utils } from './utils.js';

function parseDate(value) {
  const iso = value ? String(value).slice(0, 10) : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : iso;
}

function addDays(isoDate, days) {
  if (!isoDate || !Number.isFinite(days) || days <= 0) return null;
  const base = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  base.setDate(base.getDate() + days);
  return Utils.localDateString(base);
}

function getEquipClienteId(equipamento) {
  return equipamento?.clienteId ?? equipamento?.cliente_id ?? null;
}

function resolvePeriodicidadeDias(equipamento) {
  const value = Number.parseInt(equipamento?.periodicidadePreventivaDias, 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function getSetorLabel(equipamento, setoresById) {
  if (equipamento?.setorNome) return String(equipamento.setorNome).trim();
  if (equipamento?.local) return String(equipamento.local).trim();
  if (equipamento?.ambiente) return String(equipamento.ambiente).trim();
  const setorId = equipamento?.setorId ?? equipamento?.setor_id;
  if (setorId && setoresById.has(setorId)) return setoresById.get(setorId);
  return '';
}

function summarizeEquipamento(equipamento, registros = [], todayIso) {
  const periodicidadeDias = resolvePeriodicidadeDias(equipamento);
  const registrosOrdenados = [...registros].sort((a, b) =>
    String(b?.data || '').localeCompare(String(a?.data || '')),
  );
  const ultimoRegistro = registrosOrdenados[0] || null;
  const ultimoServico = parseDate(ultimoRegistro?.data);
  const proximaByRegistro = parseDate(ultimoRegistro?.proxima);
  const proximaManutencao = proximaByRegistro || addDays(ultimoServico, periodicidadeDias);

  let status = 'sem_registro';
  let statusLabel = 'Sem registro';
  if (ultimoRegistro) {
    if (proximaManutencao && proximaManutencao < todayIso) {
      status = 'vencido';
      statusLabel = 'Vencido';
    } else {
      status = 'em_dia';
      statusLabel = 'Em dia';
    }
  }

  return {
    equipamento,
    periodicidadeDias,
    periodicidadeLabel: periodicidadeDias
      ? `${periodicidadeDias} dias`
      : 'Sem periodicidade definida',
    ultimoServico,
    proximaManutencao,
    status,
    statusLabel,
    hasRegistro: Boolean(ultimoRegistro),
    hasPeriodicidade: Boolean(periodicidadeDias),
  };
}

function calcPrevistosAnuais(equipamentosResumo = []) {
  return equipamentosResumo.reduce((total, item) => {
    if (!item.periodicidadeDias) return total;
    return total + Math.max(1, Math.floor(365 / item.periodicidadeDias));
  }, 0);
}

function statusExplanation(status) {
  if (status === 'em_dia') return 'Em dia: manutenções registradas dentro do prazo.';
  if (status === 'atencao')
    return 'Atenção: há equipamento sem registro ou sem periodicidade definida.';
  if (status === 'atrasado') return 'Atrasado: existe equipamento com manutenção vencida.';
  return 'Sem cronograma: cadastre equipamentos e registre o primeiro serviço.';
}

export function buildClientePmocDetails({
  cliente,
  equipamentos = [],
  registros = [],
  setores = [],
  year = new Date().getFullYear(),
  today = Utils.localDateString(new Date()),
} = {}) {
  const clienteId = cliente?.id;
  const equipamentosCliente = (equipamentos || []).filter(
    (eq) => getEquipClienteId(eq) === clienteId,
  );
  const regsByEquipId = new Map();
  (registros || []).forEach((registro) => {
    const equipId = registro?.equipId ?? registro?.equip_id;
    if (!equipId) return;
    if (!regsByEquipId.has(equipId)) regsByEquipId.set(equipId, []);
    regsByEquipId.get(equipId).push(registro);
  });

  const setoresById = new Map(
    (setores || [])
      .filter((setor) => setor?.id)
      .map((setor) => [setor.id, String(setor.nome || '').trim()]),
  );

  const equipamentosResumo = equipamentosCliente.map((equipamento) => {
    const resumo = summarizeEquipamento(
      equipamento,
      regsByEquipId.get(equipamento.id) || [],
      today,
    );
    return {
      ...resumo,
      nome: equipamento?.nome || 'Equipamento sem nome',
      setorLabel: getSetorLabel(equipamento, setoresById),
    };
  });

  const hasVencido = equipamentosResumo.some((item) => item.status === 'vencido');
  const hasAtencao = equipamentosResumo.some((item) => !item.hasRegistro || !item.hasPeriodicidade);

  let status = 'sem_cronograma';
  let statusLabel = 'Sem cronograma';
  if (equipamentosResumo.length) {
    if (hasVencido) {
      status = 'atrasado';
      statusLabel = 'Atrasado';
    } else if (hasAtencao) {
      status = 'atencao';
      statusLabel = 'Atenção';
    } else {
      status = 'em_dia';
      statusLabel = 'Em dia';
    }
  }

  const from = `${year}-01-01`;
  const to = `${year}-12-31`;
  const equipIds = new Set(equipamentosCliente.map((eq) => eq.id));
  const feitos = (registros || []).filter((registro) => {
    const equipId = registro?.equipId ?? registro?.equip_id;
    const data = parseDate(registro?.data);
    return equipId && equipIds.has(equipId) && data && data >= from && data <= to;
  }).length;

  const previstos = calcPrevistosAnuais(equipamentosResumo);
  const equipamentosSemRegistro = equipamentosResumo.filter((item) => !item.hasRegistro).length;
  const proximaManutencaoIso =
    equipamentosResumo
      .map((item) => item.proximaManutencao)
      .filter(Boolean)
      .sort()[0] || null;

  const ultimaAtualizacao = equipamentosResumo
    .map((item) => item.ultimoServico)
    .filter(Boolean)
    .sort()
    .at(-1);

  return {
    cliente,
    year,
    status,
    statusLabel,
    statusHelp: statusExplanation(status),
    equipamentosResumo,
    progresso: { feitos, previstos },
    equipamentosSemRegistro,
    proximaManutencaoIso,
    proximaManutencaoLabel: proximaManutencaoIso
      ? Utils.formatDate(proximaManutencaoIso)
      : 'Sem manutenção prevista',
    ultimaAtualizacao,
    ultimaAtualizacaoLabel: ultimaAtualizacao
      ? Utils.formatDate(ultimaAtualizacao)
      : 'Sem atualização',
  };
}
