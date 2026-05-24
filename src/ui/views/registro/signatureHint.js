import {
  buildRegistroSignatureModel,
  REGISTRO_SIGNATURE_ACTIONS,
  REGISTRO_SIGNATURE_ROOT_ID,
} from '../../viewModels/registroSignatureModel.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function createElement(tagName, { className, text, attrs = {} } = {}) {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  if (text != null) el.textContent = String(text);
  Object.entries(attrs).forEach(([name, value]) => {
    if (value == null || value === false) return;
    el.setAttribute(name, String(value));
  });
  return el;
}

function createSvgPath(tagName, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tagName);
  Object.entries(attrs).forEach(([name, value]) => {
    el.setAttribute(name, String(value));
  });
  return el;
}

function createSignatureIcon(upsell = false) {
  const svg = createSvgPath('svg', {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.75',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });

  if (upsell) {
    svg.append(
      createSvgPath('rect', { x: 4, y: 11, width: 16, height: 10, rx: 2 }),
      createSvgPath('path', { d: 'M8 11V7a4 4 0 0 1 8 0v4' }),
    );
    return svg;
  }

  svg.append(
    createSvgPath('path', { d: 'M12 19l7-7 3 3-7 7-3-3z' }),
    createSvgPath('path', { d: 'M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z' }),
    createSvgPath('path', { d: 'M2 2l7.586 7.586' }),
    createSvgPath('circle', { cx: 11, cy: 11, r: 2 }),
  );
  return svg;
}

function stopAndRun(event, callback, value) {
  if (!callback) return;
  event.stopPropagation();
  callback(value);
}

function createSignatureActions(model, callbacks) {
  if (!model.isPlusOrHigher) return null;

  const actions = createElement('div', { className: 'registro-sig-hint__actions' });

  if (model.showCaptureAction) {
    const capture = createElement('button', {
      className: 'registro-sig-hint__cta',
      text: 'Capturar assinatura',
      attrs: {
        type: 'button',
        'data-action': REGISTRO_SIGNATURE_ACTIONS.capture,
        'data-r-action': REGISTRO_SIGNATURE_ACTIONS.capture,
      },
    });
    capture.addEventListener('click', (event) => stopAndRun(event, callbacks.onCaptureSignature));
    actions.append(capture);
  }

  if (model.signed) {
    const open = createElement('button', {
      className: 'registro-sig-hint__cta',
      text: 'Abrir assinatura',
      attrs: {
        type: 'button',
        'data-action': REGISTRO_SIGNATURE_ACTIONS.open,
        'data-r-action': REGISTRO_SIGNATURE_ACTIONS.open,
      },
    });
    open.addEventListener('click', (event) =>
      stopAndRun(event, callbacks.onOpenSignature, model.safeSignatureSrc),
    );

    const remove = createElement('button', {
      className: 'registro-sig-hint__cta',
      text: 'Remover assinatura',
      attrs: {
        type: 'button',
        'data-action': REGISTRO_SIGNATURE_ACTIONS.remove,
        'data-r-action': REGISTRO_SIGNATURE_ACTIONS.remove,
      },
    });
    remove.addEventListener('click', (event) => stopAndRun(event, callbacks.onRemoveSignature));
    actions.append(open, remove);
  }

  return actions.childElementCount > 0 ? actions : null;
}

function applyRootState(root, model) {
  root.hidden = false;
  root.classList.add('registro-sig-hint');
  root.classList.toggle('registro-sig-hint--upsell', !model.isPlusOrHigher);
  root.dataset.registroSignatureMounted = 'true';
}

export function renderRegistroSignatureHint(
  root = document.getElementById(REGISTRO_SIGNATURE_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  const model = buildRegistroSignatureModel(props);
  const isUpsell = !model.isPlusOrHigher;
  applyRootState(root, model);

  const icon = createElement('span', {
    className: `registro-sig-hint__ic${isUpsell ? ' registro-sig-hint__ic--upsell' : ''}`,
    attrs: { 'aria-hidden': 'true' },
  });
  icon.append(createSignatureIcon(isUpsell));

  const body = createElement('div', { className: 'registro-sig-hint__body' });
  const head = createElement('div', { className: 'registro-sig-hint__head' });
  head.append(
    createElement('strong', { className: 'registro-sig-hint__title', text: model.title }),
    createElement('span', {
      className: `registro-sig-hint__badge${isUpsell ? ' registro-sig-hint__badge--plus' : ''}`,
      text: model.badge,
    }),
  );
  body.append(
    head,
    createElement('p', { className: 'registro-sig-hint__desc', text: model.description }),
  );

  if (model.signed) {
    const preview = createElement('div', { className: 'registro-sig-hint__preview' });
    preview.append(
      createElement('img', {
        className: 'registro-sig-hint__preview-img',
        attrs: {
          src: model.safeSignatureSrc,
          alt: 'Assinatura registrada',
        },
      }),
    );
    body.append(preview);
  }

  const actions = createSignatureActions(model, props);
  if (actions) body.append(actions);

  const children = [icon, body];
  if (isUpsell) {
    const upsell = createElement('button', {
      className: 'registro-sig-hint__cta',
      text: 'Conhecer Plus ->',
      attrs: {
        type: 'button',
        'data-action': REGISTRO_SIGNATURE_ACTIONS.upsell,
      },
    });
    upsell.addEventListener('click', () => props.onUpsellClick?.());
    children.push(upsell);
  }

  root.replaceChildren(...children);
  return root;
}

export function unmountRegistroSignatureHint(
  root = document.getElementById(REGISTRO_SIGNATURE_ROOT_ID),
) {
  if (!root?.dataset.registroSignatureMounted) return null;
  root.replaceChildren();
  root.classList.remove('registro-sig-hint--upsell');
  root.hidden = true;
  delete root.dataset.registroSignatureMounted;
  return null;
}
