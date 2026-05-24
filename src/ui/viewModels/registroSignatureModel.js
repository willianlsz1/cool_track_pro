export const REGISTRO_SIGNATURE_ROOT_ID = 'registro-signature-hint';

export const REGISTRO_SIGNATURE_ACTIONS = Object.freeze({
  upsell: 'signature-upsell-cta',
  capture: 'registro-signature-capture',
  open: 'registro-signature-open',
  remove: 'registro-signature-remove',
});

export function isSafeRegistroSignatureSrc(src) {
  const value = String(src || '').trim();
  if (!value || /[<>"'\s]/.test(value)) return false;
  return /^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(value);
}

export function buildRegistroSignatureModel({
  isPlusOrHigher = false,
  signatureSrc = '',
  label = '',
  description = '',
  showCaptureAction = false,
} = {}) {
  const safeSignatureSrc = isSafeRegistroSignatureSrc(signatureSrc)
    ? String(signatureSrc).trim()
    : '';
  const signed = Boolean(safeSignatureSrc);
  const hasSignatureAccess = Boolean(isPlusOrHigher);

  return {
    isPlusOrHigher: hasSignatureAccess,
    signed,
    safeSignatureSrc,
    showCaptureAction: Boolean(showCaptureAction),
    title:
      String(label || '').trim() ||
      (!hasSignatureAccess ? 'Assinatura do cliente indisponivel' : 'Assinatura do cliente'),
    badge: !hasSignatureAccess ? 'Indisponivel' : signed ? 'Assinado' : 'Incluso',
    description:
      String(description || '').trim() ||
      (hasSignatureAccess
        ? signed
          ? 'Assinatura anexada ao registro e pronta para aparecer no PDF oficial do servico.'
          : 'Ao salvar, solicitamos a rubrica do cliente; ela fica anexada ao registro e aparece no PDF oficial do servico.'
        : 'A assinatura digital sera refeita em uma etapa propria e nao esta disponivel nesta versao.'),
  };
}
