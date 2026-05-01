import {
  buildRegistroSignatureModel,
  REGISTRO_SIGNATURE_ACTIONS,
} from '../../ui/viewModels/registroSignatureModel.js';

function SignatureIcon({ upsell = false }) {
  if (upsell) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

function SignatureActions({ model, onCaptureSignature, onOpenSignature, onRemoveSignature }) {
  if (!model.isPlusOrHigher) return null;

  return (
    <div className="registro-sig-hint__actions">
      {model.showCaptureAction ? (
        <button
          type="button"
          className="registro-sig-hint__cta"
          data-action={REGISTRO_SIGNATURE_ACTIONS.capture}
          data-r-action={REGISTRO_SIGNATURE_ACTIONS.capture}
          onClick={(event) => {
            if (!onCaptureSignature) return;
            event.stopPropagation();
            onCaptureSignature();
          }}
        >
          Capturar assinatura
        </button>
      ) : null}
      {model.signed ? (
        <>
          <button
            type="button"
            className="registro-sig-hint__cta"
            data-action={REGISTRO_SIGNATURE_ACTIONS.open}
            data-r-action={REGISTRO_SIGNATURE_ACTIONS.open}
            onClick={(event) => {
              if (!onOpenSignature) return;
              event.stopPropagation();
              onOpenSignature(model.safeSignatureSrc);
            }}
          >
            Abrir assinatura
          </button>
          <button
            type="button"
            className="registro-sig-hint__cta"
            data-action={REGISTRO_SIGNATURE_ACTIONS.remove}
            data-r-action={REGISTRO_SIGNATURE_ACTIONS.remove}
            onClick={(event) => {
              if (!onRemoveSignature) return;
              event.stopPropagation();
              onRemoveSignature();
            }}
          >
            Remover assinatura
          </button>
        </>
      ) : null}
    </div>
  );
}

export function RegistroSignature({
  isPlusOrHigher = false,
  signatureSrc = '',
  label = '',
  description = '',
  showCaptureAction = false,
  onUpsellClick,
  onCaptureSignature,
  onOpenSignature,
  onRemoveSignature,
}) {
  const model = buildRegistroSignatureModel({
    isPlusOrHigher,
    signatureSrc,
    label,
    description,
    showCaptureAction,
  });
  const isUpsell = !model.isPlusOrHigher;

  return (
    <>
      <span
        className={`registro-sig-hint__ic${isUpsell ? ' registro-sig-hint__ic--upsell' : ''}`}
        aria-hidden="true"
      >
        <SignatureIcon upsell={isUpsell} />
      </span>
      <div className="registro-sig-hint__body">
        <div className="registro-sig-hint__head">
          <strong className="registro-sig-hint__title">{model.title}</strong>
          <span
            className={`registro-sig-hint__badge${
              isUpsell ? ' registro-sig-hint__badge--plus' : ''
            }`}
          >
            {model.badge}
          </span>
        </div>
        <p className="registro-sig-hint__desc">{model.description}</p>
        {model.signed ? (
          <div className="registro-sig-hint__preview">
            <img
              className="registro-sig-hint__preview-img"
              src={model.safeSignatureSrc}
              alt="Assinatura registrada"
            />
          </div>
        ) : null}
        <SignatureActions
          model={model}
          onCaptureSignature={onCaptureSignature}
          onOpenSignature={onOpenSignature}
          onRemoveSignature={onRemoveSignature}
        />
      </div>
      {isUpsell ? (
        <button
          type="button"
          className="registro-sig-hint__cta"
          data-action={REGISTRO_SIGNATURE_ACTIONS.upsell}
          onClick={() => onUpsellClick?.()}
        >
          Conhecer Plus {'\u2192'}
        </button>
      ) : null}
    </>
  );
}
