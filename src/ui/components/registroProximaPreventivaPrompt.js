const OVERLAY_ID = 'registro-proxima-preventiva-overlay';
const CANCELED_RESULT = { canceled: true };

let _keydownCleanup = null;
let _activeResolve = null;

function dateAfterDays(days, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function close(overlay, result = CANCELED_RESULT) {
  if (_keydownCleanup) {
    _keydownCleanup();
    _keydownCleanup = null;
  }
  const resolve = _activeResolve;
  _activeResolve = null;
  overlay?.classList.remove('is-open');
  window.setTimeout(() => overlay?.parentNode?.removeChild(overlay), 220);
  resolve?.(result);
}

function buildHtml() {
  return `
    <section class="modal registro-cliente-fork-sheet registro-proxima-preventiva-prompt" role="dialog" aria-modal="true" aria-labelledby="registro-proxima-preventiva-title">
      <header class="registro-cliente-fork-sheet__head">
        <div class="registro-cliente-fork-sheet__handle" aria-hidden="true"></div>
        <div class="registro-cliente-fork-sheet__head-row">
          <h2 class="registro-cliente-fork-sheet__title" id="registro-proxima-preventiva-title">Quando você volta neste equipamento?</h2>
          <button type="button" class="registro-cliente-fork-sheet__close" id="rpp-close" aria-label="Fechar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </header>
      <div class="registro-cliente-fork-sheet__body" data-testid="registro-proxima-preventiva-prompt">
        <button type="button" class="registro-cliente-fork-sheet__option" data-rpp-days="30"><strong>30 dias</strong></button>
        <button type="button" class="registro-cliente-fork-sheet__option" data-rpp-days="60"><strong>60 dias</strong></button>
        <button type="button" class="registro-cliente-fork-sheet__option" data-rpp-days="90"><strong>90 dias</strong></button>
        <button type="button" class="registro-cliente-fork-sheet__option" id="rpp-no-return"><strong>Sem retorno</strong></button>
      </div>
    </section>`;
}

export const RegistroProximaPreventivaPrompt = {
  dateAfterDays,

  open({ now = new Date() } = {}) {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) close(existing);

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'modal-overlay registro-cliente-fork-overlay';
    overlay.innerHTML = buildHtml();
    document.body.appendChild(overlay);

    return new Promise((resolve) => {
      _activeResolve = resolve;
      const raf = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 0));
      raf(() => overlay.classList.add('is-open'));
      const onKeyDown = (event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        close(overlay);
      };
      overlay.addEventListener('keydown', onKeyDown);
      _keydownCleanup = () => overlay.removeEventListener('keydown', onKeyDown);
      const firstButton = overlay.querySelector('button');
      if (firstButton instanceof HTMLElement) firstButton.focus();

      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) close(overlay);
      });
      overlay.querySelector('#rpp-close')?.addEventListener('click', () => close(overlay));
      overlay.querySelectorAll('[data-rpp-days]').forEach((button) => {
        button.addEventListener('click', () => {
          const days = Number.parseInt(button.dataset.rppDays || '', 10);
          if (!Number.isFinite(days)) return;
          close(overlay, { canceled: false, days, proxima: dateAfterDays(days, now) });
        });
      });
      overlay.querySelector('#rpp-no-return')?.addEventListener('click', () => {
        close(overlay, { canceled: false, semRetorno: true, proxima: null });
      });
    });
  },
};

export default RegistroProximaPreventivaPrompt;
