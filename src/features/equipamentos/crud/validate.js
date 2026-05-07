export async function checkSaveEquipPlanLimit({
  equipamentos,
  editingId,
  checkPlanLimit,
  trackEvent,
  Toast,
  goTo,
}) {
  // Pula a verificação de limite quando está editando (não cria novo registro)
  if (!editingId) {
    const planLimit = await checkPlanLimit('equipamentos', equipamentos.length);
    if (planLimit.blocked) {
      trackEvent('limit_reached', {
        resource: 'equipamentos',
        current: planLimit.current,
        limit: planLimit.limit,
        planCode: planLimit.planCode,
      });
      const msg =
        planLimit.planCode === 'pro'
          ? 'Você atingiu o limite de equipamentos do seu plano.'
          : 'Você atingiu o limite do plano Free. Faça upgrade para continuar.';
      Toast.warning(msg);
      if (planLimit.planCode !== 'pro') {
        goTo('pricing');
      }
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
