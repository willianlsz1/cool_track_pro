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
  const plus = Boolean(isPlusOrHigher);

  return {
    isPlusOrHigher: plus,
    signed,
    safeSignatureSrc,
    showCaptureAction: Boolean(showCaptureAction),
    title:
      String(label || '').trim() ||
      (!plus ? 'Assinatura do cliente no PDF' : 'Assinatura do cliente'),
    badge: !plus ? 'Plus' : signed ? 'Assinado' : 'Incluso',
    description:
      String(description || '').trim() ||
      (!plus
        ? 'Feche o serviço com a rubrica do cliente diretamente no app — recurso do plano Plus.'
        : signed
          ? 'Assinatura anexada ao registro e pronta para aparecer no PDF oficial do serviço.'
          : 'Ao salvar, solicitamos a rubrica do cliente — fica anexada ao registro e aparece no PDF oficial do serviço.'),
  };
}
