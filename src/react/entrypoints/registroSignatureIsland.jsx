import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { RegistroSignature } from '../pages/RegistroSignature.jsx';
import { REGISTRO_SIGNATURE_ROOT_ID } from '../../ui/viewModels/registroSignatureModel.js';

const roots = new WeakMap();

function applyRootState(root, props = {}) {
  root.hidden = false;
  root.classList.add('registro-sig-hint');
  root.classList.toggle('registro-sig-hint--upsell', !props.isPlusOrHigher);
  root.dataset.reactRegistroSignatureMounted = 'true';
}

export function mountRegistroSignatureReact(
  root = document.getElementById(REGISTRO_SIGNATURE_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
  }

  applyRootState(root, props);

  flushSync(() => {
    reactRoot.render(<RegistroSignature {...props} />);
  });

  return reactRoot;
}

export function unmountRegistroSignatureReact(
  root = document.getElementById(REGISTRO_SIGNATURE_ROOT_ID),
) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  root.classList.remove('registro-sig-hint--upsell');
  root.hidden = true;
  delete root.dataset.reactRegistroSignatureMounted;
}
