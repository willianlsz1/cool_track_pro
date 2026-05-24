export function getRegistroSignatureState({ registroId, canUseSignature = false } = {}) {
  return {
    registroId,
    canUseSignature: false,
    disabledReason: canUseSignature === true ? 'legacy_signature_retired' : 'not_available',
  };
}

export async function loadRegistroSignatureSaveModule(
  _signatureState,
  { loadSignatureModule: _loadSignatureModule } = {},
) {
  return {};
}

export async function captureRegistroSignatureIfNeeded(
  {
    registroId: _registroId,
    equipNome: _equipNome,
    canUseSignature: _canUseSignature,
    SignatureModal: _SignatureModal,
  } = {},
  {
    isSafeSignatureCaptureDataUrl: _isSafeSignatureCaptureDataUrl,
    Toast: _Toast,
    handleError: _handleError,
    ErrorCodes: _ErrorCodes,
  } = {},
) {
  return { assinatura: null };
}

export async function persistRegistroSignatureForSave(
  {
    registroId: _registroId,
    assinatura: _assinatura,
    saveSignatureForRecord: _saveSignatureForRecord,
  } = {},
  { Toast: _Toast, handleError: _handleError, ErrorCodes: _ErrorCodes } = {},
) {
  return null;
}

export function buildRegistroSignaturePayload({
  assinatura: _assinatura,
  signatureReference: _signatureReference,
} = {}) {
  return false;
}

export function clearRegistroSignatureAfterSave({ clearDraft, remountSignature } = {}) {
  clearDraft?.();
  return remountSignature?.();
}
