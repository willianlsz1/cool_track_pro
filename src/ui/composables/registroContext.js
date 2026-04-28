function normalizeId(value) {
  if (value == null) return null;
  const normalized = String(value).trim();
  return normalized || null;
}

function getEquipClienteId(equipamento) {
  return normalizeId(equipamento?.clienteId ?? equipamento?.cliente_id);
}

function getEquipSetorId(equipamento) {
  return normalizeId(equipamento?.setorId ?? equipamento?.setor_id);
}

function getSetorClienteId(setor) {
  return normalizeId(setor?.clienteId ?? setor?.cliente_id);
}

function findById(list = [], id) {
  if (!id) return null;
  return list.find((item) => normalizeId(item?.id) === id) || null;
}

function pickClienteNome(cliente) {
  return String(cliente?.nome || cliente?.razao_social || '').trim();
}

function pickClienteDocumento(cliente) {
  return String(cliente?.cnpj || cliente?.cpf || cliente?.documento || '').trim();
}

function pickClienteLocal(cliente) {
  return String(cliente?.endereco || cliente?.local || '').trim();
}

function pickClienteContato(cliente) {
  return String(cliente?.contato || cliente?.telefone || '').trim();
}

export function resolveRegistroContext(params = {}, state = {}) {
  const equipamentos = state?.equipamentos || [];
  const setores = state?.setores || [];
  const clientes = state?.clientes || [];

  const explicitEquipId = normalizeId(params?.equipId);
  const explicitSetorId = normalizeId(params?.setorId);
  const explicitClienteId = normalizeId(params?.clienteId);

  const equipamento = findById(equipamentos, explicitEquipId);

  const setorId = explicitSetorId || getEquipSetorId(equipamento) || null;
  const setor = findById(setores, setorId);

  const clienteId =
    explicitClienteId || getEquipClienteId(equipamento) || getSetorClienteId(setor) || null;
  const cliente = findById(clientes, clienteId);

  const setorNome = String(setor?.nome || equipamento?.local || equipamento?.ambiente || '').trim();
  const equipamentoNome = String(equipamento?.nome || '').trim();
  const equipamentoTag = String(equipamento?.tag || '').trim();

  const hasRouteContext = Boolean(explicitClienteId || explicitSetorId || explicitEquipId);
  const hasCompanyContext = Boolean(cliente || setor);

  return {
    hasRouteContext,
    hasCompanyContext,
    equipamento: equipamento
      ? {
          id: normalizeId(equipamento.id),
          nome: equipamentoNome,
          tag: equipamentoTag,
          setorId: getEquipSetorId(equipamento),
          clienteId: getEquipClienteId(equipamento),
        }
      : null,
    setor: setor
      ? {
          id: normalizeId(setor.id),
          nome: setorNome,
          clienteId: getSetorClienteId(setor),
        }
      : setorNome
        ? { id: setorId, nome: setorNome, clienteId: null }
        : null,
    cliente: cliente
      ? {
          id: normalizeId(cliente.id),
          nome: pickClienteNome(cliente),
          documento: pickClienteDocumento(cliente),
          localAtendimento: pickClienteLocal(cliente),
          contato: pickClienteContato(cliente),
        }
      : null,
    shouldWarnEquipmentOnly: Boolean(equipamento && !cliente && !setor),
    missingEquipFromParams: Boolean(explicitEquipId && !equipamento),
  };
}
