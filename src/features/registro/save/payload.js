import { validateOperationalPayload } from '../../../core/equipmentRules.js';
import { validateRegistroPayload } from '../../../core/inputValidation.js';

export function normalizeRegistroServiceTypeValue(
  values,
  { outroPrefix = 'Outro · ', tipoCustomMax = 40 } = {},
) {
  if (values?.tipo !== 'Outro') return { valid: true, tipo: values?.tipo };

  const custom = String(values?.tipoCustom ?? '').trim();
  if (!custom) return { valid: false, reason: 'missing-custom' };
  if (custom.length > tipoCustomMax) {
    return { valid: false, reason: 'custom-too-long', limit: tipoCustomMax };
  }

  return { valid: true, tipo: `${outroPrefix}${custom}` };
}

export function buildRegistroPayloadDraft(values, tipoForPayload) {
  return {
    equipId: values.equipId,
    data: values.data,
    tipo: tipoForPayload,
    obs: values.obs,
    tecnico: values.tecnico,
    status: values.status,
    pecas: values.pecas,
    proxima: values.proxima,
    custoPecas: values.custoPecas,
    custoMaoObra: values.custoMaoObra,
    clienteNome: values.clienteNome,
    clienteDocumento: values.clienteDocumento,
    localAtendimento: values.localAtendimento,
    clienteContato: values.clienteContato,
  };
}

export function validateRegistroPayloadDraftData(payloadDraft, { existingEquipamentos = [] } = {}) {
  return validateRegistroPayload(payloadDraft, { existingEquipamentos });
}

export function validateRegistroOperationalFieldsData({ data, status }) {
  return validateOperationalPayload({ data, status });
}

export function buildRegistroPersistPayload(validatedPayload, values) {
  const {
    equipId,
    data,
    tipo,
    tecnico,
    obs,
    pecas,
    proxima,
    status,
    custoPecas,
    custoMaoObra,
    clienteNome,
    clienteDocumento,
    localAtendimento,
    clienteContato,
  } = validatedPayload;

  return {
    equipId,
    data,
    tipo,
    tecnico,
    obs,
    descricaoFinal:
      obs && obs.length >= 10 ? obs : `Serviço de ${tipo.toLowerCase()} registrado em modo rapido.`,
    prioridade: values.prioridade,
    status,
    pecas,
    proxima,
    custoPecas,
    custoMaoObra,
    clienteNome,
    clienteDocumento,
    localAtendimento,
    clienteContato,
  };
}
