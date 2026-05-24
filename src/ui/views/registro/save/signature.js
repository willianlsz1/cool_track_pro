export function getRegistroSignatureState({ registroId, canUseSignature = false } = {}) {
  return {
    registroId,
    canUseSignature: canUseSignature === true,
  };
}

export async function loadRegistroSignatureSaveModule(
  signatureState,
  { loadSignatureModule, handleError, ErrorCodes } = {},
) {
  if (!signatureState?.canUseSignature) return {};

  try {
    return await loadSignatureModule();
  } catch (error) {
    handleError?.(error, {
      code: ErrorCodes?.NETWORK_ERROR,
      severity: 'warning',
      message: 'Não foi possível carregar o módulo de assinatura.',
      context: { action: 'registro.saveRegistro.signatureImport' },
    });
    return {};
  }
}

export async function captureRegistroSignatureIfNeeded(
  { registroId, equipNome, canUseSignature, SignatureModal } = {},
  { isSafeSignatureCaptureDataUrl, Toast, handleError, ErrorCodes } = {},
) {
  if (!canUseSignature || !SignatureModal?.request) return { assinatura: null };

  try {
    const result = await SignatureModal.request(registroId, equipNome);
    // UX: a assinatura é opcional. Cancelar o modal (X/backdrop/Escape) não
    // invalida mais o save. Apenas não anexa assinatura ao registro.
    if (result && result !== SignatureModal.CANCELED && isSafeSignatureCaptureDataUrl?.(result)) {
      return { assinatura: result };
    }

    if (result && result !== SignatureModal.CANCELED) {
      Toast?.warning?.('Assinatura ignorada por conter dados inválidos.');
    } else if (result === SignatureModal.CANCELED) {
      Toast?.info?.('Registro salvo sem assinatura. Você pode adicioná-la depois.');
    }
  } catch (error) {
    handleError?.(error, {
      code: ErrorCodes?.VALIDATION_ERROR,
      severity: 'warning',
      message: 'Não foi possível registrar a assinatura digital.',
      context: { action: 'registro.saveRegistro.signatureRequest', registroId },
    });
  }

  return { assinatura: null };
}

export async function persistRegistroSignatureForSave(
  { registroId, assinatura, saveSignatureForRecord } = {},
  { Toast, handleError, ErrorCodes } = {},
) {
  if (!assinatura || !saveSignatureForRecord) return null;

  try {
    const signatureReference = await saveSignatureForRecord(registroId, assinatura);
    if (!signatureReference) {
      Toast?.info?.('Assinatura salva no dispositivo. Será sincronizada quando conectar.');
    }
    return signatureReference;
  } catch (uploadError) {
    handleError?.(uploadError, {
      code: ErrorCodes?.SYNC_FAILED,
      severity: 'warning',
      message: 'Assinatura ficou salva localmente. Tentaremos sincronizar depois.',
      context: { action: 'registro.saveRegistro.signatureUpload', registroId },
    });
    return null;
  }
}

export function buildRegistroSignaturePayload({ assinatura, signatureReference } = {}) {
  return signatureReference || (assinatura ? true : false);
}

export function clearRegistroSignatureAfterSave({ clearDraft, remountSignature } = {}) {
  clearDraft?.();
  return remountSignature?.();
}
