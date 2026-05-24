export async function checkSaveEquipPlanLimit({
  equipamentos,
  editingId,
  checkPlanLimit,
  trackEvent,
  Toast,
}) {
  // Pula a verificacao de limite quando esta editando, pois nao cria registro.
  if (!editingId) {
    const planLimit = await checkPlanLimit('equipamentos', equipamentos.length);
    if (planLimit.blocked) {
      trackEvent('limit_reached', {
        resource: 'equipamentos',
        current: planLimit.current,
        limit: planLimit.limit,
        planCode: planLimit.planCode,
      });
      Toast.warning('Nao foi possivel cadastrar outro equipamento agora.');
      return false;
    }
  }

  return true;
}

export function validateSaveEquipPayload({
  equipamentos,
  editingId,
  getValue,
  validateEquipamentoPayload,
  Toast,
}) {
  const payloadValidation = validateEquipamentoPayload(
    {
      nome: getValue('eq-nome'),
      local: getValue('eq-local'),
      tag: getValue('eq-tag'),
      modelo: getValue('eq-modelo'),
    },
    { existingEquipamentos: equipamentos, editingId },
  );

  if (!payloadValidation.valid) {
    Toast.warning(payloadValidation.errors[0]);
    return null;
  }

  return payloadValidation;
}
