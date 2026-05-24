let activeToast = null;

function removeToast(toast) {
  if (!(toast instanceof HTMLElement) || !toast.parentNode) return;
  const timeoutId = Number.parseInt(toast.dataset.timeoutId || '', 10);
  if (Number.isFinite(timeoutId)) clearTimeout(timeoutId);

  toast.classList.remove('share-success-toast--visible');
  toast.classList.add('share-success-toast--hiding');

  const onTransitionEnd = () => {
    toast.removeEventListener('transitionend', onTransitionEnd);
    if (toast.parentNode) toast.parentNode.removeChild(toast);
    if (activeToast === toast) activeToast = null;
  };

  toast.addEventListener('transitionend', onTransitionEnd);
}

function createToast() {
  const toast = document.createElement('div');
  toast.className = 'share-success-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');

  const icon = document.createElement('span');
  icon.className = 'share-success-toast__icon';
  icon.textContent = 'OK';
  icon.setAttribute('aria-hidden', 'true');

  const content = document.createElement('div');
  content.className = 'share-success-toast__content';

  const title = document.createElement('p');
  title.className = 'share-success-toast__title';
  title.textContent = 'Relatorio enviado.';

  const subtitle = document.createElement('p');
  subtitle.className = 'share-success-toast__subtitle';
  subtitle.textContent = 'Compartilhamento registrado no fluxo operacional.';

  content.append(title, subtitle);
  toast.append(icon, content);

  return toast;
}

export const ShareSuccessToast = {
  show({ used = null, limit = null } = {}) {
    if (activeToast) removeToast(activeToast);

    const toast = createToast();

    if (Number.isFinite(limit) && used !== null) {
      const remaining = Math.max(0, limit - used);
      const subtitle = toast.querySelector('.share-success-toast__subtitle');
      if (subtitle) {
        subtitle.textContent =
          remaining > 0
            ? `Voce usou ${used} de ${limit} compartilhamentos este mes. Restam ${remaining}.`
            : `Voce usou todos os ${limit} compartilhamentos deste mes.`;
      }
    }

    document.body.appendChild(toast);
    activeToast = toast;

    requestAnimationFrame(() => {
      toast.classList.add('share-success-toast--visible');
    });

    const timeoutId = window.setTimeout(() => removeToast(toast), 6000);
    toast.dataset.timeoutId = String(timeoutId);

    return toast;
  },
};

export default ShareSuccessToast;
