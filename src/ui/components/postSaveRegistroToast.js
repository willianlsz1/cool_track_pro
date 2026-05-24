let activeToast = null;

function removeToast(toast) {
  if (!(toast instanceof HTMLElement) || !toast.parentNode) return;
  const timeoutId = Number.parseInt(toast.dataset.timeoutId || '', 10);
  if (Number.isFinite(timeoutId)) clearTimeout(timeoutId);

  toast.parentNode.removeChild(toast);
  if (activeToast === toast) activeToast = null;
}

function createToast({ equipName }) {
  const toast = document.createElement('div');
  toast.className = 'share-success-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');
  toast.dataset.testid = 'post-save-registro-toast';

  const icon = document.createElement('span');
  icon.className = 'share-success-toast__icon';
  icon.textContent = 'OK';
  icon.setAttribute('aria-hidden', 'true');

  const content = document.createElement('div');
  content.className = 'share-success-toast__content';

  const title = document.createElement('p');
  title.className = 'share-success-toast__title';
  title.textContent = equipName
    ? `Servico registrado em ${equipName}`
    : 'Servico registrado com sucesso.';

  const subtitle = document.createElement('p');
  subtitle.className = 'share-success-toast__subtitle';
  subtitle.textContent = 'O atendimento ficou salvo no historico do equipamento.';

  content.append(title, subtitle);
  toast.append(icon, content);

  return toast;
}

export const PostSaveRegistroToast = {
  show({ equipId = null, equipName = null, dismissMs = 8000 } = {}) {
    if (!equipId) {
      return null;
    }

    if (activeToast) removeToast(activeToast);

    const toast = createToast({ equipName });
    document.body.appendChild(toast);
    activeToast = toast;

    requestAnimationFrame(() => {
      toast.classList.add('share-success-toast--visible');
    });

    const timeoutId = window.setTimeout(() => removeToast(toast), dismissMs);
    toast.dataset.timeoutId = String(timeoutId);

    return toast;
  },
};

export default PostSaveRegistroToast;
